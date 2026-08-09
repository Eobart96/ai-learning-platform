from datetime import datetime

from pydantic import BaseModel


class DialogueSessionResponse(BaseModel):
    session_id: int
    title: str | None
    current_lesson_id: int | None
    current_lesson_title: str | None
    current_phase: str
    status: str


class DialogueSessionListItem(DialogueSessionResponse):
    message_count: int
    created_at: datetime
    updated_at: datetime


class DialogueMessageRequest(BaseModel):
    message: str


class DialogueSessionCreateRequest(BaseModel):
    title: str | None = None
    lesson_id: int | None = None


class DialogueLessonSelectionRequest(BaseModel):
    lesson_id: int


class DialogueMessageView(BaseModel):
    role: str
    content: str


class DialogueMessageLogView(DialogueMessageView):
    created_at: datetime


class DialogueHistoryResponse(DialogueSessionResponse):
    messages: list[DialogueMessageView]


class DialogueLogEntry(DialogueSessionResponse):
    created_at: datetime
    updated_at: datetime
    messages: list[DialogueMessageLogView]


class DialogueSessionDeleteResponse(BaseModel):
    session_id: int
    deleted: bool


class DialogueMessageResponse(DialogueSessionResponse):
    response: str
    progress_saved: bool
