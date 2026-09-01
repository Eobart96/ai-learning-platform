import type { A1CoverageItem } from "./a1CefrCoverage";
import { defaultContentRequirements, type CourseModule, type ModuleContentRequirements, type StepPractice } from "./courseTypes";

function normalizeAnswer(value: string): string {
  return value.normalize("NFC").toLocaleLowerCase("sk").replace(/\p{P}+/gu, " ").replace(/\s+/gu, " ").trim();
}

function withoutDiacritics(value: string): string {
  return value.normalize("NFD").replace(/\p{M}+/gu, "");
}

function validatePractice(practice: StepPractice): void {
  if (!practice.id.trim() || !practice.prompt.trim() || !practice.answer.trim() || !practice.hint.trim() || !practice.explanation.trim()) {
    throw new Error(`Неполное задание: ${practice.id || "без id"}`);
  }
  if (practice.type === "choice") {
    if (!practice.options || practice.options.length < 2 || new Set(practice.options).size !== practice.options.length) throw new Error(`Неверные варианты выбора: ${practice.id}`);
    if (!practice.options.includes(practice.answer)) throw new Error(`Ответ отсутствует среди вариантов: ${practice.id}`);
  }
  if (practice.type === "order" && (!practice.tokens || practice.tokens.length < 2 || practice.tokens.some((token) => !token.trim()))) {
    throw new Error(`Неверные токены порядка: ${practice.id}`);
  }
  if (practice.type === "pairs") {
    if (!practice.pairs?.length) throw new Error(`Пустое парное задание: ${practice.id}`);
    const prompts = new Set<string>();
    for (const pair of practice.pairs) {
      if (!pair.prompt.trim() || !pair.answer.trim()) throw new Error(`Неполная пара: ${practice.id}`);
      if (prompts.has(pair.prompt)) throw new Error(`Повтор условия пары: ${practice.id}/${pair.prompt}`);
      prompts.add(pair.prompt);
      if (pair.options && (!pair.options.includes(pair.answer) || new Set(pair.options).size !== pair.options.length)) throw new Error(`Неверные варианты пары: ${practice.id}/${pair.prompt}`);
    }
  }
}

