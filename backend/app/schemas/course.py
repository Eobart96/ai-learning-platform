from datetime import datetime
from typing import Any

from pydantic import BaseModel, Field


class CourseStatePayload(BaseModel):
    activeModule: int = Field(default=1, ge=1, le=8)
    selectedSlug: str | None = Field(default=None, max_length=100)
    fontSize: str = Field(default="large", pattern="^(normal|large|extra-large)$")
    progress: dict[str, str] = Field(default_factory=dict)
    lessonSteps: dict[str, int] = Field(default_factory=dict)
    checkSelections: dict[str, str] = Field(default_factory=dict)
    practiceAnswers: dict[str, str] = Field(default_factory=dict)
    practiceResults: dict[str, bool] = Field(default_factory=dict)
    mistakes: dict[str, dict[str, Any]] = Field(default_factory=dict)
    finalSelections: dict[str, str] = Field(default_factory=dict)
    finalCompleted: bool = False
    finalCompletedModules: dict[str, bool] = Field(default_factory=dict)
    chatHistories: dict[str, list[dict[str, Any]]] = Field(default_factory=dict)
    lessonSummaries: dict[str, dict[str, Any]] = Field(default_factory=dict)


class CourseStateResponse(BaseModel):
    exists: bool
    schema_version: int = 1
    state: CourseStatePayload | None = None
    updated_at: datetime | None = None


class CourseExerciseGenerateRequest(BaseModel):
    lesson_slug: str = Field(min_length=1, max_length=100)
    lesson_title: str = Field(min_length=1, max_length=255)
    theory: str = Field(min_length=1, max_length=12_000)


class CourseExerciseAnswerRequest(BaseModel):
    answer: str = Field(min_length=1, max_length=4_000)


class CourseExerciseAttemptResponse(BaseModel):
    id: int
    answer: str
    is_correct: bool
    score: int
    corrected_answer: str
    explanation: str
    next_exercise: str
    created_at: datetime


class CourseExerciseResponse(BaseModel):
    id: int
    lesson_slug: str
    lesson_title: str
    question: str
    instruction: str
    created_at: datetime
    latest_attempt: CourseExerciseAttemptResponse | None = None


class CourseReadingGenerateRequest(BaseModel):
    lesson_slug: str = Field(min_length=1, max_length=100)
    lesson_title: str = Field(min_length=1, max_length=255)
    theory: str = Field(min_length=1, max_length=12_000)
    completed_theory: str = Field(default="", max_length=30_000)


class CourseReadingCheckRequest(BaseModel):
    retelling: str = Field(min_length=1, max_length=4_000)


class CourseReadingCheckResult(BaseModel):
    score: int
    feedback: str
    corrected_retelling: str


class CourseReadingAttemptResponse(BaseModel):
    id: int
    retelling: str
    score: int
    feedback: str
    corrected_retelling: str
    created_at: datetime


class CourseReadingResponse(BaseModel):
    id: int
    lesson_slug: str
    lesson_title: str
    title: str
    text: str
    instruction: str
    created_at: datetime
    latest_attempt: CourseReadingAttemptResponse | None = None


class CourseVocabularySeedItem(BaseModel):
    lesson_slug: str = Field(min_length=1, max_length=100)
    lesson_title: str = Field(min_length=1, max_length=255)
    word: str = Field(min_length=1, max_length=255)
    translation: str = Field(min_length=1, max_length=500)
    example: str | None = Field(default=None, max_length=2_000)


class CourseVocabularySyncRequest(BaseModel):
    items: list[CourseVocabularySeedItem] = Field(max_length=500)


class CourseVocabularyResponse(BaseModel):
    id: int
    lesson_slug: str
    lesson_title: str
    word: str
    translation: str
    example: str | None
    review_count: int
    interval_days: int
    next_review_at: datetime | None
    is_due: bool


class CourseHomeworkGenerateRequest(BaseModel):
    lesson_slug: str = Field(min_length=1, max_length=100)
    lesson_title: str = Field(min_length=1, max_length=255)
    theory: str = Field(min_length=1, max_length=12_000)
    known_mistakes: list[str] = Field(default_factory=list, max_length=20)


class CourseHomeworkSubmitRequest(BaseModel):
    answer: str = Field(min_length=1, max_length=4_000)


class CourseHomeworkAttemptResponse(BaseModel):
    id: int
    answer: str
    is_correct: bool
    score: int
    corrected_answer: str
    explanation: str
    next_exercise: str
    created_at: datetime


class CourseHomeworkResponse(BaseModel):
    id: int
    lesson_slug: str
    lesson_title: str
    title: str
    description: str
    focus_category: str
    created_at: datetime
    latest_attempt: CourseHomeworkAttemptResponse | None = None
