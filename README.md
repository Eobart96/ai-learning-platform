# SlovoKrok

GitHub: https://github.com/Eobart96/ai-learning-platform

Основные этапы развития: [история обновлений](UPDATES.md).

SlovoKrok — локальное однопользовательское приложение для самостоятельного изучения
словацкого языка уровня A1. Проект сочетает интерактивный курс, сохранение
прогресса в SQLite и AI-преподавателя через локальный Codex CLI либо
OpenAI-совместимый API.

## Что работает

- 8 модулей и 83 урока Slovak A1; все 14 тем Module 1 вручную проверены и
  одобрены владельцем вместе с материалами и тестами;
- подробные Modules 1–6 с теорией, пошаговой практикой, словарём, итоговыми
  проверками и контекстным чатом; Modules 2–6 последовательно раскрывают
  существительные, прилагательные, падежные модели, глагольную систему и 18
  бытовых сценариев A1; Modules 3–4 содержательно сверены с PDF владельца;
- общие упражнения, чтение, словарь, домашние задания и повторение ошибок
  работают с завершёнными уроками всего курса;
- сохранение состояния, сгенерированных материалов и попыток в SQLite;
- светлая/тёмная тема, размер текста и адаптивный интерфейс;
- экран «Настройки ИИ» для Codex CLI, OpenAI API и Polza API;
- единый безопасный Windows launcher.

Канонический адрес приложения — `http://127.0.0.1:3000/`. Маршруты `/new` и
`/module-1` оставлены только как совместимые перенаправления.

## Быстрый запуск на Windows

Требуются Python 3.12+ и Node.js 20+.

```text
install.cmd   # установить отсутствующие локальные зависимости
start.cmd     # запустить backend и frontend и открыть браузер
doctor.cmd    # проверить окружение без изменений
stop.cmd      # остановить только процессы, запущенные launcher-ом
```

Реальный `.env` необязателен для локального Codex CLI. Provider также можно
выбрать в интерфейсе: сохранённые API-ключи остаются только в ignored
`backend/data/ai_settings.json` и никогда не возвращаются браузеру.

## Структура

```text
backend/                 FastAPI, SQLite и AI-provider
frontend/                Next.js/React и содержание интерактивного курса
course-content/          versioned методика, roadmap и публичный профиль
scripts/windows/         launcher и repository audit
docs/                    актуальные технические документы
AGENTS.md                 стабильные правила работы AI-агента
PROJECT_CHECKPOINT.md     короткая текущая точка продолжения
.ai/                     вспомогательные записи, не обязательные для старта
```

Локальные зависимости, базы, сборки, кеши, резервные и recovery-файлы
исключены из Git. Папки `del/` и `_git-package/` также локальные и переносимые.

## Проверки

Backend из `backend/`:

```powershell
.venv\Scripts\python.exe -m pytest -q
.venv\Scripts\python.exe -m compileall -q app tests
```

Frontend из `frontend/`:

```powershell
npm.cmd run validate:a1
npm.cmd run test:ui
npm.cmd run build
```

Репозиторий из корня:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File scripts/windows/check-repository.ps1
git diff --check
```

Подробнее: [архитектура](docs/ARCHITECTURE.md), [API](docs/API.md),
[данные](docs/DATABASE.md), [тестирование](docs/TESTING.md),
[локальный запуск](docs/DEPLOYMENT.md) и [готовность к open source](docs/OPEN_SOURCE_READINESS.md).

## Работа с Codex

Новый агент начинает с `AGENTS.md` и `PROJECT_CHECKPOINT.md`. Остальные
roadmap, отчёты и документы открываются только для соответствующего типа
задачи; читать весь каталог `docs/` перед обычным изменением не требуется.

## Безопасность и границы

Это локальный MVP. В проект не входят регистрация, JWT, несколько
пользователей, платежи, PostgreSQL и production deployment. AI-ответы считаются
недоверенным вводом и проходят структурированную валидацию.

Текущий снимок не содержит credential, однако прежняя версия `.env.example` в
Git-истории содержала строку формата API-ключа. До подтверждённого отзыва этот
credential следует считать скомпрометированным; значение не копируется в
документацию или отчёты.

## Лицензия

[MIT](LICENSE). Compact runtime опубликован владельцем в GitHub 2026-08-26.
