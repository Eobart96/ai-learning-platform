import type { BetaLesson, BetaModule, LessonStatus } from "./courseTypes";

export function buildInitialProgress(modules: BetaModule[]): Record<string, LessonStatus> {
  return Object.fromEntries(modules.flatMap((module) => module.lessons.map((lesson) => [lesson.slug, "not_started" as const])));
}

export function findCourseLesson(modules: BetaModule[], slug: string): BetaLesson | undefined {
  return modules.flatMap((module) => module.lessons).find((lesson) => lesson.slug === slug);
}

export function getCourseModule(modules: BetaModule[], order: number): BetaModule {
  return modules.find((module) => module.order === order) ?? modules[0];
}

export function orderedModuleLessons(module: BetaModule): BetaLesson[] {
  if (!module.topicGroups?.length) return module.lessons;
  const bySlug = new Map(module.lessons.map((lesson) => [lesson.slug, lesson]));
  return module.topicGroups.flatMap((group) => group.lessonSlugs.map((slug) => bySlug.get(slug)).filter((lesson): lesson is BetaLesson => Boolean(lesson)));
}

export function topicGroupLessons(module: BetaModule, groupId: string): BetaLesson[] {
  const group = module.topicGroups?.find((candidate) => candidate.id === groupId);
  if (!group) return [];
  const bySlug = new Map(module.lessons.map((lesson) => [lesson.slug, lesson]));
  return group.lessonSlugs.map((slug) => bySlug.get(slug)).filter((lesson): lesson is BetaLesson => Boolean(lesson));
}

export function filterKnownLessonSlugs(modules: BetaModule[], slugs: string[]): string[] {
  const known = new Set(modules.flatMap((module) => module.lessons.map((lesson) => lesson.slug)));
  return [...new Set(slugs)].filter((slug) => known.has(slug));
}