export function validateCourseModules(modules: CourseModule[], coverage: A1CoverageItem[]): void {
  if (!modules.length) throw new Error("Курс не содержит модулей");
  const moduleSlugs = new Set<string>();
  const lessonSlugs = new Set<string>();
  const activityIds = new Set<string>();

  for (const [moduleIndex, module] of modules.entries()) {
    if (module.order !== moduleIndex + 1) throw new Error(`Нарушен порядок модулей: ${module.slug}`);
    if (moduleSlugs.has(module.slug)) throw new Error(`Повтор slug модуля: ${module.slug}`);
    moduleSlugs.add(module.slug);
    if (!module.lessons.length) throw new Error(`Пустой модуль: ${module.slug}`);

    const requirements: ModuleContentRequirements = { ...defaultContentRequirements, ...module.contentRequirements };
    for (const [lessonIndex, lesson] of module.lessons.entries()) {
      if (lesson.order !== lessonIndex + 1) throw new Error(`Нарушен порядок тем: ${module.slug}/${lesson.slug}`);
      if (lessonSlugs.has(lesson.slug)) throw new Error(`Повтор slug темы: ${lesson.slug}`);
      lessonSlugs.add(lesson.slug);
      if (!lesson.description.trim() || lesson.goals.length < 2) throw new Error(`Неполный урок: ${lesson.slug}`);
      if (!lesson.theory.summary.trim() || lesson.theory.rules.length < requirements.minTheoryRules || lesson.theory.examples.length < requirements.minTheoryExamples) throw new Error(`Неполная теория: ${lesson.slug}`);
      if (lesson.sections.length < requirements.minSections) throw new Error(`Недостаточно разделов: ${lesson.slug}`);
      if (lesson.sections.filter((section) => section.importance !== "extra").length < requirements.minCoreSections) throw new Error(`Недостаточно обязательных разделов: ${lesson.slug}`);
      if (lesson.stepPractices.length < requirements.minStepPractices) throw new Error(`Недостаточно практики: ${lesson.slug}`);
      if (lesson.knowledgeChecks.length < requirements.minKnowledgeChecks || lesson.finalChecks.length < requirements.minFinalChecks) throw new Error(`Недостаточно проверок: ${lesson.slug}`);
      for (const section of lesson.sections) {
        const hasContent = Boolean(section.paragraphs?.length || section.items?.length || section.table?.rows.length || section.note?.trim());
        if (!section.title.trim() || !hasContent) throw new Error(`Пустой раздел: ${lesson.slug}/${section.title || "без названия"}`);
        if (section.table && (!section.table.headers.length || section.table.rows.some((row) => row.length !== section.table?.headers.length))) throw new Error(`Неверная таблица: ${lesson.slug}/${section.title}`);
      }

      const coveredSections = new Set(lesson.stepPractices.map((practice) => practice.sectionIndex));
      if (requirements.requirePracticeForEverySection && coveredSections.size !== lesson.sections.length) throw new Error(`Не каждый раздел имеет практику: ${lesson.slug}`);
      for (const activity of [...lesson.stepPractices, ...(lesson.reinforcementPractices ?? []), ...lesson.knowledgeChecks, ...lesson.finalChecks]) {
        if (activityIds.has(activity.id)) throw new Error(`Повтор id задания: ${activity.id}`);
        activityIds.add(activity.id);
      }
      for (const practice of [...lesson.stepPractices, ...(lesson.reinforcementPractices ?? [])]) {
        validatePractice(practice);
        if (practice.sectionIndex < 0 || practice.sectionIndex >= lesson.sections.length) throw new Error(`Неверный sectionIndex: ${practice.id}`);
        const answer = normalizeAnswer(practice.answer);
        for (const alternative of practice.acceptableAnswers ?? []) {
          const normalized = normalizeAnswer(alternative);
          if (normalized !== answer && withoutDiacritics(normalized) === withoutDiacritics(answer)) throw new Error(`Допустимый ответ не должен снимать диакритику: ${practice.id}`);
        }
      }
      for (const check of [...lesson.knowledgeChecks, ...lesson.finalChecks]) {
        if (!check.id.trim() || !check.question.trim() || !check.answer.trim() || !check.explanation.trim() || check.options.length < 2 || new Set(check.options).size !== check.options.length) throw new Error(`Неполная проверка: ${check.id || "без id"}`);
        if (!check.options.includes(check.answer)) throw new Error(`Ответ отсутствует среди вариантов: ${check.id}`);
      }
      for (const example of lesson.theory.examples) {
        if (!example.slovak.trim() || !example.russian.trim()) throw new Error(`Словарь недоступен из примера: ${lesson.slug}`);
      }
    }

    if (module.topicGroups?.length) {
      const groupIds = new Set<string>();
      const groupedLessons = new Set<string>();
      const moduleLessons = new Set(module.lessons.map((lesson) => lesson.slug));
      for (const group of module.topicGroups) {
        if (groupIds.has(group.id)) throw new Error(`Повтор id группы: ${module.slug}/${group.id}`);
        groupIds.add(group.id);
        if (!group.lessonSlugs.length) throw new Error(`Пустая группа: ${module.slug}/${group.id}`);
        for (const slug of group.lessonSlugs) {
          if (!moduleLessons.has(slug)) throw new Error(`Группа ссылается на неизвестный урок: ${group.id}/${slug}`);
          if (groupedLessons.has(slug)) throw new Error(`Урок находится в нескольких группах: ${slug}`);
          groupedLessons.add(slug);
        }
      }
      if (groupedLessons.size !== module.lessons.length) throw new Error(`Группы не покрывают все уроки: ${module.slug}`);
    }
  }

  for (const entry of coverage) {
    if (!entry.lessonSlugs.length) throw new Error(`CEFR-компетенция без доказательств: ${entry.id}`);
    for (const slug of entry.lessonSlugs) if (!lessonSlugs.has(slug)) throw new Error(`CEFR-ссылка на неизвестный урок: ${entry.id}/${slug}`);
  }
}
