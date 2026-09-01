"use client";

import { findA1Lesson } from "../data/a1Course";
import { buildReinforcementPractices, isCorePractice, type ModuleFinalQuestion } from "../data/coursePractice";
import { type CourseLesson, type CourseModule } from "../data/courseTypes";
import { type LessonSummary, type MistakeRecord, type ProgressMap } from "../hooks/useCourseSession";
import { courseStatusLabels } from "./CourseMaterialView";

export type CourseReviewViewModel = { mistakes: Record<string, MistakeRecord>; moduleLessonSlugs: Set<string>; dueCount: number; activeCount: number };
export type CourseReviewActions = { openMistake: (lesson: CourseLesson, mistake: MistakeRecord) => void; back: () => void };

export function CourseReviewView({ model: { mistakes, moduleLessonSlugs, dueCount, activeCount }, actions }: { model: CourseReviewViewModel; actions: CourseReviewActions }) {
  const moduleMistakes = Object.values(mistakes).filter((mistake) => moduleLessonSlugs.has(mistake.lessonSlug));
  return <section className="course-review">
    <div className="course-section-heading"><div><span>Персональное повторение</span><h3>Работа над ошибками</h3></div><p>{dueCount ? `Доступно сейчас: ${dueCount}` : activeCount ? "Следующее повторение запланировано" : "Все сохранённые ошибки исправлены."}</p></div>
    {!moduleMistakes.length ? <div className="course-empty"><strong>Ошибок в этом модуле пока нет</strong><p>Продолжайте обучение — сложные вопросы автоматически появятся здесь.</p></div> : <div className="course-review-list">{moduleMistakes.map((mistake) => {
      const lesson = findA1Lesson(mistake.lessonSlug);
      if (!lesson) return null;
      const reviewLocked = !mistake.mastered && Boolean(mistake.dueAt) && new Date(mistake.dueAt!).getTime() > Date.now();
      return <article key={mistake.id} className={mistake.mastered ? "mastered" : ""}><span>{lesson.title} · {mistake.attempts} ошиб.</span><h4>{mistake.prompt}</h4><p>Правильный ответ: <b>{mistake.answer}</b></p><small>{mistake.mastered ? "Закреплено" : !mistake.dueAt || new Date(mistake.dueAt).getTime() <= Date.now() ? "Можно повторить сейчас" : `Следующее повторение: ${new Date(mistake.dueAt).toLocaleDateString("ru-RU")}`}</small><button type="button" disabled={reviewLocked} onClick={() => actions.openMistake(lesson, mistake)}>{mistake.mastered ? "Повторить ещё раз" : "Исправить в теме →"}</button></article>;
    })}</div>}
    <div className="course-actions"><button type="button" className="secondary" onClick={actions.back}>← К обучению</button></div>
  </section>;
}

export type CourseFinalActions = { selectAnswer: (question: ModuleFinalQuestion, option: string) => void; submit: () => void; back: () => void; openLesson: (lesson: CourseLesson) => void; nextModule: () => void };

export type CourseFinalViewModel = { module: CourseModule; moduleCount: number; lessons: CourseLesson[]; questions: ModuleFinalQuestion[]; selections: Record<string, string>; completed: boolean; passingPercent: number };

