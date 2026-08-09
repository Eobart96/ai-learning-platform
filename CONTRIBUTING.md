# Contributing

AI Learning Platform — экспериментальный **vibe-coded** проект. AI-инструменты
ускоряют разработку, но не заменяют review, тесты и ответственность автора
изменения.

## Ветки

```text
main
develop
feature/<name>
fix/<name>
docs/<name>
```

## Коммиты

Примеры:

```text
feat: add user registration
fix: validate AI response
docs: update database schema
test: add lesson API tests
refactor: split progress service
```

## Pull Request

PR должен содержать:

- описание изменения;
- причину изменения;
- способ проверки;
- скриншоты для UI;
- связанные issue.

## Правила

- не коммитить секреты;
- не добавлять SQLite-базу, `.env`, backup-артефакты или личные учебные данные;
- писать понятные имена;
- добавлять тесты;
- обновлять документацию;
- не смешивать несколько больших задач в одном PR.

## Перед pull request

1. Выполни релевантные backend и frontend проверки из `docs/TESTING.md`.
2. Проверь `git diff --check`.
3. Для UI-изменений приложи скриншот или кратко опиши ручную проверку.
4. Не используй `git add .` в рабочем дереве с несвязанными изменениями.
