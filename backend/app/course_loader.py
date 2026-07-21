from pathlib import Path
from typing import Any

import yaml
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models import Course, Exercise, Lesson, Module


def load_course(db: Session, course_path: Path) -> Course:
    """Import a YAML course idempotently and return its database record."""
    if not course_path.exists():
        raise FileNotFoundError(f"Course file not found: {course_path}")

    with course_path.open("r", encoding="utf-8") as file:
        payload: dict[str, Any] = yaml.safe_load(file) or {}

    course_data = payload["course"]
    course = db.scalar(select(Course).where(Course.slug == course_data["slug"]))
    if course is None:
        course = Course(
            slug=course_data["slug"],
            title=course_data["title"],
            subject=course_data["subject"],
            language=course_data["language"],
            teaching_language=course_data["teaching_language"],
            level=course_data["level"],
        )
        db.add(course)
        db.flush()

    if not course.modules:
        for module_data in payload.get("modules", []):
            module = Module(
                course_id=course.id,
                slug=module_data["slug"],
                title=module_data["title"],
                order_number=module_data["order"],
            )
            db.add(module)
            db.flush()
            for lesson_data in module_data.get("lessons", []):
                lesson = Lesson(
                    module_id=module.id,
                    slug=lesson_data["slug"],
                    title=lesson_data["title"],
                    order_number=lesson_data["order"],
                    theory="\n".join(lesson_data.get("theory", [])) or None,
                )
                db.add(lesson)
                db.flush()
                for exercise_data in lesson_data.get("exercises", []):
                    db.add(
                        Exercise(
                            lesson_id=lesson.id,
                            exercise_type=exercise_data["type"],
                            question=exercise_data.get("question", ""),
                            instruction=exercise_data.get("instruction"),
                            correct_answer=exercise_data.get("answer"),
                        )
                    )

    db.commit()
    db.refresh(course)
    return course
