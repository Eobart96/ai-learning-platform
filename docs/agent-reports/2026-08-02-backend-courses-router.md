# Work report: backend courses router

- Date: 2026-08-02
- Status: completed

## Confirmed context

The local MVP remains a FastAPI modular monolith. Course loading stays in the
application lifespan; the catalog and study roadmap are read-only HTTP routes.

## Changes

| File | Change | Reason |
| --- | --- | --- |
| `backend/app/routers/courses.py` | Added the course catalog and study-roadmap router. | Separate a coherent read-only domain from `main.py`. |
| `backend/app/schemas/courses.py` | Added explicit response contracts. | Keep the API shape documented and validated. |
| `backend/app/main.py` | Registered the router and removed duplicate route functions. | Preserve the same URLs while reducing the monolith entrypoint. |
| `docs/ARCHITECTURE.md` | Recorded the implemented boundary. | Keep documentation aligned with source. |

## Decisions

| Option | Choice | Evidence | Trade-off |
| --- | --- | --- | --- |
| Move courses with progress or lesson answers | Move only catalog and study-roadmap | Both routes are read-only and have existing regression tests. | `main.py` still owns lessons and progress. |
| Return raw dictionaries | Use Pydantic response models | Existing JSON fields are stable and covered by tests. | New roadmap keys must be intentionally modelled or allowed. |

## Verification

| Command/check | Result | Limitation |
| --- | --- | --- |
| `backend/.venv/Scripts/python.exe -m pytest backend/tests -q` | 46 passed | One upstream Starlette deprecation warning. |
| `GET /health` on local FastAPI | `{"status":"ok"}` | Local-only verification. |
| `GET /api/v1/courses` and math study-roadmap | 2 courses and roadmap returned through HTTP | Not a full browser acceptance test. |

## Findings and next step

The API contracts and URLs are unchanged. Next, map the independent lesson
practice routes before moving only the read-only and local-generator portion.
