# Project checkpoint — 2026-08-09

## Current state

`main` is clean and synchronized with `origin/main`. The recent stabilization, modular backend extraction, native frontend work, and open-source preparation are committed and pushed.

## What changed in this checkpoint

- Homework API was isolated into `backend/app/routers/homework.py` and `backend/app/schemas/homework.py`; legacy public handlers and local homework contracts were removed from `backend/app/main.py`.
- Dialogue contracts were moved to `backend/app/schemas/dialogue.py`.
- Pure dialogue parsing/command helpers were moved to `backend/app/services/dialogue.py`.
- The compatibility warning in `frontend/app/globals.css` was fixed by using `flex-start`.

## Why

Reduce `main.py` ownership without changing public API paths, JSON contracts, SQLite schema, or learning-flow behavior. Keep the codebase ready for incremental router extraction.

## Verification

| Command | Result | Scope |
| --- | --- | --- |
| `env -u PYTHONPATH ./.venv/Scripts/python.exe -m pytest -q -p no:cacheprovider --basetemp <Windows-safe path>` | `59 passed, 1 warning` | Full backend suite after homework cleanup and dialogue helper extraction |
| `env -u PYTHONPATH ./.venv/Scripts/python.exe -m compileall -q app` | passed | Backend import/syntax verification |
| `npx.cmd tsc --noEmit --incremental false` | passed | Previous native frontend verification |
| `npm.cmd run build` | passed | Previous production frontend verification; Autoprefixer warning removed in `aa75fc2` |
| `git diff --check` | passed | Before the relevant commits |
| Focused dialogue tests | `3 passed, 19 deselected, 1 warning` | Dialogue helper extraction |

The warning is the existing Starlette/httpx `TestClient` deprecation; it is not a failure and was not changed.

## Commits included since the prior broad checkpoint

- `17b97e7 refactor(backend): route homework through domain module`
- `032089a refactor(backend): remove legacy homework handlers`
- `4315e7d refactor(backend): extract dialogue contracts and helpers`
- `aa75fc2 fix(frontend): remove CSS compatibility warning`

## Findings

- **Medium / incomplete:** dialogue HTTP routes and database/session helpers remain in `backend/app/main.py`. Contracts and pure helpers are extracted, but `backend/app/routers/dialogue.py` is not yet implemented.
- **Low / known:** CI status on GitHub has not been externally verified because the unauthenticated Actions URL returned `404`; repository visibility/access remains unverified from this environment.
- **Low / known:** `SECURITY.md` still requires a real private disclosure channel before a public release. No contact was invented.

## Exact resume point

Start at `backend/app/main.py` dialogue routes around line 1000. Move the session CRUD and message route together with DB-specific helpers into `backend/app/routers/dialogue.py`, preserve test monkeypatch compatibility or update tests intentionally, then run the full backend suite, compileall, and `git diff --check` before a separate commit.
