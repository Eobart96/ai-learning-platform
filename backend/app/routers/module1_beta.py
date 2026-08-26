from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import get_tutor_provider
from app.models import Module1BetaExercise, Module1BetaExerciseAttempt, Module1BetaHomework, Module1BetaHomeworkAttempt, Module1BetaReading, Module1BetaReadingAttempt, Module1BetaVocabularyItem
from app.schemas.module1_beta import Module1BetaExerciseAnswerRequest, Module1BetaExerciseAttemptResponse, Module1BetaExerciseGenerateRequest, Module1BetaExerciseResponse, Module1BetaHomeworkAttemptResponse, Module1BetaHomeworkGenerateRequest, Module1BetaHomeworkResponse, Module1BetaHomeworkSubmitRequest, Module1BetaReadingAttemptResponse, Module1BetaReadingCheckRequest, Module1BetaReadingCheckResult, Module1BetaReadingGenerateRequest, Module1BetaReadingResponse, Module1BetaStatePayload, Module1BetaStateResponse, Module1BetaVocabularyResponse, Module1BetaVocabularySyncRequest
from app.services.module1_beta_state import decode_module1_beta_state, load_module1_beta_state, save_module1_beta_state
from app.tutor import TutorProvider, build_generated_exercise_context, build_reading_check_context, build_reading_generation_context, build_tutor_context, parse_generated_exercise, parse_homework_generation, parse_tutor_assessment
from app.config import get_settings
from pydantic import BaseModel
from datetime import datetime, timedelta, timezone

router = APIRouter(prefix="/api/v1/module1-beta", tags=["module1-beta"])


@router.get("/state", response_model=Module1BetaStateResponse)
def get_state(db: Session = Depends(get_db)) -> Module1BetaStateResponse:
    stored = load_module1_beta_state(db)
    if stored is None:
        return Module1BetaStateResponse(exists=False)
    return Module1BetaStateResponse(exists=True, schema_version=stored.schema_version, state=decode_module1_beta_state(stored), updated_at=stored.updated_at)


@router.put("/state", response_model=Module1BetaStateResponse)
def put_state(payload: Module1BetaStatePayload, db: Session = Depends(get_db)) -> Module1BetaStateResponse:
    stored = save_module1_beta_state(db, payload)
    return Module1BetaStateResponse(exists=True, schema_version=stored.schema_version, state=payload, updated_at=stored.updated_at)


def _exercise_response(db: Session, exercise: Module1BetaExercise) -> Module1BetaExerciseResponse:
    attempt = db.scalar(select(Module1BetaExerciseAttempt).where(Module1BetaExerciseAttempt.exercise_id == exercise.id).order_by(Module1BetaExerciseAttempt.id.desc()))
    return Module1BetaExerciseResponse(
        id=exercise.id,
        lesson_slug=exercise.lesson_slug,
        lesson_title=exercise.lesson_title,
        question=exercise.question,
        instruction=exercise.instruction,
        created_at=exercise.created_at,
        latest_attempt=Module1BetaExerciseAttemptResponse.model_validate(attempt, from_attributes=True) if attempt else None,
    )


@router.get("/exercises", response_model=list[Module1BetaExerciseResponse])
def list_exercises(lesson_slug: str | None = None, db: Session = Depends(get_db)) -> list[Module1BetaExerciseResponse]:
    query = select(Module1BetaExercise).order_by(Module1BetaExercise.id.desc())
    if lesson_slug:
        query = query.where(Module1BetaExercise.lesson_slug == lesson_slug)
    return [_exercise_response(db, item) for item in db.scalars(query).all()]


@router.post("/exercises", response_model=Module1BetaExerciseResponse)
def generate_exercise(request: Module1BetaExerciseGenerateRequest, db: Session = Depends(get_db), provider: TutorProvider = Depends(get_tutor_provider)) -> Module1BetaExerciseResponse:
    try:
        generated = parse_generated_exercise(provider.respond(build_generated_exercise_context(lesson_title=request.lesson_title, theory=request.theory)))
    except (ValueError, RuntimeError, TimeoutError) as error:
        raise HTTPException(status_code=503, detail=f"Exercise generator is unavailable: {error}") from error
    exercise = Module1BetaExercise(lesson_slug=request.lesson_slug, lesson_title=request.lesson_title, question=generated.question, instruction=generated.instruction, theory_snapshot=request.theory)
    db.add(exercise)
    db.commit()
    db.refresh(exercise)
    return _exercise_response(db, exercise)


