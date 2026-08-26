# Open-source readiness

## Готово

- один активный продукт и компактная runtime-граница;
- MIT License, Code of Conduct, contributing/security policies и issue/PR
  templates;
- `.env.example` содержит только placeholders;
- secret/generated/database/recovery audit автоматизирован;
- актуальные README, architecture, API, database, testing и setup docs;
- проверяемое compact-дерево как канонический Git-кандидат.

## Перед первым commit

1. Вернуть/установить зависимости и повторить весь test matrix.
2. Просмотреть итоговый `git status` и Git-кандидат.
3. Отозвать прежний provider credential.
4. Решить, сохранять ли существующую Git-историю или создать новую — только
   после резервной копии `.git`.
5. Разрешение владельца на commit и push получено 2026-08-26.

## Не входит в текущую готовность

Production deployment, публичный Codex bridge, auth/multi-user и миграция
SQLite не подготовлены и не должны подразумеваться документацией.
