from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.dialects.sqlite import insert as sqlite_insert
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import get_tutor_provider
from app.models import CourseExercise, CourseExerciseAttempt, CourseHomework, CourseHomeworkAttempt, CourseReading, CourseReadingAttempt, CourseVocabularyItem
from app.schemas.course import CourseExerciseAnswerRequest, CourseExerciseAttemptResponse, CourseExerciseGenerateRequest, CourseExerciseResponse, CourseHomeworkAttemptResponse, CourseHomeworkGenerateRequest, CourseHomeworkResponse, CourseHomeworkSubmitRequest, CourseReadingAttemptResponse, CourseReadingCheckRequest, CourseReadingCheckResult, CourseReadingGenerateRequest, CourseReadingResponse, CourseStatePayload, CourseStateResponse, CourseVocabularyResponse, CourseVocabularySyncRequest
from app.services.course_state import decode_course_state, load_course_state, save_course_state
from app.tutor import TutorProvider, build_generated_exercise_context, build_reading_check_context, build_reading_generation_context, build_tutor_context, parse_generated_exercise, parse_homework_generation, parse_tutor_assessment
from app.config import get_settings
from pydantic import BaseModel
from datetime import datetime, timedelta, timezone

router = APIRouter(prefix="/api/v1/course", tags=["course"])


@router.get("/state", response_model=CourseStateResponse)
def get_state(db: Session = Depends(get_db)) -> CourseStateResponse:
    stored = load_course_state(db)
    if stored is None:
        return CourseStateResponse(exists=False)
    return CourseStateResponse(exists=True, schema_version=stored.schema_version, state=decode_course_state(stored), updated_at=stored.updated_at)


@router.put("/state", response_model=CourseStateResponse)
def put_state(payload: CourseStatePayload, db: Session = Depends(get_db)) -> CourseStateResponse:
    stored = save_course_state(db, payload)
    return CourseStateResponse(exists=True, schema_version=stored.schema_version, state=payload, updated_at=stored.updated_at)


def _exercise_response(db: Session, exercise: CourseExercise) -> CourseExerciseResponse:
    attempt = db.scalar(select(CourseExerciseAttempt).where(CourseExerciseAttempt.exercise_id == exercise.id).order_by(CourseExerciseAttempt.id.desc()))
    return CourseExerciseResponse(
        id=exercise.id,
        lesson_slug=exercise.lesson_slug,
        lesson_title=exercise.lesson_title,
        question=exercise.question,
        instruction=exercise.instruction,
        created_at=exercise.created_at,
        latest_attempt=CourseExerciseAttemptResponse.model_validate(attempt, from_attributes=True) if attempt else None,
    )


@router.get("/exercises", response_model=list[CourseExerciseResponse])
def list_exercises(lesson_slug: str | None = None, db: Session = Depends(get_db)) -> list[CourseExerciseResponse]:
    query = select(CourseExercise).order_by(CourseExercise.id.desc())
    if lesson_slug:
        query = query.where(CourseExercise.lesson_slug == lesson_slug)
    return [_exercise_response(db, item) for item in db.scalars(query).all()]


@router.post("/exercises", response_model=CourseExerciseResponse)
def generate_exercise(request: CourseExerciseGenerateRequest, db: Session = Depends(get_db), provider: TutorProvider = Depends(get_tutor_provider)) -> CourseExerciseResponse:
    try:
        generated = parse_generated_exercise(provider.respond(build_generated_exercise_context(lesson_title=request.lesson_title, theory=request.theory)))
    except (ValueError, RuntimeError, TimeoutError) as error:
        raise HTTPException(status_code=503, detail=f"Exercise generator is unavailable: {error}") from error
    exercise = CourseExercise(lesson_slug=request.lesson_slug, lesson_title=request.lesson_title, question=generated.question, instruction=generated.instruction, theory_snapshot=request.theory)
    db.add(exercise)
    db.commit()
    db.refresh(exercise)
    return _exercise_response(db, exercise)


