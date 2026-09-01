"use client";

import { useEffect, useMemo, useState } from "react";

import { a1CourseModules, allA1Lessons } from "../data/a1Course";
import { filterKnownLessonSlugs } from "../data/courseEngine";
import { reviewCourseVocabulary, syncCourseVocabulary, type CourseVocabularyItem, type CourseVocabularySeed } from "../lib/api";

export function contentVocabulary(completedLessonSlugs: string[]): CourseVocabularySeed[] {
  const completed = new Set(filterKnownLessonSlugs(a1CourseModules, completedLessonSlugs));
  const result: CourseVocabularySeed[] = [];
  for (const lesson of allA1Lessons) {
    if (!completed.has(lesson.slug)) continue;
    for (const example of lesson.theory.examples) result.push({ lesson_slug: lesson.slug, lesson_title: lesson.title, word: example.slovak, translation: example.russian, example: example.slovak });
    for (const section of lesson.sections) {
      if (!section.table) continue;
      const slovakIndex = section.table.headers.findIndex((header) => header.toLocaleLowerCase("ru").includes("словац"));
      const russianIndex = section.table.headers.findIndex((header) => header.toLocaleLowerCase("ru").includes("рус"));
      if (slovakIndex < 0 || russianIndex < 0) continue;
      for (const row of section.table.rows) {
        if (row[slovakIndex] && row[russianIndex]) result.push({ lesson_slug: lesson.slug, lesson_title: lesson.title, word: row[slovakIndex], translation: row[russianIndex], example: row[slovakIndex] });
      }
    }
  }
  return [...new Map(result.map((item) => [`${item.lesson_slug}:${item.word}`, item])).values()];
}

export function CourseVocabulary({ completedLessonSlugs }: { completedLessonSlugs: string[] }) {
  const [items, setItems] = useState<CourseVocabularyItem[]>([]);
  const [filter, setFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [reviewingId, setReviewingId] = useState<number | null>(null);
  const [error, setError] = useState("");
  useEffect(() => { void syncCourseVocabulary(contentVocabulary(completedLessonSlugs)).then((stored) => setItems(stored.filter((item) => completedLessonSlugs.includes(item.lesson_slug)))).catch((cause) => setError(cause instanceof Error ? cause.message : "Не удалось загрузить слова.")).finally(() => setLoading(false)); }, [completedLessonSlugs]);
  const topics = useMemo(() => [...new Map(items.map((item) => [item.lesson_slug, item.lesson_title])).entries()], [items]);
  const visible = filter ? items.filter((item) => item.lesson_slug === filter) : items;
  const due = items.filter((item) => item.is_due);
  const review = async (item: CourseVocabularyItem) => { setReviewingId(item.id); setError(""); try { const updated = await reviewCourseVocabulary(item.id); setItems((current) => current.map((candidate) => candidate.id === item.id ? updated : candidate)); } catch (cause) { setError(cause instanceof Error ? cause.message : "Не удалось сохранить повторение."); } finally { setReviewingId(null); } };
  const download = () => { const text = visible.map((item) => `${item.translation} — ${item.word}`).join("\r\n"); const blob = new Blob(["\ufeff" + text], { type: "text/plain;charset=utf-8" }); const url = URL.createObjectURL(blob); const link = document.createElement("a"); link.href = url; link.download = `${filter || "slovak-a1-words"}.txt`; link.click(); URL.revokeObjectURL(url); };
  return <section className="course-exercises course-vocabulary" aria-labelledby="course-vocabulary-title"><div className="course-section-heading"><div><span>Словарь новой версии</span><h3 id="course-vocabulary-title">Слова</h3></div><p>Слова открываются постепенно после завершения каждой темы.</p></div><div className="course-vocabulary-actions"><button type="button" onClick={download} disabled={!visible.length}>Скачать .txt</button></div>{error && <p className="course-persistence-error" role="alert">{error}</p>}{loading ? <p>Загружаю словарь…</p> : !completedLessonSlugs.length ? <p className="course-empty">Завершите первую тему — её слова появятся здесь.</p> : <>{due.length > 0 && <section className="course-vocabulary-due"><div><strong>Время повторить</strong><span>{due.length} элементов</span></div><article><strong lang="sk">{due[0].word}</strong><span>{due[0].translation}</span>{due[0].example && <small lang="sk">{due[0].example}</small>}<button type="button" onClick={() => void review(due[0])} disabled={reviewingId !== null}>{reviewingId === due[0].id ? "Сохраняю…" : "Повторил"}</button></article></section>}<div className="course-vocabulary-tags"><button type="button" className={!filter ? "active" : ""} onClick={() => setFilter("")}>Все</button>{topics.map(([slug, title]) => <button type="button" className={filter === slug ? "active" : ""} key={slug} onClick={() => setFilter(slug)}>{title}</button>)}</div><div className="course-vocabulary-list">{visible.map((item) => <article key={item.id}><div><strong><span>{item.translation}</span> — <span lang="sk">{item.word}</span></strong>{item.example && <small lang="sk">{item.example}</small>}</div><span>{item.review_count === 0 ? "Новое" : item.is_due ? "К повторению" : `Через ${item.interval_days} дн.`}</span></article>)}</div></>}</section>;
}
