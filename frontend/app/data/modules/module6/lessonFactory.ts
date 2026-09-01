import { getPlannedModule } from "../../a1CourseRoadmap";
import type { CourseLesson, KnowledgeCheck, StepPractice } from "../../courseTypes";
import { uniqueAnswerOptions } from "../moduleFactory";

export type Compact = { title?: string; slovakTitle?: string; outcome?: string; summary: string; model: string; examples: Array<{ slovak: string; russian: string }>; mistake: string; task: string };
export type Guide = { focus: string; interaction: string; boundary: string; prompt: string; answer: string; hint: string };
type PracticeSeed = Omit<StepPractice, "id">;
type CheckSeed = Omit<KnowledgeCheck, "id">;

const module6 = getPlannedModule(6);
if (!module6) throw new Error("Module 6 roadmap is missing");
export const defineModule6Lesson = (slug: string, index: number, content: Compact, guide: Guide): CourseLesson => {
  const planned = module6.lessons.find((item) => item.slug === slug);
  if (!planned || !content || !guide || content.examples.length < 4) throw new Error(`Incomplete Module 6 seed: ${slug}`);
  const examples = content.examples.slice(0, 4);
  const options = examples.slice(0, 3).map((item) => item.slovak);
  const practices: PracticeSeed[] = [
    { sectionIndex: 0, type: "choice", prompt: `Как по-словацки: «${examples[0].russian}»?`, options, answer: examples[0].slovak, hint: "Определите цель реплики.", explanation: `Нормативная фраза: ${examples[0].slovak}` },
    { sectionIndex: 1, type: "text", prompt: `Переведите: «${examples[1].russian}».`, answer: examples[1].slovak, hint: "Используйте готовую модель сценария.", explanation: `Правильный ответ: ${examples[1].slovak}` },
    { sectionIndex: 2, type: "choice", prompt: `Выберите перевод «${examples[2].russian}».`, options: [examples[2].slovak, examples[0].slovak, examples[3].slovak], answer: examples[2].slovak, hint: "Найдите ключевое слово ситуации.", explanation: `Верная реплика: ${examples[2].slovak}` },
    { sectionIndex: 3, type: "text", prompt: `Переведите: «${examples[3].russian}».`, answer: examples[3].slovak, hint: "Проверьте вежливость и порядок слов.", explanation: `Правильный ответ: ${examples[3].slovak}` },
    { sectionIndex: 4, type: "text", prompt: guide.prompt, answer: guide.answer, hint: guide.hint, explanation: `Нормативный вариант: ${guide.answer}` },
  ];
  const checks: CheckSeed[] = [
    { question: `Выберите подходящую реплику для темы «${planned.title}».`, options, answer: examples[0].slovak, explanation: guide.focus },
    { question: `Как передать «${examples[1].russian}»?`, options: [examples[1].slovak, examples[2].slovak, examples[3].slovak], answer: examples[1].slovak, explanation: guide.interaction },
    { question: "Какая граница соответствует уровню A1?", options: [guide.boundary, content.mistake, "Нужно обязательно использовать сложные предложения"], answer: guide.boundary, explanation: guide.boundary },
  ];
  return {
    slug, order: index + 1, title: planned.title, slovakTitle: planned.slovakTitle, description: planned.outcome, duration: "30–35 мин",
    goals: [planned.outcome, "Распознавать ключевую реплику ситуации", "Проходить сценарий из нескольких простых шагов", "Извлекать или передавать точный практический факт"],
    theory: { summary: content.summary, rules: [content.model, guide.focus, guide.interaction, guide.boundary], examples: examples.map((item) => ({ ...item, explanation: guide.focus })) },
    sections: [
      { title: "Коммуникативная задача", paragraphs: [content.summary, guide.focus], note: "Сначала определите практический результат разговора или текста." },
      { title: "Сценарий по шагам", paragraphs: [guide.interaction], items: ["Откройте контакт подходящей репликой.", "Передайте или запросите ключевой факт.", "Подтвердите результат и завершите контакт."] },
      { title: "Опорные фразы", paragraphs: [content.model], table: { headers: ["Словацкий", "Русский"], rows: examples.map((item) => [item.slovak, item.russian]) } },
      { title: "Понимание и границы", paragraphs: [guide.boundary], items: ["Ищите имена, числа, время, место и ключевой глагол.", "Не переводите каждое слово, если задача уже решена."], note: `Типичная ошибка: ${content.mistake}` },
      { title: "Самостоятельная ситуация", paragraphs: [content.task], items: ["Используйте 2–4 короткие фразы.", "Сохраните изученные формы и вежливость.", "Проверьте, решена ли практическая задача."] },
    ],
    chatPrompt: `${content.task} Начните с первой реплики по-словацки.`, chatSuggestions: examples.slice(0, 3).map((item) => item.slovak),
    stepPractices: practices.map((item, practiceIndex) => ({ ...item, id: `m6-${slug}-step-${practiceIndex + 1}` })),
    knowledgeChecks: checks.map((item, checkIndex) => ({ ...item, id: `m6-${slug}-check-${checkIndex + 1}` })),
    finalChecks: [{ id: `m6-${slug}-final-1`, question: guide.prompt, options: uniqueAnswerOptions(guide.answer, examples.map((item) => item.slovak)), answer: guide.answer, explanation: guide.hint }],
  };
};
