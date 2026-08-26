"use client";

import { FormEvent, useEffect, useState } from "react";

import { allA1Lessons } from "../data/a1Course";
import type { BetaLesson } from "../data/module1Beta";
import { checkModule1BetaReading, deleteModule1BetaReading, generateModule1BetaReading, getModule1BetaReadings, type Module1BetaReading as Reading, type Module1BetaReadingAttempt } from "../lib/api";

function theoryFor(lesson: BetaLesson): string {
  return [lesson.theory.summary, ...lesson.theory.rules].join("\n");
}

type ReadingMode = "topic" | "progress";

export function Module1BetaReading({ completedLessonSlugs }: { completedLessonSlugs: string[] }) {
  const completedLessons = allA1Lessons.filter((item) => completedLessonSlugs.includes(item.slug));
  const [mode, setMode] = useState<ReadingMode>("topic");
  const [lessonSlug, setLessonSlug] = useState(completedLessons[0]?.slug ?? "");
  const [items, setItems] = useState<Reading[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [retelling, setRetelling] = useState("");
  const [result, setResult] = useState<Module1BetaReadingAttempt | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState("");
  const lesson = completedLessons.find((item) => item.slug === lessonSlug) ?? completedLessons[0];
  const storageSlug = mode === "progress" ? "course-progress" : lessonSlug;
  const visible = items.filter((item) => item.lesson_slug === storageSlug);
  const selected = items.find((item) => item.id === selectedId) ?? visible[0];

  useEffect(() => { void getModule1BetaReadings().then((readings) => { setItems(readings); setSelectedId(readings[0]?.id ?? null); }).catch((cause) => setError(cause instanceof Error ? cause.message : "Не удалось загрузить тексты.")).finally(() => setLoading(false)); }, []);

  const generate = async () => {
    setGenerating(true); setError(""); setResult(null); setRetelling("");
    try {
      if (!completedLessons.length || (mode === "topic" && !lesson)) return;
      const item = mode === "topic"
        ? await generateModule1BetaReading({ lesson_slug: lesson.slug, lesson_title: lesson.title, theory: theoryFor(lesson), completed_theory: "" })
        : await generateModule1BetaReading({ lesson_slug: "course-progress", lesson_title: "Общий прогресс Slovak A1", theory: completedLessons.map((item) => `Тема: ${item.title}\n${theoryFor(item)}`).join("\n\n").slice(0, 12_000), completed_theory: "" });
      setItems((current) => [item, ...current]); setSelectedId(item.id);
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Не удалось создать текст."); }
    finally { setGenerating(false); }
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault(); if (!selected || !retelling.trim()) return;
    setChecking(true); setError("");
    try { const checked = await checkModule1BetaReading(selected.id, retelling.trim()); setResult(checked); setItems((current) => current.map((item) => item.id === selected.id ? { ...item, latest_attempt: checked } : item)); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "Не удалось проверить пересказ."); }
    finally { setChecking(false); }
  };

  const remove = async (item: Reading) => {
    if (!window.confirm(`Удалить текст «${item.title}» вместе с пересказами?`)) return;
    setError("");
    try {
      await deleteModule1BetaReading(item.id);
      setItems((current) => current.filter((reading) => reading.id !== item.id));
      if (selectedId === item.id) { setSelectedId(null); setResult(null); setRetelling(""); }
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Не удалось удалить текст."); }
  };

  return <section className="module-beta-exercises module-beta-reading" aria-labelledby="module-beta-reading-title">
    <div className="module-beta-section-heading"><div><span>Практика понимания</span><h3 id="module-beta-reading-title">Чтение</h3></div><p>Прочитайте словацкий текст и перескажите его по-русски.</p></div>
    <div className="module-beta-reading-modes" role="group" aria-label="Режим генерации текста"><button type="button" className={mode === "topic" ? "active" : ""} onClick={() => { setMode("topic"); setSelectedId(null); setResult(null); setRetelling(""); }}>По теме</button><button type="button" className={mode === "progress" ? "active" : ""} onClick={() => { setMode("progress"); setSelectedId(null); setResult(null); setRetelling(""); }}>По общему прогрессу</button></div>
    <div className="module-beta-exercise-toolbar">{mode === "topic" ? <label><span>Завершённая тема</span><select value={lessonSlug} disabled={!completedLessons.length} onChange={(event) => { setLessonSlug(event.target.value); setSelectedId(null); setResult(null); setRetelling(""); }}>{completedLessons.map((item) => <option value={item.slug} key={item.slug}>{item.title}</option>)}</select></label> : <div className="module-beta-reading-scope"><span>Доступный материал</span><strong>{completedLessons.length} завершённых тем</strong><small>Используются только завершённые темы.</small></div>}<button type="button" onClick={() => void generate()} disabled={generating || !completedLessons.length}>{generating ? "Создаю…" : "Новый текст"}</button></div>
    {!completedLessons.length && <p className="module-beta-empty">Завершите хотя бы одну тему, чтобы создавать тексты.</p>}
    {error && <p className="module-beta-persistence-error" role="alert">{error}</p>}
    {loading ? <p>Загружаю тексты…</p> : <div className="module-beta-exercise-grid"><aside className="module-beta-exercise-list"><strong>Сохранённые тексты</strong>{visible.length ? visible.map((item) => <article className={selected?.id === item.id ? "active" : ""} key={item.id}><button type="button" onClick={() => { setSelectedId(item.id); setResult(item.latest_attempt); setRetelling(""); }}><span>{item.lesson_title}</span><b>{item.title}</b>{item.latest_attempt && <small>Пересказ: {item.latest_attempt.score}/100</small>}</button><button type="button" className="delete" onClick={() => void remove(item)} aria-label={`Удалить текст: ${item.title}`}>Удалить</button></article>) : <p>Текстов по этой теме пока нет.</p>}</aside><form className="module-beta-exercise-workspace" onSubmit={(event) => void submit(event)}>{selected ? <><span>{selected.lesson_title}</span><h4>{selected.title}</h4><p className="module-beta-reading-text" lang="sk">{selected.text}</p><small>{selected.instruction}</small><textarea rows={6} value={retelling} onChange={(event) => setRetelling(event.target.value)} placeholder="Напишите по-русски, о чём этот текст…" disabled={checking} /><button type="submit" disabled={!retelling.trim() || checking}>{checking ? "Проверяю…" : "Проверить пересказ"}</button>{(result ?? selected.latest_attempt) && (() => { const checked = result ?? selected.latest_attempt!; return <article className={checked.score >= 70 ? "correct" : "incorrect"}><strong>Результат: {checked.score}/100</strong><p>{checked.feedback}</p><p><b>Хороший вариант:</b> {checked.corrected_retelling}</p></article>; })()}</> : <div className="module-beta-empty"><strong>Выберите или создайте текст</strong><p>Текст будет ограничен грамматикой выбранной и предыдущих тем.</p></div>}</form></div>}
  </section>;
}
