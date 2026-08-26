import { expect, test, type Page } from "@playwright/test";

import { a1CourseModules, allA1Lessons, getA1Module } from "../../app/data/a1Course";
import { buildInitialProgress, filterKnownLessonSlugs, orderedModuleLessons, topicGroupLessons } from "../../app/data/courseEngine";
import type { BetaLesson } from "../../app/data/courseTypes";
import type { Module1BetaState } from "../../app/lib/api";
import { buildModuleFinalQuestions, buildReinforcementPractices } from "../../app/components/Module1BetaScreen";
import { contentVocabulary } from "../../app/components/Module1BetaVocabulary";

const module1 = getA1Module(1);

test("course structure has stable unique identifiers and data-driven ordering", () => {
  const lessonSlugs = allA1Lessons.map((lesson) => lesson.slug);
  const activityIds = allA1Lessons.flatMap((lesson) => [
    ...lesson.stepPractices.map((practice) => practice.id),
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

test("progress and vocabulary ignore unknown or duplicate lesson slugs", () => {
  const knownSlug = allA1Lessons[0].slug;
  expect(Object.keys(buildInitialProgress(a1CourseModules))).toEqual(allA1Lessons.map((lesson) => lesson.slug));
  expect(filterKnownLessonSlugs(a1CourseModules, [knownSlug, "removed-lesson", knownSlug])).toEqual([knownSlug]);
  expect(contentVocabulary([knownSlug, "removed-lesson"]).every((item) => item.lesson_slug === knownSlug)).toBe(true);
  expect(contentVocabulary([knownSlug])).not.toHaveLength(0);
});

test("every Module 1 reinforcement set has six different answers", () => {
  for (const lesson of module1.lessons) {
    const practices = buildReinforcementPractices(lesson);
    const answers = practices.map((practice) => practice.answer.normalize("NFC").toLocaleLowerCase("sk").replace(/\p{P}+/gu, " ").replace(/\s+/g, " ").trim());
    expect(practices, lesson.slug).toHaveLength(6);
    expect(new Set(answers).size, lesson.slug).toBe(6);
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

test("Module 1 final test does not repeat normative answers", () => {
  const questions = buildModuleFinalQuestions(module1.lessons);
  const answers = questions.map((question) => question.answer.normalize("NFC").toLocaleLowerCase("sk").replace(/\p{P}+/gu, " ").replace(/\s+/g, " ").trim());
  expect(new Set(answers).size).toBe(answers.length);
  expect(questions.filter((question) => question.lessonSlug === "soft-hard-consonants").map((question) => question.answer)).not.toContain("žena");
});

function createState(overrides: Partial<Module1BetaState> = {}): Module1BetaState {
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

async function mockStateApi(page: Page, initialState: Module1BetaState): Promise<void> {
  let state = structuredClone(initialState);
  await page.route("**/api/v1/module1-beta/state", async (route) => {
    if (route.request().method() === "PUT") {
      state = route.request().postDataJSON() as Module1BetaState;
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
    response.url().includes("/api/v1/module1-beta/state") && response.request().method() === "GET",
  );
  await page.goto("/");
  await restored;
  await expect(page.getByRole("heading", { name: module1.title })).toBeVisible();
  await expect(page.locator(".module-beta-persistence-error")).toHaveCount(0);
}

async function openLesson(page: Page, lesson: BetaLesson): Promise<void> {
  const groupTitle = module1.topicGroups?.find((group) => group.lessonSlugs.includes(lesson.slug))?.title;
  if (!groupTitle) throw new Error(`Lesson ${lesson.slug} is not assigned to a topic group`);
  await page.locator(".module-beta-group-card").filter({ hasText: groupTitle }).click();
  await page.getByRole("button", { name: new RegExp(lesson.title) }).first().click();
  await expect(page.locator(".module-beta-material-heading h3")).toHaveText(lesson.title);
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

test("alphabet section groups the first six lessons as cards", async ({ page }) => {
  await mockStateApi(page, createState());
  await openCourse(page);

  const alphabetCard = page.locator(".module-beta-group-card");
  await expect(alphabetCard).toHaveCount(4);
  await expect(page.getByText("Знакомство и общение", { exact: true })).toBeVisible();
  await expect(page.getByText("Числа и календарь", { exact: true })).toBeVisible();
  await expect(page.getByText("Базовая грамматика", { exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: new RegExp(module1.lessons[0].title) })).toHaveCount(0);
  await alphabetCard.filter({ hasText: "Алфавит" }).click();

  await expect(page.getByRole("heading", { name: "Алфавит" })).toBeVisible();
  await expect(page.locator(".module-beta-topic-grid .module-beta-topic-card")).toHaveCount(6);
  await expect(page.locator(".module-beta-topic-number")).toHaveText(["01", "02", "03", "04", "05", "06"]);
  for (const lesson of module1.lessons.slice(0, 6)) await expect(page.getByRole("button", { name: new RegExp(lesson.title) })).toBeVisible();
  await page.getByRole("button", { name: "← К разделам" }).click();
  await expect(alphabetCard).toHaveCount(4);
  for (const [title, count, numbers] of [["Знакомство и общение", 3, ["07", "08", "09"]], ["Числа и календарь", 2, ["10", "11"]], ["Базовая грамматика", 3, ["12", "13", "14"]]] as const) {
    await page.locator(".module-beta-group-card").filter({ hasText: title }).click();
    await expect(page.getByRole("heading", { name: title })).toBeVisible();
    await expect(page.locator(".module-beta-topic-grid .module-beta-topic-card")).toHaveCount(count);
    await expect(page.locator(".module-beta-topic-number")).toHaveText(numbers);
    await page.getByRole("button", { name: "← К разделам" }).click();
  }
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
  await page.getByRole("button", { name: "Перейти к закреплению →" }).click();

  const finish = page.getByRole("button", { name: "Завершить закрепление и получить итог" });
  const checkAll = page.getByRole("button", { name: "Проверить всё" });
  await expect(page.locator(".module-beta-current-task").getByText("Закрепление темы")).toBeVisible();
  await expect(page.locator(".module-beta-reinforcement fieldset")).toHaveCount(6);
  const reinforcementTasks = buildReinforcementPractices(lesson);
  const normalizedAnswers = reinforcementTasks.map((practice) => practice.answer.normalize("NFC").toLocaleLowerCase("sk").replace(/\p{P}+/gu, " ").replace(/\s+/g, " ").trim());
  expect(new Set(normalizedAnswers).size).toBe(6);
  for (const [taskIndex, practice] of reinforcementTasks.entries()) {
    if (practice.type === "order") await expect(page.locator(".module-beta-reinforcement fieldset").nth(taskIndex).locator(".module-beta-check-options button")).not.toHaveCount(1);
  }
  await expect(finish).toBeDisabled();
  await expect(checkAll).toBeDisabled();

  const firstCheck = lesson.finalChecks[0];
  const wrongOption = firstCheck.options.find((option) => option !== firstCheck.answer);
  if (!wrongOption) throw new Error("Reinforcement check needs a wrong option");
  const fieldset = page.locator(".module-beta-reinforcement fieldset").first();
  await fieldset.getByRole("button", { name: wrongOption, exact: true }).click();
  await fieldset.getByRole("button", { name: "Проверить" }).click();
  await expect(fieldset.getByText(/Пока неверно|Почти/)).toBeVisible();
  await expect(finish).toBeDisabled();

  for (const [index, practice] of reinforcementTasks.entries()) {
    const answer = practice.answer;
    const task = page.locator(".module-beta-reinforcement fieldset").nth(index);
    if (practice.type === "choice") {
      const option = task.getByRole("button", { name: answer, exact: true });
      await option.click();
      await expect(option).toHaveClass(/selected/);
    }
    if (practice.type === "text") {
      const input = task.getByPlaceholder("Введите ответ по-словацки");
      await input.fill(answer);
      await expect(input).toHaveValue(answer);
    }
    if (practice.type === "order") {
      const normalizedAnswer = answer.toLocaleLowerCase("sk").replace(/\p{P}+/gu, " ");
      const orderedTokens = [...(practice.tokens ?? [])].sort((left, right) => normalizedAnswer.indexOf(left.toLocaleLowerCase("sk").replace(/\p{P}+/gu, "")) - normalizedAnswer.indexOf(right.toLocaleLowerCase("sk").replace(/\p{P}+/gu, "")));
      for (const token of orderedTokens) await task.getByRole("button", { name: token, exact: true }).first().click();
    }
  }
  await expect(checkAll).toBeEnabled();
  await checkAll.click();
  await expect(page.locator(".module-beta-reinforcement fieldset.correct")).toHaveCount(6);
  await expect(finish).toBeEnabled();
  await finish.click();

  await expect(page.getByRole("heading", { name: /понимание|основа|повторение/i })).toBeVisible();
  await expect(page.getByText("закрепление: 6/6", { exact: false })).toBeVisible();
  expect(aiCalls).toBe(0);
});

test("reinforcement text tasks show the Slovak keyboard", async ({ page }) => {
  const lesson = module1.lessons[0];
  await mockStateApi(page, createState({
    selectedSlug: lesson.slug,
    progress: { [lesson.slug]: "in_progress" },
    lessonSteps: { [lesson.slug]: lesson.sections.length },
    checkSelections: Object.fromEntries(lesson.knowledgeChecks.map((check) => [check.id, check.answer])),
  }));

  await openCourse(page);
  await openLesson(page, lesson);
  await page.getByRole("button", { name: "Перейти к закреплению →" }).click();
  const textTask = page.locator(".module-beta-reinforcement fieldset").nth(1);
  const input = textTask.getByPlaceholder("Введите ответ по-словацки");
  await input.focus();
  const keyboard = textTask.getByLabel("Словацкие буквы");
  await expect(keyboard).toBeVisible();
  await keyboard.getByRole("button", { name: "č", exact: true }).click();
  await expect(input).toHaveValue("č");
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
    const fieldset = page.locator(".module-beta-final fieldset").filter({ hasText: question.lessonTitle }).filter({ hasText: question.question });
    await fieldset.getByRole("button", { name: question.answer, exact: true }).click();
  }
  await page.getByRole("button", { name: "Проверить итоговый тест" }).click();
  await expect(page.getByText("Модуль сдан")).toBeVisible();
  await expect(page.getByText("100%")).toBeVisible();
  await expect(page.getByRole("button", { name: "Перейти к Module 2 →" })).toBeVisible();
});