export function CourseFinalView({ model: { module, moduleCount, lessons, questions, selections, completed, passingPercent }, actions }: { model: CourseFinalViewModel; actions: CourseFinalActions }) {
  const score = questions.filter((question) => selections[question.id] === question.answer).length;
  const passingScore = Math.ceil(questions.length * passingPercent / 100);
  const percentage = questions.length === 0 ? 0 : Math.round(score / questions.length * 100);
  const passed = completed && score >= passingScore;
  const incorrectLessons = completed ? module.lessons.filter((lesson) => questions.some((question) => question.lessonSlug === lesson.slug && selections[question.id] !== question.answer)) : [];
  const displayLessonNumber = (lesson: CourseLesson) => lessons.findIndex((item) => item.slug === lesson.slug) + 1;
  return <section className="course-final">
    <div className="course-section-heading"><div><span>Финал {module.title}</span><h3>Итоговый тест</h3></div><p>По 2 ключевых вопроса из каждой темы · всего {questions.length}. Для сдачи нужно не менее {passingPercent}% ({passingScore} правильных ответов).</p></div>
    {completed && <div className={`course-final-score ${passed ? "passed" : "failed"}`} role="status" aria-live="polite"><strong>{percentage}%</strong><span><b>{passed ? "Модуль сдан" : "Порог пока не достигнут"}</b>{score}/{questions.length} правильных ответов · нужно минимум {passingScore}</span>{passed && module.order < moduleCount && <button type="button" onClick={actions.nextModule}>Перейти к Module {module.order + 1} →</button>}</div>}
    {completed && !passed && incorrectLessons.length > 0 && <div className="course-final-review" aria-labelledby="course-final-review-title"><div><strong id="course-final-review-title">Что повторить перед новой попыткой</strong><span>Исправьте ответы сразу или вернитесь к материалу этих тем.</span></div><div>{incorrectLessons.map((lesson) => <button type="button" key={lesson.slug} onClick={() => actions.openLesson(lesson)}>{displayLessonNumber(lesson)}. {lesson.title} →</button>)}</div></div>}
    <div className="course-check-list">{questions.map((question, index) => { const selected = selections[question.id]; const showResult = completed && Boolean(selected); return <fieldset className={showResult ? selected === question.answer ? "correct" : "incorrect" : ""} key={question.id}><legend>{index + 1}. {question.question}</legend><small>{question.lessonTitle}</small><div>{question.options.map((option) => <button type="button" className={selected === option ? "selected" : ""} key={option} onClick={() => actions.selectAnswer(question, option)}>{option}</button>)}</div>{showResult && <aside><b>{selected === question.answer ? "✓ Верно" : `Правильный ответ: ${question.answer}`}</b><span><strong>Почему:</strong> {question.explanation}</span></aside>}</fieldset>; })}</div>
    <div className="course-actions"><button type="button" className="secondary" onClick={actions.back}>← К темам</button><button type="button" disabled={questions.some((question) => !selections[question.id])} onClick={actions.submit}>Проверить итоговый тест</button></div>
  </section>;
}

export type CourseStatsViewModel = { module: CourseModule; lessons: CourseLesson[]; progress: ProgressMap; practiceResults: Record<string, boolean>; checkSelections: Record<string, string>; summaries: Record<string, LessonSummary>; completedCount: number; accuracy: number; correctPracticeCount: number; totalPracticeCount: number; dueCount: number };
export type CourseStatsActions = { back: () => void; reset: () => void };

export function CourseStatsView({ model: { module, lessons, progress, practiceResults, checkSelections, summaries, completedCount, accuracy, correctPracticeCount, totalPracticeCount, dueCount }, actions }: { model: CourseStatsViewModel; actions: CourseStatsActions }) {
  return <section className="course-stats"><div className="course-section-heading"><div><span>{module.title}</span><h3>Статистика обучения</h3></div><p>Данные сохраняются в локальной SQLite-базе приложения.</p></div><div className="course-stat-grid"><article><strong>{completedCount}/{module.lessons.length}</strong><span>тем завершено</span></article><article><strong>{accuracy}%</strong><span>точность обязательных ответов</span></article><article><strong>{correctPracticeCount}/{totalPracticeCount}</strong><span>обязательных заданий решено</span></article><article><strong>{dueCount}</strong><span>повторений сейчас</span></article></div><div className="course-topic-stats">{lessons.map((lesson, index) => { const corePractices = lesson.stepPractices.filter((practice) => isCorePractice(lesson, practice)); const assessmentPractices = lesson.assessmentMode === "interactive" ? buildReinforcementPractices(lesson) : []; const checks = lesson.assessmentMode === "interactive" ? [] : lesson.knowledgeChecks; const solved = corePractices.filter((practice) => practiceResults[practice.id]).length + assessmentPractices.filter((practice) => practiceResults[practice.id]).length + checks.filter((check) => checkSelections[check.id] === check.answer).length; const total = corePractices.length + assessmentPractices.length + checks.length; const summary = summaries[lesson.slug]; return <article key={lesson.slug}><div><b>{index + 1}. {lesson.title}</b><span>{courseStatusLabels[progress[lesson.slug] ?? "not_started"]}</span></div><div><i style={{ width: `${(solved / total) * 100}%` }} /></div><small>{solved}/{total} обязательных заданий{summary ? ` · понимание ${summary.understanding}%` : ""}</small></article>; })}</div><div className="course-actions"><button type="button" className="secondary" onClick={actions.back}>← К темам</button><button type="button" className="course-danger" onClick={actions.reset}>Сбросить прогресс модуля</button></div></section>;
}
