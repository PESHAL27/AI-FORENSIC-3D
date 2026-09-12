from fastapi import APIRouter
from app.core.database import is_supabase_configured, get_supabase_client

router = APIRouter(tags=["Health"])


@router.get("/health")
async def health_check():
    """Health check endpoint to verify backend status and Supabase connectivity."""
    has_supabase = is_supabase_configured()
    client = get_supabase_client()
    
    status_details = {
        "status": "ok",
        "service": "AI Forensic 3D Backend",
        "version": "1.0.0",
        "mode": "live_supabase" if client is not None else "local_fallback",
        "supabase_configured": has_supabase,
        "supabase_connected": client is not None,
    }
    return status_details
