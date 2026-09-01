import type { CourseLesson, KnowledgeCheck, LessonSection, StepPractice } from "../../courseTypes";

type Example = CourseLesson["theory"]["examples"][number];
type PracticeSeed = Omit<StepPractice, "id">;
type CheckSeed = Omit<KnowledgeCheck, "id">;

export type Module1LessonSeed = {
  slug: string;
  title: string;
  slovakTitle: string;
  description: string;
  duration: string;
  goals: string[];
  summary: string;
  rules: string[];
  examples: Example[];
  sections: LessonSection[];
  chatPrompt: string;
  chatSuggestions: string[];
  practices: PracticeSeed[];
  checks: CheckSeed[];
  finals: CheckSeed[];
  assessmentMode?: "quiz" | "interactive";
  materialAssessmentStep?: boolean;
  reinforcementLabel?: string;
  reinforcementTitle?: string;
  reinforcementPractices?: PracticeSeed[];
};

export const defineModule1Lesson = (seed: Module1LessonSeed): CourseLesson => ({
  slug: seed.slug,
  order: 0,
  title: seed.title,
  slovakTitle: seed.slovakTitle,
  description: seed.description,
  duration: seed.duration,
  goals: seed.goals,
  theory: { summary: seed.summary, rules: seed.rules, examples: seed.examples },
  sections: seed.sections,
  chatPrompt: seed.chatPrompt,
  chatSuggestions: seed.chatSuggestions,
  stepPractices: seed.practices.map((item, index) => ({ ...item, id: "m1-" + seed.slug + "-step-" + (index + 1) })),
  assessmentMode: seed.assessmentMode,
  materialAssessmentStep: seed.materialAssessmentStep,
  reinforcementLabel: seed.reinforcementLabel,
  reinforcementTitle: seed.reinforcementTitle,
  reinforcementPractices: seed.reinforcementPractices?.map((item, index) => ({ ...item, id: "reinforcement:" + seed.slug + ":" + (index + 1) })),
  knowledgeChecks: seed.checks.map((item, index) => ({ ...item, id: "m1-" + seed.slug + "-check-" + (index + 1) })),
  finalChecks: seed.finals.map((item, index) => ({ ...item, id: "m1-" + seed.slug + "-final-" + (index + 1) })),
});
