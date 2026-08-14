import json

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.config import get_settings
from app.database import get_db
from app.dependencies import get_tutor_provider
from app.exercise_identity import exercise_identity
from app.math_generator import generate_numeric_exercise
from app.models import Course, Exercise, Lesson, LessonAttempt, Mistake, Module, UserAnswer
from app.schemas.practice import ExerciseChatRequest, ExerciseChatResponse, ExerciseResponse, LessonAnswerRequest, LessonAnswerResponse, LessonResponse, MathTutorChatRequest, MathTutorChatResponse, ReadingCheckRequest, ReadingCheckResponse, ReadingGenerateRequest, ReadingGenerateResponse
from app.services.answer_checking import assess_numeric_answer
from app.services.learning_state import record_mistake, save_vocabulary
from app.services.lesson_answers import submit_lesson_answer
from app.tutor import TutorProvider, build_exercise_chat_context, build_generated_exercise_context, build_math_tutor_context, build_reading_check_context, build_reading_generation_context, parse_generated_exercise
from pydantic import BaseModel


router = APIRouter(tags=["practice"])


class _ReadingGenerated(BaseModel):
    title: str
    text: str
    instruction: str


@router.post("/api/v1/reading/generate", response_model=ReadingGenerateResponse)
def generate_reading(request: ReadingGenerateRequest, db: Session = Depends(get_db), provider: TutorProvider = Depends(get_tutor_provider)) -> ReadingGenerateResponse:
    lessons = list(db.scalars(select(Lesson).join(Module).join(Course).where(Course.slug == "slovak-a1").order_by(Module.order_number, Lesson.order_number, Lesson.id)).all())
    completed_ids = set(db.scalars(select(LessonAttempt.lesson_id).where(LessonAttempt.completed.is_(True))).all())
    lesson = db.scalar(select(Lesson).where(Lesson.id == request.lesson_id)) if request.lesson_id else next((item for item in lessons if item.id not in completed_ids), lessons[-1] if lessons else None)
    if lesson is None:
        raise HTTPException(status_code=404, detail="Не найдена тема для чтения")
    current_index = next((index for index, item in enumerate(lessons) if item.id == lesson.id), 0)
    completed_theory = "\n\n".join(f"Тема: {item.title}\n{item.theory or ''}" for item in lessons[:current_index] if item.id in completed_ids)
    try:
        result = _ReadingGenerated.model_validate_json(provider.respond(build_reading_generation_context(lesson_title=lesson.title, theory=lesson.theory, completed_theory=completed_theory)))
    except Exception as error:
        raise HTTPException(status_code=503, detail=f"Не удалось создать текст: {error}") from error
    return ReadingGenerateResponse(**result.model_dump())


@router.post("/api/v1/reading/check", response_model=ReadingCheckResponse)
def check_reading(request: ReadingCheckRequest, provider: TutorProvider = Depends(get_tutor_provider)) -> ReadingCheckResponse:
    try:
        result = ReadingCheckResponse.model_validate_json(provider.respond(build_reading_check_context(text=request.text, retelling=request.retelling)))
    except Exception as error:
        raise HTTPException(status_code=503, detail=f"Не удалось проверить пересказ: {error}") from error
    return result

GENERATED_MATH_INSTRUCTION = "__generated_math__"
GENERATED_SLOVAK_INSTRUCTION = "__generated_slovak__"


def _python_test_cases(exercise: Exercise) -> list[dict[str, str]]:
    if not exercise.test_cases:
        return []
    try:
        cases = json.loads(exercise.test_cases)
    except json.JSONDecodeError:
        return []
    return cases if isinstance(cases, list) else []


