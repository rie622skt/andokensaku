from __future__ import annotations

from pathlib import Path

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    google_cse_api_key: str = Field(..., alias="GOOGLE_CSE_API_KEY")
    google_cse_cx: str = Field(..., alias="GOOGLE_CSE_CX")

    daily_quota: int = Field(100, alias="GOOGLE_CSE_DAILY_QUOTA")
    cache_db_path: Path = Field(
        Path(".cache/cse.db"), alias="MCP_CACHE_DB_PATH"
    )
    request_timeout_sec: float = Field(15.0, alias="MCP_REQUEST_TIMEOUT_SEC")


_settings: Settings | None = None


def get_settings() -> Settings:
    global _settings
    if _settings is None:
        _settings = Settings()  # type: ignore[call-arg]
    return _settings
