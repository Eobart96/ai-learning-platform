import { getPlannedModule } from "../../a1CourseRoadmap";
import { definePlannedModule } from "../moduleFactory";
import { adjectiveGenderLesson } from "./lessons/adjective-gender";
import { adjectivePluralLesson } from "./lessons/adjective-plural";
import { demonstrativesPossessivesLesson } from "./lessons/demonstratives-possessives";
import { basicDescriptionLesson } from "./lessons/basic-description";
import { choiceContrastLesson } from "./lessons/choice-contrast";
import { basicConnectorsLesson } from "./lessons/basic-connectors";

export const module3AgreementLessons = [adjectiveGenderLesson, adjectivePluralLesson];
export const module3DescriptionLessons = [demonstrativesPossessivesLesson, basicDescriptionLesson];
export const module3ConnectionLessons = [choiceContrastLesson, basicConnectorsLesson];

const plannedModule = getPlannedModule(3);
if (!plannedModule) throw new Error("Module 3 roadmap is missing");

const lessonGroups = [
  { id: "adjective-agreement", title: "Согласование", slovakTitle: "Zhoda prídavných mien", description: "Род и число прилагательных в базовых формах именительного падежа.", lessons: module3AgreementLessons },
  { id: "pointing-and-description", title: "Указание и описание", slovakTitle: "Ukazovanie a opis", description: "Указательные и притяжательные формы, цвет, размер, возраст и простая оценка.", lessons: module3DescriptionLessons },
  { id: "choice-and-connection", title: "Выбор и связная фраза", slovakTitle: "Výber a spájanie viet", description: "Выбор, контраст, добавление информации и простая последовательность действий.", lessons: module3ConnectionLessons },
];

export const module3 = definePlannedModule({ planned: plannedModule, lessonGroups, contentRequirements: { minSections: 5, minStepPractices: 5, minTheoryRules: 3 } });
export const module3Lessons = module3.lessons;
