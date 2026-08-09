from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models import Lesson


def get_lesson_title(db: Session, lesson_id: int | None) -> str | None:
    if lesson_id is None:
        return None
    lesson = db.scalar(select(Lesson).where(Lesson.id == lesson_id))
    return lesson.title if lesson else None
