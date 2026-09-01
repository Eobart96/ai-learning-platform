import type { PlannedLesson } from "../a1CourseRoadmap";
import type { CourseLesson } from "../courseTypes";

type CompactExample = { slovak: string; russian: string };

export type CompactLessonContent = {
  slug: string;
  title?: string;
  slovakTitle?: string;
  outcome?: string;
  summary: string;
  model: string;
  examples: CompactExample[];
  mistake: string;
  task: string;
};

export function definePlannedLesson(moduleOrder: number, order: number, planned: PlannedLesson, content: CompactLessonContent): CourseLesson {
  const prefix = `m${moduleOrder}-${planned.slug}`;
  const examples = content.examples.slice(0, 4);
  if (content.slug !== planned.slug) throw new Error(`Lesson content mismatch: ${content.slug} / ${planned.slug}`);
  if (examples.length < 3) throw new Error(`Недостаточно примеров для темы ${planned.slug}`);
  const optionSet = () => examples.slice(0, 3).map((example) => example.slovak).sort((a, b) => a.localeCompare(b, "sk"));
  return {
    slug: planned.slug,
    order,
    title: planned.title,
    slovakTitle: planned.slovakTitle,
    description: planned.outcome,
    duration: "15 мин",
    goals: [planned.outcome, "Узнавать основную модель в короткой фразе", "Создавать собственный пример в знакомой ситуации"],
    theory: {
      summary: content.summary,
      rules: [content.model, `Типичная ошибка A1: ${content.mistake}`],
      examples: examples.map((example) => ({ ...example, explanation: "Фраза показывает основную модель урока в частотном контексте A1." })),
    },
    sections: [
      { title: "Основная модель", paragraphs: [content.model], note: content.mistake },
      { title: "Примеры и опорные фразы", table: { headers: ["Словацкий", "Русский"], rows: examples.map((example) => [example.slovak, example.russian]) } },
      { title: "Практическая ситуация", paragraphs: [content.task], items: ["Сначала используйте готовую модель.", "Затем замените один элемент и произнесите новую фразу вслух."] },
    ],
    chatPrompt: `Потренируем тему «${planned.title}». ${content.task} Начните с одной короткой фразы по-словацки.`,
    chatSuggestions: examples.slice(0, 3).map((example) => example.slovak),
    knowledgeChecks: [
      { id: `${prefix}-check-1`, question: `Как по-словацки: «${examples[0].russian}»?`, options: optionSet(), answer: examples[0].slovak, explanation: `Правильная модель: ${examples[0].slovak}` },
      { id: `${prefix}-check-2`, question: `Как по-словацки: «${examples[1].russian}»?`, options: optionSet(), answer: examples[1].slovak, explanation: `Правильная модель: ${examples[1].slovak}` },
    ],
    finalChecks: [
      { id: `${prefix}-final-1`, question: `Выберите перевод «${examples[2].russian}».`, options: optionSet(), answer: examples[2].slovak, explanation: `Правильный ответ: ${examples[2].slovak}` },
    ],
    stepPractices: [
      { id: `${prefix}-step-1`, sectionIndex: 0, type: "choice", prompt: `Выберите перевод «${examples[0].russian}».`, options: optionSet(), answer: examples[0].slovak, hint: "Сверьтесь с основной моделью.", explanation: `Верная фраза: ${examples[0].slovak}` },
      { id: `${prefix}-step-2`, sectionIndex: 1, type: "text", prompt: `Переведите: «${examples[1].russian}».`, answer: examples[1].slovak, hint: "Используйте опорную фразу из таблицы.", explanation: `Верная фраза: ${examples[1].slovak}` },
      { id: `${prefix}-step-3`, sectionIndex: 2, type: "text", prompt: `Переведите: «${examples[2].russian}».`, answer: examples[2].slovak, hint: "Сохраните порядок слов и диакритику.", explanation: `Верная фраза: ${examples[2].slovak}` },
    ],
  };
}
