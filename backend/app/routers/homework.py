import json
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.config import get_settings
from app.database import get_db
from app.dependencies import get_tutor_provider
from app.models import Homework, Lesson, Mistake
from app.schemas.homework import (
    HomeworkGenerateRequest,
    HomeworkResponse,
    HomeworkSubmitRequest,
    HomeworkSubmitResponse,
)
from app.services.learning_state import record_mistake, save_vocabulary
from app.tutor import (
    TutorProvider,
    build_tutor_context,
    parse_homework_generation,
    parse_tutor_assessment,
)

router = APIRouter(tags=["homework"])


def _response(item: Homework, focus_category: str | None = None) -> HomeworkResponse:
    return HomeworkResponse(
        id=item.id,
        lesson_id=item.lesson_id,
        title=item.title,
        description=item.description,
        status=item.status,
        score=item.score,
        focus_category=focus_category,
        mistake_id=item.mistake_id,
        submitted_answer=item.submitted_answer,
        ai_feedback=item.ai_feedback,
    )


@router.post("/api/v1/homework/generate", response_model=HomeworkResponse)
def generate_homework(request: HomeworkGenerateRequest, db: Session = Depends(get_db), provider: TutorProvider = Depends(get_tutor_provider)) -> HomeworkResponse:
    lesson = db.scalar(select(Lesson).where(Lesson.id == request.lesson_id))
    if lesson is None:
        raise HTTPException(status_code=404, detail="Lesson not found")
    mistake = db.scalar(select(Mistake).order_by(Mistake.mistake_count.desc(), Mistake.last_mistake_at))
    focus = mistake.category if mistake else "current lesson"
    focus_details = mistake.explanation if mistake else "Закрепи материал текущего урока."
    prompt = (
        f"Создай домашнее задание для урока «{lesson.title}». Слабая тема ученика: {focus}. Контекст ошибки: {focus_details} "
        f"CURRENT LESSON THEORY — HARD GRAMMAR BOUNDARY:\n{lesson.theory or 'Теория не заполнена.'}\n"
        "PREREQUISITE RULE: Test only grammar rules explicitly explained in CURRENT LESSON THEORY or earlier lessons. Never require a case, conjugation, declension, or word-form change that has not been explained yet. A construction appearing in an example does not authorize a hidden inflection rule. Build the task so it can be completed entirely with unchanged dictionary forms and patterns explicitly demonstrated in the theory. Do not jump ahead to later course topics. EXERCISE WORD-BANK RULE: If the learner must compose phrases, name objects, or choose noun forms, include a ready-to-use bank of 5-8 Slovak nouns. For every noun give its grammatical gender (m./f./n.) and Russian translation. Prefer vocabulary from the current topic and add a few useful new words. The learner must never need to invent unknown nouns from memory. Верни ТОЛЬКО JSON без markdown с полями: title, description, focus_category. Описание должно содержать практическое упражнение на словацком языке, русский перевод и короткую инструкцию. Не давай готовый ответ."
    )
    try:
        generation = parse_homework_generation(provider.respond(build_tutor_context(get_settings(), prompt)))
    except (ValueError, TypeError, json.JSONDecodeError) as error:
        raise HTTPException(status_code=502, detail=f"Invalid homework response: {error}") from error
    except (FileNotFoundError, RuntimeError, TimeoutError) as error:
        raise HTTPException(status_code=503, detail=f"Tutor provider unavailable: {error}") from error
    homework = Homework(course_id=lesson.module.course_id, lesson_id=lesson.id, title=generation.title, description=generation.description, ai_feedback=generation.model_dump_json())
    db.add(homework); db.commit(); db.refresh(homework)
    return _response(homework, generation.focus_category)


@router.get("/api/v1/homework", response_model=list[HomeworkResponse])
def list_homework(db: Session = Depends(get_db)) -> list[HomeworkResponse]:
    return [_response(item) for item in db.scalars(select(Homework).order_by(Homework.id.desc())).all()]


@router.post("/api/v1/homework/{homework_id}/submit", response_model=HomeworkSubmitResponse)
def submit_homework(homework_id: int, request: HomeworkSubmitRequest, db: Session = Depends(get_db), provider: TutorProvider = Depends(get_tutor_provider)) -> HomeworkSubmitResponse:
    if not request.answer.strip():
        raise HTTPException(status_code=422, detail="Answer must not be empty")
    homework = db.scalar(select(Homework).where(Homework.id == homework_id))
    if homework is None:
        raise HTTPException(status_code=404, detail="Homework not found")
    lesson = db.scalar(select(Lesson).where(Lesson.id == homework.lesson_id))
    prompt = (f"Проверь выполнение домашнего задания по уроку «{lesson.title if lesson else 'курс'}».\nЗадание: {homework.description}\nОтвет ученика: {request.answer}\n\nCURRENT LESSON THEORY — HARD GRADING BOUNDARY:\n{lesson.theory if lesson and lesson.theory else 'Теория не заполнена.'}\n"
        "ASSESSMENT SCOPE RULE: Grade only grammar explicitly explained in CURRENT LESSON THEORY or earlier lessons. Do not deduct points for a case, conjugation, declension, or word-form change that has not been taught yet. If the generated task accidentally requires later grammar, accept an answer that demonstrates the current lesson target, clearly say the task exceeded the lesson scope, and do not make the learner correct the future rule. Верни только JSON без markdown с полями: is_correct (boolean), score (integer 0-100), corrected_answer (string), explanation (string), next_exercise (string), mistake_category (string или null). Проверь именно ответ ученика и объясни ошибки по-русски. Добавь new_words: массив из 0-3 новых слов с полями word, translation, example.")
    try:
        assessment = parse_tutor_assessment(provider.respond(build_tutor_context(get_settings(), prompt)))
    except (ValueError, TypeError, json.JSONDecodeError) as error:
        raise HTTPException(status_code=502, detail=f"Invalid homework assessment: {error}") from error
    except (FileNotFoundError, RuntimeError, TimeoutError) as error:
        raise HTTPException(status_code=503, detail=f"Tutor provider unavailable: {error}") from error
    homework.submitted_answer = request.answer; homework.score = assessment.score; homework.status = "checked"; homework.ai_feedback = assessment.model_dump_json(); homework.submitted_at = datetime.now(timezone.utc)
    mistake_id: int | None = None
    if not assessment.is_correct:
        mistake = record_mistake(db, course_id=homework.course_id, lesson_id=lesson.id if lesson else None, source="homework", category=assessment.mistake_category or "homework", original_answer=request.answer, corrected_answer=assessment.corrected_answer, explanation=assessment.explanation)
        mistake_id = mistake.id; homework.mistake_id = mistake.id
    elif homework.mistake_id is not None:
        previous_mistake = db.scalar(select(Mistake).where(Mistake.id == homework.mistake_id))
        if previous_mistake is not None: previous_mistake.resolved = True
        homework.mistake_id = None
    if lesson is not None: save_vocabulary(db, homework.course_id, lesson.id, assessment.new_words, mistake_id)
    db.commit(); db.refresh(homework)
    return HomeworkSubmitResponse(**_response(homework, assessment.mistake_category).model_dump(), assessment=assessment)
