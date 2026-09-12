import logging
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.core.config import settings
from app.core.database import is_supabase_configured
from app.routers import (
    health_router,
    cases_router,
    evidence_router,
    scenes_router,
    markers_router,
    measurements_router,
    timeline_router,
)

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger("ai_forensic_3d")

app = FastAPI(
    title="AI Forensic 3D API",
    description="Backend API and Supabase Storage layer for AI Forensic 3D reconstruction and evidence management.",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers with /api prefix
app.include_router(health_router, prefix="/api")
app.include_router(cases_router, prefix="/api")
app.include_router(evidence_router, prefix="/api")
app.include_router(scenes_router, prefix="/api")
app.include_router(markers_router, prefix="/api")
app.include_router(measurements_router, prefix="/api")
app.include_router(timeline_router, prefix="/api")


@app.on_event("startup")
async def on_startup():
    has_supabase = is_supabase_configured()
    logger.info("==================================================")
    logger.info("AI FORENSIC 3D BACKEND INITIALIZED")
    logger.info(f"Supabase Status: {'CONNECTED' if has_supabase else 'LOCAL FALLBACK STORE (Pre-seeded)'}")
    logger.info(f"API Docs available at: http://localhost:8000/docs")
    logger.info("==================================================")


@app.get("/")
async def root():
    return {
        "name": "AI Forensic 3D API",
        "version": "1.0.0",
        "docs": "/docs",
        "health": "/api/health",
        "supabase_configured": is_supabase_configured(),
    }


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled server error on {request.url.path}: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"detail": f"Internal Server Error: {str(exc)}"},
    )
