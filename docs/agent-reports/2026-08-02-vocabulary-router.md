# Work report: vocabulary router

- Date: 2026-08-02
- Status: completed

## Result

Vocabulary catalogue, next/due selection, saving and spaced-repetition review
were moved from `app.main` to `app.routers.vocabulary`. Response contracts are
in `app.schemas.vocabulary`, and model-to-response conversion is in
`app.services.vocabulary`.

The lesson-specific vocabulary endpoint remains in `main.py` because it is part
of the lesson workflow and still shares its route-level context there.

## Verification

| Command/check | Result | Limitation |
| --- | --- | --- |
| `backend/.venv/Scripts/python.exe -m pytest backend/tests -q` | 46 passed | One upstream Starlette deprecation warning. |
| Live mutation check | Skipped | Avoided changing local vocabulary review history. |
