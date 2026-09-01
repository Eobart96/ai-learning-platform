"use client";

import { getPracticeMatch, isPracticeFilled } from "../data/coursePractice";
import { type CourseLesson, type CourseModule, type KnowledgeCheck, type LessonStatus, type StepPractice } from "../data/courseTypes";
import { type ProgressMap } from "../hooks/useCourseSession";
import { CoursePairPracticeEditor } from "./CoursePairPracticeEditor";
import { SlovakTextInput } from "./SlovakKeyboard";

export const courseStatusLabels: Record<LessonStatus, string> = {
  not_started: "Не начата",
  in_progress: "В процессе",
  completed: "Завершена",
};

export type CourseMaterialActions = {
  openLesson: (lesson: CourseLesson) => void;
  setStep: (step: number) => void;
  updatePractice: (practice: StepPractice, answer: string) => void;
  checkPractice: (practice: StepPractice) => void;
  selectKnowledgeAnswer: (check: KnowledgeCheck, option: string) => void;
  checkAllReinforcement: () => void;
  resetLesson: (lesson: CourseLesson) => void;
  backToTopics: () => void;
  openChat: () => void;
  finishInteractiveAssessment: () => void;
};

export type CourseMaterialViewModel = {
  activeModule: CourseModule;
  lessons: CourseLesson[];
  selectedLesson: CourseLesson;
  progress: ProgressMap;
  lessonStep: number;
  practiceAnswers: Record<string, string>;
  practiceResults: Record<string, boolean>;
  checkSelections: Record<string, string>;
  reinforcementPractices: StepPractice[];
};

