import { expect, test, type Page } from "@playwright/test";

import { a1CourseModules, allA1Lessons, getA1Module } from "../../app/data/a1Course";
import { a1CefrCoverage } from "../../app/data/a1CefrCoverage";
import { getPlannedModule } from "../../app/data/a1CourseRoadmap";
import { buildInitialProgress, filterKnownLessonSlugs, orderedModuleLessons, topicGroupLessons } from "../../app/data/courseEngine";
import type { CourseLesson } from "../../app/data/courseTypes";
import { validateCourseModules } from "../../app/data/courseValidation";
import type { CourseState } from "../../app/lib/api";
import { defineLessonsFromPlannedContent, definePlannedModule } from "../../app/data/modules/moduleFactory";
import { buildModuleFinalQuestions, buildReinforcementPractices } from "../../app/data/coursePractice";
import { buildCourseResetScope, buildLessonSummary, nextMistakeRecord, removeActivityScope, removeLessonScope, removeMistakeScope, resetProgressScope } from "../../app/data/courseProgress";
import { contentVocabulary } from "../../app/components/CourseVocabulary";

const module1 = getA1Module(1);
const module2 = getA1Module(2);
const module3 = getA1Module(3);
const module4 = getA1Module(4);
const module5 = getA1Module(5);
const module6 = getA1Module(6);

test("course structure has stable unique identifiers and data-driven ordering", () => {
  const lessonSlugs = allA1Lessons.map((lesson) => lesson.slug);
  const activityIds = allA1Lessons.flatMap((lesson) => [
    ...lesson.stepPractices.map((practice) => practice.id),
    ...(lesson.reinforcementPractices ?? []).map((practice) => practice.id),
    ...lesson.knowledgeChecks.map((check) => check.id),
    ...lesson.finalChecks.map((check) => check.id),
  ]);

  expect(new Set(a1CourseModules.map((module) => module.slug)).size).toBe(a1CourseModules.length);
  expect(new Set(lessonSlugs).size).toBe(lessonSlugs.length);
  expect(new Set(activityIds).size).toBe(activityIds.length);
  expect(orderedModuleLessons(module1).map((lesson) => lesson.slug)).toEqual(
    module1.topicGroups?.flatMap((group) => group.lessonSlugs),
  );
  for (const group of module1.topicGroups ?? []) {
    expect(topicGroupLessons(module1, group.id).map((lesson) => lesson.slug)).toEqual(group.lessonSlugs);
  }
});

test("module registry rejects incomplete or unplanned content", () => {
  const planned = getPlannedModule(2);
  if (!planned) throw new Error("Module 2 roadmap is missing");
  expect(() => definePlannedModule({ planned, lessons: module2.lessons.slice(1) })).toThrow(/Missing Module 2 lesson file/);
  expect(() => definePlannedModule({ planned, lessons: [module2.lessons[0], module2.lessons[0]] })).toThrow(/Duplicate registered lesson/);
  expect(() => defineLessonsFromPlannedContent(planned, [{ slug: "unplanned-topic" }], () => module2.lessons[0])).toThrow(/Unplanned lesson content/);
});

test("course validation rejects malformed answer options", () => {
  const invalidModules = structuredClone(a1CourseModules);
  const practice = invalidModules[0].lessons[0].stepPractices.find((item) => item.type === "choice");
  if (!practice) throw new Error("Choice practice is missing");
  practice.options = [practice.answer, practice.answer];
  expect(() => validateCourseModules(invalidModules, a1CefrCoverage)).toThrow(/Неверные варианты выбора/);
});

test("progress and vocabulary ignore unknown or duplicate lesson slugs", () => {
  const knownSlug = allA1Lessons[0].slug;
  expect(Object.keys(buildInitialProgress(a1CourseModules))).toEqual(allA1Lessons.map((lesson) => lesson.slug));
  expect(filterKnownLessonSlugs(a1CourseModules, [knownSlug, "removed-lesson", knownSlug])).toEqual([knownSlug]);
  expect(contentVocabulary([knownSlug, "removed-lesson"]).every((item) => item.lesson_slug === knownSlug)).toBe(true);
  expect(contentVocabulary([knownSlug])).not.toHaveLength(0);
});

test("mistake scheduling advances through deterministic 3-day and 7-day review stages", () => {
  const nowMs = Date.parse("2026-08-30T12:00:00.000Z");
  const base = { id: "practice-1", lessonSlug: "greetings", prompt: "Pozdrav", answer: "Dobrý deň", nowMs };
  expect(nextMistakeRecord({ ...base, correct: true })).toBeNull();
  const failed = nextMistakeRecord({ ...base, correct: false });
  expect(failed).toMatchObject({ attempts: 1, mastered: false, reviewStage: 0, dueAt: "2026-08-30T12:00:00.000Z" });
  const firstReview = nextMistakeRecord({ ...base, previous: failed!, correct: true });
  expect(firstReview).toMatchObject({ attempts: 1, mastered: false, reviewStage: 1, dueAt: "2026-09-02T12:00:00.000Z" });
  const mastered = nextMistakeRecord({ ...base, previous: firstReview!, correct: true });
  expect(mastered).toMatchObject({ attempts: 1, mastered: true, reviewStage: 2, dueAt: "2026-09-06T12:00:00.000Z" });
});

test("lesson summary derives complete evidence from an immutable progress snapshot", () => {
  const lesson = module1.lessons[0];
  const reinforcementPractices = buildReinforcementPractices(lesson);
  const corePractices = lesson.stepPractices.filter((practice) => practice.sectionIndex < lesson.sections.length);
  const practiceResults = Object.fromEntries([...corePractices, ...reinforcementPractices].map((practice) => [practice.id, true]));
  const checkSelections = Object.fromEntries(lesson.knowledgeChecks.map((check) => [check.id, check.answer]));
  const summary = buildLessonSummary({ lesson, reinforcementPractices, practiceResults, checkSelections, mistakes: {}, userTurns: reinforcementPractices.length });
  expect(summary.understanding).toBe(100);
  expect(summary.level).toBe("Уверенное понимание");
  expect(summary.evidence?.coreCorrect).toBe(summary.evidence?.coreTotal);
  expect(summary.userTurns).toBe(reinforcementPractices.length);
  expect(summary.mistakes).toEqual([]);
});

test("course reset transforms clean only the selected lesson scope", () => {
  const target = module1.lessons[0];
  const external = module2.lessons[0];
  const scope = buildCourseResetScope([target]);
  const targetPracticeId = target.stepPractices[0].id;
  const targetReinforcementId = buildReinforcementPractices(target)[0].id;
  const externalPracticeId = external.stepPractices[0].id;
  expect(scope.activityIds).toContain(targetPracticeId);
  expect(scope.activityIds).toContain(targetReinforcementId);
  expect(scope.activityIds).not.toContain(externalPracticeId);
  expect(removeActivityScope({ [targetPracticeId]: "remove", [targetReinforcementId]: "remove", [externalPracticeId]: "keep", unknown: "keep" }, scope)).toEqual({ [externalPracticeId]: "keep", unknown: "keep" });
  expect(removeLessonScope({ [target.slug]: "remove", [external.slug]: "keep", unknown: "keep" }, scope)).toEqual({ [external.slug]: "keep", unknown: "keep" });
  expect(removeMistakeScope({ target: { id: "target", lessonSlug: target.slug, prompt: "p", answer: "a", attempts: 1, mastered: false }, external: { id: "external", lessonSlug: external.slug, prompt: "p", answer: "a", attempts: 1, mastered: false } }, scope)).toEqual({ external: { id: "external", lessonSlug: external.slug, prompt: "p", answer: "a", attempts: 1, mastered: false } });
  expect(resetProgressScope({ [target.slug]: "completed", [external.slug]: "in_progress", unknown: "completed" }, scope)).toEqual({ [target.slug]: "not_started", [external.slug]: "in_progress", unknown: "completed" });
});

test("every Module 1 reinforcement set has six different answers", () => {
  for (const lesson of module1.lessons) {
    const practices = buildReinforcementPractices(lesson);
    const answers = practices.map((practice) => practice.answer.normalize("NFC").toLocaleLowerCase("sk").replace(/\p{P}+/gu, " ").replace(/\s+/g, " ").trim());
    expect(practices, lesson.slug).toHaveLength(6);
    expect(new Set(answers).size, lesson.slug).toBe(6);
    if (lesson.reinforcementPractices?.length) continue;
    for (const [index, answer] of answers.entries()) {
      const answerTokens = new Set(answer.split(" "));
      for (const other of answers.slice(index + 1)) {
        const otherTokens = new Set(other.split(" "));
        const smaller = answerTokens.size <= otherTokens.size ? answerTokens : otherTokens;
        const larger = answerTokens.size <= otherTokens.size ? otherTokens : answerTokens;
        expect([...smaller].every((token) => larger.has(token)), `${lesson.slug}: ${answer} / ${other}`).toBe(false);
      }
    }
  }
});

test("Themes 1–7 vary correct option positions in closed exercises", () => {
  for (const lesson of module1.lessons.slice(0, 7)) {
    const lessonPositions: number[] = [];
    for (const practice of buildReinforcementPractices(lesson)) {
      if (practice.type === "choice" && practice.options?.length) {
        const position = practice.options.indexOf(practice.answer);
        expect(position, `${lesson.slug}: ${practice.prompt}`).toBeGreaterThanOrEqual(0);
        lessonPositions.push(position);
      }
      const rowPositions = (practice.pairs ?? [])
        .filter((pair) => pair.options?.length)
        .map((pair) => pair.options?.indexOf(pair.answer) ?? -1);
      for (const position of rowPositions) expect(position, `${lesson.slug}: ${practice.prompt}`).toBeGreaterThanOrEqual(0);
      const usesFixedSemanticColumns = practice.prompt === "Определите, читать ли сочетание слитно или с паузой."
        || practice.prompt === "Найдите долгий слог в каждом слове.";
      if (rowPositions.length >= 3 && !usesFixedSemanticColumns) expect(new Set(rowPositions).size, `${lesson.slug}: ${practice.prompt}`).toBeGreaterThan(1);
      lessonPositions.push(...rowPositions);
    }
    expect(lessonPositions.length, lesson.slug).toBeGreaterThan(1);
    expect(new Set(lessonPositions).size, lesson.slug).toBeGreaterThan(1);
  }
});

test("Module 1 final test does not repeat normative answers", () => {
  const questions = buildModuleFinalQuestions(module1.lessons);
  const answers = questions.map((question) => question.answer.normalize("NFC").toLocaleLowerCase("sk").replace(/\p{P}+/gu, " ").replace(/\s+/g, " ").trim());
  expect(new Set(answers).size).toBe(answers.length);
  expect(questions.filter((question) => question.lessonSlug === "soft-hard-consonants").map((question) => question.answer)).not.toContain("žena");
});

