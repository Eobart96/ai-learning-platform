import type { PlannedLesson, PlannedModule } from "../a1CourseRoadmap";
import type { CourseLesson, CourseModule, CourseTopicGroup, ModuleContentRequirements } from "../courseTypes";

type PlannedModuleDefinition = {
  planned: PlannedModule;
  lessons?: CourseLesson[];
  lessonGroups?: Array<Omit<CourseTopicGroup, "lessonSlugs"> & { lessons: CourseLesson[] }>;
  contentRequirements?: Partial<ModuleContentRequirements>;
};

export function uniqueAnswerOptions(answer: string, candidates: string[], limit = 3): string[] {
  const options = [answer, ...candidates].filter((option, index, values) => values.indexOf(option) === index).slice(0, limit);
  if (options.length < 2) throw new Error(`Not enough distinct answer options for: ${answer}`);
  return options;
}

export function defineLessonsFromPlannedContent<Content extends { slug: string }>(
  planned: PlannedModule,
  contentItems: Content[],
  createLesson: (plannedLesson: PlannedLesson, content: Content, index: number) => CourseLesson,
): CourseLesson[] {
  const contentBySlug = new Map<string, Content>();
  for (const content of contentItems) {
    if (contentBySlug.has(content.slug)) throw new Error(`Duplicate lesson content in Module ${planned.order}: ${content.slug}`);
    contentBySlug.set(content.slug, content);
  }
  const plannedSlugs = new Set(planned.lessons.map((lesson) => lesson.slug));
  const extraSlugs = [...contentBySlug.keys()].filter((slug) => !plannedSlugs.has(slug));
  if (extraSlugs.length) throw new Error(`Unplanned lesson content in Module ${planned.order}: ${extraSlugs.join(", ")}`);
  return planned.lessons.map((plannedLesson, index) => {
    const content = contentBySlug.get(plannedLesson.slug);
    if (!content) throw new Error(`Missing Module ${planned.order} lesson content: ${plannedLesson.slug}`);
    return createLesson(plannedLesson, content, index);
  });
}

export function definePlannedModule({ planned, lessons, lessonGroups, contentRequirements }: PlannedModuleDefinition): CourseModule {
  if (Boolean(lessons) === Boolean(lessonGroups)) throw new Error(`Module ${planned.order} must define lessons or lessonGroups`);
  const registeredLessons = lessons ?? lessonGroups?.flatMap((group) => group.lessons) ?? [];
  const topicGroups = lessonGroups?.map(({ lessons: groupLessons, ...group }) => ({ ...group, lessonSlugs: groupLessons.map((lesson) => lesson.slug) }));
  const lessonsBySlug = new Map<string, CourseLesson>();
  for (const lesson of registeredLessons) {
    if (lessonsBySlug.has(lesson.slug)) throw new Error(`Duplicate registered lesson in Module ${planned.order}: ${lesson.slug}`);
    lessonsBySlug.set(lesson.slug, lesson);
  }

  const plannedSlugs = new Set(planned.lessons.map((lesson) => lesson.slug));
  if (plannedSlugs.size !== planned.lessons.length) throw new Error(`Duplicate roadmap lesson in Module ${planned.order}`);
  const extraSlugs = [...lessonsBySlug.keys()].filter((slug) => !plannedSlugs.has(slug));
  if (extraSlugs.length) throw new Error(`Unplanned lessons in Module ${planned.order}: ${extraSlugs.join(", ")}`);

  const orderedLessons = planned.lessons.map((plannedLesson, index) => {
    const lesson = lessonsBySlug.get(plannedLesson.slug);
    if (!lesson) throw new Error(`Missing Module ${planned.order} lesson file: ${plannedLesson.slug}`);
    if (lesson.title !== plannedLesson.title || lesson.slovakTitle !== plannedLesson.slovakTitle) {
      throw new Error(`Lesson metadata differs from roadmap: ${plannedLesson.slug}`);
    }
    return { ...lesson, order: index + 1 };
  });

  return {
    slug: planned.slug,
    order: planned.order,
    title: planned.title,
    level: "Slovak A1",
    description: planned.description,
    lessons: orderedLessons,
    topicGroups,
    contentRequirements,
  };
}
