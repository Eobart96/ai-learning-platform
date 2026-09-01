"use client";

import { useEffect, useMemo, useState } from "react";

import { a1CourseModules, allA1Lessons, getA1Module } from "../data/a1Course";
import { orderedModuleLessons as getOrderedModuleLessons } from "../data/courseEngine";
import { type CourseLesson } from "../data/courseTypes";
import { useCourseProgressController } from "../hooks/useCourseProgressController";
import { useCourseSession } from "../hooks/useCourseSession";
import { CourseExercises } from "./CourseExercises";
import { CourseReading } from "./CourseReading";
import { CourseVocabulary } from "./CourseVocabulary";
import { CourseHomework } from "./CourseHomework";
import { CourseMaterialView } from "./CourseMaterialView";
import { CourseReinforcementView } from "./CourseReinforcementView";
import { CourseTopicsView } from "./CourseTopicsView";
import { CourseFinalView, CourseReviewView, CourseStatsView } from "./CourseProgressViews";

type CourseView = "topics" | "material" | "exercises" | "reading" | "vocabulary" | "homework" | "reinforcement" | "review" | "final" | "stats";
type ModuleArea = "learning" | "exercises" | "reading" | "vocabulary" | "homework" | "review";

export function CourseScreen({ requestedArea = "learning", onAreaChange }: { requestedArea?: ModuleArea; onAreaChange?: (area: ModuleArea) => void }) {
  const [view, setView] = useState<CourseView>("topics");
  const [topicGroup, setTopicGroup] = useState("root");
  const session = useCourseSession();
  const { activeModule, selectedSlug, fontSize, progress, lessonSteps, checkSelections, practiceAnswers, practiceResults, mistakes, finalSelections, lessonSummaries, setActiveModule, setSelectedSlug, setFontSize, persistenceError } = session;

  const activeCourseModule = useMemo(() => getA1Module(activeModule), [activeModule]);
  const orderedModuleLessons = useMemo(() => getOrderedModuleLessons(activeCourseModule), [activeCourseModule]);
  const displayLessonNumber = (lesson: CourseLesson): number => orderedModuleLessons.findIndex((item) => item.slug === lesson.slug) + 1;
  const selectedLesson = useMemo(
    () => activeCourseModule.lessons.find((lesson) => lesson.slug === selectedSlug) ?? activeCourseModule.lessons[0],
    [activeCourseModule, selectedSlug],
  );
  const progressController = useCourseProgressController({ module: activeCourseModule, lesson: selectedLesson, session });
  const { completedCount, reinforcementPractices, activeLessonSlugs, activeMistakes, dueMistakes, totalPracticeCount, correctPracticeCount, accuracy, finalQuestions, finalCompleted, finalScore, finalPassed, currentSummary, finalPassingPercent } = progressController.selectors;
  const allLessonsCompleted = completedCount === activeCourseModule.lessons.length;

  useEffect(() => {
    if (requestedArea === "learning") { setView("topics"); return; }
    setView(requestedArea === "exercises" ? "exercises" : requestedArea === "reading" ? "reading" : requestedArea === "vocabulary" ? "vocabulary" : requestedArea === "homework" ? "homework" : "review");
  }, [requestedArea]);

  const openMaterial = (lesson: CourseLesson) => {
    setSelectedSlug(lesson.slug);
    progressController.actions.startLesson(lesson);
    setView("material");
  };

  const selectModule = (moduleOrder: number) => {
    const nextModule = getA1Module(moduleOrder);
    setActiveModule(nextModule.order);
    setTopicGroup("root");
    setSelectedSlug(nextModule.lessons[0].slug);
    setView("topics");
  };

  const continueAfterSummary = () => {
    const nextLesson = orderedModuleLessons[displayLessonNumber(selectedLesson)];
    if (nextLesson) openMaterial(nextLesson);
    else setView("final");
  };
  return (
    <section className="course" data-font-size={fontSize} aria-labelledby="course-title">
      <header className="course-hero">
        <div>
          <label className="course-module-switcher">
            <span>Учебный модуль</span>
            <select value={activeModule} onChange={(event) => selectModule(Number(event.target.value))} aria-label="Выберите учебный модуль">
              {a1CourseModules.map((module) => <option value={module.order} key={module.slug}>{module.title}</option>)}
            </select>
          </label>
          <span className="course-kicker">Интерактивный курс · {activeCourseModule.level}</span>
          <h2 id="course-title">{activeCourseModule.title}</h2>
          <p>{activeCourseModule.description}</p>
        </div>
        <div className="course-progress" aria-label={`Завершено ${completedCount} из ${activeCourseModule.lessons.length} тем`}>
          <strong>{completedCount}/{activeCourseModule.lessons.length}</strong>
          <span>тем завершено</span>
          <div><i style={{ width: `${(completedCount / activeCourseModule.lessons.length) * 100}%` }} /></div>
        </div>
        <fieldset className="course-font-control">
          <legend>Размер текста</legend>
          {(["normal", "large", "extra-large"] as const).map((size, index) => (
            <button type="button" key={size} className={fontSize === size ? "active" : ""} onClick={() => setFontSize(size)} aria-pressed={fontSize === size} aria-label={["Обычный размер текста", "Крупный размер текста", "Очень крупный размер текста"][index]}>A{index > 0 ? <sup>{index + 1}</sup> : ""}</button>
          ))}
        </fieldset>
      </header>
      {persistenceError && <p className="course-persistence-error" role="alert">Данные временно не синхронизированы с базой: {persistenceError}</p>}

      {requestedArea === "learning" && <nav className="course-breadcrumbs" aria-label={`Навигация обучения ${activeCourseModule.title}`}>
        <button type="button" className={view === "topics" ? "active" : ""} onClick={() => setView("topics")}>Темы</button>
        <span>›</span>
        <button type="button" className={view === "material" ? "active" : ""} disabled={view === "topics"} onClick={() => setView("material")}>Материал</button>
        <span>›</span>
        <button type="button" className={view === "reinforcement" ? "active" : ""} disabled={progress[selectedLesson.slug] === "not_started"} onClick={() => setView("reinforcement")}>Закрепление</button>
        <span>·</span>
        <button type="button" className={view === "final" ? "active" : ""} disabled={!allLessonsCompleted} onClick={() => setView("final")}>Итоговый тест</button>
        <span>·</span>
        <button type="button" className={view === "stats" ? "active" : ""} onClick={() => setView("stats")}>Статистика</button>
      </nav>}

      {view === "topics" && <CourseTopicsView
        model={{ module: activeCourseModule, lessons: orderedModuleLessons, selectedGroupId: topicGroup, progress, mistakeCount: Object.keys(mistakes).length, activeMistakeCount: activeMistakes.length, finalCompleted, finalPassed, finalScore, finalQuestionCount: finalQuestions.length, completedCount, accuracy, correctPracticeCount, totalPracticeCount }}
        actions={{
          selectGroup: setTopicGroup,
          openLesson: openMaterial,
          openReview: () => setView("review"),
          openFinal: () => setView("final"),
          openStats: () => setView("stats"),
        }}
      />}
      {view === "exercises" && <CourseExercises completedLessonSlugs={allA1Lessons.filter((lesson) => progress[lesson.slug] === "completed").map((lesson) => lesson.slug)} />}
      {view === "reading" && <CourseReading completedLessonSlugs={allA1Lessons.filter((lesson) => progress[lesson.slug] === "completed").map((lesson) => lesson.slug)} />}
      {view === "vocabulary" && <CourseVocabulary completedLessonSlugs={allA1Lessons.filter((lesson) => progress[lesson.slug] === "completed").map((lesson) => lesson.slug)} />}
      {view === "homework" && <CourseHomework completedLessonSlugs={allA1Lessons.filter((lesson) => progress[lesson.slug] === "completed").map((lesson) => lesson.slug)} mistakeHints={Object.values(mistakes).filter((mistake) => !mistake.mastered).map((mistake) => ({ lessonSlug: mistake.lessonSlug, text: `${mistake.prompt}: ${mistake.answer}` }))} />}

      {view === "material" && <CourseMaterialView
        model={{ activeModule: activeCourseModule, lessons: orderedModuleLessons, selectedLesson, progress, lessonStep: lessonSteps[selectedLesson.slug] ?? 0, practiceAnswers, practiceResults, checkSelections, reinforcementPractices }}
        actions={{
          openLesson: openMaterial,
          setStep: progressController.actions.setLessonStep,
          updatePractice: progressController.actions.updatePractice,
          checkPractice: progressController.actions.checkPractice,
          selectKnowledgeAnswer: progressController.actions.selectKnowledgeAnswer,
          checkAllReinforcement: progressController.actions.checkAllReinforcement,
          resetLesson: (lesson) => { if (progressController.actions.resetLesson(lesson)) setView("topics"); },
          backToTopics: () => setView("topics"),
          openChat: () => setView("reinforcement"),
          finishInteractiveAssessment: () => { progressController.actions.finishReinforcement(); setView("reinforcement"); },
        }}
      />}
      {view === "review" && <CourseReviewView
        model={{ mistakes, moduleLessonSlugs: activeLessonSlugs, dueCount: dueMistakes.length, activeCount: activeMistakes.length }}
        actions={{ openMistake: (lesson, mistake) => { progressController.actions.openMistake(lesson, mistake); setView("material"); }, back: () => { setView("topics"); onAreaChange?.("learning"); } }}
      />}
      {view === "final" && <CourseFinalView
        model={{ module: activeCourseModule, moduleCount: a1CourseModules.length, lessons: orderedModuleLessons, questions: finalQuestions, selections: finalSelections, completed: finalCompleted, passingPercent: finalPassingPercent }}
        actions={{
          selectAnswer: progressController.actions.selectFinalAnswer,
          submit: progressController.actions.submitFinal,
          back: () => setView("topics"),
          openLesson: openMaterial,
          nextModule: () => selectModule(activeModule + 1),
        }}
      />}
      {view === "stats" && <CourseStatsView
        model={{ module: activeCourseModule, lessons: orderedModuleLessons, progress, practiceResults, checkSelections, summaries: lessonSummaries, completedCount, accuracy, correctPracticeCount, totalPracticeCount, dueCount: dueMistakes.length }}
        actions={{ back: () => setView("topics"), reset: () => { if (progressController.actions.resetModule()) setView("topics"); } }}
      />}
      {view === "reinforcement" && <CourseReinforcementView
        model={{ lesson: selectedLesson, lessonNumber: displayLessonNumber(selectedLesson), lessonCount: orderedModuleLessons.length, summary: currentSummary, practices: reinforcementPractices, practiceAnswers, practiceResults }}
        actions={{
          backToMaterial: () => setView("material"),
          updatePractice: progressController.actions.updatePractice,
          checkPractice: progressController.actions.checkPractice,
          checkAll: progressController.actions.checkAllReinforcement,
          finish: progressController.actions.finishReinforcement,
          continueAfterSummary,
        }}
      />}
    </section>
  );
}
