from contextlib import asynccontextmanager
from datetime import datetime, timedelta, timezone
import json
from pathlib import Path

from fastapi import Depends, FastAPI, HTTPException
from fastapi.responses import RedirectResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, Field
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.config import get_settings
from app.course_loader import load_course
from app.database import Base, engine, ensure_sqlite_schema, get_db
from app.models import (
    Course,
    DiaryEntry,
    DialogueMessage,
    Exercise,
    Homework,
    LearningSession,
    Lesson,
    LessonAttempt,
    Mistake,
    Module,
    UserAnswer,
    VocabularyItem,
)
from app.tutor import (
    CodexCliProvider,
    OpenAIProvider,
    TutorProvider,
    TutorAssessment,
    VocabularyWord,
    build_tutor_context,
    parse_homework_generation,
    parse_tutor_assessment,
)


@asynccontextmanager
async def lifespan(_: FastAPI):
    settings = get_settings()
    settings_path = settings.course_path
    settings_path.parent.mkdir(parents=True, exist_ok=True)
    Base.metadata.create_all(bind=engine)
    ensure_sqlite_schema(engine)
    with Session(engine) as db:
        load_course(db, settings_path)
    yield


app = FastAPI(title=get_settings().app_name, lifespan=lifespan)
app.mount("/ui", StaticFiles(directory=Path(__file__).resolve().parents[2] / "frontend", html=True), name="ui")


class TutorMessageRequest(BaseModel):
    message: str


class TutorMessageResponse(BaseModel):
    provider: str
    response: str


class ExerciseResponse(BaseModel):
    id: int
    type: str
    question: str
    instruction: str | None


class LessonResponse(BaseModel):
    id: int
    slug: str
    title: str
    theory: str | None
    exercises: list[ExerciseResponse]


class LessonAnswerRequest(BaseModel):
    exercise_id: int
    answer: str


class LessonAnswerResponse(BaseModel):
    attempt_id: int
    answer_id: int
    provider: str
    assessment: TutorAssessment
    mistake_id: int | None


class ProgressResponse(BaseModel):
    completed_lessons: int
    total_attempts: int
    total_answers: int
    total_mistakes: int
    average_score: float | None


class MistakeResponse(BaseModel):
    id: int
    category: str
    original_answer: str
    corrected_answer: str
    explanation: str
    mistake_count: int


class LessonCompletionResponse(BaseModel):
    lesson_id: int
    attempt_id: int
    completed: bool


class NextMistakeResponse(BaseModel):
    id: int
    category: str
    explanation: str
    mistake_count: int


class VocabularyResponse(BaseModel):
    id: int
    mistake_id: int | None
    word: str
    translation: str
    example: str | None
    review_count: int
    interval_days: int
    next_review_at: datetime | None
    is_due: bool


class VocabularyReviewResponse(VocabularyResponse):
    reviewed: bool


class DiaryPromptResponse(BaseModel):
    prompt: str
    lesson_id: int | None
    lesson_title: str | None
    has_entry_today: bool


class DiaryEntryRequest(BaseModel):
    prompt: str
    answer: str
    lesson_id: int | None = None


class DiaryEntryResponse(BaseModel):
    id: int
    prompt: str
    original_text: str
    corrected_text: str
    explanation: str
    is_correct: bool
    score: int
    mistake_id: int | None
    created_at: datetime
    new_words: list[VocabularyWord] = Field(default_factory=list)


class DiaryWeeklySummaryResponse(BaseModel):
    period_days: int
    entries_count: int
    average_score: float | None
    mistakes_count: int
    new_words_count: int


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
    submitted_answer: str | None = None
    ai_feedback: str | None = None


class HomeworkSubmitRequest(BaseModel):
    answer: str


class HomeworkSubmitResponse(HomeworkResponse):
    assessment: TutorAssessment


class DialogueSessionResponse(BaseModel):
    session_id: int
    current_lesson_id: int | None
    current_lesson_title: str | None
    current_phase: str
    status: str


class DialogueMessageRequest(BaseModel):
    message: str


class DialogueLessonSelectionRequest(BaseModel):
    lesson_id: int


class DialogueMessageView(BaseModel):
    role: str
    content: str


class DialogueHistoryResponse(DialogueSessionResponse):
    messages: list[DialogueMessageView]


class DialogueMessageResponse(DialogueSessionResponse):
    response: str
    progress_saved: bool


class ProgressResetRequest(BaseModel):
    confirm: bool = False


class ProgressResetResponse(BaseModel):
    reset: bool
    deleted_sessions: int
    deleted_attempts: int
    deleted_answers: int
    deleted_mistakes: int
    next_lesson_id: int | None


class RoadmapLessonResponse(BaseModel):
    id: int
    slug: str
    title: str
    order_number: int
    status: str
    can_repeat: bool


class RoadmapModuleResponse(BaseModel):
    id: int
    title: str
    order_number: int
    lessons: list[RoadmapLessonResponse]


class RoadmapLevelResponse(BaseModel):
    slug: str
    title: str
    status: str
    modules: list[RoadmapModuleResponse]


def get_tutor_provider() -> TutorProvider:
    settings = get_settings()
    if settings.tutor_provider == "openai":
        if not settings.openai_api_key:
            raise HTTPException(status_code=503, detail="OPENAI_API_KEY is not configured")
        return OpenAIProvider(settings)
    if settings.tutor_provider == "codex":
        return CodexCliProvider(settings)
    raise HTTPException(status_code=500, detail="Unsupported TUTOR_PROVIDER")


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.get("/", include_in_schema=False)
def ui_home() -> RedirectResponse:
    return RedirectResponse(url="/ui/")