export function CourseMaterialView({ model: { activeModule, lessons, selectedLesson, progress, lessonStep, practiceAnswers, practiceResults, checkSelections, reinforcementPractices }, actions }: { model: CourseMaterialViewModel; actions: CourseMaterialActions }) {
  const displayLessonNumber = (lesson: CourseLesson) => lessons.findIndex((item) => item.slug === lesson.slug) + 1;
  const interactiveAssessment = selectedLesson.assessmentMode === "interactive";
  const scoredKnowledgeChecks = interactiveAssessment ? [] : selectedLesson.knowledgeChecks;
  const selectedCheckScore = scoredKnowledgeChecks.filter((check) => checkSelections[check.id] === check.answer).length;
  const selectedChecksAnswered = scoredKnowledgeChecks.filter((check) => checkSelections[check.id]).length;
  const reinforcementScore = reinforcementPractices.filter((practice) => practiceResults[practice.id] === true).length;
  const reinforcementAnswered = reinforcementPractices.filter((practice) => practice.id in practiceResults).length;
  const reinforcementPassed = reinforcementScore === reinforcementPractices.length;
  const allReinforcementFilled = reinforcementPractices.every((practice) => isPracticeFilled(practice, practiceAnswers[practice.id] ?? ""));
  const materialAssessmentStep = selectedLesson.materialAssessmentStep !== false;
  const totalLessonSteps = selectedLesson.sections.length + (materialAssessmentStep ? 1 : 0);
  const currentLessonStep = Math.min(lessonStep, totalLessonSteps - 1);
  const isCheckStep = materialAssessmentStep && currentLessonStep === selectedLesson.sections.length;
  const isLastMaterialStep = !isCheckStep && currentLessonStep === selectedLesson.sections.length - 1;
  const currentSection = selectedLesson.sections[currentLessonStep];
  const currentSectionOptional = currentSection?.importance === "extra";
  const currentPractice = selectedLesson.stepPractices.find((practice) => practice.sectionIndex === currentLessonStep);
  const currentPracticePassed = currentPractice ? practiceResults[currentPractice.id] === true : true;
  const currentPracticeCorrect = currentSectionOptional || currentPracticePassed;
  const extraSectionCount = selectedLesson.sections.filter((section) => section.importance === "extra").length;
  const checksPassed = selectedCheckScore === scoredKnowledgeChecks.length;

  return <div className="course-material-layout">
    <label className="course-lesson-picker">
      <span>Тема модуля</span>
      <select
        aria-label={`Выберите тему ${activeModule.title}`}
        value={selectedLesson.slug}
        onChange={(event) => {
          const lesson = lessons.find((item) => item.slug === event.target.value);
          if (lesson) actions.openLesson(lesson);
        }}
      >
        {lessons.map((lesson) => (
          <option key={lesson.slug} value={lesson.slug}>
            {displayLessonNumber(lesson)}. {lesson.title} · {courseStatusLabels[progress[lesson.slug] ?? "not_started"]}
          </option>
        ))}
      </select>
    </label>
    <aside className="course-lesson-list" aria-label={`Темы ${activeModule.title}`}>
      <span>Темы модуля</span>
      {lessons.map((lesson) => (
        <button type="button" key={lesson.slug} className={lesson.slug === selectedLesson.slug ? "active" : ""} onClick={() => actions.openLesson(lesson)}>
          <i>{progress[lesson.slug] === "completed" ? "✓" : displayLessonNumber(lesson)}</i><span>{lesson.title}<small>{courseStatusLabels[progress[lesson.slug] ?? "not_started"]}</small></span>
        </button>
      ))}
    </aside>
    <article className="course-material">
      <div className="course-material-heading">
        <div><span>Тема {displayLessonNumber(selectedLesson)} · {selectedLesson.duration} основной материал{extraSectionCount > 0 ? ` · ${extraSectionCount} дополнительно` : ""}</span><h3>{selectedLesson.title}</h3><p>{selectedLesson.slovakTitle}</p></div>
        <span className={`course-status ${progress[selectedLesson.slug]}`}>{courseStatusLabels[progress[selectedLesson.slug]]}</span>
      </div>
      <div className="course-stepper" aria-label={`Шаг ${currentLessonStep + 1} из ${totalLessonSteps}`}>
        <div><span>Шаг {currentLessonStep + 1} из {totalLessonSteps}{currentSectionOptional ? " · дополнительно" : ""}</span><strong>{isCheckStep ? interactiveAssessment ? "Практические задания" : "Проверка знаний" : currentSection.title}</strong></div>
        <div className="course-stepper-track"><i style={{ width: `${((currentLessonStep + 1) / totalLessonSteps) * 100}%` }} /></div>
        <nav aria-label="Разделы темы">{Array.from({ length: totalLessonSteps }, (_, index) => { const optional = selectedLesson.sections[index]?.importance === "extra"; return <button type="button" key={index} className={`${index === currentLessonStep ? "active" : index < currentLessonStep ? "visited" : ""} ${optional ? "optional" : ""}`.trim()} onClick={() => actions.setStep(index)} aria-label={`Открыть ${optional ? "дополнительный " : ""}шаг ${index + 1}`} />; })}</nav>
      </div>
      {currentLessonStep === 0 && <div className="course-goals"><strong>После темы вы сможете</strong><ul>{selectedLesson.goals.map((goal) => <li key={goal}>{goal}</li>)}</ul></div>}
      {currentLessonStep === 0 && <section className="course-theory" aria-labelledby="course-theory-title"><div className="course-theory-heading"><span>Сначала теория</span><h4 id="course-theory-title">Как устроена тема</h4></div><p className="course-theory-summary">{selectedLesson.theory.summary}</p><div className="course-theory-rules"><h5>Необходимые правила</h5><ol>{selectedLesson.theory.rules.map((rule) => <li key={rule}>{rule}</li>)}</ol></div><div className="course-theory-examples"><h5>Примеры с разбором</h5>{selectedLesson.theory.examples.map((example) => <article key={example.slovak}><strong lang="sk">{example.slovak}</strong><span>{example.russian}</span><p>{example.explanation}</p></article>)}</div><p className="course-theory-next">После этого блока изучите материал шага и выполните практику ниже.</p></section>}
      {!isCheckStep && currentSection && <section className={`course-content-section course-content-step ${currentSectionOptional ? "extra" : "core"}`} key={currentSection.title}><div className="course-content-heading"><span>{currentSectionOptional ? "Дополнительное углубление" : "Обязательный материал"}</span><h4>{currentSection.title}</h4>{currentSectionOptional && <small>Этот раздел можно пропустить: он не влияет на завершение темы и основную статистику.</small>}</div>{currentSection.paragraphs?.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}{currentSection.items && <ul>{currentSection.items.map((item) => <li key={item}>{item}</li>)}</ul>}{currentSection.table && <div className="course-table-wrap"><table><thead><tr>{currentSection.table.headers.map((header, headerIndex) => <th key={`${currentSection.title}-${header}-${headerIndex}`}>{header}</th>)}</tr></thead><tbody>{currentSection.table.rows.map((row, index) => <tr key={`${currentSection.title}-${index}`}>{row.map((cell, cellIndex) => <td key={`${cell}-${cellIndex}`}>{cell}</td>)}</tr>)}</tbody></table></div>}{currentSection.note && <aside className="course-note"><b>Обратите внимание</b>{currentSection.note}</aside>}</section>}
      {!isCheckStep && currentPractice && (() => {
        const answer = practiceAnswers[currentPractice.id] ?? "";
        const checked = currentPractice.id in practiceResults;
        const correct = practiceResults[currentPractice.id] === true;
        const match = checked && !correct ? getPracticeMatch(currentPractice, answer) : correct ? "correct" : "incorrect";
        const close = match === "missing_diacritics" || match === "close";
        const feedbackTitle = correct ? "Верно — можно идти дальше" : match === "missing_diacritics" ? "Почти — проверьте диакритику" : match === "close" ? "Ответ близок — проверьте форму" : "Попробуйте ещё раз";
        const feedbackNote = match === "missing_diacritics" ? "Буквы и порядок слов совпадают, но в словацком диакритика различает нормативное написание и иногда значение." : match === "close" ? "Есть небольшое расхождение: это может быть опечатка или важная грамматическая форма." : "";
        return <section className={`course-practice ${currentSectionOptional ? "extra" : "core"} ${checked ? correct ? "correct" : close ? "close" : "incorrect" : ""}`} aria-labelledby={`${currentPractice.id}-title`}><div className="course-practice-heading"><span>{currentSectionOptional ? "Дополнительная практика" : "Обязательная практика"}</span><strong id={`${currentPractice.id}-title`}>{currentPractice.prompt}</strong></div>{currentPractice.type === "choice" && <div className="course-practice-options">{currentPractice.options?.map((option) => <button type="button" key={option} className={answer === option ? "selected" : ""} onClick={() => actions.updatePractice(currentPractice, option)}>{option}</button>)}</div>}{currentPractice.type === "text" && <SlovakTextInput value={answer} onChange={(value) => actions.updatePractice(currentPractice, value)} placeholder="Введите ответ по-словацки" />}{currentPractice.type === "order" && <><div className="course-order-answer">{answer || "Соберите фразу из слов ниже"}</div><div className="course-practice-options">{currentPractice.tokens?.map((token, index) => <button type="button" key={`${token}-${index}`} onClick={() => actions.updatePractice(currentPractice, `${answer} ${token}`.trim())}>{token}</button>)}</div>{answer && <button type="button" className="course-practice-clear" onClick={() => actions.updatePractice(currentPractice, "")}>Очистить</button>}</>}{currentPractice.type === "pairs" && <CoursePairPracticeEditor practice={currentPractice} value={answer} checked={checked} onChange={(value) => actions.updatePractice(currentPractice, value)} />}<div className="course-practice-footer"><small>Подсказка: {currentPractice.hint}</small><button type="button" onClick={() => actions.checkPractice(currentPractice)} disabled={!isPracticeFilled(currentPractice, answer)}>Проверить ответ</button></div>{checked && <aside role="status"><b>{feedbackTitle}</b>{feedbackNote && <span>{feedbackNote}</span>}<span>{currentPractice.explanation}</span>{!correct && <small>Нормативный ответ: {currentPractice.answer}</small>}</aside>}</section>;
      })()}
      {isCheckStep && !interactiveAssessment && <section className="course-check" aria-labelledby="course-check-title"><div className="course-check-heading"><div><span>Мини-проверка</span><h4 id="course-check-title">Проверьте себя</h4></div><strong>{selectedCheckScore}/{selectedLesson.knowledgeChecks.length}</strong></div><p>Выберите ответ — результат и объяснение появятся сразу.</p><div className="course-check-list">{selectedLesson.knowledgeChecks.map((check, index) => { const selected = checkSelections[check.id]; const answered = Boolean(selected); const correct = selected === check.answer; return <fieldset className={answered ? correct ? "correct" : "incorrect" : ""} key={check.id}><legend>{index + 1}. {check.question}</legend><div>{check.options.map((option) => <button type="button" key={option} className={selected === option ? "selected" : ""} onClick={() => actions.selectKnowledgeAnswer(check, option)}><i>{selected === option ? correct ? "✓" : "×" : ""}</i>{option}</button>)}</div>{answered && <aside><b>{correct ? "Верно" : "Нужно исправить"}</b><span>{check.explanation}</span>{!correct && <small>Правильный ответ: {check.answer}</small>}</aside>}</fieldset>; })}</div>{selectedChecksAnswered === selectedLesson.knowledgeChecks.length && <div className={`course-check-summary ${selectedCheckScore === selectedLesson.knowledgeChecks.length ? "passed" : "retry"}`}><strong>{selectedCheckScore === selectedLesson.knowledgeChecks.length ? "Отлично — материал понятен" : "Стоит повторить сложные места"}</strong><span>{selectedCheckScore === selectedLesson.knowledgeChecks.length ? "Можно переходить к заданиям на закрепление." : "Измените выбранные ответы после повторения материала."}</span></div>}</section>}
      {isCheckStep && interactiveAssessment && <section className="course-reinforcement course-check" aria-labelledby="course-interactive-assessment-title"><div className="course-current-task"><span>Практика из PDF</span><strong id="course-interactive-assessment-title">Выполните шесть заданий самостоятельно</strong><small>Можно проверять задания по одному и исправлять ответы.</small></div>{reinforcementPractices.map((practice, index) => { const answer = practiceAnswers[practice.id] ?? ""; const checked = practice.id in practiceResults; const correct = practiceResults[practice.id] === true; const match = checked ? getPracticeMatch(practice, answer) : null; return <fieldset className={checked ? correct ? "correct" : "incorrect" : ""} key={practice.id}><legend>{index + 1}. {practice.prompt}</legend>{practice.type === "choice" && <div className="course-check-options">{practice.options?.map((option) => <button type="button" key={option} className={answer === option ? "selected" : ""} onClick={() => actions.updatePractice(practice, option)}>{option}</button>)}</div>}{practice.type === "text" && <div className="course-reinforcement-text"><SlovakTextInput value={answer} onChange={(value) => actions.updatePractice(practice, value)} placeholder="Введите ответ" /></div>}{practice.type === "order" && <><div className="course-check-options">{practice.tokens?.map((token, tokenIndex) => <button type="button" key={`${token}-${tokenIndex}`} onClick={() => actions.updatePractice(practice, `${answer}${answer ? practice.tokenSeparator ?? " " : ""}${token}`)}>{token}</button>)}</div>{answer && <div className="course-reinforcement-assembled"><span>{answer}</span><button type="button" onClick={() => actions.updatePractice(practice, "")}>Очистить</button></div>}</>}{practice.type === "pairs" && <CoursePairPracticeEditor practice={practice} value={answer} checked={checked} onChange={(value) => actions.updatePractice(practice, value)} />}<div className="course-reinforcement-check"><small>Подсказка: {practice.hint}</small><button type="button" onClick={() => actions.checkPractice(practice)} disabled={!isPracticeFilled(practice, answer)}>Проверить</button></div>{checked && <p className={correct ? "correct" : "incorrect"}>{correct ? `Верно. ${practice.explanation}` : match === "missing_diacritics" ? `Почти — проверьте диакритику. ${practice.explanation}` : match === "close" ? `Почти — проверьте написание. ${practice.explanation}` : `Пока неверно. ${practice.explanation}`}</p>}</fieldset>; })}{reinforcementAnswered === reinforcementPractices.length && <div className={`course-check-summary ${reinforcementPassed ? "passed" : "retry"}`}><strong>{reinforcementPassed ? "Все задания выполнены" : "Есть ответы для исправления"}</strong><span>{reinforcementPassed ? "Можно завершить тему." : "Исправьте неверные ответы и проверьте их повторно."}</span></div>}<div className="course-check-all"><span>Заполните все шесть заданий, затем проверьте их вместе.</span><button type="button" onClick={actions.checkAllReinforcement} disabled={!allReinforcementFilled}>Проверить всё</button></div></section>}
      <div className="course-actions course-step-actions"><button type="button" className="secondary" onClick={() => currentLessonStep === 0 ? actions.backToTopics() : actions.setStep(currentLessonStep - 1)}>{currentLessonStep === 0 ? "← К списку тем" : "← Предыдущий шаг"}</button><button type="button" className="secondary course-reset" onClick={() => actions.resetLesson(selectedLesson)}>Сбросить тему</button>{!isCheckStep && <button type="button" onClick={() => !materialAssessmentStep && isLastMaterialStep ? actions.openChat() : actions.setStep(currentLessonStep + 1)} disabled={!currentPracticeCorrect}>{!materialAssessmentStep && isLastMaterialStep ? "Перейти к финальному тесту →" : currentSectionOptional && !currentPracticePassed ? "Пропустить дополнительный шаг →" : "Следующий шаг →"}</button>}{isCheckStep && !interactiveAssessment && <button type="button" onClick={actions.openChat} disabled={!checksPassed}>Перейти к закреплению →</button>}{isCheckStep && interactiveAssessment && <button type="button" onClick={actions.finishInteractiveAssessment} disabled={!reinforcementPassed}>Завершить задания и получить итог →</button>}</div>
      {isCheckStep && !interactiveAssessment && !checksPassed && <p className="course-step-hint">Ответьте правильно на все вопросы, чтобы перейти к закреплению.</p>}
      {isCheckStep && interactiveAssessment && !reinforcementPassed && <p className="course-step-hint">Выполните правильно все шесть заданий, чтобы завершить тему.</p>}
      {!isCheckStep && currentPractice && !currentPracticeCorrect && <p className="course-step-hint">Выполните обязательную практику шага, чтобы продолжить.</p>}
    </article>
  </div>;
}
