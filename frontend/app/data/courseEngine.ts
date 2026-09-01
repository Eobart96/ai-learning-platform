import type { CourseLesson, CourseModule, LessonStatus } from "./courseTypes";

export function buildInitialProgress(modules: CourseModule[]): Record<string, LessonStatus> {
  return Object.fromEntries(modules.flatMap((module) => module.lessons.map((lesson) => [lesson.slug, "not_started" as const])));
}

export function findCourseLesson(modules: CourseModule[], slug: string): CourseLesson | undefined {
  return modules.flatMap((module) => module.lessons).find((lesson) => lesson.slug === slug);
}

export function getCourseModule(modules: CourseModule[], order: number): CourseModule {
  return modules.find((module) => module.order === order) ?? modules[0];
}

export function orderedModuleLessons(module: CourseModule): CourseLesson[] {
  if (!module.topicGroups?.length) return module.lessons;
  const bySlug = new Map(module.lessons.map((lesson) => [lesson.slug, lesson]));
  return module.topicGroups.flatMap((group) => group.lessonSlugs.map((slug) => bySlug.get(slug)).filter((lesson): lesson is CourseLesson => Boolean(lesson)));
}

export function topicGroupLessons(module: CourseModule, groupId: string): CourseLesson[] {
  const group = module.topicGroups?.find((candidate) => candidate.id === groupId);
  if (!group) return [];
  const bySlug = new Map(module.lessons.map((lesson) => [lesson.slug, lesson]));
  return group.lessonSlugs.map((slug) => bySlug.get(slug)).filter((lesson): lesson is CourseLesson => Boolean(lesson));
}

export function filterKnownLessonSlugs(modules: CourseModule[], slugs: string[]): string[] {
  const known = new Set(modules.flatMap((module) => module.lessons.map((lesson) => lesson.slug)));
  return [...new Set(slugs)].filter((slug) => known.has(slug));
}