@app.post("/api/v1/tutor/message", response_model=TutorMessageResponse)
def tutor_message(
    request: TutorMessageRequest,
    provider: TutorProvider = Depends(get_tutor_provider),
) -> TutorMessageResponse:
    if not request.message.strip():
        raise HTTPException(status_code=422, detail="Message must not be empty")
    settings = get_settings()
    context = build_tutor_context(settings, request.message)
    try:
        response = provider.respond(context)
    except (FileNotFoundError, RuntimeError, TimeoutError) as error:
        raise HTTPException(status_code=503, detail=f"Tutor provider unavailable: {error}") from error
    return TutorMessageResponse(provider=settings.tutor_provider, response=response)


@app.get("/api/v1/lessons/{lesson_id}", response_model=LessonResponse)
def get_lesson(lesson_id: int, db: Session = Depends(get_db)) -> LessonResponse:
    lesson = db.scalar(select(Lesson).where(Lesson.id == lesson_id))
    if lesson is None:
        raise HTTPException(status_code=404, detail="Lesson not found")
    exercises = db.scalars(
        select(Exercise).where(Exercise.lesson_id == lesson_id).order_by(Exercise.id)
    ).all()
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
            )
            for exercise in exercises
        ],
    )


@app.post("/api/v1/lessons/{lesson_id}/answer", response_model=LessonAnswerResponse)
def answer_lesson(
    lesson_id: int,
    request: LessonAnswerRequest,
    db: Session = Depends(get_db),
    provider: TutorProvider = Depends(get_tutor_provider),
) -> LessonAnswerResponse:
    lesson = db.scalar(select(Lesson).where(Lesson.id == lesson_id))
    if lesson is None:
        raise HTTPException(status_code=404, detail="Lesson not found")
    exercise = db.scalar(
        select(Exercise).where(Exercise.id == request.exercise_id, Exercise.lesson_id == lesson_id)
    )
    if exercise is None:
        raise HTTPException(status_code=404, detail="Exercise not found in lesson")
    if not request.answer.strip():
        raise HTTPException(status_code=422, detail="Answer must not be empty")

    settings = get_settings()
    assessment_request = (
        f"Урок: {lesson.title}\n"
        f"Вопрос: {exercise.question}\n"
        f"Ответ ученика: {request.answer}\n\n"
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
        user_answer=request.answer,
        is_correct=assessment.is_correct,
        score=assessment.score,
        ai_feedback=assessment.model_dump_json(),
    )
    db.add(user_answer)
    mistake_id: int | None = None
    if not assessment.is_correct:
        course_id = lesson.module.course_id
        category = assessment.mistake_category or "general"
        mistake = db.scalar(
            select(Mistake).where(
                Mistake.course_id == course_id,
                Mistake.category == category,
                Mistake.original_answer == request.answer,
            )
        )
        if mistake is None:
            mistake = Mistake(
                course_id=course_id,
                category=category,
                original_answer=request.answer,
                corrected_answer=assessment.corrected_answer,
                explanation=assessment.explanation,
            )
            db.add(mistake)
            db.flush()
        else:
            mistake.mistake_count += 1
            mistake.corrected_answer = assessment.corrected_answer
            mistake.explanation = assessment.explanation
        mistake_id = mistake.id
    _save_vocabulary(db, lesson.module.course_id, lesson.id, assessment.new_words, mistake_id)
    db.commit()
    db.refresh(attempt)
    db.refresh(user_answer)
    return LessonAnswerResponse(
        attempt_id=attempt.id,
        answer_id=user_answer.id,
        provider=settings.tutor_provider,
        assessment=assessment,
        mistake_id=mistake_id,
    )


@app.post(
    "/api/v1/lessons/{lesson_id}/complete",
    response_model=LessonCompletionResponse,
)
def complete_lesson(lesson_id: int, db: Session = Depends(get_db)) -> LessonCompletionResponse:
    lesson = db.scalar(select(Lesson).where(Lesson.id == lesson_id))
    if lesson is None:
        raise HTTPException(status_code=404, detail="Lesson not found")
    attempt = db.scalar(
        select(LessonAttempt)
        .where(LessonAttempt.lesson_id == lesson_id)
        .order_by(LessonAttempt.id.desc())
    )
    if attempt is None:
        raise HTTPException(status_code=409, detail="Lesson has no attempts")
    attempt.completed = True
    db.commit()
    return LessonCompletionResponse(
        lesson_id=lesson_id,
        attempt_id=attempt.id,
        completed=True,
    )


@app.get("/api/v1/progress", response_model=ProgressResponse)
def get_progress(db: Session = Depends(get_db)) -> ProgressResponse:
    completed_lessons = db.scalar(
        select(func.count(func.distinct(LessonAttempt.lesson_id))).where(
            LessonAttempt.completed.is_(True)
        )
    )


    total_attempts = db.scalar(select(func.count(LessonAttempt.id)))
    total_answers = db.scalar(select(func.count(UserAnswer.id)))
    total_mistakes = db.scalar(select(func.count(Mistake.id)))
    average_score = db.scalar(select(func.avg(LessonAttempt.score)))
    return ProgressResponse(
        completed_lessons=completed_lessons or 0,
        total_attempts=total_attempts or 0,
        total_answers=total_answers or 0,
        total_mistakes=total_mistakes or 0,
        average_score=round(float(average_score), 2) if average_score is not None else None,
    )


