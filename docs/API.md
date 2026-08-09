# API

Актуализировано: 2026-08-09. Базовый префикс — `/api/v1`.
Полная интерактивная схема доступна на `http://127.0.0.1:8000/docs`.

## Служебные маршруты

- `GET /health` — состояние backend;
- `GET /api/v1/codex/status` — доступность и авторизация Codex CLI;
- `POST /api/v1/codex/login` — запуск официального входа Codex;
- `POST /api/v1/tutor/message` — одиночная структурированная проверка AI.

## Курс и уроки

- `GET /api/v1/courses` — список курсов;
- `GET /api/v1/lessons/{lesson_id}` — теория, исходные `exercises`, отдельные `generated_exercises` и последние ответы;
- `POST /api/v1/lessons/{lesson_id}/generated-exercises` — создать и сохранить дополнительное задание для выбранной темы;
- `GET /api/v1/lessons/{lesson_id}/vocabulary` — слова урока;
- `POST /api/v1/lessons/{lesson_id}/answer` — проверка и сохранение ответа;
- `POST /api/v1/lessons/{lesson_id}/complete` — завершение урока;
- `GET /api/v1/roadmap` — roadmap A1 по модулям;
- `GET /api/v1/roadmap/levels` — секции A1, A2, B1 и B2.

Пример ответа на упражнение:

```json
{
  "exercise_id": 10,
  "answer": "Mám päť jablk."
}
```

## Модульные тесты

- `GET /api/v1/modules/{module_id}/final-test` — тест и история попыток;
- `POST /api/v1/modules/{module_id}/final-test/submit` — проверка теста;
- проходной балл — 70/100, ошибки вопросов сохраняются в общем журнале.

## Прогресс и ошибки

- `GET /api/v1/progress` — завершённые темы, ответы, активные и исправленные ошибки;
- `POST /api/v1/progress/reset` — подтверждаемый сброс локального прогресса;
- `GET /api/v1/progress/mistakes?course_slug=slovak-a1` — только активные ошибки указанного курса;
- `GET /api/v1/progress/mistakes/next?course_slug=slovak-a1` — следующая ошибка указанного курса для повторения;
- `POST /api/v1/progress/mistakes/{mistake_id}/practice?course_slug=slovak-a1` — учёт отработки только в указанном курсе;
- `POST /api/v1/progress/mistakes/{mistake_id}/chat?course_slug=slovak-a1` — изолированный AI-разбор выбранной ошибки; принимает `message` и не меняет учебный прогресс;
- `POST /api/v1/progress/mistakes/{mistake_id}/resolve?course_slug=slovak-a1` — подтверждение исправления только в указанном курсе.

Ошибки и действия над ошибками изолированы по `course_slug`: данные
`slovak-a1` и `math-exam-prep` не смешиваются и не доступны друг через друга.

## Диалоги

- `POST /api/v1/dialogue/sessions` — новая сессия; принимает `title` и `lesson_id`;
- `GET /api/v1/dialogue/sessions` — список сессий;
- `GET /api/v1/dialogue/sessions/{session_id}` — история сессии;
- `POST /api/v1/dialogue/sessions/{session_id}/messages` — сообщение преподавателю;
- `POST /api/v1/dialogue/sessions/{session_id}/select-lesson` — выбор темы;
- `POST /api/v1/dialogue/sessions/{session_id}/clear` — очистка сообщений;
- `DELETE /api/v1/dialogue/sessions/{session_id}` — удаление диалога.

## Словарь, дневник и домашние задания

- `GET /api/v1/progress/vocabulary` — каталог слов;
- `GET /api/v1/progress/vocabulary/next` и `/due` — карточки повторения;
- `POST /api/v1/progress/vocabulary/{item_id}/save` — сохранить слово;
- `POST /api/v1/progress/vocabulary/{item_id}/review` — сохранить повторение;
- `GET /api/v1/diary/today` — вопрос дня;
- `POST /api/v1/diary/entries` — проверить и сохранить запись;
- `GET /api/v1/diary/entries` — история;
- `GET /api/v1/diary/weekly-summary` — недельная сводка;
- `POST /api/v1/homework/generate` — создать домашнее задание;
- `GET /api/v1/homework` — список заданий;
- `POST /api/v1/homework/{homework_id}/submit` — проверка ответа.

Авторизация, JWT и многопользовательские маршруты в локальном MVP отсутствуют.
