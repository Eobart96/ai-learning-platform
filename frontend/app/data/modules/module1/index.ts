import type { CourseModule, CourseTopicGroup } from "../../courseTypes";
import { slovakAlphabetPronunciationLesson } from "./lessons/slovak-alphabet-pronunciation";
import { longShortVowelsLesson } from "./lessons/long-short-vowels";
import { diphthongsLesson } from "./lessons/diphthongs";
import { softHardConsonantsLesson } from "./lessons/soft-hard-consonants";
import { wordStressLesson } from "./lessons/word-stress";
import { rhythmicLawLesson } from "./lessons/rhythmic-law";
import { greetingsLesson } from "./lessons/greetings";
import { introductionsLesson } from "./lessons/introductions";
import { numbersLesson } from "./lessons/numbers";
import { daysAndMonthsLesson } from "./lessons/days-and-months";
import { personalPronounsLesson } from "./lessons/personal-pronouns";
import { verbBytLesson } from "./lessons/verb-byt";
import { questionWordsLesson } from "./lessons/question-words";
import { communicationRepairLesson } from "./lessons/communication-repair";

const topicGroups: CourseTopicGroup[] = [
  { id: "alphabet", title: "Алфавит", slovakTitle: "Abeceda a výslovnosť", description: "Буквы, диакритика, гласные, дифтонги, согласные, ударение и ритм слова.", lessonSlugs: ["slovak-alphabet-pronunciation", "long-short-vowels", "diphthongs", "soft-hard-consonants", "word-stress", "rhythmic-law"] },
  { id: "communication", title: "Знакомство и общение", slovakTitle: "Zoznámenie a komunikácia", description: "Приветствие, представление себя и стратегии уточнения в разговоре.", lessonSlugs: ["greetings", "introductions", "communication-repair"] },
  { id: "numbers-calendar", title: "Числа и календарь", slovakTitle: "Čísla a kalendár", description: "Числа, возраст, время, дни недели, месяцы и даты.", lessonSlugs: ["numbers", "days-and-months"] },
  { id: "grammar", title: "Базовая грамматика", slovakTitle: "Základná gramatika", description: "Личные местоимения, глагол byť и построение простых вопросов.", lessonSlugs: ["personal-pronouns", "verb-byt", "question-words"] },
];

const lessons = [
  slovakAlphabetPronunciationLesson,
  longShortVowelsLesson,
  diphthongsLesson,
  softHardConsonantsLesson,
  wordStressLesson,
  rhythmicLawLesson,
  greetingsLesson,
  introductionsLesson,
  numbersLesson,
  daysAndMonthsLesson,
  personalPronounsLesson,
  verbBytLesson,
  questionWordsLesson,
  communicationRepairLesson,
].map((lesson, index) => ({ ...lesson, order: index + 1 }));

export const module1: CourseModule = {
  slug: "module-1-foundations",
  order: 1,
  title: "Module 1 — Foundations",
  level: "Slovak A1",
  description: "Фонетика, базовые фразы и грамматика для первого разговора на словацком языке.",
  lessons,
  topicGroups,
  contentRequirements: { minSections: 5, minStepPractices: 5, minTheoryRules: 3 },
};
