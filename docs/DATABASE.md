# База данных

Локальная база по умолчанию: `backend/data/app.db` (ignored).

Модели приложения называются `Course*`. Для совместимости с уже сохранённым
прогрессом они пока используют прежние физические имена таблиц:

- `module1_beta_state`;
- `module1_beta_exercises`, `module1_beta_exercise_attempts`;
- `module1_beta_readings`, `module1_beta_reading_attempts`;
- `module1_beta_vocabulary`;
- `module1_beta_homework`, `module1_beta_homework_attempts`.

Startup выполняет только SQLAlchemy `create_all`. Он не удаляет таблицы и не
мигрирует старые данные. Поэтому база, созданная прежней версией проекта, может
содержать дополнительные classic-таблицы; compact runtime их игнорирует.

Любое физическое удаление старых таблиц требует отдельной резервной копии,
явного согласия владельца и тестов на старой/новой базе. Alembic пока не
введён.
