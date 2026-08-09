from contextlib import asynccontextmanager
from datetime import datetime, timedelta, timezone
import json
from pathlib import Path
import re
import unicodedata

from fastapi import Depends, FastAPI, HTTPException
from fastapi.responses import RedirectResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, Field
from sqlalchemy import delete, select
from sqlalchemy.orm import Session

from app.config import get_settings
from app.course_loader import load_course
from app.dependencies import get_tutor_provider
from app.database import Base, engine, ensure_sqlite_schema, get_db
from app.exercise_identity import exercise_identity
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
    ModuleTestAnswer,
    ModuleTestAttempt,
    UserAnswer,
    VocabularyItem,
)
from app.tutor import (
    TutorProvider,
    TutorAssessment,
    VocabularyWord,
    build_tutor_context,
    parse_homework_generation,
    parse_tutor_assessment,
)
from app.routers.tutor import router as tutor_router
from app.routers.courses import router as courses_router
from app.routers.diary import router as diary_router
from app.routers.homework import router as homework_router
from app.routers.practice import router as practice_router
from app.routers.progress import router as progress_router
from app.routers.vocabulary import router as vocabulary_router
from app.schemas.progress import MistakeResponse
from app.schemas.vocabulary import VocabularyResponse
from app.services.lesson_lookup import get_lesson_title as _lesson_title
from app.services.answer_checking import (
    assess_numeric_answer as _assess_numeric_answer,
    parse_numeric_value as _parse_math_value,
)
from app.services.learning_state import (
    clean_vocabulary_field as _clean_vocabulary_field,
    deduplicate_vocabulary as _deduplicate_vocabulary,
    record_mistake as _record_mistake,
    save_vocabulary as _save_vocabulary,
)
from app.services.vocabulary import build_vocabulary_response as _vocabulary_response



@asynccontextmanager
async def lifespan(_: FastAPI):
    settings = get_settings()
    settings.course_path.parent.mkdir(parents=True, exist_ok=True)
    Base.metadata.create_all(bind=engine)
    ensure_sqlite_schema(engine)
    with Session(engine) as db:
        for course_path in settings.course_paths():
            load_course(db, course_path)
        _promote_initial_topic_vocabulary(db)
        _seed_initial_topic_vocabulary(db)
        _seed_completed_topic_vocabulary(db)
        _seed_completed_lesson_content_vocabulary(db)
        _seed_historical_dialogue_vocabulary(db)
        _deduplicate_vocabulary(db)
        _backfill_shared_mistake_analytics(db)
    yield


app = FastAPI(title=get_settings().app_name, lifespan=lifespan)
app.include_router(tutor_router)
app.include_router(courses_router)
app.include_router(diary_router)
app.include_router(homework_router)
app.include_router(practice_router)
app.include_router(progress_router)
app.include_router(vocabulary_router)
legacy_frontend_directory = Path(__file__).resolve().parents[2] / "frontend" / "public" / "legacy"
app.mount("/ui", StaticFiles(directory=legacy_frontend_directory, html=True), name="ui")


class LessonCompletionResponse(BaseModel):
    lesson_id: int
    attempt_id: int
    completed: bool


class NextMistakeResponse(BaseModel):
    id: int
    category: str
    explanation: str
    mistake_count: int


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


class DialogueSessionResponse(BaseModel):
    session_id: int
    title: str | None
    current_lesson_id: int | None
    current_lesson_title: str | None
    current_phase: str
    status: str


class DialogueSessionListItem(DialogueSessionResponse):
    message_count: int
    created_at: datetime
    updated_at: datetime


class DialogueMessageRequest(BaseModel):
    message: str


class DialogueSessionCreateRequest(BaseModel):
    title: str | None = None
    lesson_id: int | None = None


class DialogueLessonSelectionRequest(BaseModel):
    lesson_id: int


class DialogueMessageView(BaseModel):
    role: str
    content: str


class DialogueMessageLogView(DialogueMessageView):
    created_at: datetime


class DialogueHistoryResponse(DialogueSessionResponse):
    messages: list[DialogueMessageView]


class DialogueLogEntry(DialogueSessionResponse):
    created_at: datetime
    updated_at: datetime
    messages: list[DialogueMessageLogView]


class DialogueSessionDeleteResponse(BaseModel):
    session_id: int
    deleted: bool


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
    test_available: bool = False
    test_passed: bool = False
    test_score: int | None = None


class RoadmapLevelResponse(BaseModel):
    slug: str
    title: str
    status: str
    modules: list[RoadmapModuleResponse]


class ModuleTestQuestionResponse(BaseModel):
    id: str
    type: str
    question: str
    options: list[str] = Field(default_factory=list)


class ModuleTestResponse(BaseModel):
    module_id: int
    module_title: str
    available: bool
    completed_lessons: int
    total_lessons: int
    passed: bool
    score: int | None = None
    passing_score: int = 70
    questions: list[ModuleTestQuestionResponse]
    history: list[dict] = Field(default_factory=list)


class ModuleTestSubmitRequest(BaseModel):
    answers: dict[str, str]


class ModuleTestSubmitResponse(ModuleTestResponse):
    correct_answers: dict[str, str]


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.get("/", include_in_schema=False)
def ui_home() -> RedirectResponse:
    return RedirectResponse(url="/ui/")


@app.get("/api/v1/lessons/{lesson_id}/vocabulary", response_model=list[VocabularyResponse])
def get_lesson_vocabulary(lesson_id: int, db: Session = Depends(get_db)) -> list[VocabularyResponse]:
    lesson = db.scalar(select(Lesson).where(Lesson.id == lesson_id))
    if lesson is None:
        raise HTTPException(status_code=404, detail="Lesson not found")
    items = db.scalars(
        select(VocabularyItem)
        .where(VocabularyItem.lesson_id == lesson_id, VocabularyItem.is_saved.is_(False))
        .order_by(VocabularyItem.created_at.desc(), VocabularyItem.id.desc())
    ).all()
    return [_vocabulary_response(item, lesson.title) for item in items]


def _lesson_has_correct_answer(db: Session, lesson_id: int) -> bool:
    return db.scalar(
        select(UserAnswer.id)
        .join(Exercise, UserAnswer.exercise_id == Exercise.id)
        .where(Exercise.lesson_id == lesson_id, UserAnswer.is_correct.is_(True))
        .limit(1)
    ) is not None


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
    if not _lesson_has_correct_answer(db, lesson_id):
        raise HTTPException(status_code=409, detail="Lesson requires at least one correct answer")
    attempt.completed = True
    db.commit()
    return LessonCompletionResponse(
        lesson_id=lesson_id,
        attempt_id=attempt.id,
        completed=True,
    )


