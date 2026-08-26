from typing import Annotated, Literal

from pydantic import BaseModel, Field


ShortChatSuggestion = Annotated[str, Field(min_length=1, max_length=160)]


class BetaChatHistoryMessage(BaseModel):
    role: str
    content: str = Field(max_length=2_000)


class BetaChatRequest(BaseModel):
    lesson_slug: str = Field(max_length=100)
    lesson_title: str = Field(max_length=200)
    goals: list[str] = Field(max_length=10)
    theory: str = Field(max_length=8_000)
    known_mistakes: list[str] = Field(default_factory=list, max_length=20)
    history: list[BetaChatHistoryMessage] = Field(default_factory=list, max_length=6)
    message: str = Field(min_length=1, max_length=2_000)
    current_task: str | None = Field(default=None, max_length=500)
    interaction_kind: Literal["answer", "clarification", "continue"] = "answer"
    is_final_turn: bool = False


class BetaChatResponse(BaseModel):
    provider: str
    reply: str
    correction: str | None = None
    explanation: str | None = None
    next_question: str | None = Field(default=None, max_length=500)
    suggestions: list[ShortChatSuggestion] = Field(default_factory=list, max_length=3)
    mistake_original: str | None = None
    mistake_corrected: str | None = None


TutorProviderName = Literal["codex", "openai", "polza"]


class TutorSettingsResponse(BaseModel):
    provider: TutorProviderName
    codex_installed: bool
    codex_authenticated: bool
    codex_message: str
    openai_api_key_configured: bool
    openai_model: str
    polza_api_key_configured: bool
    polza_model: str
    polza_base_url: str


class TutorSettingsUpdate(BaseModel):
    provider: TutorProviderName
    openai_api_key: str | None = Field(default=None, max_length=512)
    openai_model: str = Field(default="gpt-5", min_length=1, max_length=120)
    polza_api_key: str | None = Field(default=None, max_length=512)
    polza_model: str = Field(default="openai/gpt-4o-mini", min_length=1, max_length=160)
    clear_openai_api_key: bool = False
    clear_polza_api_key: bool = False


class CodexLoginResponse(BaseModel):
    installed: bool
    authenticated: bool
    message: str
