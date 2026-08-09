from pydantic import BaseModel, Field


class ProgressResponse(BaseModel):
    completed_lessons: int
    total_attempts: int
    total_answers: int
    total_mistakes: int
    resolved_mistakes: int
    average_score: float | None


class MistakeResponse(BaseModel):
    id: int
    lesson_id: int | None
    lesson_title: str | None
    source: str
    category: str
    original_answer: str
    corrected_answer: str
    explanation: str
    mistake_count: int
    practice_count: int


class MistakeChatRequest(BaseModel):
    message: str = Field(min_length=1, max_length=2_000)


class MistakeChatResponse(BaseModel):
    response: str