test("Module 2 matches the expanded content contract", () => {
  expect(module2.lessons.map((lesson) => lesson.slug)).toEqual([
    "masculine-nouns",
    "feminine-nouns",
    "neuter-nouns",
    "noun-number",
    "noun-endings",
    "who-what-is-it",
    "presence-absence",
  ]);
  expect(orderedModuleLessons(module2).map((lesson) => lesson.slug)).toEqual(
    module2.topicGroups?.flatMap((group) => group.lessonSlugs),
  );
  for (const lesson of module2.lessons) {
    expect(lesson.sections.length, lesson.slug).toBeGreaterThanOrEqual(5);
    expect(lesson.stepPractices.length, lesson.slug).toBeGreaterThanOrEqual(5);
    expect(lesson.theory.rules.length, lesson.slug).toBeGreaterThanOrEqual(3);
    expect(new Set(lesson.stepPractices.map((practice) => practice.sectionIndex)).size, lesson.slug).toBe(lesson.sections.length);
    expect(lesson.stepPractices.every((practice) => practice.id.startsWith(`m2-${lesson.slug}-`)), lesson.slug).toBe(true);
  }
  const finalQuestions = buildModuleFinalQuestions(module2.lessons);
  expect(new Set(finalQuestions.map((question) => question.lessonSlug))).toEqual(new Set(module2.lessons.map((lesson) => lesson.slug)));
  expect(new Set(finalQuestions.map((question) => question.answer)).size).toBe(finalQuestions.length);
  const vocabulary = contentVocabulary(module2.lessons.map((lesson) => lesson.slug));
  expect(vocabulary.length).toBeGreaterThanOrEqual(module2.lessons.length * 4);
  expect(new Set(vocabulary.map((item) => item.lesson_slug))).toEqual(new Set(module2.lessons.map((lesson) => lesson.slug)));
});

test("Module 3 matches the expanded content contract", () => {
  expect(module3.lessons.map((lesson) => lesson.slug)).toEqual([
    "adjective-gender",
    "adjective-plural",
    "demonstratives-possessives",
    "basic-description",
    "choice-contrast",
    "basic-connectors",
  ]);
  expect(orderedModuleLessons(module3).map((lesson) => lesson.slug)).toEqual(
    module3.topicGroups?.flatMap((group) => group.lessonSlugs),
  );
  for (const lesson of module3.lessons) {
    expect(lesson.sections.length, lesson.slug).toBeGreaterThanOrEqual(5);
    expect(lesson.stepPractices.length, lesson.slug).toBeGreaterThanOrEqual(5);
    expect(lesson.theory.rules.length, lesson.slug).toBeGreaterThanOrEqual(3);
    expect(new Set(lesson.stepPractices.map((practice) => practice.sectionIndex)).size, lesson.slug).toBe(lesson.sections.length);
    expect(lesson.stepPractices.every((practice) => practice.id.startsWith(`m3-${lesson.slug}-`)), lesson.slug).toBe(true);
  }
  const finalQuestions = buildModuleFinalQuestions(module3.lessons);
  expect(new Set(finalQuestions.map((question) => question.lessonSlug))).toEqual(new Set(module3.lessons.map((lesson) => lesson.slug)));
  expect(new Set(finalQuestions.map((question) => question.answer)).size).toBe(finalQuestions.length);
  const vocabulary = contentVocabulary(module3.lessons.map((lesson) => lesson.slug));
  expect(vocabulary.length).toBeGreaterThanOrEqual(module3.lessons.length * 4);
  expect(new Set(vocabulary.map((item) => item.lesson_slug))).toEqual(new Set(module3.lessons.map((lesson) => lesson.slug)));

  const sourceGroundedText = JSON.stringify(module3.lessons);
  for (const fragment of [
    "aký dom?, aká kniha?, aké auto?",
    "cudzí turisti, но cudzie mestá",
    "Jeho, jej, ich не изменяются",
    "fialový",
    "Nie červené, ale modré.",
    "Mám aj brata, aj sestru.",
    "Najprv raňajkujem, potom pracujem a nakoniec oddychujem.",
  ]) {
    expect(sourceGroundedText, fragment).toContain(fragment);
  }
});

test("Module 4 matches the expanded content contract", () => {
  expect(module4.lessons.map((lesson) => lesson.slug)).toEqual([
    "nominative", "accusative-nouns", "accusative-agreement", "locative-v-na", "genitive-quantity", "genitive-absence",
    "genitive-do", "preposition-government", "where-direction-origin", "dative-instrumental-models", "simple-route",
  ]);
  expect(orderedModuleLessons(module4).map((lesson) => lesson.slug)).toEqual(module4.topicGroups?.flatMap((group) => group.lessonSlugs));
  for (const lesson of module4.lessons) {
    expect(lesson.sections.length, lesson.slug).toBeGreaterThanOrEqual(5);
    expect(lesson.stepPractices.length, lesson.slug).toBeGreaterThanOrEqual(5);
    expect(new Set(lesson.stepPractices.map((practice) => practice.sectionIndex)).size, lesson.slug).toBe(lesson.sections.length);
    expect(lesson.stepPractices.every((practice) => practice.id.startsWith(`m4-${lesson.slug}-`)), lesson.slug).toBe(true);
  }
  const finalQuestions = buildModuleFinalQuestions(module4.lessons);
  expect(new Set(finalQuestions.map((question) => question.lessonSlug))).toEqual(new Set(module4.lessons.map((lesson) => lesson.slug)));
  expect(new Set(finalQuestions.map((question) => question.answer)).size).toBe(finalQuestions.length);
  const vocabulary = contentVocabulary(module4.lessons.map((lesson) => lesson.slug));
  expect(vocabulary.length).toBeGreaterThanOrEqual(module4.lessons.length * 4);
  expect(new Set(vocabulary.map((item) => item.lesson_slug))).toEqual(new Set(module4.lessons.map((lesson) => lesson.slug)));

  const sourceGroundedText = JSON.stringify(module4.lessons);
  for (const fragment of [
    "študenti → študentov",
    "na neho, na ňu, na nich",
    "v obchodoch, v školách, na uliciach",
    "dve knihy, tri mestá, štyri autá",
    "Niet času. Niet vody. Niet peňazí.",
    "Idem domov означает",
    "na stole — Kde? + Lokál",
    "u lekára, k lekárovi, od lekára",
    "so mnou, s tebou, s ním, s ňou",
    "naľavo/napravo — где",
    "doľava/doprava — куда",
  ]) {
    expect(sourceGroundedText, fragment).toContain(fragment);
  }
});

test("Module 5 matches the expanded content contract", () => {
  expect(module5.lessons.map((lesson) => lesson.slug)).toEqual([
    "present-tense", "irregular-verbs", "reflexive-sa-si", "verb-negation-questions", "chciet-infinitive", "moct-infinitive",
    "musiet-infinitive", "vediet-infinitive", "modal-questions-negation", "polite-requests", "basic-imperative",
  ]);
  expect(orderedModuleLessons(module5).map((lesson) => lesson.slug)).toEqual(module5.topicGroups?.flatMap((group) => group.lessonSlugs));
  for (const lesson of module5.lessons) {
    expect(lesson.sections.length, lesson.slug).toBeGreaterThanOrEqual(5);
    expect(lesson.stepPractices.length, lesson.slug).toBeGreaterThanOrEqual(5);
    expect(new Set(lesson.stepPractices.map((practice) => practice.sectionIndex)).size, lesson.slug).toBe(lesson.sections.length);
    expect(lesson.stepPractices.every((practice) => practice.id.startsWith(`m5-${lesson.slug}-`)), lesson.slug).toBe(true);
  }
  const finalQuestions = buildModuleFinalQuestions(module5.lessons);
  expect(new Set(finalQuestions.map((question) => question.lessonSlug))).toEqual(new Set(module5.lessons.map((lesson) => lesson.slug)));
  expect(new Set(finalQuestions.map((question) => question.answer)).size).toBe(finalQuestions.length);
  const vocabulary = contentVocabulary(module5.lessons.map((lesson) => lesson.slug));
  expect(vocabulary.length).toBeGreaterThanOrEqual(module5.lessons.length * 4);
  expect(new Set(vocabulary.map((item) => item.lesson_slug))).toEqual(new Set(module5.lessons.map((lesson) => lesson.slug)));
});

test("Module 6 matches the expanded content contract", () => {
  expect(module6.lessons).toHaveLength(18);
  expect(orderedModuleLessons(module6).map((lesson) => lesson.slug)).toEqual(module6.topicGroups?.flatMap((group) => group.lessonSlugs));
  for (const lesson of module6.lessons) {
    expect(lesson.sections.length, lesson.slug).toBeGreaterThanOrEqual(5);
    expect(lesson.stepPractices.length, lesson.slug).toBeGreaterThanOrEqual(5);
    expect(new Set(lesson.stepPractices.map((practice) => practice.sectionIndex)).size, lesson.slug).toBe(lesson.sections.length);
    expect(lesson.stepPractices.every((practice) => practice.id.startsWith(`m6-${lesson.slug}-`)), lesson.slug).toBe(true);
  }
  const finals = buildModuleFinalQuestions(module6.lessons);
  expect(new Set(finals.map((question) => question.lessonSlug))).toEqual(new Set(module6.lessons.map((lesson) => lesson.slug)));
  expect(new Set(finals.map((question) => question.answer)).size).toBe(finals.length);
  const vocabulary = contentVocabulary(module6.lessons.map((lesson) => lesson.slug));
  expect(new Set(vocabulary.map((item) => item.lesson_slug))).toEqual(new Set(module6.lessons.map((lesson) => lesson.slug)));
});

function createState(overrides: Partial<CourseState> = {}): CourseState {
  return {
    activeModule: 1,
    selectedSlug: module1.lessons[0].slug,
    fontSize: "large",
    progress: Object.fromEntries(module1.lessons.map((lesson) => [lesson.slug, "not_started"])),
    lessonSteps: {},
    checkSelections: {},
    practiceAnswers: {},
    practiceResults: {},
    mistakes: {},
    finalSelections: {},
    finalCompleted: false,
    finalCompletedModules: {},
    chatHistories: {},
    lessonSummaries: {},
    ...overrides,
  };
}

async function mockStateApi(page: Page, initialState: CourseState): Promise<void> {
  let state = structuredClone(initialState);
  await page.route("**/api/v1/course/state", async (route) => {
    if (route.request().method() === "PUT") {
      state = route.request().postDataJSON() as CourseState;
    }
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ exists: true, schema_version: 1, state, updated_at: null }),
    });
  });
}

async function openCourse(page: Page): Promise<void> {
  const restored = page.waitForResponse((response) =>
    response.url().includes("/api/v1/course/state") && response.request().method() === "GET",
  );
  await page.goto("/");
  await restored;
  await expect(page.getByRole("heading", { name: module1.title })).toBeVisible();
  await expect(page.locator(".course-persistence-error")).toHaveCount(0);
}

async function openLesson(page: Page, lesson: CourseLesson): Promise<void> {
  const groupTitle = module1.topicGroups?.find((group) => group.lessonSlugs.includes(lesson.slug))?.title;
  if (!groupTitle) throw new Error(`Lesson ${lesson.slug} is not assigned to a topic group`);
  await page.locator(".course-group-card").filter({ hasText: groupTitle }).click();
  await page.getByRole("button", { name: new RegExp(lesson.title) }).first().click();
  await expect(page.locator(".course-material-heading h3")).toHaveText(lesson.title);
}

