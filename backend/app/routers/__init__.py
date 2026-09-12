"""API Router definitions"""
from .health import router as health_router
from .cases import router as cases_router
from .evidence import router as evidence_router
from .scenes import router as scenes_router
from .markers import router as markers_router
from .measurements import router as measurements_router
from .timeline import router as timeline_router

__all__ = [
    "health_router",
    "cases_router",
    "evidence_router",
    "scenes_router",
    "markers_router",
    "measurements_router",
    "timeline_router",
]