@router.post("/api/v1/math/lessons/{lesson_id}/chat", response_model=MathTutorChatResponse)
def ask_math_tutor(
    lesson_id: int,
    request: MathTutorChatRequest,
    db: Session = Depends(get_db),
    provider: TutorProvider = Depends(get_tutor_provider),
) -> MathTutorChatResponse:
    lesson = db.scalar(select(Lesson).where(Lesson.id == lesson_id))
    if lesson is None:
        raise HTTPException(status_code=404, detail="Lesson not found")
    if lesson.module.course.subject != "mathematics":
        raise HTTPException(status_code=409, detail="Math tutor is available only for mathematics lessons")
    current_correct = set(db.scalars(
        select(UserAnswer.exercise_id)
        .join(Exercise, UserAnswer.exercise_id == Exercise.id)
        .where(Exercise.lesson_id == lesson_id, UserAnswer.is_correct.is_(True))
    ).all())
    course_correct = db.scalar(
        select(func.count(func.distinct(UserAnswer.exercise_id)))
        .join(Exercise, UserAnswer.exercise_id == Exercise.id)
        .join(Lesson, Exercise.lesson_id == Lesson.id)
        .join(Module, Lesson.module_id == Module.id)
        .where(Module.course_id == lesson.module.course_id, UserAnswer.is_correct.is_(True))
    ) or 0
    progress = f"Верно решено в текущей теме: {len(current_correct)}. Всего верно решённых примеров по математике: {course_correct}."
    try:
        response = provider.respond(build_math_tutor_context(
            lesson_title=lesson.title,
            theory=lesson.theory,
            progress=progress,
            user_message=request.message,
        )).strip()
    except (FileNotFoundError, RuntimeError, TimeoutError) as error:
        raise HTTPException(status_code=503, detail=f"Math tutor is unavailable: {error}") from error
    if not response:
        raise HTTPException(status_code=502, detail="Math tutor returned an empty response")
    return MathTutorChatResponse(response=response)


@router.post("/api/v1/lessons/{lesson_id}/exercise-chat", response_model=ExerciseChatResponse)
def ask_exercise_tutor(
    lesson_id: int,
    request: ExerciseChatRequest,
    db: Session = Depends(get_db),
    provider: TutorProvider = Depends(get_tutor_provider),
) -> ExerciseChatResponse:
    lesson = db.scalar(select(Lesson).where(Lesson.id == lesson_id))
    if lesson is None:
        raise HTTPException(status_code=404, detail="Lesson not found")
    if lesson.module.course.subject != "language":
        raise HTTPException(status_code=409, detail="Exercise chat is available only for language lessons")
    exercise = db.scalar(select(Exercise).where(Exercise.id == request.exercise_id, Exercise.lesson_id == lesson_id))
    if exercise is None:
        raise HTTPException(status_code=404, detail="Exercise not found in this lesson")
    history = [("Ученик" if item.role == "user" else "AI", item.content) for item in request.history]
    try:
        response = provider.respond(build_exercise_chat_context(
            lesson_title=lesson.title,
            theory=lesson.theory,
            exercise_question=exercise.question,
            exercise_instruction=exercise.instruction,
            draft_answer=request.draft_answer,
            history=history,
            user_message=request.message,
        )).strip()
    except (FileNotFoundError, RuntimeError, TimeoutError) as error:
        raise HTTPException(status_code=503, detail=f"Exercise tutor is unavailable: {error}") from error
    if not response:
        raise HTTPException(status_code=502, detail="Exercise tutor returned an empty response")
    return ExerciseChatResponse(response=response)


@router.get("/api/v1/lessons/{lesson_id}", response_model=LessonResponse)
def get_lesson(lesson_id: int, db: Session = Depends(get_db)) -> LessonResponse:
    lesson = db.scalar(select(Lesson).where(Lesson.id == lesson_id))
    if lesson is None:
        raise HTTPException(status_code=404, detail="Lesson not found")
    exercises: list[Exercise] = []
    generated_exercises: list[Exercise] = []
    seen_exercise_identities: set[tuple[str, str]] = set()
    for item in db.scalars(
        select(Exercise).where(Exercise.lesson_id == lesson_id).order_by(Exercise.id)
    ).all():
        if item.instruction in {GENERATED_MATH_INSTRUCTION, GENERATED_SLOVAK_INSTRUCTION}:
            generated_exercises.append(item)
            continue
        identity = exercise_identity(item.question, item.instruction)
        if identity not in seen_exercise_identities:
            exercises.append(item)
            seen_exercise_identities.add(identity)
    answers = db.scalars(
        select(UserAnswer)
        .join(Exercise, UserAnswer.exercise_id == Exercise.id)
        .where(Exercise.lesson_id == lesson_id)
        .order_by(UserAnswer.created_at.desc(), UserAnswer.id.desc())
    ).all()
    latest_answers: dict[int, UserAnswer] = {}
    for answer in answers:
        latest_answers.setdefault(answer.exercise_id, answer)
    resolved_exercise_ids = set(
        db.scalars(
            select(Mistake.exercise_id).where(
                Mistake.lesson_id == lesson_id,
                Mistake.exercise_id.is_not(None),
                Mistake.resolved.is_(True),
            )
        ).all()
    )
    return LessonResponse(
        id=lesson.id,
        slug=lesson.slug,
        title=lesson.title,
        theory=lesson.theory,
        exercises=[
            ExerciseResponse(
                id=exercise.id,
                type=exercise.exercise_type,
                question=exercise.question,
                instruction=exercise.instruction,
                submitted_answer=(latest_answers[exercise.id].user_answer if exercise.id in latest_answers else None),
                is_completed=bool(
                    (latest_answers.get(exercise.id) and latest_answers[exercise.id].is_correct)
                    or exercise.id in resolved_exercise_ids
                ),
                is_resolved=exercise.id in resolved_exercise_ids,
                score=(latest_answers[exercise.id].score if exercise.id in latest_answers else None),
                expected_output=(exercise.correct_answer if lesson.module.course.subject == "python" else None),
                test_cases=(_python_test_cases(exercise) if lesson.module.course.subject == "python" else []),
                hint=(exercise.hint if lesson.module.course.subject == "python" else None),
                explanation=(exercise.explanation if lesson.module.course.subject == "python" else None),
            )
            for exercise in exercises
        ],
        generated_exercises=[
            ExerciseResponse(
                id=exercise.id,
                type=exercise.exercise_type,
                question=exercise.question,
                instruction=None if exercise.instruction == GENERATED_MATH_INSTRUCTION else exercise.instruction,
                submitted_answer=(latest_answers[exercise.id].user_answer if exercise.id in latest_answers else None),
                is_completed=bool(
                    (latest_answers.get(exercise.id) and latest_answers[exercise.id].is_correct)
                    or exercise.id in resolved_exercise_ids
                ),
                is_resolved=exercise.id in resolved_exercise_ids,
                score=(latest_answers[exercise.id].score if exercise.id in latest_answers else None),
                expected_output=(exercise.correct_answer if lesson.module.course.subject == "python" else None),
                test_cases=(_python_test_cases(exercise) if lesson.module.course.subject == "python" else []),
                hint=(exercise.hint if lesson.module.course.subject == "python" else None),
                explanation=(exercise.explanation if lesson.module.course.subject == "python" else None),
            )
            for exercise in generated_exercises
        ],
    )


