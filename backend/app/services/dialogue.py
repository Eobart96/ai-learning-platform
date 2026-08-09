import json
import re

from app.tutor import TutorAssessment


def is_save_progress_command(message: str) -> bool:
    normalized = " ".join(message.lower().strip().split())
    return normalized in {"сохрани прогресс", "сохранить прогресс", "save progress"}


def extract_dialogue_assessment(response: str) -> tuple[str, TutorAssessment | None]:
    """Strip the agent-only assessment marker and return its structured payload."""
    match = re.search(
        r"\s*<mistake-assessment>(\{.*?\})</mistake-assessment>\s*$",
        response,
        flags=re.DOTALL,
    )
    if match is None:
        return response.strip(), None
    visible_response = response[:match.start()].strip()
    try:
        assessment = TutorAssessment.model_validate(json.loads(match.group(1)))
    except (ValueError, TypeError, json.JSONDecodeError):
        return response.strip(), None
    return visible_response, assessment


def is_theory_request(message: str) -> bool:
    normalized = " ".join(message.lower().strip().split())
    return any(phrase in normalized for phrase in ("где теория", "покажи теорию", "объясни теорию", "объясни тему", "начнем урок", "начнём урок", "начать урок", "продолжим занятия"))


def is_practice_request(message: str) -> bool:
    normalized = " ".join(message.lower().strip().split())
    return any(phrase in normalized for phrase in ("готов к упражнению", "готов к практике", "давай упражнение", "давай практику", "перейдем к практике", "перейдём к практике", "практика"))


def normalize_exercise_answer(value: str) -> str:
    trimmed = value.lower().strip()
    while trimmed and trimmed[-1] in ".!?;:»”\"'":
        trimmed = trimmed[:-1].rstrip()
    while trimmed and trimmed[0] in "«“\"'":
        trimmed = trimmed[1:].lstrip()
    return " ".join(trimmed.split())