@app.get("/api/v1/roadmap", response_model=list[RoadmapModuleResponse])
def get_roadmap(course_slug: str = "slovak-a1", db: Session = Depends(get_db)) -> list[RoadmapModuleResponse]:
    course = db.scalar(select(Course).where(Course.slug == course_slug))
    if course is None:
        raise HTTPException(status_code=404, detail="Course not found")
    completed_ids = {
        lesson_id
        for lesson_id in db.scalars(
            select(LessonAttempt.lesson_id).where(LessonAttempt.completed.is_(True))
        ).all()
    }
    lessons = _ordered_lessons(db, course_slug)
    current_lesson = _first_incomplete_lesson(db, lessons)
    modules = db.scalars(
        select(Module).where(Module.course_id == course.id).order_by(Module.order_number, Module.id)
    ).all()
    response = []
    for module in modules:
        module_lessons = [lesson for lesson in lessons if lesson.module_id == module.id]
        latest_test = db.scalar(
            select(ModuleTestAttempt)
            .where(ModuleTestAttempt.module_id == module.id)
            .order_by(ModuleTestAttempt.id.desc())
        )
        response.append(RoadmapModuleResponse(
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
                for lesson in module_lessons
            ],
            test_available=bool(module_lessons) and all(lesson.id in completed_ids for lesson in module_lessons),
            test_passed=bool(latest_test and latest_test.passed),
            test_score=latest_test.score if latest_test else None,
        ))
    return response


@app.get("/api/v1/roadmap/levels", response_model=list[RoadmapLevelResponse])
def get_roadmap_levels(db: Session = Depends(get_db)) -> list[RoadmapLevelResponse]:
    a1_modules = get_roadmap(db=db)
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


MODULE_TEST_PASSING_SCORE = 70

_MODULE_TESTS = {
    "introductions": [
        {"id": "greeting", "type": "text", "question": "Переведи: Добрый день!", "answer": "Dobrý deň"},
        {"id": "morning", "type": "text", "question": "Переведи: Доброе утро!", "answer": "Dobré ráno"},
        {"id": "goodbye", "type": "text", "question": "Переведи: До свидания!", "answer": "Dovidenia"},
        {"id": "how-are-you", "type": "choice", "question": "Выбери неформальный вопрос: «Как ты?»", "options": ["Ako sa máš?", "Ako sa máte?", "Kde bývaš?"], "answer": "Ako sa máš?"},
        {"id": "name", "type": "text", "question": "Переведи: Меня зовут Сергей.", "answer": "Volám sa Sergej"},
        {"id": "country", "type": "text", "question": "Переведи: Я из России.", "answer": "Som z Ruska"},
        {"id": "city", "type": "text", "question": "Переведи: Я живу в Санкт-Петербурге.", "answer": "Bývam v Petrohrade"},
        {"id": "nice-to-meet", "type": "text", "question": "Переведи: Приятно познакомиться.", "answer": "Teší ma"},
        {"id": "numbers", "type": "text", "question": "Переведи: У меня пять книг.", "answer": "Mám päť kníh"},
        {"id": "four-coffees", "type": "text", "question": "Переведи: У нас четыре кофе.", "answer": "Máme štyri kávy"},
        {"id": "count", "type": "choice", "question": "Как спросить «Сколько?»", "options": ["Koľko?", "Kto?", "Kedy?"], "answer": "Koľko?"},
        {"id": "five-apples", "type": "text", "question": "Переведи: пять яблок.", "answer": "päť jabĺk"},
        {"id": "day", "type": "text", "question": "Переведи: Сегодня понедельник.", "answer": "Dnes je pondelok"},
        {"id": "friday", "type": "text", "question": "Переведи: Сегодня пятница.", "answer": "Dnes je piatok"},
        {"id": "work-monday", "type": "text", "question": "Переведи: В понедельник я работаю.", "answer": "V pondelok pracujem"},
        {"id": "month", "type": "choice", "question": "Как будет «июль»?", "options": ["júl", "jún", "január"], "answer": "júl"},
        {"id": "pronoun", "type": "choice", "question": "Выбери: «мы учимся»", "options": ["My sa učíme", "Oni pracujú", "Ja som doma"], "answer": "My sa učíme"},
        {"id": "they-work", "type": "text", "question": "Переведи: Они работают.", "answer": "Oni pracujú"},
        {"id": "i-home", "type": "choice", "question": "Выбери: «Я дома»", "options": ["Som doma", "Si doma", "Sú doma"], "answer": "Som doma"},
        {"id": "we-friends", "type": "text", "question": "Переведи: Мы друзья.", "answer": "Sme priatelia"},
        {"id": "byt", "type": "choice", "question": "Выбери правильный вариант: «Ты дома?»", "options": ["Si doma?", "Ste doma?", "Je doma?"], "answer": "Si doma?"},
        {"id": "they-not", "type": "text", "question": "Переведи: Они не из Братиславы.", "answer": "Nie sú z Bratislavy"},
        {"id": "who", "type": "choice", "question": "Как спросить «Кто вы?»", "options": ["Kto ste?", "Kde ste?", "Odkiaľ ste?"], "answer": "Kto ste?"},
        {"id": "question", "type": "text", "question": "Как спросить: «Как тебя зовут?»", "answer": "Ako sa voláš?"},
        {"id": "introduction", "type": "text", "question": "Составь фразу: «Меня зовут Сергей. Я из России.»", "answer": "Volám sa Sergej. Som z Ruska."},
    ],
}


def _module_test_payload(db: Session, module: Module) -> tuple[dict, list[dict], set[int]]:
    lessons = db.scalars(select(Lesson).where(Lesson.module_id == module.id)).all()
    completed_ids = {
        lesson_id for lesson_id in db.scalars(
            select(LessonAttempt.lesson_id).where(LessonAttempt.completed.is_(True))
        ).all()
    }
    definition = _MODULE_TESTS.get(module.slug)
    if definition is not None:
        definition = [dict(item) for item in definition]
    else:
        definition = []
        seen_exercise_identities: set[tuple[str, str]] = set()
        for lesson in sorted(lessons, key=lambda item: item.order_number):
            for exercise in lesson.exercises:
                if exercise.exercise_type in {"translation", "numeric_answer"} and exercise.correct_answer:
                    identity = exercise_identity(exercise.question, exercise.instruction)
                    if identity in seen_exercise_identities:
                        continue
                    definition.append({
                        "id": f"lesson-{lesson.id}-exercise-{exercise.id}",
                        "type": "text",
                        "question": exercise.question,
                        "answer": exercise.correct_answer,
                        "explanation": _lesson_test_explanation(lesson, exercise.correct_answer),
                    })
                    seen_exercise_identities.add(identity)
                    if len(definition) >= 10:
                        break
            if len(definition) >= 10:
                break
    return (
        {
            "module_id": module.id,
            "module_title": module.title,
            "available": bool(lessons) and all(lesson.id in completed_ids for lesson in lessons),
            "completed_lessons": sum(lesson.id in completed_ids for lesson in lessons),
            "total_lessons": len(lessons),
        },
        definition,
        completed_ids,
    )


