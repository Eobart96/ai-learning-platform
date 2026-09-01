import { a1CefrCoverage } from "./a1CefrCoverage";
import { findCourseLesson, getCourseModule } from "./courseEngine";
import type { CourseLesson, CourseModule } from "./courseTypes";
import { validateCourseModules } from "./courseValidation";
import { module1 } from "./modules/module1";
import { module2 } from "./modules/module2";
import { module3 } from "./modules/module3";
import { module4 } from "./modules/module4";
import { module5 } from "./modules/module5";
import { module6 } from "./modules/module6";
import { module7 } from "./modules/module7";
import { module8 } from "./modules/module8";

export const a1CourseModules: CourseModule[] = [module1, module2, module3, module4, module5, module6, module7, module8];

export const allA1Lessons = a1CourseModules.flatMap((module) => module.lessons);
export const getA1Module = (order: number): CourseModule => getCourseModule(a1CourseModules, order);
export const findA1Lesson = (slug: string): CourseLesson | undefined => findCourseLesson(a1CourseModules, slug);

validateCourseModules(a1CourseModules, a1CefrCoverage);
