# API

Base URL локально: `http://127.0.0.1:8000`. Интерактивная схема доступна в
`/docs` и `/openapi.json`.

## System

- `GET /health` — `{ "status": "ok" }`.

## Tutor

- `POST /api/v1/tutor/module1-chat` — один структурированный шаг чата.
- `GET /api/v1/tutor/settings` — выбранный provider, модели, статус Codex и
  только признаки наличия API-ключей;
- `PUT /api/v1/tutor/settings` — выбрать `codex|openai|polza`, сохранить модель
  и при необходимости новый ключ;
- `POST /api/v1/tutor/codex-login` — открыть локальное окно авторизации Codex.

Сохранённые ключи никогда не входят в response schema. Пустое поле ключа при
обновлении сохраняет прежнее значение; удаление требует отдельного флага.

## Module 1 state

- `GET /api/v1/module1-beta/state`
- `PUT /api/v1/module1-beta/state`

## Exercises

- `GET|POST /api/v1/module1-beta/exercises`
- `POST /api/v1/module1-beta/exercises/{id}/answer`
- `DELETE /api/v1/module1-beta/exercises/{id}`

## Reading

- `GET|POST /api/v1/module1-beta/readings`
- `POST /api/v1/module1-beta/readings/{id}/check`
- `DELETE /api/v1/module1-beta/readings/{id}`

## Vocabulary

- `PUT /api/v1/module1-beta/vocabulary/sync`
- `GET /api/v1/module1-beta/vocabulary`
- `POST /api/v1/module1-beta/vocabulary/{id}/review`

## Homework

- `GET|POST /api/v1/module1-beta/homework`
- `POST /api/v1/module1-beta/homework/{id}/submit`
- `DELETE /api/v1/module1-beta/homework/{id}`

Точные поля и ограничения определены Pydantic-схемами в
`backend/app/schemas/` и типами `frontend/app/lib/api.ts`. Старые courses,
progress, diary, dialogue, module-test и vocabulary API не существуют и должны
возвращать `404`.