@app.get("/api/v1/modules/{module_id}/final-test", response_model=ModuleTestResponse)
def get_module_final_test(module_id: int, db: Session = Depends(get_db)) -> ModuleTestResponse:
    module = db.scalar(select(Module).where(Module.id == module_id))
    if module is None:
        raise HTTPException(status_code=404, detail="Module not found")
    payload, definition, _ = _module_test_payload(db, module)
    latest = db.scalar(
        select(ModuleTestAttempt).where(ModuleTestAttempt.module_id == module.id).order_by(ModuleTestAttempt.id.desc())
    )
    return ModuleTestResponse(
        **payload,
        passed=bool(latest and latest.passed),
        score=latest.score if latest else None,
        passing_score=MODULE_TEST_PASSING_SCORE,
        questions=[ModuleTestQuestionResponse(**{key: item[key] for key in ("id", "type", "question", "options") if key in item}) for item in definition],
        history=_module_test_history(db, module.id),
    )


def _normalize_test_answer(value: str) -> str:
    normalized = unicodedata.normalize("NFC", value).casefold().replace("ё", "е")
    return " ".join(normalized.split()).strip(" .,!?:;\"'«»")


def _test_answers_equal(module: Module, submitted: str, expected: str) -> bool:
    if module.course.subject == "mathematics":
        expected_value = _parse_math_value(expected)
        submitted_value = _parse_math_value(submitted)
        return expected_value is not None and submitted_value == expected_value
    return _normalize_test_answer(submitted) == _normalize_test_answer(expected)


def _lesson_test_explanation(lesson: Lesson, expected_answer: str) -> str:
    explanation = _specific_test_explanation(lesson.slug, expected_answer)
    if explanation:
        return explanation
    rule = (lesson.theory or "").split("\n", 1)[0].strip()
    return f"Правило темы «{lesson.title}»: {rule}" if rule else "Сверь форму слов с правилом текущей темы."


def _specific_test_explanation(lesson_slug: str, expected_answer: str) -> str | None:
    answer = _normalize_test_answer(expected_answer)
    if lesson_slug == "adjective-gender":
        if answer == _normalize_test_answer("malá kniha"):
            return "kniha — существительное женского рода. Поэтому «маленькая» имеет женскую форму malá на -á, а не мужскую malý и не среднюю malé."
        if answer == _normalize_test_answer("To je dobrá kniha"):
            return "To je — готовая конструкция «это есть». kniha — женский род, поэтому «хорошая» согласуется с ней: dobrá на -á. Формы dobrý и dobré относятся к мужскому и среднему роду."
        if answer == _normalize_test_answer("To je veľké okno"):
            return "To je — «это есть». okno — существительное среднего рода, поэтому «большое» имеет среднюю форму veľké на -é. Формы veľký и veľká были бы мужским и женским родом."
    if lesson_slug == "adjective-plural":
        return "Во множественном числе прилагательное согласуется с существительным: noví učitelia — мужчины-учителя, но nové knihy — книги и dobré autá — машины. Выбери форму по роду и числу существительного."
    if lesson_slug == "demonstratives-and-possessives":
        if answer == _normalize_test_answer("Tento veľký dom"):
            return "tento — «этот, вот этот» для мужского рода, потому что dom — мужского рода. Прилагательное тоже мужского рода: veľký. Нельзя táto/toto или veľká/veľké, потому что они относятся к другим родам."
        if answer == _normalize_test_answer("Moja nová kniha"):
            return "kniha — женского рода. Поэтому «моя» = moja и «новая» = nová: обе формы на -a. Модель: moja nová kniha, а не môj nové kniha."
        if answer == _normalize_test_answer("moja kniha"):
            return "kniha — женского рода, поэтому притяжательная форма «моя» = moja. Формы môj и moje используются с мужским и средним родом."
    return None


def _module_test_explanation(item: dict) -> str:
    return item.get(
        "explanation",
        "Проверь ход решения и порядок слов, затем попробуй ответить ещё раз.",
    )


def _module_test_history(db: Session, module_id: int) -> list[dict]:
    module = db.scalar(select(Module).where(Module.id == module_id))
    definition = _module_test_payload(db, module)[1] if module is not None else []
    definitions_by_id = {item["id"]: item for item in definition}
    attempts = db.scalars(
        select(ModuleTestAttempt)
        .where(ModuleTestAttempt.module_id == module_id)
        .order_by(ModuleTestAttempt.id.desc())
    ).all()
    history = []
    for attempt in attempts:
        answers = db.scalars(
            select(ModuleTestAnswer)
            .where(ModuleTestAnswer.attempt_id == attempt.id)
            .order_by(ModuleTestAnswer.id)
        ).all()
        stored_answers = {}
        if not answers and attempt.answers_json:
            try:
                stored_answers = json.loads(attempt.answers_json)
            except (TypeError, ValueError, json.JSONDecodeError):
                stored_answers = {}
        mistakes = [
            {
                "question_id": item["id"],
                "question": item["question"],
                "submitted_answer": stored_answers.get(item["id"], ""),
                "expected_answer": item["answer"],
                "explanation": _module_test_explanation(item),
            }
            for item in definition
            if stored_answers and not _test_answers_equal(module, stored_answers.get(item["id"], ""), item["answer"])
        ] if stored_answers else [
            {
                "question_id": answer.question_id,
                "question": answer.question,
                "submitted_answer": answer.submitted_answer,
                "expected_answer": answer.expected_answer,
                "explanation": _module_test_explanation(definitions_by_id.get(answer.question_id, {})),
            }
            for answer in answers if not answer.is_correct
        ]
        history.append({
            "id": attempt.id,
            "score": attempt.score,
            "passed": attempt.passed,
            "created_at": attempt.created_at,
            "details_available": bool(answers or stored_answers),
            "mistakes": mistakes,
        })
    return history


