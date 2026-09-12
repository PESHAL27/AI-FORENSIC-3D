import math
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field
from .scene import Vector3D


class MeasurementBase(BaseModel):
    label: str
    point_a: Vector3D
    point_b: Vector3D
    unit: str = "m"


class MeasurementCreate(MeasurementBase):
    distance: Optional[float] = None  # Auto-calculated if omitted

    def calculate_distance(self) -> float:
        dx = self.point_b.x - self.point_a.x
        dy = self.point_b.y - self.point_a.y
        dz = self.point_b.z - self.point_a.z
        return round(math.sqrt(dx * dx + dy * dy + dz * dz), 3)


class MeasurementUpdate(BaseModel):
    label: Optional[str] = None
    point_a: Optional[Vector3D] = None
    point_b: Optional[Vector3D] = None
    distance: Optional[float] = None
    unit: Optional[str] = None


class MeasurementResponse(MeasurementBase):
    id: str
    case_id: str
    distance: float
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