test("AI settings switch provider without receiving saved secrets", async ({ page }) => {
  await mockStateApi(page, createState());
  let provider = "codex";
  let savedPayload: Record<string, unknown> | null = null;
  await page.route("**/api/v1/tutor/settings", async (route) => {
    if (route.request().method() === "PUT") {
      savedPayload = route.request().postDataJSON() as Record<string, unknown>;
      provider = String(savedPayload.provider);
    }
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        provider,
        codex_installed: true,
        codex_authenticated: true,
        codex_message: "Codex подключён.",
        openai_api_key_configured: false,
        openai_model: "gpt-5",
        polza_api_key_configured: provider === "polza",
        polza_model: "openai/gpt-4o-mini",
        polza_base_url: "https://polza.ai/api/v1",
      }),
    });
  });

  await openCourse(page);
  await page.getByRole("button", { name: "Открыть настройки ИИ" }).click();
  const dialog = page.getByRole("dialog", { name: "Подключение ИИ" });
  await expect(dialog).toBeVisible();
  await dialog.getByText("Polza API", { exact: true }).click();
  await dialog.getByLabel("API-ключ Polza").fill("temporary-test-key");
  await dialog.getByRole("button", { name: "Сохранить" }).click();
  await expect(dialog.getByRole("status")).toContainText("Настройки сохранены");
  expect(savedPayload).toMatchObject({ provider: "polza", polza_api_key: "temporary-test-key" });
  await dialog.getByRole("button", { name: "Закрыть настройки" }).click();
  await expect(dialog).toBeHidden();
});

test("tablet header keeps navigation and settings inside the viewport", async ({ page }) => {
  await page.setViewportSize({ width: 768, height: 1024 });
  await mockStateApi(page, createState());
  await openCourse(page);

  await expect(page.getByRole("button", { name: "Открыть настройки ИИ" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Включить тёмную тему" })).toBeVisible();
  const dimensions = await page.evaluate(() => {
    const header = document.querySelector<HTMLElement>(".course-route-header");
    const settings = document.querySelector<HTMLElement>('[aria-label="Открыть настройки ИИ"]');
    return {
      clientWidth: document.documentElement.clientWidth,
      scrollWidth: document.documentElement.scrollWidth,
      headerRight: header?.getBoundingClientRect().right ?? 0,
      settingsRight: settings?.getBoundingClientRect().right ?? 0,
    };
  });
  expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.clientWidth);
  expect(dimensions.headerRight).toBeLessThanOrEqual(dimensions.clientWidth);
  expect(dimensions.settingsRight).toBeLessThanOrEqual(dimensions.clientWidth);
});

test("module switcher keeps a visible gap before the course badge", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await mockStateApi(page, createState());
  await openCourse(page);

  const spacing = await page.evaluate(() => {
    const switcher = document.querySelector<HTMLElement>(".course-module-switcher");
    const badge = document.querySelector<HTMLElement>(".course-kicker");
    const switcherBox = switcher?.getBoundingClientRect();
    const badgeBox = badge?.getBoundingClientRect();
    return {
      horizontalGap: (badgeBox?.left ?? 0) - (switcherBox?.right ?? 0),
      marginRight: switcher ? Number.parseFloat(getComputedStyle(switcher).marginRight) : 0,
    };
  });

  expect(spacing.marginRight).toBe(12);
  expect(spacing.horizontalGap).toBeGreaterThanOrEqual(12);
});

test("mobile material uses a compact lesson picker before the article", async ({ page }) => {
  const lesson = module1.lessons[0];
  await page.setViewportSize({ width: 390, height: 844 });
  await mockStateApi(page, createState({
    selectedSlug: lesson.slug,
    fontSize: "extra-large",
    progress: { [lesson.slug]: "in_progress" },
  }));
  await openCourse(page);
  await openLesson(page, lesson);

  const picker = page.getByLabel(`Выберите тему ${module1.title}`);
  await expect(picker).toBeVisible();
  await expect(picker).toHaveValue(lesson.slug);
  await expect(page.locator(".course-lesson-list")).toBeHidden();
  const dimensions = await page.evaluate(() => {
    const pickerElement = document.querySelector<HTMLElement>(".course-lesson-picker");
    const article = document.querySelector<HTMLElement>(".course-material");
    return {
      clientWidth: document.documentElement.clientWidth,
      scrollWidth: document.documentElement.scrollWidth,
      gap: (article?.getBoundingClientRect().top ?? 0) - (pickerElement?.getBoundingClientRect().bottom ?? 0),
    };
  });
  expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.clientWidth);
  expect(dimensions.gap).toBeLessThanOrEqual(20);

  await picker.selectOption(module1.lessons[1].slug);
  await expect(page.locator(".course-material-heading h3")).toHaveText(module1.lessons[1].title);
});

test("cached progress survives backend outage and reconnects without reload", async ({ page }) => {
  const completedProgress = Object.fromEntries(module1.lessons.map((lesson) => [lesson.slug, "completed"]));
  const serverState = createState({ progress: completedProgress });
  let backendAvailable = true;
  let getRequests = 0;
  let savedState: CourseState | null = null;
  await page.route("**/api/v1/course/state", async (route) => {
    if (route.request().method() === "GET") getRequests += 1;
    if (!backendAvailable) {
      await route.fulfill({ status: 503, contentType: "application/json", body: JSON.stringify({ detail: "Backend unavailable" }) });
      return;
    }
    if (route.request().method() === "PUT") savedState = route.request().postDataJSON() as CourseState;
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ exists: true, schema_version: 1, state: serverState, updated_at: null }),
    });
  });

  await page.goto("/");
  await expect(page.locator(".course-progress strong")).toHaveText("14/14");
  await expect(page.locator(".course-persistence-error")).toHaveCount(0);

  backendAvailable = false;
  await page.reload();
  await expect(page.locator(".course-progress strong")).toHaveText("14/14");
  await expect(page.locator(".course-persistence-error")).toBeVisible();
  await page.getByRole("button", { name: "Обычный размер текста" }).click();

  backendAvailable = true;
  await expect(page.locator(".course-persistence-error")).toHaveCount(0, { timeout: 5_000 });
  await expect(page.locator(".course-progress strong")).toHaveText("14/14");
  await expect(page.getByRole("button", { name: "Обычный размер текста" })).toHaveAttribute("aria-pressed", "true");
  await expect.poll(() => savedState?.fontSize).toBe("normal");
  expect(getRequests).toBeGreaterThanOrEqual(3);
});

test("alphabet section groups the first six lessons as cards", async ({ page }) => {
  await mockStateApi(page, createState());
  await openCourse(page);

  const alphabetCard = page.locator(".course-group-card");
  await expect(alphabetCard).toHaveCount(4);
  await expect(page.getByText("Знакомство и общение", { exact: true })).toBeVisible();
  await expect(page.getByText("Числа и календарь", { exact: true })).toBeVisible();
  await expect(page.getByText("Базовая грамматика", { exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: new RegExp(module1.lessons[0].title) })).toHaveCount(0);
  await alphabetCard.filter({ hasText: "Алфавит" }).click();

  await expect(page.getByRole("heading", { name: "Алфавит" })).toBeVisible();
  await expect(page.locator(".course-topic-grid .course-topic-card")).toHaveCount(6);
  await expect(page.locator(".course-topic-number")).toHaveText(["01", "02", "03", "04", "05", "06"]);
  for (const lesson of module1.lessons.slice(0, 6)) await expect(page.getByRole("button", { name: new RegExp(lesson.title) })).toBeVisible();
  await page.getByRole("button", { name: "← К разделам" }).click();
  await expect(alphabetCard).toHaveCount(4);
  for (const [title, count, numbers] of [["Знакомство и общение", 3, ["07", "08", "09"]], ["Числа и календарь", 2, ["10", "11"]], ["Базовая грамматика", 3, ["12", "13", "14"]]] as const) {
    await page.locator(".course-group-card").filter({ hasText: title }).click();
    await expect(page.getByRole("heading", { name: title })).toBeVisible();
    await expect(page.locator(".course-topic-grid .course-topic-card")).toHaveCount(count);
    await expect(page.locator(".course-topic-number")).toHaveText(numbers);
    await page.getByRole("button", { name: "← К разделам" }).click();
  }
});

test("Theme 2 ends after five material steps and moves six exercises to its final test", async ({ page }) => {
  const lesson = module1.lessons.find((item) => item.slug === "long-short-vowels");
  if (!lesson) throw new Error("Long and short vowels lesson is missing");
  const lastPractice = lesson.stepPractices.find((practice) => practice.sectionIndex === 4);
  if (!lastPractice) throw new Error("Theme 2 step 5 practice is missing");
  await mockStateApi(page, createState({
    selectedSlug: lesson.slug,
    progress: { [lesson.slug]: "in_progress" },
    lessonSteps: { [lesson.slug]: 4 },
    practiceAnswers: { [lastPractice.id]: lastPractice.answer },
    practiceResults: { [lastPractice.id]: true },
  }));

  await openCourse(page);
  await openLesson(page, lesson);
  await expect(page.locator(".course-stepper")).toContainText("Шаг 5 из 5");
  await expect(page.locator(".course-content-heading h4")).toHaveText("Частые ошибки");
  await expect(page.getByRole("button", { name: "Открыть шаг 6" })).toHaveCount(0);
  await page.getByRole("button", { name: "Перейти к финальному тесту →" }).click();

  await expect(page.locator(".course-current-task")).toContainText("Финальный тест темы");
  await expect(page.locator(".course-reinforcement fieldset")).toHaveCount(6);
  const matchingTask = page.locator(".course-reinforcement fieldset").nth(5);
  const matchingPractice = buildReinforcementPractices(lesson)[5];
  for (const [index, pair] of (matchingPractice.pairs ?? []).entries()) await matchingTask.locator(".course-pair-row").nth(index).getByRole("button", { name: pair.answer, exact: true }).click();
  await matchingTask.getByRole("button", { name: "Проверить" }).click();
  await expect(matchingTask.locator(".course-pair-row.correct")).toHaveCount(4);
  await expect(matchingTask).toHaveClass(/correct/);
});

