from fastapi import APIRouter, Depends, HTTPException

from app.config import get_settings
from app.dependencies import get_tutor_provider
from app.schemas.tutor import CodexConnectionResponse, TutorMessageRequest, TutorMessageResponse
from app.tutor import (
    TutorProvider,
    build_tutor_context,
    get_codex_connection_status,
    start_codex_login,
)


router = APIRouter(tags=["tutor"])


@router.get("/api/v1/codex/status", response_model=CodexConnectionResponse)
def codex_status() -> CodexConnectionResponse:
    status = get_codex_connection_status(get_settings())
    return CodexConnectionResponse(**status.__dict__)


@router.post("/api/v1/codex/login", response_model=CodexConnectionResponse)
def codex_login() -> CodexConnectionResponse:
    try:
        status = start_codex_login(get_settings())
    except RuntimeError as error:
        raise HTTPException(status_code=503, detail=str(error)) from error
    return CodexConnectionResponse(**status.__dict__)


@router.post("/api/v1/tutor/message", response_model=TutorMessageResponse)
def tutor_message(
    request: TutorMessageRequest,
    provider: TutorProvider = Depends(get_tutor_provider),
) -> TutorMessageResponse:
    if not request.message.strip():
        raise HTTPException(status_code=422, detail="Message must not be empty")
    settings = get_settings()
    context = build_tutor_context(settings, request.message)
    try:
        response = provider.respond(context)
    except (FileNotFoundError, RuntimeError, TimeoutError) as error:
        raise HTTPException(status_code=503, detail=f"Tutor provider unavailable: {error}") from error
    return TutorMessageResponse(provider=settings.tutor_provider, response=response)
