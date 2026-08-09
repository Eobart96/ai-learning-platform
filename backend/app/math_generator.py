from fractions import Fraction
from random import SystemRandom


_random = SystemRandom()
_last_variant_by_lesson: dict[str, str] = {}


def _fraction_text(value: Fraction) -> str:
    return str(value.numerator) if value.denominator == 1 else f"{value.numerator}/{value.denominator}"


def _decimal_text(value: Fraction) -> str:
    """Format a terminating decimal with the comma accepted by the answer field."""
    denominator = value.denominator
    scale = 0
    while denominator % 2 == 0:
        denominator //= 2
        scale += 1
    while denominator % 5 == 0:
        denominator //= 5
        scale += 1
    if denominator != 1:
        return _fraction_text(value)

    digits = max(scale, 1)
    scaled = value.numerator * (10**digits) // value.denominator
    sign = "-" if scaled < 0 else ""
    whole, fraction = divmod(abs(scaled), 10**digits)
    return f"{sign}{whole},{fraction:0{digits}d}".rstrip("0").rstrip(",") + (",0" if fraction == 0 else "")


def _variant(lesson_slug: str, variants: tuple[str, ...]) -> str:
    """Avoid showing the same operation twice in a row for one topic."""
    previous = _last_variant_by_lesson.get(lesson_slug)
    choices = tuple(item for item in variants if item != previous) or variants
    selected = _random.choice(choices)
    _last_variant_by_lesson[lesson_slug] = selected
    return selected


def _decimal_from_hundredths(value: int) -> Fraction:
    return Fraction(value, 100)


