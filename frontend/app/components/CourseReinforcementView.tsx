"use client";

import { getPracticeMatch, isPracticeFilled } from "../data/coursePractice";
import { type CourseLesson, type StepPractice } from "../data/courseTypes";
import { type LessonSummary } from "../hooks/useCourseSession";
import { CoursePairPracticeEditor } from "./CoursePairPracticeEditor";
import { SlovakTextInput } from "./SlovakKeyboard";

export type CourseReinforcementActions = {
  backToMaterial: () => void;
  updatePractice: (practice: StepPractice, answer: string) => void;
  checkPractice: (practice: StepPractice) => void;
  checkAll: () => void;
  finish: () => void;
  continueAfterSummary: () => void;
};

export type CourseReinforcementViewModel = {
  lesson: CourseLesson;
  lessonNumber: number;
  lessonCount: number;
  summary?: LessonSummary;
  practices: StepPractice[];
  practiceAnswers: Record<string, string>;
  practiceResults: Record<string, boolean>;
};

export function CourseReinforcementView({ model: { lesson, lessonNumber, lessonCount, summary, practices, practiceAnswers, practiceResults }, actions }: { model: CourseReinforcementViewModel; actions: CourseReinforcementActions }) {
  const score = practices.filter((practice) => practiceResults[practice.id] === true).length;
  const answered = practices.filter((practice) => practice.id in practiceResults).length;
  const passed = score === practices.length;
  const allFilled = practices.every((practice) => isPracticeFilled(practice, practiceAnswers[practice.id] ?? ""));
  const summaryMistakes = [...new Set(summary?.mistakes ?? summary?.review.filter((item) => item.includes("→")) ?? [])];
  const summaryRecommendations = summary?.mistakes === undefined && summaryMistakes.length > 0
    ? ["Исправьте отмеченные формы и повторите их без подсказки.", "Вернитесь к ключевым фразам темы через 3 дня."]
    : summary?.review ?? [];

  return <div className="course-chat-layout">
    <aside className="course-chat-context"><span>{lesson.reinforcementLabel ?? "Закрепление темы"}</span><h3>{lesson.title}</h3><p>{lesson.slovakTitle}</p><div><b>Цели</b>{lesson.goals.map((goal) => <small key={goal}>✓ {goal}</small>)}</div><button type="button" onClick={actions.backToMaterial}>← Вернуться к материалу</button></aside>
    <div className="course-chat">
      <header><div>Самостоятельная практика</div><small>{summary ? "Тема завершена" : `${score}/${practices.length} верно`}</small></header>
      {summary ? <section className="course-chat-summary" aria-labelledby="course-chat-summary-title">
        <div><span>Итог темы</span><h3 id="course-chat-summary-title">{summary.level}</h3><p>{summary.evidence ? `Выполнено заданий: ${summary.evidence.coreCorrect}/${summary.evidence.coreTotal} · закрепление: ${summary.userTurns}/${practices.length}.` : "Оценка учитывает материал, мини-проверку и самостоятельное закрепление."}</p></div>
        <strong aria-label={`Понимание темы ${summary.understanding} процентов`}>{summary.understanding}%<small>понимание темы</small></strong>
        <div className="course-chat-summary-details"><article><h4>Освоенные навыки</h4><ul>{summary.strengths.map((item, index) => <li key={`${index}:${item}`}>{item}</li>)}</ul></article><article><h4>Ошибки и исправления</h4>{summaryMistakes.length ? <ul>{summaryMistakes.map((item, index) => <li key={`${index}:${item}`}>{item}</li>)}</ul> : <p>Активных ошибок в обязательной части не зафиксировано.</p>}</article><article><h4>Что делать дальше</h4><ul>{summaryRecommendations.map((item, index) => <li key={`${index}:${item}`}>{item}</li>)}</ul></article></div>
      </section> : <section className="course-reinforcement course-check" aria-labelledby="course-reinforcement-title">
        <div className="course-current-task"><span>{lesson.reinforcementLabel ?? "Закрепление темы"}</span><strong id="course-reinforcement-title">{lesson.reinforcementTitle ?? "Выполните все задания самостоятельно"}</strong><small>Ответы проверяются по материалу урока. Неверный вариант можно изменить.</small></div>
        {practices.map((practice, index) => {
          const answer = practiceAnswers[practice.id] ?? "";
          const checked = practice.id in practiceResults;
          const correct = practiceResults[practice.id] === true;
          const match = checked ? getPracticeMatch(practice, answer) : null;
          return <fieldset className={checked ? correct ? "correct" : "incorrect" : ""} key={practice.id}><legend>{index + 1}. {practice.prompt}</legend>{practice.type === "choice" && <div className="course-check-options">{practice.options?.map((option) => <button type="button" key={option} className={answer === option ? "selected" : ""} onClick={() => actions.updatePractice(practice, option)}>{option}</button>)}</div>}{practice.type === "text" && <div className="course-reinforcement-text"><SlovakTextInput value={answer} onChange={(value) => actions.updatePractice(practice, value)} placeholder="Введите ответ по-словацки" /></div>}{practice.type === "order" && <><div className="course-check-options">{practice.tokens?.map((token, tokenIndex) => <button type="button" key={`${token}-${tokenIndex}`} onClick={() => actions.updatePractice(practice, `${answer}${answer ? practice.tokenSeparator ?? " " : ""}${token}`)}>{token}</button>)}</div>{answer && <div className="course-reinforcement-assembled"><span>{answer}</span><button type="button" onClick={() => actions.updatePractice(practice, "")}>Очистить</button></div>}</>}{practice.type === "pairs" && <CoursePairPracticeEditor practice={practice} value={answer} checked={checked} onChange={(value) => actions.updatePractice(practice, value)} />}<div className="course-reinforcement-check"><small>Подсказка: {practice.hint}</small><button type="button" onClick={() => actions.checkPractice(practice)} disabled={!isPracticeFilled(practice, answer)}>Проверить</button></div>{checked && <p className={correct ? "correct" : "incorrect"}>{correct ? `Верно. ${practice.explanation}` : match === "missing_diacritics" ? `Почти — проверьте диакритику. ${practice.explanation}` : match === "close" ? `Почти — проверьте написание. ${practice.explanation}` : `Пока неверно. ${practice.explanation}`}</p>}</fieldset>;
        })}
        {answered === practices.length && <div className={`course-check-summary ${passed ? "passed" : "retry"}`}><strong>{passed ? "Закрепление пройдено" : "Есть ответы для исправления"}</strong><span>{passed ? "Можно завершить тему." : "Исправьте неверные ответы и проверьте их повторно."}</span></div>}
        <div className="course-check-all"><span>Можно проверять задания по одному или заполнить всё сразу.</span><button type="button" onClick={actions.checkAll} disabled={!allFilled}>Проверить всё</button></div>
      </section>}
      <footer>{summary ? <><span>Тема завершена. Прогресс сохранён.</span><button type="button" onClick={actions.continueAfterSummary}>{lessonNumber < lessonCount ? "Следующая тема →" : "К итоговому тесту →"}</button></> : <><span>Проверено: {answered}/{practices.length} · верно {score}</span><button type="button" onClick={actions.finish} disabled={!passed}>Завершить закрепление и получить итог</button></>}</footer>
    </div>
  </div>;
}
