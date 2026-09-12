from typing import List
from fastapi import APIRouter, HTTPException, status
from app.schemas.measurement import MeasurementCreate, MeasurementUpdate, MeasurementResponse
from app.services.supabase_service import db_service

router = APIRouter(tags=["Measurements"])


@router.get("/cases/{case_id}/measurements", response_model=List[MeasurementResponse])
async def list_measurements(case_id: str):
    """List 3D laser/photogrammetry distance measurements for a case."""
    case = await db_service.get_case(case_id)
    if not case:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Case '{case_id}' not found.",
        )
    return await db_service.list_measurements(case["id"])


@router.post("/cases/{case_id}/measurements", response_model=MeasurementResponse, status_code=status.HTTP_201_CREATED)
async def create_measurement(case_id: str, payload: MeasurementCreate):
    """
    Register a 3D measurement between point_a and point_b.
    The backend automatically computes Euclidean distance: sqrt(dx^2 + dy^2 + dz^2).
    """
    case = await db_service.get_case(case_id)
    if not case:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Case '{case_id}' not found.",
        )
    return await db_service.create_measurement(case["id"], payload.model_dump())


@router.patch("/measurements/{measurement_id}", response_model=MeasurementResponse)
async def update_measurement(measurement_id: str, payload: MeasurementUpdate):
    """Update coordinates or label of a measurement (distance is automatically recalculated if points move)."""
    updated = await db_service.update_measurement(measurement_id, payload.model_dump(exclude_unset=True))
    if not updated:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Measurement '{measurement_id}' not found.",
        )
    return updated


@router.delete("/measurements/{measurement_id}", status_code=status.HTTP_200_OK)
async def delete_measurement(measurement_id: str):
    """Delete a measurement entry."""
    deleted = await db_service.delete_measurement(measurement_id)
    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Measurement '{measurement_id}' not found.",
        )
    return {"status": "success", "message": f"Measurement '{measurement_id}' deleted successfully."}
