from typing import Literal

from pydantic import BaseModel, Field

from app.tutor import TutorAssessment


class ExerciseResponse(BaseModel):
    id: int
    type: str
    question: str
    instruction: str | None
    submitted_answer: str | None = None
    is_completed: bool = False
    is_resolved: bool = False
    score: int | None = None
    expected_output: str | None = None
    test_cases: list[dict[str, str]] = Field(default_factory=list)
    hint: str | None = None
    explanation: str | None = None


class LessonResponse(BaseModel):
    id: int
    slug: str
    title: str
    theory: str | None
    exercises: list[ExerciseResponse]
    generated_exercises: list[ExerciseResponse]


class LessonAnswerRequest(BaseModel):
    exercise_id: int
    answer: str


class LessonAnswerResponse(BaseModel):
    attempt_id: int
    answer_id: int
    provider: str
    assessment: TutorAssessment
    mistake_id: int | None


class MathTutorChatRequest(BaseModel):
    message: str = Field(min_length=1, max_length=2_000)


class MathTutorChatResponse(BaseModel):
    response: str


class ExerciseChatMessage(BaseModel):
    role: Literal["user", "assistant"]
    content: str = Field(min_length=1, max_length=2_000)


class ExerciseChatRequest(BaseModel):
    exercise_id: int
    message: str = Field(min_length=1, max_length=2_000)
    draft_answer: str = Field(default="", max_length=4_000)
    history: list[ExerciseChatMessage] = Field(default_factory=list, max_length=6)


class ExerciseChatResponse(BaseModel):
    response: str


class ReadingGenerateRequest(BaseModel):
    lesson_id: int | None = None


class ReadingGenerateResponse(BaseModel):
    title: str
    text: str
    instruction: str


class ReadingCheckRequest(BaseModel):
    text: str = Field(min_length=20, max_length=8_000)
    retelling: str = Field(min_length=1, max_length=4_000)


class ReadingCheckResponse(BaseModel):
    score: int
    feedback: str
    corrected_retelling: str
