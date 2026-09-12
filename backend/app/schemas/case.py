from datetime import datetime
from typing import Optional, List
from enum import Enum
from pydantic import BaseModel, Field


class CaseStatus(str, Enum):
    ACTIVE = "ACTIVE"
    ARCHIVED = "ARCHIVED"
    COMPLETED = "COMPLETED"
    IN_REVIEW = "IN_REVIEW"


class CaseBase(BaseModel):
    case_number: str = Field(..., description="Unique case number, e.g. CASE-2026-FR-0941")
    title: str = Field(..., description="Human-readable title of the case")
    description: Optional[str] = None
    status: CaseStatus = CaseStatus.ACTIVE


class CaseCreate(CaseBase):
    pass


class CaseUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[CaseStatus] = None


class CaseResponse(CaseBase):
    id: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
