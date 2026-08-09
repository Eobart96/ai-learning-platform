import json
from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.config import get_settings
from app.database import get_db
from app.dependencies import get_tutor_provider
from app.models import Course, DiaryEntry, Lesson, LessonAttempt, Mistake, Module, VocabularyItem
from app.schemas.diary import (
    DiaryEntryRequest,
    DiaryEntryResponse,
    DiaryPromptResponse,
    DiaryWeeklySummaryResponse,
)
from app.services.diary import build_diary_response
from app.services.learning_state import record_mistake, save_vocabulary
from app.tutor import TutorProvider, build_tutor_context, parse_tutor_assessment

router = APIRouter(tags=["diary"])


def _first_incomplete_lesson(db: Session) -> Lesson | None:
    ordered_lessons = db.scalars(
        select(Lesson)
        .join(Module, Lesson.module_id == Module.id)
        .join(Course, Module.course_id == Course.id)
        .where(Course.slug == "slovak-a1")
        .order_by(Module.order_number, Lesson.order_number, Lesson.id)
    ).all()
    completed_lesson_ids = {
        lesson_id
        for lesson_id in db.scalars(
            select(LessonAttempt.lesson_id).where(LessonAttempt.completed.is_(True))
        ).all()
    }
    return next(
        (lesson for lesson in ordered_lessons if lesson.id not in completed_lesson_ids),
        None,
    )


@router.get("/api/v1/diary/today", response_model=DiaryPromptResponse)
def get_diary_prompt(db: Session = Depends(get_db)) -> DiaryPromptResponse:
    lesson = _first_incomplete_lesson(db)
    course = db.scalar(select(Course).order_by(Course.id))
    now = datetime.now(timezone.utc)
    day_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
    has_entry = bool(
        course
        and db.scalar(
            select(DiaryEntry.id).where(
                DiaryEntry.course_id == course.id,
                DiaryEntry.created_at >= day_start,
            )
        )
    )
    lesson_title = lesson.title if lesson else None
    prompt = (
        f"Напиши 3–5 простых предложений по-словацки о сегодняшнем дне. "
        f"Используй тему «{lesson_title}»."
        if lesson_title
        else "Напиши 3–5 простых предложений по-словацки о сегодняшнем дне."
    )
    return DiaryPromptResponse(
        prompt=prompt,
        lesson_id=lesson.id if lesson else None,
        lesson_title=lesson_title,
        has_entry_today=has_entry,
    )


@router.post("/api/v1/diary/entries", response_model=DiaryEntryResponse)
def create_diary_entry(
    request: DiaryEntryRequest,
    db: Session = Depends(get_db),
    provider: TutorProvider = Depends(get_tutor_provider),
) -> DiaryEntryResponse:
    if not request.answer.strip():
        raise HTTPException(status_code=422, detail="Answer must not be empty")
    course = db.scalar(select(Course).order_by(Course.id))
    if course is None:
        raise HTTPException(status_code=404, detail="Course not found")
    lesson = None
    if request.lesson_id is not None:
        lesson = db.scalar(select(Lesson).where(Lesson.id == request.lesson_id))
        if lesson is None:
            raise HTTPException(status_code=404, detail="Lesson not found")
    prompt = (
        f"Проверь дневниковую запись ученика по заданию: {request.prompt}\n"
        f"Ответ ученика: {request.answer}\n\n"
        "Учитывай контекст обучения:\n"
        + "\n".join(
            f"- предыдущая ошибка: {mistake.category}; {mistake.explanation}"
            for mistake in db.scalars(
                select(Mistake)
                .where(Mistake.course_id == course.id)
                .order_by(Mistake.mistake_count.desc())
                .limit(3)
            ).all()
        )
        + "\n"
        + "\n".join(
            f"- слово для повторения: {item.word} — {item.translation}"
            for item in db.scalars(
                select(VocabularyItem)
                .where(VocabularyItem.course_id == course.id)
                .order_by(VocabularyItem.review_count)
                .limit(5)
            ).all()
        )
        + "\n\n"
        "Верни только JSON без markdown с полями: is_correct (boolean), score (integer 0-100), "
        "corrected_answer (string), explanation (string), next_exercise (string), "
        "mistake_category (string или null), new_words (массив объектов word, translation, example). "
        "Исправь естественность и грамматику словацкого текста, объясни ошибки по-русски."
    )
    try:
        assessment = parse_tutor_assessment(
            provider.respond(build_tutor_context(get_settings(), prompt))
        )
    except (ValueError, TypeError, json.JSONDecodeError) as error:
        raise HTTPException(
            status_code=502,
            detail=f"Invalid diary assessment: {error}",
        ) from error
    except (FileNotFoundError, RuntimeError, TimeoutError) as error:
        raise HTTPException(
            status_code=503,
            detail=f"Tutor provider unavailable: {error}",
        ) from error

    mistake_id: int | None = None
    if not assessment.is_correct:
        mistake = record_mistake(
            db,
            course_id=course.id,
            lesson_id=lesson.id if lesson else None,
            source="diary",
            category=assessment.mistake_category or "diary",
            original_answer=request.answer,
            corrected_answer=assessment.corrected_answer,
            explanation=assessment.explanation,
        )
        mistake_id = mistake.id

    entry = DiaryEntry(
        course_id=course.id,
        lesson_id=lesson.id if lesson else None,
        mistake_id=mistake_id,
        prompt=request.prompt,
        original_text=request.answer,
        corrected_text=assessment.corrected_answer,
        explanation=assessment.explanation,
        is_correct=assessment.is_correct,
        score=assessment.score,
        ai_feedback=assessment.model_dump_json(),
    )
    db.add(entry)
    db.flush()
    save_vocabulary(
        db,
        course.id,
        lesson.id if lesson else None,
        assessment.new_words,
        mistake_id,
    )
    db.commit()
    db.refresh(entry)
    return build_diary_response(entry)


@router.get("/api/v1/diary/entries", response_model=list[DiaryEntryResponse])
def list_diary_entries(db: Session = Depends(get_db)) -> list[DiaryEntryResponse]:
    entries = db.scalars(
        select(DiaryEntry).order_by(DiaryEntry.created_at.desc(), DiaryEntry.id.desc())
    ).all()
    return [build_diary_response(entry) for entry in entries]


@router.get(
    "/api/v1/diary/weekly-summary",
    response_model=DiaryWeeklySummaryResponse,
)
def get_diary_weekly_summary(
    db: Session = Depends(get_db),
) -> DiaryWeeklySummaryResponse:
    now = datetime.now(timezone.utc)
    since = now - timedelta(days=7)
    entries = db.scalars(
        select(DiaryEntry).where(DiaryEntry.created_at >= since)
    ).all()
    scores = [entry.score for entry in entries]
    mistake_ids = {entry.mistake_id for entry in entries if entry.mistake_id is not None}
    words_count = 0
    for entry in entries:
        if entry.ai_feedback:
            try:
                words_count += len(json.loads(entry.ai_feedback).get("new_words", []))
            except (ValueError, TypeError, json.JSONDecodeError):
                continue
    return DiaryWeeklySummaryResponse(
        period_days=7,
        entries_count=len(entries),
        average_score=round(sum(scores) / len(scores), 1) if scores else None,
        mistakes_count=len(mistake_ids),
        new_words_count=words_count,
    )
