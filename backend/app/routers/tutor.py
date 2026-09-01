import json

from fastapi import APIRouter, Depends, HTTPException
from pydantic import ValidationError

from app.config import get_settings
from app.dependencies import get_tutor_provider
from app.schemas.tutor import (
    TutorChatRequest,
    TutorChatResponse,
    CodexLoginResponse,
    TutorSettingsResponse,
    TutorSettingsUpdate,
)
from app.services.tutor_settings import update_tutor_settings
from app.tutor import (
    TutorProvider,
    build_tutor_context,
    get_codex_connection_status,
    start_codex_login,
)


router = APIRouter(tags=["tutor"])


def _settings_response() -> TutorSettingsResponse:
    settings = get_settings()
    codex = get_codex_connection_status(settings)
    return TutorSettingsResponse(
        provider=settings.tutor_provider,
        codex_installed=codex.installed,
        codex_authenticated=codex.authenticated,
        codex_message=codex.message,
        openai_api_key_configured=bool(settings.openai_api_key),
        openai_model=settings.openai_model,
        polza_api_key_configured=bool(settings.polza_api_key),
        polza_model=settings.polza_model,
        polza_base_url=settings.polza_base_url,
    )


@router.get("/api/v1/tutor/settings", response_model=TutorSettingsResponse)
def get_tutor_settings() -> TutorSettingsResponse:
    return _settings_response()


@router.put("/api/v1/tutor/settings", response_model=TutorSettingsResponse)
def put_tutor_settings(request: TutorSettingsUpdate) -> TutorSettingsResponse:
    try:
        update_tutor_settings(get_settings(), request)
    except ValueError as error:
        raise HTTPException(status_code=422, detail=str(error)) from error
    return _settings_response()


@router.post("/api/v1/tutor/codex-login", response_model=CodexLoginResponse)
def codex_login() -> CodexLoginResponse:
    try:
        status = start_codex_login(get_settings())
    except RuntimeError as error:
        raise HTTPException(status_code=503, detail=str(error)) from error
    return CodexLoginResponse(installed=status.installed, authenticated=status.authenticated, message=status.message)


@router.post("/api/v1/tutor/module1-chat", response_model=TutorChatResponse)
def module1_chat(
    request: TutorChatRequest,
    provider: TutorProvider = Depends(get_tutor_provider),
) -> TutorChatResponse:
    history = "\n".join(f"{item.role}: {item.content}" for item in request.history[-6:]) or "Диалог только начинается."
    known_mistakes = "; ".join(request.known_mistakes) or "нет"
    current_task = request.current_task or "явное задание отсутствует — опирайся на историю"
    turn_instruction = "Заверши практику доброжелательной итоговой репликой, не задавай следующий вопрос; next_question должен быть null, suggestions — пустым списком." if request.is_final_turn else "Задай не более одного следующего вопроса."
    interaction_instruction = {
        "answer": "Это учебный ответ. Проверь его строго относительно текущего задания и только после проверки дай следующий шаг.",
        "clarification": "Это просьба объяснить, а не учебный ответ. Не оценивай её и не меняй задание: next_question должен дословно повторить текущее задание.",
        "continue": "Это служебная просьба продолжить, а не учебный ответ. Не засчитывай её и не создавай новое задание: кратко напомни, что нужно ответить, а next_question должен дословно повторить текущее задание.",
    }[request.interaction_kind]
    prompt = f"""Проведи один короткий шаг разговорной практики словацкого языка.

Тема: {request.lesson_title} ({request.lesson_slug})
Цели: {'; '.join(request.goals)}
Известные ошибки: {known_mistakes}
Материал темы:
{request.theory}

Последние сообщения:
{history}
Текущее явно заданное задание: {current_task}
Тип реплики ученика: {request.interaction_kind}
Ученик: {request.message}

Правила:
- оставайся строго в рамках темы;
- основная реплика и следующий вопрос — преимущественно по-словацки;
- если есть ошибка, дай исправление и короткое объяснение по-русски;
- оценивай ответ только относительно последнего явно заданного вопроса в истории;
- {interaction_instruction}
- используй материал темы как источник истины; не придумывай правила, исключения или исправления, которых он не подтверждает;
- если фраза ученика грамматически верна, но отвечает на другую ситуацию, прямо скажи, что фраза верна, и одним предложением по-русски повтори требуемое действие;
- если ученик пишет, что не понимает задание или спрашивает, что нужно делать, не оценивай это как языковой ответ: объясни задание по-русски в одном коротком предложении, дай один пример и продолжи тот же шаг;
- не завершай практику и не подводи итог после просьбы объяснить задание;
- next_question формулируй как одно конкретное действие ученика; не объединяй несколько заданий;
- если next_question не null, suggestions должны содержать 2–3 короткие словацкие опоры именно к этому заданию: начало ответа или ключевую конструкцию, но не посторонние фразы;
- если next_question равен null, верни suggestions как пустой список;
- {turn_instruction}
- верни только JSON без markdown.

JSON-схема:
{{"reply":"реплика преподавателя","correction":null,"explanation":null,"next_question":"одно действие или null","suggestions":["короткая опора 1","короткая опора 2"],"mistake_original":null,"mistake_corrected":null}}
"""
    try:
        raw = provider.respond(build_tutor_context(get_settings(), prompt)).strip()
        if raw.startswith("```"):
            raw = raw.removeprefix("```json").removeprefix("```").removesuffix("```").strip()
        if not raw.startswith("{") and "{" in raw and "}" in raw:
            raw = raw[raw.find("{"):raw.rfind("}") + 1]
        payload = json.loads(raw)
        return TutorChatResponse(provider=get_settings().tutor_provider, **payload)
    except (json.JSONDecodeError, ValidationError) as error:
        raise HTTPException(status_code=502, detail="Codex вернул ответ в неверном формате") from error
    except (FileNotFoundError, RuntimeError, TimeoutError) as error:
        raise HTTPException(status_code=503, detail=f"Tutor provider unavailable: {error}") from error
