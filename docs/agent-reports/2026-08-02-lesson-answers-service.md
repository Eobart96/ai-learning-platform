# Work report: lesson answers service

- Date: 2026-08-02
- Status: completed

## Confirmed context

Submitting an answer has one state-changing flow: validate the exercise, use
the local numeric checker or AI, then save the attempt, answer, mistake, and
vocabulary in one SQLite transaction.

## Changes

| File | Change | Reason |
| --- | --- | --- |
| `backend/app/services/lesson_answers.py` | Added the answer assessment and persistence scenario. | Remove AI and persistence orchestration from the FastAPI entrypoint. |
| `backend/app/main.py` | Reduced the endpoint to request/dependency mapping and response conversion. | Preserve the current URL and JSON contract. |

## Decisions

| Option | Choice | Evidence | Trade-off |
| --- | --- | --- | --- |
| Move shared error and vocabulary helpers now | Keep them injected temporarily | They are also used by dialogue, diary, homework, and tests. | `main.py` still owns the shared helper implementations. |
| Change the endpoint response | Keep it unchanged | Existing tests assert attempt, answer, assessment, and mistake identifiers. | The service returns an internal result object. |

## Verification

| Command/check | Result | Limitation |
| --- | --- | --- |
| `backend/.venv/Scripts/python.exe -m pytest backend/tests -q` | 46 passed | One upstream Starlette deprecation warning. |
| Local `POST /api/v1/lessons/{id}/answer` with an empty answer | Returned 422 without writes. | Persistence is verified with the isolated test database. |
| Local `/openapi.json` | Existing answer operation is present. | Not a full browser acceptance test. |

## Findings and next step

The orchestration is now isolated, but the shared error and vocabulary helpers
remain in `main.py`. Move those helpers next before extracting progress and
vocabulary routers.
