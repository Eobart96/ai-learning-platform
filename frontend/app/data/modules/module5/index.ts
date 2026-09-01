import { getPlannedModule } from "../../a1CourseRoadmap";
import { definePlannedModule } from "../moduleFactory";
import { presentTenseLesson } from "./lessons/present-tense";
import { irregularVerbsLesson } from "./lessons/irregular-verbs";
import { reflexiveSaSiLesson } from "./lessons/reflexive-sa-si";
import { verbNegationQuestionsLesson } from "./lessons/verb-negation-questions";
import { chcietInfinitiveLesson } from "./lessons/chciet-infinitive";
import { moctInfinitiveLesson } from "./lessons/moct-infinitive";
import { musietInfinitiveLesson } from "./lessons/musiet-infinitive";
import { vedietInfinitiveLesson } from "./lessons/vediet-infinitive";
import { modalQuestionsNegationLesson } from "./lessons/modal-questions-negation";
import { politeRequestsLesson } from "./lessons/polite-requests";
import { basicImperativeLesson } from "./lessons/basic-imperative";

const plannedModule = getPlannedModule(5);
if (!plannedModule) throw new Error("Module 5 roadmap is missing");

const lessonGroups = [
  { id: "present-forms", title: "Настоящее время", slovakTitle: "Prítomný čas", description: "Регулярные и частотные неправильные личные формы.", lessons: [presentTenseLesson, irregularVerbsLesson] },
  { id: "reflexive-negation", title: "Возвратность, отрицание и вопрос", slovakTitle: "Zvratnosť, zápor a otázka", description: "Модели sa/si, глагольное отрицание и базовые вопросы.", lessons: [reflexiveSaSiLesson, verbNegationQuestionsLesson] },
  { id: "modality", title: "Желание, возможность и необходимость", slovakTitle: "Želanie, možnosť a povinnosť", description: "Chcieť, môcť, musieť, vedieť и модальные вопросы/отрицания.", lessons: [chcietInfinitiveLesson, moctInfinitiveLesson, musietInfinitiveLesson, vedietInfinitiveLesson, modalQuestionsNegationLesson] },
  { id: "requests-instructions", title: "Просьбы и инструкции", slovakTitle: "Prosby a pokyny", description: "Вежливая просьба и частотные формы базового императива.", lessons: [politeRequestsLesson, basicImperativeLesson] },
];

export const module5 = definePlannedModule({ planned: plannedModule, lessonGroups, contentRequirements: { minSections: 5, minStepPractices: 5, minTheoryRules: 4 } });
export const module5Lessons = module5.lessons;
