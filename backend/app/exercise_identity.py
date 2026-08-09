import re


def exercise_identity(question: str, instruction: str | None = None) -> tuple[str, str]:
    """Return the learner-visible identity of an exercise.

    A final punctuation mark must not turn the same prompt into a second task.
    """

    return (_normalize(question), _normalize(instruction or ""))


def _normalize(value: str) -> str:
    return re.sub(r"\\s+", " ", value).strip().rstrip(".?!…").casefold()
