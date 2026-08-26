from pathlib import Path

from app.config import Settings
from app.dependencies import get_tutor_provider
from app.main import app
import app.services.startup as startup_module
from app.tutor import TutorContext, build_tutor_context


class InteractiveTutorProvider:
    def __init__(self) -> None:
        self.prompts: list[str] = []

    def respond(self, context: TutorContext) -> str:
        self.prompts.append(context.prompt)
        prompt = context.prompt.lower()
        if "проведи один короткий шаг" in prompt:
            return (
                '{"reply":"Dobre, pokračujeme.","correction":null,'
                '"explanation":null,"next_question":"Ako sa voláte?",'
                '"suggestions":["Volám sa…","Ja som…"],'
                '"mistake_original":null,"mistake_corrected":null}'
            )
        if "генератор упражнений" in prompt:
            return '{"question":"Как поздороваться вежливо?","instruction":"Ответь по-словацки."}'
        if "составь короткий текст для чтения" in prompt:
            return (
                '{"title":"Приветствие","text":"Dobrý deň. Volám sa Anna. Teší ma.",'
                '"instruction":"Прочитай и перескажи текст."}'
            )
        if "проверь пересказ" in prompt:
            return '{"score":90,"feedback":"Содержание понято.","corrected_retelling":"Анна представилась."}'
        if "создай одно небольшое домашнее задание" in prompt:
            return (
                '{"title":"Представьтесь","description":"Напишите две фразы о себе.",'
                '"focus_category":"introductions"}'
            )
        if "проверь ответ" in prompt or "проверь домашнее задание" in prompt:
            return (
                '{"is_correct":true,"score":100,"corrected_answer":"Dobrý deň",'
                '"explanation":"Ответ принят.","next_exercise":"Продолжайте.",'
                '"mistake_category":null,"new_words":[]}'
            )
        raise AssertionError(f"Unexpected tutor prompt: {context.prompt[:120]}")


def _state_payload() -> dict[str, object]:
    return {
        "activeModule": 1,
        "selectedSlug": "greetings",
        "fontSize": "large",
        "progress": {"greetings": "in_progress"},
        "lessonSteps": {},
        "checkSelections": {},
        "practiceAnswers": {},
        "practiceResults": {},
        "mistakes": {},
        "finalSelections": {},
        "finalCompleted": False,
        "finalCompletedModules": {},
        "chatHistories": {},
        "lessonSummaries": {},
    }


def test_only_interactive_runtime_routes_are_exposed(client):
    assert client.get("/health").json() == {"status": "ok"}
    assert client.get("/ui/").status_code == 404
    assert client.get("/api/v1/courses").status_code == 404
    assert client.get("/api/v1/progress").status_code == 404
    assert client.get("/api/v1/tutor/settings").status_code == 200
    assert client.get("/api/v1/module1-beta/state").status_code == 200


def test_tutor_settings_save_provider_without_exposing_key(client):
    secret = "test-openai-key-never-return"
    response = client.put(
        "/api/v1/tutor/settings",
        json={"provider": "openai", "openai_api_key": secret, "openai_model": "gpt-5", "polza_model": "openai/gpt-4o-mini"},
    )

    assert response.status_code == 200
    assert response.json()["provider"] == "openai"
    assert response.json()["openai_api_key_configured"] is True
    assert secret not in response.text
    restored = client.get("/api/v1/tutor/settings")
    assert secret not in restored.text


def test_tutor_settings_require_key_and_allow_switching_back_to_codex(client):
    missing = client.put(
        "/api/v1/tutor/settings",
        json={"provider": "polza", "openai_model": "gpt-5", "polza_model": "openai/gpt-4o-mini"},
    )
    assert missing.status_code == 422
    assert "API-ключ" in missing.json()["detail"]

    codex = client.put(
        "/api/v1/tutor/settings",
        json={"provider": "codex", "openai_model": "gpt-5", "polza_model": "openai/gpt-4o-mini"},
    )
    assert codex.status_code == 200
    assert codex.json()["provider"] == "codex"


def test_module1_beta_state_round_trip_and_legacy_defaults(client):
    assert client.get("/api/v1/module1-beta/state").json()["exists"] is False

    saved = client.put("/api/v1/module1-beta/state", json=_state_payload())
    assert saved.status_code == 200
    assert saved.json()["state"]["selectedSlug"] == "greetings"

    restored = client.get("/api/v1/module1-beta/state")
    assert restored.json()["state"]["activeModule"] == 1

    legacy = _state_payload()
    legacy.pop("activeModule")
    legacy.pop("finalCompletedModules")
    accepted = client.put("/api/v1/module1-beta/state", json=legacy)
    assert accepted.status_code == 200
    assert accepted.json()["state"]["activeModule"] == 1
    assert accepted.json()["state"]["finalCompletedModules"] == {}


