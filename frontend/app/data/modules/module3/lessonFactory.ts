import type { CourseLesson, KnowledgeCheck, StepPractice } from "../../courseTypes";

type PracticeSeed = Omit<StepPractice, "id">;
type CheckSeed = Omit<KnowledgeCheck, "id">;
export type LessonSeed = Omit<CourseLesson, "order" | "stepPractices" | "knowledgeChecks" | "finalChecks"> & {
  practices: PracticeSeed[];
  checks: CheckSeed[];
  finals: CheckSeed[];
};

export const defineModule3Lesson = (seed: LessonSeed): CourseLesson => ({
  ...seed,
  order: 0,
  stepPractices: seed.practices.map((item, index) => ({ ...item, id: `m3-${seed.slug}-step-${index + 1}` })),
  knowledgeChecks: seed.checks.map((item, index) => ({ ...item, id: `m3-${seed.slug}-check-${index + 1}` })),
  finalChecks: seed.finals.map((item, index) => ({ ...item, id: `m3-${seed.slug}-final-${index + 1}` })),
});

export const choice = (sectionIndex: number, prompt: string, options: string[], answer: string, hint: string, explanation: string): PracticeSeed => ({ sectionIndex, type: "choice", prompt, options, answer, hint, explanation });
export const text = (sectionIndex: number, prompt: string, answer: string, hint: string, explanation: string, acceptableAnswers?: string[]): PracticeSeed => ({ sectionIndex, type: "text", prompt, answer, hint, explanation, acceptableAnswers });
export const order = (sectionIndex: number, prompt: string, tokens: string[], answer: string, hint: string, explanation: string): PracticeSeed => ({ sectionIndex, type: "order", prompt, tokens, answer, hint, explanation });
export const check = (question: string, options: string[], answer: string, explanation: string): CheckSeed => ({ question, options, answer, explanation });