@app.get("/api/v1/roadmap", response_model=list[RoadmapModuleResponse])
def get_roadmap(db: Session = Depends(get_db)) -> list[RoadmapModuleResponse]:
    completed_ids = {
        lesson_id
        for lesson_id in db.scalars(
            select(LessonAttempt.lesson_id).where(LessonAttempt.completed.is_(True))
        ).all()
    }
    lessons = _ordered_lessons(db)
    current_lesson = _first_incomplete_lesson(db, lessons)
    modules = db.scalars(select(Module).order_by(Module.order_number, Module.id)).all()
    return [
        RoadmapModuleResponse(
            id=module.id,
            title=module.title,
            order_number=module.order_number,
            lessons=[
                RoadmapLessonResponse(
                    id=lesson.id,
                    slug=lesson.slug,
                    title=lesson.title,
                    order_number=lesson.order_number,
                    status=(
                        "completed"
                        if lesson.id in completed_ids
                        else "current"
                        if current_lesson and lesson.id == current_lesson.id
                        else "upcoming"
                    ),
                    can_repeat=lesson.id in completed_ids,
                )
                for lesson in lessons
                if lesson.module_id == module.id
            ],
        )
        for module in modules
    ]


@app.get("/api/v1/roadmap/levels", response_model=list[RoadmapLevelResponse])
def get_roadmap_levels(db: Session = Depends(get_db)) -> list[RoadmapLevelResponse]:
    a1_modules = get_roadmap(db)
    level_definitions = [
        ("A1", "A1 · Начальный уровень"),
        ("A2", "A2 · Элементарный уровень"),
        ("B1", "B1 · Средний уровень"),
        ("B2", "B2 · Выше среднего"),
    ]
    return [
        RoadmapLevelResponse(
            slug=slug,
            title=title,
            status="current" if slug == "A1" else "upcoming",
            modules=a1_modules if slug == "A1" else [],
        )
        for slug, title in level_definitions
    ]


@app.get("/api/v1/progress/mistakes", response_model=list[MistakeResponse])
def get_mistakes(db: Session = Depends(get_db)) -> list[MistakeResponse]:
    mistakes = db.scalars(
        select(Mistake).order_by(Mistake.mistake_count.desc(), Mistake.id)
    ).all()
    return [
        MistakeResponse(
            id=mistake.id,
            category=mistake.category,
            original_answer=mistake.original_answer,
            corrected_answer=mistake.corrected_answer,
            explanation=mistake.explanation,
            mistake_count=mistake.mistake_count,
        )
        for mistake in mistakes
    ]


@app.get("/api/v1/progress/mistakes/next", response_model=NextMistakeResponse | None)
def get_next_mistake(db: Session = Depends(get_db)) -> NextMistakeResponse | None:
    mistake = db.scalar(
        select(Mistake).order_by(Mistake.mistake_count.desc(), Mistake.last_mistake_at)
    )
    if mistake is None:
        return None
    return NextMistakeResponse(
        id=mistake.id,
        category=mistake.category,
        explanation=mistake.explanation,
        mistake_count=mistake.mistake_count,
    )


@app.get("/api/v1/progress/vocabulary", response_model=list[VocabularyResponse])
def get_vocabulary(db: Session = Depends(get_db)) -> list[VocabularyResponse]:
    items = db.scalars(
        select(VocabularyItem).order_by(VocabularyItem.next_review_at, VocabularyItem.review_count, VocabularyItem.id.desc())
    ).all()
    return [_vocabulary_response(item) for item in items]


@app.get("/api/v1/progress/vocabulary/next", response_model=VocabularyResponse | None)
def get_next_vocabulary(db: Session = Depends(get_db)) -> VocabularyResponse | None:
    item = db.scalar(
        select(VocabularyItem).order_by(VocabularyItem.next_review_at, VocabularyItem.review_count, VocabularyItem.id)
    )
    if item is None:
        return None
    return _vocabulary_response(item)


@app.get("/api/v1/progress/vocabulary/due", response_model=list[VocabularyResponse])
def get_due_vocabulary(db: Session = Depends(get_db)) -> list[VocabularyResponse]:
    now = datetime.now(timezone.utc)
    items = db.scalars(
        select(VocabularyItem)
        .where((VocabularyItem.next_review_at.is_(None)) | (VocabularyItem.next_review_at <= now))
        .order_by(VocabularyItem.next_review_at, VocabularyItem.review_count, VocabularyItem.id)
    ).all()
    return [_vocabulary_response(item) for item in items]


def _vocabulary_response(item: VocabularyItem) -> VocabularyResponse:
    now = datetime.now(timezone.utc)
    next_review_at = item.next_review_at
    if next_review_at is not None and next_review_at.tzinfo is None:
        next_review_at = next_review_at.replace(tzinfo=timezone.utc)
    due = next_review_at is None or next_review_at <= now
    return VocabularyResponse(
        id=item.id,
        mistake_id=item.mistake_id,
        word=item.word,
        translation=item.translation,
        example=item.example,
        review_count=item.review_count,
        interval_days=item.interval_days,
        next_review_at=next_review_at,
        is_due=due,
    )


