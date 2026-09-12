from typing import List
from fastapi import APIRouter, HTTPException, status
from app.schemas.timeline import TimelineEventCreate, TimelineEventResponse
from app.services.supabase_service import db_service

router = APIRouter(tags=["Timeline"])


@router.get("/cases/{case_id}/timeline", response_model=List[TimelineEventResponse])
async def list_timeline_events(case_id: str):
    """Retrieve chronological timeline events for forensic event reconstruction."""
    case = await db_service.get_case(case_id)
    if not case:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Case '{case_id}' not found.",
        )
    return await db_service.list_timeline(case["id"])


@router.post("/cases/{case_id}/timeline", response_model=TimelineEventResponse, status_code=status.HTTP_201_CREATED)
async def create_timeline_event(case_id: str, payload: TimelineEventCreate):
    """Create a timeline reconstruction waypoint."""
    case = await db_service.get_case(case_id)
    if not case:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Case '{case_id}' not found.",
        )
    return await db_service.create_timeline_event(case["id"], payload.model_dump())