@router.post("/api/v1/lessons/{lesson_id}/generated-exercises", response_model=ExerciseResponse)
def generate_lesson_exercise(
    lesson_id: int,
    db: Session = Depends(get_db),
    provider: TutorProvider = Depends(get_tutor_provider),
) -> ExerciseResponse:
    lesson = db.scalar(select(Lesson).where(Lesson.id == lesson_id))
    if lesson is None:
        raise HTTPException(status_code=404, detail="Lesson not found")
    if lesson.module.course.subject == "mathematics":
        try:
            question, correct_answer = generate_numeric_exercise(lesson.slug)
        except ValueError as error:
            raise HTTPException(status_code=409, detail=str(error)) from error
        exercise = Exercise(
            lesson_id=lesson.id,
            exercise_type="numeric_answer",
            question=question,
            instruction=GENERATED_MATH_INSTRUCTION,
            correct_answer=correct_answer,
        )
    else:
        try:
            generated = parse_generated_exercise(provider.respond(build_generated_exercise_context(
                lesson_title=lesson.title,
                theory=lesson.theory,
            )))
        except (ValueError, RuntimeError, TimeoutError) as error:
            raise HTTPException(status_code=503, detail=f"Exercise generator is unavailable: {error}") from error
        exercise = Exercise(
            lesson_id=lesson.id,
            exercise_type="generated_text",
            question=generated.question,
            instruction=GENERATED_SLOVAK_INSTRUCTION,
            correct_answer="",
        )
    db.add(exercise)
    db.commit()
    db.refresh(exercise)
    return ExerciseResponse(
        id=exercise.id,
        type=exercise.exercise_type,
        question=exercise.question,
        instruction=(generated.instruction if lesson.module.course.subject != "mathematics" else None),
    )


@router.post("/api/v1/lessons/{lesson_id}/answer", response_model=LessonAnswerResponse)
def answer_lesson(
    lesson_id: int,
    request: LessonAnswerRequest,
    db: Session = Depends(get_db),
    provider: TutorProvider = Depends(get_tutor_provider),
) -> LessonAnswerResponse:
    result = submit_lesson_answer(
        db=db,
        lesson_id=lesson_id,
        exercise_id=request.exercise_id,
        answer=request.answer,
        provider=provider,
        settings=get_settings(),
        assess_numeric_answer=assess_numeric_answer,
        record_mistake=record_mistake,
        save_vocabulary=save_vocabulary,
    )
    return LessonAnswerResponse(
        attempt_id=result.attempt_id,
        answer_id=result.answer_id,
        provider=result.provider,
        assessment=result.assessment,
        mistake_id=result.mistake_id,
    )