@router.post("/exercises/{exercise_id}/answer", response_model=CourseExerciseAttemptResponse)
def answer_exercise(exercise_id: int, request: CourseExerciseAnswerRequest, db: Session = Depends(get_db), provider: TutorProvider = Depends(get_tutor_provider)) -> CourseExerciseAttemptResponse:
    exercise = db.get(CourseExercise, exercise_id)
    if exercise is None:
        raise HTTPException(status_code=404, detail="Module 1 exercise not found")
    prompt = f"""Проверь ответ на отдельное упражнение словацкого A1.\nТема: {exercise.lesson_title}\nТеория: {exercise.theory_snapshot}\nЗадание: {exercise.question}\nИнструкция: {exercise.instruction}\nОтвет ученика: {request.answer}\nВерни только JSON: {{\"is_correct\":false,\"score\":0,\"corrected_answer\":\"\",\"explanation\":\"объяснение по-русски\",\"next_exercise\":\"следующий короткий шаг\",\"mistake_category\":null,\"new_words\":[]}}"""
    try:
        assessment = parse_tutor_assessment(provider.respond(build_tutor_context(get_settings(), prompt)))
    except (ValueError, RuntimeError, TimeoutError) as error:
        raise HTTPException(status_code=503, detail=f"Exercise assessment is unavailable: {error}") from error
    attempt = CourseExerciseAttempt(exercise_id=exercise.id, answer=request.answer, is_correct=assessment.is_correct, score=assessment.score, corrected_answer=assessment.corrected_answer, explanation=assessment.explanation, next_exercise=assessment.next_exercise)
    db.add(attempt)
    db.commit()
    db.refresh(attempt)
    return CourseExerciseAttemptResponse.model_validate(attempt, from_attributes=True)


@router.delete("/exercises/{exercise_id}")
def delete_exercise(exercise_id: int, db: Session = Depends(get_db)) -> dict[str, bool]:
    exercise = db.get(CourseExercise, exercise_id)
    if exercise is None:
        raise HTTPException(status_code=404, detail="Module 1 exercise not found")
    db.query(CourseExerciseAttempt).filter(CourseExerciseAttempt.exercise_id == exercise.id).delete(synchronize_session=False)
    db.delete(exercise)
    db.commit()
    return {"deleted": True}


class _GeneratedReading(BaseModel):
    title: str
    text: str
    instruction: str


def _reading_response(db: Session, reading: CourseReading) -> CourseReadingResponse:
    attempt = db.scalar(select(CourseReadingAttempt).where(CourseReadingAttempt.reading_id == reading.id).order_by(CourseReadingAttempt.id.desc()))
    return CourseReadingResponse(id=reading.id, lesson_slug=reading.lesson_slug, lesson_title=reading.lesson_title, title=reading.title, text=reading.text, instruction=reading.instruction, created_at=reading.created_at, latest_attempt=CourseReadingAttemptResponse.model_validate(attempt, from_attributes=True) if attempt else None)


@router.get("/readings", response_model=list[CourseReadingResponse])
def list_readings(db: Session = Depends(get_db)) -> list[CourseReadingResponse]:
    return [_reading_response(db, item) for item in db.scalars(select(CourseReading).order_by(CourseReading.id.desc())).all()]


@router.post("/readings", response_model=CourseReadingResponse)
def generate_reading(request: CourseReadingGenerateRequest, db: Session = Depends(get_db), provider: TutorProvider = Depends(get_tutor_provider)) -> CourseReadingResponse:
    try:
        generated = _GeneratedReading.model_validate_json(provider.respond(build_reading_generation_context(lesson_title=request.lesson_title, theory=request.theory, completed_theory=request.completed_theory)))
    except Exception as error:
        raise HTTPException(status_code=503, detail=f"Не удалось создать текст: {error}") from error
    reading = CourseReading(lesson_slug=request.lesson_slug, lesson_title=request.lesson_title, title=generated.title, text=generated.text, instruction=generated.instruction)
    db.add(reading); db.commit(); db.refresh(reading)
    return _reading_response(db, reading)


