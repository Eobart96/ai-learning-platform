from app.math_generator import generate_numeric_exercise
import app.main as main_module
from app.models import Exercise, Lesson, Module
from sqlalchemy import select
from sqlalchemy.orm import Session


def test_health(client):
    response = client.get("/health")

    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_ui_is_served(client):
    response = client.get("/ui/")

    assert response.status_code == 200
    assert "AI Learning Platform" in response.text
    assert "Закончить тему (тест)" in response.text


def test_course_is_loaded(client):
    response = client.get("/api/v1/courses")

    assert response.status_code == 200
    assert response.json()[0]["slug"] == "slovak-a1"
    assert response.json()[0]["title"] == "Slovak A1"


def test_math_exam_preparation_course_is_loaded(client):
    courses = client.get("/api/v1/courses").json()
    math_course = next(course for course in courses if course["slug"] == "math-exam-prep")

    assert math_course["subject"] == "mathematics"

    roadmap = client.get("/api/v1/roadmap", params={"course_slug": "math-exam-prep"})
    assert roadmap.status_code == 200
    assert len(roadmap.json()) == 5
    assert roadmap.json()[0]["lessons"][0]["slug"] == "order-of-operations"


def test_math_tutor_answers_only_for_math_lessons(client):
    roadmap = client.get("/api/v1/roadmap", params={"course_slug": "math-exam-prep"}).json()
    math_lesson_id = roadmap[0]["lessons"][0]["id"]

    response = client.post(
        f"/api/v1/math/lessons/{math_lesson_id}/chat",
        json={"message": "Почему сначала выполняются действия в скобках?"},
    )

    assert response.status_code == 200
    assert response.json()["response"] == "Тестовый ответ преподавателя."

    slovak_lesson_id = client.get("/api/v1/roadmap").json()[0]["lessons"][0]["id"]
    blocked = client.post(
        f"/api/v1/math/lessons/{slovak_lesson_id}/chat",
        json={"message": "Вопрос не по математике"},
    )
    assert blocked.status_code == 409


def test_math_study_roadmap_is_available(client):
    response = client.get("/api/v1/courses/math-exam-prep/study-roadmap")

    assert response.status_code == 200
    roadmap = response.json()
    assert roadmap["title"] == "Математика · темы"
    assert [topic["slug"] for topic in roadmap["topics"]] == ["arithmetic", "fractions", "powers", "equations", "graphs"]
    assert roadmap["topics"][-1]["title"] == "Функции и графики"


def test_math_topics_have_an_unlimited_numeric_exercise_generator(client):
    roadmap = client.get("/api/v1/roadmap", params={"course_slug": "math-exam-prep"}).json()
    lesson_id = roadmap[0]["lessons"][0]["id"]

    first = client.post(f"/api/v1/lessons/{lesson_id}/generated-exercises")
    second = client.post(f"/api/v1/lessons/{lesson_id}/generated-exercises")

    assert first.status_code == 200
    assert second.status_code == 200
    assert first.json()["id"] != second.json()["id"]
    assert first.json()["type"] == "numeric_answer"
    assert first.json()["question"]

    lesson = client.get(f"/api/v1/lessons/{lesson_id}").json()
    generated_ids = {first.json()["id"], second.json()["id"]}
    assert generated_ids.isdisjoint({exercise["id"] for exercise in lesson["exercises"]})


def test_math_generator_covers_every_current_topic():
    lesson_slugs = (
        "order-of-operations",
        "percentages",
        "fraction-operations",
        "decimals",
        "powers",
        "square-roots",
        "one-step-equations",
        "two-step-equations",
        "linear-functions",
        "quadratic-functions",
    )

    for lesson_slug in lesson_slugs:
        question, correct_answer = generate_numeric_exercise(lesson_slug)
        assert question
        assert correct_answer


def test_decimal_generator_alternates_between_task_types():
    questions = [generate_numeric_exercise("decimals")[0] for _ in range(12)]

    def task_type(question: str) -> str:
        if "Запиши десятичной дробью" in question:
            return "convert"
        if " + " in question:
            return "add"
        if " - " in question:
            return "subtract"
        if " × " in question:
            return "multiply"
        return "divide"

    types = [task_type(question) for question in questions]
    assert len(set(types)) >= 4
    assert all(current != previous for previous, current in zip(types, types[1:]))


