from datetime import datetime

from pydantic import BaseModel


class VocabularyResponse(BaseModel):
    id: int
    lesson_id: int | None = None
    mistake_id: int | None
    word: str
    translation: str
    example: str | None
    review_count: int
    interval_days: int
    next_review_at: datetime | None
    is_due: bool
    is_saved: bool
    lesson_title: str | None = None


class VocabularyReviewResponse(VocabularyResponse):
    reviewed: bool
