import type { CourseLesson, KnowledgeCheck, LessonSection, StepPractice } from "../../courseTypes";

type Example = CourseLesson["theory"]["examples"][number];
type PracticeSeed = Omit<StepPractice, "id">;
type CheckSeed = Omit<KnowledgeCheck, "id">;
export type LessonSeed = Omit<CourseLesson, "order" | "stepPractices" | "knowledgeChecks" | "finalChecks"> & {
  practices: PracticeSeed[];
  checks: CheckSeed[];
  finals: CheckSeed[];
};

export const defineModule2Lesson = (seed: LessonSeed): CourseLesson => ({
  slug: seed.slug,
  order: 0,
  title: seed.title,
  slovakTitle: seed.slovakTitle,
  description: seed.description,
  duration: seed.duration,
  goals: seed.goals,
  theory: seed.theory,
  sections: seed.sections,
  chatPrompt: seed.chatPrompt,
  chatSuggestions: seed.chatSuggestions,
  stepPractices: seed.practices.map((practice, index) => ({ ...practice, id: `m2-${seed.slug}-step-${index + 1}` })),
  knowledgeChecks: seed.checks.map((check, index) => ({ ...check, id: `m2-${seed.slug}-check-${index + 1}` })),
  finalChecks: seed.finals.map((check, index) => ({ ...check, id: `m2-${seed.slug}-final-${index + 1}` })),
});

export const choice = (sectionIndex: number, prompt: string, options: string[], answer: string, hint: string, explanation: string): PracticeSeed => ({
  sectionIndex, type: "choice", prompt, options, answer, hint, explanation,
});

export const text = (sectionIndex: number, prompt: string, answer: string, hint: string, explanation: string, acceptableAnswers?: string[]): PracticeSeed => ({
  sectionIndex, type: "text", prompt, answer, hint, explanation, acceptableAnswers,
});

export const check = (question: string, options: string[], answer: string, explanation: string): CheckSeed => ({ question, options, answer, explanation });