def test_compatibility_startup_preserves_beta_progress(client):
    saved = client.put("/api/v1/module1-beta/state", json=_state_payload())
    assert saved.status_code == 200

    startup_module.initialize_application()

    restored = client.get("/api/v1/module1-beta/state")
    assert restored.status_code == 200
    assert restored.json()["state"]["selectedSlug"] == "greetings"


def test_module1_tutor_chat_uses_structured_contract(client):
    provider = InteractiveTutorProvider()
    app.dependency_overrides[get_tutor_provider] = lambda: provider

    response = client.post(
        "/api/v1/tutor/module1-chat",
        json={
            "lesson_slug": "greetings",
            "lesson_title": "Приветствия",
            "goals": ["Поздороваться"],
            "theory": "Dobrý deň.",
            "known_mistakes": [],
            "history": [],
            "message": "Продолжим",
            "current_task": "Ako sa voláte?",
            "interaction_kind": "continue",
        },
    )

    assert response.status_code == 200
    assert response.json()["next_question"] == "Ako sa voláte?"
    assert "Тип реплики ученика: continue" in provider.prompts[0]


def test_module1_exercise_lifecycle(client):
    app.dependency_overrides[get_tutor_provider] = InteractiveTutorProvider
    created = client.post(
        "/api/v1/module1-beta/exercises",
        json={"lesson_slug": "greetings", "lesson_title": "Приветствия", "theory": "Dobrý deň."},
    )
    assert created.status_code == 200
    exercise_id = created.json()["id"]

    checked = client.post(
        f"/api/v1/module1-beta/exercises/{exercise_id}/answer",
        json={"answer": "Dobrý deň"},
    )
    assert checked.status_code == 200
    assert checked.json()["is_correct"] is True
    assert client.get("/api/v1/module1-beta/exercises?lesson_slug=greetings").json()[0]["latest_attempt"] is not None
    assert client.delete(f"/api/v1/module1-beta/exercises/{exercise_id}").json() == {"deleted": True}


def test_module1_reading_lifecycle(client):
    app.dependency_overrides[get_tutor_provider] = InteractiveTutorProvider
    created = client.post(
        "/api/v1/module1-beta/readings",
        json={
            "lesson_slug": "greetings",
            "lesson_title": "Приветствия",
            "theory": "Dobrý deň.",
            "completed_theory": "",
        },
    )
    assert created.status_code == 200
    reading_id = created.json()["id"]

    checked = client.post(
        f"/api/v1/module1-beta/readings/{reading_id}/check",
        json={"retelling": "Анна представилась."},
    )
    assert checked.status_code == 200
    assert checked.json()["score"] == 90
    assert client.get("/api/v1/module1-beta/readings").json()[0]["latest_attempt"] is not None
    assert client.delete(f"/api/v1/module1-beta/readings/{reading_id}").json() == {"deleted": True}


def test_module1_vocabulary_sync_and_review(client):
    synced = client.put(
        "/api/v1/module1-beta/vocabulary/sync",
        json={
            "items": [
                {
                    "lesson_slug": "greetings",
                    "lesson_title": "Приветствия",
                    "word": "Dobrý deň",
                    "translation": "Добрый день",
                    "example": "Dobrý deň, Anna.",
                }
            ]
        },
    )
    assert synced.status_code == 200
    item_id = synced.json()[0]["id"]

    reviewed = client.post(f"/api/v1/module1-beta/vocabulary/{item_id}/review")
    assert reviewed.status_code == 200
    assert reviewed.json()["review_count"] == 1
    assert reviewed.json()["interval_days"] == 1


def test_module1_homework_lifecycle(client):
    app.dependency_overrides[get_tutor_provider] = InteractiveTutorProvider
    created = client.post(
        "/api/v1/module1-beta/homework",
        json={
            "lesson_slug": "introductions",
            "lesson_title": "Представление",
            "theory": "Volám sa…",
            "known_mistakes": [],
        },
    )
    assert created.status_code == 200
    homework_id = created.json()["id"]

    submitted = client.post(
        f"/api/v1/module1-beta/homework/{homework_id}/submit",
        json={"answer": "Volám sa Anna."},
    )
    assert submitted.status_code == 200
    assert submitted.json()["is_correct"] is True
    assert client.get("/api/v1/module1-beta/homework").json()[0]["latest_attempt"] is not None
    assert client.delete(f"/api/v1/module1-beta/homework/{homework_id}").json() == {"deleted": True}


def test_tutor_context_keeps_private_profile_local(tmp_path: Path):
    project_root = Path(__file__).parents[2]
    local_profile = tmp_path / ".ai" / "private" / "student_profile.local.md"
    local_profile.parent.mkdir(parents=True)
    local_profile.write_text("Локальная настройка ученика.", encoding="utf-8")
    settings = Settings(
        project_root=tmp_path,
        learning_path=project_root / "course-content" / "slovak-a1" / "learning",
    )

    context = build_tutor_context(settings, "Начнём урок")

    assert "Локальная настройка ученика." in context.prompt
    assert "Это публичный пример профиля" not in context.prompt
