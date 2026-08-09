# Stabilization and Modularization Implementation Plan

> **For Hermes:** Use subagent-driven-development skill to implement this plan task-by-task.

**Goal:** Make the local MVP reproducible, restore backend verification, then reduce `backend/app/main.py` by extracting the diary domain without changing public contracts.

**Architecture:** Keep the existing FastAPI modular monolith and SQLite MVP. The immediate work is deliberately additive and contract-preserving: repair the local Python environment, establish a verified baseline, then move Pydantic contracts and diary endpoints into dedicated modules while retaining the same URLs, JSON responses, SQL semantics, and transaction boundaries.

**Tech Stack:** Python 3.12, FastAPI, SQLAlchemy 2, Pydantic, SQLite, pytest, Next.js, React, TypeScript.

---

## Current context and assumptions

- The working tree already contains substantial uncommitted work. Do not reset, rebase, commit, or overwrite unrelated changes.
- A verified pre-work archive was created at `_backups/ai-learning-platform-pre-stabilization-20260808-230623.tar.gz`.
  - SHA-256: `ac356c995fa2103ae7b959b247f9c78e473ee80115019178e387f85df06bc347`
  - Verification: `tar -tzf` succeeded; excluded secret/local paths count was zero.
  - Excluded intentionally: `.git`, `.env*`, `.ai/private`, SQLite data, virtual environments, Node dependencies/build outputs, caches, logs.
- Frontend TypeScript and production build passed on 2026-08-08.
- Backend tests cannot currently start because the local `backend/.venv` has a broken `pydantic_core` native import under Python 3.13. Project documentation and CI target Python 3.12.
- The current host exposes system Python 3.11.13 only; neither `py` nor a Python 3.12 executable is available through PATH. Installing or selecting a compatible Python 3.12 interpreter is therefore the prerequisite for Task 1.
- The production build diagnostic in `.ai/NEXT_TASK.md` is therefore stale and must be corrected only after the backend baseline is verified.

## Decision record

1. **Stabilize the environment before code refactoring.** Tests are the safety net for an in-progress router/service extraction; without them a behaviour-preserving refactor cannot be demonstrated.
2. **Use Python 3.12 for the backend virtual environment.** It matches CI and project documentation, reducing machine-versus-CI drift.
3. **Extract diary before homework.** Diary is a cohesive domain with stable models and endpoints, and its read-only routes can be migrated first with a small blast radius.
4. **Preserve API and SQLite contracts in this phase.** No URL, response JSON, SQL semantics, schema, or transaction-boundary changes are allowed while modularizing.
5. **Record every completed step in Markdown.** Update the execution log and the existing project state/task documents when a verified checkpoint changes their contents.

## Task 1: Restore a reproducible backend environment

**Objective:** Recreate `backend/.venv` using Python 3.12 and project-pinned requirements, without touching source code or local data.

**Files:**
- Modify/generated: `backend/.venv/` (ignored)
- Update after verification: `docs/agent-reports/2026-08-08-stabilization-log.md`

**Steps:**
1. Confirm a Python 3.12 interpreter is available.
2. Preserve the existing broken virtual environment by renaming or archiving it locally only if needed for diagnosis.
3. Recreate `backend/.venv` with Python 3.12.
4. Install only `backend/requirements.txt`.
5. Verify interpreter path/version and imports of FastAPI, Pydantic, and `pydantic_core`.

**Validation:**
- `backend/.venv/Scripts/python.exe --version` reports Python 3.12.x.
- `backend/.venv/Scripts/python.exe -c "import fastapi, pydantic, pydantic_core"` exits 0.

## Task 2: Establish the backend verification baseline

**Objective:** Demonstrate that the existing refactor state remains valid before moving another domain.

**Files:**
- Update: `docs/agent-reports/2026-08-08-stabilization-log.md`
- Update when confirmed: `.ai/CURRENT_STATE.md`, `.ai/NEXT_TASK.md`, `docs/TESTING.md`

