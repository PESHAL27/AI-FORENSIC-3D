import abc
from typing import Optional


class BaseVisionProvider(abc.ABC):
    """Abstract Base Class for AI Vision Model Providers."""

    def __init__(self, api_key: str, model: str, timeout: int = 60):
        self.api_key = api_key
        self.model = model
        self.timeout = timeout

    @abc.abstractmethod
    async def analyze_image(self, image_bytes: bytes, mime_type: str, prompt: str) -> str:
        """
        Sends an image along with a dedicated forensic prompt to the vision model.
        Returns the raw model text response (expected to contain structured JSON).
        """
        pass
