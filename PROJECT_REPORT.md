# Project report

## Current summary — 2026-08-26

Compact Slovak A1 runtime опубликован в GitHub `origin/main` коммитом
`3214334`; GitHub CI прошёл, локальное рабочее дерево после push было чистым.
Приложение остаётся локальным однопользовательским MVP без auth/deployment.
Следующий приоритет — отзыв прежнего credential и контролируемое обновление
frontend-зависимостей после 6 high advisories.

## Checkpoint — публикация и AI-настройки, 2026-08-26

### Что изменилось

- compact runtime, очистка classic-кода и актуальная документация отправлены в
  `Eobart96/ai-learning-platform` ветку `main`;
- добавлен локальный экран выбора Codex CLI, OpenAI API или Polza API;
- backend сохраняет AI-настройки атомарно в ignored
  `backend/data/ai_settings.json` и возвращает только признаки наличия ключей;
- README, roadmap, testing/open-source docs и `.ai/` приведены к состоянию
  после публикации.

### Почему

Владелец запросил полностью очистить проект, подготовить его к Git, добавить
настройки AI-provider, опубликовать результат и завершить этап проверяемым
checkpoint для следующего продолжения.

### Проверка

| Команда или проверка | Результат |
|---|---|
| `backend/.venv/Scripts/python.exe -m pytest -q` | 11 passed, 1 deprecation warning |
| `python -m compileall -q app tests` | успешно |
| `python -m pip check` | broken requirements не найдены |
| `npm.cmd run validate:a1` | 8 модулей, 83 урока, TypeScript успешно |
| `npm.cmd run test:ui` | 12 passed |
| `platform.ps1 -Mode SelfTest` | launcher decision tests успешно |
| `check-repository.ps1` и `git diff --check` перед публикацией | успешно, current candidate без credential-like значений |
| GitHub Actions для `3214334` | успешно: backend tests/compileall, frontend validation/build |
| `npm.cmd audit --omit=dev --audit-level=high` | не пройден: 6 high advisories |

Production deployment и публичная доступность приложения не проверялись и не
заявляются; проект рассчитан только на loopback-запуск.

### Результаты аудита

- **high — открыт:** Git-история содержит прежнюю строку формата API-ключа в
  старой версии `.env.example`. Значение не читалось и не выводилось. Текущий
  snapshot чист, но отзыв credential владельцем не подтверждён.
- **high — открыт:** `npm audit` сообщает advisories для `nanoid`, `postcss`,
  `sharp` и `playwright` (6 high суммарно). Предложенный полный fix включает
  breaking-переход на Next.js 16, поэтому автоматически не применялся.
- **medium — ограничено архитектурой:** tutor settings и Codex login не имеют
  auth. Это соответствует локальному single-user scope только при сохранении
  binding на `127.0.0.1`; bridge нельзя выставлять в сеть.
- **low — открыт:** backend tests дают Starlette deprecation warning из-за
  текущей связки `TestClient/httpx`; функциональные тесты проходят.
- **info — подтверждено:** текущие `.env`, SQLite, AI settings, dependencies,
  build/cache/recovery paths игнорируются и не вошли в опубликованный снимок.

### Возможные улучшения

1. Сначала отозвать прежний credential — высокий эффект, малое усилие.
2. В отдельной ветке обновить Next.js/Playwright и transitive dependencies,
   затем повторить backend, UI, build и audit — высокий эффект, среднее усилие.
3. Добавить Playwright job в GitHub CI — средний эффект, малое/среднее усилие;
   сейчас UI suite подтверждён локально, но CI запускает только validation/build.
4. После security work провести ручной smoke с реальным provider и проверить
   Modules 2–8 относительно эталонного Module 1.

### Изменение roadmap

- завершены публикация `origin/main`, AI settings и повторная test matrix;
- dependency audit выполнен и превратился в отдельный remediation milestone;
- отзыв credential остаётся первым незакрытым security-действием;
- product-приоритет Modules 2–8 сохранён, но следует после security/smoke.

### Текущее состояние проекта

Confirmed: курс, локальное SQLite-состояние, AI settings, structured tutor
contract, launcher, тесты и GitHub CI работают в заявленной границе. Partial:
Modules 2–8 менее глубоки, чем Module 1. Blocked: нет. Intentionally deferred:
auth, multi-user, PostgreSQL, deployment и переписывание Git-истории.

### Следующий checkpoint

Начать с `frontend/package.json` и `frontend/package-lock.json`:

1. подобрать совместимый dependency update без слепого `audit fix --force`;
2. подтвердить отзыв прежнего credential без записи его значения;
3. выполнить реальный AI/UI smoke и обновить этот отчёт и `ROADMAP.md`.

---

## Историческая запись: итог очистки до публикации, 2026-08-26

Проект сведён к одному активному продукту: интерактивному Slovak A1. Classic
frontend, старые API-домены, прежние схемы/сервисы, исторические отчёты,
PostgreSQL Docker-конфигурация и дублирующие launcher-файлы перенесены в
`del/full-cleanup-2026-08-26/`. Перемещение восстановимо; пользовательские
SQLite-данные не удалялись.

Backend startup теперь только регистрирует активные `module1_beta_*` таблицы.
Старые таблицы в существующей SQLite-базе остаются нетронутыми, но больше не
создаются, не засеиваются и не обслуживаются текущим runtime.

Актуальная документация пересобрана вокруг фактических frontend, API,
хранилища, тестов и локального запуска. История разработки вынесена из
public-ready дерева.

## Подтверждено

- до переноса зависимостей: backend `9 passed, 1 warning`, Playwright
  `11 passed`, TypeScript/content validation, Next.js build и compileall;
- после сужения backend: Python `compileall` проходит;
- repository audit и launcher self-test запускаются без зависимостей;
- локальные секреты, SQLite, dependency/build/cache и recovery-пути исключены
  `.gitignore`.

После финального compact refactor сохранённые в `del/` зависимости были
подключены только на время проверки, без установки: backend — `9 passed,
1 warning`; content/TypeScript validation — успешно; Playwright — `11 passed`;
Next.js production build — успешно; Python compileall — успешно. Временная
junction и generated output после проверки убраны из active tree.

## Не было выполнено на момент этой записи

До финальной проверки commit, push, очистка `.git` и удаление пользовательской
базы не выполнялись. 26 августа владелец отдельно разрешил публикацию
проверенного compact runtime в существующий GitHub remote. `.git` остаётся крупным локальным
каталогом с recovery/temp-артефактами и требует отдельной резервной копии перед
любой обработкой.
