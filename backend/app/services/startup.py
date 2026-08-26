from app.database import Base, engine

# Importing models registers the active tables in SQLAlchemy metadata.
from app import models as _models  # noqa: F401


def initialize_application() -> None:
    """Create the active local SQLite tables without mutating legacy data."""
    Base.metadata.create_all(bind=engine)
