"use client";

import { useMemo } from "react";

import { buildModuleFinalQuestions, buildReinforcementPractices, getPracticeMatch, isCorePractice, isPracticeFilled, type ModuleFinalQuestion } from "../data/coursePractice";
import { buildCourseResetScope, buildLessonSummary, nextMistakeRecord, removeActivityScope, removeLessonScope, removeMistakeScope, resetProgressScope, type MistakeRecord } from "../data/courseProgress";
import { type CourseLesson, type CourseModule, type KnowledgeCheck, type StepPractice } from "../data/courseTypes";
import { type CourseSession } from "./useCourseSession";

const finalPassingPercent = 70;
export function useCourseProgressController({ module, lesson, session }: { module: CourseModule; lesson: CourseLesson; session: CourseSession }) {
  const { activeModule, progress, lessonSteps, checkSelections, practiceAnswers, practiceResults, mistakes, finalSelections, finalCompletedModules, lessonSummaries, setProgress, setLessonSteps, setCheckSelections, setPracticeAnswers, setPracticeResults, setMistakes, setFinalSelections, setFinalCompletedModules, setChatHistories, setLessonSummaries, setSelectedSlug } = session;
  const reinforcementPractices = useMemo(() => buildReinforcementPractices(lesson), [lesson]);
  const finalQuestions = useMemo(() => buildModuleFinalQuestions(module.lessons), [module]);
  const completedCount = module.lessons.filter((item) => progress[item.slug] === "completed").length;
  const reinforcementScore = reinforcementPractices.filter((practice) => practiceResults[practice.id] === true).length;
  const reinforcementPassed = reinforcementScore === reinforcementPractices.length;
  const allReinforcementFilled = reinforcementPractices.every((practice) => isPracticeFilled(practice, practiceAnswers[practice.id] ?? ""));
  const activeLessonSlugs = new Set(module.lessons.map((item) => item.slug));
  const optionalPracticeIds = new Set(module.lessons.flatMap((item) => item.stepPractices.filter((practice) => !isCorePractice(item, practice)).map((practice) => practice.id)));
  const activeMistakes = Object.values(mistakes).filter((mistake) => !mistake.mastered && activeLessonSlugs.has(mistake.lessonSlug));
  const dueMistakes = activeMistakes.filter((mistake) => !mistake.dueAt || new Date(mistake.dueAt).getTime() <= Date.now());
  const totalPracticeCount = module.lessons.reduce((sum, item) => sum + item.stepPractices.filter((practice) => isCorePractice(item, practice)).length + (item.assessmentMode === "interactive" ? buildReinforcementPractices(item).length : item.knowledgeChecks.length), 0);
  const correctPracticeCount = module.lessons.reduce((sum, item) => sum + item.stepPractices.filter((practice) => isCorePractice(item, practice) && practiceResults[practice.id]).length + (item.assessmentMode === "interactive" ? buildReinforcementPractices(item).filter((practice) => practiceResults[practice.id]).length : item.knowledgeChecks.filter((check) => checkSelections[check.id] === check.answer).length), 0);
  const totalMistakeAttempts = Object.values(mistakes).filter((mistake) => activeLessonSlugs.has(mistake.lessonSlug) && !optionalPracticeIds.has(mistake.id)).reduce((sum, mistake) => sum + mistake.attempts, 0);
  const accuracy = correctPracticeCount + totalMistakeAttempts === 0 ? 0 : Math.round((correctPracticeCount / (correctPracticeCount + totalMistakeAttempts)) * 100);
  const finalCompleted = Boolean(finalCompletedModules[String(activeModule)]);
  const finalScore = finalQuestions.filter((question) => finalSelections[question.id] === question.answer).length;
  const finalPassingScore = Math.ceil(finalQuestions.length * finalPassingPercent / 100);

  const scheduleMistake = (id: string, prompt: string, answer: string, correct: boolean) => {
    setMistakes((current) => {
      const next = nextMistakeRecord({ previous: current[id], id, lessonSlug: lesson.slug, prompt, answer, correct, nowMs: Date.now() });
      return next ? { ...current, [id]: next } : current;
    });
  };

  const updatePractice = (practice: StepPractice, answer: string) => {
    setPracticeAnswers((current) => ({ ...current, [practice.id]: answer }));
    setPracticeResults((current) => { const next = { ...current }; delete next[practice.id]; return next; });
  };

  const checkPractice = (practice: StepPractice) => {
    const correct = getPracticeMatch(practice, practiceAnswers[practice.id] ?? "") === "correct";
    setPracticeResults((current) => ({ ...current, [practice.id]: correct }));
    scheduleMistake(practice.id, practice.prompt, practice.answer, correct);
  };

  const selectKnowledgeAnswer = (check: KnowledgeCheck, option: string) => {
    setCheckSelections((current) => ({ ...current, [check.id]: option }));
    scheduleMistake(check.id, check.question, check.answer, option === check.answer);
  };

  const resetLesson = (target: CourseLesson): boolean => {
    if (!window.confirm(`Сбросить прогресс темы «${target.title}»?`)) return false;
    const scope = buildCourseResetScope([target]);
    setProgress((current) => resetProgressScope(current, scope));
    setLessonSteps((current) => ({ ...current, [target.slug]: 0 }));
    setPracticeAnswers((current) => removeActivityScope(current, scope));
    setPracticeResults((current) => removeActivityScope(current, scope));
    setCheckSelections((current) => removeActivityScope(current, scope));
    setFinalSelections((current) => removeActivityScope(current, scope));
    setFinalCompletedModules((current) => ({ ...current, [String(activeModule)]: false }));
    setMistakes((current) => removeMistakeScope(current, scope));
    setChatHistories((current) => removeLessonScope(current, scope));
    setLessonSummaries((current) => removeLessonScope(current, scope));
    return true;
  };

  const resetModule = (): boolean => {
    if (!window.confirm(`Сбросить прогресс, ответы, ошибки и итоговый тест для ${module.title}?`)) return false;
    const scope = buildCourseResetScope(module.lessons);
    setProgress((current) => resetProgressScope(current, scope));
    setLessonSteps((current) => removeLessonScope(current, scope));
    setPracticeAnswers((current) => removeActivityScope(current, scope));
    setPracticeResults((current) => removeActivityScope(current, scope));
    setCheckSelections((current) => removeActivityScope(current, scope));
    setFinalSelections((current) => removeActivityScope(current, scope));
    setFinalCompletedModules((current) => ({ ...current, [String(activeModule)]: false }));
    setMistakes((current) => removeMistakeScope(current, scope));
    setChatHistories((current) => removeLessonScope(current, scope));
    setLessonSummaries((current) => removeLessonScope(current, scope));
    return true;
  };

  const finishReinforcement = () => {
    if (!reinforcementPassed) return;
    const summary = buildLessonSummary({ lesson, reinforcementPractices, practiceResults, checkSelections, mistakes, userTurns: reinforcementScore });
    setLessonSummaries((current) => ({ ...current, [lesson.slug]: summary }));
    setProgress((current) => ({ ...current, [lesson.slug]: "completed" }));
  };

  return {
    selectors: { completedCount, reinforcementPractices, reinforcementScore, reinforcementPassed, allReinforcementFilled, activeLessonSlugs, activeMistakes, dueMistakes, totalPracticeCount, correctPracticeCount, accuracy, finalQuestions, finalCompleted, finalScore, finalPassed: finalCompleted && finalScore >= finalPassingScore, currentSummary: lessonSummaries[lesson.slug], finalPassingPercent },
    actions: {
      startLesson: (target: CourseLesson) => setProgress((current) => ({ ...current, [target.slug]: current[target.slug] === "completed" ? "completed" : "in_progress" })),
      openMistake: (target: CourseLesson, mistake: MistakeRecord) => { setSelectedSlug(target.slug); setLessonSteps((current) => ({ ...current, [target.slug]: target.stepPractices.find((practice) => practice.id === mistake.id)?.sectionIndex ?? target.sections.length })); },
      setLessonStep: (step: number) => { const total = lesson.sections.length + (lesson.materialAssessmentStep !== false ? 1 : 0); setLessonSteps((current) => ({ ...current, [lesson.slug]: Math.max(0, Math.min(step, total - 1)) })); },
      updatePractice,
      checkPractice,
      selectKnowledgeAnswer,
      checkAllReinforcement: () => { if (allReinforcementFilled) reinforcementPractices.forEach(checkPractice); },
      finishReinforcement,
      resetLesson,
      resetModule,
      selectFinalAnswer: (question: ModuleFinalQuestion, option: string) => { setFinalCompletedModules((current) => ({ ...current, [String(activeModule)]: false })); setFinalSelections((current) => ({ ...current, [question.id]: option })); },
      submitFinal: () => setFinalCompletedModules((current) => ({ ...current, [String(activeModule)]: true })),
    },
  };
}
