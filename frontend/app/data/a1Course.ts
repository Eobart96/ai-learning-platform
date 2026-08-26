import rawCourseContent from "./a1CourseContent.json";
import { a1CefrCoverage } from "./a1CefrCoverage";
import { findCourseLesson, getCourseModule } from "./courseEngine";
import { plannedA1Modules, plannedModule1Additions, type PlannedLesson } from "./a1CourseRoadmap";
import type { BetaLesson, BetaModule, CourseTopicGroup } from "./courseTypes";
import { validateCourseModules } from "./courseValidation";
import { expandedModule1Lessons } from "./module1ExpandedLessons";
import { module1Beta } from "./module1Beta";

type CompactExample = { slovak: string; russian: string };
type CompactLessonContent = {
  title?: string;
  slovakTitle?: string;
  outcome?: string;
  summary: string;
  model: string;
  examples: CompactExample[];
  mistake: string;
  task: string;
};

const courseContent = rawCourseContent as Record<string, CompactLessonContent>;

const module1AdditionContent: Record<string, CompactLessonContent> = {
  "slovak-alphabet-pronunciation": {
    summary: "Словацкая графика в основном фонетична: знакомая буква или сочетание обычно читается предсказуемо, а диакритика является частью написания слова.",
    model: "Читайте буквы с диакритикой как самостоятельные знаки алфавита: č, š, ž, ď, ť, ň, ľ, ä, ô; сочетание ch также считается отдельной буквой.",
    examples: [{ slovak: "čaj", russian: "чай" }, { slovak: "škola", russian: "школа" }, { slovak: "žena", russian: "женщина" }, { slovak: "chlieb", russian: "хлеб" }],
    mistake: "Не убирайте диакритику при письме: č и c, š и s обозначают разные звуки и могут различать слова.",
    task: "Прочитайте вслух čaj, škola, žena и chlieb, затем произнесите своё имя по буквам.",
  },
  "long-short-vowels": {
    summary: "Долгота гласной смыслоразличительна и отмечается знаком dĺžeň: á, é, í, ó, ú, ý.",
    model: "Долгую гласную произносят примерно вдвое дольше краткой: a — á, e — é, i — í, o — ó, u — ú, y — ý.",
    examples: [{ slovak: "rad", russian: "совет / ряд" }, { slovak: "rád", russian: "охотно / рад" }, { slovak: "dom", russian: "дом" }, { slovak: "mám", russian: "у меня есть" }],
    mistake: "Не воспринимайте dĺžeň как ударение: ударение обычно остаётся на первом слоге, а знак показывает долготу гласной.",
    task: "Произнесите пары a — á, i — í, u — ú и выделите долготу в словах rád, mám и dlhý.",
  },
  diphthongs: {
    summary: "Словацкие дифтонги ia, ie, iu и ô произносятся в пределах одного слога и встречаются в частотных словах A1.",
    model: "Читайте ia, ie, iu слитно, а ô примерно как uo: piatok, mlieko, cudziu, stôl.",
    examples: [{ slovak: "piatok", russian: "пятница" }, { slovak: "mlieko", russian: "молоко" }, { slovak: "cudziu", russian: "чужую" }, { slovak: "stôl", russian: "стол" }],
    mistake: "Не разделяйте дифтонг на два самостоятельных слога: mie-sto, а не mi-e-sto.",
    task: "Прочитайте piatok, mlieko, miesto и stôl, сохраняя один слог для каждого дифтонга.",
  },
  "soft-hard-consonants": {
    summary: "Различие мягких и твёрдых согласных помогает правильно читать окончания и писать i/í или y/ý.",
    model: "К мягким относят ď, ť, ň, ľ и часто č, dž, š, ž, c, dz, j; после ď, ť, ň, ľ перед e/i мягкость обычно не отмечается háček: deti, ticho.",
    examples: [{ slovak: "deti", russian: "дети" }, { slovak: "ticho", russian: "тихо" }, { slovak: "žena", russian: "женщина" }, { slovak: "dobrý", russian: "хороший" }],
    mistake: "Не читайте de, te, ne, le механически твёрдо в частотных словацких словах: deti произносится с мягким ď.",
    task: "Разделите слова deti, ticho, žena и dobrý на примеры с мягкими и твёрдыми согласными.",
  },
  "word-stress": {
    summary: "Основное словесное ударение в словацком обычно падает на первый слог, в том числе после односложного предлога.",
    model: "Произносите первый слог сильнее: ŠKO-la, BRA-ti-sla-va; сочетание предлог + слово образует одну ритмическую группу: V BRA-ti-sla-ve.",
    examples: [{ slovak: "škola", russian: "школа" }, { slovak: "Bratislava", russian: "Братислава" }, { slovak: "v meste", russian: "в городе" }, { slovak: "na stole", russian: "на столе" }],
    mistake: "Не переносите русское подвижное ударение: в нейтральной словацкой речи ориентируйтесь на первый слог.",
    task: "Отметьте голосом первый слог в škola, Bratislava, v meste и na stole.",
  },
  "rhythmic-law": {
    summary: "Rytmický zákon ограничивает соседство двух долгих слогов и объясняет часть окончаний, которые выглядят короче ожидаемого.",
    model: "После долгого слога следующее окончание часто сокращается: krásny, biely; на A1 достаточно узнавать частотные формы и не выводить все исключения.",
    examples: [{ slovak: "krásny deň", russian: "красивый день" }, { slovak: "biely dom", russian: "белый дом" }, { slovak: "mlieko", russian: "молоко" }, { slovak: "dobrý človek", russian: "хороший человек" }],
    mistake: "Не применяйте правило механически ко всем словам: сначала запоминайте нормативную частотную форму целиком.",
    task: "Сравните формы krásny, biely и dobrý и подчеркните долгий слог в каждом слове.",
  },
  "question-words": {
    summary: "Базовые вопросительные слова позволяют запросить человека, предмет, место, происхождение, способ, количество и время.",
    model: "Используйте kto, čo, kde, odkiaľ, ako, koľko и kedy в начале простого вопроса: Kde bývaš? Koľko to stojí?",
    examples: [{ slovak: "Kto je to?", russian: "Кто это?" }, { slovak: "Kde bývaš?", russian: "Где ты живёшь?" }, { slovak: "Koľko to stojí?", russian: "Сколько это стоит?" }, { slovak: "Kedy sa stretneme?", russian: "Когда мы встретимся?" }],
    mistake: "Не используйте čo для вопроса о человеке: Kto je to? — о человеке, Čo je to? — о предмете.",
    task: "Задайте четыре вопроса новому знакомому с kto, kde, odkiaľ и kedy.",
  },
  "communication-repair": {
    summary: "На уровне A1 нормально просить повторить, говорить медленнее, объяснить слово или произнести его по буквам.",
    model: "Вежливые опоры: Prosím, zopakujte to. Hovorte pomalšie, prosím. Čo znamená ...? Ako sa to píše?",
    examples: [{ slovak: "Prosím, zopakujte to.", russian: "Пожалуйста, повторите это." }, { slovak: "Hovorte pomalšie, prosím.", russian: "Говорите медленнее, пожалуйста." }, { slovak: "Čo znamená toto slovo?", russian: "Что означает это слово?" }, { slovak: "Ako sa to píše?", russian: "Как это пишется?" }],
    mistake: "Не переходите на неформальное zopakujте: с незнакомым человеком сохраняйте вежливую форму zopakujte.",
    task: "Разыграйте ситуацию непонимания и используйте три разные фразы для уточнения.",
  },
};

