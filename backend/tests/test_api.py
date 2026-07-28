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


def test_lesson_is_available(client):
    response = client.get("/api/v1/lessons/1")

    assert response.status_code == 200
    assert response.json()["slug"] == "greetings"
    exercises = response.json()["exercises"]
    assert len(exercises) >= 5
    assert any(exercise["type"] == "dialogue" for exercise in exercises)


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
    first_session = client.post("/api/v1/dialogue/sessions", json={"title": "?????? ??????"})
    second_session = client.post("/api/v1/dialogue/sessions", json={"title": "?????? ??????"})

    client.post(
        f"/api/v1/dialogue/sessions/{first_session.json()['session_id']}/messages",
        json={"message": "?????? ??????"},
    )

    response = client.get("/api/v1/dialogue/logs")

    assert response.status_code == 200
    logs = response.json()
    assert len(logs) == 2
    by_id = {entry["session_id"]: entry for entry in logs}
    exported = by_id[first_session.json()["session_id"]]
    assert exported["title"] == "?????? ??????"
    assert len(exported["messages"]) == 2
    assert exported["messages"][0]["role"] == "user"
    assert exported["messages"][1]["role"] == "assistant"
    assert exported["messages"][0]["created_at"]
    assert exported["created_at"]
    assert exported["updated_at"]


def test_dialogue_logs_export_single_session(client):
    session = client.post("/api/v1/dialogue/sessions", json={"title": "??? ??? ????"})
    session_id = session.json()["session_id"]
    client.post(
        f"/api/v1/dialogue/sessions/{session_id}/messages",
        json={"message": "????? ? ??????????"},
    )

    response = client.get(f"/api/v1/dialogue/sessions/{session_id}/logs")

    assert response.status_code == 200
    exported = response.json()
    assert exported["session_id"] == session_id
    assert exported["title"] == "??? ??? ????"
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
