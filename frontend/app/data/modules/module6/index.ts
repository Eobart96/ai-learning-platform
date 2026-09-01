import { getPlannedModule } from "../../a1CourseRoadmap";
import { definePlannedModule } from "../moduleFactory";
import { familyLesson } from "./lessons/family";
import { homeLesson } from "./lessons/home";
import { shoppingLesson } from "./lessons/shopping";
import { foodLesson } from "./lessons/food";
import { restaurantLesson } from "./lessons/restaurant";
import { transportLesson } from "./lessons/transport";
import { workStudyLesson } from "./lessons/work-study";
import { hobbiesLesson } from "./lessons/hobbies";
import { timeRoutineLesson } from "./lessons/time-routine";
import { meetingScheduleLesson } from "./lessons/meeting-schedule";
import { peopleDescriptionLesson } from "./lessons/people-description";
import { cityPlacesLesson } from "./lessons/city-places";
import { healthLesson } from "./lessons/health";
import { weatherClothesLesson } from "./lessons/weather-clothes";
import { formsContactDetailsLesson } from "./lessons/forms-contact-details";
import { personalMessageLesson } from "./lessons/personal-message";
import { noticesMenusTimetablesLesson } from "./lessons/notices-menus-timetables";
import { shortListeningLesson } from "./lessons/short-listening";

const plannedModule = getPlannedModule(6);
if (!plannedModule) throw new Error("Module 6 roadmap is missing");

const lessonGroups = [
  { id: "people-home", title: "Люди и дом", slovakTitle: "Ľudia a domov", description: "Семья, жильё и нейтральное описание людей.", lessons: [familyLesson, homeLesson, peopleDescriptionLesson] },
  { id: "shopping-food", title: "Покупки и еда", slovakTitle: "Nakupovanie a jedlo", description: "Магазин, продукты, ресторан и простой заказ.", lessons: [shoppingLesson, foodLesson, restaurantLesson] },
  { id: "movement-schedule", title: "Движение, город и расписание", slovakTitle: "Pohyb, mesto a čas", description: "Транспорт, распорядок, встречи и городские места.", lessons: [transportLesson, timeRoutineLesson, meetingScheduleLesson, cityPlacesLesson] },
  { id: "work-leisure-health", title: "Работа, досуг и самочувствие", slovakTitle: "Práca, voľný čas a zdravie", description: "Работа/учёба, хобби, здоровье, погода и одежда.", lessons: [workStudyLesson, hobbiesLesson, healthLesson, weatherClothesLesson] },
  { id: "practical-texts", title: "Практические тексты и сообщения", slovakTitle: "Praktické texty a správy", description: "Формы, личные сообщения, объявления, меню, расписания и короткое аудирование.", lessons: [formsContactDetailsLesson, personalMessageLesson, noticesMenusTimetablesLesson, shortListeningLesson] },
];

export const module6 = definePlannedModule({ planned: plannedModule, lessonGroups, contentRequirements: { minSections: 5, minStepPractices: 5, minTheoryRules: 4 } });
export const module6Lessons = module6.lessons;
