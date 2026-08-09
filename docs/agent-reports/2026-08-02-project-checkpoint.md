# Project checkpoint: 2026-08-02

## Current state

Today’s stage is complete: the local MVP has a separate mathematics course,
native React learning screens, a modularized FastAPI vocabulary domain, and API
regression coverage for that domain. No commit, push, release, dependency
upgrade, database migration, or deployment was performed.

## What changed and why

- The backend was split further into `tutor`, `courses`, `practice`, `progress`,
  and `vocabulary` routers, with shared schemas and services, while preserving
  the existing HTTP API.
- Mathematics and Slovak are separated in the interface and course data;
  mathematics uses local numeric checking and generated practice.
- Vocabulary routes gained regression tests for the next-item response and
  missing-item `404` behaviour.
- README, roadmap, architecture, testing documentation, current state, and
  changelog were synchronized with verified results and known limits.

## Verification

| Check | Result | Limitation |
| --- | --- | --- |
| `backend/.venv/Scripts/python.exe -m pytest backend/tests -q` | 47 passed | One upstream Starlette/httpx deprecation warning. |
| `npx.cmd tsc --noEmit --incremental false` | Passed | No output, exit status was successful before build started. |
| `backend/.venv/Scripts/python.exe -m compileall -q backend/app` | Not completed | Could not write a temporary `.pyc` for `main.py` because `__pycache__` was locked. Runtime tests imported the module successfully. |
| `npm.cmd run build` | Not verified | Two attempts timed out after 120 s and 240 s; no compile error was printed. Build-created Node processes were stopped after the timeout. |
| `git diff --check` | Passed | Only CRLF conversion warnings were printed. |
| Ignore rules | Confirmed | `.env`, `.ai/private/`, `_backups/`, and `head_main.py` are ignored by `.gitignore`. |

## Audit findings

- **High — none confirmed.** No credentials were printed or added by this checkpoint; the real `.env` was not opened.
- **Medium — open:** `docker-compose.yml` describes PostgreSQL, while the MVP
  uses local SQLite. The Docker path has not been verified and should not be
  presented as a working local-MVP deployment.
- **Low — open:** Next.js production build did not finish in 240 seconds. The
  cause is unknown; investigate Node/Next build diagnostics before relying on
  the local production build result.
- **Low — open:** Python bytecode compilation is blocked by a locked cache file.
  This did not affect imports or the 47 passing tests, but the local process
  holding `backend/app/__pycache__` should be identified if it recurs.
- **Info:** The repository is intentionally dirty and contains the full local
  implementation stage. Unrelated changes were preserved; nothing was reset or
  committed.

## Recommended next checkpoint

Start with [frontend/package.json](../../frontend/package.json) and diagnose
`npm.cmd run build` without leaving background Node processes. Then open
[backend/app/main.py](../../backend/app/main.py) and choose one domain — diary
or homework — for the next small router/service extraction.