@app.post("/api/v1/modules/{module_id}/final-test/submit", response_model=ModuleTestSubmitResponse)
def submit_module_final_test(
    module_id: int,
    request: ModuleTestSubmitRequest,
    db: Session = Depends(get_db),
) -> ModuleTestSubmitResponse:
    module = db.scalar(select(Module).where(Module.id == module_id))
    if module is None:
        raise HTTPException(status_code=404, detail="Module not found")
    payload, definition, _ = _module_test_payload(db, module)
    if not payload["available"]:
        raise HTTPException(status_code=409, detail="Сначала заверши все темы модуля")
    correct_answers = {item["id"]: item["answer"] for item in definition}
    correct_count = sum(
        _test_answers_equal(module, request.answers.get(item["id"], ""), item["answer"])
        for item in definition
    )
    score = round(correct_count / len(definition) * 100) if definition else 0
    attempt = ModuleTestAttempt(
        module_id=module.id,
        score=score,
        passed=score >= MODULE_TEST_PASSING_SCORE,
        answers_json=json.dumps(request.answers, ensure_ascii=False),
    )
    db.add(attempt)
    db.flush()
    for item in definition:
        submitted_answer = request.answers.get(item["id"], "")
        is_correct = _test_answers_equal(module, submitted_answer, item["answer"])
        db.add(ModuleTestAnswer(
            attempt_id=attempt.id,
            question_id=item["id"],
            question=item["question"],
            expected_answer=item["answer"],
            submitted_answer=submitted_answer,
            is_correct=is_correct,
        ))
        if not is_correct:
            _record_mistake(
                db,
                course_id=module.course_id,
                source="test",
                category=f"module-test:{module.slug}",
                original_answer=submitted_answer or "—",
                corrected_answer=item["answer"],
                explanation=f"{item['question']} Правильный ответ: {item['answer']}.",
            )
    db.commit()
    return ModuleTestSubmitResponse(
        **payload,
        passed=attempt.passed,
        score=score,
        passing_score=MODULE_TEST_PASSING_SCORE,
        questions=[ModuleTestQuestionResponse(**{key: item[key] for key in ("id", "type", "question", "options") if key in item}) for item in definition],
        correct_answers={},
        history=_module_test_history(db, module.id),
    )


@app.get("/api/v1/progress/mistakes/next", response_model=NextMistakeResponse | None)
def get_next_mistake(course_slug: str = "slovak-a1", db: Session = Depends(get_db)) -> NextMistakeResponse | None:
    course = db.scalar(select(Course).where(Course.slug == course_slug))
    if course is None:
        raise HTTPException(status_code=404, detail="Course not found")
    mistake = db.scalar(
        select(Mistake)
        .where(Mistake.resolved.is_(False), Mistake.course_id == course.id)
        .order_by(Mistake.mistake_count.desc(), Mistake.last_mistake_at)
    )
    if mistake is None:
        return None
    return NextMistakeResponse(
        id=mistake.id,
        category=mistake.category,
        explanation=mistake.explanation,
        mistake_count=mistake.mistake_count,
    )


def _promote_initial_topic_vocabulary(db: Session) -> None:
    initial_lesson_ids = db.scalars(
        select(Lesson.id)
        .join(Module, Lesson.module_id == Module.id)
        .where(Module.slug == "introductions", Lesson.order_number <= 2)
    ).all()
    if not initial_lesson_ids:
        return
    db.query(VocabularyItem).filter(
        VocabularyItem.lesson_id.in_(initial_lesson_ids)
    ).update({VocabularyItem.is_saved: True}, synchronize_session=False)
    db.commit()


_INITIAL_TOPIC_VOCABULARY = {
    "greetings": [
        ("Dobrý deň", "Добрый день", "Dobrý deň! Ako sa máte?"),
        ("Dobré ráno", "Доброе утро", "Dobré ráno!"),
        ("Dobrý večer", "Добрый вечер", "Dobrý večer!"),
        ("Ahoj", "Привет / пока", "Ahoj! Ako sa máš?"),
        ("Čau", "Привет / пока", "Čau, zajtra!"),
        ("Dovidenia", "До свидания", "Dovidenia zajtra!"),
        ("Ako sa máte?", "Как вы?", "Dobrý deň, ako sa máte?"),
        ("Ako sa máš?", "Как ты?", "Ahoj, ako sa máš?"),
    ],
    "introductions": [
        ("Volám sa", "Меня зовут", "Volám sa Sergej."),
        ("Som z Ruska", "Я из России", "Som z Ruska."),
        ("Bývam v Petrohrade", "Я живу в Санкт-Петербурге", "Bývam v Petrohrade."),
        ("Teší ma", "Приятно познакомиться", "Teší ma."),
        ("Ako sa voláš?", "Как тебя зовут?", "Ahoj, ako sa voláš?"),
        ("Odkiaľ si?", "Откуда ты?", "Odkiaľ si?"),
        ("Kde bývaš?", "Где ты живёшь?", "Kde bývaš?"),
    ],
}

_COMPLETED_TOPIC_VOCABULARY = {
    "numbers": [
        ("nula", "ноль", "Mám nula eur."),
        ("jeden", "один", "Jeden dom."),
        ("dva", "два", "Mám dva chleby."),
        ("dve", "две", "Mám dve kávy."),
        ("tri", "три", "Mám tri knihy."),
        ("štyri", "четыре", "Mám štyri rožky."),
        ("päť", "пять", "Mám päť jabĺk."),
        ("šesť", "шесть", "Mám šesť kníh."),
        ("sedem", "семь", "Sedem dní."),
        ("osem", "восемь", "Osem kníh."),
        ("deväť", "девять", "Deväť jabĺk."),
        ("desať", "десять", "Desať eur."),
        ("Koľko?", "Сколько?", "Koľko máš kníh?"),
        ("Mám tri knihy", "У меня три книги", "Mám tri knihy."),
        ("Je nás päť", "Нас пятеро", "Je nás päť."),
        ("päť jabĺk", "пять яблок", "Mám päť jabĺk."),
    ],
    "days-and-months": [
        ("pondelok", "понедельник", "Dnes je pondelok."),
        ("utorok", "вторник", "V utorok pracujem."),
        ("streda", "среда", "V stredu pracujem."),
        ("štvrtok", "четверг", "Vo štvrtok pracujem."),
        ("piatok", "пятница", "V piatok oddychujem."),
        ("sobota", "суббота", "V sobotu oddychujem."),
        ("nedeľa", "воскресенье", "V nedeľu oddychujem."),
        ("január", "январь", "V januári je zima."),
        ("február", "февраль", "Vo februári je zima."),
        ("marec", "март", "V marci začína jar."),
        ("apríl", "апрель", "V apríli je jar."),
        ("máj", "май", "V máji je teplo."),
        ("jún", "июнь", "V júni je leto."),
        ("júl", "июль", "V júli je leto."),
        ("august", "август", "V auguste cestujem."),
        ("september", "сентябрь", "V septembri začína škola."),
        ("október", "октябрь", "V októbri je jeseň."),
        ("november", "ноябрь", "V novembri je chladno."),
        ("december", "декабрь", "V decembri sú sviatky."),
        ("Dnes je pondelok", "Сегодня понедельник", "Dnes je pondelok."),
    ],
}


