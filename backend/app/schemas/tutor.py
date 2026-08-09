from pydantic import BaseModel


class TutorMessageRequest(BaseModel):
    message: str


class TutorMessageResponse(BaseModel):
    provider: str
    response: str


class CodexConnectionResponse(BaseModel):
    installed: bool
    authenticated: bool
    message: str
