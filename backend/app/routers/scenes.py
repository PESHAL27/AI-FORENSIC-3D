from typing import List, Optional
from fastapi import APIRouter, HTTPException, status
from app.schemas.scene import SceneResponse, SceneUpdate, SceneCreate, SceneObjectResponse
from app.services.supabase_service import db_service

router = APIRouter(tags=["Scenes"])


@router.get("/cases/{case_id}/scene", response_model=SceneResponse)
async def get_case_scene(case_id: str):
    """Retrieve the current 3D reconstruction scene and its child objects for a case."""
    case = await db_service.get_case(case_id)
    if not case:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Case '{case_id}' not found.",
        )
    return await db_service.get_or_create_scene(case["id"])


@router.post("/cases/{case_id}/scene", response_model=SceneResponse)
async def create_or_save_scene(case_id: str, payload: SceneCreate):
    """Initialize or completely populate a scene for a case."""
    case = await db_service.get_case(case_id)
    if not case:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Case '{case_id}' not found.",
        )
    return await db_service.save_scene(case["id"], payload.model_dump())


@router.patch("/cases/{case_id}/scene", response_model=SceneResponse)
async def update_scene(case_id: str, payload: SceneUpdate):
    """
    Debounced autosave endpoint for 3D scene objects.
    Accepts updated object transforms (current_position, current_rotation) upon user manipulation release.
    """
    case = await db_service.get_case(case_id)
    if not case:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Case '{case_id}' not found.",
        )
    return await db_service.save_scene(case["id"], payload.model_dump(exclude_unset=True))


@router.get("/scenes/{scene_id}", response_model=SceneResponse)
async def get_scene_by_id(scene_id: str):
    """Get scene by scene ID."""
    for s in db_service._local_data.get("scenes", []):
        if s["id"] == scene_id:
            return await db_service.get_or_create_scene(s["case_id"])
    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail=f"Scene '{scene_id}' not found.",
    )


@router.post("/cases/{case_id}/scene/restore-object/{object_id}", response_model=SceneObjectResponse)
async def restore_object(case_id: str, object_id: str):
    """Restore a specific 3D scene object to its original position and rotation coordinates."""
    case = await db_service.get_case(case_id)
    if not case:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Case '{case_id}' not found.",
        )
    obj = await db_service.restore_object(case["id"], object_id)
    if not obj:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Object '{object_id}' not found in scene.",
        )
    return obj


@router.post("/cases/{case_id}/scene/reset", response_model=SceneResponse)
async def reset_scene(case_id: str):
    """Reset all manipulated objects in the 3D scene to their original baseline coordinates."""
    case = await db_service.get_case(case_id)
    if not case:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Case '{case_id}' not found.",
        )
    return await db_service.reset_scene(case["id"])
