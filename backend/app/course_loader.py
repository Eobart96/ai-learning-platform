from pathlib import Path
from typing import Any

import yaml
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.exercise_identity import exercise_identity
from app.models import Course, Exercise, Lesson, Module


def load_study_roadmap(roadmap_path: Path) -> dict[str, Any]:
    """Read a versioned study roadmap without importing it into the course database."""
    if not roadmap_path.exists():
        raise FileNotFoundError(f"Study roadmap not found: {roadmap_path}")
    with roadmap_path.open("r", encoding="utf-8") as file:
        payload: dict[str, Any] = yaml.safe_load(file) or {}
    return payload.get("roadmap", {})


def load_course(db: Session, course_path: Path) -> Course:
    """Import a YAML course idempotently and return its database record."""
    if not course_path.exists():
        raise FileNotFoundError(f"Course file not found: {course_path}")

    with course_path.open("r", encoding="utf-8") as file:
        payload: dict[str, Any] = yaml.safe_load(file) or {}

    practice_payload: dict[str, Any] = {}
    practice_path = course_path.with_name("practice.yaml")
    if practice_path.exists():
        with practice_path.open("r", encoding="utf-8") as file:
            practice_payload = yaml.safe_load(file) or {}
    practice_by_slug = {
        item["lesson_slug"]: item.get("exercises", [])
        for item in practice_payload.get("practice", [])
    }

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

    for module_data in payload.get("modules", []):
        module = db.scalar(
            select(Module).where(
                Module.course_id == course.id,
                Module.slug == module_data["slug"],
            )
        )
        if module is None:
            module = Module(
                course_id=course.id,
                slug=module_data["slug"],
                title=module_data["title"],
                order_number=module_data["order"],
            )
            db.add(module)
            db.flush()
        else:
            module.title = module_data["title"]
            module.order_number = module_data["order"]
        for lesson_data in module_data.get("lessons", []):
            lesson = db.scalar(
                select(Lesson).where(
                    Lesson.module_id == module.id,
                    Lesson.slug == lesson_data["slug"],
                )
            )
            if lesson is not None:
                lesson.title = lesson_data["title"]
                lesson.order_number = lesson_data["order"]
                lesson.theory = "\n".join(lesson_data.get("theory", [])) or None
            else:
                lesson = Lesson(
                    module_id=module.id,
                    slug=lesson_data["slug"],
                    title=lesson_data["title"],
                    order_number=lesson_data["order"],
                    theory="\n".join(lesson_data.get("theory", [])) or None,
                )
                db.add(lesson)
                db.flush()

            exercise_data_list = list(lesson_data.get("exercises", []))
            exercise_data_list.extend(practice_by_slug.get(lesson_data["slug"], []))
            seen_exercise_identities: set[tuple[str, str]] = set()
            for exercise_data in exercise_data_list:
                question = exercise_data.get("question", "")
                instruction = exercise_data.get("instruction")
                answer = exercise_data.get("answer")
                identity = exercise_identity(question, instruction)
                if identity in seen_exercise_identities:
                    continue
                seen_exercise_identities.add(identity)
                existing_exercise = db.scalar(
                    select(Exercise).where(
                        Exercise.lesson_id == lesson.id,
                        Exercise.exercise_type == exercise_data["type"],
                        Exercise.question == question,
                        Exercise.instruction == instruction,
                        Exercise.correct_answer == answer,
                    )
                )
                if existing_exercise is None:
                    db.add(
                        Exercise(
                            lesson_id=lesson.id,
                            exercise_type=exercise_data["type"],
                            question=question,
                            instruction=instruction,
                            correct_answer=answer,
                        )
                    )

    db.commit()
    db.refresh(course)
    return course
