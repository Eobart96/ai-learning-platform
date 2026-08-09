# Work report: progress mistakes router

- Date: 2026-08-02
- Status: completed

## Changes

| File | Change | Reason |
| --- | --- | --- |
| `backend/app/routers/progress.py` | Added active mistake list route. | Extend the read-only progress boundary. |
| `backend/app/schemas/progress.py` | Added mistake response contract. | Keep output shared by future mutation routes. |
| `backend/app/services/lesson_lookup.py` | Added lesson-title lookup. | Avoid importing `main.py` from a router. |

## Verification

| Command/check | Result | Limitation |
| --- | --- | --- |
| `backend/.venv/Scripts/python.exe -m pytest backend/tests -q` | 46 passed | One upstream Starlette deprecation warning. |
| Local `GET /api/v1/progress/mistakes?course_slug=math-exam-prep` | Returned filtered list safely. | Local-only verification. |

## Next step

Move mistake practice and resolve mutations into the same progress router.