@router.post("/exercises/{exercise_id}/answer", response_model=Module1BetaExerciseAttemptResponse)
def answer_exercise(exercise_id: int, request: Module1BetaExerciseAnswerRequest, db: Session = Depends(get_db), provider: TutorProvider = Depends(get_tutor_provider)) -> Module1BetaExerciseAttemptResponse:
    exercise = db.get(Module1BetaExercise, exercise_id)
    if exercise is None:
        raise HTTPException(status_code=404, detail="Module 1 exercise not found")
    prompt = f"""Проверь ответ на отдельное упражнение словацкого A1.\nТема: {exercise.lesson_title}\nТеория: {exercise.theory_snapshot}\nЗадание: {exercise.question}\nИнструкция: {exercise.instruction}\nОтвет ученика: {request.answer}\nВерни только JSON: {{\"is_correct\":false,\"score\":0,\"corrected_answer\":\"\",\"explanation\":\"объяснение по-русски\",\"next_exercise\":\"следующий короткий шаг\",\"mistake_category\":null,\"new_words\":[]}}"""
    try:
        assessment = parse_tutor_assessment(provider.respond(build_tutor_context(get_settings(), prompt)))
    except (ValueError, RuntimeError, TimeoutError) as error:
        raise HTTPException(status_code=503, detail=f"Exercise assessment is unavailable: {error}") from error
    attempt = Module1BetaExerciseAttempt(exercise_id=exercise.id, answer=request.answer, is_correct=assessment.is_correct, score=assessment.score, corrected_answer=assessment.corrected_answer, explanation=assessment.explanation, next_exercise=assessment.next_exercise)
    db.add(attempt)
    db.commit()
    db.refresh(attempt)
    return Module1BetaExerciseAttemptResponse.model_validate(attempt, from_attributes=True)


@router.delete("/exercises/{exercise_id}")
def delete_exercise(exercise_id: int, db: Session = Depends(get_db)) -> dict[str, bool]:
    exercise = db.get(Module1BetaExercise, exercise_id)
    if exercise is None:
        raise HTTPException(status_code=404, detail="Module 1 exercise not found")
    db.query(Module1BetaExerciseAttempt).filter(Module1BetaExerciseAttempt.exercise_id == exercise.id).delete(synchronize_session=False)
    db.delete(exercise)
    db.commit()
    return {"deleted": True}


class _GeneratedReading(BaseModel):
    title: str
    text: str
    instruction: str


def _reading_response(db: Session, reading: Module1BetaReading) -> Module1BetaReadingResponse:
    attempt = db.scalar(select(Module1BetaReadingAttempt).where(Module1BetaReadingAttempt.reading_id == reading.id).order_by(Module1BetaReadingAttempt.id.desc()))
    return Module1BetaReadingResponse(id=reading.id, lesson_slug=reading.lesson_slug, lesson_title=reading.lesson_title, title=reading.title, text=reading.text, instruction=reading.instruction, created_at=reading.created_at, latest_attempt=Module1BetaReadingAttemptResponse.model_validate(attempt, from_attributes=True) if attempt else None)


@router.get("/readings", response_model=list[Module1BetaReadingResponse])
def list_readings(db: Session = Depends(get_db)) -> list[Module1BetaReadingResponse]:
    return [_reading_response(db, item) for item in db.scalars(select(Module1BetaReading).order_by(Module1BetaReading.id.desc())).all()]


@router.post("/readings", response_model=Module1BetaReadingResponse)
def generate_reading(request: Module1BetaReadingGenerateRequest, db: Session = Depends(get_db), provider: TutorProvider = Depends(get_tutor_provider)) -> Module1BetaReadingResponse:
    try:
        generated = _GeneratedReading.model_validate_json(provider.respond(build_reading_generation_context(lesson_title=request.lesson_title, theory=request.theory, completed_theory=request.completed_theory)))
    except Exception as error:
        raise HTTPException(status_code=503, detail=f"Не удалось создать текст: {error}") from error
    reading = Module1BetaReading(lesson_slug=request.lesson_slug, lesson_title=request.lesson_title, title=generated.title, text=generated.text, instruction=generated.instruction)
    db.add(reading); db.commit(); db.refresh(reading)
    return _reading_response(db, reading)


@router.post("/readings/{reading_id}/check", response_model=Module1BetaReadingAttemptResponse)
def check_reading(reading_id: int, request: Module1BetaReadingCheckRequest, db: Session = Depends(get_db), provider: TutorProvider = Depends(get_tutor_provider)) -> Module1BetaReadingAttemptResponse:
    reading = db.get(Module1BetaReading, reading_id)
    if reading is None:
        raise HTTPException(status_code=404, detail="Module 1 reading not found")
    try:
        result = provider.respond(build_reading_check_context(text=reading.text, retelling=request.retelling))
        checked = Module1BetaReadingCheckResult.model_validate_json(result)
    except Exception as error:
        raise HTTPException(status_code=503, detail=f"Не удалось проверить пересказ: {error}") from error
    attempt = Module1BetaReadingAttempt(reading_id=reading.id, retelling=request.retelling, score=checked.score, feedback=checked.feedback, corrected_retelling=checked.corrected_retelling)
    db.add(attempt); db.commit(); db.refresh(attempt)
    return Module1BetaReadingAttemptResponse.model_validate(attempt, from_attributes=True)


@router.delete("/readings/{reading_id}")
def delete_reading(reading_id: int, db: Session = Depends(get_db)) -> dict[str, bool]:
    reading = db.get(Module1BetaReading, reading_id)
    if reading is None:
        raise HTTPException(status_code=404, detail="Module 1 reading not found")
    db.query(Module1BetaReadingAttempt).filter(Module1BetaReadingAttempt.reading_id == reading.id).delete(synchronize_session=False)
    db.delete(reading)
    db.commit()
    return {"deleted": True}


