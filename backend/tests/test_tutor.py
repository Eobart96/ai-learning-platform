from pathlib import Path

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


class ContinuePracticeAliasProvider:
    def respond(self, context: TutorContext) -> str:
        if "Treat all three continuation commands as valid requests to continue practice" in context.prompt:
            return (
                "??????? ??????????? ???????. ?????????? 2.\n"
                '<mistake-assessment>{"is_correct":true,"score":100,'
                '"corrected_answer":"????? ? ??????????","explanation":"??????? ??????????? ???????.",'
                '"next_exercise":"?????????? 2.","mistake_category":null,"new_words":[]}</mistake-assessment>'
            )
        return (
            "??? ???????????.\n"
            '<mistake-assessment>{"is_correct":false,"score":0,'
            '"corrected_answer":"????????? ??????????","explanation":"????????? ?????? ???? ???????.",'
            '"next_exercise":"?????????? 2.","mistake_category":"command","new_words":[]}</mistake-assessment>'
        )


class HistoryCaptureProvider(FakeTutorProvider):
    def __init__(self):
        self.prompts = []

    def respond(self, context: TutorContext) -> str:
        self.prompts.append(context.prompt)
        return super().respond(context)


class DuplicateVocabularyProvider:
    def respond(self, context: TutorContext) -> str:
        return "dom — дом.\ndom — жилище."


class DialogueMistakeProvider:
    def respond(self, context: TutorContext) -> str:
        return (
            "Нужно исправить форму: **dobrý priateľ**.\n"
            '<mistake-assessment>{"is_correct":false,"score":55,'
            '"corrected_answer":"To je dobrý priateľ.","explanation":"Нужно согласовать слова.",'
            '"next_exercise":"Составь ещё одну фразу.","mistake_category":"agreement",'
            '"new_words":[]}</mistake-assessment>'
        )


def test_tutor_message_uses_learning_context(client):
    app.dependency_overrides[get_tutor_provider] = lambda: FakeTutorProvider()

    response = client.post("/api/v1/tutor/message", json={"message": "Начнем урок"})

    assert response.status_code == 200
    assert response.json()["provider"] == "codex"
    assert "Dobrý deň" in response.json()["response"]


def test_tutor_message_rejects_empty_message(client):
    response = client.post("/api/v1/tutor/message", json={"message": "  "})

    assert response.status_code == 422


def test_codex_status_reports_missing_cli(client, monkeypatch):
    monkeypatch.setattr("app.tutor.resolve_codex_executable", lambda _: None)

    response = client.get("/api/v1/codex/status")

    assert response.status_code == 200
    assert response.json()["installed"] is False
    assert response.json()["authenticated"] is False


def test_codex_login_returns_existing_authenticated_status(client, monkeypatch):
    monkeypatch.setattr(
        "app.tutor.resolve_codex_executable",
        lambda _: Path(r"C:\Tools\codex.cmd"),
    )

    class Result:
        returncode = 0
        stdout = b"Logged in using ChatGPT"
        stderr = b""

    monkeypatch.setattr("app.tutor.subprocess.run", lambda *args, **kwargs: Result())

    response = client.post("/api/v1/codex/login")

    assert response.status_code == 200
    assert response.json()["installed"] is True
    assert response.json()["authenticated"] is True


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
    assert progress.json()["resolved_mistakes"] == 0
    assert mistakes.json()[0]["mistake_count"] == 1

    resolved = client.post(f"/api/v1/progress/mistakes/{mistakes.json()[0]['id']}/resolve")
    assert resolved.status_code == 200
    assert client.get("/api/v1/progress/mistakes").json() == []
    assert client.get("/api/v1/progress").json()["resolved_mistakes"] == 1
    assert client.get("/api/v1/lessons/1").json()["exercises"][0]["is_resolved"] is True


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
    provider = HistoryCaptureProvider()
    app.dependency_overrides[get_tutor_provider] = lambda: provider
    homework = client.post("/api/v1/homework/generate", json={"lesson_id": 1})
    homework_id = homework.json()["id"]
    generation_prompt = provider.prompts[-1]

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
    assert "CURRENT LESSON THEORY — HARD GRAMMAR BOUNDARY" in generation_prompt
    assert "Do not jump ahead to later course topics" in generation_prompt
    assert "CURRENT LESSON THEORY — HARD GRADING BOUNDARY" in provider.prompts[-1]
    assert "Do not deduct points" in provider.prompts[-1]


