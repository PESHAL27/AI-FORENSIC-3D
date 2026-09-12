import os
import re
import uuid
import json
import math
import logging
from datetime import datetime, timezone
from typing import Optional, List, Dict, Any

from app.core.config import settings
from app.core.database import get_supabase_client

logger = logging.getLogger("ai_forensic_3d.service")

LOCAL_STORAGE_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "local_storage")
LOCAL_DB_FILE = os.path.join(LOCAL_STORAGE_DIR, "db.json")


def sanitize_filename(filename: str) -> str:
    """Sanitize filename to prevent directory traversal and illegal characters."""
    clean = os.path.basename(filename)
    clean = re.sub(r"[^a-zA-Z0-9_\.\-]", "_", clean)
    return clean.lower()


class SupabaseService:
    def __init__(self):
        os.makedirs(LOCAL_STORAGE_DIR, exist_ok=True)
        self._local_data: Dict[str, Any] = self._load_local_db()
        self._ensure_initial_seed()

    # --------------------------------------------------------------------------
    # LOCAL STORE PERSISTENCE (FALLBACK & ZERO-CONFIG MODE)
    # --------------------------------------------------------------------------
    def _load_local_db(self) -> Dict[str, Any]:
        if os.path.exists(LOCAL_DB_FILE):
            try:
                with open(LOCAL_DB_FILE, "r", encoding="utf-8") as f:
                    return json.load(f)
            except Exception as e:
                logger.warning("Could not read local DB file: %s. Reinitializing.", e)
        return {
            "cases": [],
            "evidence": [],
            "scenes": [],
            "scene_objects": [],
            "evidence_markers": [],
            "measurements": [],
            "timeline_events": [],
        }

    def _save_local_db(self):
        try:
            with open(LOCAL_DB_FILE, "w", encoding="utf-8") as f:
                json.dump(self._local_data, f, indent=2, default=str)
        except Exception as e:
            logger.error("Failed to save local DB file: %s", e)

    def _ensure_initial_seed(self):
        """Seeds the baseline demonstration case (Case #2026-FR-0941) if empty."""
        if not self._local_data["cases"]:
            default_case_id = "case-001"
            now = datetime.now(timezone.utc).isoformat()

            # 1. Primary Case
            case_1 = {
                "id": default_case_id,
                "case_number": "CASE-2026-FR-0941",
                "title": "Downtown Office Kinetic Breach Event",
                "description": "Perimeter ballistic breach, kinetic chair deflection, and high-velocity glass dispersion.",
                "status": "ACTIVE",
                "created_at": now,
                "updated_at": now,
            }
            case_2 = {
                "id": "case-002",
                "case_number": "CASE-2026-FR-0883",
                "title": "Substation Perimeter Intrusion",
                "description": "Chain-link boundary shear and high-voltage substation perimeter breach.",
                "status": "ARCHIVED",
                "created_at": now,
                "updated_at": now,
            }
            case_3 = {
                "id": "case-003",
                "case_number": "CASE-2026-FR-0714",
                "title": "Harbor Warehouse Loading Dock Incident",
                "description": "Industrial cargo elevator failure and kinematic telemetry reconstruction.",
                "status": "IN_REVIEW",
                "created_at": now,
                "updated_at": now,
            }
            self._local_data["cases"].extend([case_1, case_2, case_3])

            # 2. Initial Scene & Objects for case-001
            scene_id = "scene-001"
            self._local_data["scenes"].append({
                "id": scene_id,
                "case_id": default_case_id,
                "name": "Downtown Office 3D Reconstruction",
                "version": 1,
                "created_at": now,
                "updated_at": now,
            })

            initial_objects = [
                {
                    "id": "ent-person-01",
                    "scene_id": scene_id,
                    "name": "Subject Alpha (Kinematic Pose)",
                    "type": "person",
                    "model": "mannequin",
                    "original_position": {"x": 0.1, "y": 0.0, "z": 0.3},
                    "current_position": {"x": 0.1, "y": 0.0, "z": 0.3},
                    "original_rotation": {"x": 0, "y": 0.45, "z": 0},
                    "current_rotation": {"x": 0, "y": 0.45, "z": 0},
                    "scale": {"x": 1, "y": 1, "z": 1},
                    "metadata": {"category": "People", "confidence": 0.984},
                    "created_at": now,
                    "updated_at": now,
                },
                {
                    "id": "ent-furn-chair",
                    "scene_id": scene_id,
                    "name": "Ergonomic Task Chair (Overturned)",
                    "type": "chair",
                    "model": "task_chair",
                    "original_position": {"x": -1.9, "y": 0.35, "z": 0.3},
                    "current_position": {"x": -1.9, "y": 0.35, "z": 0.3},
                    "original_rotation": {"x": 1.57, "y": 0.3, "z": 0.8},
                    "current_rotation": {"x": 1.57, "y": 0.3, "z": 0.8},
                    "scale": {"x": 1, "y": 1, "z": 1},
                    "metadata": {"category": "Furniture", "confidence": 0.961},
                    "created_at": now,
                    "updated_at": now,
                },
                {
                    "id": "ent-furn-table",
                    "scene_id": scene_id,
                    "name": "Reinforced Conference Desk",
                    "type": "table",
                    "model": "conference_desk",
                    "original_position": {"x": 0.0, "y": 0.0, "z": -0.6},
                    "current_position": {"x": 0.0, "y": 0.0, "z": -0.6},
                    "original_rotation": {"x": 0, "y": 0, "z": 0},
                    "current_rotation": {"x": 0, "y": 0, "z": 0},
                    "scale": {"x": 1, "y": 1, "z": 1},
                    "metadata": {"category": "Furniture", "confidence": 0.992},
                    "created_at": now,
                    "updated_at": now,
                },
                {
                    "id": "ent-glass-field",
                    "scene_id": scene_id,
                    "name": "High-Velocity Glass Dispersion",
                    "type": "glass",
                    "model": "glass_shards",
                    "original_position": {"x": -0.4, "y": 0.02, "z": 1.3},
                    "current_position": {"x": -0.4, "y": 0.02, "z": 1.3},
                    "original_rotation": {"x": 0, "y": 0, "z": 0},
                    "current_rotation": {"x": 0, "y": 0, "z": 0},
                    "scale": {"x": 1, "y": 1, "z": 1},
                    "metadata": {"category": "Objects", "confidence": 0.947},
                    "created_at": now,
                    "updated_at": now,
                },
                {
                    "id": "ent-door-north",
                    "scene_id": scene_id,
                    "name": "North Primary Egress Door",
                    "type": "door",
                    "model": "architectural_door",
                    "original_position": {"x": 2.8, "y": 0.0, "z": -2.2},
                    "current_position": {"x": 2.8, "y": 0.0, "z": -2.2},
                    "original_rotation": {"x": 0, "y": 1.57, "z": 0},
                    "current_rotation": {"x": 0, "y": 1.57, "z": 0},
                    "scale": {"x": 1, "y": 1, "z": 1},
                    "metadata": {"category": "Doors / Windows", "confidence": 0.988},
                    "created_at": now,
                    "updated_at": now,
                },
                {
                    "id": "ent-window-east",
                    "scene_id": scene_id,
                    "name": "East Perimeter Glazing (Breached)",
                    "type": "window",
                    "model": "breached_window",
                    "original_position": {"x": -3.0, "y": 1.4, "z": 0.2},
                    "current_position": {"x": -3.0, "y": 1.4, "z": 0.2},
                    "original_rotation": {"x": 0, "y": 0, "z": 0},
                    "current_rotation": {"x": 0, "y": 0, "z": 0},
                    "scale": {"x": 1, "y": 1, "z": 1},
                    "metadata": {"category": "Doors / Windows", "confidence": 0.973},
                    "created_at": now,
                    "updated_at": now,
                },
                {
                    "id": "ent-obj-casing",
                    "scene_id": scene_id,
                    "name": "Spent 9x19mm Brass Casing",
                    "type": "marker",
                    "model": "brass_casing",
                    "original_position": {"x": 1.1, "y": 0.015, "z": 0.5},
                    "current_position": {"x": 1.1, "y": 0.015, "z": 0.5},
                    "original_rotation": {"x": 0, "y": 0.7, "z": 0},
                    "current_rotation": {"x": 0, "y": 0.7, "z": 0},
                    "scale": {"x": 1, "y": 1, "z": 1},
                    "metadata": {"category": "Objects", "confidence": 0.952},
                    "created_at": now,
                    "updated_at": now,
                },
            ]
            self._local_data["scene_objects"].extend(initial_objects)

            # 3. Initial Markers
            self._local_data["evidence_markers"].extend([
                {
                    "id": "ev-01",
                    "case_id": default_case_id,
                    "label": "Impact & Glass Dispersion",
                    "marker_type": "DAMAGE",
                    "position_x": -0.4,
                    "position_y": 0.25,
                    "position_z": 1.3,
                    "metadata": {"number": "01", "confidence": 0.984},
                    "created_at": now,
                    "updated_at": now,
                },
                {
                    "id": "ev-02",
                    "case_id": default_case_id,
                    "label": "Overturned Chair Trajectory",
                    "marker_type": "OBJECT",
                    "position_x": -1.9,
                    "position_y": 0.25,
                    "position_z": 0.3,
                    "metadata": {"number": "02", "confidence": 0.951},
                    "created_at": now,
                    "updated_at": now,
                },
                {
                    "id": "ev-03",
                    "case_id": default_case_id,
                    "label": "Latent Sole Impression",
                    "marker_type": "PERSON",
                    "position_x": 1.4,
                    "position_y": 0.25,
                    "position_z": 0.9,
                    "metadata": {"number": "03", "confidence": 0.927},
                    "created_at": now,
                    "updated_at": now,
                },
                {
                    "id": "ev-04",
                    "case_id": default_case_id,
                    "label": "Egress Point / Latch Residue",
                    "marker_type": "DAMAGE",
                    "position_x": 2.7,
                    "position_y": 0.25,
                    "position_z": -2.0,
                    "metadata": {"number": "04", "confidence": 0.972},
                    "created_at": now,
                    "updated_at": now,
                },
            ])

            # 4. Initial Measurements
            self._local_data["measurements"].extend([
                {
                    "id": "m-01",
                    "case_id": default_case_id,
                    "label": "Impact to Chair Displacement",
                    "point_a": {"x": -0.4, "y": 0.25, "z": 1.3},
                    "point_b": {"x": -1.9, "y": 0.25, "z": 0.3},
                    "distance": 1.80,
                    "unit": "m",
                    "created_at": now,
                    "updated_at": now,
                },
                {
                    "id": "m-02",
                    "case_id": default_case_id,
                    "label": "Egress Threshold to Sole Impression",
                    "point_a": {"x": 2.7, "y": 0.25, "z": -2.0},
                    "point_b": {"x": 1.4, "y": 0.25, "z": 0.9},
                    "distance": 3.18,
                    "unit": "m",
                    "created_at": now,
                    "updated_at": now,
                },
                {
                    "id": "m-03",
                    "case_id": default_case_id,
                    "label": "Window Breach to Impact Origin",
                    "point_a": {"x": -3.0, "y": 1.4, "z": 0.2},
                    "point_b": {"x": -0.4, "y": 0.25, "z": 1.3},
                    "distance": 2.83,
                    "unit": "m",
                    "created_at": now,
                    "updated_at": now,
                },
            ])

            # 5. Initial Timeline Events
            self._local_data["timeline_events"].extend([
                {"id": "t-10", "case_id": default_case_id, "time_offset": "T-10s", "event_name": "Person Enters", "description": "Subject Alpha crosses north portal into forensic perimeter.", "event_type": "entry", "scene_state": {}, "created_at": now},
                {"id": "t-7", "case_id": default_case_id, "time_offset": "T-7s", "event_name": "Person Approaches Desk", "description": "Subject traverses central zone towards desk.", "event_type": "movement", "scene_state": {}, "created_at": now},
                {"id": "t-4", "case_id": default_case_id, "time_offset": "T-4s", "event_name": "Person Reaches Chair", "description": "Subject occupies task chair.", "event_type": "interaction", "scene_state": {}, "created_at": now},
                {"id": "t-2", "case_id": default_case_id, "time_offset": "T-2s", "event_name": "Chair Moves", "description": "Sudden kinematic thrust. Chair displaced backward.", "event_type": "movement", "scene_state": {}, "created_at": now},
                {"id": "t-0", "case_id": default_case_id, "time_offset": "T=0", "event_name": "Impact", "description": "Primary kinetic event at east window.", "event_type": "impact", "scene_state": {}, "created_at": now},
                {"id": "t-p2", "case_id": default_case_id, "time_offset": "T+2s", "event_name": "Glass Moves", "description": "Secondary particle dispersion field stabilizes.", "event_type": "dispersion", "scene_state": {}, "created_at": now},
            ])

            self._save_local_db()

    # --------------------------------------------------------------------------
    # CASES
    # --------------------------------------------------------------------------
    async def list_cases(self) -> List[Dict[str, Any]]:
        client = get_supabase_client()
        if client:
            try:
                res = client.table("cases").select("*").order("created_at", desc=True).execute()
                return res.data or []
            except Exception as e:
                logger.warning("Supabase list_cases error: %s. Using local store.", e)
        return list(reversed(self._local_data["cases"]))

    async def get_case(self, case_id: str) -> Optional[Dict[str, Any]]:
        client = get_supabase_client()
        if client:
            try:
                res = client.table("cases").select("*").or_(f"id.eq.{case_id},case_number.eq.{case_id}").execute()
                if res.data:
                    return res.data[0]
            except Exception as e:
                logger.warning("Supabase get_case error: %s. Using local store.", e)

        for c in self._local_data["cases"]:
            if c["id"] == case_id or c["case_number"] == case_id:
                return c
        return None

    async def create_case(self, case_data: Dict[str, Any]) -> Dict[str, Any]:
        now = datetime.now(timezone.utc).isoformat()
        new_id = str(uuid.uuid4())
        record = {
            "id": new_id,
            "case_number": case_data["case_number"],
            "title": case_data["title"],
            "description": case_data.get("description", ""),
            "status": case_data.get("status", "ACTIVE"),
            "created_at": now,
            "updated_at": now,
        }
        client = get_supabase_client()
        if client:
            try:
                res = client.table("cases").insert(record).execute()
                if res.data:
                    return res.data[0]
            except Exception as e:
                logger.warning("Supabase create_case error: %s. Using local store.", e)

        self._local_data["cases"].append(record)
        self._save_local_db()
        return record

    async def update_case(self, case_id: str, update_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        now = datetime.now(timezone.utc).isoformat()
        clean_data = {k: v for k, v in update_data.items() if v is not None}
        clean_data["updated_at"] = now

        client = get_supabase_client()
        if client:
            try:
                res = client.table("cases").update(clean_data).or_(f"id.eq.{case_id},case_number.eq.{case_id}").execute()
                if res.data:
                    return res.data[0]
            except Exception as e:
                logger.warning("Supabase update_case error: %s. Using local store.", e)

        for c in self._local_data["cases"]:
            if c["id"] == case_id or c["case_number"] == case_id:
                c.update(clean_data)
                self._save_local_db()
                return c
        return None

    async def delete_case(self, case_id: str) -> bool:
        client = get_supabase_client()
        if client:
            try:
                client.table("cases").delete().or_(f"id.eq.{case_id},case_number.eq.{case_id}").execute()
                return True
            except Exception as e:
                logger.warning("Supabase delete_case error: %s. Using local store.", e)

        before_len = len(self._local_data["cases"])
        self._local_data["cases"] = [c for c in self._local_data["cases"] if c["id"] != case_id and c["case_number"] != case_id]
        if len(self._local_data["cases"]) < before_len:
            self._save_local_db()
            return True
        return False

    # --------------------------------------------------------------------------
    # EVIDENCE & STORAGE
    # --------------------------------------------------------------------------
    async def upload_evidence(
        self,
        case_id: str,
        filename: str,
        content_bytes: bytes,
        content_type: str,
        file_type: str,
        metadata: Optional[Dict[str, Any]] = None,
    ) -> Dict[str, Any]:
        evidence_id = f"ev-{uuid.uuid4().hex[:8]}"
        clean_filename = sanitize_filename(filename)
        storage_path = f"cases/{case_id}/evidence/{evidence_id}/{clean_filename}"
        now = datetime.now(timezone.utc).isoformat()

        # 1. Store the file (Supabase Storage or Local Storage)
        download_url = None
        client = get_supabase_client()
        uploaded_to_supabase = False
        if client:
            try:
                bucket = settings.SUPABASE_STORAGE_BUCKET
                client.storage.from_(bucket).upload(
                    path=storage_path,
                    file=content_bytes,
                    file_options={"content-type": content_type, "upsert": "true"},
                )
                uploaded_to_supabase = True
                # Get public or signed URL
                try:
                    res_url = client.storage.from_(bucket).get_public_url(storage_path)
                    download_url = res_url
                except Exception:
                    pass
            except Exception as e:
                logger.warning("Supabase storage upload error: %s. Saving locally.", e)

        if not uploaded_to_supabase:
            local_file_path = os.path.join(LOCAL_STORAGE_DIR, storage_path.replace("/", os.sep))
            os.makedirs(os.path.dirname(local_file_path), exist_ok=True)
            with open(local_file_path, "wb") as f:
                f.write(content_bytes)
            download_url = f"/api/evidence/{evidence_id}/download"

        # 2. Database Record
        record = {
            "id": evidence_id,
            "case_id": case_id,
            "original_filename": filename,
            "filename": filename,
            "storage_path": storage_path,
            "file_type": file_type,
            "mime_type": content_type,
            "file_size": len(content_bytes),
            "status": "UPLOADED",
            "metadata": metadata or {},
            "download_url": download_url,
            "created_at": now,
            "updated_at": now,
        }

        if client and uploaded_to_supabase:
            try:
                res = client.table("evidence").insert(record).execute()
                if res.data:
                    return res.data[0]
            except Exception as e:
                logger.warning("Supabase evidence DB insert error: %s. Saving to local store.", e)

        self._local_data["evidence"].append(record)
        self._save_local_db()
        return record

    async def list_evidence(self, case_id: str) -> List[Dict[str, Any]]:
        client = get_supabase_client()
        if client:
            try:
                res = client.table("evidence").select("*").eq("case_id", case_id).order("created_at", desc=True).execute()
                return res.data or []
            except Exception as e:
                logger.warning("Supabase list_evidence error: %s. Using local store.", e)

        return [e for e in self._local_data["evidence"] if e["case_id"] == case_id]

    async def get_evidence(self, evidence_id: str) -> Optional[Dict[str, Any]]:
        client = get_supabase_client()
        if client:
            try:
                res = client.table("evidence").select("*").eq("id", evidence_id).execute()
                if res.data:
                    return res.data[0]
            except Exception as e:
                logger.warning("Supabase get_evidence error: %s. Using local store.", e)

        for e in self._local_data["evidence"]:
            if e["id"] == evidence_id:
                return e
        return None

    async def delete_evidence(self, evidence_id: str) -> bool:
        item = await self.get_evidence(evidence_id)
        if not item:
            return False

        # Remove from Supabase
        client = get_supabase_client()
        if client:
            try:
                bucket = settings.SUPABASE_STORAGE_BUCKET
                client.storage.from_(bucket).remove([item["storage_path"]])
                client.table("evidence").delete().eq("id", evidence_id).execute()
            except Exception as e:
                logger.warning("Supabase delete_evidence error: %s", e)

        # Remove local file if exists
        local_path = os.path.join(LOCAL_STORAGE_DIR, item["storage_path"].replace("/", os.sep))
        if os.path.exists(local_path):
            try:
                os.remove(local_path)
            except Exception:
                pass

        before_len = len(self._local_data["evidence"])
        self._local_data["evidence"] = [e for e in self._local_data["evidence"] if e["id"] != evidence_id]
        if "analyses" in self._local_data and evidence_id in self._local_data["analyses"]:
            del self._local_data["analyses"][evidence_id]
        self._save_local_db()
        return len(self._local_data["evidence"]) < before_len

    async def save_evidence_analysis(self, evidence_id: str, analysis: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Saves or updates the AI scene understanding analysis for an evidence item."""
        now = datetime.now(timezone.utc).isoformat()
        target = None
        for e in self._local_data["evidence"]:
            if e["id"] == evidence_id:
                e["analysis"] = analysis
                e["updated_at"] = now
                target = e
                break

        if "analyses" not in self._local_data:
            self._local_data["analyses"] = {}
        self._local_data["analyses"][evidence_id] = analysis
        self._save_local_db()

        # If Supabase client exists, update metadata column
        client = get_supabase_client()
        if client and target:
            try:
                client.table("evidence").update({
                    "metadata": target.get("metadata", {}),
                    "status": analysis.get("status", "READY"),
                    "updated_at": now,
                }).eq("id", evidence_id).execute()
            except Exception as e:
                logger.warning("Supabase save_evidence_analysis error: %s", e)

        return analysis

    async def get_evidence_analysis(self, evidence_id: str) -> Optional[Dict[str, Any]]:
        """Retrieves previously saved AI scene understanding analysis for an evidence item."""
        if "analyses" in self._local_data and evidence_id in self._local_data["analyses"]:
            return self._local_data["analyses"][evidence_id]

        ev = await self.get_evidence(evidence_id)
        if ev and "analysis" in ev:
            return ev["analysis"]
        return None

    async def list_case_analyses(self, case_id: str) -> List[Dict[str, Any]]:
        """Lists all completed AI analyses for evidence belonging to a case."""
        case_items = await self.list_evidence(case_id)
        results = []
        for item in case_items:
            analysis = item.get("analysis")
            if not analysis and "analyses" in self._local_data:
                analysis = self._local_data["analyses"].get(item["id"])
            if analysis:
                results.append(analysis)
        return results

    # --------------------------------------------------------------------------
    # SCENES & SCENE OBJECTS
    # --------------------------------------------------------------------------
    async def get_or_create_scene(self, case_id: str) -> Dict[str, Any]:
        """Returns the scene and all its child scene_objects for a case."""
        now = datetime.now(timezone.utc).isoformat()
        client = get_supabase_client()

        if client:
            try:
                res = client.table("scenes").select("*, scene_objects(*)").eq("case_id", case_id).execute()
                if res.data:
                    scene_data = res.data[0]
                    objects = scene_data.pop("scene_objects", []) or []
                    scene_data["objects"] = objects
                    return scene_data
            except Exception as e:
                logger.warning("Supabase get_scene error: %s. Using local store.", e)

        # Local store
        scene = next((s for s in self._local_data["scenes"] if s["case_id"] == case_id), None)
        if not scene:
            scene_id = f"scene-{uuid.uuid4().hex[:8]}"
            scene = {
                "id": scene_id,
                "case_id": case_id,
                "name": f"Scene Reconstruction for {case_id}",
                "version": 1,
                "created_at": now,
                "updated_at": now,
            }
            self._local_data["scenes"].append(scene)
            self._save_local_db()

        # Gather objects
        objects = [o for o in self._local_data["scene_objects"] if o.get("scene_id") == scene["id"]]
        return {**scene, "objects": objects}

    async def save_scene(self, case_id: str, scene_update: Dict[str, Any]) -> Dict[str, Any]:
        """Saves scene metadata and upserts its objects."""
        now = datetime.now(timezone.utc).isoformat()
        scene = await self.get_or_create_scene(case_id)
        scene_id = scene["id"]
        objects = scene_update.get("objects", [])

        client = get_supabase_client()
        if client:
            try:
                # Update scene version
                client.table("scenes").update({
                    "version": scene.get("version", 1) + 1,
                    "updated_at": now,
                }).eq("id", scene_id).execute()

                # Upsert scene objects
                if objects:
                    obj_records = []
                    for o in objects:
                        obj_records.append({
                            "id": o["id"],
                            "scene_id": scene_id,
                            "name": o["name"],
                            "type": o["type"],
                            "model": o.get("model", ""),
                            "original_position": o.get("original_position", {"x": 0, "y": 0, "z": 0}),
                            "current_position": o.get("current_position", {"x": 0, "y": 0, "z": 0}),
                            "original_rotation": o.get("original_rotation", {"x": 0, "y": 0, "z": 0}),
                            "current_rotation": o.get("current_rotation", {"x": 0, "y": 0, "z": 0}),
                            "scale": o.get("scale", {"x": 1, "y": 1, "z": 1}),
                            "metadata": o.get("metadata", {}),
                            "updated_at": now,
                        })
                    client.table("scene_objects").upsert(obj_records).execute()
            except Exception as e:
                logger.warning("Supabase save_scene error: %s. Using local store.", e)

        # Local store update
        for s in self._local_data["scenes"]:
            if s["id"] == scene_id:
                s["version"] = s.get("version", 1) + 1
                s["updated_at"] = now

        if objects:
            existing_objs = {o["id"]: o for o in self._local_data["scene_objects"] if o.get("scene_id") == scene_id}
            for o in objects:
                oid = o["id"]
                rec = {
                    "id": oid,
                    "scene_id": scene_id,
                    "name": o.get("name", "Object"),
                    "type": o.get("type", "furniture"),
                    "model": o.get("model", ""),
                    "original_position": o.get("original_position", {"x": 0, "y": 0, "z": 0}),
                    "current_position": o.get("current_position", {"x": 0, "y": 0, "z": 0}),
                    "original_rotation": o.get("original_rotation", {"x": 0, "y": 0, "z": 0}),
                    "current_rotation": o.get("current_rotation", {"x": 0, "y": 0, "z": 0}),
                    "scale": o.get("scale", {"x": 1, "y": 1, "z": 1}),
                    "metadata": o.get("metadata", {}),
                    "created_at": now,
                    "updated_at": now,
                }
                if oid in existing_objs:
                    existing_objs[oid].update(rec)
                else:
                    self._local_data["scene_objects"].append(rec)
            self._save_local_db()

        return await self.get_or_create_scene(case_id)

    async def restore_object(self, case_id: str, object_id: str) -> Optional[Dict[str, Any]]:
        """Restores a single object to its original position and rotation."""
        scene = await self.get_or_create_scene(case_id)
        now = datetime.now(timezone.utc).isoformat()
        target_obj = None

        for o in self._local_data["scene_objects"]:
            if o.get("scene_id") == scene["id"] and o["id"] == object_id:
                orig_pos = o.get("original_position", {"x": 0, "y": 0, "z": 0})
                orig_rot = o.get("original_rotation", {"x": 0, "y": 0, "z": 0})
                o["current_position"] = dict(orig_pos)
                o["current_rotation"] = dict(orig_rot)
                o["updated_at"] = now
                target_obj = o
                break

        if target_obj:
            self._save_local_db()
            client = get_supabase_client()
            if client:
                try:
                    client.table("scene_objects").update({
                        "current_position": target_obj["current_position"],
                        "current_rotation": target_obj["current_rotation"],
                        "updated_at": now,
                    }).eq("id", object_id).eq("scene_id", scene["id"]).execute()
                except Exception as e:
                    logger.warning("Supabase restore_object error: %s", e)

        return target_obj

    async def reset_scene(self, case_id: str) -> Dict[str, Any]:
        """Restores all objects in the scene to their original positions and rotations."""
        scene = await self.get_or_create_scene(case_id)
        now = datetime.now(timezone.utc).isoformat()

        for o in self._local_data["scene_objects"]:
            if o.get("scene_id") == scene["id"]:
                orig_pos = o.get("original_position", {"x": 0, "y": 0, "z": 0})
                orig_rot = o.get("original_rotation", {"x": 0, "y": 0, "z": 0})
                o["current_position"] = dict(orig_pos)
                o["current_rotation"] = dict(orig_rot)
                o["updated_at"] = now

        self._save_local_db()

        client = get_supabase_client()
        if client:
            try:
                for o in self._local_data["scene_objects"]:
                    if o.get("scene_id") == scene["id"]:
                        client.table("scene_objects").update({
                            "current_position": o["current_position"],
                            "current_rotation": o["current_rotation"],
                            "updated_at": now,
                        }).eq("id", o["id"]).eq("scene_id", scene["id"]).execute()
            except Exception as e:
                logger.warning("Supabase reset_scene error: %s", e)

        return await self.get_or_create_scene(case_id)

    # --------------------------------------------------------------------------
    # EVIDENCE MARKERS
    # --------------------------------------------------------------------------
    async def list_markers(self, case_id: str) -> List[Dict[str, Any]]:
        client = get_supabase_client()
        if client:
            try:
                res = client.table("evidence_markers").select("*").eq("case_id", case_id).order("created_at").execute()
                return res.data or []
            except Exception as e:
                logger.warning("Supabase list_markers error: %s. Using local store.", e)

        return [m for m in self._local_data["evidence_markers"] if m["case_id"] == case_id]

    async def create_marker(self, case_id: str, marker_data: Dict[str, Any]) -> Dict[str, Any]:
        now = datetime.now(timezone.utc).isoformat()
        new_id = f"mk-{uuid.uuid4().hex[:8]}"
        record = {
            "id": new_id,
            "case_id": case_id,
            "evidence_id": marker_data.get("evidence_id"),
            "marker_type": marker_data.get("marker_type", "EVIDENCE"),
            "label": marker_data.get("label", "Evidence Marker"),
            "position_x": float(marker_data.get("position_x", 0.0)),
            "position_y": float(marker_data.get("position_y", 0.0)),
            "position_z": float(marker_data.get("position_z", 0.0)),
            "metadata": marker_data.get("metadata", {}),
            "created_at": now,
            "updated_at": now,
        }

        client = get_supabase_client()
        if client:
            try:
                res = client.table("evidence_markers").insert(record).execute()
                if res.data:
                    return res.data[0]
            except Exception as e:
                logger.warning("Supabase create_marker error: %s. Using local store.", e)

        self._local_data["evidence_markers"].append(record)
        self._save_local_db()
        return record

    async def update_marker(self, marker_id: str, update_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        now = datetime.now(timezone.utc).isoformat()
        clean = {k: v for k, v in update_data.items() if v is not None}
        clean["updated_at"] = now

        client = get_supabase_client()
        if client:
            try:
                res = client.table("evidence_markers").update(clean).eq("id", marker_id).execute()
                if res.data:
                    return res.data[0]
            except Exception as e:
                logger.warning("Supabase update_marker error: %s. Using local store.", e)

        for m in self._local_data["evidence_markers"]:
            if m["id"] == marker_id:
                m.update(clean)
                self._save_local_db()
                return m
        return None

    async def delete_marker(self, marker_id: str) -> bool:
        client = get_supabase_client()
        if client:
            try:
                client.table("evidence_markers").delete().eq("id", marker_id).execute()
            except Exception as e:
                logger.warning("Supabase delete_marker error: %s", e)

        before_len = len(self._local_data["evidence_markers"])
        self._local_data["evidence_markers"] = [m for m in self._local_data["evidence_markers"] if m["id"] != marker_id]
        self._save_local_db()
        return len(self._local_data["evidence_markers"]) < before_len

    # --------------------------------------------------------------------------
    # MEASUREMENTS (WITH AUTO 3D EUCLIDEAN DISTANCE)
    # --------------------------------------------------------------------------
    async def list_measurements(self, case_id: str) -> List[Dict[str, Any]]:
        client = get_supabase_client()
        if client:
            try:
                res = client.table("measurements").select("*").eq("case_id", case_id).order("created_at").execute()
                return res.data or []
            except Exception as e:
                logger.warning("Supabase list_measurements error: %s. Using local store.", e)

        return [m for m in self._local_data["measurements"] if m["case_id"] == case_id]

    async def create_measurement(self, case_id: str, data: Dict[str, Any]) -> Dict[str, Any]:
        now = datetime.now(timezone.utc).isoformat()
        pt_a = data.get("point_a", {"x": 0, "y": 0, "z": 0})
        pt_b = data.get("point_b", {"x": 0, "y": 0, "z": 0})

        # Calculate exact 3D distance
        dx = float(pt_b.get("x", 0)) - float(pt_a.get("x", 0))
        dy = float(pt_b.get("y", 0)) - float(pt_a.get("y", 0))
        dz = float(pt_b.get("z", 0)) - float(pt_a.get("z", 0))
        dist = round(math.sqrt(dx * dx + dy * dy + dz * dz), 3)

        new_id = f"meas-{uuid.uuid4().hex[:8]}"
        record = {
            "id": new_id,
            "case_id": case_id,
            "label": data.get("label", f"Distance ({dist}m)"),
            "point_a": pt_a,
            "point_b": pt_b,
            "distance": dist,
            "unit": data.get("unit", "m"),
            "created_at": now,
            "updated_at": now,
        }

        client = get_supabase_client()
        if client:
            try:
                res = client.table("measurements").insert(record).execute()
                if res.data:
                    return res.data[0]
            except Exception as e:
                logger.warning("Supabase create_measurement error: %s. Using local store.", e)

        self._local_data["measurements"].append(record)
        self._save_local_db()
        return record

    async def update_measurement(self, measurement_id: str, update_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        now = datetime.now(timezone.utc).isoformat()
        clean = {k: v for k, v in update_data.items() if v is not None}
        clean["updated_at"] = now

        # Recalculate distance if points updated
        if "point_a" in clean or "point_b" in clean:
            existing = next((m for m in self._local_data["measurements"] if m["id"] == measurement_id), None)
            pt_a = clean.get("point_a", existing.get("point_a", {}) if existing else {})
            pt_b = clean.get("point_b", existing.get("point_b", {}) if existing else {})
            dx = float(pt_b.get("x", 0)) - float(pt_a.get("x", 0))
            dy = float(pt_b.get("y", 0)) - float(pt_a.get("y", 0))
            dz = float(pt_b.get("z", 0)) - float(pt_a.get("z", 0))
            clean["distance"] = round(math.sqrt(dx * dx + dy * dy + dz * dz), 3)

        client = get_supabase_client()
        if client:
            try:
                res = client.table("measurements").update(clean).eq("id", measurement_id).execute()
                if res.data:
                    return res.data[0]
            except Exception as e:
                logger.warning("Supabase update_measurement error: %s. Using local store.", e)

        for m in self._local_data["measurements"]:
            if m["id"] == measurement_id:
                m.update(clean)
                self._save_local_db()
                return m
        return None

    async def delete_measurement(self, measurement_id: str) -> bool:
        client = get_supabase_client()
        if client:
            try:
                client.table("measurements").delete().eq("id", measurement_id).execute()
            except Exception as e:
                logger.warning("Supabase delete_measurement error: %s", e)

        before_len = len(self._local_data["measurements"])
        self._local_data["measurements"] = [m for m in self._local_data["measurements"] if m["id"] != measurement_id]
        self._save_local_db()
        return len(self._local_data["measurements"]) < before_len

    # --------------------------------------------------------------------------
    # TIMELINE EVENTS
    # --------------------------------------------------------------------------
    async def list_timeline(self, case_id: str) -> List[Dict[str, Any]]:
        client = get_supabase_client()
        if client:
            try:
                res = client.table("timeline_events").select("*").eq("case_id", case_id).order("created_at").execute()
                return res.data or []
            except Exception as e:
                logger.warning("Supabase list_timeline error: %s. Using local store.", e)

        return [t for t in self._local_data["timeline_events"] if t["case_id"] == case_id]

    async def create_timeline_event(self, case_id: str, event_data: Dict[str, Any]) -> Dict[str, Any]:
        now = datetime.now(timezone.utc).isoformat()
        new_id = f"t-{uuid.uuid4().hex[:6]}"
        record = {
            "id": new_id,
            "case_id": case_id,
            "time_offset": event_data["time_offset"],
            "event_name": event_data["event_name"],
            "description": event_data.get("description", ""),
            "event_type": event_data.get("event_type", "movement"),
            "scene_state": event_data.get("scene_state", {}),
            "created_at": now,
        }

        client = get_supabase_client()
        if client:
            try:
                res = client.table("timeline_events").insert(record).execute()
                if res.data:
                    return res.data[0]
            except Exception as e:
                logger.warning("Supabase create_timeline_event error: %s. Using local store.", e)

        self._local_data["timeline_events"].append(record)
        self._save_local_db()
        return record


# Global singleton instance
db_service = SupabaseService()
