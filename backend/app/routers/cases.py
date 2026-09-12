from typing import List
from fastapi import APIRouter, HTTPException, status
from app.schemas.case import CaseCreate, CaseUpdate, CaseResponse
from app.services.supabase_service import db_service

router = APIRouter(prefix="/cases", tags=["Cases"])


@router.get("", response_model=List[CaseResponse])
async def list_cases():
    """Retrieve all forensic investigation cases."""
    return await db_service.list_cases()


@router.post("", response_model=CaseResponse, status_code=status.HTTP_201_CREATED)
async def create_case(payload: CaseCreate):
    """Create a new forensic case."""
    # Check if case_number already exists
    existing = await db_service.get_case(payload.case_number)
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Case with number '{payload.case_number}' already exists.",
        )
    return await db_service.create_case(payload.model_dump())


@router.get("/{case_id}", response_model=CaseResponse)
async def get_case(case_id: str):
    """Retrieve a single case by ID or case_number."""
    case = await db_service.get_case(case_id)
    if not case:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Case '{case_id}' not found.",
        )
    return case


@router.patch("/{case_id}", response_model=CaseResponse)
async def update_case(case_id: str, payload: CaseUpdate):
    """Update case fields."""
    updated = await db_service.update_case(case_id, payload.model_dump(exclude_unset=True))
    if not updated:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Case '{case_id}' not found.",
        )
    return updated


@router.delete("/{case_id}", status_code=status.HTTP_200_OK)
async def delete_case(case_id: str):
    """Delete a case by ID."""
    deleted = await db_service.delete_case(case_id)
    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Case '{case_id}' not found.",
        )
    return {"status": "success", "message": f"Case '{case_id}' deleted successfully."}
