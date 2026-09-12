from datetime import datetime
from typing import Optional, Dict, Any
from enum import Enum
from pydantic import BaseModel, Field


class EvidenceType(str, Enum):
    IMAGE = "IMAGE"
    VIDEO = "VIDEO"
    IMAGE_360 = "IMAGE_360"
    REPORT = "REPORT"
    MEASUREMENT = "MEASUREMENT"


class EvidenceStatus(str, Enum):
    UPLOADED = "UPLOADED"
    PROCESSING = "PROCESSING"
    READY = "READY"
    FAILED = "FAILED"


class EvidenceBase(BaseModel):
    original_filename: str
    file_type: EvidenceType
    mime_type: str
    file_size: int
    status: EvidenceStatus = EvidenceStatus.UPLOADED
    metadata: Dict[str, Any] = Field(default_factory=dict)


class EvidenceResponse(BaseModel):
    id: str
    case_id: str
    original_filename: str
    filename: Optional[str] = None  # Alias for frontend compatibility
    storage_path: str
    file_type: EvidenceType
    mime_type: str
    file_size: int
    status: EvidenceStatus
    metadata: Dict[str, Any] = Field(default_factory=dict)
    download_url: Optional[str] = None
    analysis: Optional[Dict[str, Any]] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

