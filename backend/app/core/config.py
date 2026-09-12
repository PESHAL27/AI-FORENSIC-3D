import os
from typing import List
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    PROJECT_NAME: str = "AI FORENSIC 3D Backend"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api"

    # Supabase Credentials
    SUPABASE_URL: str = ""
    SUPABASE_SERVICE_ROLE_KEY: str = ""
    SUPABASE_ANON_KEY: str = ""
    SUPABASE_STORAGE_BUCKET: str = "evidence"

    # CORS Configuration
    ALLOWED_ORIGINS: str = "http://localhost:5173,http://localhost:3000,http://127.0.0.1:5173,http://localhost:8000"

    # Storage & Upload Limits
    MAX_FILE_SIZE_BYTES: int = 50 * 1024 * 1024  # 50 MB
    MAX_UPLOAD_SIZE_BYTES: int = 50 * 1024 * 1024  # 50 MB
    ALLOWED_IMAGE_MIMES: List[str] = [
        "image/jpeg",
        "image/png",
        "image/webp",
        "image/svg+xml",
        "image/tiff",
    ]
    ALLOWED_VIDEO_MIMES: List[str] = [
        "video/mp4",
        "video/webm",
        "video/quicktime",
        "video/x-msvideo",
    ]
    ALLOWED_DOCUMENT_MIMES: List[str] = [
        "application/pdf",
        "text/plain",
        "text/csv",
        "application/json",
    ]

    @property
    def allowed_mime_types_list(self) -> List[str]:
        return self.ALLOWED_IMAGE_MIMES + self.ALLOWED_VIDEO_MIMES + self.ALLOWED_DOCUMENT_MIMES

    # AI Provider Settings

    AI_PROVIDER: str = "openrouter"  # Supported: "openrouter", "openai", "gemini"
    OPENROUTER_API_KEY: str = ""
    OPENAI_API_KEY: str = ""
    GEMINI_API_KEY: str = ""
    AI_MODEL: str = "inclusionai/ling-3.0-flash-vl:free"
    AI_REQUEST_TIMEOUT: int = 60

    model_config = SettingsConfigDict(
        env_file=os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), ".env"),
        env_file_encoding="utf-8",
        extra="ignore",
    )

    @property
    def cors_origins(self) -> List[str]:
        if not self.ALLOWED_ORIGINS:
            return ["http://localhost:5173"]
        return [origin.strip() for origin in self.ALLOWED_ORIGINS.split(",") if origin.strip()]

    @property
    def has_supabase_credentials(self) -> bool:
        """Returns True if valid Supabase URL and key are configured."""
        url = self.SUPABASE_URL.strip()
        key = self.SUPABASE_SERVICE_ROLE_KEY.strip()
        return bool(url and key and not url.startswith("https://your-project") and not key.startswith("your-service-role"))

    @property
    def has_ai_credentials(self) -> bool:
        """Returns True if the API key for the selected AI provider is configured."""
        provider = self.AI_PROVIDER.lower().strip()
        if provider == "openrouter":
            return bool(self.OPENROUTER_API_KEY.strip())
        elif provider == "openai":
            return bool(self.OPENAI_API_KEY.strip())
        elif provider == "gemini":
            return bool(self.GEMINI_API_KEY.strip())
        return False


settings = Settings()

