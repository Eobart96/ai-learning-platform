# Отчет о реализации backend-прототипа

Дата: 2026-07-21

## Цель

Создать минимальную основу backend для локального MVP без регистрации, JWT,
PostgreSQL, frontend и вызовов OpenAI.

## Что реализовано

### Приложение

- FastAPI-приложение в backend/app/main.py;
- GET /health для проверки доступности процесса;
- GET /api/v1/courses для проверки загруженных курсов;
- startup-инициализация базы и импорт YAML-курса.

### Конфигурация

backend/app/config.py использует pydantic-settings. Поддерживаются:

- DATABASE_URL;
- COURSE_PATH;
- .env в корне запуска.

По умолчанию создается SQLite-файл backend/data/app.db.

### База данных

backend/app/database.py создает SQLAlchemy engine и сессию. При SQLite
каталог базы создается автоматически.

В backend/app/models.py добавлены модели:

- Course;
- Module;
- Lesson;
- Exercise;
- LessonAttempt;
- UserAnswer;
- Mistake.

Связь контента курса: Course -> Module -> Lesson -> Exercise.
Пользовательские сущности пока не связаны с User, потому что локальный MVP
работает без регистрации.

### Загрузка курса

backend/app/course_loader.py читает YAML с UTF-8, создает курс, модули,
уроки и упражнения. Импорт идемпотентный: повторный startup не создает курс
с тем же slug повторно.

## Поток запуска

1. Импортируется конфигурация.
2. Создается каталог SQLite-базы.
3. FastAPI startup создает таблицы через Base.metadata.create_all.
4. YAML-курс загружается в SQLite.
5. API начинает отдавать health-check и список курсов.

## Проверки

Запущены команды:

    python -m pip install -r requirements.txt
    python -m pytest -q
    python -m compileall -q app

Результат:

- 2 passed;
- синтаксис backend/app проверен;
- startup через FastAPI TestClient проверен;
- /health возвращает {"status": "ok"};
- /api/v1/courses возвращает slovak-a1.

Во время проверки была найдена и исправлена ошибка: SQLite не мог открыть
файл, если backend/data еще не существовал. Теперь каталог создается до
создания engine.

## Известные ограничения

- схема создается через create_all, Alembic будет добавлен позже;
- доступен только список курсов, чтение уроков еще не добавлено;
- ответы пользователя не принимаются и не проверяются;
- AI-клиент и OpenAI API не подключены;
- нет регистрации, JWT и многопользовательского режима;
- production-настройки не реализованы.

## Следующая задача

Добавить API чтения курса и урока:

- GET /api/v1/courses/{course_slug};
- GET /api/v1/lessons/{lesson_id};
- стабильные JSON-ответы с теорией и упражнениями;
- корректные ответы 404;
- API-тесты.
