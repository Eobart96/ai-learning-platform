from collections.abc import Generator
from pathlib import Path

from sqlalchemy import create_engine, inspect, text
from sqlalchemy.orm import DeclarativeBase, Session, sessionmaker

from app.config import get_settings


class Base(DeclarativeBase):
    pass


def _connect_args(database_url: str) -> dict[str, object]:
    return {"check_same_thread": False} if database_url.startswith("sqlite") else {}


settings = get_settings()
if settings.database_url.startswith("sqlite:///"):
    database_path = Path(settings.database_url.removeprefix("sqlite:///"))
    database_path.parent.mkdir(parents=True, exist_ok=True)
engine = create_engine(settings.database_url, connect_args=_connect_args(settings.database_url))
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False, expire_on_commit=False)


def get_db() -> Generator[Session, None, None]:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def ensure_sqlite_schema(database_engine) -> None:
    """Add nullable MVP columns to an existing local SQLite database."""
    if database_engine.dialect.name != "sqlite":
        return
    columns = {column["name"] for column in inspect(database_engine).get_columns("homework")}
    with database_engine.begin() as connection:
        if "mistake_id" not in columns:
            connection.execute(text("ALTER TABLE homework ADD COLUMN mistake_id INTEGER"))
        if "submitted_answer" not in columns:
            connection.execute(text("ALTER TABLE homework ADD COLUMN submitted_answer TEXT"))
        if "submitted_at" not in columns:
            connection.execute(text("ALTER TABLE homework ADD COLUMN submitted_at DATETIME"))
        vocabulary_columns = {column["name"] for column in inspect(database_engine).get_columns("vocabulary_items")}
        if "mistake_id" not in vocabulary_columns:
            connection.execute(text("ALTER TABLE vocabulary_items ADD COLUMN mistake_id INTEGER"))
        if "interval_days" not in vocabulary_columns:
            connection.execute(text("ALTER TABLE vocabulary_items ADD COLUMN interval_days INTEGER DEFAULT 0"))
        if "next_review_at" not in vocabulary_columns:
            connection.execute(text("ALTER TABLE vocabulary_items ADD COLUMN next_review_at DATETIME"))
        if "is_saved" not in vocabulary_columns:
            connection.execute(text("ALTER TABLE vocabulary_items ADD COLUMN is_saved BOOLEAN NOT NULL DEFAULT 0"))
        diary_columns = {column["name"] for column in inspect(database_engine).get_columns("diary_entries")}
        if "mistake_id" not in diary_columns:
            connection.execute(text("ALTER TABLE diary_entries ADD COLUMN mistake_id INTEGER"))
        mistake_columns = {column["name"] for column in inspect(database_engine).get_columns("mistakes")}
        if "lesson_id" not in mistake_columns:
            connection.execute(text("ALTER TABLE mistakes ADD COLUMN lesson_id INTEGER"))
        if "source" not in mistake_columns:
            connection.execute(text("ALTER TABLE mistakes ADD COLUMN source TEXT NOT NULL DEFAULT 'exercise'"))
        if "practice_count" not in mistake_columns:
            connection.execute(text("ALTER TABLE mistakes ADD COLUMN practice_count INTEGER NOT NULL DEFAULT 0"))
        if "resolved" not in mistake_columns:
            connection.execute(text("ALTER TABLE mistakes ADD COLUMN resolved BOOLEAN NOT NULL DEFAULT 0"))
        if "exercise_id" not in mistake_columns:
            connection.execute(text("ALTER TABLE mistakes ADD COLUMN exercise_id INTEGER"))
        session_columns = {column["name"] for column in inspect(database_engine).get_columns("learning_sessions")}
        if "title" not in session_columns:
            connection.execute(text("ALTER TABLE learning_sessions ADD COLUMN title TEXT"))
        if "current_phase" not in session_columns:
            connection.execute(text("ALTER TABLE learning_sessions ADD COLUMN current_phase TEXT DEFAULT 'theory'"))
