# Формат учебного курса

## Цель

Новые курсы должны добавляться без переписывания backend.

## Пример YAML

```yaml
course:
  slug: slovak-a1
  title: Slovak A1
  subject: language
  language: sk
  teaching_language: ru
  level: A1

modules:
  - slug: introductions
    title: Знакомство
    order: 1
    lessons:
      - slug: greetings
        title: Приветствия
        order: 1
        objectives:
          - поздороваться
          - представиться
        theory:
          - "Dobrý deň — Добрый день"
          - "Ahoj — Привет"
        exercises:
          - type: translation
            question: "Переведи: Добрый день"
            answer: "Dobrý deň"
          - type: dialogue
            instruction: "Поздоровайся и назови свое имя"
```

## Поддерживаемые типы упражнений

- translation;
- fill_blank;
- multiple_choice;
- free_text;
- dialogue;
- matching;
- ordering;
- listening;
- speaking;
- coding;
- numeric_answer.

## Специфика предметов

Языковые курсы:

- грамматика;
- словарь;
- диалоги;
- произношение.

Математика:

- точный числовой ответ;
- пошаговое решение;
- формулы;
- графики.

Программирование:

- код;
- тесты;
- анализ ошибок;
- ограничения по времени и памяти.
