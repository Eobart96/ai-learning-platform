from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import get_tutor_provider
from app.models import Course, LessonAttempt, Mistake, UserAnswer
from app.schemas.progress import MistakeChatRequest, MistakeChatResponse, MistakeResponse, ProgressResponse
from app.services.lesson_lookup import get_lesson_title
from app.tutor import TutorProvider, build_mistake_chat_context


router = APIRouter(tags=["progress"])


@router.get("/api/v1/progress", response_model=ProgressResponse)
def get_progress(db: Session = Depends(get_db)) -> ProgressResponse:
    completed_lessons = db.scalar(
        select(func.count(func.distinct(LessonAttempt.lesson_id))).where(
            LessonAttempt.completed.is_(True)
        )
    )
    total_attempts = db.scalar(select(func.count(LessonAttempt.id)))
    total_answers = db.scalar(select(func.count(UserAnswer.id)))
    total_mistakes = db.scalar(select(func.count(Mistake.id)))
    resolved_mistakes = db.scalar(
        select(func.count(Mistake.id)).where(Mistake.resolved.is_(True))
    )
    average_score = db.scalar(select(func.avg(LessonAttempt.score)))
    return ProgressResponse(
        completed_lessons=completed_lessons or 0,
        total_attempts=total_attempts or 0,
        total_answers=total_answers or 0,
        total_mistakes=total_mistakes or 0,
        resolved_mistakes=resolved_mistakes or 0,
        average_score=round(float(average_score), 2) if average_score is not None else None,
    )


def _course_or_404(db: Session, course_slug: str) -> Course:
    course = db.scalar(select(Course).where(Course.slug == course_slug))
    if course is None:
        raise HTTPException(status_code=404, detail="Course not found")
    return course


def _mistake_for_course_or_404(db: Session, mistake_id: int, course_slug: str) -> Mistake:
    course = _course_or_404(db, course_slug)
    mistake = db.scalar(
        select(Mistake).where(Mistake.id == mistake_id, Mistake.course_id == course.id)
    )
    if mistake is None:
        raise HTTPException(status_code=404, detail="Mistake not found for this course")
    return mistake


@router.get("/api/v1/progress/mistakes", response_model=list[MistakeResponse])
def get_mistakes(course_slug: str = "slovak-a1", db: Session = Depends(get_db)) -> list[MistakeResponse]:
    course = _course_or_404(db, course_slug)
    statement = select(Mistake).where(
        Mistake.resolved.is_(False), Mistake.course_id == course.id
    )
    mistakes = db.scalars(
        statement.order_by(Mistake.mistake_count.desc(), Mistake.id)
    ).all()
    return [
        MistakeResponse(
            id=mistake.id,
            lesson_id=mistake.lesson_id,
            lesson_title=get_lesson_title(db, mistake.lesson_id),
            source=mistake.source,
            category=mistake.category,
            original_answer=mistake.original_answer,
            corrected_answer=mistake.corrected_answer,
            explanation=mistake.explanation,
            mistake_count=mistake.mistake_count,
            practice_count=mistake.practice_count,
        )
        for mistake in mistakes
    ]


@router.post("/api/v1/progress/mistakes/{mistake_id}/practice", response_model=MistakeResponse)
def start_mistake_practice(
    mistake_id: int,
    course_slug: str = "slovak-a1",
    db: Session = Depends(get_db),
) -> MistakeResponse:
    mistake = _mistake_for_course_or_404(db, mistake_id, course_slug)
    mistake.practice_count += 1
    db.commit()
    db.refresh(mistake)
    return _mistake_response(db, mistake)


@router.post(
    "/api/v1/progress/mistakes/{mistake_id}/chat",
    response_model=MistakeChatResponse,
)
def chat_about_mistake(
    mistake_id: int,
    request: MistakeChatRequest,
    course_slug: str = "slovak-a1",
    db: Session = Depends(get_db),
    provider: TutorProvider = Depends(get_tutor_provider),
) -> MistakeChatResponse:
    mistake = _mistake_for_course_or_404(db, mistake_id, course_slug)
    context = build_mistake_chat_context(
        category=mistake.category,
        lesson_title=get_lesson_title(db, mistake.lesson_id),
        original_answer=mistake.original_answer,
        corrected_answer=mistake.corrected_answer,
        explanation=mistake.explanation,
        user_message=request.message,
    )
    try:
        response = provider.respond(context).strip()
    except (FileNotFoundError, RuntimeError, TimeoutError) as error:
        raise HTTPException(status_code=503, detail=f"Mistake chat unavailable: {error}") from error
    if not response:
        raise HTTPException(status_code=502, detail="Mistake chat returned an empty response")
    return MistakeChatResponse(response=response)


@router.post("/api/v1/progress/mistakes/{mistake_id}/resolve", response_model=MistakeResponse)
def resolve_mistake(
    mistake_id: int,
    course_slug: str = "slovak-a1",
    db: Session = Depends(get_db),
) -> MistakeResponse:
    mistake = _mistake_for_course_or_404(db, mistake_id, course_slug)
    mistake.resolved = True
    db.commit()
    db.refresh(mistake)
    return _mistake_response(db, mistake)


def _mistake_response(db: Session, mistake: Mistake) -> MistakeResponse:
    return MistakeResponse(
        id=mistake.id,
        lesson_id=mistake.lesson_id,
        lesson_title=get_lesson_title(db, mistake.lesson_id),
        source=mistake.source,
        category=mistake.category,
        original_answer=mistake.original_answer,
        corrected_answer=mistake.corrected_answer,
        explanation=mistake.explanation,
        mistake_count=mistake.mistake_count,
        practice_count=mistake.practice_count,
    )
