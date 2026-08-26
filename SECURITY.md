# Security Policy

## Не публикуется

- `.env`, API keys, tokens и credentials;
- `.ai/private/`, SQLite и учебные ответы пользователя;
- runtime logs, dependencies, builds, backups и recovery-файлы.

AI-output считается недоверенным и должен проходить Pydantic-валидацию.
Локальный Codex CLI bridge нельзя открывать в публичную сеть.

Критическую уязвимость не публикуйте в issue: сообщите владельцу проекта
приватно. При утечке credential сначала отзовите его у provider, затем
проверяйте историю Git, не копируя значение в отчёты.