def generate_numeric_exercise(lesson_slug: str) -> tuple[str, str]:
    """Create a fresh, exactly checkable task for every current math topic."""
    if lesson_slug == "order-of-operations":
        variant = _variant(lesson_slug, ("brackets", "negative", "division"))
        if variant == "brackets":
            a, b, c, d = (_random.randint(18, 55), _random.randint(2, 8), _random.randint(2, 9), _random.randint(1, 8))
            return f"Вычисли: {a} - {b} × ({c} + {d})", str(a - b * (c + d))
        if variant == "negative":
            a, b, c = _random.randint(4, 16), _random.randint(3, 12), _random.randint(2, 8)
            return f"Вычисли: -{a} + {b} × {c}", str(-a + b * c)
        divisor, quotient, delta = _random.randint(2, 9), _random.randint(3, 12), _random.randint(4, 20)
        return f"Вычисли: {divisor * quotient} ÷ {divisor} + {delta}", str(quotient + delta)

    if lesson_slug == "percentages":
        variant = _variant(lesson_slug, ("find", "increase", "decrease"))
        base = _random.choice((120, 160, 200, 240, 300, 400, 500))
        percent = _random.choice((5, 10, 15, 20, 25, 30, 40))
        if variant == "find":
            return f"Найди {percent}% от {base}.", str(base * percent // 100)
        if variant == "increase":
            return f"Увеличь {base} на {percent}%.", str(base * (100 + percent) // 100)
        return f"Уменьши {base} на {percent}%.", str(base * (100 - percent) // 100)

    if lesson_slug == "fraction-operations":
        first = Fraction(_random.randint(1, 7), _random.choice((2, 3, 4, 5, 6, 8)))
        second = Fraction(_random.randint(1, 7), _random.choice((2, 3, 4, 5, 6, 8)))
        variant = _variant(lesson_slug, ("add", "subtract", "multiply", "divide"))
        if variant == "add":
            return f"Вычисли: {_fraction_text(first)} + {_fraction_text(second)}", _fraction_text(first + second)
        if variant == "subtract":
            if first < second:
                first, second = second, first
            return f"Вычисли: {_fraction_text(first)} - {_fraction_text(second)}", _fraction_text(first - second)
        if variant == "multiply":
            return f"Вычисли: {_fraction_text(first)} × {_fraction_text(second)}", _fraction_text(first * second)
        return f"Вычисли: {_fraction_text(first)} ÷ {_fraction_text(second)}", _fraction_text(first / second)

    if lesson_slug == "decimals":
        variant = _variant(lesson_slug, ("add", "subtract", "multiply", "divide", "convert"))
        if variant == "add":
            first, second = _decimal_from_hundredths(_random.randint(125, 999)), _decimal_from_hundredths(_random.randint(75, 850))
            return f"Вычисли: {_decimal_text(first)} + {_decimal_text(second)}", _decimal_text(first + second)
        if variant == "subtract":
            second = _decimal_from_hundredths(_random.randint(75, 650))
            first = second + _decimal_from_hundredths(_random.randint(125, 900))
            return f"Вычисли: {_decimal_text(first)} - {_decimal_text(second)}", _decimal_text(first - second)
        if variant == "multiply":
            first = _decimal_from_hundredths(_random.randint(125, 975))
            multiplier = _random.randint(2, 9)
            return f"Вычисли: {_decimal_text(first)} × {multiplier}", _decimal_text(first * multiplier)
        if variant == "divide":
            divisor = _random.choice((2, 4, 5, 8, 10))
            result = _decimal_from_hundredths(_random.randint(125, 950))
            dividend = result * divisor
            return f"Вычисли: {_decimal_text(dividend)} ÷ {divisor}", _decimal_text(result)
        fraction = _random.choice((Fraction(3, 8), Fraction(7, 20), Fraction(9, 25), Fraction(13, 40), Fraction(17, 50)))
        return f"Запиши десятичной дробью: {_fraction_text(fraction)}", _decimal_text(fraction)

    if lesson_slug == "powers":
        variant = _variant(lesson_slug, ("multiply", "divide", "power"))
        base = _random.choice((2, 3, 4, 5))
        first_power, second_power = _random.randint(2, 5), _random.randint(2, 4)
        if variant == "multiply":
            return f"Вычисли: {base}^{first_power} × {base}^{second_power}", str(base ** (first_power + second_power))
        if variant == "divide":
            return f"Вычисли: {base}^{first_power + second_power} ÷ {base}^{second_power}", str(base**first_power)
        return f"Вычисли: ({base}^{first_power})^{second_power}", str(base ** (first_power * second_power))

    if lesson_slug == "square-roots":
        variant = _variant(lesson_slug, ("integer", "fraction", "decimal"))
        root = _random.randint(2, 20)
        if variant == "integer":
            return f"Вычисли: √{root * root}", str(root)
        if variant == "fraction":
            numerator, denominator = _random.randint(2, 9), _random.choice((2, 3, 4, 5))
            return f"Вычисли: √({numerator * numerator}/{denominator * denominator})", _fraction_text(Fraction(numerator, denominator))
        tenths = _random.randint(2, 9)
        radicand = Fraction(tenths * tenths, 100)
        return f"Вычисли: √{_decimal_text(radicand)}", _decimal_text(Fraction(tenths, 10))

    if lesson_slug == "one-step-equations":
        variant = _variant(lesson_slug, ("add", "multiply", "divide"))
        value = _random.randint(-15, 25)
        if variant == "add":
            delta = _random.randint(4, 30)
            return f"Реши уравнение: x + {delta} = {value + delta}. Введи значение x.", str(value)
        if variant == "multiply":
            coefficient = _random.randint(2, 9)
            return f"Реши уравнение: {coefficient}x = {coefficient * value}. Введи значение x.", str(value)
        divisor = _random.randint(2, 9)
        return f"Реши уравнение: x ÷ {divisor} = {value}. Введи значение x.", str(value * divisor)

    if lesson_slug == "two-step-equations":
        variant = _variant(lesson_slug, ("plus", "minus", "brackets"))
        coefficient, value, delta = _random.randint(2, 9), _random.randint(-10, 15), _random.randint(4, 20)
        if variant == "plus":
            return f"Реши уравнение: {coefficient}x + {delta} = {coefficient * value + delta}. Введи значение x.", str(value)
        if variant == "minus":
            return f"Реши уравнение: {coefficient}x - {delta} = {coefficient * value - delta}. Введи значение x.", str(value)
        return f"Реши уравнение: (x + {delta}) × {coefficient} = {(value + delta) * coefficient}. Введи значение x.", str(value)

    if lesson_slug == "linear-functions":
        slope = _random.choice((-4, -3, -2, 2, 3, 4))
        intercept = _random.randint(-8, 8)
        x_value = _random.randint(-5, 5)
        sign = "+" if intercept >= 0 else "-"
        return f"Для y = {slope}x {sign} {abs(intercept)} найди y при x = {x_value}.", str(slope * x_value + intercept)

    if lesson_slug == "quadratic-functions":
        x_value = _random.randint(-7, 7)
        offset = _random.randint(-8, 8)
        sign = "+" if offset >= 0 else "-"
        return f"Для y = x² {sign} {abs(offset)} найди y при x = {x_value}.", str(x_value * x_value + offset)
    raise ValueError(f"No generator for lesson {lesson_slug}")
