# Contributing

Проект экспериментальный: AI может помогать с реализацией, но изменение должно
быть прочитано человеком и подтверждено тестами.

## Правила

- одна связная задача на branch/PR;
- не добавлять секреты, SQLite, личный профиль, зависимости и generated output;
- сохранять стабильные course slug/activity ID и API contracts;
- для cross-layer изменения синхронно обновлять Pydantic, TypeScript client,
  UI states, тесты и `docs/API.md`;
- не добавлять auth, multi-user или deployment как побочный scope.

## Перед PR

1. Выполнить релевантный набор из `docs/TESTING.md`.
2. Запустить repository audit и `git diff --check`.
3. Проверить итоговый diff и отсутствие локальных данных.
4. Для UI приложить скриншот либо описать ручной сценарий.
