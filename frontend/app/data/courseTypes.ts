export type LessonStatus = "not_started" | "in_progress" | "completed";

export type LessonSection = {
  title: string;
  importance?: "core" | "extra";
  paragraphs?: string[];
  items?: string[];
  table?: { headers: string[]; rows: string[][] };
  note?: string;
};

export type StepPractice = {
  id: string;
  sectionIndex: number;
  type: "choice" | "text" | "order";
  prompt: string;
  options?: string[];
  tokens?: string[];
  tokenSeparator?: "" | " ";
  answer: string;
  acceptableAnswers?: string[];
  hint: string;
  explanation: string;
};

export type KnowledgeCheck = {
  id: string;
  question: string;
  options: string[];
  answer: string;
  explanation: string;
};

export type BetaLesson = {
  slug: string;
  order: number;
  title: string;
  slovakTitle: string;
  description: string;
  duration: string;
  goals: string[];
  theory: {
    summary: string;
    rules: string[];
    examples: Array<{ slovak: string; russian: string; explanation: string }>;
  };
  sections: LessonSection[];
  chatPrompt: string;
  chatSuggestions: string[];
  knowledgeChecks: KnowledgeCheck[];
  finalChecks: KnowledgeCheck[];
  stepPractices: StepPractice[];
};

export type CourseTopicGroup = {
  id: string;
  title: string;
  slovakTitle: string;
  description: string;
  lessonSlugs: string[];
};

export type ModuleContentRequirements = {
  minSections: number;
  minCoreSections: number;
  minStepPractices: number;
  minTheoryRules: number;
  minTheoryExamples: number;
  minKnowledgeChecks: number;
  minFinalChecks: number;
  requirePracticeForEverySection: boolean;
};

export type BetaModule = {
  slug: string;
  order: number;
  title: string;
  level: string;
  description: string;
  lessons: BetaLesson[];
  topicGroups?: CourseTopicGroup[];
  contentRequirements?: Partial<ModuleContentRequirements>;
};

export const defaultContentRequirements: ModuleContentRequirements = {
  minSections: 3,
  minCoreSections: 3,
  minStepPractices: 3,
  minTheoryRules: 2,
  minTheoryExamples: 3,
  minKnowledgeChecks: 2,
  minFinalChecks: 1,
  requirePracticeForEverySection: true,
};
