# Work report: practice answer router

- Date: 2026-08-02
- Status: completed

## Confirmed context

The lesson endpoint uses the existing tutor dependency override, the lesson
answer service, and shared learning-state operations. Mathematics remains local
numeric checking and does not call the AI provider.

## Changes

| File | Change | Reason |
| --- | --- | --- |
| `backend/app/routers/practice.py` | Added the lesson answer endpoint. | Put all lesson HTTP routes in one domain router. |
| `backend/app/schemas/practice.py` | Added answer request and response contracts. | Keep the endpoint input and output explicit. |
| `backend/app/services/answer_checking.py` | Added the numeric answer checker. | Let practice-router avoid a circular import from `main.py`. |
| `backend/app/main.py` | Removed the answer endpoint, schemas, and numeric helper definitions. | Reduce the entrypoint without changing the API. |

## Decisions

| Option | Choice | Evidence | Trade-off |
| --- | --- | --- | --- |
| Keep the answer endpoint in `main.py` | Move it to practice-router | Its orchestration and state operations are already services. | `main.py` continues to re-export the tutor dependency for existing tests. |
| Duplicate numeric comparison | Extract one checker service | Both lesson answers and module tests require exact numeric comparison. | The main module imports private aliases during the transition. |

## Verification

| Command/check | Result | Limitation |
| --- | --- | --- |
| `backend/.venv/Scripts/python.exe -m pytest backend/tests -q` | 46 passed | One upstream Starlette deprecation warning. |
| Local FastAPI restart and OpenAPI | Existing answer operation present. | Local-only verification. |
| Empty live answer request | Returned 422 without writes. | Answer persistence is covered in the isolated test database. |

## Findings and next step

The practice domain has a complete HTTP boundary. Next, move the read-only
progress summary before separating mutation routes for mistakes and vocabulary.
