# Развертывание

## Рекомендуемая схема MVP

- Frontend: Vercel
- Backend: Railway или Render
- Database: Supabase или Neon
- Repository: GitHub

## Переменные окружения

```text
DATABASE_URL=
OPENAI_API_KEY=
JWT_SECRET=
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60
FRONTEND_URL=
ENVIRONMENT=development
```

## Порядок развертывания

1. Создать облачную PostgreSQL.
2. Настроить backend.
3. Добавить переменные окружения.
4. Запустить миграции.
5. Проверить API.
6. Развернуть frontend.
7. Указать URL backend.
8. Проверить CORS.
9. Создать тестового пользователя.
10. Провести smoke test.

## Production checklist

- секреты не находятся в GitHub;
- DEBUG отключен;
- HTTPS включен;
- CORS ограничен;
- миграции выполнены;
- база резервируется;
- логирование включено;
- лимиты AI установлены.
