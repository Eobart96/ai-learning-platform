from dataclasses import dataclass
import json
import os
from pathlib import Path
import shutil
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


class GeneratedExercise(BaseModel):
    question: str = Field(min_length=1, max_length=2_000)
    instruction: str = Field(min_length=1, max_length=1_000)


class TutorProvider(Protocol):
    def respond(self, context: TutorContext) -> str:
        ...


def build_tutor_context(settings: Settings, user_message: str) -> TutorContext:
    """Build the teacher prompt from versioned learning documents."""
    learning_dir = settings.course_path.parent / "learning"
    local_profile = settings.project_root / ".ai" / "private" / "student_profile.local.md"
    profile = _read_learning_file(local_profile if local_profile.exists() else learning_dir / "student_profile.md")
    roadmap = _read_learning_file(learning_dir / "learning_roadmap.md")
    method = _read_learning_file(learning_dir / "teaching_method.md")

    prompt = f"""Ты — AI-преподаватель словацкого языка для русскоговорящего ученика.

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


def build_math_tutor_context(*, lesson_title: str, theory: str | None, progress: str, user_message: str) -> TutorContext:
    """Build an isolated maths tutor prompt without Slovak-course context."""
    prompt = f"""Ты — AI-репетитор по школьной математике для русскоговорящего ученика.

Текущая тема: {lesson_title}
Прогресс по математике: {progress}
Краткая теория темы:
{theory or "Теория пока не добавлена."}

Правила ответа:
- отвечай по-русски, ясно и по шагам;
- объясняй ход решения и правило, а не только называй результат;
- записывай формулы обычными символами без LaTeX: дробь как 3/8, умножение как ×, деление как ÷, корень как √9;
- каждое действие пиши с новой строки, чтобы все дроби и числа были видны;
- если вопрос относится к текущему примеру, помоги сделать следующий шаг, не подменяя самостоятельное решение без прямой просьбы;
- не упоминай словацкий язык, словарь, дневник, домашние задания или прогресс другого курса;
- не создавай и не меняй записи курса — это только консультация.

Вопрос ученика:
{user_message}
"""
    return TutorContext(prompt=prompt)


def build_mistake_chat_context(
    *,
    category: str,
    lesson_title: str | None,
    original_answer: str,
    corrected_answer: str,
    explanation: str,
    user_message: str,
) -> TutorContext:
    """Build a strict, stateless chat context for one selected mistake."""
    prompt = f"""Ты — помощник для ИЗОЛИРОВАННОГО ЧАТА ПО ОШИБКЕ в словацком A1.

Выбранная ошибка:
- категория: {category}
- тема: {lesson_title or "не указана"}
- ответ ученика: {original_answer}
- исправление: {corrected_answer}
- объяснение: {explanation}

Жёсткие границы:
- работай только с выбранной ошибкой и её правилом;
- не начинай урок, не веди общий учебный диалог и не переключай тему;
- не выдавай задания из будущей грамматики;
- не создавай и не изменяй прогресс, домашние задания, ошибки, словарь, дневник или учебные сессии;
- отвечай по-русски, используй только короткие словацкие примеры с переводом;
- если вопрос не относится к этой ошибке, коротко верни разговор к ней;
- можно попросить ученика написать исправленный вариант, но не утверждай, что ошибка подтверждена или исправлена.

Сообщение ученика:
{user_message}
"""
    return TutorContext(prompt=prompt)


def build_generated_exercise_context(*, lesson_title: str, theory: str | None) -> TutorContext:
    prompt = f"""Ты — генератор упражнений по словацкому языку A1.

Текущая тема: {lesson_title}
Теория текущей темы:
{theory or "Теория пока не добавлена."}

СГЕНЕРИРУЙ ОДНО НОВОЕ УПРАЖНЕНИЕ только по текущей теме.
Не используй будущую грамматику, незнакомую лексику или несколько заданий сразу.
Ответ ученика должен быть коротким текстом на словацком языке.
Верни только JSON без markdown:
{{"question":"вопрос на русском","instruction":"краткая инструкция на русском"}}
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


