from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.config import get_settings
from app.course_loader import load_study_roadmap
from app.database import get_db
from app.models import Course
from app.schemas.courses import CourseResponse, StudyRoadmapResponse


router = APIRouter(tags=["courses"])


@router.get("/api/v1/courses", response_model=list[CourseResponse])
def list_courses(db: Session = Depends(get_db)) -> list[CourseResponse]:
    courses = db.scalars(select(Course).order_by(Course.id)).all()
    return [
        CourseResponse(
            id=course.id,
            slug=course.slug,
            title=course.title,
            subject=course.subject,
            language=course.language,
            level=course.level,
        )
        for course in courses
    ]


@router.get("/api/v1/courses/{course_slug}/study-roadmap", response_model=StudyRoadmapResponse)
def get_study_roadmap(course_slug: str, db: Session = Depends(get_db)) -> StudyRoadmapResponse:
    course = db.scalar(select(Course).where(Course.slug == course_slug))
    if course is None:
        raise HTTPException(status_code=404, detail="Course not found")
    roadmap_path = get_settings().project_root / "course-content" / course_slug / "study-roadmap.yaml"
    try:
        roadmap = load_study_roadmap(roadmap_path)
    except FileNotFoundError as error:
        raise HTTPException(status_code=404, detail="Study roadmap not found") from error
    return StudyRoadmapResponse(**roadmap)
