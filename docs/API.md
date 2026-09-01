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

## Course state

- `GET /api/v1/course/state`
- `PUT /api/v1/course/state`

## Exercises

- `GET|POST /api/v1/course/exercises`
- `POST /api/v1/course/exercises/{id}/answer`
- `DELETE /api/v1/course/exercises/{id}`

## Reading

- `GET|POST /api/v1/course/readings`
- `POST /api/v1/course/readings/{id}/check`
- `DELETE /api/v1/course/readings/{id}`

## Vocabulary

- `PUT /api/v1/course/vocabulary/sync`
- `GET /api/v1/course/vocabulary`
- `POST /api/v1/course/vocabulary/{id}/review`

## Homework

- `GET|POST /api/v1/course/homework`
- `POST /api/v1/course/homework/{id}/submit`
- `DELETE /api/v1/course/homework/{id}`

Точные поля и ограничения определены Pydantic-схемами в
`backend/app/schemas/` и типами `frontend/app/lib/api.ts`. Старые courses,
progress, diary, dialogue, module-test и vocabulary API не существуют и должны
возвращать `404`.
