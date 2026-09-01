---
name: a1-course-progress-tracker
description: Maintain the Slovak A1 project topic plan when the owner reports which documents, lessons, or tests were completed, loaded, checked, deferred, or approved. Use for progress updates and stage summaries; do not edit lesson content or application code.
---

# A1 Course Progress Tracker

Translate the owner's informal progress report into accurate per-topic stages
without changing course content, identifiers, or runtime behavior.

## Sources

Work from the project root. Read:

1. `AGENTS.md` and `PROJECT_CHECKPOINT.md`.
2. `course-content/slovak-a1/learning/learning_roadmap.md`.
3. The relevant module index under `frontend/app/data/modules/moduleN/index.ts`
   only when topic numbering or names need verification.

Do not load broad project reports for a progress-only update.

## Topic stages

Treat the stages as an ordered flow:

1. `📝 Документ: доделать` — the source study document is incomplete.
2. `🟠 В софт: пересобрать` — the source is ready, but the lesson still needs to
   be assembled or revised in the application.
3. `🔵 Загружено — проверить` — the lesson is present in the project and awaits
   the owner's manual review.
4. `✅ Проверено и согласовано` — the owner manually checked and approved it.

Never infer approval from automated tests, file presence, or another agent's
review. Only the owner's report can move a topic to the green stage.

## Interpreting reports

- Interpret «обновил/загрузил до темы N» as topics through N being at least
  blue, unless the owner gives narrower topic ranges or explicit exceptions.
- Interpret «проверил до темы N» as topics through N being green.
- Explicit exceptions override a range. Example: «проверил до 9, но 9 проверю
  позже» means topics 1–8 are green and topic 9 remains blue.
- «Документ готов» moves the named topic from the document stage to orange;
  it does not mean the topic is loaded into the application.
- Preserve later topics and other modules unless the report clearly changes
  them.
- If two plausible readings would change different topics and no explicit
  exception resolves the ambiguity, ask one short question before editing.

## Update workflow

1. Run `git status --short`; preserve unrelated changes.
2. Resolve module and topic numbers against the roadmap.
3. Update only the affected topic markers in
   `course-content/slovak-a1/learning/learning_roadmap.md`.
4. Update `PROJECT_CHECKPOINT.md` with one concise owner-status paragraph.
   Replace stale progress wording instead of appending a second version.
5. Follow any current project instruction about an owner-attention file. If
   none exists, do not create one merely for this workflow.
6. Count all topic markers and ensure the total remains 83. Also verify the
   affected module has the expected number of topics.
7. Run the repository audit, `git diff --check`, and `git status --short` as
   required by `AGENTS.md`. Application tests are unnecessary for marker-only
   Markdown changes.

## Response

Report:

- what the owner completed;
- the current stage/range for the affected module;
- which topic or range needs the owner's attention next;
- which files were updated and which checks ran.

Keep the report short. Do not claim that lesson content was validated when only
the progress markers were updated.
