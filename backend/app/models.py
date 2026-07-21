from datetime import datetime

from sqlalchemy import Boolean, DateTime, ForeignKey, Integer, String, Text, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class Course(Base):
    __tablename__ = "courses"

    id: Mapped[int] = mapped_column(primary_key=True)
    slug: Mapped[str] = mapped_column(String(100), unique=True, index=True)
    title: Mapped[str] = mapped_column(String(255))
    subject: Mapped[str] = mapped_column(String(100))
    language: Mapped[str] = mapped_column(String(20))
    teaching_language: Mapped[str] = mapped_column(String(20))
    level: Mapped[str] = mapped_column(String(20))
    modules: Mapped[list["Module"]] = relationship(back_populates="course", cascade="all, delete-orphan")


class Module(Base):
    __tablename__ = "modules"

    id: Mapped[int] = mapped_column(primary_key=True)
    course_id: Mapped[int] = mapped_column(ForeignKey("courses.id"), index=True)
    slug: Mapped[str] = mapped_column(String(100))
    title: Mapped[str] = mapped_column(String(255))
    order_number: Mapped[int] = mapped_column(Integer)
    course: Mapped[Course] = relationship(back_populates="modules")
    lessons: Mapped[list["Lesson"]] = relationship(back_populates="module", cascade="all, delete-orphan")
    __table_args__ = (UniqueConstraint("course_id", "slug"),)


class Lesson(Base):
    __tablename__ = "lessons"

    id: Mapped[int] = mapped_column(primary_key=True)
    module_id: Mapped[int] = mapped_column(ForeignKey("modules.id"), index=True)
    slug: Mapped[str] = mapped_column(String(100))
    title: Mapped[str] = mapped_column(String(255))
    order_number: Mapped[int] = mapped_column(Integer)
    theory: Mapped[str | None] = mapped_column(Text, nullable=True)
    module: Mapped[Module] = relationship(back_populates="lessons")
    exercises: Mapped[list["Exercise"]] = relationship(back_populates="lesson", cascade="all, delete-orphan")
    __table_args__ = (UniqueConstraint("module_id", "slug"),)


class Exercise(Base):
    __tablename__ = "exercises"

    id: Mapped[int] = mapped_column(primary_key=True)
    lesson_id: Mapped[int] = mapped_column(ForeignKey("lessons.id"), index=True)
    exercise_type: Mapped[str] = mapped_column(String(50))
    question: Mapped[str] = mapped_column(Text)
    instruction: Mapped[str | None] = mapped_column(Text, nullable=True)
    correct_answer: Mapped[str | None] = mapped_column(Text, nullable=True)
    explanation: Mapped[str | None] = mapped_column(Text, nullable=True)
    lesson: Mapped[Lesson] = relationship(back_populates="exercises")


class LessonAttempt(Base):
    __tablename__ = "lesson_attempts"

    id: Mapped[int] = mapped_column(primary_key=True)
    lesson_id: Mapped[int] = mapped_column(ForeignKey("lessons.id"), index=True)
    score: Mapped[int | None] = mapped_column(Integer, nullable=True)
    completed: Mapped[bool] = mapped_column(Boolean, default=False)
    started_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


class UserAnswer(Base):
    __tablename__ = "user_answers"

    id: Mapped[int] = mapped_column(primary_key=True)
    exercise_id: Mapped[int] = mapped_column(ForeignKey("exercises.id"), index=True)
    lesson_attempt_id: Mapped[int] = mapped_column(ForeignKey("lesson_attempts.id"), index=True)
    user_answer: Mapped[str] = mapped_column(Text)
    is_correct: Mapped[bool | None] = mapped_column(Boolean, nullable=True)
    score: Mapped[int | None] = mapped_column(Integer, nullable=True)
    ai_feedback: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


class Mistake(Base):
    __tablename__ = "mistakes"

    id: Mapped[int] = mapped_column(primary_key=True)
    course_id: Mapped[int] = mapped_column(ForeignKey("courses.id"), index=True)
    category: Mapped[str] = mapped_column(String(100))
    original_answer: Mapped[str] = mapped_column(Text)
    corrected_answer: Mapped[str] = mapped_column(Text)
    explanation: Mapped[str] = mapped_column(Text)
    mistake_count: Mapped[int] = mapped_column(Integer, default=1)
    last_mistake_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
