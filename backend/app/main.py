from contextlib import asynccontextmanager

from fastapi import FastAPI

from app.config import get_settings
from app.routers.course import router as course_router
from app.routers.system import router as system_router
from app.routers.tutor import router as tutor_router
from app.services.startup import initialize_application


@asynccontextmanager
async def lifespan(_: FastAPI):
    initialize_application()
    yield


app = FastAPI(title=get_settings().app_name, lifespan=lifespan)
app.include_router(tutor_router)
app.include_router(course_router)
app.include_router(system_router)