def test_homework_mistake_is_added_to_shared_analytics(client):
    app.dependency_overrides[get_tutor_provider] = lambda: FakeTutorProvider()
    homework = client.post("/api/v1/homework/generate", json={"lesson_id": 1})
    app.dependency_overrides[get_tutor_provider] = lambda: VocabularyTutorProvider()

    response = client.post(
        f"/api/v1/homework/{homework.json()['id']}/submit",
        json={"answer": "Dobry den"},
    )
    mistakes = client.get("/api/v1/progress/mistakes").json()
    homework_mistake = next(item for item in mistakes if item["source"] == "homework")

    assert response.status_code == 200
    assert homework_mistake["original_answer"] == "Dobry den"
    assert homework_mistake["lesson_id"] == 1
    assert homework_mistake["practice_count"] == 0

    practiced = client.post(
        f"/api/v1/progress/mistakes/{homework_mistake['id']}/practice"
    )

    assert practiced.status_code == 200
    assert practiced.json()["practice_count"] == 1


def test_new_words_are_saved_and_can_be_reviewed(client):
    app.dependency_overrides[get_tutor_provider] = lambda: VocabularyTutorProvider()

    answer = client.post(
        "/api/v1/lessons/1/answer",
        json={"exercise_id": 1, "answer": "Dobrý deň"},
    )
    topic_vocabulary = client.get("/api/v1/lessons/1/vocabulary")
    vocabulary_before_save = client.get("/api/v1/progress/vocabulary")
    topic_word_id = topic_vocabulary.json()[0]["id"]
    saved = client.post(f"/api/v1/progress/vocabulary/{topic_word_id}/save")
    vocabulary = client.get("/api/v1/progress/vocabulary")
    reviewed = client.post(f"/api/v1/progress/vocabulary/{saved.json()['id']}/review")
    due_after = client.get("/api/v1/progress/vocabulary/due")

    assert answer.status_code == 200
    assert answer.json()["mistake_id"] == 1
    assert topic_vocabulary.status_code == 200
    assert topic_vocabulary.json()[0]["id"] == saved.json()["id"]
    before_item = next(item for item in vocabulary_before_save.json() if item["id"] == topic_word_id)
    assert before_item["is_saved"] is False
    assert saved.json()["is_saved"] is True
    assert vocabulary.status_code == 200
    saved_item = next(item for item in vocabulary.json() if item["id"] == topic_word_id)
    assert saved_item["is_saved"] is True
    assert saved_item["mistake_id"] == 1
    assert reviewed.json()["review_count"] == 1
    assert reviewed.json()["interval_days"] == 1
    assert reviewed.json()["is_due"] is False
    assert any(item["id"] != topic_word_id for item in due_after.json())


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


def test_dialogue_deduplicates_vocabulary_from_one_agent_response(client):
    app.dependency_overrides[get_tutor_provider] = lambda: DuplicateVocabularyProvider()
    session = client.post("/api/v1/dialogue/sessions")

    response = client.post(
        f"/api/v1/dialogue/sessions/{session.json()['session_id']}/messages",
        json={"message": "Покажи пример"},
    )
    vocabulary = client.get("/api/v1/progress/vocabulary").json()

    assert response.status_code == 200
    assert len([item for item in vocabulary if item["word"].casefold() == "dom"]) == 1


def test_dialogue_mistake_marker_is_hidden_and_added_to_analytics(client):
    app.dependency_overrides[get_tutor_provider] = lambda: DialogueMistakeProvider()
    session = client.post("/api/v1/dialogue/sessions")

    response = client.post(
        f"/api/v1/dialogue/sessions/{session.json()['session_id']}/messages",
        json={"message": "готов к упражнению"},
    )
    mistakes = client.get("/api/v1/progress/mistakes").json()

    assert response.status_code == 200
    assert "<mistake-assessment>" not in response.json()["response"]
    assert mistakes[0]["source"] == "dialogue"
    assert mistakes[0]["category"] == "agreement"


def test_dialogue_practice_context_contains_current_message(client):
    provider = HistoryCaptureProvider()
    app.dependency_overrides[get_tutor_provider] = lambda: provider
    session = client.post("/api/v1/dialogue/sessions")
    session_id = session.json()["session_id"]
    client.post(
        f"/api/v1/dialogue/sessions/{session_id}/select-lesson",
        json={"lesson_id": 3},
    )
    client.post(
        f"/api/v1/dialogue/sessions/{session_id}/messages",
        json={"message": "готов к упражнению"},
    )
    response = client.post(
        f"/api/v1/dialogue/sessions/{session_id}/messages",
        json={"message": "CURRENT-LATEST-ANSWER"},
    )

    assert response.status_code == 200
    assert "CURRENT-LATEST-ANSWER" in provider.prompts[-1]
    assert "EXERCISE WORD-BANK RULE" in provider.prompts[-1]
    assert "grammatical gender" in provider.prompts[-1]
    assert "PREREQUISITE RULE" in provider.prompts[-1]
    assert "Do not jump ahead to later course topics" in provider.prompts[-1]


