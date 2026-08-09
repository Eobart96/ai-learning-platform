from pydantic import BaseModel

from app.tutor import TutorAssessment


class HomeworkGenerateRequest(BaseModel):
    lesson_id: int


class HomeworkResponse(BaseModel):
    id: int
    lesson_id: int
    title: str
    description: str
    status: str
    score: int | None
    focus_category: str | None
    mistake_id: int | None = None
    submitted_answer: str | None = None
    ai_feedback: str | None = None


class HomeworkSubmitRequest(BaseModel):
    answer: str


class HomeworkSubmitResponse(HomeworkResponse):
    assessment: TutorAssessment