test("Theme 11 follows the PDF sequence and uses a six-task interactive final test", async ({ page }) => {
  const lesson = module1.lessons.find((item) => item.slug === "days-and-months");
  if (!lesson) throw new Error("Days and months lesson is missing");
  const lastPractice = lesson.stepPractices.find((practice) => practice.id === "days-step-6");
  if (!lastPractice) throw new Error("Theme 11 step 6 practice is missing");
  await mockStateApi(page, createState({
    selectedSlug: lesson.slug,
    progress: { [lesson.slug]: "in_progress" },
    lessonSteps: { [lesson.slug]: 5 },
    practiceAnswers: { [lastPractice.id]: lastPractice.answer },
    practiceResults: { [lastPractice.id]: true },
  }));

  await openCourse(page);
  await openLesson(page, lesson);
  await expect(page.locator(".course-stepper")).toContainText("Шаг 6 из 6");
  await expect(page.locator(".course-content-heading h4")).toHaveText("Частые ошибки");
  await page.getByRole("button", { name: "Перейти к финальному тесту →" }).click();

  await expect(page.locator(".course-current-task")).toContainText("Выполните шесть заданий темы 11");
  await expect(page.locator(".course-reinforcement fieldset")).toHaveCount(6);
  const formsTask = page.locator(".course-reinforcement fieldset").nth(1);
  await expect(formsTask.locator(".course-pair-row")).toHaveCount(4);
  const formsPractice = buildReinforcementPractices(lesson)[1];
  for (const [index, pair] of (formsPractice.pairs ?? []).entries()) {
    const wrongOption = pair.options?.find((option) => option !== pair.answer);
    if (!wrongOption) throw new Error(`No wrong option for ${pair.prompt}`);
    await formsTask.locator(".course-pair-row").nth(index).getByRole("button", { name: wrongOption, exact: true }).click();
  }
  await formsTask.getByRole("button", { name: "Проверить" }).click();
  await expect(formsTask.locator(".course-pair-row.incorrect")).toHaveCount(4);
  await expect(formsTask.locator(".course-pair-row").first()).toContainText("Правильно: v pondelok");
  for (const [index, pair] of (formsPractice.pairs ?? []).entries()) {
    await formsTask.locator(".course-pair-row").nth(index).getByRole("button", { name: pair.answer, exact: true }).click();
  }
  await formsTask.getByRole("button", { name: "Проверить" }).click();
  await expect(formsTask.locator(".course-pair-row.correct")).toHaveCount(4);
});

test("Theme 12 follows the pronouns PDF and checks translations row by row", async ({ page }) => {
  const lesson = module1.lessons.find((item) => item.slug === "personal-pronouns");
  if (!lesson) throw new Error("Personal pronouns lesson is missing");
  const lastPractice = lesson.stepPractices.find((practice) => practice.id === "pronouns-step-5");
  if (!lastPractice) throw new Error("Theme 12 step 5 practice is missing");
  await mockStateApi(page, createState({
    selectedSlug: lesson.slug,
    progress: { [lesson.slug]: "in_progress" },
    lessonSteps: { [lesson.slug]: 4 },
    practiceAnswers: { [lastPractice.id]: lastPractice.answer },
    practiceResults: { [lastPractice.id]: true },
  }));

  await openCourse(page);
  await openLesson(page, lesson);
  await expect(page.locator(".course-stepper")).toContainText("Шаг 5 из 5");
  await expect(page.locator(".course-content-heading h4")).toHaveText("Частые ошибки");
  await page.getByRole("button", { name: "Перейти к финальному тесту →" }).click();

  await expect(page.locator(".course-current-task")).toContainText("Выполните шесть заданий темы 12");
  await expect(page.locator(".course-reinforcement fieldset")).toHaveCount(6);
  const translationTask = page.locator(".course-reinforcement fieldset").nth(4);
  const rows = translationTask.locator(".course-pair-row");
  await expect(rows).toHaveCount(4);
  const checkButton = translationTask.getByRole("button", { name: "Проверить" });
  await expect(checkButton).toBeDisabled();
  await rows.nth(0).getByRole("textbox").fill("On je lekár");
  await rows.nth(1).getByRole("textbox").fill("My sme priateľ.");
  await rows.nth(2).getByRole("textbox").fill("Vy ste zo Slovenska.");
  await rows.nth(3).getByRole("textbox").fill("Oni sú tu.");
  await expect(checkButton).toBeEnabled();
  await checkButton.click();
  await expect(translationTask.locator(".course-pair-row.correct")).toHaveCount(3);
  await expect(rows.nth(1)).toHaveClass(/incorrect/);
  await expect(rows.nth(1)).toContainText("Правильно: My sme priatelia.");
  await rows.nth(1).getByRole("textbox").fill("My sme priatelia.");
  await checkButton.click();
  await expect(translationTask.locator(".course-pair-row.correct")).toHaveCount(4);
});

test("Theme 13 follows the byť PDF and accepts both natural question variants", async ({ page }) => {
  const lesson = module1.lessons.find((item) => item.slug === "verb-byt");
  if (!lesson) throw new Error("Verb byť lesson is missing");
  const lastPractice = lesson.stepPractices.find((practice) => practice.id === "byt-step-5");
  if (!lastPractice) throw new Error("Theme 13 step 5 practice is missing");
  await mockStateApi(page, createState({
    selectedSlug: lesson.slug,
    progress: { [lesson.slug]: "in_progress" },
    lessonSteps: { [lesson.slug]: 4 },
    practiceAnswers: { [lastPractice.id]: lastPractice.answer },
    practiceResults: { [lastPractice.id]: true },
  }));

  await openCourse(page);
  await openLesson(page, lesson);
  await expect(page.locator(".course-stepper")).toContainText("Шаг 5 из 5");
  await expect(page.locator(".course-content-heading h4")).toHaveText("Частые ошибки");
  await page.getByRole("button", { name: "Перейти к финальному тесту →" }).click();

  await expect(page.locator(".course-current-task")).toContainText("Выполните шесть заданий темы 13");
  await expect(page.locator(".course-reinforcement fieldset")).toHaveCount(6);
  const questionTask = page.locator(".course-reinforcement fieldset").nth(2);
  const rows = questionTask.locator(".course-pair-row");
  await expect(rows).toHaveCount(3);
  const checkButton = questionTask.getByRole("button", { name: "Проверить" });
  await expect(checkButton).toBeDisabled();
  await rows.nth(0).getByRole("textbox").fill("Si unavený");
  await rows.nth(1).getByRole("textbox").fill("Ste Ruska?");
  await rows.nth(2).getByRole("textbox").fill("Sú v škole?");
  await expect(checkButton).toBeEnabled();
  await checkButton.click();
  await expect(questionTask.locator(".course-pair-row.correct")).toHaveCount(2);
  await expect(rows.nth(1)).toHaveClass(/incorrect/);
  await expect(rows.nth(1)).toContainText("Правильно: Ste z Ruska?");
  await rows.nth(1).getByRole("textbox").fill("Ste z Ruska?");
  await checkButton.click();
  await expect(questionTask.locator(".course-pair-row.correct")).toHaveCount(3);
});

test("Theme 14 follows the question-word PDF and uses normative agreement", async ({ page }) => {
  const lesson = module1.lessons.find((item) => item.slug === "question-words");
  if (!lesson) throw new Error("Question words lesson is missing");
  const lastPractice = lesson.stepPractices.find((practice) => practice.id === "m1-question-words-step-5");
  if (!lastPractice) throw new Error("Theme 14 step 5 practice is missing");
  await mockStateApi(page, createState({
    selectedSlug: lesson.slug,
    progress: { [lesson.slug]: "in_progress" },
    lessonSteps: { [lesson.slug]: 4 },
    practiceAnswers: { [lastPractice.id]: lastPractice.answer },
    practiceResults: { [lastPractice.id]: true },
  }));

  await openCourse(page);
  await openLesson(page, lesson);
  await expect(page.locator(".course-stepper")).toContainText("Шаг 5 из 5");
  await expect(page.locator(".course-content-heading h4")).toHaveText("Частые ошибки");
  await page.getByRole("button", { name: "Перейти к финальному тесту →" }).click();

  await expect(page.locator(".course-current-task")).toContainText("Выполните шесть заданий темы 14");
  await expect(page.locator(".course-reinforcement fieldset")).toHaveCount(6);
  const agreementTask = page.locator(".course-reinforcement fieldset").nth(3);
  const rows = agreementTask.locator(".course-pair-row");
  await expect(rows).toHaveCount(3);
  await rows.nth(0).getByRole("button", { name: "aký kniha", exact: true }).click();
  await rows.nth(1).getByRole("button", { name: "ktorá autobus", exact: true }).click();
  await rows.nth(2).getByRole("button", { name: "čia auto", exact: true }).click();
  await agreementTask.getByRole("button", { name: "Проверить" }).click();
  await expect(agreementTask.locator(".course-pair-row.incorrect")).toHaveCount(3);
  await expect(rows.nth(2)).toContainText("Правильно: čie auto");
  for (const [index, answer] of ["aká kniha", "ktorý autobus", "čie auto"].entries()) {
    await rows.nth(index).getByRole("button", { name: answer, exact: true }).click();
  }
  await agreementTask.getByRole("button", { name: "Проверить" }).click();
  await expect(agreementTask.locator(".course-pair-row.correct")).toHaveCount(3);
});

test("Theme 3 final task uses closed diphthong choices instead of unknown grammar", async ({ page }) => {
  const lesson = module1.lessons.find((item) => item.slug === "diphthongs");
  if (!lesson) throw new Error("Diphthongs lesson is missing");
  const lastPractice = lesson.stepPractices.find((practice) => practice.sectionIndex === 4);
  if (!lastPractice) throw new Error("Theme 3 step 5 practice is missing");
  await mockStateApi(page, createState({
    selectedSlug: lesson.slug,
    progress: { [lesson.slug]: "in_progress" },
    lessonSteps: { [lesson.slug]: 4 },
    practiceAnswers: { [lastPractice.id]: lastPractice.answer },
    practiceResults: { [lastPractice.id]: true },
  }));

  await openCourse(page);
  await openLesson(page, lesson);
  await page.getByRole("button", { name: "Перейти к финальному тесту →" }).click();

  const task = page.locator(".course-reinforcement fieldset").nth(5);
  await expect(task.getByText("Вставьте недостающий дифтонг в каждое слово.")).toBeVisible();
  await expect(task.locator(".course-pair-row")).toHaveCount(4);
  const practice = buildReinforcementPractices(lesson)[5];
  for (const [index, pair] of (practice.pairs ?? []).entries()) {
    await task.locator(".course-pair-row").nth(index).getByRole("button", { name: pair.answer, exact: true }).click();
  }
  await task.getByRole("button", { name: "Проверить" }).click();
  await expect(task.locator(".course-pair-row.correct")).toHaveCount(4);
  await expect(task).toHaveClass(/correct/);
});

