from datetime import datetime
from typing import Optional, Dict, Any
from pydantic import BaseModel, Field


class TimelineEventBase(BaseModel):
    time_offset: str = Field(..., description="e.g. 'T-10s', 'T-7s', 'T=0', 'T+2s'")
    event_name: str
    description: Optional[str] = None
    event_type: str = "movement"
    scene_state: Dict[str, Any] = Field(default_factory=dict)


class TimelineEventCreate(TimelineEventBase):
    pass


class TimelineEventResponse(TimelineEventBase):
    id: str
    case_id: str
    created_at: datetime

    class Config:
        from_attributes = True
