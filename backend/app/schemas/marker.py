from datetime import datetime
from typing import Optional, Dict, Any
from enum import Enum
from pydantic import BaseModel, Field


class MarkerType(str, Enum):
    EVIDENCE = "EVIDENCE"
    PERSON = "PERSON"
    OBJECT = "OBJECT"
    DAMAGE = "DAMAGE"
    MEASUREMENT = "MEASUREMENT"
    UNKNOWN = "UNKNOWN"


class MarkerBase(BaseModel):
    label: str
    marker_type: MarkerType = MarkerType.EVIDENCE
    position_x: float
    position_y: float
    position_z: float
    evidence_id: Optional[str] = None
    metadata: Dict[str, Any] = Field(default_factory=dict)


class MarkerCreate(MarkerBase):
    pass


class MarkerUpdate(BaseModel):
    label: Optional[str] = None
    marker_type: Optional[MarkerType] = None
    position_x: Optional[float] = None
    position_y: Optional[float] = None
    position_z: Optional[float] = None
    evidence_id: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None


class MarkerResponse(MarkerBase):
    id: str
    case_id: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
