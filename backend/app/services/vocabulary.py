from datetime import datetime, timezone

from app.models import VocabularyItem
from app.schemas.vocabulary import VocabularyResponse


def build_vocabulary_response(
    item: VocabularyItem, lesson_title: str | None = None
) -> VocabularyResponse:
    now = datetime.now(timezone.utc)
    next_review_at = item.next_review_at
    if next_review_at is not None and next_review_at.tzinfo is None:
        next_review_at = next_review_at.replace(tzinfo=timezone.utc)
    due = next_review_at is None or next_review_at <= now
    return VocabularyResponse(
        id=item.id,
        lesson_id=item.lesson_id,
        mistake_id=item.mistake_id,
        word=item.word,
        translation=item.translation,
        example=item.example,
        review_count=item.review_count,
        interval_days=item.interval_days,
        next_review_at=next_review_at,
        is_due=due,
        is_saved=item.is_saved,
        lesson_title=lesson_title,
    )