def test_mistakes_are_isolated_between_slovak_and_mathematics(client):
    math_roadmap = client.get("/api/v1/roadmap", params={"course_slug": "math-exam-prep"}).json()
    math_lesson_id = math_roadmap[0]["lessons"][0]["id"]
    math_lesson = client.get(f"/api/v1/lessons/{math_lesson_id}").json()

    wrong_answer = client.post(
        f"/api/v1/lessons/{math_lesson_id}/answer",
        json={"exercise_id": math_lesson["exercises"][0]["id"], "answer": "999"},
    )
    assert wrong_answer.json()["assessment"]["is_correct"] is False

    slovak_mistakes = client.get(
        "/api/v1/progress/mistakes", params={"course_slug": "slovak-a1"}
    )
    math_mistakes = client.get(
        "/api/v1/progress/mistakes", params={"course_slug": "math-exam-prep"}
    )

    assert slovak_mistakes.json() == []
    assert len(math_mistakes.json()) == 1

    cross_course_action = client.post(
        f"/api/v1/progress/mistakes/{math_mistakes.json()[0]['id']}/resolve",
        params={"course_slug": "slovak-a1"},
    )
    assert cross_course_action.status_code == 404


def test_math_module_final_test_uses_numeric_exercises(client):
    roadmap = client.get("/api/v1/roadmap", params={"course_slug": "math-exam-prep"}).json()
    arithmetic = roadmap[0]
    expected_first_answers = ["0", "36"]

    for lesson_item, answer in zip(arithmetic["lessons"], expected_first_answers, strict=True):
        lesson = client.get(f"/api/v1/lessons/{lesson_item['id']}").json()
        response = client.post(
            f"/api/v1/lessons/{lesson_item['id']}/answer",
            json={"exercise_id": lesson["exercises"][0]["id"], "answer": answer},
        )
        assert response.json()["assessment"]["is_correct"] is True
        assert client.post(f"/api/v1/lessons/{lesson_item['id']}/complete").status_code == 200

    test_payload = client.get(f"/api/v1/modules/{arithmetic['id']}/final-test").json()
    assert test_payload["available"] is True
    assert len(test_payload["questions"]) == 6
    answers = {
        question["id"]: {
            "Вычисли: 18 - 3 × (4 + 2)": "0",
            "Вычисли: -15 + 8 - 6": "-13",
            "Вычисли: (-7) × 5 + 9": "-26",
            "Найди 15% от 240.": "36",
            "После скидки 20% цена стала 800. Какой была цена до скидки?": "1000",
            "Число увеличили с 80 до 100. На сколько процентов оно выросло?": "25",
        }[question["question"]]
        for question in test_payload["questions"]
    }
    result = client.post(f"/api/v1/modules/{arithmetic['id']}/final-test/submit", json={"answers": answers})

    assert result.status_code == 200
    assert result.json()["passed"] is True
    assert result.json()["score"] == 100
    assert result.json()["correct_answers"] == {}

    failed_result = client.post(
        f"/api/v1/modules/{arithmetic['id']}/final-test/submit",
        json={"answers": {}},
    )

    assert failed_result.status_code == 200
    assert failed_result.json()["correct_answers"] == {}
    assert failed_result.json()["history"][0]["mistakes"]
    assert all(
        mistake["expected_answer"]
        for mistake in failed_result.json()["history"][0]["mistakes"]
    )


def test_viewing_dialogue_history_does_not_reprocess_stored_messages(client, monkeypatch):
    session = client.post("/api/v1/dialogue/sessions", json={"title": "Read-only history"})
    session_id = session.json()["session_id"]
    client.post(
        f"/api/v1/dialogue/sessions/{session_id}/messages",
        json={"message": "Покажи теорию"},
    )

    def fail_if_called(*_args, **_kwargs):
        raise AssertionError("GET dialogue history must not save answers")

    monkeypatch.setattr("app.main._save_dialogue_exercise_answer", fail_if_called)

    response = client.get(f"/api/v1/dialogue/sessions/{session_id}")

    assert response.status_code == 200


def test_save_progress_requires_a_correct_lesson_answer(client):
    session = client.post("/api/v1/dialogue/sessions", json={"title": "No practice yet"})
    session_id = session.json()["session_id"]

    response = client.post(
        f"/api/v1/dialogue/sessions/{session_id}/messages",
        json={"message": "сохрани прогресс"},
    )

    assert response.status_code == 409
    assert "правильный ответ" in response.json()["detail"].lower()


def test_lesson_is_available(client):
    response = client.get("/api/v1/lessons/1")

    assert response.status_code == 200
    assert response.json()["slug"] == "greetings"
    exercises = response.json()["exercises"]
    assert len(exercises) >= 5
    assert any(exercise["type"] == "dialogue" for exercise in exercises)