def _save_vocabulary(
    db: Session,
    course_id: int,
    lesson_id: int | None,
    words,
    mistake_id: int | None = None,
) -> None:
    for word in words:
        normalized = word.word.strip()
        if not normalized:
            continue
        item = db.scalar(
            select(VocabularyItem).where(
                VocabularyItem.course_id == course_id,
                VocabularyItem.word == normalized,
            )
        )
        if item is None:
            db.add(
                VocabularyItem(
                    course_id=course_id,
                    lesson_id=lesson_id,
                    mistake_id=mistake_id,
                    word=normalized,
                    translation=word.translation.strip(),
                    example=word.example,
                    next_review_at=datetime.now(timezone.utc),
                )
            )
        else:
            item.mistake_id = mistake_id or item.mistake_id
            item.translation = word.translation.strip() or item.translation
            item.example = word.example or item.example


@app.post("/api/v1/progress/vocabulary/{item_id}/review", response_model=VocabularyReviewResponse)
def review_vocabulary(item_id: int, db: Session = Depends(get_db)) -> VocabularyReviewResponse:
    item = db.scalar(select(VocabularyItem).where(VocabularyItem.id == item_id))
    if item is None:
        raise HTTPException(status_code=404, detail="Vocabulary item not found")
    now = datetime.now(timezone.utc)
    intervals = (1, 3, 7, 14, 30)
    item.review_count += 1
    item.interval_days = intervals[min(item.review_count - 1, len(intervals) - 1)]
    item.last_reviewed_at = now
    item.next_review_at = now + timedelta(days=item.interval_days)
    db.commit()
    db.refresh(item)
    return VocabularyReviewResponse(**_vocabulary_response(item).model_dump(), reviewed=True)


def _diary_response(entry: DiaryEntry) -> DiaryEntryResponse:
    saved_words: list[VocabularyWord] = []
    if entry.ai_feedback:
        try:
            payload = json.loads(entry.ai_feedback)
            saved_words = [VocabularyWord.model_validate(word) for word in payload.get("new_words", [])]
        except (ValueError, TypeError, json.JSONDecodeError):
            saved_words = []
    return DiaryEntryResponse(
        id=entry.id,
        prompt=entry.prompt,
        original_text=entry.original_text,
        corrected_text=entry.corrected_text,
        explanation=entry.explanation,
        is_correct=entry.is_correct,
        score=entry.score,
        mistake_id=entry.mistake_id,
        created_at=entry.created_at,
        new_words=saved_words,
    )


@app.get("/api/v1/diary/today", response_model=DiaryPromptResponse)
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
        f"Используй тему «{lesson_title}»." if lesson_title else
        "Напиши 3–5 простых предложений по-словацки о сегодняшнем дне."
    )
    return DiaryPromptResponse(
        prompt=prompt,
        lesson_id=lesson.id if lesson else None,
        lesson_title=lesson_title,
        has_entry_today=has_entry,
    )


@app.post("/api/v1/diary/entries", response_model=DiaryEntryResponse)
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
                select(Mistake).where(Mistake.course_id == course.id).order_by(Mistake.mistake_count.desc()).limit(3)
            ).all()
        )
        + "\n"
        + "\n".join(
            f"- слово для повторения: {item.word} — {item.translation}"
            for item in db.scalars(
                select(VocabularyItem).where(VocabularyItem.course_id == course.id).order_by(VocabularyItem.review_count).limit(5)
            ).all()
        )
        + "\n\n"
        "Верни только JSON без markdown с полями: is_correct (boolean), score (integer 0-100), "
        "corrected_answer (string), explanation (string), next_exercise (string), "
        "mistake_category (string или null), new_words (массив объектов word, translation, example). "
        "Исправь естественность и грамматику словацкого текста, объясни ошибки по-русски."
    )
    try:
        assessment = parse_tutor_assessment(provider.respond(build_tutor_context(get_settings(), prompt)))
    except (ValueError, TypeError, json.JSONDecodeError) as error:
        raise HTTPException(status_code=502, detail=f"Invalid diary assessment: {error}") from error
    except (FileNotFoundError, RuntimeError, TimeoutError) as error:
        raise HTTPException(status_code=503, detail=f"Tutor provider unavailable: {error}") from error

    mistake_id: int | None = None
    if not assessment.is_correct:
        category = assessment.mistake_category or "diary"
        mistake = db.scalar(
            select(Mistake).where(
                Mistake.course_id == course.id,
                Mistake.category == category,
                Mistake.original_answer == request.answer,
            )
        )
        if mistake is None:
            mistake = Mistake(
                course_id=course.id,
                category=category,
                original_answer=request.answer,
                corrected_answer=assessment.corrected_answer,
                explanation=assessment.explanation,
            )
            db.add(mistake)
            db.flush()
        else:
            mistake.mistake_count += 1
            mistake.corrected_answer = assessment.corrected_answer
            mistake.explanation = assessment.explanation
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
    _save_vocabulary(db, course.id, lesson.id if lesson else None, assessment.new_words, mistake_id)
    db.commit()
    db.refresh(entry)
    return _diary_response(entry)


@app.get("/api/v1/diary/entries", response_model=list[DiaryEntryResponse])
def list_diary_entries(db: Session = Depends(get_db)) -> list[DiaryEntryResponse]:
    entries = db.scalars(select(DiaryEntry).order_by(DiaryEntry.created_at.desc(), DiaryEntry.id.desc())).all()
    return [_diary_response(entry) for entry in entries]


