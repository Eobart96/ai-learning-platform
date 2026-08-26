from datetime import datetime, timezone

from sqlalchemy import Boolean, DateTime, ForeignKey, Integer, String, Text, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


def utc_now() -> datetime:
    return datetime.now(timezone.utc)


class Module1BetaState(Base):
    __tablename__ = "module1_beta_state"

    id: Mapped[int] = mapped_column(primary_key=True, default=1)
    schema_version: Mapped[int] = mapped_column(Integer, default=1, nullable=False)
    state_json: Mapped[str] = mapped_column(Text, default="{}", nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=utc_now, onupdate=utc_now)


class Module1BetaExercise(Base):
    __tablename__ = "module1_beta_exercises"

    id: Mapped[int] = mapped_column(primary_key=True)
    lesson_slug: Mapped[str] = mapped_column(String(100), index=True)
    lesson_title: Mapped[str] = mapped_column(String(255))
    question: Mapped[str] = mapped_column(Text)
    instruction: Mapped[str] = mapped_column(Text)
    theory_snapshot: Mapped[str] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=utc_now, index=True)


class Module1BetaExerciseAttempt(Base):
    __tablename__ = "module1_beta_exercise_attempts"

    id: Mapped[int] = mapped_column(primary_key=True)
    exercise_id: Mapped[int] = mapped_column(ForeignKey("module1_beta_exercises.id"), index=True)
    answer: Mapped[str] = mapped_column(Text)
    is_correct: Mapped[bool] = mapped_column(Boolean)
    score: Mapped[int] = mapped_column(Integer)
    corrected_answer: Mapped[str] = mapped_column(Text)
    explanation: Mapped[str] = mapped_column(Text)
    next_exercise: Mapped[str] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=utc_now, index=True)


class Module1BetaReading(Base):
    __tablename__ = "module1_beta_readings"

    id: Mapped[int] = mapped_column(primary_key=True)
    lesson_slug: Mapped[str] = mapped_column(String(100), index=True)
    lesson_title: Mapped[str] = mapped_column(String(255))
    title: Mapped[str] = mapped_column(String(255))
    text: Mapped[str] = mapped_column(Text)
    instruction: Mapped[str] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=utc_now, index=True)


class Module1BetaReadingAttempt(Base):
    __tablename__ = "module1_beta_reading_attempts"

    id: Mapped[int] = mapped_column(primary_key=True)
    reading_id: Mapped[int] = mapped_column(ForeignKey("module1_beta_readings.id"), index=True)
    retelling: Mapped[str] = mapped_column(Text)
    score: Mapped[int] = mapped_column(Integer)
    feedback: Mapped[str] = mapped_column(Text)
    corrected_retelling: Mapped[str] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=utc_now, index=True)


class Module1BetaVocabularyItem(Base):
    __tablename__ = "module1_beta_vocabulary"

    id: Mapped[int] = mapped_column(primary_key=True)
    lesson_slug: Mapped[str] = mapped_column(String(100), index=True)
    lesson_title: Mapped[str] = mapped_column(String(255))
    word: Mapped[str] = mapped_column(String(255))
    translation: Mapped[str] = mapped_column(String(500))
    example: Mapped[str | None] = mapped_column(Text, nullable=True)
    review_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    interval_days: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    last_reviewed_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    next_review_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True, index=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=utc_now)
    __table_args__ = (UniqueConstraint("lesson_slug", "word"),)


class Module1BetaHomework(Base):
    __tablename__ = "module1_beta_homework"

    id: Mapped[int] = mapped_column(primary_key=True)
    lesson_slug: Mapped[str] = mapped_column(String(100), index=True)
    lesson_title: Mapped[str] = mapped_column(String(255))
    title: Mapped[str] = mapped_column(String(255))
    description: Mapped[str] = mapped_column(Text)
    focus_category: Mapped[str] = mapped_column(String(255))
    theory_snapshot: Mapped[str] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=utc_now, index=True)


class Module1BetaHomeworkAttempt(Base):
    __tablename__ = "module1_beta_homework_attempts"

    id: Mapped[int] = mapped_column(primary_key=True)
    homework_id: Mapped[int] = mapped_column(ForeignKey("module1_beta_homework.id"), index=True)
    answer: Mapped[str] = mapped_column(Text)
    is_correct: Mapped[bool] = mapped_column(Boolean)
    score: Mapped[int] = mapped_column(Integer)
    corrected_answer: Mapped[str] = mapped_column(Text)
    explanation: Mapped[str] = mapped_column(Text)
    next_exercise: Mapped[str] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=utc_now, index=True)