test("Theme 4 uses clear closed tasks for hidden softness and final review", async ({ page }) => {
  const lesson = module1.lessons.find((item) => item.slug === "soft-hard-consonants");
  if (!lesson) throw new Error("Soft and hard consonants lesson is missing");
  const lastPractice = lesson.stepPractices.find((practice) => practice.sectionIndex === 4);
  if (!lastPractice) throw new Error("Theme 4 step 5 practice is missing");
  await mockStateApi(page, createState({
    selectedSlug: lesson.slug,
    progress: { [lesson.slug]: "in_progress" },
    lessonSteps: { [lesson.slug]: 4 },
    practiceAnswers: { [lastPractice.id]: lastPractice.answer },
    practiceResults: { [lastPractice.id]: true },
  }));

  await openCourse(page);
  await openLesson(page, lesson);
  await page.getByRole("button", { name: "Перейти к финальному тесту →" }).click();

  const practices = buildReinforcementPractices(lesson);
  const hiddenSoftnessTask = page.locator(".course-reinforcement fieldset").nth(1);
  await expect(hiddenSoftnessTask.getByText("Выберите мягкие звуки, которые слышны в каждом слове.")).toBeVisible();
  await expect(hiddenSoftnessTask.locator("input")).toHaveCount(0);
  for (const [index, pair] of (practices[1].pairs ?? []).entries()) {
    await hiddenSoftnessTask.locator(".course-pair-row").nth(index).getByRole("button", { name: pair.answer, exact: true }).click();
  }
  await hiddenSoftnessTask.getByRole("button", { name: "Проверить" }).click();
  await expect(hiddenSoftnessTask.locator(".course-pair-row.correct")).toHaveCount(5);

  const reviewTask = page.locator(".course-reinforcement fieldset").nth(5);
  await expect(reviewTask.getByText("Определите, как обозначена мягкость в каждом слове.")).toBeVisible();
  await expect(reviewTask.locator("input")).toHaveCount(0);
  for (const [index, pair] of (practices[5].pairs ?? []).entries()) {
    const row = reviewTask.locator(".course-pair-row").nth(index);
    await expect(row.getByRole("button")).toHaveText(["явная", "скрытая"]);
    await row.getByRole("button", { name: pair.answer, exact: true }).click();
  }
  await reviewTask.getByRole("button", { name: "Проверить" }).click();
  await expect(reviewTask.locator(".course-pair-row.correct")).toHaveCount(6);
});

test("Theme 5 ends after five steps and uses a closed six-task final test", async ({ page }) => {
  const lesson = module1.lessons.find((item) => item.slug === "word-stress");
  if (!lesson) throw new Error("Word stress lesson is missing");
  const lastPractice = lesson.stepPractices.find((practice) => practice.sectionIndex === 4);
  if (!lastPractice) throw new Error("Theme 5 step 5 practice is missing");
  await mockStateApi(page, createState({
    selectedSlug: lesson.slug,
    progress: { [lesson.slug]: "in_progress" },
    lessonSteps: { [lesson.slug]: 4 },
    practiceAnswers: { [lastPractice.id]: lastPractice.answer },
    practiceResults: { [lastPractice.id]: true },
  }));

  await openCourse(page);
  await openLesson(page, lesson);
  await expect(page.locator(".course-stepper")).toContainText("Шаг 5 из 5");
  await expect(page.locator(".course-content-heading h4")).toHaveText("Частые ошибки");
  await page.getByRole("button", { name: "Перейти к финальному тесту →" }).click();

  await expect(page.locator(".course-current-task")).toContainText("Выполните шесть заданий темы 5");
  await expect(page.locator(".course-reinforcement fieldset")).toHaveCount(6);
  const practices = buildReinforcementPractices(lesson);

  const stressTask = page.locator(".course-reinforcement fieldset").nth(0);
  await expect(stressTask.getByText("Выберите вариант, где ударный слог выделен прописными буквами.")).toBeVisible();
  await expect(stressTask.locator(".course-pair-row").nth(1).getByRole("button")).toHaveText(["RO-di-na", "ro-DI-na", "ro-di-NA"]);

  const prepositionTask = page.locator(".course-reinforcement fieldset").nth(3);
  await expect(prepositionTask.getByText("Определите, читать ли сочетание слитно или с паузой.")).toBeVisible();
  for (const [index, pair] of (practices[3].pairs ?? []).entries()) {
    const row = prepositionTask.locator(".course-pair-row").nth(index);
    await expect(row.getByRole("button")).toHaveText(["слитно", "с паузой"]);
    await row.getByRole("button", { name: pair.answer, exact: true }).click();
  }
  await prepositionTask.getByRole("button", { name: "Проверить" }).click();
  await expect(prepositionTask.locator(".course-pair-row.correct")).toHaveCount(4);

  const reviewTask = page.locator(".course-reinforcement fieldset").nth(5);
  await expect(reviewTask.getByText("Определите главный фокус чтения в каждом примере.")).toBeVisible();
  await expect(reviewTask.locator("input")).toHaveCount(0);
  for (const [index, pair] of (practices[5].pairs ?? []).entries()) {
    const row = reviewTask.locator(".course-pair-row").nth(index);
    await expect(row.getByRole("button")).toHaveText(["Долгота", "Первый слог", "Ритмическая группа"]);
    await row.getByRole("button", { name: pair.answer, exact: true }).click();
  }
  await reviewTask.getByRole("button", { name: "Проверить" }).click();
  await expect(reviewTask.locator(".course-pair-row.correct")).toHaveCount(6);
});

test("Theme 6 follows the rhythmic-law source and uses a closed six-task final test", async ({ page }) => {
  const lesson = module1.lessons.find((item) => item.slug === "rhythmic-law");
  if (!lesson) throw new Error("Rhythmic law lesson is missing");
  const lastPractice = lesson.stepPractices.find((practice) => practice.sectionIndex === 4);
  if (!lastPractice) throw new Error("Theme 6 step 5 practice is missing");
  expect(lesson.sections.map((section) => section.title)).toEqual([
    "Что говорит ритмический закон",
    "Что считается долгим слогом",
    "Полезные модели A1",
    "Банк примеров и исключения",
    "Частые ошибки",
  ]);
  expect(lesson.stepPractices).toHaveLength(5);

  await mockStateApi(page, createState({
    selectedSlug: lesson.slug,
    progress: { [lesson.slug]: "in_progress" },
    lessonSteps: { [lesson.slug]: 4 },
    practiceAnswers: { [lastPractice.id]: lastPractice.answer },
    practiceResults: { [lastPractice.id]: true },
  }));

  await openCourse(page);
  await openLesson(page, lesson);
  await expect(page.locator(".course-stepper")).toContainText("Шаг 5 из 5");
  await expect(page.locator(".course-content-heading h4")).toHaveText("Частые ошибки");
  await page.getByRole("button", { name: "Перейти к финальному тесту →" }).click();

  await expect(page.locator(".course-current-task")).toContainText("Выполните шесть заданий темы 6");
  await expect(page.locator(".course-reinforcement fieldset")).toHaveCount(6);
  const practices = buildReinforcementPractices(lesson);
  const syllableTask = page.locator(".course-reinforcement fieldset").nth(0);
  const syllableColumns = [
    ["krás", "ny"],
    ["bie", "ly"],
    ["pia", "ty"],
    ["spie", "vam"],
    ["chvá", "lim"],
  ];
  const syllableColumnPositions: number[][] = [];
  for (const [index, columns] of syllableColumns.entries()) {
    const row = syllableTask.locator(".course-pair-row").nth(index);
    await expect(row.getByRole("button")).toHaveText(columns);
    syllableColumnPositions.push(await row.getByRole("button").evaluateAll((buttons) => buttons.map((button) => Math.round(button.getBoundingClientRect().x))));
  }
  expect(syllableColumnPositions.every((positions) => positions.length === 2 && positions.every((position, index) => position === syllableColumnPositions[0][index]))).toBe(true);
  const reviewTask = page.locator(".course-reinforcement fieldset").nth(5);
  await expect(reviewTask.getByText("Определите, что запускает сокращение в каждом слове.")).toBeVisible();
  await expect(reviewTask.locator("input")).toHaveCount(0);
  const triggerColumns = ["долгая гласная á", "дифтонг ie", "дифтонг ia", "долгого слога перед окончанием нет"];
  const triggerColumnPositions: number[][] = [];
  for (const [index, pair] of (practices[5].pairs ?? []).entries()) {
    const row = reviewTask.locator(".course-pair-row").nth(index);
    await expect(row.getByRole("button")).toHaveText(triggerColumns);
    triggerColumnPositions.push(await row.getByRole("button").evaluateAll((buttons) => buttons.map((button) => Math.round(button.getBoundingClientRect().x))));
    await row.getByRole("button", { name: pair.answer, exact: true }).click();
  }
  expect(triggerColumnPositions.every((positions) => positions.length === 4 && positions.every((position, index) => position === triggerColumnPositions[0][index]))).toBe(true);
  await reviewTask.getByRole("button", { name: "Проверить" }).click();
  await expect(reviewTask.locator(".course-pair-row.correct")).toHaveCount(5);

  await page.setViewportSize({ width: 600, height: 900 });
  const narrowTriggerPositions = await reviewTask.locator(".course-pair-row").evaluateAll((rows) => rows.map((row) => Array.from(row.querySelectorAll("button")).map((button) => Math.round(button.getBoundingClientRect().x))));
  expect(narrowTriggerPositions.every((positions) => positions.length === 4 && positions[0] === positions[2] && positions[1] === positions[3])).toBe(true);
});

test("Theme 6 renders its pair practice inside the material step", async ({ page }) => {
  const lesson = module1.lessons.find((item) => item.slug === "rhythmic-law");
  if (!lesson) throw new Error("Rhythmic law lesson is missing");
  const practice = lesson.stepPractices.find((item) => item.sectionIndex === 1);
  if (!practice) throw new Error("Theme 6 step 2 practice is missing");
  await mockStateApi(page, createState({
    selectedSlug: lesson.slug,
    progress: { [lesson.slug]: "in_progress" },
    lessonSteps: { [lesson.slug]: 1 },
  }));

  await openCourse(page);
  await openLesson(page, lesson);
  await expect(page.locator(".course-stepper")).toContainText("Шаг 2 из 5");
  const task = page.locator(".course-practice");
  await expect(task.getByText("Определите тип долготы в каждом слове.")).toBeVisible();
  await expect(task.locator(".course-pair-row")).toHaveCount(3);
  const check = task.getByRole("button", { name: "Проверить ответ" });
  await expect(check).toBeDisabled();

  const pairs = practice.pairs ?? [];
  for (let index = 0; index < pairs.length; index += 1) {
    await expect(task.locator(".course-pair-row").nth(index).getByRole("button")).toHaveText(["дифтонг", "долгая гласная"]);
  }
  await task.locator(".course-pair-row").nth(0).getByRole("button", { name: pairs[0].answer, exact: true }).click();
  await expect(check).toBeDisabled();
  for (let index = 1; index < pairs.length; index += 1) {
    await task.locator(".course-pair-row").nth(index).getByRole("button", { name: pairs[index].answer, exact: true }).click();
  }
  await expect(check).toBeEnabled();
  await check.click();
  await expect(task.locator(".course-pair-row.correct")).toHaveCount(3);
  await expect(page.getByRole("button", { name: "Следующий шаг →" })).toBeEnabled();
});