@app.get("/api/v1/diary/weekly-summary", response_model=DiaryWeeklySummaryResponse)
def get_diary_weekly_summary(db: Session = Depends(get_db)) -> DiaryWeeklySummaryResponse:
    now = datetime.now(timezone.utc)
    since = now - timedelta(days=7)
    entries = db.scalars(select(DiaryEntry).where(DiaryEntry.created_at >= since)).all()
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


@app.post("/api/v1/homework/generate", response_model=HomeworkResponse)
def generate_homework(
    request: HomeworkGenerateRequest,
    db: Session = Depends(get_db),
    provider: TutorProvider = Depends(get_tutor_provider),
) -> HomeworkResponse:
    lesson = db.scalar(select(Lesson).where(Lesson.id == request.lesson_id))
    if lesson is None:
        raise HTTPException(status_code=404, detail="Lesson not found")
    mistake = db.scalar(
        select(Mistake).order_by(Mistake.mistake_count.desc(), Mistake.last_mistake_at)
    )
    focus = mistake.category if mistake else "current lesson"
    focus_details = mistake.explanation if mistake else "Закрепи материал текущего урока."
    prompt = (
        f"Создай домашнее задание для урока «{lesson.title}». "
        f"Слабая тема ученика: {focus}. Контекст ошибки: {focus_details} "
        "Верни ТОЛЬКО JSON без markdown с полями: title, description, focus_category. "
        "Описание должно содержать практическое упражнение на словацком языке, "
        "русский перевод и короткую инструкцию. Не давай готовый ответ."
    )
    context = build_tutor_context(get_settings(), prompt)
    try:
        generation = parse_homework_generation(provider.respond(context))
    except (ValueError, TypeError, json.JSONDecodeError) as error:
        raise HTTPException(status_code=502, detail=f"Invalid homework response: {error}") from error
    except (FileNotFoundError, RuntimeError, TimeoutError) as error:
        raise HTTPException(status_code=503, detail=f"Tutor provider unavailable: {error}") from error

    homework = Homework(
        course_id=lesson.module.course_id,
        lesson_id=lesson.id,
        title=generation.title,
        description=generation.description,
        ai_feedback=generation.model_dump_json(),
    )
    db.add(homework)
    db.commit()
    db.refresh(homework)
    return HomeworkResponse(
        id=homework.id,
        lesson_id=homework.lesson_id,
        title=homework.title,
        description=homework.description,
        status=homework.status,
        score=homework.score,
        focus_category=generation.focus_category,
        submitted_answer=homework.submitted_answer,
        ai_feedback=homework.ai_feedback,
    )


@app.get("/api/v1/homework", response_model=list[HomeworkResponse])
def list_homework(db: Session = Depends(get_db)) -> list[HomeworkResponse]:
    homework_items = db.scalars(select(Homework).order_by(Homework.id.desc())).all()
    return [
        HomeworkResponse(
            id=item.id,
            lesson_id=item.lesson_id,
            title=item.title,
            description=item.description,
            status=item.status,
            score=item.score,
            focus_category=None,
            submitted_answer=item.submitted_answer,
            ai_feedback=item.ai_feedback,
        )
        for item in homework_items
    ]


@app.post("/api/v1/homework/{homework_id}/submit", response_model=HomeworkSubmitResponse)
def submit_homework(
    homework_id: int,
    request: HomeworkSubmitRequest,
    db: Session = Depends(get_db),
    provider: TutorProvider = Depends(get_tutor_provider),
) -> HomeworkSubmitResponse:
    if not request.answer.strip():
        raise HTTPException(status_code=422, detail="Answer must not be empty")
    homework = db.scalar(select(Homework).where(Homework.id == homework_id))
    if homework is None:
        raise HTTPException(status_code=404, detail="Homework not found")
    lesson = db.scalar(select(Lesson).where(Lesson.id == homework.lesson_id))
    prompt = (
        f"Проверь выполнение домашнего задания по уроку «{lesson.title if lesson else 'курс'}».\n"
        f"Задание: {homework.description}\n"
        f"Ответ ученика: {request.answer}\n\n"
        "Верни только JSON без markdown с полями: is_correct (boolean), score (integer 0-100), "
        "corrected_answer (string), explanation (string), next_exercise (string), "
        "mistake_category (string или null). Проверь именно ответ ученика и объясни ошибки по-русски. "
        "Добавь new_words: массив из 0-3 новых слов с полями word, translation, example."
    )
    context = build_tutor_context(get_settings(), prompt)
    try:
        assessment = parse_tutor_assessment(provider.respond(context))
    except (ValueError, TypeError, json.JSONDecodeError) as error:
        raise HTTPException(status_code=502, detail=f"Invalid homework assessment: {error}") from error
    except (FileNotFoundError, RuntimeError, TimeoutError) as error:
        raise HTTPException(status_code=503, detail=f"Tutor provider unavailable: {error}") from error
    homework.submitted_answer = request.answer
    homework.score = assessment.score
    homework.status = "checked"
    homework.ai_feedback = assessment.model_dump_json()
    homework.submitted_at = datetime.now(timezone.utc)
    if lesson is not None:
        _save_vocabulary(db, homework.course_id, lesson.id, assessment.new_words)
    db.commit()
    db.refresh(homework)
    return HomeworkSubmitResponse(
        id=homework.id,
        lesson_id=homework.lesson_id,
        title=homework.title,
        description=homework.description,
        status=homework.status,
        score=homework.score,
        focus_category=assessment.mistake_category,
        submitted_answer=homework.submitted_answer,
        ai_feedback=homework.ai_feedback,
        assessment=assessment,
    )


