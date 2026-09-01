import { getPlannedModule } from "../../a1CourseRoadmap";
import { defineLessonsFromPlannedContent, definePlannedModule } from "../moduleFactory";
import { definePlannedLesson } from "../plannedLessonFactory";
import { socialEtiquetteContent } from "./lessons/social-etiquette";
import { supportedDialogueContent } from "./lessons/supported-dialogue";
import { everydayTaskContent } from "./lessons/everyday-task";
import { understandMessageContent } from "./lessons/understand-message";
import { voiceDescriptionContent } from "./lessons/voice-description";
import { writtenProfileContent } from "./lessons/written-profile";
import { simpleMediationContent } from "./lessons/simple-mediation";
import { repairStrategiesContent } from "./lessons/repair-strategies";
import { a1ScenariosContent } from "./lessons/a1-scenarios";

const plannedModule = getPlannedModule(8);
if (!plannedModule) throw new Error("Module 8 roadmap is missing");

const registeredLessons = defineLessonsFromPlannedContent(
  plannedModule,
  [socialEtiquetteContent, supportedDialogueContent, everydayTaskContent, understandMessageContent, voiceDescriptionContent, writtenProfileContent, simpleMediationContent, repairStrategiesContent, a1ScenariosContent],
  (planned, content, index) => definePlannedLesson(8, index + 1, planned, content),
);

export const module8 = definePlannedModule({ planned: plannedModule, lessons: registeredLessons });
export const module8Lessons = module8.lessons;
