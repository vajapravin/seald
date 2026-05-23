"""Application configuration loaded from environment variables / .env file."""

from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    # App
    APP_NAME: str = "Seald API"
    APP_VERSION: str = "0.6.0"
    DEBUG: bool = False
    API_V1_PREFIX: str = "/api/v1"

    # CORS (comma-separated list of allowed origins)
    CORS_ORIGINS: str = "http://frontend:3000"

    # Supabase
    SUPABASE_URL: str = ""
    SUPABASE_ANON_KEY: str = ""
    SUPABASE_SERVICE_ROLE_KEY: str = ""

    # Encryption (comma-separated Fernet keys; first = active, rest = legacy for rotation)
    ENCRYPTION_KEYS: str = ""

    # Storage backend: "supabase" or "memory" (tests, offline dev)
    STORAGE_BACKEND: str = "supabase"

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    @property
    def cors_origins_list(self) -> list[str]:
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",") if origin.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()
