import json

from app.models import DiaryEntry
from app.schemas.diary import DiaryEntryResponse
from app.tutor import VocabularyWord


def build_diary_response(entry: DiaryEntry) -> DiaryEntryResponse:
    saved_words: list[VocabularyWord] = []
    if entry.ai_feedback:
        try:
            payload = json.loads(entry.ai_feedback)
            saved_words = [
                VocabularyWord.model_validate(word)
                for word in payload.get("new_words", [])
            ]
        except (ValueError, TypeError, json.JSONDecodeError):
            saved_words = []
    return DiaryEntryResponse(
        id=entry.id,
        prompt=entry.prompt,
        original_text=entry.original_text,
        corrected_text=entry.corrected_text,
        explanation=entry.explanation,
        is_correct=entry.is_correct,
        score=entry.score,
        mistake_id=entry.mistake_id,
        created_at=entry.created_at,
        new_words=saved_words,
    )
