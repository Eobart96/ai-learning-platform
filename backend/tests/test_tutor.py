from app.main import app, get_tutor_provider
from app.tutor import TutorContext


class FakeTutorProvider:
    def respond(self, context: TutorContext) -> str:
        assert "ученика Sergej" in context.prompt
        if "верни только json" in context.prompt.lower():
            if "проверь выполнение" in context.prompt.lower():
                return (
                    '{"is_correct": true, "score": 91, '
                    '"corrected_answer": "Dobrý deň", '
                    '"explanation": "Ответ принят.", '
                    '"next_exercise": "Повтори фразу вслух.", '
                    '"mistake_category": null}'
                )
            if "домашнее задание" in context.prompt.lower():
                return (
                    '{"title": "Повторяем приветствия", '
                    '"description": "Составь 3 приветствия на словацком и добавь русский перевод.", '
                    '"focus_category": "greeting"}'
                )
            return (
                '{"is_correct": false, "score": 20, '
                '"corrected_answer": "Dobrý deň", '
                '"explanation": "Проверь написание приветствия.", '
                '"next_exercise": "Напиши приветствие утром.", '
                '"mistake_category": "greeting"}'
            )
        assert "давай только одно упражнение" in context.prompt
        return "Dobrý deň — Добрый день. Повтори эту фразу."


class VocabularyTutorProvider:
    def respond(self, context: TutorContext) -> str:
        return (
            '{"is_correct": false, "score": 20, "corrected_answer": "Dobrý deň", '
            '"explanation": "Правильно.", "next_exercise": "Повтори.", '
            '"mistake_category": "greeting", "new_words": [{"word": "fľaša", '
            '"translation": "бутылка", "example": "Jedna fľaša vody."}]}'
        )


class DiaryTutorProvider:
    def respond(self, context: TutorContext) -> str:
        return (
            '{"is_correct": false, "score": 76, "corrected_answer": "Dnes pracujem doma.", '
            '"explanation": "Нужно использовать правильную форму слова.", '
            '"next_exercise": "Повтори предложение.", "mistake_category": "diary", '
            '"new_words": [{"word": "dnes", "translation": "сегодня", '
            '"example": "Dnes pracujem."}]}'
        )


class PracticeTutorProvider(FakeTutorProvider):
    def respond(self, context: TutorContext) -> str:
        assert "Сценарий:" in context.prompt
        return super().respond(context)


def test_tutor_message_uses_learning_context(client):
    app.dependency_overrides[get_tutor_provider] = lambda: FakeTutorProvider()

    response = client.post("/api/v1/tutor/message", json={"message": "Начнем урок"})

    assert response.status_code == 200
    assert response.json()["provider"] == "codex"
    assert "Dobrý deň" in response.json()["response"]


def test_tutor_message_rejects_empty_message(client):
    response = client.post("/api/v1/tutor/message", json={"message": "  "})

    assert response.status_code == 422


def test_lesson_answer_is_saved_and_checked(client):
    app.dependency_overrides[get_tutor_provider] = lambda: FakeTutorProvider()

    response = client.post(
        "/api/v1/lessons/1/answer",
        json={"exercise_id": 1, "answer": "Dobrý deň"},
    )

    assert response.status_code == 200
    assert response.json()["attempt_id"] == 1
    assert response.json()["answer_id"] == 1
    assert response.json()["assessment"]["is_correct"] is False
    assert response.json()["assessment"]["score"] == 20
    assert response.json()["mistake_id"] == 1


def test_repeated_mistake_increments_counter(client):
    app.dependency_overrides[get_tutor_provider] = lambda: FakeTutorProvider()
    payload = {"exercise_id": 1, "answer": "Dobrý deň"}

    first_response = client.post("/api/v1/lessons/1/answer", json=payload)
    second_response = client.post("/api/v1/lessons/1/answer", json=payload)

    assert first_response.status_code == 200
    assert second_response.status_code == 200
    assert second_response.json()["mistake_id"] == first_response.json()["mistake_id"]


def test_answer_for_unknown_lesson_returns_404(client):
    app.dependency_overrides[get_tutor_provider] = lambda: FakeTutorProvider()

    response = client.post(
        "/api/v1/lessons/999/answer",
        json={"exercise_id": 1, "answer": "Dobrý deň"},
    )

    assert response.status_code == 404


