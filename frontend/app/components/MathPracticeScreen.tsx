"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { type Assessment, type Exercise, type LessonOption, type RoadmapModule, generateMathExercise, getCourseRoadmap, submitLessonAnswer } from "../lib/api";
import { MathNotation } from "./MathNotation";

const courseSlug = "math-exam-prep";

export function MathPracticeScreen() {
  const [modules, setModules] = useState<RoadmapModule[]>([]);
  const [selectedTopic, setSelectedTopic] = useState<LessonOption | null>(null);
  const [exercise, setExercise] = useState<Exercise | null>(null);
  const [answer, setAnswer] = useState("");
  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const completedModules = useMemo(
    () => modules.map((module) => ({ ...module, lessons: module.lessons.filter((lesson) => lesson.status === "completed") })).filter((module) => module.lessons.length > 0),
    [modules],
  );
  const completedTopics = useMemo(() => completedModules.flatMap((module) => module.lessons), [completedModules]);
  const topicCount = completedTopics.length;

  useEffect(() => {
    void (async () => {
      try { setModules(await getCourseRoadmap(courseSlug)); }
      catch (cause) { setError(cause instanceof Error ? cause.message : "Не удалось загрузить темы математики."); }
      finally { setLoading(false); }
    })();
  }, []);

  const generateForTopic = async (topic: LessonOption) => {
    setSubmitting(true); setError(null); setAssessment(null); setAnswer("");
    try { setExercise(await generateMathExercise(topic.id)); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "Не удалось создать новое задание."); }
    finally { setSubmitting(false); }
  };

  const selectTopic = (topic: LessonOption) => {
    setSelectedTopic(topic);
    void generateForTopic(topic);
  };

  const startRandomPractice = () => {
    if (!completedTopics.length || submitting) return;
    const alternatives = completedTopics.filter((topic) => topic.id !== selectedTopic?.id);
    const topics = alternatives.length ? alternatives : completedTopics;
    selectTopic(topics[Math.floor(Math.random() * topics.length)]);
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedTopic || !exercise || !answer.trim() || submitting) return;
    setSubmitting(true); setError(null);
    try { const result = await submitLessonAnswer(selectedTopic.id, exercise.id, answer); setAssessment(result.assessment); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "Не удалось проверить ответ."); }
    finally { setSubmitting(false); }
  };

  return <section className="native-exercises math-practice" aria-labelledby="math-practice-title">
    <div className="native-exercises-heading"><div><p className="native-eyebrow">Бесконечная практика</p><h2 id="math-practice-title">Задания по пройденным темам</h2><p>Выбери пройденную тему — новое задание появится сразу. Можно заниматься сколько угодно.</p></div></div>
    {error && <p className="native-notice error" role="alert">{error}</p>}
    {loading && <p className="native-notice">Загружаю темы…</p>}
    {!loading && <div className="math-practice-layout">
      <aside className="math-practice-topics" aria-label="Пройденные темы для практики"><div><h3>Выбери тему</h3><span>{topicCount} пройденных тем</span></div><section className="math-practice-random"><strong>Случайная практика</strong><small>Новое задание из всех пройденных тем.</small><button type="button" className="native-submit-answer" onClick={startRandomPractice} disabled={!topicCount || submitting}>{submitting ? "Создаю…" : "Случайное задание"}</button></section>{completedModules.length === 0 && <p className="native-notice">Заверши первую тему курса, чтобы открыть практику.</p>}{completedModules.map((module) => <section key={module.id}><h4>{module.title}</h4>{module.lessons.map((topic) => <button key={topic.id} type="button" className={selectedTopic?.id === topic.id ? "active" : ""} onClick={() => selectTopic(topic)} disabled={submitting}><span>{topic.title}</span><small>Пройдена</small></button>)}</section>)}</aside>
      <div className="native-answer-form math-practice-workspace">{!selectedTopic ? <p className="native-notice">Выбери пройденную тему слева — сгенерирую первый пример.</p> : <><div className="native-answer-heading"><span>Выбранная тема</span><strong>{selectedTopic.title}</strong></div>{exercise ? <article className="native-exercise-card active" aria-live="polite"><span>НОВОЕ ЗАДАНИЕ</span><strong><MathNotation>{exercise.question}</MathNotation></strong></article> : <p className="native-notice">Создаю задание…</p>}<form onSubmit={(event) => void submit(event)}><textarea rows={3} value={answer} onChange={(event) => setAnswer(event.target.value)} placeholder="Введи число или дробь, например 3/4" disabled={!exercise || submitting} required /><button className="native-submit-answer" type="submit" disabled={!exercise || !answer.trim() || submitting}>{submitting ? "Проверяю…" : "Проверить ответ"}</button></form><button className="native-refresh" type="button" onClick={() => void generateForTopic(selectedTopic)} disabled={submitting}>{submitting ? "Создаю…" : "Следующее задание"}</button>{assessment && <article className={`native-assessment ${assessment.is_correct ? "correct" : "wrong"}`}><div><strong>{assessment.is_correct ? "Верно" : "Нужно исправить"}</strong><span>{assessment.score}/100</span></div>{!assessment.is_correct && <p><b>Правильный ответ:</b> {assessment.corrected_answer}</p>}<p>{assessment.explanation}</p></article>}</>}</div>
    </div>}
  </section>;
}