def _ordered_lessons(db: Session) -> list[Lesson]:
    return list(
        db.scalars(
            select(Lesson)
            .join(Module, Lesson.module_id == Module.id)
            .order_by(Module.order_number, Lesson.order_number, Lesson.id)
        ).all()
    )


def _first_incomplete_lesson(db: Session, lessons: list[Lesson] | None = None) -> Lesson | None:
    ordered_lessons = lessons if lessons is not None else _ordered_lessons(db)
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


def _lesson_title(db: Session, lesson_id: int | None) -> str | None:
    if lesson_id is None:
        return None
    lesson = db.scalar(select(Lesson).where(Lesson.id == lesson_id))
    return lesson.title if lesson else None


@app.post("/api/v1/dialogue/sessions", response_model=DialogueSessionResponse)
def create_dialogue_session(db: Session = Depends(get_db)) -> DialogueSessionResponse:
    lessons = _ordered_lessons(db)
    next_lesson = _first_incomplete_lesson(db, lessons)
    session = LearningSession(current_lesson_id=next_lesson.id if next_lesson else None)
    if next_lesson is None:
        session.status = "completed"
    db.add(session)
    db.commit()
    db.refresh(session)
    return DialogueSessionResponse(
        session_id=session.id,
        current_lesson_id=session.current_lesson_id,
        current_lesson_title=_lesson_title(db, session.current_lesson_id),
        current_phase=session.current_phase,
        status=session.status,
    )


@app.post(
    "/api/v1/dialogue/sessions/{session_id}/select-lesson",
    response_model=DialogueSessionResponse,
)
def select_dialogue_lesson(
    session_id: int,
    request: DialogueLessonSelectionRequest,
    db: Session = Depends(get_db),
) -> DialogueSessionResponse:
    session = db.scalar(select(LearningSession).where(LearningSession.id == session_id))
    if session is None:
        raise HTTPException(status_code=404, detail="Dialogue session not found")
    lesson = db.scalar(select(Lesson).where(Lesson.id == request.lesson_id))
    if lesson is None:
        raise HTTPException(status_code=404, detail="Lesson not found")
    session.current_lesson_id = lesson.id
    session.current_phase = "theory"
    session.status = "active"
    db.commit()
    db.refresh(session)
    return DialogueSessionResponse(
        session_id=session.id,
        current_lesson_id=session.current_lesson_id,
        current_lesson_title=lesson.title,
        current_phase=session.current_phase,
        status=session.status,
    )


@app.get("/api/v1/dialogue/sessions/{session_id}", response_model=DialogueHistoryResponse)
def get_dialogue_session(session_id: int, db: Session = Depends(get_db)) -> DialogueHistoryResponse:
    session = db.scalar(select(LearningSession).where(LearningSession.id == session_id))
    if session is None:
        raise HTTPException(status_code=404, detail="Dialogue session not found")
    return DialogueHistoryResponse(
        session_id=session.id,
        current_lesson_id=session.current_lesson_id,
        current_lesson_title=_lesson_title(db, session.current_lesson_id),
        current_phase=session.current_phase,
        status=session.status,
        messages=[
            DialogueMessageView(role=message.role, content=message.content)
            for message in session.messages
        ],
    )


def _is_save_progress_command(message: str) -> bool:
    normalized = " ".join(message.lower().strip().split())
    return normalized in {
        "сохрани прогресс",
        "сохранить прогресс",
        "save progress",
    }


def _is_theory_request(message: str) -> bool:
    normalized = " ".join(message.lower().strip().split())
    return any(
        phrase in normalized
        for phrase in (
            "где теория",
            "покажи теорию",
            "объясни теорию",
            "объясни тему",
            "начнем урок",
            "начнём урок",
            "начать урок",
            "продолжим занятия",
        )
    )


def _is_practice_request(message: str) -> bool:
    normalized = " ".join(message.lower().strip().split())
    return any(
        phrase in normalized
        for phrase in (
            "готов к упражнению",
            "готов к практике",
            "давай упражнение",
            "давай практику",
            "перейдем к практике",
            "перейдём к практике",
            "практика",
        )
    )


@app.post("/api/v1/progress/reset", response_model=ProgressResetResponse)
def reset_progress(
    request: ProgressResetRequest,
    db: Session = Depends(get_db),
) -> ProgressResetResponse:
    if not request.confirm:
        raise HTTPException(status_code=400, detail="Для сброса передай confirm=true")
    sessions_count = db.query(LearningSession).count()
    attempts_count = db.query(LessonAttempt).count()
    answers_count = db.query(UserAnswer).count()
    mistakes_count = db.query(Mistake).count()
    db.query(DialogueMessage).delete(synchronize_session=False)
    db.query(LearningSession).delete(synchronize_session=False)
    db.query(DiaryEntry).delete(synchronize_session=False)
    db.query(VocabularyItem).delete(synchronize_session=False)
    db.query(Homework).delete(synchronize_session=False)
    db.query(UserAnswer).delete(synchronize_session=False)
    db.query(LessonAttempt).delete(synchronize_session=False)
    db.query(Mistake).delete(synchronize_session=False)
    db.commit()
    next_lesson = _first_incomplete_lesson(db)
    return ProgressResetResponse(
        reset=True,
        deleted_sessions=sessions_count,
        deleted_attempts=attempts_count,
        deleted_answers=answers_count,
        deleted_mistakes=mistakes_count,
        next_lesson_id=next_lesson.id if next_lesson else None,
    )