def parse_generated_exercise(response: str) -> GeneratedExercise:
    content = response.strip()
    if content.startswith("\x60\x60\x60"):
        content = content.removeprefix("\x60\x60\x60").removeprefix("json").removesuffix("\x60\x60\x60").strip()
    return GeneratedExercise.model_validate(json.loads(content))


class CodexCliProvider:
    """Use the locally authenticated Codex CLI subscription in read-only mode."""

    def __init__(self, settings: Settings) -> None:
        self.settings = settings

    def respond(self, context: TutorContext) -> str:
        with tempfile.NamedTemporaryFile(suffix=".txt", delete=False) as output_file:
            output_path = Path(output_file.name)

        executable_path = resolve_codex_executable(self.settings.codex_command)
        if executable_path is None:
            raise RuntimeError("Codex CLI не установлен или не найден.")
        executable = str(executable_path)
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


@dataclass(frozen=True)
class CodexConnectionStatus:
    installed: bool
    authenticated: bool
    message: str


def resolve_codex_executable(configured_command: str) -> Path | None:
    """Resolve Codex from PATH, an explicit setting, npm, or the desktop app."""
    configured_path = Path(configured_command).expanduser()
    if configured_path.is_file():
        return configured_path.resolve()

    path_match = shutil.which(configured_command)
    if path_match:
        return Path(path_match).resolve()

    candidates: list[Path] = []
    appdata = os.environ.get("APPDATA")
    if appdata:
        candidates.append(Path(appdata) / "npm" / "codex.cmd")

    local_appdata = os.environ.get("LOCALAPPDATA")
    if local_appdata:
        desktop_bin = Path(local_appdata) / "OpenAI" / "Codex" / "bin"
        if desktop_bin.is_dir():
            candidates.extend(desktop_bin.glob("*/codex.exe"))
        candidates.append(Path(local_appdata) / "Microsoft" / "WinGet" / "Links" / "codex.exe")

    existing = [candidate for candidate in candidates if candidate.is_file()]
    if not existing:
        return None
    return max(existing, key=lambda candidate: candidate.stat().st_mtime).resolve()


def get_codex_connection_status(settings: Settings) -> CodexConnectionStatus:
    """Check whether the configured Codex CLI is available and authenticated."""
    executable = resolve_codex_executable(settings.codex_command)
    if not executable:
        return CodexConnectionStatus(False, False, "Codex CLI не установлен или не найден.")

    command = subprocess.list2cmdline([str(executable), "login", "status"])
    try:
        result = subprocess.run(
            ["cmd.exe", "/d", "/s", "/c", command],
            capture_output=True,
            cwd=settings.project_root,
            timeout=15,
            check=False,
        )
    except (OSError, subprocess.TimeoutExpired) as error:
        return CodexConnectionStatus(True, False, f"Не удалось проверить авторизацию Codex: {error}")

    output = _decode_process_output(result.stdout).strip() or _decode_process_output(result.stderr).strip()
    if result.returncode == 0:
        return CodexConnectionStatus(True, True, output or "Codex подключён.")
    return CodexConnectionStatus(True, False, output or "Требуется вход в Codex.")


def start_codex_login(settings: Settings) -> CodexConnectionStatus:
    """Open the interactive Codex login flow in a separate Windows console."""
    current = get_codex_connection_status(settings)
    if not current.installed or current.authenticated:
        return current

    executable = resolve_codex_executable(settings.codex_command)
    if not executable:
        return current
    command = subprocess.list2cmdline([str(executable), "login"])
    try:
        subprocess.Popen(
            ["cmd.exe", "/d", "/s", "/k", command],
            cwd=settings.project_root,
            creationflags=getattr(subprocess, "CREATE_NEW_CONSOLE", 0),
        )
    except OSError as error:
        raise RuntimeError(f"Не удалось запустить вход в Codex: {error}") from error
    return CodexConnectionStatus(
        True,
        False,
        "Окно входа открыто. Завершите авторизацию — статус обновится автоматически.",
    )


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
