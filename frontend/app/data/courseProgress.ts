import { buildReinforcementPractices, isCorePractice } from "./coursePractice";
import { type CourseLesson, type LessonStatus, type StepPractice } from "./courseTypes";

export type MistakeRecord = { id: string; lessonSlug: string; prompt: string; answer: string; attempts: number; mastered: boolean; reviewStage?: number; dueAt?: string };
export type LessonSummary = { understanding: number; level: string; strengths: string[]; mistakes?: string[]; review: string[]; userTurns: number; evidence?: { coreCorrect: number; coreTotal: number } };

const dayMs = 86400000;

export type CourseResetScope = { lessonSlugs: Set<string>; activityIds: Set<string> };

export function buildCourseResetScope(lessons: CourseLesson[]): CourseResetScope {
  return {
    lessonSlugs: new Set(lessons.map((lesson) => lesson.slug)),
    activityIds: new Set(lessons.flatMap((lesson) => [...lesson.stepPractices.map((practice) => practice.id), ...buildReinforcementPractices(lesson).map((practice) => practice.id), ...lesson.knowledgeChecks.map((check) => check.id), ...lesson.finalChecks.map((check) => check.id)])),
  };
}

export function removeActivityScope<Value>(record: Record<string, Value>, scope: CourseResetScope): Record<string, Value> {
  return Object.fromEntries(Object.entries(record).filter(([id]) => !scope.activityIds.has(id)));
}

export function removeLessonScope<Value>(record: Record<string, Value>, scope: CourseResetScope): Record<string, Value> {
  return Object.fromEntries(Object.entries(record).filter(([slug]) => !scope.lessonSlugs.has(slug)));
}

export function removeMistakeScope(record: Record<string, MistakeRecord>, scope: CourseResetScope): Record<string, MistakeRecord> {
  return Object.fromEntries(Object.entries(record).filter(([, mistake]) => !scope.lessonSlugs.has(mistake.lessonSlug)));
}

export function resetProgressScope(progress: Record<string, LessonStatus>, scope: CourseResetScope): Record<string, LessonStatus> {
  return { ...progress, ...Object.fromEntries([...scope.lessonSlugs].map((slug) => [slug, "not_started" as const])) };
}

export function nextMistakeRecord({ previous, id, lessonSlug, prompt, answer, correct, nowMs }: { previous?: MistakeRecord; id: string; lessonSlug: string; prompt: string; answer: string; correct: boolean; nowMs: number }): MistakeRecord | null {
  if (correct && !previous) return null;
  const nextStage = correct ? Math.min((previous?.reviewStage ?? 0) + 1, 2) : 0;
  return {
    id,
    lessonSlug,
    prompt,
    answer,
    attempts: (previous?.attempts ?? 0) + (correct ? 0 : 1),
    mastered: correct && nextStage >= 2,
    reviewStage: nextStage,
    dueAt: new Date(nowMs + (correct ? (nextStage === 1 ? 3 : 7) * dayMs : 0)).toISOString(),
  };
}

export function buildLessonSummary({ lesson, reinforcementPractices, practiceResults, checkSelections, mistakes, userTurns }: { lesson: CourseLesson; reinforcementPractices: StepPractice[]; practiceResults: Record<string, boolean>; checkSelections: Record<string, string>; mistakes: Record<string, MistakeRecord>; userTurns: number }): LessonSummary {
  const scoredKnowledgeChecks = lesson.assessmentMode === "interactive" ? [] : lesson.knowledgeChecks;
  const optionalIds = new Set(lesson.stepPractices.filter((practice) => !isCorePractice(lesson, practice)).map((practice) => practice.id));
  const corePractices = lesson.stepPractices.filter((practice) => isCorePractice(lesson, practice));
  const successfulPractices = corePractices.filter((practice) => practiceResults[practice.id] === true);
  const successfulChecks = scoredKnowledgeChecks.filter((check) => checkSelections[check.id] === check.answer);
  const activities = [...corePractices.map((practice) => practiceResults[practice.id] === true), ...scoredKnowledgeChecks.map((check) => checkSelections[check.id] === check.answer), ...reinforcementPractices.map((practice) => practiceResults[practice.id] === true)];
  const lessonMistakes = Object.values(mistakes).filter((mistake) => mistake.lessonSlug === lesson.slug && !mistake.mastered && !optionalIds.has(mistake.id));
  const understanding = Math.max(0, Math.min(100, Math.round((activities.length ? activities.filter(Boolean).length / activities.length : 0) * 100 - Math.min(15, lessonMistakes.length * 3))));
  const strengths = [...new Set([...successfulPractices.slice(0, 2).map((practice) => `Самостоятельно выполнено: ${practice.prompt}`), ...successfulChecks.slice(0, 1).map((check) => `Распознана нормативная форма: ${check.answer}`), ...(userTurns > 0 ? [`Выполнено заданий на закрепление: ${userTurns}`] : [])])].slice(0, 3);
  const unfinishedExtraSections = lesson.sections.filter((section, index) => section.importance === "extra" && !lesson.stepPractices.some((practice) => practice.sectionIndex === index && practiceResults[practice.id] === true));
  const review = [...(lessonMistakes.length ? [`Исправьте и повторите: ${lessonMistakes[0].prompt} → ${lessonMistakes[0].answer}`] : []), ...(userTurns < reinforcementPractices.length ? [`Завершите задания на закрепление: осталось ${reinforcementPractices.length - userTurns}.`] : []), "Повторите ключевые формы без подсказки через 3 дня.", ...(unfinishedExtraSections.length ? [`По желанию изучите дополнительный раздел «${unfinishedExtraSections[0].title}».`] : [])].slice(0, 3);
  return { understanding, level: understanding >= 85 ? "Уверенное понимание" : understanding >= 65 ? "Хорошая основа" : "Нужно повторение", strengths: strengths.length ? strengths : lesson.goals.slice(0, 1), mistakes: lessonMistakes.slice(0, 3).map((mistake) => `${mistake.prompt} → нормативно: ${mistake.answer}`), review, userTurns, evidence: { coreCorrect: activities.filter(Boolean).length, coreTotal: activities.length } };
}