def _dialogue_progress_summary(db: Session, current_lesson: Lesson | None) -> str:
    lessons = _ordered_lessons(db)
    completed_lesson_ids = {
        lesson_id
        for lesson_id in db.scalars(
            select(LessonAttempt.lesson_id).where(LessonAttempt.completed.is_(True))
        ).all()
    }
    mistakes = db.scalars(
        select(Mistake).order_by(Mistake.mistake_count.desc(), Mistake.id).limit(5)
    ).all()
    homework = db.scalar(select(Homework).order_by(Homework.id.desc()))
    current_index = next(
        (
            index
            for index, lesson in enumerate(lessons)
            if current_lesson and lesson.id == current_lesson.id
        ),
        None,
    )
    roadmap_position = (
        f"{current_index + 1}/{len(lessons)}" if current_index is not None else "курс завершен"
    )
    lines = [
        f"Завершено тем: {len(completed_lesson_ids)} из {len(lessons)}.",
        f"Позиция текущей темы в роадмапе: {roadmap_position}.",
        f"Текущая тема: {current_lesson.title if current_lesson else 'нет'}.",
    ]
    if mistakes:
        lines.append("Ошибки для повторения:")
        lines.extend(
            f"- {mistake.category}: {mistake.explanation} (повторений: {mistake.mistake_count})"
            for mistake in mistakes
        )
    else:
        lines.append("Ошибок для повторения пока нет.")
    if homework:
        lines.append(
            f"Последнее домашнее задание: {homework.title}; статус: {homework.status}; "
            f"описание: {homework.description}"
        )
    else:
        lines.append("Сохраненного домашнего задания пока нет.")
    return "\n".join(lines)


