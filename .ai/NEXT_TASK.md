# Next Task

## Checkpoint 2026-08-12

Последнее завершённое изменение: контекстный AI-чат для словацких упражнений,
расширенная desktop-раскладка и подтверждаемая массовая отметка активных ошибок
как исправленных в рамках одного курса.

Проверено: полный backend-набор — `62 passed, 1 warning`; `compileall` и
TypeScript strict прошли. `npm.cmd run build` не завершился: Next.js вывел
только стартовую строку и оставался без результата более 90 секунд. Следующий
шаг перед новыми frontend-зависимыми изменениями: воспроизвести build без dev-
сервера, снять причину ожидания и лишь затем обновить `README.md` и
`docs/TESTING.md` как подтверждённый результат.

## Python course continuation plan — 2026-08-12

### Confirmed current state

- Separate Python subject is wired into the React shell. Course source is
  `course-content/python-course/course.yaml`; all four manuals are represented
  as 30 chapter-level lessons. All seven Part 1 theory chapters are expanded
  from the supplied manual; tasks 1.1–3.4 are converted from the task book.
- Browser code execution is being moved to local Pyodide assets under
  `frontend/public/pyodide/`, loaded by `frontend/app/workers/python.worker.ts`.
  It must never execute learner code in FastAPI. The old backend runner has
  been removed from the active app path.
- Python lessons expose browser test cases only for `subject == "python"`; the
  frontend runs every case in local Pyodide and stores drafts, passed exercise
  IDs and completed lesson IDs in `localStorage`. This is local progress only;
  it is not server progress.
- The Python roadmap is now browseable: upcoming topics are selectable for
  theory and practice. The original completion gating is intentionally deferred
  until browser-side task tests are implemented.
- A standalone final project exists at `F:\Laptop\Python Projects\guess-the-number`.
  It has `run.cmd`, `test.cmd`, `.venv`, Git initialization and two passing
  pytest tests when run with its project-local `--basetemp`.

### Exact next actions

1. Expand `course-content/python-course/course.yaml` theory for every chapter
   from the four supplied `python manual part N.pdf` files. Preserve chapter
   sequence, examples and explicit limitations of browser vs local projects;
   do not replace the source material with generic summaries.
2. Convert every task from `python tasks part 1.pdf` into a Python exercise with
   starter code, input fixture(s), expected behavior, a first hint and a
   separate optional explanation. Add browser-side test cases rather than exact
   source-code comparison; then repeat for parts 2–4 after part 1 is complete.
3. Add a browser-only progress model: 70% of part-1 tasks, at least one passed
   task per topic and the standalone `guess-the-number` project checklist open
   part 2. Do not accept a browser-reported completion as a security boundary.
4. Validate `npm.cmd run build` after the Pyodide worker change and manually
   open the Python screen: switch lessons, run a `print`, a two-input program,
   syntax error, and saved draft reload.

### План задач Python-модуля

1. **Закрыть Part 1 по первоисточникам.** Перенести задания 4.1–4.4,
   5.1–5.4, 6.1–6.3 и 7.1–7.3 из `python tasks part 1.pdf`; у каждого
   задания должны быть стартовый код, сценарий(и) Pyodide, первая подсказка и
   отдельный необязательный разбор.
2. **Доделать локальный прогресс Part 1.** Показывать прогресс по задачам,
   требовать не меньше 70% всех задач и по одной пройденной задаче в каждой из
   семи тем. Добавить локальный чек-лист проекта `guess-the-number`.
3. **Открывать Part 2 по этим условиям.** Разблокировка работает только как
   учебная навигация в `localStorage`; она не является серверной проверкой,
   авторизацией или подтверждением навыка.
4. **Перенести Part 2.** По очереди расширить главы 8–14 из `python manual
   part 2.pdf`, затем перенести все задания из `python tasks part 2.pdf` в
   тот же формат браузерных тестов. Файлы и ООП, требующие полноценной среды,
   сопровождаются явной границей «локальный проект».
5. **Перенести Part 3.** Аналогично обработать главы 15–22 и задания из Part
   3. API, БД, параллельность и тестирование не выполняются как внешние или
   долгие операции в браузере: в Pyodide остаются безопасные учебные фрагменты.
6. **Перенести Part 4 и проекты.** Обработать главы 23–30 и задания из Part
   4; для Flask, Pandas, Matplotlib, Telegram, GUI и публикации создавать
   понятные локальные чек-листы и проекты в `F:\Laptop\Python Projects`.
7. **Финальная приемка.** После каждого блока запускать backend-тесты и
   TypeScript strict; после изменений worker, конфигурации или зависимостей
   отдельно подтверждать `npm.cmd run build` и вручную проверять экран Python.

### Progress on 2026-08-12

- Sources were confirmed in `Python/`. The first batch is complete: the
  expanded Chapter 1 theory and tasks 1.1–1.4 are in `course.yaml`.
