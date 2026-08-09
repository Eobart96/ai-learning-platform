from pydantic import BaseModel, ConfigDict


class CourseResponse(BaseModel):
    id: int
    slug: str
    title: str
    subject: str
    language: str
    level: str


class StudyRoadmapTopic(BaseModel):
    slug: str
    title: str
    description: str
    module_slug: str | None = None


class StudyRoadmapResponse(BaseModel):
    """Versioned course plan arranged as a sequence of topics."""

    model_config = ConfigDict(extra="allow")

    title: str
    note: str
    topics: list[StudyRoadmapTopic]