function createLesson(moduleOrder: number, order: number, planned: PlannedLesson, content: CompactLessonContent): BetaLesson {
  const prefix = `m${moduleOrder}-${planned.slug}`;
  const examples = content.examples.slice(0, 4);
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

if (expandedModule1Lessons.some((lesson, index) => lesson.slug !== plannedModule1Additions[index]?.slug)) {
  throw new Error("Расширенные уроки Module 1 не совпадают с утверждённым roadmap");
}

const foundationsTopicGroups: CourseTopicGroup[] = [
  { id: "alphabet", title: "Алфавит", slovakTitle: "Abeceda a výslovnosť", description: "Буквы, диакритика, гласные, дифтонги, согласные, ударение и ритм слова.", lessonSlugs: ["slovak-alphabet-pronunciation", "long-short-vowels", "diphthongs", "soft-hard-consonants", "word-stress", "rhythmic-law"] },
  { id: "communication", title: "Знакомство и общение", slovakTitle: "Zoznámenie a komunikácia", description: "Приветствие, представление себя и стратегии уточнения в разговоре.", lessonSlugs: ["greetings", "introductions", "communication-repair"] },
  { id: "numbers-calendar", title: "Числа и календарь", slovakTitle: "Čísla a kalendár", description: "Числа, возраст, время, дни недели, месяцы и даты.", lessonSlugs: ["numbers", "days-and-months"] },
  { id: "grammar", title: "Базовая грамматика", slovakTitle: "Základná gramatika", description: "Личные местоимения, глагол byť и построение простых вопросов.", lessonSlugs: ["personal-pronouns", "verb-byt", "question-words"] },
];

const module1Lessons = [
  ...expandedModule1Lessons.slice(0, 6).map((lesson, index) => ({ ...lesson, order: index + 1 })),
  ...module1Beta.lessons.map((lesson) => ({ ...lesson, order: lesson.order + 6 })),
  ...expandedModule1Lessons.slice(6).map((lesson, index) => ({ ...lesson, order: module1Beta.lessons.length + 7 + index })),
];

export const a1CourseModules: BetaModule[] = [
  {
    ...module1Beta,
    lessons: module1Lessons,
    description: "Фонетика, базовые фразы и грамматика для первого разговора на словацком языке.",
    topicGroups: foundationsTopicGroups,
    contentRequirements: { minSections: 5, minStepPractices: 5, minTheoryRules: 3 },
  },
  ...plannedA1Modules.map((module): BetaModule => ({
    slug: module.slug,
    order: module.order,
    title: module.title,
    level: "Slovak A1",
    description: module.description,
    lessons: module.lessons.map((planned, index) => createLesson(module.order, index + 1, planned, courseContent[planned.slug])),
  })),
];

export const allA1Lessons = a1CourseModules.flatMap((module) => module.lessons);
export const getA1Module = (order: number): BetaModule => getCourseModule(a1CourseModules, order);
export const findA1Lesson = (slug: string): BetaLesson | undefined => findCourseLesson(a1CourseModules, slug);

validateCourseModules(a1CourseModules, a1CefrCoverage);
