# Work report: backend practice router

- Date: 2026-08-02
- Status: completed

## Confirmed context

The FastAPI application remains a modular monolith. Lesson answers still update
attempts, mistakes, vocabulary, and sometimes call an AI provider, so they are
outside this narrow router extraction.

## Changes

| File | Change | Reason |
| --- | --- | --- |
| `backend/app/routers/practice.py` | Added lesson retrieval and numeric task generation. | Separate a cohesive practice boundary from `main.py`. |
| `backend/app/schemas/practice.py` | Added lesson and exercise response contracts. | Keep API responses explicit and validated. |
| `backend/app/main.py` | Registered the router and removed duplicate route functions. | Preserve URLs while reducing the entrypoint. |

## Decisions

| Option | Choice | Evidence | Trade-off |
| --- | --- | --- | --- |
| Move all lesson endpoints | Move only read-only retrieval and the local generator | Answer submission uses shared AI, progress, mistake, and vocabulary logic. | Answer submission remains in `main.py`. |
| Persist generated tasks in the normal lesson list | Keep the existing marker filter | Tests and UI expect generated variants to be transient in the topic list. | Generated tasks are visible only when created and in mistake analytics. |

## Verification

| Command/check | Result | Limitation |
| --- | --- | --- |
| `backend/.venv/Scripts/python.exe -m pytest backend/tests -q` | 46 passed | One upstream Starlette deprecation warning. |
| Local `GET /api/v1/lessons/{id}` | A math lesson and its three base exercises returned. | Local-only verification. |
| Local `POST /api/v1/lessons/{id}/generated-exercises` | Returned a new numeric exercise. | Not a full browser acceptance test. |

## Findings and next step

The practice API has retained its URLs and response shape. Next, map the
read-only progress endpoints before moving a single coherent subset.
