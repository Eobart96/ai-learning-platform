"use client";

import { FormEvent, useEffect, useRef, useState } from "react";

import { allA1Lessons } from "../data/a1Course";
import { answerModule1BetaExercise, deleteModule1BetaExercise, generateModule1BetaExercise, getModule1BetaExercises, type Module1BetaExercise, type Module1BetaExerciseAttempt } from "../lib/api";
import { SlovakKeyboard } from "./SlovakKeyboard";

function lessonTheory(slug: string): string {
  const lesson = allA1Lessons.find((item) => item.slug === slug) ?? allA1Lessons[0];
  return [lesson.theory.summary, ...lesson.theory.rules, ...lesson.theory.examples.map((example) => `${example.slovak} — ${example.russian}. ${example.explanation}`)].join("\n");
}

type ExerciseMode = "topic" | "progress";

export function Module1BetaExercises({ completedLessonSlugs }: { completedLessonSlugs: string[] }) {
  const answerRef = useRef<HTMLTextAreaElement>(null);
  const completedLessons = allA1Lessons.filter((item) => completedLessonSlugs.includes(item.slug));
  const [mode, setMode] = useState<ExerciseMode>("topic");
  const [lessonSlug, setLessonSlug] = useState(completedLessons[0]?.slug ?? "");
  const [exercises, setExercises] = useState<Module1BetaExercise[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [answer, setAnswer] = useState("");
  const [assessment, setAssessment] = useState<Module1BetaExerciseAttempt | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const lesson = completedLessons.find((item) => item.slug === lessonSlug) ?? completedLessons[0];
  const storageSlug = mode === "progress" ? "course-progress" : lessonSlug;
  const visible = exercises.filter((item) => item.lesson_slug === storageSlug);
  const selected = exercises.find((item) => item.id === selectedId) ?? visible[0];

  useEffect(() => {
    void getModule1BetaExercises().then((items) => { setExercises(items); setSelectedId(items[0]?.id ?? null); }).catch((cause) => setError(cause instanceof Error ? cause.message : "Не удалось загрузить упражнения.")).finally(() => setLoading(false));
  }, []);

  const generate = async () => {
    if (generating) return;
    setGenerating(true); setError(""); setAssessment(null); setAnswer("");
    try {
      if (!completedLessons.length || (mode === "topic" && !lesson)) return;
      const item = mode === "topic"
        ? await generateModule1BetaExercise({ lesson_slug: lesson.slug, lesson_title: lesson.title, theory: lessonTheory(lesson.slug) })
        : await generateModule1BetaExercise({ lesson_slug: "course-progress", lesson_title: "Общий прогресс Slovak A1", theory: completedLessons.map((item) => `Тема: ${item.title}\n${lessonTheory(item.slug)}`).join("\n\n").slice(0, 12_000) });
      setExercises((current) => [item, ...current]); setSelectedId(item.id);
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Не удалось создать упражнение."); }
    finally { setGenerating(false); }
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!selected || !answer.trim() || submitting) return;
    setSubmitting(true); setError("");
    try {
      const result = await answerModule1BetaExercise(selected.id, answer.trim());
      setAssessment(result);
      setExercises((current) => current.map((item) => item.id === selected.id ? { ...item, latest_attempt: result } : item));
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Не удалось проверить ответ."); }
    finally { setSubmitting(false); }
  };

  const insertKey = (key: string) => {
    const textarea = answerRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart ?? answer.length;
    const end = textarea.selectionEnd ?? start;
    setAnswer(`${answer.slice(0, start)}${key}${answer.slice(end)}`);
    requestAnimationFrame(() => { textarea.focus(); textarea.setSelectionRange(start + key.length, start + key.length); });
  };

  const remove = async (item: Module1BetaExercise) => {
    if (!window.confirm(`Удалить упражнение «${item.question}» вместе с историей ответов?`)) return;
    setError("");
    try {
      await deleteModule1BetaExercise(item.id);
      setExercises((current) => current.filter((exercise) => exercise.id !== item.id));
      if (selectedId === item.id) { setSelectedId(null); setAssessment(null); setAnswer(""); }
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Не удалось удалить упражнение."); }
  };

  return <section className="module-beta-exercises" aria-labelledby="module-beta-exercises-title">
    <div className="module-beta-section-heading"><div><span>Отдельная механика новой версии</span><h3 id="module-beta-exercises-title">Упражнения</h3></div><p>Задания и ответы сохраняются в SQLite отдельно от старого приложения.</p></div>
    <div className="module-beta-reading-modes" role="group" aria-label="Режим генерации упражнения"><button type="button" className={mode === "topic" ? "active" : ""} onClick={() => { setMode("topic"); setSelectedId(null); setAssessment(null); setAnswer(""); }}>По теме</button><button type="button" className={mode === "progress" ? "active" : ""} onClick={() => { setMode("progress"); setSelectedId(null); setAssessment(null); setAnswer(""); }}>По общему прогрессу</button></div>
    <div className="module-beta-exercise-toolbar">
      {mode === "topic" ? <label><span>Завершённая тема</span><select value={lessonSlug} disabled={!completedLessons.length} onChange={(event) => { setLessonSlug(event.target.value); setSelectedId(null); setAssessment(null); setAnswer(""); }}>{completedLessons.map((item) => <option key={item.slug} value={item.slug}>{item.title}</option>)}</select></label> : <div className="module-beta-reading-scope"><span>Доступный материал</span><strong>{completedLessons.length} завершённых тем</strong><small>Незавершённые темы в задание не попадут.</small></div>}
      <button type="button" onClick={() => void generate()} disabled={generating || !completedLessons.length}>{generating ? "Создаю…" : "Создать упражнение"}</button>
    </div>
    {!completedLessons.length && <p className="module-beta-empty">Завершите хотя бы одну тему, чтобы создавать упражнения.</p>}
    {error && <p className="module-beta-persistence-error" role="alert">{error}</p>}
    {loading ? <p className="module-beta-empty">Загружаю упражнения…</p> : <div className="module-beta-exercise-grid">
      <aside className="module-beta-exercise-list"><strong>Задания по теме</strong>{visible.length === 0 ? <p>Созданных заданий пока нет.</p> : visible.map((item, index) => <article className={selected?.id === item.id ? "active" : ""} key={item.id}><button type="button" onClick={() => { setSelectedId(item.id); setAssessment(item.latest_attempt); setAnswer(""); }}><span>Упражнение {visible.length - index}</span><b>{item.question}</b>{item.latest_attempt && <small>{item.latest_attempt.is_correct ? "✓ Выполнено" : `Последний результат: ${item.latest_attempt.score}/100`}</small>}</button><button type="button" className="delete" onClick={() => void remove(item)} aria-label={`Удалить упражнение: ${item.question}`}>Удалить</button></article>)}</aside>
      <form className="module-beta-exercise-workspace" onSubmit={(event) => void submit(event)}>{selected ? <><span>{selected.lesson_title}</span><h4>{selected.question}</h4><p>{selected.instruction}</p><textarea ref={answerRef} rows={5} value={answer} onChange={(event) => setAnswer(event.target.value)} placeholder="Напишите ответ по-словацки…" disabled={submitting} /><SlovakKeyboard onInsert={insertKey} disabled={submitting} /><button type="submit" disabled={!answer.trim() || submitting}>{submitting ? "Проверяю…" : "Проверить ответ"}</button>{(assessment ?? selected.latest_attempt) && (() => { const result = assessment ?? selected.latest_attempt!; return <article className={result.is_correct ? "correct" : "incorrect"}><strong>{result.is_correct ? "Верно" : "Нужно исправить"} · {result.score}/100</strong>{!result.is_correct && <p><b>Исправленный вариант:</b> {result.corrected_answer}</p>}<p>{result.explanation}</p><small>Следующий шаг: {result.next_exercise}</small></article>; })()}</> : <div className="module-beta-empty"><strong>Выберите или создайте упражнение</strong><p>Генератор использует только теорию выбранной темы.</p></div>}</form>
    </div>}
  </section>;
}