@router.post("/readings/{reading_id}/check", response_model=CourseReadingAttemptResponse)
def check_reading(reading_id: int, request: CourseReadingCheckRequest, db: Session = Depends(get_db), provider: TutorProvider = Depends(get_tutor_provider)) -> CourseReadingAttemptResponse:
    reading = db.get(CourseReading, reading_id)
    if reading is None:
        raise HTTPException(status_code=404, detail="Module 1 reading not found")
    try:
        result = provider.respond(build_reading_check_context(text=reading.text, retelling=request.retelling))
        checked = CourseReadingCheckResult.model_validate_json(result)
    except Exception as error:
        raise HTTPException(status_code=503, detail=f"Не удалось проверить пересказ: {error}") from error
    attempt = CourseReadingAttempt(reading_id=reading.id, retelling=request.retelling, score=checked.score, feedback=checked.feedback, corrected_retelling=checked.corrected_retelling)
    db.add(attempt); db.commit(); db.refresh(attempt)
    return CourseReadingAttemptResponse.model_validate(attempt, from_attributes=True)


@router.delete("/readings/{reading_id}")
def delete_reading(reading_id: int, db: Session = Depends(get_db)) -> dict[str, bool]:
    reading = db.get(CourseReading, reading_id)
    if reading is None:
        raise HTTPException(status_code=404, detail="Module 1 reading not found")
    db.query(CourseReadingAttempt).filter(CourseReadingAttempt.reading_id == reading.id).delete(synchronize_session=False)
    db.delete(reading)
    db.commit()
    return {"deleted": True}


def _vocabulary_response(item: CourseVocabularyItem) -> CourseVocabularyResponse:
    now = datetime.now(timezone.utc)
    due = item.next_review_at is None or item.next_review_at.replace(tzinfo=timezone.utc) <= now
    return CourseVocabularyResponse.model_validate({**item.__dict__, "is_due": due})


@router.put("/vocabulary/sync", response_model=list[CourseVocabularyResponse])
def sync_vocabulary(request: CourseVocabularySyncRequest, db: Session = Depends(get_db)) -> list[CourseVocabularyResponse]:
    if request.items:
        statement = sqlite_insert(CourseVocabularyItem).values(
            [incoming.model_dump() for incoming in request.items]
        )
        statement = statement.on_conflict_do_update(
            index_elements=[CourseVocabularyItem.lesson_slug, CourseVocabularyItem.word],
            set_={
                "lesson_title": statement.excluded.lesson_title,
                "translation": statement.excluded.translation,
                "example": statement.excluded.example,
            },
        )
        db.execute(statement)
    db.commit()
    return [_vocabulary_response(item) for item in db.scalars(select(CourseVocabularyItem).order_by(CourseVocabularyItem.lesson_slug, CourseVocabularyItem.id)).all()]


@router.get("/vocabulary", response_model=list[CourseVocabularyResponse])
def list_vocabulary(db: Session = Depends(get_db)) -> list[CourseVocabularyResponse]:
    return [_vocabulary_response(item) for item in db.scalars(select(CourseVocabularyItem).order_by(CourseVocabularyItem.lesson_slug, CourseVocabularyItem.id)).all()]


@router.post("/vocabulary/{item_id}/review", response_model=CourseVocabularyResponse)
def review_vocabulary(item_id: int, db: Session = Depends(get_db)) -> CourseVocabularyResponse:
    item = db.get(CourseVocabularyItem, item_id)
    if item is None:
        raise HTTPException(status_code=404, detail="Module 1 vocabulary item not found")
    now = datetime.now(timezone.utc)
    intervals = (1, 3, 7, 14, 30)
    item.review_count += 1
    item.interval_days = intervals[min(item.review_count - 1, len(intervals) - 1)]
    item.last_reviewed_at = now
    item.next_review_at = now + timedelta(days=item.interval_days)
    db.commit(); db.refresh(item)
    return _vocabulary_response(item)


def _homework_response(db: Session, homework: CourseHomework) -> CourseHomeworkResponse:
    attempt = db.scalar(select(CourseHomeworkAttempt).where(CourseHomeworkAttempt.homework_id == homework.id).order_by(CourseHomeworkAttempt.id.desc()))
    return CourseHomeworkResponse(
        id=homework.id, lesson_slug=homework.lesson_slug, lesson_title=homework.lesson_title,
        title=homework.title, description=homework.description, focus_category=homework.focus_category,
        created_at=homework.created_at,
        latest_attempt=CourseHomeworkAttemptResponse.model_validate(attempt, from_attributes=True) if attempt else None,
    )