def test_progress_and_mistakes_are_available_after_answer(client):
    app.dependency_overrides[get_tutor_provider] = lambda: FakeTutorProvider()
    client.post(
        "/api/v1/lessons/1/answer",
        json={"exercise_id": 1, "answer": "Dobrý deň"},
    )

    progress = client.get("/api/v1/progress")
    mistakes = client.get("/api/v1/progress/mistakes")

    assert progress.status_code == 200
    assert progress.json()["total_answers"] == 1
    assert progress.json()["total_mistakes"] == 1
    assert mistakes.json()[0]["mistake_count"] == 1


def test_lesson_can_be_completed_after_answer(client):
    app.dependency_overrides[get_tutor_provider] = lambda: FakeTutorProvider()
    client.post(
        "/api/v1/lessons/1/answer",
        json={"exercise_id": 1, "answer": "Dobrý день"},
    )

    response = client.post("/api/v1/lessons/1/complete")

    assert response.status_code == 200
    assert response.json()["completed"] is True
    assert client.get("/api/v1/progress").json()["completed_lessons"] == 1


def test_next_mistake_and_homework_are_available(client):
    app.dependency_overrides[get_tutor_provider] = lambda: FakeTutorProvider()
    client.post(
        "/api/v1/lessons/1/answer",
        json={"exercise_id": 1, "answer": "Dobrý deň"},
    )

    next_mistake = client.get("/api/v1/progress/mistakes/next")
    homework = client.post("/api/v1/homework/generate", json={"lesson_id": 1})
    homework_list = client.get("/api/v1/homework")

    assert next_mistake.status_code == 200
    assert next_mistake.json()["category"] == "greeting"
    assert homework.status_code == 200
    assert homework.json()["focus_category"] == "greeting"
    assert homework_list.json()[0]["title"] == "Повторяем приветствия"


def test_homework_can_be_submitted_and_checked(client):
    app.dependency_overrides[get_tutor_provider] = lambda: FakeTutorProvider()
    homework = client.post("/api/v1/homework/generate", json={"lesson_id": 1})
    homework_id = homework.json()["id"]

    response = client.post(
        f"/api/v1/homework/{homework_id}/submit",
        json={"answer": "Dobrý deň"},
    )
    listed = client.get("/api/v1/homework")

    assert response.status_code == 200
    assert response.json()["score"] == 91
    assert response.json()["status"] == "checked"
    assert response.json()["assessment"]["is_correct"] is True
    assert listed.json()[0]["submitted_answer"] == "Dobrý deň"


def test_new_words_are_saved_and_can_be_reviewed(client):
    app.dependency_overrides[get_tutor_provider] = lambda: VocabularyTutorProvider()

    answer = client.post(
        "/api/v1/lessons/1/answer",
        json={"exercise_id": 1, "answer": "Dobrý deň"},
    )
    vocabulary = client.get("/api/v1/progress/vocabulary")
    next_word = client.get("/api/v1/progress/vocabulary/next")
    reviewed = client.post("/api/v1/progress/vocabulary/1/review")
    due_after = client.get("/api/v1/progress/vocabulary/due")

    assert answer.status_code == 200
    assert answer.json()["mistake_id"] == 1
    assert vocabulary.status_code == 200
    assert vocabulary.json()[0]["word"] == "fľaša"
    assert vocabulary.json()[0]["mistake_id"] == 1
    assert next_word.json()["translation"] == "бутылка"
    assert reviewed.json()["review_count"] == 1
    assert reviewed.json()["interval_days"] == 1
    assert reviewed.json()["is_due"] is False
    assert due_after.json() == []


def test_diary_entry_is_checked_saved_and_included_in_weekly_summary(client):
    app.dependency_overrides[get_tutor_provider] = lambda: DiaryTutorProvider()

    prompt = client.get("/api/v1/diary/today")
    entry = client.post(
        "/api/v1/diary/entries",
        json={
            "prompt": prompt.json()["prompt"],
            "answer": "Dnes pracujem doma.",
            "lesson_id": prompt.json()["lesson_id"],
        },
    )
    entries = client.get("/api/v1/diary/entries")
    summary = client.get("/api/v1/diary/weekly-summary")

    assert prompt.status_code == 200
    assert entry.status_code == 200
    assert entry.json()["score"] == 76
    assert entry.json()["mistake_id"] == 1
    assert entry.json()["new_words"][0]["word"] == "dnes"
    assert entries.json()[0]["original_text"] == "Dnes pracujem doma."
    assert summary.json()["entries_count"] == 1
    assert summary.json()["mistakes_count"] == 1
    assert summary.json()["new_words_count"] == 1


