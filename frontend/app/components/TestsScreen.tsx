"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { type ModuleTest, type RoadmapModule, getModuleTest, getTestModules, submitModuleTest } from "../lib/api";

const slovakKeys = ["á", "ä", "č", "ď", "é", "í", "ĺ", "ľ", "ň", "ó", "ô", "ŕ", "š", "ť", "ú", "ý", "ž", "ch", "dz", "dž"];

type TestsScreenProps = { courseSlug?: string };

export function TestsScreen({ courseSlug = "slovak-a1" }: TestsScreenProps) {
  const isMath = courseSlug === "math-exam-prep";
  const inputsRef = useRef<Record<string, HTMLTextAreaElement | null>>({});
  const [modules, setModules] = useState<RoadmapModule[]>([]);
  const [test, setTest] = useState<ModuleTest | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [focusedQuestionId, setFocusedQuestionId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadTest = async (moduleId: number) => {
    setLoading(true); setError(null); setShowForm(false); setAnswers({});
    try { setTest(await getModuleTest(moduleId)); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "Не удалось загрузить тест."); }
    finally { setLoading(false); }
  };

  useEffect(() => { const load = async () => { try { const nextModules = await getTestModules(courseSlug); setModules(nextModules); const initial = nextModules.find((module) => module.test_available) ?? nextModules[0]; if (initial) await loadTest(initial.id); else setLoading(false); } catch (cause) { setError(cause instanceof Error ? cause.message : "Не удалось загрузить тесты."); setLoading(false); } }; void load(); }, [courseSlug]);

  const insertKey = (key: string) => {
    if (!focusedQuestionId) return;
    const textarea = inputsRef.current[focusedQuestionId];
    const current = answers[focusedQuestionId] ?? "";
    const start = textarea?.selectionStart ?? current.length; const end = textarea?.selectionEnd ?? start;
    setAnswers((state) => ({ ...state, [focusedQuestionId]: `${current.slice(0, start)}${key}${current.slice(end)}` }));
    requestAnimationFrame(() => { textarea?.focus(); textarea?.setSelectionRange(start + key.length, start + key.length); });
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); if (!test || submitting) return;
    if (test.questions.some((question) => !(answers[question.id] ?? "").trim())) { setError("Ответь на все вопросы теста."); return; }
    setSubmitting(true); setError(null);
    try { const result = await submitModuleTest(test.module_id, answers); setTest(result); setShowForm(false); setAnswers({}); const nextModules = await getTestModules(courseSlug); setModules(nextModules); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "Не удалось проверить тест."); }
    finally { setSubmitting(false); }
  };

  const heading = isMath ? "Математические тесты" : "Тесты по модулям";
  const intro = isMath ? "Итоговый тест проверяет вычисления из завершённого блока." : "Итоговый тест открывается после завершения всех тем модуля.";
  return <section className="native-tests" aria-labelledby="tests-title"><div className="native-exercises-heading"><div><p className="native-eyebrow">Проверка знаний</p><h2 id="tests-title">{heading}</h2><p>{intro}</p></div></div>{error && <p className="native-notice error" role="alert">{error}</p>}{loading && <p className="native-notice">Загружаю тесты…</p>}<div className="native-test-module-list">{modules.map((module) => <button key={module.id} type="button" className={`native-test-module ${test?.module_id === module.id ? "active" : ""}`} onClick={() => void loadTest(module.id)}><span>{module.title}</span><small>{module.test_available ? module.test_passed ? `Пройден · ${module.test_score}/100` : "Готов к прохождению" : `Пройдено ${module.lessons.filter((lesson) => lesson.status === "completed").length} из ${module.lessons.length} тем`}</small></button>)}</div>{!loading && test && <div className="native-test-content"><div className="native-test-meta"><strong>{test.module_title}</strong><span>{test.available ? `${test.questions.length} заданий · минимум ${test.passing_score}/100` : `Пройдено ${test.completed_lessons} из ${test.total_lessons} тем`}</span></div>{!test.available ? <p className="native-notice">Заверши все темы модуля, чтобы открыть итоговый тест.</p> : <>{test.score !== null && <div className={`native-test-result ${test.passed ? "passed" : "failed"}`}><strong>{test.passed ? "Тест пройден" : "Тест нужно повторить"}</strong><span>{test.score}/100</span></div>}{test.history.length > 0 && <details className="native-test-history"><summary>История попыток · {test.history.length}</summary>{test.history.map((attempt) => <details key={attempt.id} className="native-test-attempt"><summary>{attempt.passed ? "Пройден" : "Не пройден"} · {attempt.score}/100</summary>{attempt.details_available ? attempt.mistakes.length ? <div>{attempt.mistakes.map((mistake) => <p key={mistake.question_id}><b>{mistake.question}</b><br />Твой ответ: {mistake.submitted_answer || "—"}<br />Правильно: {mistake.expected_answer}{mistake.explanation && <><br /><small>Почему: {mistake.explanation}</small></>}</p>)}</div> : <p>Ошибок нет.</p> : <p>Детализация этой старой попытки недоступна.</p>}</details>)}</details>}{!showForm ? <button className="native-submit-answer" type="button" onClick={() => setShowForm(true)}>{test.score === null ? "Сдать тест" : "Пересдать"}</button> : <form className="native-test-form" onSubmit={(event) => void submit(event)}>{test.questions.map((question, index) => <fieldset key={question.id}><legend>{index + 1}. {question.question}</legend>{question.type === "choice" ? question.options.map((option) => <label key={option}><input type="radio" name={question.id} value={option} checked={answers[question.id] === option} onChange={() => setAnswers((state) => ({ ...state, [question.id]: option }))} /> {option}</label>) : <textarea ref={(node) => { inputsRef.current[question.id] = node; }} rows={2} value={answers[question.id] ?? ""} onFocus={() => setFocusedQuestionId(question.id)} onChange={(event) => setAnswers((state) => ({ ...state, [question.id]: event.target.value }))} placeholder={isMath ? "Число или дробь" : "Твой ответ"} required />}</fieldset>)}{!isMath && <div className="native-keyboard" aria-label="Словацкие буквы">{slovakKeys.map((key) => <button key={key} type="button" onClick={() => insertKey(key)} disabled={!focusedQuestionId}>{key}</button>)}</div>}<button className="native-submit-answer" type="submit" disabled={submitting}>{submitting ? "Проверяю…" : test.passed ? "Пройти ещё раз" : "Проверить тест"}</button></form>}</>}</div>}</section>;
}
