from functools import lru_cache
from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict


PROJECT_ROOT = Path(__file__).resolve().parents[2]


class Settings(BaseSettings):
    """Runtime configuration loaded from environment variables or .env."""

    app_name: str = "SlovoKrok"
    database_url: str = f"sqlite:///{PROJECT_ROOT / 'backend' / 'data' / 'app.db'}"
    learning_path: Path = PROJECT_ROOT / "course-content" / "slovak-a1" / "learning"
    project_root: Path = PROJECT_ROOT
    tutor_provider: str = "codex"
    codex_command: str = "codex.cmd"
    tutor_timeout_seconds: int = 120
    openai_api_key: str | None = None
    openai_model: str = "gpt-5"
    polza_api_key: str | None = None
    polza_model: str = "openai/gpt-4o-mini"
    polza_base_url: str = "https://polza.ai/api/v1"

    model_config = SettingsConfigDict(env_file=PROJECT_ROOT / ".env", env_file_encoding="utf-8", extra="ignore")

@lru_cache
def get_settings() -> Settings:
    settings = Settings()
    from app.services.tutor_settings import apply_saved_tutor_settings

    apply_saved_tutor_settings(settings)
    return settings