def test_lesson_hides_exercises_that_differ_only_by_terminal_punctuation(client):
    with Session(main_module.engine) as db:
        lesson = db.scalar(select(Lesson).where(Lesson.slug == "accusative"))
        assert lesson is not None
        lesson_id = lesson.id
        source = db.scalar(select(Exercise).where(Exercise.lesson_id == lesson.id))
        assert source is not None
        db.add(Exercise(
            lesson_id=lesson.id,
            exercise_type=source.exercise_type,
            question=f"{source.question}.",
            instruction=source.instruction,
            correct_answer=source.correct_answer,
        ))
        db.commit()

    response = client.get(f"/api/v1/lessons/{lesson_id}")

    assert response.status_code == 200
    questions = [exercise["question"] for exercise in response.json()["exercises"]]
    normalized_questions = [question.rstrip(".?!…").casefold() for question in questions]
    assert len(normalized_questions) == len(set(normalized_questions))


def test_dynamic_module_final_test_hides_duplicate_exercises(client):
    with Session(main_module.engine) as db:
        module = db.scalar(select(Module).where(Module.slug == "cases"))
        assert module is not None
        lesson = db.scalar(select(Lesson).where(Lesson.module_id == module.id, Lesson.slug == "accusative"))
        assert lesson is not None
        source = db.scalar(select(Exercise).where(Exercise.lesson_id == lesson.id))
        assert source is not None
        db.add(Exercise(
            lesson_id=lesson.id,
            exercise_type=source.exercise_type,
            question=f"{source.question}.",
            instruction=source.instruction,
            correct_answer=source.correct_answer,
        ))
        db.commit()

        _, definition, _ = main_module._module_test_payload(db, module)

    normalized_questions = [item["question"].rstrip(".?!…").casefold() for item in definition]
    assert len(normalized_questions) == len(set(normalized_questions))


def test_all_a1_lessons_have_substantive_theory(client):
    roadmap = client.get("/api/v1/roadmap").json()
    lessons = [lesson for module in roadmap for lesson in module["lessons"]]

    assert len(lessons) == 31
    for lesson in lessons:
        response = client.get(f"/api/v1/lessons/{lesson['id']}")
        assert response.status_code == 200
        theory = response.json()["theory"] or ""
        assert len(theory) >= 200, lesson["slug"]
        exercises = response.json()["exercises"]
        assert len(exercises) >= 3, lesson["slug"]
        assert any(exercise["type"] == "dialogue" for exercise in exercises), lesson["slug"]


def test_unknown_lesson_returns_404(client):
    response = client.get("/api/v1/lessons/999")

    assert response.status_code == 404


def test_dialogue_logs_export_all_sessions_with_messages(client):
    first_session = client.post("/api/v1/dialogue/sessions", json={"title": "Первая сессия"})
    second_session = client.post("/api/v1/dialogue/sessions", json={"title": "Вторая сессия"})

    client.post(
        f"/api/v1/dialogue/sessions/{first_session.json()['session_id']}/messages",
        json={"message": "Покажи теорию"},
    )

    response = client.get("/api/v1/dialogue/logs")

    assert response.status_code == 200
    logs = response.json()
    assert len(logs) == 2
    by_id = {entry["session_id"]: entry for entry in logs}
    exported = by_id[first_session.json()["session_id"]]
    assert exported["title"] == "Первая сессия"
    assert len(exported["messages"]) == 2
    assert exported["messages"][0]["role"] == "user"
    assert exported["messages"][1]["role"] == "assistant"
    assert exported["messages"][0]["created_at"]
    assert exported["created_at"]
    assert exported["updated_at"]


def test_dialogue_logs_export_single_session(client):
    session = client.post("/api/v1/dialogue/sessions", json={"title": "Лог для бага"})
    session_id = session.json()["session_id"]
    client.post(
        f"/api/v1/dialogue/sessions/{session_id}/messages",
        json={"message": "готов к упражнению"},
    )

    response = client.get(f"/api/v1/dialogue/sessions/{session_id}/logs")

    assert response.status_code == 200
    exported = response.json()
    assert exported["session_id"] == session_id
    assert exported["title"] == "Лог для бага"
    assert len(exported["messages"]) == 2
    assert all("created_at" in message for message in exported["messages"])


def test_roadmap_exposes_lesson_statuses(client):
    response = client.get("/api/v1/roadmap")

    assert response.status_code == 200
    lessons = response.json()[0]["lessons"]
    assert lessons[0]["status"] == "current"
    assert lessons[0]["can_repeat"] is False
    assert lessons[1]["status"] == "upcoming"


def test_roadmap_exposes_language_levels(client):
    response = client.get("/api/v1/roadmap/levels")

    assert response.status_code == 200
    levels = response.json()
    assert [level["slug"] for level in levels] == ["A1", "A2", "B1", "B2"]
    assert levels[0]["status"] == "current"
    assert levels[0]["modules"]
    assert levels[1]["status"] == "upcoming"
    assert levels[1]["modules"] == []
