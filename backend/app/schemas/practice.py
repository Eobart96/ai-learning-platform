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