def _extract_explicit_vocabulary(text: str) -> list[VocabularyWord]:
    """Extract Slovak–Russian pairs written in tutor text as a dash pair."""
    if not text:
        return []
    pairs: list[VocabularyWord] = []
    text = text.replace("**", "").replace("__", "").replace("`", "")
    pattern = re.compile(
        r"([A-Za-zÁÄČĎÉÍĹĽŇÓÔŔŠŤÚÝŽáäčďéíĺľňóôŕšťúýž][A-Za-zÁÄČĎÉÍĹĽŇÓÔŔŠŤÚÝŽáäčďéíĺľňóôŕšťúýž0-9 .,'?!()/-]{0,100}?)\s*[—–]\s*[«\"]?([^\n»\"]{1,180}?)[»\"]?(?=\.|\n|$)"
    )
    for match in pattern.finditer(text):
        word = _clean_vocabulary_field(match.group(1))
        translation = _clean_vocabulary_field(match.group(2))
        if not word or not translation:
            continue
        if not re.search(r"[A-Za-zÁÄČĎÉÍĹĽŇÓÔŔŠŤÚÝŽáäčďéíĺľňóôŕšťúýž]", word):
            continue
        if not re.search(r"[А-Яа-яЁё]", translation):
            continue
        if len(word.split()) > 12:
            continue
        pairs.append(VocabularyWord(word=word, translation=translation, example=None))
    return pairs


def _save_content_vocabulary(db: Session, lesson: Lesson, words: list[VocabularyWord]) -> None:
    if words:
        _save_vocabulary(db, lesson.module.course_id, lesson.id, words)


def _seed_completed_lesson_content_vocabulary(db: Session) -> None:
    completed_lesson_ids = set(
        db.scalars(
            select(LessonAttempt.lesson_id).where(LessonAttempt.completed.is_(True))
        ).all()
    )
    if not completed_lesson_ids:
        return
    lessons = db.scalars(select(Lesson).where(Lesson.id.in_(completed_lesson_ids))).all()
    for lesson in lessons:
        words = _extract_explicit_vocabulary(lesson.theory or "")
        for exercise in lesson.exercises:
            if exercise.correct_answer:
                question = re.sub(r"^.*?:\s*", "", exercise.question or "")
                words.append(
                    VocabularyWord(
                        word=exercise.correct_answer,
                        translation=question,
                        example=exercise.correct_answer,
                    )
                )
        _save_content_vocabulary(db, lesson, words)
    db.commit()


def _seed_historical_dialogue_vocabulary(db: Session) -> None:
    messages = db.scalars(
        select(DialogueMessage).where(DialogueMessage.role == "assistant")
    ).all()
    for message in messages:
        session = db.scalar(select(LearningSession).where(LearningSession.id == message.session_id))
        if session is None or session.current_lesson_id is None:
            continue
        lesson = db.scalar(select(Lesson).where(Lesson.id == session.current_lesson_id))
        if lesson is not None:
            _save_content_vocabulary(db, lesson, _extract_explicit_vocabulary(message.content))
    db.commit()


def _seed_initial_topic_vocabulary(db: Session) -> None:
    course = db.scalar(select(Course).where(Course.slug == "slovak-a1"))
    if course is None:
        return
    lessons = db.scalars(
        select(Lesson).join(Module, Lesson.module_id == Module.id).where(
            Module.course_id == course.id,
            Lesson.slug.in_(list(_INITIAL_TOPIC_VOCABULARY)),
        )
    ).all()
    for lesson in lessons:
        for word, translation, example in _INITIAL_TOPIC_VOCABULARY.get(lesson.slug, []):
            item = db.scalar(
                select(VocabularyItem).where(
                    VocabularyItem.course_id == course.id,
                    VocabularyItem.word == word,
                )
            )
            if item is None:
                db.add(
                    VocabularyItem(
                        course_id=course.id,
                        lesson_id=lesson.id,
                        word=word,
                        translation=translation,
                        example=example,
                        is_saved=True,
                    )
                )
            else:
                item.lesson_id = lesson.id
                item.translation = translation
                item.example = example
                item.is_saved = True
    db.commit()


def _seed_completed_topic_vocabulary(db: Session) -> None:
    completed_lesson_ids = set(
        db.scalars(
            select(LessonAttempt.lesson_id).where(LessonAttempt.completed.is_(True))
        ).all()
    )
    if not completed_lesson_ids:
        return
    lessons = db.scalars(
        select(Lesson).where(
            Lesson.id.in_(completed_lesson_ids),
            Lesson.slug.in_(list(_COMPLETED_TOPIC_VOCABULARY)),
        )
    ).all()
    for lesson in lessons:
        course_id = db.scalar(select(Module.course_id).where(Module.id == lesson.module_id))
        if course_id is None:
            continue
        for word, translation, example in _COMPLETED_TOPIC_VOCABULARY[lesson.slug]:
            item = db.scalar(
                select(VocabularyItem).where(
                    VocabularyItem.course_id == course_id,
                    VocabularyItem.word == word,
                )
            )
            if item is None:
                db.add(
                    VocabularyItem(
                        course_id=course_id,
                        lesson_id=lesson.id,
                        word=word,
                        translation=translation,
                        example=example,
                        is_saved=True,
                    )
                )
            else:
                item.lesson_id = lesson.id
                item.translation = translation
                item.example = example
                item.is_saved = True
    db.commit()


