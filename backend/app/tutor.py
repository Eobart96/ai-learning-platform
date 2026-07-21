from dataclasses import dataclass
import json
from pathlib import Path
import subprocess
import tempfile
from typing import Protocol

from app.config import Settings
from pydantic import BaseModel, Field


@dataclass(frozen=True)
class TutorContext:
    prompt: str


class VocabularyWord(BaseModel):
    word: str
    translation: str
    example: str | None = None


class TutorAssessment(BaseModel):
    is_correct: bool
    score: int = Field(ge=0, le=100)
    corrected_answer: str
    explanation: str
    next_exercise: str
    mistake_category: str | None = None
    new_words: list[VocabularyWord] = Field(default_factory=list)


class HomeworkGeneration(BaseModel):
    title: str
    description: str
    focus_category: str


class TutorProvider(Protocol):
    def respond(self, context: TutorContext) -> str:
        ...


def build_tutor_context(settings: Settings, user_message: str) -> TutorContext:
    """Build the teacher prompt from versioned learning documents."""
    learning_dir = settings.course_path.parent / "learning"
    profile = _read_learning_file(learning_dir / "student_profile.md")
    roadmap = _read_learning_file(learning_dir / "learning_roadmap.md")
    method = _read_learning_file(learning_dir / "teaching_method.md")

    prompt = f"""Ты — AI-преподаватель словацкого языка для ученика Sergej.

Следуй профилю ученика:
{profile}

Следуй учебному roadmap:
{roadmap}

Следуй методике преподавания:
{method}

Правила текущего ответа:
- отвечай по-русски, но используй словацкие примеры с переводом;
- давай только одно упражнение или один следующий шаг;
- не раскрывай ответ заранее;
- если ученик ошибся, сначала покажи его вариант, затем исправление и короткое объяснение;
- сохраняй доброжелательный, но честный тон;
- не утверждай, что прогресс сохранен, если приложение его не передало.

Сообщение ученика:
{user_message}
"""
    return TutorContext(prompt=prompt)


def _read_learning_file(path: Path) -> str:
    if not path.exists():
        raise FileNotFoundError(f"Learning document not found: {path}")
    return path.read_text(encoding="utf-8")


def parse_tutor_assessment(response: str) -> TutorAssessment:
    """Validate a provider response and tolerate a markdown JSON fence."""
    content = response.strip()
    if content.startswith("\x60\x60\x60"):
        content = content.removeprefix("\x60\x60\x60").removeprefix("json").removesuffix("\x60\x60\x60").strip()
    return TutorAssessment.model_validate(json.loads(content))


def parse_homework_generation(response: str) -> HomeworkGeneration:
    content = response.strip()
    if content.startswith("\x60\x60\x60"):
        content = content.removeprefix("\x60\x60\x60").removeprefix("json").removesuffix("\x60\x60\x60").strip()
    return HomeworkGeneration.model_validate(json.loads(content))


class CodexCliProvider:
    """Use the locally authenticated Codex CLI subscription in read-only mode."""

    def __init__(self, settings: Settings) -> None:
        self.settings = settings

    def respond(self, context: TutorContext) -> str:
        with tempfile.NamedTemporaryFile(suffix=".txt", delete=False) as output_file:
            output_path = Path(output_file.name)

        executable = self.settings.codex_command
        if " " in executable:
            executable = f'"{executable}"'
        output_argument = str(output_path)
        if " " in output_argument:
            output_argument = f'"{output_argument}"'
        command = (
            f'{executable} exec --ephemeral '
            f'-s read-only --skip-git-repo-check '
            f'-o {output_argument}'
        )
        try:
            result = subprocess.run(
                ["cmd.exe", "/d", "/s", "/c", command],
                input=context.prompt.encode("utf-8"),
                capture_output=True,
                cwd=self.settings.project_root,
                timeout=self.settings.tutor_timeout_seconds,
                check=False,
            )
            if result.returncode != 0:
                detail = (
                    _decode_process_output(result.stderr).strip()
                    or _decode_process_output(result.stdout).strip()
                    or "Unknown Codex error"
                )
                raise RuntimeError(detail)
            response = output_path.read_text(encoding="utf-8").strip()
            if not response:
                raise RuntimeError("Codex returned an empty response")
            return response
        finally:
            output_path.unlink(missing_ok=True)


def _decode_process_output(output: bytes | None) -> str:
    if not output:
        return ""
    try:
        return output.decode("utf-8")
    except UnicodeDecodeError:
        return output.decode("cp866", errors="replace")


class OpenAIProvider:
    """Optional API provider using the same TutorContext as Codex mode."""

    def __init__(self, settings: Settings) -> None:
        self.settings = settings

    def respond(self, context: TutorContext) -> str:
        from openai import OpenAI

        client = OpenAI(api_key=self.settings.openai_api_key)
        response = client.responses.create(model=self.settings.openai_model, input=context.prompt)
        return response.output_text
