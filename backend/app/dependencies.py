from fastapi import HTTPException

from app.config import get_settings
from app.tutor import CodexCliProvider, OpenAIProvider, TutorProvider


def get_tutor_provider() -> TutorProvider:
    """Select the configured AI provider for routes that need a tutor."""
    settings = get_settings()
    if settings.tutor_provider == "openai":
        if not settings.openai_api_key:
            raise HTTPException(status_code=503, detail="OPENAI_API_KEY is not configured")
        return OpenAIProvider(settings)
    if settings.tutor_provider == "polza":
        if not settings.polza_api_key:
            raise HTTPException(status_code=503, detail="POLZA_API_KEY is not configured")
        return OpenAIProvider(
            settings,
            api_key=settings.polza_api_key,
            model=settings.polza_model,
            base_url=settings.polza_base_url,
        )
    if settings.tutor_provider == "codex":
        return CodexCliProvider(settings)
    raise HTTPException(status_code=500, detail="Unsupported TUTOR_PROVIDER")
