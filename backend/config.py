"""
Application configuration using pydantic-settings.
Reads all settings from environment variables / .env file.
"""

from functools import lru_cache
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Centralised application configuration.

    All values are loaded from environment variables (case-insensitive).
    A `.env` file in the backend directory is loaded automatically.
    """

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    # ------------------------------------------------------------------ #
    # Database
    # ------------------------------------------------------------------ #
    database_url: str = "sqlite:///./resqai.db"

    # ------------------------------------------------------------------ #
    # Security / JWT
    # ------------------------------------------------------------------ #
    secret_key: str = "resqai-super-secret-key-change-in-production-2024"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 10080  # 7 days

    # ------------------------------------------------------------------ #
    # Application
    # ------------------------------------------------------------------ #
    environment: str = "development"
    app_title: str = "ResQAI API"
    app_version: str = "1.0.0"
    app_description: str = (
        "ResQAI — Disaster Intelligence & Response Platform for India. "
        "Provides real-time incident tracking, SOS reporting, AI predictions, "
        "shelter management, resource allocation, and rescue team coordination."
    )

    # ------------------------------------------------------------------ #
    # CORS
    # ------------------------------------------------------------------ #
    allowed_origins: str = "http://localhost:5173,http://localhost:3000"

    @property
    def cors_origins(self) -> list[str]:
        """Return allowed origins as a list."""
        return [o.strip() for o in self.allowed_origins.split(",") if o.strip()]

    # ------------------------------------------------------------------ #
    # File Uploads
    # ------------------------------------------------------------------ #
    upload_dir: str = "uploads"
    max_upload_size_mb: int = 10  # Maximum file size in MB

    # ------------------------------------------------------------------ #
    # OpenRouter AI
    # ------------------------------------------------------------------ #
    openrouter_api_key: str = ""
    openrouter_model: str = "nvidia/llama-nemotron-rerank-vl-1b-v2:free"

    # ------------------------------------------------------------------ #
    # Computed helpers
    # ------------------------------------------------------------------ #

    @property
    def is_production(self) -> bool:
        return self.environment.lower() == "production"

    @property
    def is_sqlite(self) -> bool:
        return self.database_url.startswith("sqlite")


@lru_cache
def get_settings() -> Settings:
    """Return a cached Settings instance (created once per process)."""
    return Settings()
