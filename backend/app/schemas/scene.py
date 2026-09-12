from datetime import datetime
from typing import Optional, List, Dict, Any, Union
from pydantic import BaseModel, Field


class Vector3D(BaseModel):
    x: float = 0.0
    y: float = 0.0
    z: float = 0.0

    @classmethod
    def from_tuple_or_list(cls, val: Union[List[float], Dict[str, float]]):
        if isinstance(val, (list, tuple)) and len(val) >= 3:
            return cls(x=float(val[0]), y=float(val[1]), z=float(val[2]))
        if isinstance(val, dict):
            return cls(x=float(val.get("x", 0)), y=float(val.get("y", 0)), z=float(val.get("z", 0)))
        return cls()


class SceneObjectBase(BaseModel):
    id: str
    name: str
    type: str
    model: Optional[str] = None
    original_position: Vector3D = Field(default_factory=Vector3D)
    current_position: Vector3D = Field(default_factory=Vector3D)
    original_rotation: Vector3D = Field(default_factory=Vector3D)
    current_rotation: Vector3D = Field(default_factory=Vector3D)
    scale: Vector3D = Field(default_factory=lambda: Vector3D(x=1.0, y=1.0, z=1.0))
    metadata: Dict[str, Any] = Field(default_factory=dict)


class SceneObjectCreate(SceneObjectBase):
    pass


class SceneObjectUpdate(BaseModel):
    name: Optional[str] = None
    type: Optional[str] = None
    model: Optional[str] = None
    original_position: Optional[Vector3D] = None
    current_position: Optional[Vector3D] = None
    original_rotation: Optional[Vector3D] = None
    current_rotation: Optional[Vector3D] = None
    scale: Optional[Vector3D] = None
    metadata: Optional[Dict[str, Any]] = None


class SceneObjectResponse(SceneObjectBase):
    scene_id: Optional[str] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class SceneBase(BaseModel):
    name: str = "Primary Forensic Reconstruction"
    version: int = 1


class SceneCreate(SceneBase):
    objects: List[SceneObjectBase] = Field(default_factory=list)


class SceneUpdate(BaseModel):
    name: Optional[str] = None
    version: Optional[int] = None
    objects: Optional[List[SceneObjectBase]] = None


class SceneResponse(SceneBase):
    id: str
    case_id: str
    objects: List[SceneObjectResponse] = Field(default_factory=list)
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