test("Theme 7 follows the greetings source and preserves its six progress steps", async ({ page }) => {
  const lesson = module1.lessons.find((item) => item.slug === "greetings");
  if (!lesson) throw new Error("Greetings lesson is missing");
  const lastPractice = lesson.stepPractices.find((practice) => practice.id === "greetings-step-6");
  if (!lastPractice) throw new Error("Theme 7 step 6 practice is missing");
  expect(lesson.sections.map((section) => section.title)).toEqual([
    "Формально или неформально",
    "Как спросить «как дела?»",
    "Первая встреча",
    "Как попрощаться",
    "Три готовых мини-диалога",
    "Частые ошибки",
  ]);
  expect(lesson.stepPractices.map((practice) => practice.id)).toEqual([
    "greetings-step-1",
    "greetings-step-2",
    "greetings-step-3",
    "greetings-step-4",
    "greetings-step-5",
    "greetings-step-6",
  ]);

  await mockStateApi(page, createState({
    selectedSlug: lesson.slug,
    progress: { [lesson.slug]: "in_progress" },
    lessonSteps: { [lesson.slug]: 5 },
    practiceAnswers: { [lastPractice.id]: lastPractice.answer },
    practiceResults: { [lastPractice.id]: true },
  }));

  await openCourse(page);
  await openLesson(page, lesson);
  await expect(page.locator(".course-stepper")).toContainText("Шаг 6 из 6");
  await expect(page.locator(".course-content-heading h4")).toHaveText("Частые ошибки");
  await page.getByRole("button", { name: "Перейти к финальному тесту →" }).click();

  await expect(page.locator(".course-current-task")).toContainText("Выполните шесть заданий темы 7");
  await expect(page.locator(".course-reinforcement fieldset")).toHaveCount(6);
  const practices = buildReinforcementPractices(lesson);

  const translationTask = page.locator(".course-reinforcement fieldset").nth(4);
  await expect(translationTask.getByText("Переведите реплики формального диалога.")).toBeVisible();
  await expect(translationTask.locator("input")).toHaveCount(4);
  for (const [index, pair] of (practices[4].pairs ?? []).entries()) {
    await translationTask.locator(".course-pair-row").nth(index).locator("input").fill(pair.answer);
  }
  await translationTask.getByRole("button", { name: "Проверить" }).click();
  await expect(translationTask.locator(".course-pair-row.correct")).toHaveCount(4);

  const dialogueTask = page.locator(".course-reinforcement fieldset").nth(5);
  await expect(dialogueTask.getByText("Соберите диалог первой встречи.")).toBeVisible();
  const orderedTokens = [...(practices[5].tokens ?? [])].sort((left, right) => practices[5].answer.indexOf(left) - practices[5].answer.indexOf(right));
  for (const token of orderedTokens) await dialogueTask.getByRole("button", { name: token, exact: true }).click();
  await dialogueTask.getByRole("button", { name: "Проверить" }).click();
  await expect(dialogueTask).toHaveClass(/correct/);
});

test("Theme 8 follows the self-introduction source and uses a six-task final test", async ({ page }) => {
  const lesson = module1.lessons.find((item) => item.slug === "introductions");
  if (!lesson) throw new Error("Introductions lesson is missing");
  const lastPractice = lesson.stepPractices.find((practice) => practice.id === "intro-step-6");
  if (!lastPractice) throw new Error("Theme 8 step 6 practice is missing");
  expect(lesson.sections.map((section) => section.title)).toEqual([
    "Имя и знакомство",
    "Откуда вы и где живёте",
    "Занятие и статус",
    "Языки и возраст",
    "Готовая самопрезентация",
    "Частые ошибки",
  ]);
  expect(lesson.stepPractices.map((practice) => practice.id)).toEqual([
    "intro-step-1",
    "intro-step-2",
    "intro-step-3",
    "intro-step-4",
    "intro-step-5",
    "intro-step-6",
  ]);

  await mockStateApi(page, createState({
    selectedSlug: lesson.slug,
    progress: { [lesson.slug]: "in_progress" },
    lessonSteps: { [lesson.slug]: 5 },
    practiceAnswers: { [lastPractice.id]: lastPractice.answer },
    practiceResults: { [lastPractice.id]: true },
  }));

  await openCourse(page);
  await openLesson(page, lesson);
  await expect(page.locator(".course-stepper")).toContainText("Шаг 6 из 6");
  await expect(page.locator(".course-content-heading h4")).toHaveText("Частые ошибки");
  await page.getByRole("button", { name: "Перейти к финальному тесту →" }).click();

  await expect(page.locator(".course-current-task")).toContainText("Выполните шесть заданий темы 8");
  await expect(page.locator(".course-reinforcement fieldset")).toHaveCount(6);
  const insertionTask = page.locator(".course-reinforcement fieldset").nth(1);
  await expect(insertionTask.getByText("Вставьте недостающую часть каждой модели.")).toBeVisible();
  await expect(insertionTask.locator("input")).toHaveCount(0);

  const practices = buildReinforcementPractices(lesson);
  const insertionPairs = practices[1].pairs ?? [];
  for (const [index, pair] of insertionPairs.entries()) {
    const row = insertionTask.locator(".course-pair-row").nth(index);
    const selected = index === 0 ? pair.options?.find((option) => option !== pair.answer) : pair.answer;
    if (!selected) throw new Error(`Theme 8 pair ${index + 1} has no selectable answer`);
    await row.getByRole("button", { name: selected, exact: true }).click();
  }
  await insertionTask.getByRole("button", { name: "Проверить" }).click();
  await expect(insertionTask.locator(".course-pair-row.incorrect")).toHaveCount(1);
  await expect(insertionTask.locator(".course-pair-row").first()).toContainText("Правильно: sa");

  await insertionTask.locator(".course-pair-row").first().getByRole("button", { name: "sa", exact: true }).click();
  await insertionTask.getByRole("button", { name: "Проверить" }).click();
  await expect(insertionTask.locator(".course-pair-row.correct")).toHaveCount(4);

  const translationTask = page.locator(".course-reinforcement fieldset").nth(4);
  await expect(translationTask.locator("input")).toHaveCount(4);
});

test("Theme 9 follows the communication-repair source and uses a six-task final test", async ({ page }) => {
  const lesson = module1.lessons.find((item) => item.slug === "communication-repair");
  if (!lesson) throw new Error("Communication-repair lesson is missing");
  const lastPractice = lesson.stepPractices.find((practice) => practice.id === "m1-communication-repair-step-5");
  if (!lastPractice) throw new Error("Theme 9 step 5 practice is missing");
  expect(lesson.sections.map((section) => section.title)).toEqual([
    "Скажите, что не поняли",
    "Попросите помочь с пониманием",
    "Уточните слово или информацию",
    "Готовые мини-диалоги",
    "Частые ошибки",
  ]);
  expect(lesson.stepPractices.map((practice) => practice.id)).toEqual([
    "m1-communication-repair-step-1",
    "m1-communication-repair-step-2",
    "m1-communication-repair-step-3",
    "m1-communication-repair-step-4",
    "m1-communication-repair-step-5",
  ]);

  await mockStateApi(page, createState({
    selectedSlug: lesson.slug,
    progress: { [lesson.slug]: "in_progress" },
    lessonSteps: { [lesson.slug]: 4 },
    practiceAnswers: { [lastPractice.id]: lastPractice.answer },
    practiceResults: { [lastPractice.id]: true },
  }));

  await openCourse(page);
  await openLesson(page, lesson);
  await expect(page.locator(".course-stepper")).toContainText("Шаг 5 из 5");
  await expect(page.locator(".course-content-heading h4")).toHaveText("Частые ошибки");
  await page.getByRole("button", { name: "Перейти к финальному тесту →" }).click();

  await expect(page.locator(".course-current-task")).toContainText("Выполните шесть заданий темы 9");
  await expect(page.locator(".course-reinforcement fieldset")).toHaveCount(6);
  const practices = buildReinforcementPractices(lesson);
  const insertionTask = page.locator(".course-reinforcement fieldset").nth(1);
  await expect(insertionTask.getByText("Вставьте недостающие слова.")).toBeVisible();
  await expect(insertionTask.locator("input")).toHaveCount(3);
  const insertionPairs = practices[1].pairs ?? [];
  for (const [index, pair] of insertionPairs.entries()) {
    await insertionTask.locator(".course-pair-row").nth(index).locator("input").fill(index === 0 ? "zopakovat" : pair.answer);
  }
  await insertionTask.getByRole("button", { name: "Проверить" }).click();
  await expect(insertionTask.locator(".course-pair-row.incorrect")).toHaveCount(1);
  await expect(insertionTask.locator(".course-pair-row").first()).toContainText("Правильно: zopakovať");

  await insertionTask.locator(".course-pair-row").first().locator("input").fill("zopakovať");
  await insertionTask.getByRole("button", { name: "Проверить" }).click();
  await expect(insertionTask.locator(".course-pair-row.correct")).toHaveCount(3);

  const translationTask = page.locator(".course-reinforcement fieldset").nth(4);
  await expect(translationTask.locator("input")).toHaveCount(3);
  const dialogueTask = page.locator(".course-reinforcement fieldset").nth(5);
  const orderedTokens = [...(practices[5].tokens ?? [])].sort((left, right) => practices[5].answer.indexOf(left) - practices[5].answer.indexOf(right));
  for (const token of orderedTokens) await dialogueTask.getByRole("button", { name: token, exact: true }).click();
  await dialogueTask.getByRole("button", { name: "Проверить" }).click();
  await expect(dialogueTask).toHaveClass(/correct/);
});

test("Theme 10 follows the numbers source and uses a six-task final test", async ({ page }) => {
  const lesson = module1.lessons.find((item) => item.slug === "numbers");
  if (!lesson) throw new Error("Numbers lesson is missing");
  const lastPractice = lesson.stepPractices.find((practice) => practice.id === "numbers-step-6");
  if (!lastPractice) throw new Error("Theme 10 step 6 practice is missing");
  expect(lesson.sections.map((section) => section.title)).toEqual([
    "Числа от 0 до 10",
    "От 11 до 20 и десятки",
    "Возраст и телефон",
    "Цены",
    "Банк чисел и полезных фраз",
    "Частые ошибки",
  ]);
  expect(lesson.stepPractices.map((practice) => practice.id)).toEqual([
    "numbers-step-1",
    "numbers-step-2",
    "numbers-step-3",
    "numbers-step-4",
    "numbers-step-5",
    "numbers-step-6",
  ]);

  await mockStateApi(page, createState({
    selectedSlug: lesson.slug,
    progress: { [lesson.slug]: "in_progress" },
    lessonSteps: { [lesson.slug]: 5 },
    practiceAnswers: { [lastPractice.id]: lastPractice.answer },
    practiceResults: { [lastPractice.id]: true },
  }));

  await openCourse(page);
  await openLesson(page, lesson);
  await expect(page.locator(".course-stepper")).toContainText("Шаг 6 из 6");
  await expect(page.locator(".course-content-heading h4")).toHaveText("Частые ошибки");
  await page.getByRole("button", { name: "Перейти к финальному тесту →" }).click();

  await expect(page.locator(".course-current-task")).toContainText("Выполните шесть заданий темы 10");
  await expect(page.locator(".course-reinforcement fieldset")).toHaveCount(6);
  const practices = buildReinforcementPractices(lesson);
  const spellingTask = page.locator(".course-reinforcement fieldset").first();
  await expect(spellingTask.getByText("Запишите цифры словами.")).toBeVisible();
  await expect(spellingTask.locator("input")).toHaveCount(5);
  const spellingPairs = practices[0].pairs ?? [];
  for (const [index, pair] of spellingPairs.entries()) {
    await spellingTask.locator(".course-pair-row").nth(index).locator("input").fill(index === 1 ? "styri" : pair.answer);
  }
  await spellingTask.getByRole("button", { name: "Проверить" }).click();
  await expect(spellingTask.locator(".course-pair-row.incorrect")).toHaveCount(1);
  await expect(spellingTask.locator(".course-pair-row").nth(1)).toContainText("Правильно: štyri");

  await spellingTask.locator(".course-pair-row").nth(1).locator("input").fill("štyri");
  await spellingTask.getByRole("button", { name: "Проверить" }).click();
  await expect(spellingTask.locator(".course-pair-row.correct")).toHaveCount(5);

  const digitsTask = page.locator(".course-reinforcement fieldset").nth(3);
  await expect(digitsTask.locator("input")).toHaveCount(5);
  await expect(digitsTask.locator(".course-slovak-keyboard")).toHaveCount(0);
  const situationsTask = page.locator(".course-reinforcement fieldset").nth(5);
  await expect(situationsTask.locator("input")).toHaveCount(0);
  for (const [index, pair] of (practices[5].pairs ?? []).entries()) {
    await situationsTask.locator(".course-pair-row").nth(index).getByRole("button", { name: pair.answer, exact: true }).click();
  }
  await situationsTask.getByRole("button", { name: "Проверить" }).click();
  await expect(situationsTask.locator(".course-pair-row.correct")).toHaveCount(3);
});