@app.post(
    "/api/v1/dialogue/sessions/{session_id}/messages",
    response_model=DialogueMessageResponse,
)
def send_dialogue_message(
    session_id: int,
    request: DialogueMessageRequest,
    db: Session = Depends(get_db),
    provider: TutorProvider = Depends(get_tutor_provider),
) -> DialogueMessageResponse:
    if not request.message.strip():
        raise HTTPException(status_code=422, detail="Message must not be empty")
    session = db.scalar(select(LearningSession).where(LearningSession.id == session_id))
    if session is None:
        raise HTTPException(status_code=404, detail="Dialogue session not found")

    current_lesson = None
    if session.current_lesson_id is not None:
        current_lesson = db.scalar(select(Lesson).where(Lesson.id == session.current_lesson_id))

    db.add(DialogueMessage(session_id=session.id, role="user", content=request.message))
    progress_saved = False

    if _is_save_progress_command(request.message):
        if current_lesson is None:
            response_text = "Весь доступный курс уже завершен."
            session.status = "completed"
        else:
            homework_prompt = (
                f"Подготовь домашнее задание по завершенной теме «{current_lesson.title}». "
                f"Теория темы: {current_lesson.theory or 'нет отдельной теории'}. "
                "Верни только JSON без markdown с полями: title, description, focus_category. "
                "Описание должно содержать практическое упражнение на словацком языке, "
                "русский перевод и короткую инструкцию. Не давай готовый ответ."
            )
            homework_context = build_tutor_context(get_settings(), homework_prompt)
            try:
                homework_generation = parse_homework_generation(provider.respond(homework_context))
            except (ValueError, TypeError, json.JSONDecodeError) as error:
                raise HTTPException(status_code=502, detail=f"Invalid homework response: {error}") from error
            except (FileNotFoundError, RuntimeError, TimeoutError) as error:
                raise HTTPException(
                    status_code=503,
                    detail=f"Tutor provider unavailable: {error}",
                ) from error
            homework = Homework(
                course_id=current_lesson.module.course_id,
                lesson_id=current_lesson.id,
                title=homework_generation.title,
                description=homework_generation.description,
                ai_feedback=homework_generation.model_dump_json(),
            )
            db.add(homework)
            attempt = db.scalar(
                select(LessonAttempt)
                .where(LessonAttempt.lesson_id == current_lesson.id)
                .order_by(LessonAttempt.id.desc())
            )
            if attempt is None:
                attempt = LessonAttempt(lesson_id=current_lesson.id)
                db.add(attempt)
            attempt.completed = True
            lessons = _ordered_lessons(db)
            current_index = next(
                (index for index, lesson in enumerate(lessons) if lesson.id == current_lesson.id),
                len(lessons) - 1,
            )
            next_lesson = lessons[current_index + 1] if current_index + 1 < len(lessons) else None
            session.current_lesson_id = next_lesson.id if next_lesson else None
            session.current_phase = "theory"
            session.status = "active" if next_lesson else "completed"
            progress_saved = True
            response_text = (
                f"Прогресс сохранен. Тема «{current_lesson.title}» завершена. "
                f"Домашнее задание «{homework.title}» сохранено. "
                + (
                    f"В следующий раз начнем тему «{next_lesson.title}»."
                    if next_lesson
                    else "Курс завершен."
                )
            )
    else:
        if current_lesson is None:
            response_text = "Курс завершен. Можно повторить ошибки или начать новый курс."
        else:
            history = session.messages[-12:]
            history_text = "\n".join(f"{message.role}: {message.content}" for message in history)
            progress_summary = _dialogue_progress_summary(db, current_lesson)
            module = current_lesson.module
            exercises = db.scalars(
                select(Exercise).where(Exercise.lesson_id == current_lesson.id).order_by(Exercise.id)
            ).all()
            exercise_state = "\n".join(
                f"{index}. [{exercise.exercise_type}] {exercise.question}"
                + (f" Инструкция: {exercise.instruction}" if exercise.instruction else "")
                for index, exercise in enumerate(exercises, start=1)
            ) or "Упражнения еще не добавлены."
            theory_mode = session.current_phase == "theory" and not _is_practice_request(request.message)
            if _is_theory_request(request.message) or theory_mode:
                session.current_phase = "theory"
                theory_prompt = (
                    "ТЫ ВЕДЕШЬ ПОЛНОЦЕННЫЙ ЖИВОЙ УРОК. Сейчас фаза объяснения теории.\n"
                    f"Модуль: {module.title}. Текущая тема: {current_lesson.title}. ID: {current_lesson.id}.\n"
                    f"Полная теория темы, на которую нужно опираться:\n{current_lesson.theory or 'Для этой темы теория еще не заполнена.'}\n"
                    f"Сводка прогресса ученика:\n{progress_summary}\n"
                    f"История текущего диалога:\n{history_text}\n\n"
                    "Подробно объясни тему в самом чате, а не отправляй ученика читать боковую карточку. "
                    "Разбирай правила по шагам, связывай их с примерами, переводом и типичными ошибками ученика. "
                    "Отвечай на последний вопрос по существу и не уходи на другую тему. Если вопрос относится к утверждению из теории, "
                    "разбери именно это утверждение. Не выдавай упражнение, пока теория не объяснена и ученик не готов к практике. "
                    "В конце предложи ученику написать «готов к упражнению». Давай только один следующий шаг. "
                    "Не утверждай, что тема завершена или прогресс сохранен: это делает только сервер. "
                    "Правило формата: отвечай по-русски, словацкие примеры давай с переводом; давай только одно упражнение или один следующий шаг."
                )
                context = build_tutor_context(get_settings(), theory_prompt)
                try:
                    ai_response = provider.respond(context)
                except (FileNotFoundError, RuntimeError, TimeoutError) as error:
                    raise HTTPException(
                        status_code=503,
                        detail=f"Tutor provider unavailable: {error}",
                    ) from error
                response_text = (
                    f"Текущая тема: «{current_lesson.title}» ({module.title}).\n\n"
                    f"{ai_response.strip()}\n\n"
                    "Когда будешь готов перейти к практике, напиши: «готов к упражнению»."
                )
            else:
                session.current_phase = "practice"
                prompt = (
                    "ТЫ ВЕДЕШЬ СОСТОЯНИЕ УРОКА. Серверные данные ниже — источник истины.\n"
                    f"Текущая фаза: {session.current_phase}.\n"
                    f"Модуль: {module.title}. Урок: {current_lesson.title}. ID урока: {current_lesson.id}.\n"
                    f"Теория текущего урока:\n{current_lesson.theory or 'нет отдельной теории'}\n"
                    f"Упражнения урока:\n{exercise_state}\n"
                    f"Сводка прогресса:\n{progress_summary}\n"
                    f"История диалога:\n{history_text}\n\n"
                    "Правила состояния: не перескакивай на другую тему; не повторяй дословно упражнение, "
                    "которое уже есть в истории; отвечай на последнее сообщение ученика; если ученик спрашивает теорию, "
                    "сначала объясни теорию, а не выдавай упражнение; давай только один следующий шаг; после нескольких "
                    "разных упражнений подведи итог и попроси написать «сохрани прогресс». Используй практические "
                    "задания и диалоговые сценарии текущей темы по одному: сначала коротко объясни задачу, затем жди ответ. "
                    "Давай только одно упражнение или один следующий шаг. "
                    "Не утверждай, что тема или прогресс завершены без команды сервера."
                )
                context = build_tutor_context(get_settings(), prompt)
                try:
                    response_text = provider.respond(context)
                except (FileNotFoundError, RuntimeError, TimeoutError) as error:
                    raise HTTPException(
                        status_code=503,
                        detail=f"Tutor provider unavailable: {error}",
                    ) from error

    db.add(DialogueMessage(session_id=session.id, role="assistant", content=response_text))
    db.commit()
    db.refresh(session)
    return DialogueMessageResponse(
        session_id=session.id,
        current_lesson_id=session.current_lesson_id,
        current_lesson_title=_lesson_title(db, session.current_lesson_id),
        current_phase=session.current_phase,
        status=session.status,
        response=response_text,
        progress_saved=progress_saved,
    )


@app.get("/api/v1/courses")
def list_courses(db: Session = Depends(get_db)) -> list[dict[str, object]]:
    courses = db.scalars(select(Course).order_by(Course.id)).all()
    return [
        {
            "id": course.id,
            "slug": course.slug,
            "title": course.title,
            "subject": course.subject,
            "language": course.language,
            "level": course.level,
        }
        for course in courses
    ]