**Steps:**
1. Run `backend/.venv/Scripts/python.exe -m pytest -q`.
2. Run `backend/.venv/Scripts/python.exe -m compileall -q app`.
3. Run `git diff --check`.
4. Record exact commands and results.

**Validation:**
- Full backend suite passes.
- Python compilation passes.
- Whitespace validation passes.

## Task 3: Characterize diary read-only API behaviour

**Objective:** Add focused regression coverage before moving diary routes.

**Files:**
- Modify: `backend/tests/test_api.py`
- Inspect: `backend/app/main.py`, `backend/app/models.py`, `backend/app/tutor.py`

**Steps:**
1. Identify the existing diary endpoint tests and response contracts.
2. Add only missing tests for today prompt, entries history, and weekly summary.
3. Run the focused tests and confirm they fail only if a real missing expectation is exposed.
4. Keep existing response fields and ordering stable.

**Validation:**
- Focused diary tests pass before any route relocation.

## Task 4: Extract diary schemas and read-only router

**Objective:** Move diary response models and GET endpoints out of `main.py` with identical behaviour.

**Files:**
- Create: `backend/app/schemas/diary.py`
- Create: `backend/app/routers/diary.py`
- Modify: `backend/app/main.py`
- Modify: `backend/tests/test_api.py`

**Steps:**
1. Move diary Pydantic response models to `schemas/diary.py`.
2. Move `GET /api/v1/diary/today`, `GET /api/v1/diary/entries`, and `GET /api/v1/diary/weekly-summary` into `routers/diary.py`.
3. Inject the router from `main.py`; remove only moved symbols/imports.
4. Do not change SQL queries, response models, defaults, endpoint URLs, or ordering.
5. Run focused tests, then the full backend suite and compile check.

**Validation:**
- Existing frontend calls in `frontend/app/lib/api.ts` continue to use unchanged paths.
- Diary endpoint tests and full backend suite pass.

## Task 5: Extract diary write endpoint only after read-only verification

**Objective:** Move `POST /api/v1/diary/entries` once read-only extraction is verified.

**Files:**
- Modify: `backend/app/routers/diary.py`
- Modify if required: `backend/app/schemas/diary.py`
- Modify: `backend/app/main.py`
- Modify: `backend/tests/test_api.py`

**Steps:**
1. Add/confirm tests for successful submission, AI validation failure, mistake recording, and vocabulary extraction.
2. Move the request model and write endpoint without changing service calls or commits.
3. Run focused and full checks.
4. Document the checkpoint.

**Validation:**
- JSON response, error statuses, stored diary data, linked mistakes, and vocabulary side effects are unchanged.

## Task 6: Update documentation at verified checkpoints

**Objective:** Keep project state documentation aligned with executed, verified reality.

**Files:**
- Modify: `docs/agent-reports/2026-08-08-stabilization-log.md`
- Modify when applicable: `.ai/CURRENT_STATE.md`, `.ai/NEXT_TASK.md`, `docs/TESTING.md`, `docs/ARCHITECTURE.md`, `docs/API.md`

**Steps:**
1. Record completed work, rationale, commands, exact outputs, failures, and limitations in the execution log.
2. Update project state/task docs only when the corresponding claim is verified.
3. Do not mark a task complete based on a planned but unexecuted check.

## Risks and controls

| Risk | Control |
|---|---|
| Existing uncommitted work is overwritten | No reset/rebase/commit; narrow patches only; archive created first. |
| Environment recreation alters local runtime | Work is limited to ignored `backend/.venv`; source and SQLite data remain untouched. |
| Router extraction changes client behaviour | Preserve URL/JSON contracts and add endpoint characterization tests before relocation. |
| AI-dependent tests become flaky | Continue using the offline test provider in `backend/tests/conftest.py`. |
| Documentation becomes aspirational | Record only executed commands and actual results. |

## Out of scope

Authentication, JWT, PostgreSQL, Dockerization, production deployment, mobile clients, broad UI redesign, course expansion, and deletion of legacy frontend assets.
