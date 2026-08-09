# Work report: vocabulary router tests

- Date: 2026-08-02
- Status: completed

## Result

Added isolated API regression coverage for the vocabulary router. The test
checks that `/api/v1/progress/vocabulary/next` returns a saved due item and
that save/review requests for an unknown item return the stable `404` response.

The existing vocabulary flow test continues to cover generated words, saving,
spaced repetition, and removal from the due list after review.

## Verification

| Command/check | Result | Limitation |
| --- | --- | --- |
| `backend/.venv/Scripts/python.exe -m pytest backend/tests/test_tutor.py -q` | 32 passed | One upstream Starlette deprecation warning. |
| `backend/.venv/Scripts/python.exe -m pytest backend/tests -q` | 47 passed | One upstream Starlette deprecation warning. |
