import { getPlannedModule } from "../../a1CourseRoadmap";
import type { CourseLesson, KnowledgeCheck, StepPractice } from "../../courseTypes";
import { uniqueAnswerOptions } from "../moduleFactory";

type PracticeSeed = Omit<StepPractice, "id">;
type CheckSeed = Omit<KnowledgeCheck, "id">;
type TableSeed = { headers: string[]; rows: string[][] };
export type Focus = {
  summary: string;
  model: string;
  goals: string[];
  rules: string[];
  examples: Array<{ slovak: string; russian: string }>;
  primaryTitle: string;
  primaryTable: TableSeed;
  secondaryTitle: string;
  secondaryTable: TableSeed;
  boundaryItems: string[];
  mistake: string;
  task: string;
  productionPrompt: string;
  productionAnswer: string;
  productionHint: string;
};

const module4 = getPlannedModule(4);
if (!module4) throw new Error("Module 4 roadmap is missing");

export const defineModule4Lesson = (slug: string, orderIndex: number, focus: Focus): CourseLesson => {
  const planned = module4.lessons.find((item) => item.slug === slug);
  if (!planned || !focus || focus.examples.length < 4) throw new Error(`Incomplete Module 4 seed: ${slug}`);
  const examples = focus.examples;
  const options = examples.slice(0, 3).map((item) => item.slovak);
  const finalOptions = uniqueAnswerOptions(focus.productionAnswer, examples.map((item) => item.slovak));
  const practices: PracticeSeed[] = [
    { sectionIndex: 0, type: "choice", prompt: `Как по-словацки: «${examples[0].russian}»?`, options, answer: examples[0].slovak, hint: "Сверьтесь со значением и вопросом урока.", explanation: `Нормативная форма: ${examples[0].slovak}` },
    { sectionIndex: 1, type: "text", prompt: `Переведите: «${examples[1].russian}».`, answer: examples[1].slovak, hint: "Проверьте падеж и окончание по таблице.", explanation: `Правильный ответ: ${examples[1].slovak}` },
    { sectionIndex: 2, type: "choice", prompt: `Выберите перевод «${examples[2].russian}».`, options: [examples[2].slovak, examples[0].slovak, examples[3].slovak], answer: examples[2].slovak, hint: "Определите роль формы в предложении.", explanation: `Верная модель: ${examples[2].slovak}` },
    { sectionIndex: 3, type: "text", prompt: `Переведите: «${examples[3].russian}».`, answer: examples[3].slovak, hint: "Используйте готовое сочетание из урока.", explanation: `Правильный ответ: ${examples[3].slovak}` },
    { sectionIndex: 4, type: "text", prompt: focus.productionPrompt, answer: focus.productionAnswer, hint: focus.productionHint, explanation: `Нормативный вариант: ${focus.productionAnswer}` },
  ];
  const safeRule = focus.rules.at(-1) ?? focus.model;
  const checks: CheckSeed[] = [
    { question: `Выберите нормативную модель для темы «${planned.title}».`, options, answer: examples[0].slovak, explanation: focus.model },
    { question: `Как правильно передать «${examples[1].russian}»?`, options: [examples[1].slovak, examples[2].slovak, examples[3].slovak], answer: examples[1].slovak, explanation: focus.rules[1] },
    { question: "Какой принцип безопаснее на уровне A1?", options: [safeRule, focus.mistake, "Выбирать форму только по русскому переводу"], answer: safeRule, explanation: safeRule },
  ];
  return {
    slug,
    order: orderIndex + 1,
    title: planned.title,
    slovakTitle: planned.slovakTitle,
    description: planned.outcome,
    duration: "35–40 мин",
    goals: focus.goals,
    theory: {
      summary: focus.summary,
      rules: [focus.model, ...focus.rules],
      examples: examples.map((item, index) => ({ ...item, explanation: focus.boundaryItems[index % focus.boundaryItems.length] })),
    },
    sections: [
      { title: "Значение, вопрос и алгоритм", paragraphs: [focus.summary, focus.model], note: "Сначала определите смысл и вопрос, затем выбирайте предлог, падеж и окончание." },
      { title: focus.primaryTitle, paragraphs: focus.rules.slice(0, 2), table: focus.primaryTable },
      { title: focus.secondaryTitle, paragraphs: focus.rules.slice(2, 4), table: focus.secondaryTable },
      { title: "Граница правила и типичные контрасты", paragraphs: focus.rules.slice(4), items: focus.boundaryItems, note: `Типичная ошибка: ${focus.mistake}` },
      { title: "Практическая ситуация", paragraphs: [focus.task], items: ["Назовите вопрос, на который отвечает форма.", "Выберите предлог или глагольную модель.", "Скажите полную фразу и проверьте каждое окончание."] },
    ],
    chatPrompt: `${focus.task} Начните с одной короткой фразы по-словацки.`,
    chatSuggestions: examples.slice(0, 3).map((item) => item.slovak),
    stepPractices: practices.map((item, index) => ({ ...item, id: `m4-${slug}-step-${index + 1}` })),
    knowledgeChecks: checks.map((item, index) => ({ ...item, id: `m4-${slug}-check-${index + 1}` })),
    finalChecks: [{ id: `m4-${slug}-final-1`, question: focus.productionPrompt, options: finalOptions, answer: focus.productionAnswer, explanation: focus.productionHint }],
  };
};
