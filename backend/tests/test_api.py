def test_health(client):
    response = client.get("/health")

    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_course_is_loaded(client):
    response = client.get("/api/v1/courses")

    assert response.status_code == 200
    assert response.json()[0]["slug"] == "slovak-a1"
    assert response.json()[0]["title"] == "Slovak A1"