test("Module 2 opens as three topic groups and keeps the expanded lessons", async ({ page }) => {
  await mockStateApi(page, createState());
  await openCourse(page);

  await page.getByLabel("Выберите учебный модуль").selectOption("2");
  await expect(page.getByRole("heading", { name: module2.title })).toBeVisible();
  await expect(page.locator(".course-group-card")).toHaveCount(3);
  await expect(page.getByText("Род существительных", { exact: true })).toBeVisible();
  await expect(page.getByText("Число и словарная форма", { exact: true })).toBeVisible();
  await expect(page.getByText("Называние и наличие", { exact: true })).toBeVisible();

  await page.locator(".course-group-card").filter({ hasText: "Род существительных" }).click();
  await expect(page.locator(".course-topic-grid .course-topic-card")).toHaveCount(3);
  await page.getByRole("button", { name: new RegExp(module2.lessons[0].title) }).first().click();
  await expect(page.locator(".course-material-heading h3")).toHaveText(module2.lessons[0].title);
  await expect(page.locator(".course-practice")).toBeVisible();
});

test("saved Module 2 lesson and progress are restored from the shared state", async ({ page }) => {
  const lesson = module2.lessons[3];
  await mockStateApi(page, createState({
    activeModule: 2,
    selectedSlug: lesson.slug,
    progress: { [lesson.slug]: "in_progress" },
    lessonSteps: { [lesson.slug]: 1 },
  }));

  const restored = page.waitForResponse((response) =>
    response.url().includes("/api/v1/course/state") && response.request().method() === "GET",
  );
  await page.goto("/");
  await restored;

  await expect(page.getByRole("heading", { name: module2.title })).toBeVisible();
  await expect(page.getByLabel("Выберите учебный модуль")).toHaveValue("2");
  const group = module2.topicGroups?.find((item) => item.lessonSlugs.includes(lesson.slug));
  if (!group) throw new Error(`Lesson ${lesson.slug} is not assigned to a Module 2 topic group`);
  await page.locator(".course-group-card").filter({ hasText: group.title }).click();
  await expect(page.getByRole("button", { name: new RegExp(lesson.title) }).first()).toContainText("В процессе");
});

test("Module 3 opens as three topic groups and restores saved progress", async ({ page }) => {
  const lesson = module3.lessons[2];
  await mockStateApi(page, createState({
    activeModule: 3,
    selectedSlug: lesson.slug,
    progress: { [lesson.slug]: "in_progress" },
    lessonSteps: { [lesson.slug]: 1 },
  }));

  const restored = page.waitForResponse((response) =>
    response.url().includes("/api/v1/course/state") && response.request().method() === "GET",
  );
  await page.goto("/");
  await restored;

  await expect(page.getByRole("heading", { name: module3.title })).toBeVisible();
  await expect(page.getByLabel("Выберите учебный модуль")).toHaveValue("3");
  await expect(page.locator(".course-group-card")).toHaveCount(3);
  await expect(page.getByText("Согласование", { exact: true })).toBeVisible();
  await expect(page.getByText("Указание и описание", { exact: true })).toBeVisible();
  await expect(page.getByText("Выбор и связная фраза", { exact: true })).toBeVisible();

  const group = module3.topicGroups?.find((item) => item.lessonSlugs.includes(lesson.slug));
  if (!group) throw new Error(`Lesson ${lesson.slug} is not assigned to a Module 3 topic group`);
  await page.locator(".course-group-card").filter({ hasText: group.title }).click();
  const lessonButton = page.getByRole("button", { name: new RegExp(lesson.title) }).first();
  await expect(lessonButton).toContainText("В процессе");
  await lessonButton.click();
  await expect(page.locator(".course-material-heading h3")).toHaveText(lesson.title);
  await expect(page.locator(".course-practice")).toBeVisible();
});

test("Module 4 opens as four topic groups and restores saved progress", async ({ page }) => {
  const lesson = module4.lessons[7];
  await mockStateApi(page, createState({ activeModule: 4, selectedSlug: lesson.slug, progress: { [lesson.slug]: "in_progress" }, lessonSteps: { [lesson.slug]: 2 } }));
  const restored = page.waitForResponse((response) => response.url().includes("/api/v1/course/state") && response.request().method() === "GET");
  await page.goto("/");
  await restored;

  await expect(page.getByRole("heading", { name: module4.title })).toBeVisible();
  await expect(page.getByLabel("Выберите учебный модуль")).toHaveValue("4");
  await expect(page.locator(".course-group-card")).toHaveCount(4);
  for (const title of ["Субъект и прямой объект", "Место и направление", "Количество и отсутствие", "Управление и готовые модели"]) {
    await expect(page.getByText(title, { exact: true })).toBeVisible();
  }
  const group = module4.topicGroups?.find((item) => item.lessonSlugs.includes(lesson.slug));
  if (!group) throw new Error(`Lesson ${lesson.slug} is not assigned to a Module 4 topic group`);
  await page.locator(".course-group-card").filter({ hasText: group.title }).click();
  const lessonButton = page.getByRole("button", { name: new RegExp(lesson.title) }).first();
  await expect(lessonButton).toContainText("В процессе");
  await lessonButton.click();
  await expect(page.locator(".course-material-heading h3")).toHaveText(lesson.title);
  await expect(page.locator(".course-practice")).toBeVisible();
});

test("Module 5 opens as four topic groups and restores saved progress", async ({ page }) => {
  const lesson = module5.lessons[8];
  await mockStateApi(page, createState({ activeModule: 5, selectedSlug: lesson.slug, progress: { [lesson.slug]: "in_progress" }, lessonSteps: { [lesson.slug]: 3 } }));
  const restored = page.waitForResponse((response) => response.url().includes("/api/v1/course/state") && response.request().method() === "GET");
  await page.goto("/");
  await restored;

  await expect(page.getByRole("heading", { name: module5.title })).toBeVisible();
  await expect(page.getByLabel("Выберите учебный модуль")).toHaveValue("5");
  await expect(page.locator(".course-group-card")).toHaveCount(4);
  for (const title of ["Настоящее время", "Возвратность, отрицание и вопрос", "Желание, возможность и необходимость", "Просьбы и инструкции"]) {
    await expect(page.getByText(title, { exact: true })).toBeVisible();
  }
  const group = module5.topicGroups?.find((item) => item.lessonSlugs.includes(lesson.slug));
  if (!group) throw new Error(`Lesson ${lesson.slug} is not assigned to a Module 5 topic group`);
  await page.locator(".course-group-card").filter({ hasText: group.title }).click();
  const lessonButton = page.getByRole("button", { name: new RegExp(lesson.title) }).first();
  await expect(lessonButton).toContainText("В процессе");
  await lessonButton.click();
  await expect(page.locator(".course-material-heading h3")).toHaveText(lesson.title);
  await expect(page.locator(".course-practice")).toBeVisible();
});

test("Module 6 opens as five topic groups and restores saved progress", async ({ page }) => {
  const lesson = module6.lessons[14];
  await mockStateApi(page, createState({ activeModule: 6, selectedSlug: lesson.slug, progress: { [lesson.slug]: "in_progress" }, lessonSteps: { [lesson.slug]: 2 } }));
  const restored = page.waitForResponse((response) => response.url().includes("/api/v1/course/state") && response.request().method() === "GET");
  await page.goto("/");
  await restored;
  await expect(page.getByRole("heading", { name: module6.title })).toBeVisible();
  await expect(page.getByLabel("Выберите учебный модуль")).toHaveValue("6");
  await expect(page.locator(".course-group-card")).toHaveCount(5);
  const group = module6.topicGroups?.find((item) => item.lessonSlugs.includes(lesson.slug));
  if (!group) throw new Error(`Lesson ${lesson.slug} is not assigned to Module 6`);
  await page.locator(".course-group-card").filter({ hasText: group.title }).click();
  const lessonButton = page.getByRole("button", { name: new RegExp(lesson.title) }).first();
  await expect(lessonButton).toContainText("В процессе");
  await lessonButton.click();
  await expect(page.locator(".course-practice")).toBeVisible();
});

