# Project report

## Итог очистки 2026-08-26

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

## Не выполнено

До финальной проверки commit, push, очистка `.git` и удаление пользовательской
базы не выполнялись. 26 августа владелец отдельно разрешил публикацию
проверенного compact runtime в существующий GitHub remote. `.git` остаётся крупным локальным
каталогом с recovery/temp-артефактами и требует отдельной резервной копии перед
любой обработкой.
