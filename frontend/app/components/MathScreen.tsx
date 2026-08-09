"use client";

import { FormEvent, useEffect, useState } from "react";
import { type Assessment, type Exercise, type Lesson, type RoadmapModule, type StudyRoadmap, askMathTutor, completeLesson, generateMathExercise, getCourseRoadmap, getLesson, getStudyRoadmap, submitLessonAnswer } from "../lib/api";
import { MathNotation } from "./MathNotation";

const courseSlug = "math-exam-prep";

type MathChatMessage = { role: "user" | "assistant"; content: string };

function formatMathTutorText(content: string) {
  return content
    .replace(/\\\(([\s\S]*?)\\\)/g, "$1")
    .replace(/\\\[([\s\S]*?)\\\]/g, "$1")
    .replace(/\\(?:d?frac)\{([^{}]+)\}\{([^{}]+)\}/g, "($1)/($2)")
    .replace(/\\sqrt\{([^{}]+)\}/g, "√($1)")
    .replace(/\\times/g, "×")
    .replace(/\\cdot/g, "·")
    .replace(/\\div/g, "÷")
    .replace(/\\left|\\right|\\,/g, "");
}

function MathTutorChat({ lesson }: { lesson: Lesson }) {
  const [messages, setMessages] = useState<MathChatMessage[]>([]);
  const [question, setQuestion] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => { setMessages([]); setQuestion(""); setError(null); }, [lesson.id]);
  const send = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const message = question.trim();
    if (!message || sending) return;
    setQuestion(""); setSending(true); setError(null);
    setMessages((current) => [...current, { role: "user", content: message }]);
    try {
      const result = await askMathTutor(lesson.id, message);
      setMessages((current) => [...current, { role: "assistant", content: result.response }]);
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Не удалось получить ответ от AI."); }
    finally { setSending(false); }
  };
  return <section className="math-tutor-chat" aria-labelledby="math-tutor-title"><div className="math-tutor-heading"><div><span>AI-ПОМОЩНИК</span><strong id="math-tutor-title">Вопрос по математике</strong></div><small>Тема: {lesson.title}</small></div><div className="math-tutor-messages" aria-live="polite">{messages.length ? messages.map((message, index) => <p className={`math-tutor-message ${message.role}`} key={`${message.role}-${index}`}>{formatMathTutorText(message.content)}</p>) : <p className="math-tutor-empty">Спроси о правиле, шаге решения или своей ошибке.</p>}{sending && <p className="math-tutor-thinking">AI думает…</p>}</div>{error && <p className="native-notice error" role="alert">{error}</p>}<form className="math-tutor-form" onSubmit={(event) => void send(event)}><textarea rows={3} value={question} onChange={(event) => setQuestion(event.target.value)} placeholder="Например: почему здесь сначала выполняется деление?" disabled={sending} /><button className="native-submit-answer" type="submit" disabled={!question.trim() || sending}>{sending ? "Отвечаю…" : "Спросить AI"}</button></form></section>;
}

