import logging
from typing import Optional
from .config import settings

logger = logging.getLogger("ai_forensic_3d.database")

supabase_client = None

def get_supabase_client():
    """
    Returns the initialized Supabase client if valid credentials are provided,
    otherwise returns None (triggering local fallback mode).
    """
    global supabase_client
    if supabase_client is not None:
        return supabase_client

    if settings.has_supabase_credentials:
        try:
            from supabase import create_client, Client
            supabase_client = create_client(
                settings.SUPABASE_URL,
                settings.SUPABASE_SERVICE_ROLE_KEY
            )
            logger.info("Connected to Supabase at %s", settings.SUPABASE_URL)
            return supabase_client
        except Exception as e:
            logger.warning("Could not connect to Supabase: %s. Using local persistent store.", e)
            return None
    else:
        logger.info("No Supabase credentials configured in .env. Running in local fallback mode.")
        return None


def is_supabase_configured() -> bool:
    """Returns True if Supabase credentials are configured in the environment."""
    return settings.has_supabase_credentials

