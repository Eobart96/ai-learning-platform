"use client";

import { FormEvent, useEffect, useRef, useState } from "react";

import { allA1Lessons } from "../data/a1Course";
import { deleteModule1BetaHomework, generateModule1BetaHomework, getModule1BetaHomework, submitModule1BetaHomework, type Module1BetaHomework as Homework, type Module1BetaHomeworkAttempt } from "../lib/api";
import { SlovakKeyboard } from "./SlovakKeyboard";

function theoryFor(slug: string): string {
  const lesson = allA1Lessons.find((item) => item.slug === slug) ?? allA1Lessons[0];
  return [lesson.theory.summary, ...lesson.theory.rules, ...lesson.theory.examples.map((item) => `${item.slovak} — ${item.russian}. ${item.explanation}`)].join("\n");
}

type HomeworkMode = "topic" | "progress";

export function Module1BetaHomework({ completedLessonSlugs, mistakeHints }: { completedLessonSlugs: string[]; mistakeHints: Array<{ lessonSlug: string; text: string }> }) {
  const completedLessons = allA1Lessons.filter((item) => completedLessonSlugs.includes(item.slug));
  const [mode, setMode] = useState<HomeworkMode>("topic");
  const [lessonSlug, setLessonSlug] = useState(completedLessons[0]?.slug ?? "");
  const [items, setItems] = useState<Homework[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [answer, setAnswer] = useState("");
  const [result, setResult] = useState<Module1BetaHomeworkAttempt | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const lesson = completedLessons.find((item) => item.slug === lessonSlug) ?? completedLessons[0];
  const storageSlug = mode === "progress" ? "course-progress" : lessonSlug;
  const visible = items.filter((item) => item.lesson_slug === storageSlug);
  const selected = items.find((item) => item.id === selectedId) ?? visible[0];

  useEffect(() => { void getModule1BetaHomework().then((homework) => { setItems(homework); setSelectedId(homework[0]?.id ?? null); }).catch((cause) => setError(cause instanceof Error ? cause.message : "Не удалось загрузить домашние задания.")).finally(() => setLoading(false)); }, []);

  const generate = async () => {
    setGenerating(true); setError(""); setAnswer(""); setResult(null);
    try {
      if (!completedLessons.length || (mode === "topic" && !lesson)) return;
      const item = mode === "topic"
        ? await generateModule1BetaHomework({ lesson_slug: lesson.slug, lesson_title: lesson.title, theory: theoryFor(lesson.slug), known_mistakes: mistakeHints.filter((hint) => hint.lessonSlug === lesson.slug).map((hint) => hint.text) })
        : await generateModule1BetaHomework({ lesson_slug: "course-progress", lesson_title: "Общий прогресс Slovak A1", theory: completedLessons.map((item) => `Тема: ${item.title}\n${theoryFor(item.slug)}`).join("\n\n").slice(0, 12_000), known_mistakes: mistakeHints.filter((hint) => completedLessonSlugs.includes(hint.lessonSlug)).map((hint) => hint.text) });
      setItems((current) => [item, ...current]); setSelectedId(item.id);
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Не удалось создать домашнее задание."); }
    finally { setGenerating(false); }
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault(); if (!selected || !answer.trim()) return;
    setChecking(true); setError("");
    try { const checked = await submitModule1BetaHomework(selected.id, answer.trim()); setResult(checked); setItems((current) => current.map((item) => item.id === selected.id ? { ...item, latest_attempt: checked } : item)); setAnswer(""); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "Не удалось проверить домашнее задание."); }
    finally { setChecking(false); }
  };

  const insertKey = (key: string) => { const field = textareaRef.current; if (!field) return; const start = field.selectionStart ?? answer.length; const end = field.selectionEnd ?? start; setAnswer(`${answer.slice(0, start)}${key}${answer.slice(end)}`); requestAnimationFrame(() => { field.focus(); field.setSelectionRange(start + key.length, start + key.length); }); };
  const remove = async (item: Homework) => { if (!window.confirm(`Удалить задание «${item.title}» вместе с ответами?`)) return; setError(""); try { await deleteModule1BetaHomework(item.id); setItems((current) => current.filter((entry) => entry.id !== item.id)); if (selectedId === item.id) { setSelectedId(null); setResult(null); setAnswer(""); } } catch (cause) { setError(cause instanceof Error ? cause.message : "Не удалось удалить задание."); } };
  const checked = result ?? selected?.latest_attempt;

  return <section className="module-beta-exercises module-beta-homework" aria-labelledby="module-beta-homework-title">
    <div className="module-beta-section-heading"><div><span>Самостоятельная практика</span><h3 id="module-beta-homework-title">Домашнее задание</h3></div><p>AI создаёт задание по теории выбранной темы и учитывает сохранённые ошибки.</p></div>
    <div className="module-beta-reading-modes" role="group" aria-label="Режим генерации домашнего задания"><button type="button" className={mode === "topic" ? "active" : ""} onClick={() => { setMode("topic"); setSelectedId(null); setResult(null); setAnswer(""); }}>По теме</button><button type="button" className={mode === "progress" ? "active" : ""} onClick={() => { setMode("progress"); setSelectedId(null); setResult(null); setAnswer(""); }}>По общему прогрессу</button></div>
    <div className="module-beta-exercise-toolbar">{mode === "topic" ? <label><span>Завершённая тема</span><select value={lessonSlug} disabled={!completedLessons.length} onChange={(event) => { setLessonSlug(event.target.value); setSelectedId(null); setResult(null); setAnswer(""); }}>{completedLessons.map((item) => <option value={item.slug} key={item.slug}>{item.title}</option>)}</select></label> : <div className="module-beta-reading-scope"><span>Доступный материал</span><strong>{completedLessons.length} завершённых тем</strong><small>Ошибки учитываются только по пройденному материалу.</small></div>}<button type="button" onClick={() => void generate()} disabled={generating || !completedLessons.length}>{generating ? "Создаю…" : "Создать задание"}</button></div>
    {!completedLessons.length && <p className="module-beta-empty">Завершите хотя бы одну тему, чтобы создавать домашние задания.</p>}
    {error && <p className="module-beta-persistence-error" role="alert">{error}</p>}
    {loading ? <p>Загружаю задания…</p> : <div className="module-beta-exercise-grid"><aside className="module-beta-exercise-list"><strong>Сохранённые задания</strong>{visible.length ? visible.map((item) => <article className={selected?.id === item.id ? "active" : ""} key={item.id}><button type="button" onClick={() => { setSelectedId(item.id); setResult(item.latest_attempt); setAnswer(""); }}><span>{item.lesson_title}</span><b>{item.title}</b><small>{item.latest_attempt ? `Результат: ${item.latest_attempt.score}/100` : item.focus_category}</small></button><button type="button" className="delete" onClick={() => void remove(item)} aria-label={`Удалить задание: ${item.title}`}>Удалить</button></article>) : <p>По этой теме заданий пока нет.</p>}</aside><form className="module-beta-exercise-workspace" onSubmit={(event) => void submit(event)}>{selected ? <><span>{selected.lesson_title} · {selected.focus_category}</span><h4>{selected.title}</h4><p className="module-beta-homework-description">{selected.description}</p><textarea ref={textareaRef} rows={7} value={answer} onChange={(event) => setAnswer(event.target.value)} placeholder="Напишите ответ по-словацки…" disabled={checking} /><SlovakKeyboard onInsert={insertKey} disabled={checking} /><button type="submit" disabled={!answer.trim() || checking}>{checking ? "AI проверяет…" : checked && !checked.is_correct ? "Отправить исправление" : "Отправить на проверку"}</button>{checked && <article className={checked.is_correct ? "correct" : "incorrect"}><strong>{checked.is_correct ? "Выполнено правильно" : "Нужно исправить"} · {checked.score}/100</strong><p><b>Ваш ответ:</b> {checked.answer}</p><p><b>Исправленный вариант:</b> {checked.corrected_answer}</p><p><b>Объяснение:</b> {checked.explanation}</p><p><b>Что повторить:</b> {checked.next_exercise}</p></article>}</> : <div className="module-beta-empty"><strong>Выберите или создайте задание</strong><p>Оно сохранится в базе данных новой версии.</p></div>}</form></div>}
  </section>;
}
