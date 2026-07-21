from contextlib import asynccontextmanager

from fastapi import Depends, FastAPI
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.config import get_settings
from app.course_loader import load_course
from app.database import Base, engine, get_db
from app.models import Course


@asynccontextmanager
async def lifespan(_: FastAPI):
    settings = get_settings()
    settings_path = settings.course_path
    settings_path.parent.mkdir(parents=True, exist_ok=True)
    Base.metadata.create_all(bind=engine)
    with Session(engine) as db:
        load_course(db, settings_path)
    yield


app = FastAPI(title=get_settings().app_name, lifespan=lifespan)


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.get("/api/v1/courses")
def list_courses(db: Session = Depends(get_db)) -> list[dict[str, object]]:
    courses = db.scalars(select(Course).order_by(Course.id)).all()
    return [
        {
            "id": course.id,
            "slug": course.slug,
            "title": course.title,
            "subject": course.subject,
            "language": course.language,
            "level": course.level,
        }
        for course in courses
    ]
