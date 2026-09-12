import os
import json
from typing import List, Optional
from fastapi import APIRouter, HTTPException, UploadFile, File, Form, status
from fastapi.responses import FileResponse
from app.core.config import settings
from app.schemas.evidence import EvidenceResponse, EvidenceType
from app.schemas.analysis import EvidenceAnalysisResponse
from app.services.supabase_service import db_service, LOCAL_STORAGE_DIR


router = APIRouter(tags=["Evidence"])


@router.post("/cases/{case_id}/evidence", response_model=EvidenceResponse, status_code=status.HTTP_201_CREATED)
async def upload_evidence(
    case_id: str,
    file: UploadFile = File(...),
    file_type: str = Form(default="IMAGE"),
    metadata: Optional[str] = Form(default=None),
):
    """Upload forensic evidence file (images, 360 photos, videos, reports) associated with a case."""
    # Verify case exists
    case = await db_service.get_case(case_id)
    if not case:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Case '{case_id}' not found.",
        )

    # Read content
    content = await file.read()
    file_size = len(content)

    if file_size > settings.MAX_UPLOAD_SIZE_BYTES:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"File exceeds maximum allowed size of {settings.MAX_UPLOAD_SIZE_BYTES / (1024 * 1024):.1f}MB",
        )

    # MIME type validation
    content_type = file.content_type or "application/octet-stream"
    ext = os.path.splitext(file.filename or "")[1].lower()
    allowed_exts = [".jpg", ".jpeg", ".png", ".webp", ".mp4", ".mov", ".avi", ".pdf", ".txt", ".json", ".csv"]
    if ext not in allowed_exts and content_type not in settings.allowed_mime_types_list:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported file format '{ext}'. Allowed: {', '.join(allowed_exts)}",
        )

    # Parse metadata if provided
    meta_dict = {}
    if metadata:
        try:
            meta_dict = json.loads(metadata)
        except Exception:
            meta_dict = {"notes": metadata}

    # Normalize file_type
    try:
        norm_file_type = EvidenceType(file_type.upper()).value
    except Exception:
        norm_file_type = EvidenceType.IMAGE.value

    record = await db_service.upload_evidence(
        case_id=case["id"],
        filename=file.filename or "evidence.dat",
        content_bytes=content,
        content_type=content_type,
        file_type=norm_file_type,
        metadata=meta_dict,
    )
    return record


@router.get("/cases/{case_id}/evidence", response_model=List[EvidenceResponse])
async def list_case_evidence(case_id: str):
    """List all evidence assets associated with a case."""
    case = await db_service.get_case(case_id)
    if not case:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Case '{case_id}' not found.",
        )
    return await db_service.list_evidence(case["id"])


@router.get("/evidence/{evidence_id}", response_model=EvidenceResponse)
async def get_evidence(evidence_id: str):
    """Get metadata for a single evidence asset."""
    item = await db_service.get_evidence(evidence_id)
    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Evidence '{evidence_id}' not found.",
        )
    return item


@router.delete("/evidence/{evidence_id}", status_code=status.HTTP_200_OK)
async def delete_evidence(evidence_id: str):
    """Delete an evidence asset and its underlying storage file."""
    deleted = await db_service.delete_evidence(evidence_id)
    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Evidence '{evidence_id}' not found.",
        )
    return {"status": "success", "message": f"Evidence '{evidence_id}' deleted successfully."}


@router.get("/evidence/{evidence_id}/download")
async def download_evidence(evidence_id: str):
    """Serve evidence file directly from local storage fallback if not using external public CDN."""
    item = await db_service.get_evidence(evidence_id)
    if not item:
        raise HTTPException(status_code=404, detail="Evidence not found")

    local_path = os.path.join(LOCAL_STORAGE_DIR, item["storage_path"].replace("/", os.sep))
    if not os.path.exists(local_path):
        raise HTTPException(status_code=404, detail="Evidence file not found on disk")

    return FileResponse(
        path=local_path,
        media_type=item.get("mime_type", "application/octet-stream"),
        filename=item.get("original_filename", "evidence.dat"),
    )


