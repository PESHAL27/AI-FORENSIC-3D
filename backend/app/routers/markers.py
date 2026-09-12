from typing import List
from fastapi import APIRouter, HTTPException, status
from app.schemas.marker import MarkerCreate, MarkerUpdate, MarkerResponse
from app.services.supabase_service import db_service

router = APIRouter(tags=["Evidence Markers"])


@router.get("/cases/{case_id}/markers", response_model=List[MarkerResponse])
async def list_markers(case_id: str):
    """List 3D evidence markers pinpointed in the scene."""
    case = await db_service.get_case(case_id)
    if not case:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Case '{case_id}' not found.",
        )
    return await db_service.list_markers(case["id"])


@router.post("/cases/{case_id}/markers", response_model=MarkerResponse, status_code=status.HTTP_201_CREATED)
async def create_marker(case_id: str, payload: MarkerCreate):
    """Place a new 3D evidence marker in the scene."""
    case = await db_service.get_case(case_id)
    if not case:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Case '{case_id}' not found.",
        )
    return await db_service.create_marker(case["id"], payload.model_dump())


@router.patch("/markers/{marker_id}", response_model=MarkerResponse)
async def update_marker(marker_id: str, payload: MarkerUpdate):
    """Update coordinates or label of an evidence marker."""
    updated = await db_service.update_marker(marker_id, payload.model_dump(exclude_unset=True))
    if not updated:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Marker '{marker_id}' not found.",
        )
    return updated


@router.delete("/markers/{marker_id}", status_code=status.HTTP_200_OK)
async def delete_marker(marker_id: str):
    """Delete an evidence marker."""
    deleted = await db_service.delete_marker(marker_id)
    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Marker '{marker_id}' not found.",
        )
    return {"status": "success", "message": f"Marker '{marker_id}' deleted successfully."}