def _vocabulary_response(item: Module1BetaVocabularyItem) -> Module1BetaVocabularyResponse:
    now = datetime.now(timezone.utc)
    due = item.next_review_at is None or item.next_review_at.replace(tzinfo=timezone.utc) <= now
    return Module1BetaVocabularyResponse.model_validate({**item.__dict__, "is_due": due})


@router.put("/vocabulary/sync", response_model=list[Module1BetaVocabularyResponse])
def sync_vocabulary(request: Module1BetaVocabularySyncRequest, db: Session = Depends(get_db)) -> list[Module1BetaVocabularyResponse]:
    for incoming in request.items:
        item = db.scalar(select(Module1BetaVocabularyItem).where(Module1BetaVocabularyItem.lesson_slug == incoming.lesson_slug, Module1BetaVocabularyItem.word == incoming.word))
        if item is None:
            item = Module1BetaVocabularyItem(**incoming.model_dump())
            db.add(item)
        else:
            item.lesson_title = incoming.lesson_title
            item.translation = incoming.translation
            item.example = incoming.example
    db.commit()
    return [_vocabulary_response(item) for item in db.scalars(select(Module1BetaVocabularyItem).order_by(Module1BetaVocabularyItem.lesson_slug, Module1BetaVocabularyItem.id)).all()]


@router.get("/vocabulary", response_model=list[Module1BetaVocabularyResponse])
def list_vocabulary(db: Session = Depends(get_db)) -> list[Module1BetaVocabularyResponse]:
    return [_vocabulary_response(item) for item in db.scalars(select(Module1BetaVocabularyItem).order_by(Module1BetaVocabularyItem.lesson_slug, Module1BetaVocabularyItem.id)).all()]


@router.post("/vocabulary/{item_id}/review", response_model=Module1BetaVocabularyResponse)
def review_vocabulary(item_id: int, db: Session = Depends(get_db)) -> Module1BetaVocabularyResponse:
    item = db.get(Module1BetaVocabularyItem, item_id)
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


def _homework_response(db: Session, homework: Module1BetaHomework) -> Module1BetaHomeworkResponse:
    attempt = db.scalar(select(Module1BetaHomeworkAttempt).where(Module1BetaHomeworkAttempt.homework_id == homework.id).order_by(Module1BetaHomeworkAttempt.id.desc()))
    return Module1BetaHomeworkResponse(
        id=homework.id, lesson_slug=homework.lesson_slug, lesson_title=homework.lesson_title,
        title=homework.title, description=homework.description, focus_category=homework.focus_category,
        created_at=homework.created_at,
        latest_attempt=Module1BetaHomeworkAttemptResponse.model_validate(attempt, from_attributes=True) if attempt else None,
    )


@router.get("/homework", response_model=list[Module1BetaHomeworkResponse])
def list_beta_homework(db: Session = Depends(get_db)) -> list[Module1BetaHomeworkResponse]:
    return [_homework_response(db, item) for item in db.scalars(select(Module1BetaHomework).order_by(Module1BetaHomework.id.desc())).all()]


@router.post("/homework", response_model=Module1BetaHomeworkResponse)
def generate_beta_homework(request: Module1BetaHomeworkGenerateRequest, db: Session = Depends(get_db), provider: TutorProvider = Depends(get_tutor_provider)) -> Module1BetaHomeworkResponse:
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
    homework = Module1BetaHomework(lesson_slug=request.lesson_slug, lesson_title=request.lesson_title, title=generated.title, description=generated.description, focus_category=generated.focus_category, theory_snapshot=request.theory)
    db.add(homework); db.commit(); db.refresh(homework)
    return _homework_response(db, homework)


@router.post("/homework/{homework_id}/submit", response_model=Module1BetaHomeworkAttemptResponse)
def submit_beta_homework(homework_id: int, request: Module1BetaHomeworkSubmitRequest, db: Session = Depends(get_db), provider: TutorProvider = Depends(get_tutor_provider)) -> Module1BetaHomeworkAttemptResponse:
    homework = db.get(Module1BetaHomework, homework_id)
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
    attempt = Module1BetaHomeworkAttempt(homework_id=homework.id, answer=request.answer, is_correct=assessment.is_correct, score=assessment.score, corrected_answer=assessment.corrected_answer, explanation=assessment.explanation, next_exercise=assessment.next_exercise)
    db.add(attempt); db.commit(); db.refresh(attempt)
    return Module1BetaHomeworkAttemptResponse.model_validate(attempt, from_attributes=True)


@router.delete("/homework/{homework_id}")
def delete_beta_homework(homework_id: int, db: Session = Depends(get_db)) -> dict[str, bool]:
    homework = db.get(Module1BetaHomework, homework_id)
    if homework is None:
        raise HTTPException(status_code=404, detail="Module 1 homework not found")
    db.query(Module1BetaHomeworkAttempt).filter(Module1BetaHomeworkAttempt.homework_id == homework.id).delete(synchronize_session=False)
    db.delete(homework); db.commit()
    return {"deleted": True}
