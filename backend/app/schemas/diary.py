from datetime import datetime

from pydantic import BaseModel, Field

from app.tutor import VocabularyWord


class DiaryPromptResponse(BaseModel):
    prompt: str
    lesson_id: int | None
    lesson_title: str | None
    has_entry_today: bool


class DiaryEntryRequest(BaseModel):
    prompt: str
    answer: str
    lesson_id: int | None = None


class DiaryEntryResponse(BaseModel):
    id: int
    prompt: str
    original_text: str
    corrected_text: str
    explanation: str
    is_correct: bool
    score: int
    mistake_id: int | None
    created_at: datetime
    new_words: list[VocabularyWord] = Field(default_factory=list)


class DiaryWeeklySummaryResponse(BaseModel):
    period_days: int
    entries_count: int
    average_score: float | None
    mistakes_count: int
    new_words_count: int
