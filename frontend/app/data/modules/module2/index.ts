import { getPlannedModule } from "../../a1CourseRoadmap";
import { definePlannedModule } from "../moduleFactory";
import { masculineNounsLesson } from "./lessons/masculine-nouns";
import { feminineNounsLesson } from "./lessons/feminine-nouns";
import { neuterNounsLesson } from "./lessons/neuter-nouns";
import { nounNumberLesson } from "./lessons/noun-number";
import { nounEndingsLesson } from "./lessons/noun-endings";
import { whoWhatIsItLesson } from "./lessons/who-what-is-it";
import { presenceAbsenceLesson } from "./lessons/presence-absence";

export const module2GenderLessons = [masculineNounsLesson, feminineNounsLesson, neuterNounsLesson];
export const module2FormLessons = [nounNumberLesson, nounEndingsLesson];
export const module2CommunicationLessons = [whoWhatIsItLesson, presenceAbsenceLesson];

const plannedModule = getPlannedModule(2);
if (!plannedModule) throw new Error("Module 2 roadmap is missing");

const lessonGroups = [
  { id: "noun-gender", title: "Род существительных", slovakTitle: "Rod podstatných mien", description: "Мужской, женский и средний род: частотные окончания, распознавание и базовое согласование.", lessons: module2GenderLessons },
  { id: "noun-forms", title: "Число и словарная форма", slovakTitle: "Číslo a základný tvar", description: "Единственное и множественное число, основные окончания и безопасные модели уровня A1.", lessons: module2FormLessons },
  { id: "naming-and-presence", title: "Называние и наличие", slovakTitle: "Pomenovanie a prítomnosť", description: "Вопросы о людях и предметах, а также конструкции je, sú, nie je и nie sú.", lessons: module2CommunicationLessons },
];

export const module2 = definePlannedModule({ planned: plannedModule, lessonGroups, contentRequirements: { minSections: 5, minStepPractices: 5, minTheoryRules: 3 } });
export const module2Lessons = module2.lessons;
