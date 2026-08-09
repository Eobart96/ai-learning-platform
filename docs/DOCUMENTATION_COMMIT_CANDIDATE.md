# Documentation commit candidate — 2026-08-09

Статус: **только подготовка**. Файлы не добавлялись в Git index, commit и push
не выполнялись.

## Цель

Сделать первый маленький, проверяемый документационный commit для подготовки
экспериментального vibe-coded проекта к open source.

## Предлагаемое сообщение

```text
docs: prepare project for open-source collaboration
```

## Кандидаты на inclusion

- `README.md`
- `CONTRIBUTING.md`
- `CODE_OF_CONDUCT.md`
- `CHANGELOG.md`
- `docs/OPEN_SOURCE_READINESS.md`
- `docs/GIT_PREPARATION.md`
- `docs/TESTING.md`
- `docs/API.md`
- `.github/ISSUE_TEMPLATE/bug_report.yml`
- `.github/ISSUE_TEMPLATE/feature_request.yml`
- `.github/ISSUE_TEMPLATE/config.yml`
- `.github/PULL_REQUEST_TEMPLATE.md`

## Исключено намеренно

- все backend/frontend/product changes;
- course content;
- `.ai/CURRENT_STATE.md` — файл требует отдельного безопасного обновления из-за
  текущей кодировки и не должен смешиваться с публичным documentation commit;
- любые локальные данные, `.env`, базы, backups и приватные профили.

## Перед staging

1. Повторно просмотреть только перечисленные файлы через `git diff --`.
2. Выполнить `git diff --check`.
3. Проверить YAML issue templates.
4. Получить отдельное разрешение владельца на `git add` и `git commit`.
