import json
from pathlib import Path
from typing import TYPE_CHECKING, Any

from app.schemas.tutor import TutorSettingsUpdate

if TYPE_CHECKING:
    from app.config import Settings


_ALLOWED_FIELDS = {
    "tutor_provider",
    "openai_api_key",
    "openai_model",
    "polza_api_key",
    "polza_model",
}


def settings_file(settings: "Settings") -> Path:
    return settings.project_root / "backend" / "data" / "ai_settings.json"


def apply_saved_tutor_settings(settings: "Settings") -> None:
    path = settings_file(settings)
    if not path.is_file():
        return
    try:
        payload = json.loads(path.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError):
        return
    if not isinstance(payload, dict):
        return
    for field in _ALLOWED_FIELDS:
        value = payload.get(field)
        if isinstance(value, str) and value.strip():
            if field == "tutor_provider" and value not in {"codex", "openai", "polza"}:
                continue
            setattr(settings, field, value.strip())


def update_tutor_settings(settings: "Settings", request: TutorSettingsUpdate) -> None:
    openai_key = _updated_key(settings.openai_api_key, request.openai_api_key, request.clear_openai_api_key)
    polza_key = _updated_key(settings.polza_api_key, request.polza_api_key, request.clear_polza_api_key)
    if request.provider == "openai" and not openai_key:
        raise ValueError("Для OpenAI укажите API-ключ")
    if request.provider == "polza" and not polza_key:
        raise ValueError("Для Polza укажите API-ключ")

    settings.tutor_provider = request.provider
    settings.openai_api_key = openai_key
    settings.openai_model = request.openai_model.strip()
    settings.polza_api_key = polza_key
    settings.polza_model = request.polza_model.strip()
    _write_settings(settings)


def _updated_key(current: str | None, supplied: str | None, clear: bool) -> str | None:
    if clear:
        return None
    normalized = supplied.strip() if supplied else ""
    return normalized or current


def _write_settings(settings: "Settings") -> None:
    path = settings_file(settings)
    path.parent.mkdir(parents=True, exist_ok=True)
    payload: dict[str, Any] = {
        "tutor_provider": settings.tutor_provider,
        "openai_api_key": settings.openai_api_key,
        "openai_model": settings.openai_model,
        "polza_api_key": settings.polza_api_key,
        "polza_model": settings.polza_model,
    }
    temporary = path.with_suffix(".tmp")
    temporary.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    temporary.replace(path)