def _backfill_shared_mistake_analytics(db: Session) -> None:
    """Import structured historical homework, diary, and test errors once."""
    for dialogue_mistake in db.scalars(
        select(Mistake).where(
            Mistake.source == "dialogue",
            Mistake.exercise_id.is_(None),
            Mistake.lesson_id.is_not(None),
        )
    ).all():
        dialogue_mistake.exercise_id = _first_uncompleted_exercise_id(db, dialogue_mistake.lesson_id)
    diary_entries = db.scalars(
        select(DiaryEntry).where(DiaryEntry.mistake_id.is_not(None))
    ).all()
    for entry in diary_entries:
        mistake = db.scalar(select(Mistake).where(Mistake.id == entry.mistake_id))
        if mistake is not None:
            mistake.source = "diary"
            mistake.lesson_id = entry.lesson_id or mistake.lesson_id

    homework_items = db.scalars(
        select(Homework).where(
            Homework.status == "checked",
            Homework.submitted_answer.is_not(None),
            Homework.ai_feedback.is_not(None),
        )
    ).all()
    for homework in homework_items:
        try:
            assessment = TutorAssessment.model_validate_json(homework.ai_feedback)
        except (ValueError, TypeError):
            continue
        if assessment.is_correct:
            continue
        existing = db.scalar(
            select(Mistake).where(
                Mistake.course_id == homework.course_id,
                Mistake.source == "homework",
                Mistake.original_answer == homework.submitted_answer.strip(),
            )
        )
        if existing is None:
            existing = _record_mistake(
                db,
                course_id=homework.course_id,
                lesson_id=homework.lesson_id,
                source="homework",
                category=assessment.mistake_category or "homework",
                original_answer=homework.submitted_answer,
                corrected_answer=assessment.corrected_answer,
                explanation=assessment.explanation,
            )
        homework.mistake_id = existing.id

    wrong_test_answers = db.scalars(
        select(ModuleTestAnswer).where(ModuleTestAnswer.is_correct.is_(False))
    ).all()
    for answer in wrong_test_answers:
        attempt = db.scalar(
            select(ModuleTestAttempt).where(ModuleTestAttempt.id == answer.attempt_id)
        )
        module = (
            db.scalar(select(Module).where(Module.id == attempt.module_id))
            if attempt is not None
            else None
        )
        if module is None:
            continue
        existing = db.scalar(
            select(Mistake).where(
                Mistake.course_id == module.course_id,
                Mistake.source == "test",
                Mistake.original_answer == (answer.submitted_answer.strip() or "—"),
                Mistake.corrected_answer == answer.expected_answer,
            )
        )
        if existing is None:
            _record_mistake(
                db,
                course_id=module.course_id,
                source="test",
                category=f"module-test:{module.slug}",
                original_answer=answer.submitted_answer or "—",
                corrected_answer=answer.expected_answer,
                explanation=f"{answer.question} Правильный ответ: {answer.expected_answer}.",
            )
    db.commit()


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
        f"CURRENT LESSON THEORY — HARD GRAMMAR BOUNDARY:\n{lesson.theory or 'Теория не заполнена.'}\n"
        "PREREQUISITE RULE: Test only grammar rules explicitly explained in CURRENT LESSON THEORY or earlier lessons. "
        "Never require a case, conjugation, declension, or word-form change that has not been explained yet. "
        "A construction appearing in an example does not authorize a hidden inflection rule. Build the task so it can "
        "be completed entirely with unchanged dictionary forms and patterns explicitly demonstrated in the theory. "
        "Do not jump ahead to later course topics. "
        "EXERCISE WORD-BANK RULE: If the learner must compose phrases, name objects, or choose noun forms, "
        "include a ready-to-use bank of 5-8 Slovak nouns. For every noun give its grammatical gender "
        "(m./f./n.) and Russian translation. Prefer vocabulary from the current topic and add a few useful "
        "new words. The learner must never need to invent unknown nouns from memory. "
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
        mistake_id=homework.mistake_id,
        submitted_answer=homework.submitted_answer,
        ai_feedback=homework.ai_feedback,
    )


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
            mistake_id=item.mistake_id,
            submitted_answer=item.submitted_answer,
            ai_feedback=item.ai_feedback,
        )
        for item in homework_items
    ]


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
        f"CURRENT LESSON THEORY — HARD GRADING BOUNDARY:\n{lesson.theory if lesson and lesson.theory else 'Теория не заполнена.'}\n"
        "ASSESSMENT SCOPE RULE: Grade only grammar explicitly explained in CURRENT LESSON THEORY or earlier lessons. "
        "Do not deduct points for a case, conjugation, declension, or word-form change that has not been taught yet. "
        "If the generated task accidentally requires later grammar, accept an answer that demonstrates the current "
        "lesson target, clearly say the task exceeded the lesson scope, and do not make the learner correct the future rule. "
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
    mistake_id: int | None = None
    if not assessment.is_correct:
        mistake = _record_mistake(
            db,
            course_id=homework.course_id,
            lesson_id=lesson.id if lesson else None,
            source="homework",
            category=assessment.mistake_category or "homework",
            original_answer=request.answer,
            corrected_answer=assessment.corrected_answer,
            explanation=assessment.explanation,
        )
        mistake_id = mistake.id
        homework.mistake_id = mistake.id
    elif homework.mistake_id is not None:
        previous_mistake = db.scalar(select(Mistake).where(Mistake.id == homework.mistake_id))
        if previous_mistake is not None:
            previous_mistake.resolved = True
        homework.mistake_id = None
    if lesson is not None:
        _save_vocabulary(db, homework.course_id, lesson.id, assessment.new_words, mistake_id)
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
        mistake_id=homework.mistake_id,
        submitted_answer=homework.submitted_answer,
        ai_feedback=homework.ai_feedback,
        assessment=assessment,
    )


