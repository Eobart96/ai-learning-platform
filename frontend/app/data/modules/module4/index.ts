import { getPlannedModule } from "../../a1CourseRoadmap";
import { definePlannedModule } from "../moduleFactory";
import { nominativeLesson } from "./lessons/nominative";
import { accusativeNounsLesson } from "./lessons/accusative-nouns";
import { accusativeAgreementLesson } from "./lessons/accusative-agreement";
import { locativeVNaLesson } from "./lessons/locative-v-na";
import { genitiveQuantityLesson } from "./lessons/genitive-quantity";
import { genitiveAbsenceLesson } from "./lessons/genitive-absence";
import { genitiveDoLesson } from "./lessons/genitive-do";
import { prepositionGovernmentLesson } from "./lessons/preposition-government";
import { whereDirectionOriginLesson } from "./lessons/where-direction-origin";
import { dativeInstrumentalModelsLesson } from "./lessons/dative-instrumental-models";
import { simpleRouteLesson } from "./lessons/simple-route";

const plannedModule = getPlannedModule(4);
if (!plannedModule) throw new Error("Module 4 roadmap is missing");

const lessonGroups = [
  { id: "case-roles", title: "Субъект и прямой объект", slovakTitle: "Podmet a priamy predmet", description: "Nominatív и базовые модели Akuzatív существительных и согласования.", lessons: [nominativeLesson, accusativeNounsLesson, accusativeAgreementLesson] },
  { id: "location-direction", title: "Место и направление", slovakTitle: "Miesto a smer", description: "Lokál, направление с do, вопросы kde/kam/odkiaľ и простой маршрут.", lessons: [locativeVNaLesson, genitiveDoLesson, whereDirectionOriginLesson, simpleRouteLesson] },
  { id: "quantity-absence", title: "Количество и отсутствие", slovakTitle: "Množstvo a neprítomnosť", description: "Частотные модели Genitív после количества, bez и конструкций отсутствия.", lessons: [genitiveQuantityLesson, genitiveAbsenceLesson] },
  { id: "government-models", title: "Управление и готовые модели", slovakTitle: "Väzby a hotové modely", description: "Выбор падежа после предлога и частотные бытовые модели Datív/Inštrumentál.", lessons: [prepositionGovernmentLesson, dativeInstrumentalModelsLesson] },
];

export const module4 = definePlannedModule({ planned: plannedModule, lessonGroups, contentRequirements: { minSections: 5, minStepPractices: 5, minTheoryRules: 5 } });
export const module4Lessons = module4.lessons;
