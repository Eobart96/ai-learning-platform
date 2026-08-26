import json

from sqlalchemy.orm import Session

from app.models import Module1BetaState, utc_now
from app.schemas.module1_beta import Module1BetaStatePayload


def load_module1_beta_state(db: Session) -> Module1BetaState | None:
    return db.get(Module1BetaState, 1)


def save_module1_beta_state(db: Session, payload: Module1BetaStatePayload) -> Module1BetaState:
    state = db.get(Module1BetaState, 1)
    if state is None:
        state = Module1BetaState(id=1)
        db.add(state)
    state.schema_version = 1
    state.state_json = payload.model_dump_json()
    state.updated_at = utc_now()
    db.commit()
    db.refresh(state)
    return state


def decode_module1_beta_state(state: Module1BetaState) -> Module1BetaStatePayload:
    return Module1BetaStatePayload.model_validate(json.loads(state.state_json))