def _ordered_lessons(db: Session, course_slug: str = "slovak-a1") -> list[Lesson]:
    return list(
        db.scalars(
            select(Lesson)
            .join(Module, Lesson.module_id == Module.id)
            .join(Course, Module.course_id == Course.id)
            .where(Course.slug == course_slug)
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


def _first_uncompleted_exercise_id(db: Session, lesson_id: int) -> int | None:
    exercises = db.scalars(
        select(Exercise).where(Exercise.lesson_id == lesson_id).order_by(Exercise.id)
    ).all()
    for exercise in exercises:
        latest_answer = db.scalar(
            select(UserAnswer)
            .where(UserAnswer.exercise_id == exercise.id)
            .order_by(UserAnswer.created_at.desc(), UserAnswer.id.desc())
        )
        if latest_answer is None or not latest_answer.is_correct:
            return exercise.id
    return exercises[-1].id if exercises else None


@app.post("/api/v1/dialogue/sessions", response_model=DialogueSessionResponse)
def create_dialogue_session(
    request: DialogueSessionCreateRequest | None = None,
    db: Session = Depends(get_db),
) -> DialogueSessionResponse:
    lessons = _ordered_lessons(db)
    next_lesson = _first_incomplete_lesson(db, lessons)
    selected_lesson = (
        db.scalar(select(Lesson).where(Lesson.id == request.lesson_id))
        if request and request.lesson_id is not None
        else next_lesson
    )
    if request and request.lesson_id is not None and selected_lesson is None:
        raise HTTPException(status_code=404, detail="Lesson not found")
    session = LearningSession(
        title=request.title.strip() if request and request.title else None,
        current_lesson_id=selected_lesson.id if selected_lesson else None,
    )
    if selected_lesson is None:
        session.status = "completed"
    db.add(session)
    db.commit()
    db.refresh(session)
    return DialogueSessionResponse(
        session_id=session.id,
        title=session.title,
        current_lesson_id=session.current_lesson_id,
        current_lesson_title=_lesson_title(db, session.current_lesson_id),
        current_phase=session.current_phase,
        status=session.status,
    )


@app.get("/api/v1/dialogue/sessions", response_model=list[DialogueSessionListItem])
def list_dialogue_sessions(db: Session = Depends(get_db)) -> list[DialogueSessionListItem]:
    sessions = db.scalars(
        select(LearningSession)
        .order_by(LearningSession.updated_at.desc(), LearningSession.id.desc())
        .limit(30)
    ).all()
    return [
        DialogueSessionListItem(
            session_id=session.id,
            title=session.title,
            current_lesson_id=session.current_lesson_id,
            current_lesson_title=_lesson_title(db, session.current_lesson_id),
            current_phase=session.current_phase,
            status=session.status,
            message_count=len(session.messages),
            created_at=session.created_at,
            updated_at=session.updated_at,
        )
        for session in sessions
    ]


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
        title=session.title,
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
    current_lesson = None
    if session.current_lesson_id is not None:
        current_lesson = db.scalar(select(Lesson).where(Lesson.id == session.current_lesson_id))
    return DialogueHistoryResponse(
        session_id=session.id,
        title=session.title,
        current_lesson_id=session.current_lesson_id,
        current_lesson_title=_lesson_title(db, session.current_lesson_id),
        current_phase=session.current_phase,
        status=session.status,
        messages=[
            DialogueMessageView(role=message.role, content=message.content)
            for message in session.messages
        ],
    )


@app.get("/api/v1/dialogue/logs", response_model=list[DialogueLogEntry])
def list_dialogue_logs(db: Session = Depends(get_db)) -> list[DialogueLogEntry]:
    sessions = db.scalars(
        select(LearningSession).order_by(LearningSession.updated_at.desc(), LearningSession.id.desc())
    ).all()
    return [_dialogue_log_entry(db, session) for session in sessions]


@app.get("/api/v1/dialogue/sessions/{session_id}/logs", response_model=DialogueLogEntry)
def get_dialogue_session_logs(session_id: int, db: Session = Depends(get_db)) -> DialogueLogEntry:
    session = db.scalar(select(LearningSession).where(LearningSession.id == session_id))
    if session is None:
        raise HTTPException(status_code=404, detail="Dialogue session not found")
    return _dialogue_log_entry(db, session)


@app.post("/api/v1/dialogue/sessions/{session_id}/clear", response_model=DialogueHistoryResponse)
def clear_dialogue_session(session_id: int, db: Session = Depends(get_db)) -> DialogueHistoryResponse:
    """Clear only the conversation history while keeping the current lesson and progress."""
    session = db.scalar(select(LearningSession).where(LearningSession.id == session_id))
    if session is None:
        raise HTTPException(status_code=404, detail="Dialogue session not found")
    db.query(DialogueMessage).filter(DialogueMessage.session_id == session.id).delete(
        synchronize_session=False,
    )
    session.current_phase = "theory"
    session.status = "active" if session.current_lesson_id is not None else "completed"
    db.commit()
    db.refresh(session)
    return DialogueHistoryResponse(
        session_id=session.id,
        title=session.title,
        current_lesson_id=session.current_lesson_id,
        current_lesson_title=_lesson_title(db, session.current_lesson_id),
        current_phase=session.current_phase,
        status=session.status,
        messages=[],
    )


@app.delete(
    "/api/v1/dialogue/sessions/{session_id}",
    response_model=DialogueSessionDeleteResponse,
)
def delete_dialogue_session(session_id: int, db: Session = Depends(get_db)) -> DialogueSessionDeleteResponse:
    session = db.scalar(select(LearningSession).where(LearningSession.id == session_id))
    if session is None:
        raise HTTPException(status_code=404, detail="Dialogue session not found")
    db.delete(session)
    db.commit()
    return DialogueSessionDeleteResponse(session_id=session_id, deleted=True)


def _is_save_progress_command(message: str) -> bool:
    normalized = " ".join(message.lower().strip().split())
    return normalized in {
        "сохрани прогресс",
        "сохранить прогресс",
        "save progress",
    }


def _extract_dialogue_assessment(response: str) -> tuple[str, TutorAssessment | None]:
    """Strip the agent-only assessment marker and return its structured payload."""
    match = re.search(
        r"\s*<mistake-assessment>(\{.*?\})</mistake-assessment>\s*$",
        response,
        flags=re.DOTALL,
    )
    if match is None:
        return response.strip(), None
    visible_response = response[:match.start()].strip()
    try:
        assessment = TutorAssessment.model_validate(json.loads(match.group(1)))
    except (ValueError, TypeError, json.JSONDecodeError):
        return response.strip(), None
    return visible_response, assessment


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


def _normalize_exercise_answer(value: str) -> str:
    trimmed = value.lower().strip()
    while trimmed and trimmed[-1] in ".!?;:»”\"'":
        trimmed = trimmed[:-1].rstrip()
    while trimmed and trimmed[0] in "«“\"'":
        trimmed = trimmed[1:].lstrip()
    return " ".join(trimmed.split())


def _save_dialogue_exercise_answer(db: Session, lesson: Lesson | None, message: str) -> Exercise | None:
    if lesson is None:
        return None
    normalized_message = _normalize_exercise_answer(message)
    if not normalized_message:
        return None
    exercises = db.scalars(
        select(Exercise).where(Exercise.lesson_id == lesson.id).order_by(Exercise.id)
    ).all()
    matched_exercise = next(
        (
            exercise
            for exercise in exercises
            if exercise.correct_answer and _normalize_exercise_answer(exercise.correct_answer) == normalized_message
        ),
        None,
    )
    if matched_exercise is None:
        return None
    latest_answer = db.scalar(
        select(UserAnswer)
        .where(UserAnswer.exercise_id == matched_exercise.id)
        .order_by(UserAnswer.created_at.desc(), UserAnswer.id.desc())
    )
    if latest_answer is not None and latest_answer.is_correct:
        return matched_exercise
    attempt = db.scalar(
        select(LessonAttempt)
        .where(LessonAttempt.lesson_id == lesson.id)
        .order_by(LessonAttempt.id.desc())
    )
    if attempt is None:
        attempt = LessonAttempt(lesson_id=lesson.id)
        db.add(attempt)
        db.flush()
    db.add(UserAnswer(
        exercise_id=matched_exercise.id,
        lesson_attempt_id=attempt.id,
        user_answer=message,
        is_correct=True,
        score=100,
        ai_feedback=json.dumps({"source": "dialogue", "explanation": "Ответ подтвержден в диалоге."}, ensure_ascii=False),
    ))
    return matched_exercise


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

    history_before_message = list(session.messages)
    db.add(DialogueMessage(session_id=session.id, role="user", content=request.message))
    matched_dialogue_exercise = _save_dialogue_exercise_answer(db, current_lesson, request.message)
    progress_saved = False
    dialogue_assessment: TutorAssessment | None = None

    if _is_save_progress_command(request.message):
        if current_lesson is None:
            response_text = "Весь доступный курс уже завершен."
            session.status = "completed"
        else:
            if not _lesson_has_correct_answer(db, current_lesson.id):
                raise HTTPException(
                    status_code=409,
                    detail="Для сохранения прогресса нужен хотя бы один правильный ответ по уроку",
                )
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
        if matched_dialogue_exercise is not None:
            exercises = db.scalars(
                select(Exercise).where(Exercise.lesson_id == current_lesson.id).order_by(Exercise.id)
            ).all()
            current_index = next(
                (index for index, exercise in enumerate(exercises) if exercise.id == matched_dialogue_exercise.id),
                len(exercises) - 1,
            )
            next_exercise = exercises[current_index + 1] if current_index + 1 < len(exercises) else None
            session.current_phase = "practice"
            response_text = (
                f"Правильно: **{matched_dialogue_exercise.correct_answer}**.\n\n"
                + (
                    "Можешь остановиться здесь или написать «следующее упражнение», «готов к следующему» или «готов к упражнению», если хочешь продолжить."
                    if next_exercise
                    else "Упражнение пройдено. Можешь перейти к следующей теме."
                )
            )
        elif current_lesson is None:
            response_text = "Курс завершен. Можно повторить ошибки или начать новый курс."
        else:
            history = history_before_message[-11:]
            history_text = "\n".join(f"{message.role}: {message.content}" for message in history)
            history_text += f"\nuser: {request.message}"
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
                    "CRITICAL CHECKING RULE: Treat the latest user message as the answer to the exercise most recently assigned by the teacher. First evaluate that exact answer and explicitly say whether it is correct or incorrect, show the correction when needed, and briefly explain why. After a correct answer, stop and wait; give another exercise only when the learner explicitly asks for «следующее упражнение», «готов к следующему», or «готов к упражнению». Treat all three continuation commands as valid requests to continue practice, not as mistakes. Never replace evaluation of the latest answer with a new exercise, and never ask the learner to resend the same answer.\n"
                    "PREREQUISITE RULE: Keep every explanation, correction, and exercise strictly inside grammar explicitly taught in the current lesson theory or earlier completed lessons. Never require or penalize a case, conjugation, declension, or word-form change that has not been explained yet. A form appearing incidentally in an example does not make its hidden grammar rule available. Do not jump ahead to later course topics. If a natural sentence would require future grammar, choose a different sentence pattern using only taught forms.\n"
                    "EXERCISE WORD-BANK RULE: Whenever an exercise asks the learner to compose a sentence, name objects, list nouns, or make adjective-noun agreement, include a visible ready-to-use bank of 4-8 Slovak nouns. For each noun provide grammatical gender (m./f./n.) and a Russian translation. Prefer vocabulary from the current lesson and add suitable new words when needed. The learner must not have to invent unknown vocabulary from memory. Present the bank before the task, for example: obchod (m.) — магазин; kniha (f.) — книга.\n"
                    "ANALYTICS RULE: End the response with exactly one hidden machine-readable line: <mistake-assessment>{\"is_correct\":true|false,\"score\":0-100,\"corrected_answer\":\"...\",\"explanation\":\"...\",\"next_exercise\":\"...\",\"mistake_category\":\"category or null\",\"new_words\":[]}</mistake-assessment>. Use is_correct=false only when the latest learner message is an attempted answer containing a real error. This line is removed before display.\n"
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
                    "задания и диалоговые сценарии текущей темы по одному: сначала коротко объясни задачу, затем жди ответ и после правильного ответа жди отдельную команду на продолжение. "
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
                response_text, dialogue_assessment = _extract_dialogue_assessment(response_text)

    if current_lesson is not None:
        if dialogue_assessment is not None and not dialogue_assessment.is_correct:
            mistake = _record_mistake(
                db,
                course_id=current_lesson.module.course_id,
                lesson_id=current_lesson.id,
                source="dialogue",
                category=dialogue_assessment.mistake_category or "dialogue",
                original_answer=request.message,
                corrected_answer=dialogue_assessment.corrected_answer,
                explanation=dialogue_assessment.explanation,
                exercise_id=_first_uncompleted_exercise_id(db, current_lesson.id),
            )
            _save_vocabulary(
                db,
                current_lesson.module.course_id,
                current_lesson.id,
                dialogue_assessment.new_words,
                mistake.id,
            )
        _save_content_vocabulary(
            db,
            current_lesson,
            _extract_explicit_vocabulary(response_text),
        )
    db.add(DialogueMessage(session_id=session.id, role="assistant", content=response_text))
    session.updated_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(session)
    return DialogueMessageResponse(
        session_id=session.id,
        title=session.title,
        current_lesson_id=session.current_lesson_id,
        current_lesson_title=_lesson_title(db, session.current_lesson_id),
        current_phase=session.current_phase,
        status=session.status,
        response=response_text,
        progress_saved=progress_saved,
    )


def _dialogue_log_entry(db: Session, session: LearningSession) -> DialogueLogEntry:
    return DialogueLogEntry(
        session_id=session.id,
        title=session.title,
        current_lesson_id=session.current_lesson_id,
        current_lesson_title=_lesson_title(db, session.current_lesson_id),
        current_phase=session.current_phase,
        status=session.status,
        created_at=session.created_at,
        updated_at=session.updated_at,
        messages=[
            DialogueMessageLogView(
                role=message.role,
                content=message.content,
                created_at=message.created_at,
            )
            for message in session.messages
        ],
    )
