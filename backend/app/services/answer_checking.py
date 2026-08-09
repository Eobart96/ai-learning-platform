from fractions import Fraction

from app.tutor import TutorAssessment


def parse_numeric_value(value: str | None) -> Fraction | None:
    if value is None:
        return None
    normalized = value.strip().replace(",", ".").replace(" ", "")
    if not normalized:
        return None
    try:
        return Fraction(normalized)
    except (ValueError, ZeroDivisionError):
        return None


def assess_numeric_answer(answer: str, expected_answer: str | None) -> TutorAssessment:
    expected = parse_numeric_value(expected_answer)
    actual = parse_numeric_value(answer)
    if expected is not None and actual == expected:
        return TutorAssessment(
            is_correct=True,
            score=100,
            corrected_answer=expected_answer or "",
            explanation="Верно. Числовой ответ совпадает.",
            next_exercise="Переходи к следующему заданию или заверши тему.",
            mistake_category=None,
        )
    corrected = expected_answer or ""
    return TutorAssessment(
        is_correct=False,
        score=0,
        corrected_answer=corrected,
        explanation=(
            f"Проверь вычисление. Правильный ответ: {corrected}."
            if expected is not None else "Не удалось проверить эталонный ответ задачи."
        ),
        next_exercise="Пересчитай выражение по шагам и введи только число или дробь.",
        mistake_category="calculation",
    )
