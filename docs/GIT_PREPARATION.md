# Подготовка Git-коммитов

Статус: **план**, не staging-инструкция. Никакие файлы не добавлялись в индекс,
commit и push не выполнялись.

Рабочее дерево содержит исторические и новые изменения. Перед каждой группой
нужно повторно выполнить `git status --short`, `git diff --check` и просмотреть
конкретный diff. Не использовать `git add .`.

## Предлагаемые логические группы

### 1. Backend: модульный монолит и контракты

Содержимое: `backend/app/routers/`, `backend/app/schemas/`,
`backend/app/services/`, `backend/app/dependencies.py`,
`backend/app/exercise_identity.py`, `backend/app/math_generator.py`, связанные
изменения `main.py`, `tutor.py`, моделей и тестов.

Проверка: полный backend suite, `compileall`, API-контракты.

### 2. Контент и предметы

Содержимое: `course-content/math-exam-prep/`, изменения Slovak A1 YAML и
обезличенного публичного `student_profile.md`.

Проверка: загрузка курсов, roadmap и отсутствие личного профиля в diff.

### 3. Frontend: Next.js учебные экраны

Содержимое: `frontend/app/components/`, `frontend/app/lib/`, `page.tsx`,
`AppHeader.tsx`, `globals.css`, `next.config.ts`, `tsconfig.json`.

Проверка: TypeScript, production build, ручной UI smoke test.

### 4. Локальный запуск и legacy-совместимость

Содержимое: `install.cmd`, `start.cmd`, legacy assets только если они всё ещё
нужны как диагностический резервный путь.

Проверка: чистая установка на Windows без .env, базы и venv из текущей машины.

### 5. Документация, CI и открытость

Содержимое: README, CHANGELOG, `docs/`, `.github/`, `.gitignore`, LICENSE,
SECURITY, CONTRIBUTING, CODE_OF_CONDUCT и этот план.

Проверка: Markdown/YAML parsing, ссылки, соответствие реальным test/build
результатам, отсутствие секретов.

## Перед первым commit

1. Выбрать конкретную группу, а не все изменения сразу.
2. Просмотреть `git diff -- <список файлов>`.
3. Добавить только перечисленные файлы в staging.
4. Повторить `git diff --cached --check` и проверку секретов по именам файлов.
5. Запустить проверки, соответствующие группе.
6. Получить явное подтверждение владельца на `git commit`.

## Перед публикацией

Нужны отдельные подтверждения владельца на создание public release, push и
изменение GitHub-настроек. GitHub CLI на текущей машине не обнаружен; его
установка или аутентификация — отдельное действие.
