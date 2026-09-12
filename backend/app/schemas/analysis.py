from typing import List, Optional
from pydantic import BaseModel, Field


class DetectedObject(BaseModel):
    id: str = Field(..., description="Stable identifier, e.g. obj-001, obj-002")
    name: str = Field(..., description="Entity name, e.g. chair, desk, person")
    category: str = Field(default="objects", description="Category: furniture, people, doors_windows, objects, evidence, environment")
    confidence: float = Field(default=0.9, ge=0.0, le=1.0, description="Confidence score between 0 and 1")
    observation: str = Field(..., description="Direct factual observation of entity in scene")
    state: str = Field(default="observed", description="Classification: 'observed' or 'inferred'")


class SpatialRelationship(BaseModel):
    subject: str = Field(..., description="ID of subject object, e.g. obj-001")
    relation: str = Field(..., description="Spatial relationship: near, beside, on, under, in_front_of, behind")
    object: str = Field(..., description="ID of target object, e.g. obj-002")
    confidence: float = Field(default=0.85, ge=0.0, le=1.0)


class ObservationItem(BaseModel):
    text: str = Field(..., description="Observable scene fact")
    state: str = Field(default="observed", description="'observed' or 'inferred'")


class SceneAnalysisResult(BaseModel):
    scene_type: str = Field(default="indoor_room", description="Detected environment type, e.g. indoor_office, exterior_portal")
    overall_description: str = Field(..., description="Factual overview of scene composition")
    objects: List[DetectedObject] = Field(default_factory=list)
    relationships: List[SpatialRelationship] = Field(default_factory=list)
    observations: List[ObservationItem] = Field(default_factory=list)
    possible_evidence: List[str] = Field(default_factory=list, description="Candidate evidentiary traces")
    uncertainties: List[str] = Field(default_factory=list, description="Visual ambiguities or uncertain factors")


class EvidenceAnalysisResponse(BaseModel):
    evidence_id: str
    case_id: str
    status: str = Field(..., description="Status: PENDING, PROCESSING, COMPLETED, FAILED")
    provider: str
    model: str
    timestamp: str
    error_message: Optional[str] = None
    result: Optional[SceneAnalysisResult] = None
