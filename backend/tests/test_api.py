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
    assert len(response.json()["exercises"]) == 2


def test_all_a1_lessons_have_substantive_theory(client):
    roadmap = client.get("/api/v1/roadmap").json()
    lessons = [lesson for module in roadmap for lesson in module["lessons"]]

    assert len(lessons) == 31
    for lesson in lessons:
        response = client.get(f"/api/v1/lessons/{lesson['id']}")
        assert response.status_code == 200
        theory = response.json()["theory"] or ""
        assert len(theory) >= 200, lesson["slug"]


def test_unknown_lesson_returns_404(client):
    response = client.get("/api/v1/lessons/999")

    assert response.status_code == 404


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
