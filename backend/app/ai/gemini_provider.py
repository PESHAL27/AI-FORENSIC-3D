import base64
import logging
import httpx
from .provider import BaseVisionProvider

logger = logging.getLogger("ai_forensic_3d.ai.gemini")


class GeminiProvider(BaseVisionProvider):
    """Google Gemini Direct Vision Provider supporting gemini-1.5-flash, gemini-2.0-flash."""

    async def analyze_image(self, image_bytes: bytes, mime_type: str, prompt: str) -> str:
        if not self.api_key:
            raise ValueError("Gemini API key is missing. Please set GEMINI_API_KEY in backend/.env")

        b64_image = base64.b64encode(image_bytes).decode("utf-8")
        model_name = self.model or "gemini-1.5-flash"
        if not model_name.startswith("gemini"):
            model_name = "gemini-1.5-flash"

        endpoint = f"https://generativelanguage.googleapis.com/v1beta/models/{model_name}:generateContent?key={self.api_key.strip()}"

        payload = {
            "contents": [
                {
                    "parts": [
                        {"text": prompt},
                        {
                            "inline_data": {
                                "mime_type": mime_type,
                                "data": b64_image,
                            }
                        },
                    ]
                }
            ],
            "generationConfig": {
                "response_mime_type": "application/json",
                "temperature": 0.1,
            },
        }

        async with httpx.AsyncClient(timeout=self.timeout) as client:
            try:
                response = await client.post(endpoint, json=payload)
                if response.status_code != 200:
                    err_msg = f"Gemini API error (HTTP {response.status_code}): {response.text}"
                    logger.error(err_msg)
                    raise RuntimeError(err_msg)

                data = response.json()
                candidates = data.get("candidates", [])
                if not candidates:
                    raise RuntimeError("Gemini returned empty candidates in response.")

                parts = candidates[0].get("content", {}).get("parts", [])
                if not parts:
                    raise RuntimeError("Gemini returned empty content parts.")

                return parts[0].get("text", "")
            except httpx.TimeoutException:
                raise TimeoutError(f"Gemini request timed out after {self.timeout}s.")
            except httpx.RequestError as e:
                raise RuntimeError(f"Gemini network communication error: {str(e)}")
