import json

from sqlalchemy.orm import Session

from app.models import CourseState, utc_now
from app.schemas.course import CourseStatePayload


def load_course_state(db: Session) -> CourseState | None:
    return db.get(CourseState, 1)


def save_course_state(db: Session, payload: CourseStatePayload) -> CourseState:
    state = db.get(CourseState, 1)
    if state is None:
        state = CourseState(id=1)
        db.add(state)
    state.schema_version = 1
    state.state_json = payload.model_dump_json()
    state.updated_at = utc_now()
    db.commit()
    db.refresh(state)
    return state


def decode_course_state(state: CourseState) -> CourseStatePayload:
    return CourseStatePayload.model_validate(json.loads(state.state_json))