def test_dialogue_answer_is_saved_on_matching_exercise(client):
    app.dependency_overrides[get_tutor_provider] = lambda: FakeTutorProvider()
    session = client.post("/api/v1/dialogue/sessions")
    session_id = session.json()["session_id"]
    client.post(
        f"/api/v1/dialogue/sessions/{session_id}/select-lesson",
        json={"lesson_id": 2},
    )

    response = client.post(
        f"/api/v1/dialogue/sessions/{session_id}/messages",
        json={"message": "Volám sa Sergej."},
    )
    lesson = client.get("/api/v1/lessons/2")

    assert response.status_code == 200
    assert "Правильно" in response.json()["response"]
    assert "Следующее упражнение" not in response.json()["response"]
    assert "следующее упражнение" in response.json()["response"]
    assert lesson.status_code == 200
    exercise = lesson.json()["exercises"][0]
    assert exercise["submitted_answer"] == "Volám sa Sergej."
    assert exercise["is_completed"] is True
    assert exercise["score"] == 100


def test_ready_for_practice_is_accepted_as_continue_command_after_correct_answer(client):
    app.dependency_overrides[get_tutor_provider] = lambda: ContinuePracticeAliasProvider()
    session = client.post("/api/v1/dialogue/sessions")
    session_id = session.json()["session_id"]
    client.post(
        f"/api/v1/dialogue/sessions/{session_id}/select-lesson",
        json={"lesson_id": 2},
    )

    solved = client.post(
        f"/api/v1/dialogue/sessions/{session_id}/messages",
        json={"message": "Vol?m sa Sergej."},
    )
    continued = client.post(
        f"/api/v1/dialogue/sessions/{session_id}/messages",
        json={"message": "????? ? ??????????"},
    )
    mistakes = client.get("/api/v1/progress/mistakes").json()

    assert solved.status_code == 200
    assert "????? ? ??????????" in solved.json()["response"]
    assert continued.status_code == 200
    assert "??????? ??????????? ???????" in continued.json()["response"]
    assert mistakes == []


def test_dialogue_session_list_returns_recent_sessions_with_message_counts(client):
    app.dependency_overrides[get_tutor_provider] = lambda: FakeTutorProvider()
    first = client.post("/api/v1/dialogue/sessions")
    second = client.post("/api/v1/dialogue/sessions")
    client.post(
        f"/api/v1/dialogue/sessions/{first.json()['session_id']}/messages",
        json={"message": "Покажи теорию"},
    )

    response = client.get("/api/v1/dialogue/sessions")
    sessions = response.json()
    by_id = {item["session_id"]: item for item in sessions}

    assert response.status_code == 200
    assert first.json()["session_id"] in by_id
    assert second.json()["session_id"] in by_id
    assert by_id[first.json()["session_id"]]["message_count"] == 2


def test_dialogue_session_can_have_a_custom_title_and_lesson(client):
    response = client.post(
        "/api/v1/dialogue/sessions",
        json={"title": "Исправления ошибок", "lesson_id": 1},
    )

    assert response.status_code == 200
    assert response.json()["title"] == "Исправления ошибок"
    assert response.json()["current_lesson_id"] == 1
    listed = client.get("/api/v1/dialogue/sessions").json()
    assert listed[0]["title"] == "Исправления ошибок"


def test_dialogue_session_can_be_deleted_without_resetting_course(client):
    session = client.post("/api/v1/dialogue/sessions")
    session_id = session.json()["session_id"]

    response = client.delete(f"/api/v1/dialogue/sessions/{session_id}")

    assert response.status_code == 200
    assert response.json() == {"session_id": session_id, "deleted": True}
    assert client.get(f"/api/v1/dialogue/sessions/{session_id}").status_code == 404


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


def test_clear_dialogue_removes_messages_but_keeps_lesson_and_progress(client):
    app.dependency_overrides[get_tutor_provider] = lambda: FakeTutorProvider()
    session = client.post("/api/v1/dialogue/sessions")
    session_id = session.json()["session_id"]
    response = client.post(
        f"/api/v1/dialogue/sessions/{session_id}/messages",
        json={"message": "А где теория?"},
    )
    assert response.status_code == 200

    cleared = client.post(f"/api/v1/dialogue/sessions/{session_id}/clear")
    history = client.get(f"/api/v1/dialogue/sessions/{session_id}")

    assert cleared.status_code == 200
    assert cleared.json()["messages"] == []
    assert cleared.json()["current_lesson_id"] == session.json()["current_lesson_id"]
    assert cleared.json()["current_phase"] == "theory"
    assert history.json()["messages"] == []


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