# ------------------------------------------------------------------------------
# AI SCENE UNDERSTANDING ENDPOINTS
# ------------------------------------------------------------------------------
@router.post("/evidence/{evidence_id}/analyze", response_model=EvidenceAnalysisResponse)
async def analyze_evidence(evidence_id: str):
    """
    Executes AI Scene Understanding on an uploaded evidence image.
    Sends the stored image file to the configured AI vision model, parses the response
    into strict structured JSON (objects, spatial relationships, observations),
    and persists the analysis to the local database.
    """
    from datetime import datetime, timezone
    from app.ai import analyze_scene_image
    from app.schemas.analysis import EvidenceAnalysisResponse

    item = await db_service.get_evidence(evidence_id)
    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Evidence '{evidence_id}' not found.",
        )

    # Validate file is an image
    file_type = (item.get("file_type") or "").upper()
    mime_type = (item.get("mime_type") or "").lower()
    if file_type not in ["IMAGE", "IMAGE_360"] and not mime_type.startswith("image/"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Evidence '{evidence_id}' is a {file_type} file. Only image evidence can be analyzed by the vision model.",
        )

    # Check AI credentials
    if not settings.has_ai_credentials:
        key_name = f"{settings.AI_PROVIDER.upper()}_API_KEY"
        err_msg = (
            f"AI Vision analysis is unavailable: {key_name} is not configured in backend/.env. "
            f"Please set your {settings.AI_PROVIDER} API key to enable live scene understanding."
        )
        failed_record = {
            "evidence_id": evidence_id,
            "case_id": item["case_id"],
            "status": "FAILED",
            "provider": settings.AI_PROVIDER,
            "model": settings.AI_MODEL,
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "error_message": err_msg,
            "result": None,
        }
        await db_service.save_evidence_analysis(evidence_id, failed_record)
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=err_msg,
        )

    # Locate image file on disk
    local_path = os.path.join(LOCAL_STORAGE_DIR, item["storage_path"].replace("/", os.sep))
    if not os.path.exists(local_path):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Evidence file was not found on local disk at '{item['storage_path']}'.",
        )

    try:
        with open(local_path, "rb") as f:
            image_bytes = f.read()
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Could not read local evidence image file: {str(e)}",
        )

    # Execute AI scene understanding
    try:
        analysis_result = await analyze_scene_image(
            image_bytes=image_bytes,
            mime_type=mime_type or "image/jpeg",
        )
    except Exception as e:
        now = datetime.now(timezone.utc).isoformat()
        err_str = str(e)
        failed_record = {
            "evidence_id": evidence_id,
            "case_id": item["case_id"],
            "status": "FAILED",
            "provider": settings.AI_PROVIDER,
            "model": settings.AI_MODEL,
            "timestamp": now,
            "error_message": err_str,
            "result": None,
        }
        await db_service.save_evidence_analysis(evidence_id, failed_record)
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"AI Vision Model failed: {err_str}",
        )

    now = datetime.now(timezone.utc).isoformat()
    success_record = {
        "evidence_id": evidence_id,
        "case_id": item["case_id"],
        "status": "COMPLETED",
        "provider": settings.AI_PROVIDER,
        "model": settings.AI_MODEL,
        "timestamp": now,
        "error_message": None,
        "result": analysis_result.model_dump(),
    }
    await db_service.save_evidence_analysis(evidence_id, success_record)
    return success_record


@router.get("/evidence/{evidence_id}/analysis", response_model=EvidenceAnalysisResponse)
async def get_evidence_analysis(evidence_id: str):
    """Retrieve the previously generated AI scene understanding analysis for an evidence item."""
    analysis = await db_service.get_evidence_analysis(evidence_id)
    if not analysis:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No AI analysis found for evidence '{evidence_id}'.",
        )
    return analysis


@router.get("/cases/{case_id}/analyses", response_model=List[EvidenceAnalysisResponse])
async def list_case_analyses(case_id: str):
    """Retrieve all completed AI scene analyses for evidence associated with a case."""
    return await db_service.list_case_analyses(case_id)

