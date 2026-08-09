from dataclasses import dataclass
import json
from typing import Callable

from fastapi import HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.config import Settings
from app.models import Exercise, Lesson, LessonAttempt, Mistake, UserAnswer
from app.tutor import TutorAssessment, TutorProvider, build_tutor_context, parse_tutor_assessment


@dataclass(frozen=True)
class LessonAnswerResult:
    attempt_id: int
    answer_id: int
    provider: str
    assessment: TutorAssessment
    mistake_id: int | None


def submit_lesson_answer(
    *,
    db: Session,
    lesson_id: int,
    exercise_id: int,
    answer: str,
    provider: TutorProvider,
    settings: Settings,
    assess_numeric_answer: Callable[[str, str | None], TutorAssessment],
    record_mistake: Callable[..., Mistake],
    save_vocabulary: Callable[..., None],
) -> LessonAnswerResult:
    """Assess one answer and persist its attempt, analytics, and new vocabulary."""
    lesson = db.scalar(select(Lesson).where(Lesson.id == lesson_id))
    if lesson is None:
        raise HTTPException(status_code=404, detail="Lesson not found")
    exercise = db.scalar(
        select(Exercise).where(Exercise.id == exercise_id, Exercise.lesson_id == lesson_id)
    )
    if exercise is None:
        raise HTTPException(status_code=404, detail="Exercise not found in lesson")
    if not answer.strip():
        raise HTTPException(status_code=422, detail="Answer must not be empty")

    if exercise.exercise_type == "numeric_answer":
        assessment = assess_numeric_answer(answer, exercise.correct_answer)
    else:
        assessment_request = (
            f"Урок: {lesson.title}\n"
            f"Вопрос: {exercise.question}\n"
            f"Ответ ученика: {answer}\n\n"
            "Проверь ответ ученика по методике и верни ТОЛЬКО JSON без markdown. "
            "JSON должен содержать поля: is_correct (boolean), score (integer 0-100), "
            "corrected_answer (string), explanation (string), next_exercise (string), "
            "mistake_category (string или null). Дай одно похожее упражнение и не раскрывай ответ к нему. "
            "Добавь new_words: массив из 0-3 новых слов с полями word, translation, example."
        )
        context = build_tutor_context(settings, assessment_request)
        try:
            raw_feedback = provider.respond(context)
            assessment = parse_tutor_assessment(raw_feedback)
        except (ValueError, TypeError, json.JSONDecodeError) as error:
            raise HTTPException(status_code=502, detail=f"Invalid tutor assessment: {error}") from error
        except (FileNotFoundError, RuntimeError, TimeoutError) as error:
            raise HTTPException(status_code=503, detail=f"Tutor provider unavailable: {error}") from error

    attempt = LessonAttempt(lesson_id=lesson_id, score=assessment.score)
    db.add(attempt)
    db.flush()
    user_answer = UserAnswer(
        exercise_id=exercise.id,
        lesson_attempt_id=attempt.id,
        user_answer=answer,
        is_correct=assessment.is_correct,
        score=assessment.score,
        ai_feedback=assessment.model_dump_json(),
    )
    db.add(user_answer)
    mistake_id: int | None = None
    if not assessment.is_correct:
        mistake = record_mistake(
            db,
            course_id=lesson.module.course_id,
            lesson_id=lesson.id,
            source="exercise",
            category=assessment.mistake_category or "general",
            original_answer=answer,
            corrected_answer=assessment.corrected_answer,
            explanation=assessment.explanation,
            exercise_id=exercise.id,
        )
        mistake_id = mistake.id
    save_vocabulary(db, lesson.module.course_id, lesson.id, assessment.new_words, mistake_id)
    db.commit()
    db.refresh(attempt)
    db.refresh(user_answer)
    return LessonAnswerResult(
        attempt_id=attempt.id,
        answer_id=user_answer.id,
        provider=settings.tutor_provider,
        assessment=assessment,
        mistake_id=mistake_id,
    )
