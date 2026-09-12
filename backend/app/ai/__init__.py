import logging
from typing import Optional

from app.core.config import settings
from .provider import BaseVisionProvider
from .openrouter_provider import OpenRouterProvider
from .openai_provider import OpenAIProvider
from .gemini_provider import GeminiProvider
from .scene_analyzer import (
    SCENE_UNDERSTANDING_SYSTEM_PROMPT,
    parse_and_validate_analysis,
)
from app.schemas.analysis import SceneAnalysisResult

logger = logging.getLogger("ai_forensic_3d.ai")


def get_vision_provider() -> BaseVisionProvider:
    """Factory function creating the configured vision AI provider."""
    provider_type = (settings.AI_PROVIDER or "openrouter").lower().strip()

    if provider_type == "openrouter":
        return OpenRouterProvider(
            api_key=settings.OPENROUTER_API_KEY,
            model=settings.AI_MODEL or "inclusionai/ling-3.0-flash-vl:free",
            timeout=settings.AI_REQUEST_TIMEOUT,
        )
    elif provider_type == "openai":
        return OpenAIProvider(
            api_key=settings.OPENAI_API_KEY,
            model=settings.AI_MODEL or "gpt-4o-mini",
            timeout=settings.AI_REQUEST_TIMEOUT,
        )
    elif provider_type == "gemini":
        return GeminiProvider(
            api_key=settings.GEMINI_API_KEY,
            model=settings.AI_MODEL or "gemini-1.5-flash",
            timeout=settings.AI_REQUEST_TIMEOUT,
        )
    else:
        raise ValueError(f"Unsupported AI_PROVIDER '{provider_type}'. Supported: 'openrouter', 'openai', 'gemini'.")


async def analyze_scene_image(image_bytes: bytes, mime_type: str) -> SceneAnalysisResult:
    """
    Coordinates the complete scene understanding pipeline:
    1. Instantiates the configured vision provider.
    2. Sends the image with the forensic prompt.
    3. Parses and validates the structured JSON output into SceneAnalysisResult.
    """
    provider = get_vision_provider()
    raw_response = await provider.analyze_image(
        image_bytes=image_bytes,
        mime_type=mime_type,
        prompt=SCENE_UNDERSTANDING_SYSTEM_PROMPT,
    )
    result = parse_and_validate_analysis(raw_response)
    return result


__all__ = [
    "BaseVisionProvider",
    "OpenRouterProvider",
    "OpenAIProvider",
    "GeminiProvider",
    "get_vision_provider",
    "analyze_scene_image",
    "SCENE_UNDERSTANDING_SYSTEM_PROMPT",
    "parse_and_validate_analysis",
]
