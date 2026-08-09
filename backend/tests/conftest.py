from collections.abc import Generator
from pathlib import Path

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker

from app.config import get_settings
from app.database import Base, get_db
import app.main as main_module
from app.main import app, get_tutor_provider
from app.tutor import TutorContext


class TestTutorProvider:
    """Offline default for endpoints that exercise the dialogue flow in tests."""

    def respond(self, context: TutorContext) -> str:
        prompt = context.prompt.lower()
        if "домашнее задание" in prompt:
            return (
                '{"title":"Тестовое домашнее задание","description":"Выполни одно тестовое задание.",'
                '"focus_category":"test"}'
            )
        if "только json" in prompt:
            return (
                '{"is_correct":true,"score":100,"corrected_answer":"Тестовый ответ",'
                '"explanation":"Тестовая проверка.","next_exercise":"Продолжай.",'
                '"mistake_category":null,"new_words":[]}'
            )
        return "Тестовый ответ преподавателя."


@pytest.fixture
def client(tmp_path: Path) -> Generator[TestClient, None, None]:
    database_url = f"sqlite:///{tmp_path / 'test.db'}"
    test_engine = create_engine(database_url, connect_args={"check_same_thread": False})
    test_session = sessionmaker(bind=test_engine, autoflush=False, autocommit=False)
    Base.metadata.create_all(bind=test_engine)

    def override_get_db() -> Generator[Session, None, None]:
        db = test_session()
        try:
            yield db
        finally:
            db.close()

    app.dependency_overrides[get_db] = override_get_db
    app.dependency_overrides[get_tutor_provider] = lambda: TestTutorProvider()
    settings = get_settings()
    original_database_url = settings.database_url
    original_course_path = settings.course_path
    original_engine = main_module.engine
    settings.database_url = database_url
    settings.course_path = Path(__file__).parents[2] / "course-content" / "slovak-a1" / "course.yaml"
    main_module.engine = test_engine
    with TestClient(app) as test_client:
        yield test_client
    settings.database_url = original_database_url
    settings.course_path = original_course_path
    main_module.engine = original_engine
    app.dependency_overrides.clear()
    test_engine.dispose()
