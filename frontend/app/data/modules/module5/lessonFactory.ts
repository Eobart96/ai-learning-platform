import { getPlannedModule } from "../../a1CourseRoadmap";
import type { CourseLesson, KnowledgeCheck, StepPractice } from "../../courseTypes";
import { uniqueAnswerOptions } from "../moduleFactory";

export type Compact = { title?: string; slovakTitle?: string; outcome?: string; summary: string; model: string; examples: Array<{ slovak: string; russian: string }>; mistake: string; task: string };
export type Focus = { rules: string[]; contrasts: string[]; prompt: string; answer: string; hint: string };
type PracticeSeed = Omit<StepPractice, "id">;
type CheckSeed = Omit<KnowledgeCheck, "id">;

const module5 = getPlannedModule(5);
if (!module5) throw new Error("Module 5 roadmap is missing");
export const defineModule5Lesson = (slug: string, lessonIndex: number, content: Compact, focus: Focus): CourseLesson => {
  const planned = module5.lessons.find((item) => item.slug === slug);
  if (!planned || !content || !focus || content.examples.length < 4) throw new Error(`Incomplete Module 5 seed: ${slug}`);
  const examples = content.examples.slice(0, 4);
  const baseOptions = examples.slice(0, 3).map((item) => item.slovak);
  const practices: PracticeSeed[] = [
    { sectionIndex: 0, type: "choice", prompt: `Как по-словацки: «${examples[0].russian}»?`, options: baseOptions, answer: examples[0].slovak, hint: "Определите лицо и значение глагола.", explanation: `Нормативная модель: ${examples[0].slovak}` },
    { sectionIndex: 1, type: "text", prompt: `Переведите: «${examples[1].russian}».`, answer: examples[1].slovak, hint: "Проверьте личную форму и инфинитив.", explanation: `Правильный ответ: ${examples[1].slovak}` },
    { sectionIndex: 2, type: "choice", prompt: `Выберите перевод «${examples[2].russian}».`, options: [examples[2].slovak, examples[0].slovak, examples[3].slovak], answer: examples[2].slovak, hint: "Сверьте смысл модальной или личной формы.", explanation: `Верная форма: ${examples[2].slovak}` },
    { sectionIndex: 3, type: "text", prompt: `Переведите: «${examples[3].russian}».`, answer: examples[3].slovak, hint: "Не теряйте отрицание или sa/si.", explanation: `Правильный ответ: ${examples[3].slovak}` },
    { sectionIndex: 4, type: "text", prompt: focus.prompt, answer: focus.answer, hint: focus.hint, explanation: `Нормативный вариант: ${focus.answer}` },
  ];
  const checks: CheckSeed[] = [
    { question: `Выберите нормативную модель темы «${planned.title}».`, options: baseOptions, answer: examples[0].slovak, explanation: content.model },
    { question: `Как передать «${examples[1].russian}»?`, options: [examples[1].slovak, examples[2].slovak, examples[3].slovak], answer: examples[1].slovak, explanation: focus.rules[1] },
    { question: "Какой принцип соответствует материалу A1?", options: [focus.rules[3], content.mistake, "Строить любую форму только по одному окончанию"], answer: focus.rules[3], explanation: focus.rules[3] },
  ];
  return {
    slug, order: lessonIndex + 1, title: planned.title, slovakTitle: planned.slovakTitle, description: planned.outcome, duration: "30–35 мин",
    goals: [planned.outcome, "Выбирать личную форму по субъекту", "Использовать модель в вопросе и отрицании", "Создавать короткую бытовую фразу"],
    theory: { summary: content.summary, rules: [content.model, ...focus.rules], examples: examples.map((item, index) => ({ ...item, explanation: focus.contrasts[index % focus.contrasts.length] })) },
    sections: [
      { title: "Значение модели", paragraphs: [content.summary, focus.rules[0]], note: "Сначала определите намерение говорящего и лицо." },
      { title: "Личные формы", paragraphs: [content.model, focus.rules[1]], table: { headers: ["Опора", "Пример"], rows: focus.contrasts.map((item, index) => [`${index + 1}`, item]) } },
      { title: "Фраза и дополнение", paragraphs: [focus.rules[2]], table: { headers: ["Словацкий", "Русский"], rows: examples.map((item) => [item.slovak, item.russian]) } },
      { title: "Вопрос, отрицание и граница", paragraphs: [focus.rules[3]], items: focus.contrasts, note: `Типичная ошибка: ${content.mistake}` },
      { title: "Практическая ситуация", paragraphs: [content.task], items: ["Выберите нужный глагол.", "Поставьте его в форму нужного лица.", "Добавьте инфинитив, sa/si или отрицание, если модель этого требует."] },
    ],
    chatPrompt: `${content.task} Начните с одной короткой фразы по-словацки.`, chatSuggestions: examples.slice(0, 3).map((item) => item.slovak),
    stepPractices: practices.map((item, index) => ({ ...item, id: `m5-${slug}-step-${index + 1}` })),
    knowledgeChecks: checks.map((item, index) => ({ ...item, id: `m5-${slug}-check-${index + 1}` })),
    finalChecks: [{ id: `m5-${slug}-final-1`, question: focus.prompt, options: uniqueAnswerOptions(focus.answer, examples.map((item) => item.slovak)), answer: focus.answer, explanation: focus.hint }],
  };
};