@router.get("/homework", response_model=list[CourseHomeworkResponse])
def list_course_homework(db: Session = Depends(get_db)) -> list[CourseHomeworkResponse]:
    return [_homework_response(db, item) for item in db.scalars(select(CourseHomework).order_by(CourseHomework.id.desc())).all()]


@router.post("/homework", response_model=CourseHomeworkResponse)
def generate_course_homework(request: CourseHomeworkGenerateRequest, db: Session = Depends(get_db), provider: TutorProvider = Depends(get_tutor_provider)) -> CourseHomeworkResponse:
    mistakes = "\n".join(f"- {item}" for item in request.known_mistakes) or "Нет сохранённых ошибок."
    prompt = f"""Создай одно небольшое домашнее задание для начинающего изучать словацкий A1.
Тема: {request.lesson_title}
Теория (не выходи за её пределы):
{request.theory}
Известные ошибки ученика:
{mistakes}
Задание должно требовать короткий самостоятельный ответ на словацком и занимать 5–10 минут.
Верни только JSON: {{"title":"короткое название","description":"понятная инструкция по-русски","focus_category":"навык или правило"}}"""
    try:
        generated = parse_homework_generation(provider.respond(build_tutor_context(get_settings(), prompt)))
    except (ValueError, RuntimeError, TimeoutError) as error:
        raise HTTPException(status_code=503, detail=f"Homework generator is unavailable: {error}") from error
    homework = CourseHomework(lesson_slug=request.lesson_slug, lesson_title=request.lesson_title, title=generated.title, description=generated.description, focus_category=generated.focus_category, theory_snapshot=request.theory)
    db.add(homework); db.commit(); db.refresh(homework)
    return _homework_response(db, homework)


@router.post("/homework/{homework_id}/submit", response_model=CourseHomeworkAttemptResponse)
def submit_course_homework(homework_id: int, request: CourseHomeworkSubmitRequest, db: Session = Depends(get_db), provider: TutorProvider = Depends(get_tutor_provider)) -> CourseHomeworkAttemptResponse:
    homework = db.get(CourseHomework, homework_id)
    if homework is None:
        raise HTTPException(status_code=404, detail="Module 1 homework not found")
    prompt = f"""Проверь домашнее задание начинающего изучать словацкий A1.
Тема: {homework.lesson_title}
Теория (единственная граница проверки): {homework.theory_snapshot}
Задание: {homework.description}
Ответ ученика: {request.answer}
Верни только JSON: {{"is_correct":false,"score":0,"corrected_answer":"","explanation":"простое объяснение по-русски","next_exercise":"что повторить","mistake_category":null,"new_words":[]}}"""
    try:
        assessment = parse_tutor_assessment(provider.respond(build_tutor_context(get_settings(), prompt)))
    except (ValueError, RuntimeError, TimeoutError) as error:
        raise HTTPException(status_code=503, detail=f"Homework assessment is unavailable: {error}") from error
    attempt = CourseHomeworkAttempt(homework_id=homework.id, answer=request.answer, is_correct=assessment.is_correct, score=assessment.score, corrected_answer=assessment.corrected_answer, explanation=assessment.explanation, next_exercise=assessment.next_exercise)
    db.add(attempt); db.commit(); db.refresh(attempt)
    return CourseHomeworkAttemptResponse.model_validate(attempt, from_attributes=True)


@router.delete("/homework/{homework_id}")
def delete_course_homework(homework_id: int, db: Session = Depends(get_db)) -> dict[str, bool]:
    homework = db.get(CourseHomework, homework_id)
    if homework is None:
        raise HTTPException(status_code=404, detail="Module 1 homework not found")
    db.query(CourseHomeworkAttempt).filter(CourseHomeworkAttempt.homework_id == homework.id).delete(synchronize_session=False)
    db.delete(homework); db.commit()
    return {"deleted": True}
