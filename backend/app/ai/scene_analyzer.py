import re
import json
import logging
from typing import Dict, Any, List

from app.schemas.analysis import (
    SceneAnalysisResult,
    DetectedObject,
    SpatialRelationship,
    ObservationItem,
)

logger = logging.getLogger("ai_forensic_3d.ai.analyzer")

SCENE_UNDERSTANDING_SYSTEM_PROMPT = """You are an evidence scene-understanding assistant for a professional 3D forensic investigation platform.
Your task is to perform an objective, factual visual analysis of the provided evidence image.

GUIDELINES:
1. Grounding: Analyze ONLY what is visually supported by the image.
2. Direct vs Inferred:
   - 'observed': Directly visible entities, materials, or conditions.
   - 'inferred': Features reasonably inferred from direct evidence (e.g., wet surface near spilled glass).
3. Do NOT invent objects that are not visible.
4. Do NOT make definitive legal, criminal, or motive conclusions (e.g., do NOT say 'Person X attacked Person Y'; say 'A person is visible near doorway').
5. Structure:
   - Identify scene type (e.g., indoor_office, corridor, industrial_room, exterior_perimeter).
   - Identify visible objects (furniture, people, doors, windows, structural boundaries, evidence items).
   - Assign stable IDs: 'obj-001', 'obj-002', 'obj-003', etc.
   - Category must be one of: 'furniture', 'people', 'doors_windows', 'objects', 'evidence', 'environment'.
   - Identify pairwise spatial relationships (near, on, beside, under, adjacent_to, behind, in_front_of).
   - Assign confidence scores between 0.0 and 1.0.
   - List candidate evidentiary traces in 'possible_evidence'.
   - List visual ambiguities, occlusions, or low-light uncertainties in 'uncertainties'.

REQUIRED JSON SCHEMA:
{
  "scene_type": "indoor_room",
  "overall_description": "Objective summary of the visible room and its layout.",
  "objects": [
    {
      "id": "obj-001",
      "name": "chair",
      "category": "furniture",
      "confidence": 0.95,
      "observation": "Ergonomic chair displaced near the central desk.",
      "state": "observed"
    }
  ],
  "relationships": [
    {
      "subject": "obj-001",
      "relation": "near",
      "object": "obj-002",
      "confidence": 0.90
    }
  ],
  "observations": [
    {
      "text": "The floor exhibits reflective tile finish with diffuse ambient illumination.",
      "state": "observed"
    }
  ],
  "possible_evidence": [
    "Overturned chair trajectory",
    "Glass fracture patterns"
  ],
  "uncertainties": [
    "Shadowed area behind doorway prevents clear visibility of depth"
  ]
}

Respond ONLY with the JSON object. Do not include markdown preamble or explanations outside the JSON."""


def extract_json_block(text: str) -> str:
    """Strips markdown code fences or finds the first valid JSON object in text."""
    clean = text.strip()
    # Remove markdown code block if present
    if "```" in clean:
        match = re.search(r"```(?:json)?\s*([\s\S]*?)\s*```", clean)
        if match:
            clean = match.group(1).strip()

    # If clean doesn't start with '{', extract between first '{' and last '}'
    if not clean.startswith("{"):
        start_idx = clean.find("{")
        end_idx = clean.rfind("}")
        if start_idx != -1 and end_idx != -1 and end_idx > start_idx:
            clean = clean[start_idx : end_idx + 1]

    return clean


def parse_and_validate_analysis(raw_text: str) -> SceneAnalysisResult:
    """
    Parses raw AI text output into a validated SceneAnalysisResult.
    Applies sanitization, confidence clamping, and fallback structures if needed.
    """
    json_str = extract_json_block(raw_text)
    try:
        data = json.loads(json_str)
    except Exception as e:
        logger.error("Failed to parse AI JSON response: %s\nRaw Text: %s", e, raw_text[:300])
        raise ValueError(f"AI response did not contain valid JSON: {str(e)}")

    if not isinstance(data, dict):
        raise ValueError("AI JSON response is not a dictionary.")

    # 1. Objects validation & normalization
    raw_objects = data.get("objects", [])
    clean_objects: List[DetectedObject] = []
    for i, obj in enumerate(raw_objects):
        if not isinstance(obj, dict):
            continue
        obj_id = str(obj.get("id") or f"obj-{i+1:03d}")
        name = str(obj.get("name") or "unspecified_entity")
        category = str(obj.get("category") or "objects").lower().replace(" ", "_")
        try:
            confidence = max(0.0, min(1.0, float(obj.get("confidence", 0.9))))
        except Exception:
            confidence = 0.85
        obs = str(obj.get("observation") or f"{name.capitalize()} visible in scene.")
        state = "observed" if obj.get("state") != "inferred" else "inferred"

        clean_objects.append(
            DetectedObject(
                id=obj_id,
                name=name,
                category=category,
                confidence=confidence,
                observation=obs,
                state=state,
            )
        )

    # 2. Relationships validation
    raw_relationships = data.get("relationships", [])
    clean_relationships: List[SpatialRelationship] = []
    for rel in raw_relationships:
        if not isinstance(rel, dict):
            continue
        sub = str(rel.get("subject", "")).strip()
        rel_type = str(rel.get("relation", "near")).strip()
        obj = str(rel.get("object", "")).strip()
        try:
            conf = max(0.0, min(1.0, float(rel.get("confidence", 0.85))))
        except Exception:
            conf = 0.85

        if sub and obj:
            clean_relationships.append(
                SpatialRelationship(
                    subject=sub,
                    relation=rel_type,
                    object=obj,
                    confidence=conf,
                )
            )

    # 3. Observations validation
    raw_obs = data.get("observations", [])
    clean_obs: List[ObservationItem] = []
    for item in raw_obs:
        if isinstance(item, dict):
            text = str(item.get("text", "")).strip()
            state = "observed" if item.get("state") != "inferred" else "inferred"
            if text:
                clean_obs.append(ObservationItem(text=text, state=state))
        elif isinstance(item, str) and item.strip():
            clean_obs.append(ObservationItem(text=item.strip(), state="observed"))

    # 4. Possible evidence
    possible_evidence = [str(x).strip() for x in data.get("possible_evidence", []) if str(x).strip()]

    # 5. Uncertainties
    uncertainties = [str(x).strip() for x in data.get("uncertainties", []) if str(x).strip()]

    return SceneAnalysisResult(
        scene_type=str(data.get("scene_type", "indoor_room")),
        overall_description=str(data.get("overall_description", "Factual scene understanding telemetry extracted.")),
        objects=clean_objects,
        relationships=clean_relationships,
        observations=clean_obs,
        possible_evidence=possible_evidence,
        uncertainties=uncertainties,
    )
