import base64
import logging
import httpx
from .provider import BaseVisionProvider

logger = logging.getLogger("ai_forensic_3d.ai.openrouter")


class OpenRouterProvider(BaseVisionProvider):
    """OpenRouter Vision Provider supporting models like Gemini 2.0 Flash, Claude 3.5, GPT-4o."""

    ENDPOINT = "https://openrouter.ai/api/v1/chat/completions"

    async def analyze_image(self, image_bytes: bytes, mime_type: str, prompt: str) -> str:
        if not self.api_key:
            raise ValueError("OpenRouter API key is missing. Please set OPENROUTER_API_KEY in backend/.env")

        b64_image = base64.b64encode(image_bytes).decode("utf-8")
        data_url = f"data:{mime_type};base64,{b64_image}"

        headers = {
            "Authorization": f"Bearer {self.api_key.strip()}",
            "HTTP-Referer": "http://localhost:5173",
            "X-Title": "AI Forensic 3D Investigation",
            "Content-Type": "application/json",
        }

        payload = {
            "model": self.model or "inclusionai/ling-3.0-flash-vl:free",
            "messages": [
                {
                    "role": "system",
                    "content": (
                        "You are an evidence scene-understanding assistant for a 3D forensic investigation platform. "
                        "You must strictly output a valid JSON object following the requested schema and nothing else."
                    ),
                },
                {
                    "role": "user",
                    "content": [
                        {"type": "text", "text": prompt},
                        {"type": "image_url", "image_url": {"url": data_url}},
                    ],
                },
            ],
            "response_format": {"type": "json_object"},
            "temperature": 0.1,
        }

        async with httpx.AsyncClient(timeout=self.timeout) as client:
            try:
                response = await client.post(self.ENDPOINT, headers=headers, json=payload)
                # Some models on OpenRouter reject response_format or structured-outputs
                if response.status_code == 400 and ("response_format" in response.text.lower() or "structured" in response.text.lower()):
                    logger.info("Model does not support response_format='json_object', retrying without it...")
                    payload.pop("response_format", None)
                    response = await client.post(self.ENDPOINT, headers=headers, json=payload)

                if response.status_code != 200:
                    err_msg = f"OpenRouter API error (HTTP {response.status_code}): {response.text}"
                    logger.error(err_msg)
                    raise RuntimeError(err_msg)

                data = response.json()
                choices = data.get("choices", [])
                if not choices:
                    raise RuntimeError("OpenRouter returned empty choices in response.")

                content = choices[0].get("message", {}).get("content", "")
                if not content:
                    raise RuntimeError("OpenRouter returned empty content.")

                return content
            except httpx.TimeoutException:
                raise TimeoutError(f"OpenRouter request timed out after {self.timeout}s.")
            except httpx.RequestError as e:
                raise RuntimeError(f"OpenRouter network communication error: {str(e)}")
