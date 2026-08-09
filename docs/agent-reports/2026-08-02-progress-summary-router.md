# Work report: progress summary router

- Date: 2026-08-02
- Status: completed

## Confirmed context

The progress summary is a read-only aggregation of lesson attempts, answers,
and mistake status. It has no AI dependency and performs no writes.

## Changes

| File | Change | Reason |
| --- | --- | --- |
| `backend/app/routers/progress.py` | Added `GET /api/v1/progress`. | Start a focused progress domain boundary. |
| `backend/app/schemas/progress.py` | Added the six-field summary contract. | Keep output explicit and stable. |
| `backend/app/main.py` | Registered the router and removed the duplicate route. | Reduce the entrypoint without changing the API. |

## Decisions

| Option | Choice | Evidence | Trade-off |
| --- | --- | --- | --- |
| Move all progress routes | Move only the independent summary | Error and vocabulary routes include mutation flows. | More progress routes remain in `main.py`. |
| Use raw dictionaries | Keep Pydantic response model | The exact six fields are already tested. | New fields must be added deliberately. |

## Verification

| Command/check | Result | Limitation |
| --- | --- | --- |
| `backend/.venv/Scripts/python.exe -m pytest backend/tests -q` | 46 passed | One upstream Starlette deprecation warning. |
| Local FastAPI restart | Application started successfully. | Local-only verification. |
| Local `GET /api/v1/progress` and OpenAPI | Six fields and existing operation returned. | Not a full browser acceptance test. |

## Findings and next step

The summary is separated. Next, extract the read-only active mistake list and
its lesson-title lookup without moving practice or resolution mutations.