export function MathScreen() {
  const [roadmap, setRoadmap] = useState<RoadmapModule[]>([]);
  const [studyRoadmap, setStudyRoadmap] = useState<StudyRoadmap | null>(null);
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [exerciseId, setExerciseId] = useState<number | null>(null);
  const [generatedExercise, setGeneratedExercise] = useState<Exercise | null>(null);
  const [answer, setAnswer] = useState("");
  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const selectedExercise = generatedExercise ?? lesson?.exercises.find((item) => item.id === exerciseId) ?? null;

  const loadRoadmap = async () => {
    const nextRoadmap = await getCourseRoadmap(courseSlug);
    setRoadmap(nextRoadmap);
    return nextRoadmap;
  };
  const loadLesson = async (lessonId: number, clearAssessment = true) => {
    const nextLesson = await getLesson(lessonId);
    setLesson(nextLesson);
    setExerciseId((current) => nextLesson.exercises.some((item) => item.id === current) ? current : nextLesson.exercises[0]?.id ?? null);
    setGeneratedExercise(null);
    if (clearAssessment) setAssessment(null);
    setAnswer("");
  };
  useEffect(() => { void (async () => { try { const [nextRoadmap, nextStudyRoadmap] = await Promise.all([loadRoadmap(), getStudyRoadmap(courseSlug)]); setStudyRoadmap(nextStudyRoadmap); const first = nextRoadmap.flatMap((module) => module.lessons).find((item) => item.status === "current") ?? nextRoadmap.flatMap((module) => module.lessons).find((item) => item.status === "completed"); if (first) await loadLesson(first.id); } catch (cause) { setError(cause instanceof Error ? cause.message : "Не удалось загрузить модуль математики."); } finally { setLoading(false); } })(); }, []);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!lesson || !selectedExercise || !answer.trim() || submitting) return;
    setSubmitting(true); setError(null);
    try { const result = await submitLessonAnswer(lesson.id, selectedExercise.id, answer); setAssessment(result.assessment); setAnswer(""); await loadLesson(lesson.id, false); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "Не удалось проверить ответ."); }
    finally { setSubmitting(false); }
  };
  const finishLesson = async () => {
    if (!lesson || submitting) return;
    setSubmitting(true); setError(null);
    try { await completeLesson(lesson.id); const nextRoadmap = await loadRoadmap(); const next = nextRoadmap.flatMap((module) => module.lessons).find((item) => item.status === "current"); if (next) await loadLesson(next.id); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "Сначала выполни хотя бы одно задание темы."); }
    finally { setSubmitting(false); }
  };
  const generateExercise = async () => {
    if (!lesson || submitting) return;
    setSubmitting(true); setError(null);
    try { const exercise = await generateMathExercise(lesson.id); setGeneratedExercise(exercise); setAssessment(null); setAnswer(""); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "Не удалось создать новое задание."); }
    finally { setSubmitting(false); }
  };

  return <section className="native-exercises math-exercises" aria-labelledby="math-title">
    <div className="native-exercises-heading"><div><p className="native-eyebrow">Подготовительный модуль</p><h2 id="math-title">Математика к экзамену</h2><p>Вспоминаем школьскую базу. Числовые ответы проверяются точно и сразу, без AI.</p></div></div>
    {error && <p className="native-notice error" role="alert">{error}</p>}
    {loading && <p className="native-notice">Загружаю математический маршрут…</p>}
    {!loading && <div className="math-screen-grid">
      <aside className="native-roadmap math-course-roadmap" aria-label="Темы по математике"><h3>{studyRoadmap?.title ?? "Темы"}</h3><p className="math-roadmap-intro">{studyRoadmap?.note}</p>{studyRoadmap?.topics.map((topic, index) => { const module = topic.module_slug ? roadmap[index] : undefined; return <section key={topic.slug} className="math-roadmap-topic"><div className="math-roadmap-topic-heading"><span>{index + 1}</span><div><strong>{topic.title}</strong><small>{topic.description}</small></div></div>{module ? <details open={module.lessons.some((item) => item.status === "current")}><summary>{module.lessons.filter((item) => item.status === "completed").length}/{module.lessons.length} тем пройдено</summary>{module.lessons.map((item) => <div key={item.id} className={`native-roadmap-item ${item.status}`}><span className="native-roadmap-dot">{item.status === "completed" ? "✓" : item.status === "current" ? "•" : "○"}</span><button type="button" disabled={item.status === "upcoming" || submitting} onClick={() => void loadLesson(item.id)}><span>{item.title}</span>{item.can_repeat && <small>Повторить</small>}</button></div>)}</details> : <p className="math-roadmap-coming">Следующая тема курса.</p>}</section> })}</aside>
      <div className="native-answer-form">{lesson && <><div className="native-answer-heading"><span>Тема</span><strong>{lesson.title}</strong></div><div className="native-chat-content">{(lesson.theory || "").split("\n").map((line, index) => <p key={index}><MathNotation>{line}</MathNotation></p>)}</div><div className="native-exercise-list">{lesson.exercises.map((item: Exercise, index) => <button className={`native-exercise-card ${!generatedExercise && item.id === exerciseId ? "active" : ""}`} key={item.id} type="button" onClick={() => { setGeneratedExercise(null); setExerciseId(item.id); setAssessment(null); setAnswer(""); }}><span>ЗАДАНИЕ {index + 1}</span><strong><MathNotation>{item.question}</MathNotation></strong>{item.is_completed && <em className="correct">✓ Выполнено{item.score !== null ? ` · ${item.score}/100` : ""}</em>}</button>)}</div><button className="native-refresh" type="button" onClick={() => void generateExercise()} disabled={submitting}>{submitting ? "Создаю…" : "Новое задание"}</button>{generatedExercise && <article className="native-exercise-card active" aria-live="polite"><span>НОВОЕ ЗАДАНИЕ</span><strong><MathNotation>{generatedExercise.question}</MathNotation></strong></article>}<form onSubmit={(event) => void submit(event)}><textarea rows={3} value={answer} onChange={(event) => setAnswer(event.target.value)} placeholder="Введи число или дробь, например 3/4" disabled={!selectedExercise || submitting} required /><button className="native-submit-answer" type="submit" disabled={!selectedExercise || !answer.trim() || submitting}>{submitting ? "Проверяю…" : "Проверить ответ"}</button></form><button className="native-refresh" type="button" onClick={() => void finishLesson()} disabled={submitting}>Завершить тему и открыть следующую</button></>}</div>
      {lesson && <MathTutorChat lesson={lesson} />}
    </div>}
    {assessment && <article className={`native-assessment ${assessment.is_correct ? "correct" : "wrong"}`}><div><strong>{assessment.is_correct ? "Верно" : "Нужно исправить"}</strong><span>{assessment.score}/100</span></div>{!assessment.is_correct && <p><b>Правильный ответ:</b> {assessment.corrected_answer}</p>}<p>{assessment.explanation}</p></article>}
  </section>;
}
