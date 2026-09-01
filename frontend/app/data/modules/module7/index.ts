import { getPlannedModule } from "../../a1CourseRoadmap";
import { defineLessonsFromPlannedContent, definePlannedModule } from "../moduleFactory";
import { definePlannedLesson } from "../plannedLessonFactory";
import { pastRegularContent } from "./lessons/past-regular";
import { pastFrequentContent } from "./lessons/past-frequent";
import { yesterdayContent } from "./lessons/yesterday";
import { futureBudemContent } from "./lessons/future-budem";
import { futureQuestionsNegationContent } from "./lessons/future-questions-negation";
import { yesterdayTodayTomorrowContent } from "./lessons/yesterday-today-tomorrow";
import { invitationArrangementContent } from "./lessons/invitation-arrangement";

const plannedModule = getPlannedModule(7);
if (!plannedModule) throw new Error("Module 7 roadmap is missing");

const registeredLessons = defineLessonsFromPlannedContent(
  plannedModule,
  [pastRegularContent, pastFrequentContent, yesterdayContent, futureBudemContent, futureQuestionsNegationContent, yesterdayTodayTomorrowContent, invitationArrangementContent],
  (planned, content, index) => definePlannedLesson(7, index + 1, planned, content),
);

export const module7 = definePlannedModule({ planned: plannedModule, lessons: registeredLessons });
export const module7Lessons = module7.lessons;
