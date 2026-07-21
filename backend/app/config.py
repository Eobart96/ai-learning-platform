from functools import lru_cache
from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict


PROJECT_ROOT = Path(__file__).resolve().parents[2]


class Settings(BaseSettings):
    """Runtime configuration loaded from environment variables or .env."""

    app_name: str = "AI Learning Platform"
    database_url: str = f"sqlite:///{PROJECT_ROOT / 'backend' / 'data' / 'app.db'}"
    course_path: Path = PROJECT_ROOT / "course-content" / "slovak-a1" / "course.yaml"

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")


@lru_cache
def get_settings() -> Settings:
    return Settings()