- Python exercises now expose browser test cases, a first hint and an optional
  explanation. The UI executes every test case in Pyodide and does not send
  learner code to FastAPI.
- Python lesson completion is local to the browser and no longer calls the
  server endpoint that requires an AI-checked answer. The final 70% and
  per-topic gating rules are still pending.
- All seven Part 1 theory chapters are expanded, and tasks 1.1–3.4 from the
  Part 1 task book are converted with browser scenarios. Next small batch:
  convert tasks 4.1–4.4, then 5.1–5.4. Keep Part 2 unlocked until the
  specified browser-only progress rules can be implemented for all Part 1
  tasks.

### Known risks / do not misreport

- Pyodide assets are large and must stay locally served; do not add a CDN
  fallback without user approval.
- Browser execution is suitable for learning snippets, not unrestricted or
  long-running code. Files, network, Flask, Telegram, GUI and third-party
  projects belong in `F:\Laptop\Python Projects`.
- `npm.cmd run build` was started after changing the worker and no final
  successful build summary has been captured yet. TypeScript strict checking
  did pass before the latest theory-only edits.
- Do not commit, push or publish either repository without separate approval.

## Чекпоинт 2026-08-09

Production build Next.js и полный backend-набор подтверждены после пересоздания
локального `backend/.venv` на Python 3.12.10. Для запуска backend-команд из
Hermes нужно очищать унаследованный `PYTHONPATH`, иначе импорты попадают в
окружение Hermes, а не в проектный venv.

## Сегодня завершено

Продолжен этап подготовки к open source и гибкому модульному монолиту:
маршруты `tutor`, `courses` и основные маршруты `practice` вынесены из
`main.py`, а orchestration проверки ответа вынесен в `services/lesson_answers`;
общие SQLite-операции ошибок и словаря вынесены в `services/learning_state`;
все маршруты урока находятся в `practice-router`, ошибки — в
`progress-router`, включая чтение, отработку и исправление, а общий словарь —
в `vocabulary-router`, включая сохранение и интервальное повторение; внешний
API не менялся.

Также вынесен read-only diary-домен: контракты находятся в
`schemas/diary.py`, формирование ответа — в `services/diary.py`, а маршруты
`GET /api/v1/diary/today`, `GET /api/v1/diary/entries` и
`GET /api/v1/diary/weekly-summary`, а также
`POST /api/v1/diary/entries` — в `routers/diary.py`.

В разделе «Упражнения» добавлен AI-генератор одного задания по выбранной
словацкой теме; сгенерированные задания проверяются обычным путём и остаются
в отдельном списке `generated_exercises` после перезагрузки. В разделе «Ошибки» добавлен отдельный
изолированный чат по выбранной ошибке без создания `DialogueSession` и без
изменения учебного прогресса. Полный backend-набор после изменений:
`59 passed, 1 warning`.

## Следующая задача

Выбрать следующий самостоятельный домен для такого же малого переноса;
предпочтительный кандидат — `homework`.

## Нужно реализовать

1. Зафиксировать характеристическими тестами read-only и error-контракты
   выбранного следующего домена.
2. Вынести его малыми шагами без изменения SQL-запросов, схемы SQLite,
   транзакций, URL или JSON.
4. После каждого маленького переноса запускать полный backend-набор; Docker
   сверить отдельным этапом с фактическим SQLite MVP.

## Ограничения

- не добавлять регистрацию, JWT или PostgreSQL;
- не менять порядок тем roadmap;
- не удалять `frontend/public/legacy` без отдельного подтверждения;
- повторно подтверждать production-сборку после изменений frontend-конфигурации
  или зависимостей.
- не подключать математический модуль к словацкому дневнику, словарю или
  AI-чату без отдельной предметной модели.
- не смешивать накопленные сгенерированные задачи с исходными упражнениями темы;
  они должны оставаться доступны отдельным личным списком после перезагрузки.
- не делать commit, push, публикацию релиза или изменение лицензии без
  отдельного подтверждения владельца.
- не переносить несколько несвязанных доменов в одном шаге и не менять
  существующие URL или JSON-контракты во время рефакторинга.

## Критерии готовности

- точные математические ответы проходят без обращения к AI-провайдеру;
- кнопка «Новое задание» создаёт проверяемый вариант для каждой текущей темы;
- публичный пример профиля не содержит персональных данных, а локальный
  профиль не отслеживается Git;
- CI-команды совпадают с подтверждёнными локальными проверками;
- `npm.cmd run build` проходит без работающего frontend dev-сервера.
- все 59 backend-тестов проходят после переноса router'ов `tutor`, `courses`,
  `practice`, `progress` и `vocabulary`, а также после выделения сервисов
  `lesson_answers`, `learning_state`, `answer_checking` и `vocabulary`.