test("lesson reinforcement is deterministic and does not call AI", async ({ page }) => {
  const lesson = module1.lessons[0];
  await mockStateApi(page, createState({
    selectedSlug: lesson.slug,
    progress: { [lesson.slug]: "in_progress" },
    lessonSteps: { [lesson.slug]: lesson.sections.length },
    checkSelections: Object.fromEntries(lesson.knowledgeChecks.map((check) => [check.id, check.answer])),
  }));

  let aiCalls = 0;
  await page.route("**/api/v1/tutor/module1-chat", async (route) => {
    aiCalls += 1;
    await route.abort();
  });

  await openCourse(page);
  await openLesson(page, lesson);

  const finish = page.getByRole("button", { name: "Завершить задания и получить итог →" });
  const checkAll = page.getByRole("button", { name: "Проверить всё" });
  await expect(page.locator(".course-current-task").getByText("Практика из PDF")).toBeVisible();
  await expect(page.locator(".course-reinforcement fieldset")).toHaveCount(6);
  await expect(page.locator(".course-reinforcement fieldset").nth(2).locator(".course-pair-row")).toHaveCount(4);
  await expect(page.locator(".course-reinforcement fieldset").nth(4).locator(".course-pair-row")).toHaveCount(6);
  await expect(page.locator(".course-reinforcement fieldset").nth(4).getByLabel("чай", { exact: true })).toBeVisible();
  const reinforcementTasks = buildReinforcementPractices(lesson);
  const normalizedAnswers = reinforcementTasks.map((practice) => practice.answer.normalize("NFC").toLocaleLowerCase("sk").replace(/\p{P}+/gu, " ").replace(/\s+/g, " ").trim());
  expect(new Set(normalizedAnswers).size).toBe(6);
  for (const [taskIndex, practice] of reinforcementTasks.entries()) {
    if (practice.type === "order") await expect(page.locator(".course-reinforcement fieldset").nth(taskIndex).locator(".course-check-options button")).not.toHaveCount(1);
  }
  await expect(finish).toBeDisabled();
  await expect(checkAll).toBeDisabled();

  const fieldset = page.locator(".course-reinforcement fieldset").first();
  await fieldset.getByRole("button", { name: "dom", exact: true }).click();
  await fieldset.getByRole("button", { name: "Проверить" }).click();
  await expect(fieldset.getByText(/Пока неверно|Почти/)).toBeVisible();
  await fieldset.getByRole("button", { name: "Очистить" }).click();
  await expect(finish).toBeDisabled();

  const transcriptionTask = page.locator(".course-reinforcement fieldset").nth(2);
  const transcriptionPractice = reinforcementTasks[2];
  for (const pair of transcriptionPractice.pairs ?? []) {
    if (!pair.prompt.startsWith("ja ")) await transcriptionTask.getByLabel(pair.prompt, { exact: true }).fill(pair.answer);
  }
  await expect(transcriptionTask.getByLabel("Словацкие буквы")).toHaveCount(0);
  for (const acceptedJa of ["я", "йа", "я(йа)"]) {
    await transcriptionTask.getByLabel("ja — было «жа»", { exact: true }).fill(acceptedJa);
    await transcriptionTask.getByRole("button", { name: "Проверить" }).click();
    await expect(transcriptionTask).toHaveClass(/correct/);
  }

  const translationTask = page.locator(".course-reinforcement fieldset").nth(4);
  for (const pair of reinforcementTasks[4].pairs ?? []) {
    await translationTask.getByLabel(pair.prompt, { exact: true }).fill(pair.prompt === "чай" ? "caj" : pair.answer);
  }
  await translationTask.getByRole("button", { name: "Проверить" }).click();
  await expect(translationTask.locator(".course-pair-row").first()).toHaveClass(/incorrect/);
  await expect(translationTask.locator(".course-pair-row").first()).toContainText("Правильно: čaj");

  for (const [index, practice] of reinforcementTasks.entries()) {
    const answer = practice.answer;
    const task = page.locator(".course-reinforcement fieldset").nth(index);
    if (practice.type === "choice") {
      const option = task.getByRole("button", { name: answer, exact: true });
      await option.click();
      await expect(option).toHaveClass(/selected/);
    }
    if (practice.type === "text") {
      const input = task.getByPlaceholder("Введите ответ");
      await input.fill(answer);
      await expect(input).toHaveValue(answer);
    }
    if (practice.type === "order") {
      const normalizedAnswer = answer.toLocaleLowerCase("sk").replace(/\p{P}+/gu, " ");
      const orderedTokens = [...(practice.tokens ?? [])]
        .filter((token) => normalizedAnswer.includes(token.toLocaleLowerCase("sk").replace(/\p{P}+/gu, "")))
        .sort((left, right) => normalizedAnswer.indexOf(left.toLocaleLowerCase("sk").replace(/\p{P}+/gu, "")) - normalizedAnswer.indexOf(right.toLocaleLowerCase("sk").replace(/\p{P}+/gu, "")));
      for (const token of orderedTokens) await task.getByRole("button", { name: token, exact: true }).first().click();
    }
    if (practice.type === "pairs") {
      for (const pair of practice.pairs ?? []) {
        if (pair.options?.length) await task.getByRole("button", { name: pair.answer, exact: true }).click();
        else await task.getByLabel(pair.prompt, { exact: true }).fill(pair.answer);
      }
    }
  }
  await expect(checkAll).toBeEnabled();
  await checkAll.click();
  await expect(page.locator(".course-reinforcement fieldset.correct")).toHaveCount(6);
  await expect(finish).toBeEnabled();
  await finish.click();

  await expect(page.getByRole("heading", { name: /понимание|основа|повторение/i })).toBeVisible();
  await expect(page.getByText("закрепление: 6/6", { exact: false })).toBeVisible();
  expect(aiCalls).toBe(0);
});

test("reinforcement Slovak keyboard inserts at the caret and replaces a selection", async ({ page }) => {
  const lesson = module1.lessons[0];
  await mockStateApi(page, createState({
    selectedSlug: lesson.slug,
    progress: { [lesson.slug]: "in_progress" },
    lessonSteps: { [lesson.slug]: lesson.sections.length },
    checkSelections: Object.fromEntries(lesson.knowledgeChecks.map((check) => [check.id, check.answer])),
  }));

  await openCourse(page);
  await openLesson(page, lesson);
  const textTask = page.locator(".course-reinforcement-text").first();
  const input = textTask.getByPlaceholder("Введите ответ");
  await input.fill("caj");
  await input.evaluate((element: HTMLInputElement) => element.setSelectionRange(1, 1));
  const keyboard = textTask.getByLabel("Словацкие буквы");
  await expect(keyboard).toBeVisible();
  await keyboard.getByRole("button", { name: "č", exact: true }).click();
  await expect(input).toHaveValue("cčaj");
  await expect(input).toBeFocused();
  await input.evaluate((element: HTMLInputElement) => element.setSelectionRange(1, 3));
  await keyboard.getByRole("button", { name: "á", exact: true }).click();
  await expect(input).toHaveValue("cáj");

  const pairTask = page.locator(".course-pair-practice").filter({ has: page.locator("input") }).filter({ has: page.getByLabel("Словацкие буквы") }).first();
  const pairInput = pairTask.locator("input").first();
  await pairInput.fill("caj");
  await pairInput.evaluate((element: HTMLInputElement) => element.setSelectionRange(1, 1));
  await pairTask.getByLabel("Словацкие буквы").getByRole("button", { name: "á", exact: true }).click();
  await expect(pairInput).toHaveValue("cáaj");
});

test("saved duplicate mistakes render once without React key errors", async ({ page }) => {
  const lesson = module1.lessons.find((item) => item.slug === "verb-byt");
  if (!lesson) throw new Error("Verb byť lesson is missing");
  const duplicate = "Соберите «Вчера я был дома». → нормативно: Včera som bol doma.";
  const consoleErrors: string[] = [];
  page.on("console", (message) => { if (message.type() === "error") consoleErrors.push(message.text()); });
  await mockStateApi(page, createState({
    selectedSlug: lesson.slug,
    progress: { [lesson.slug]: "completed" },
    lessonSummaries: { [lesson.slug]: { understanding: 90, level: "Уверенное понимание", strengths: ["Задания выполнены"], mistakes: [duplicate, duplicate], review: ["Повторить формы"], userTurns: 6 } },
  }));

  await openCourse(page);
  await openLesson(page, lesson);
  await page.getByRole("button", { name: "Закрепление" }).click();
  await expect(page.getByText(duplicate, { exact: true })).toHaveCount(1);
  expect(consoleErrors.filter((message) => message.includes("same key"))).toEqual([]);
});

test("missing Slovak diacritics does not complete a required answer", async ({ page }) => {
  const lesson = module1.lessons.find((item) => item.slug === "slovak-alphabet-pronunciation");
  if (!lesson) throw new Error("Alphabet lesson is missing");
  await mockStateApi(page, createState({
    selectedSlug: lesson.slug,
    lessonSteps: { [lesson.slug]: 1 },
  }));

  await openCourse(page);
  await openLesson(page, lesson);

  const answer = page.getByPlaceholder("Введите ответ по-словацки");
  const next = page.getByRole("button", { name: "Следующий шаг →" });
  await answer.fill("skola");
  await page.getByRole("button", { name: "Проверить ответ" }).click();
  await expect(page.getByText("Почти — проверьте диакритику")).toBeVisible();
  await expect(page.getByText("Нормативный ответ: škola")).toBeVisible();
  await expect(next).toBeDisabled();

  await answer.fill("škola");
  await page.getByRole("button", { name: "Проверить ответ" }).click();
  await expect(page.getByText("Верно — можно идти дальше")).toBeVisible();
  await expect(next).toBeEnabled();
});

test("optional section can be skipped while a required section gates progress", async ({ page }) => {
  const lesson = module1.lessons.find((item) => item.slug === "long-short-vowels");
  if (!lesson) throw new Error("Vowel lesson is missing");
  const optionalIndex = lesson.sections.findIndex((section) => section.importance === "extra");
  if (optionalIndex < 0) throw new Error("Optional section is missing");
  await mockStateApi(page, createState({
    selectedSlug: lesson.slug,
    lessonSteps: { [lesson.slug]: optionalIndex },
  }));

  await openCourse(page);
  await openLesson(page, lesson);
  await expect(page.getByText("Дополнительное углубление")).toBeVisible();
  await expect(page.getByText("Этот раздел можно пропустить", { exact: false })).toBeVisible();
  await expect(page.getByRole("button", { name: "Пропустить дополнительный шаг →" })).toBeEnabled();

  await page.getByRole("button", { name: "Открыть шаг 2" }).click();
  await expect(page.getByText("Обязательная практика")).toBeVisible();
  await expect(page.getByRole("button", { name: "Следующий шаг →" })).toBeDisabled();
  await expect(page.getByText("Выполните обязательную практику шага, чтобы продолжить.")).toBeVisible();
});

test("final test shows review topics below 70 percent and passes after corrections", async ({ page }) => {
  const finalQuestions = buildModuleFinalQuestions(module1.lessons);
  await mockStateApi(page, createState({
    progress: Object.fromEntries(module1.lessons.map((lesson) => [lesson.slug, "completed"])),
    finalSelections: Object.fromEntries(finalQuestions.map((question) => [question.id, "__wrong__"])),
    finalCompleted: true,
    finalCompletedModules: { "1": true },
  }));

  await openCourse(page);
  await page.getByRole("button", { name: /Итоговый тест модуля/ }).click();
  await expect(page.getByText("Порог пока не достигнут")).toBeVisible();
  await expect(page.getByText("Что повторить перед новой попыткой")).toBeVisible();
  await expect(page.getByText("Для сдачи нужно не менее 70%", { exact: false })).toBeVisible();

  for (const question of finalQuestions) {
    const fieldset = page.locator(".course-final fieldset").filter({ hasText: question.lessonTitle }).filter({ hasText: question.question });
    await fieldset.getByRole("button", { name: question.answer, exact: true }).click();
  }
  await page.getByRole("button", { name: "Проверить итоговый тест" }).click();
  await expect(page.getByText("Модуль сдан")).toBeVisible();
  await expect(page.getByText("100%")).toBeVisible();
  await expect(page.getByRole("button", { name: "Перейти к Module 2 →" })).toBeVisible();
});