def test_dialogue_session_persists_history_and_progress_command(client):
    app.dependency_overrides[get_tutor_provider] = lambda: FakeTutorProvider()
    session = client.post("/api/v1/dialogue/sessions")
    session_id = session.json()["session_id"]

    message = client.post(
        f"/api/v1/dialogue/sessions/{session_id}/messages",
        json={"message": "Объясни приветствие"},
    )
    saved = client.post(
        f"/api/v1/dialogue/sessions/{session_id}/messages",
        json={"message": "сохрани прогресс"},
    )
    history = client.get(f"/api/v1/dialogue/sessions/{session_id}")

    assert message.status_code == 200
    assert saved.status_code == 200
    assert saved.json()["progress_saved"] is True
    assert saved.json()["status"] == "active"
    assert saved.json()["current_lesson_title"] == "Представление себя"
    assert len(history.json()["messages"]) == 4
    assert client.get("/api/v1/homework").json()[0]["title"] == "Повторяем приветствия"

    resumed = client.post("/api/v1/dialogue/sessions")

    assert resumed.status_code == 200
    assert resumed.json()["current_lesson_title"] == "Представление себя"


def test_theory_request_returns_current_lesson_theory_without_repeating_exercise(client):
    app.dependency_overrides[get_tutor_provider] = lambda: FakeTutorProvider()
    session = client.post("/api/v1/dialogue/sessions")
    session_id = session.json()["session_id"]

    response = client.post(
        f"/api/v1/dialogue/sessions/{session_id}/messages",
        json={"message": "А где теория?"},
    )

    assert response.status_code == 200
    assert response.json()["current_phase"] == "theory"
    assert "Текущая тема:" in response.json()["response"]
    assert "готов к упражнению" in response.json()["response"]


def test_practice_prompt_contains_dialogue_scenario(client):
    app.dependency_overrides[get_tutor_provider] = lambda: PracticeTutorProvider()
    session = client.post("/api/v1/dialogue/sessions")
    session_id = session.json()["session_id"]
    response = client.post(
        f"/api/v1/dialogue/sessions/{session_id}/messages",
        json={"message": "готов к упражнению"},
    )

    assert response.status_code == 200
    assert response.json()["current_phase"] == "practice"


def test_roadmap_lesson_selection_switches_dialogue_topic(client):
    app.dependency_overrides[get_tutor_provider] = lambda: FakeTutorProvider()
    session = client.post("/api/v1/dialogue/sessions")
    session_id = session.json()["session_id"]

    selected = client.post(
        f"/api/v1/dialogue/sessions/{session_id}/select-lesson",
        json={"lesson_id": 3},
    )

    assert selected.status_code == 200
    assert selected.json()["current_lesson_title"] == "Числа"
    assert selected.json()["current_phase"] == "theory"

    theory = client.post(
        f"/api/v1/dialogue/sessions/{session_id}/messages",
        json={"message": "Покажи подробную теорию по текущей теме"},
    )

    assert theory.status_code == 200
    assert "Числа" in theory.json()["response"]


def test_progress_reset_returns_to_first_lesson_and_clears_learning_data(client):
    app.dependency_overrides[get_tutor_provider] = lambda: FakeTutorProvider()
    session = client.post("/api/v1/dialogue/sessions")
    session_id = session.json()["session_id"]
    client.post(
        f"/api/v1/dialogue/sessions/{session_id}/messages",
        json={"message": "А где теория?"},
    )

    response = client.post("/api/v1/progress/reset", json={"confirm": True})
    new_session = client.post("/api/v1/dialogue/sessions")

    assert response.status_code == 200
    assert response.json()["reset"] is True
    assert response.json()["deleted_sessions"] == 1
    assert new_session.json()["current_lesson_title"] == "Приветствия"
    assert client.get("/api/v1/progress").json()["total_answers"] == 0
    assert client.get("/api/v1/diary/entries").json() == []
