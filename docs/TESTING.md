# Тестирование

## Backend

Из `backend/`:

```powershell
.venv\Scripts\python.exe -m pytest -q
.venv\Scripts\python.exe -m compileall -q app tests
```

Активный набор проверяет route boundary, state round-trip, сохранность
прогресса после startup, tutor contract и lifecycle упражнений, чтения,
словаря и домашних заданий.

## Frontend

Из `frontend/`:

```powershell
npm.cmd run validate:a1
npm.cmd run test:ui
npm.cmd run build
```

`validate:a1` проверяет content invariants и TypeScript. UI-тесты подменяют
backend/provider и не меняют реальную SQLite.

## Repository

Из корня:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File scripts/windows/platform.ps1 -Mode SelfTest
powershell.exe -NoProfile -ExecutionPolicy Bypass -File scripts/windows/check-repository.ps1
git diff --check
git status --short
```

Последний полный набор после добавления AI-настроек: backend
`11 passed, 1 warning`, Playwright `12 passed`, validation/TypeScript —
успешно. Next.js production build и Python compileall также прошли.
