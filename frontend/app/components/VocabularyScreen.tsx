"use client";

import { useEffect, useMemo, useState } from "react";
import { type VocabularyItem, getDueVocabulary, getTestModules, getVocabulary, reviewVocabulary } from "../lib/api";

const filterStorageKey = "learning_vocabulary_filter";

export function VocabularyScreen() {
  const [items, setItems] = useState<VocabularyItem[]>([]);
  const [dueItems, setDueItems] = useState<VocabularyItem[]>([]);
  const [filter, setFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [reviewingId, setReviewingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [completedLessonIds, setCompletedLessonIds] = useState<Set<number>>(new Set());
  const load = async () => { setLoading(true); setError(null); try { const [vocabulary, due, modules] = await Promise.all([getVocabulary(), getDueVocabulary(), getTestModules()]); setItems(vocabulary); setDueItems(due); setCompletedLessonIds(new Set(modules.flatMap((module) => module.lessons.filter((lesson) => lesson.status === "completed").map((lesson) => lesson.id)))); } catch (cause) { setError(cause instanceof Error ? cause.message : "Не удалось загрузить словарь."); } finally { setLoading(false); } };
  useEffect(() => { setFilter(window.localStorage.getItem(filterStorageKey) ?? ""); void load(); }, []);
  const topics = useMemo(() => [...new Set(items.filter((item) => item.lesson_id !== null && completedLessonIds.has(item.lesson_id)).map((item) => item.lesson_title).filter((title): title is string => Boolean(title)))], [items, completedLessonIds]);
  const activeFilter = topics.includes(filter) ? filter : "";
  const visibleItems = activeFilter ? items.filter((item) => item.lesson_title === activeFilter) : items;
  const selectFilter = (nextFilter: string) => { setFilter(nextFilter); window.localStorage.setItem(filterStorageKey, nextFilter); };
  const download = () => { const text = visibleItems.map((item) => `${item.translation} — ${item.word}`).join("\r\n"); const blob = new Blob(["\ufeff" + text], { type: "text/plain;charset=utf-8" }); const url = URL.createObjectURL(blob); const link = document.createElement("a"); link.href = url; link.download = `${activeFilter || "vse-slova"}.txt`; link.click(); URL.revokeObjectURL(url); };
  const review = async (item: VocabularyItem) => { setReviewingId(item.id); setError(null); try { await reviewVocabulary(item.id); await load(); } catch (cause) { setError(cause instanceof Error ? cause.message : "Не удалось отметить повторение."); setReviewingId(null); } };
  return <section className="native-vocabulary" aria-labelledby="vocabulary-title"><div className="native-exercises-heading"><div><p className="native-eyebrow">Словарь</p><h2 id="vocabulary-title">Слова</h2><p>Каталог слов по пройденным темам и интервальное повторение.</p></div><div className="native-vocabulary-actions"><button className="native-refresh" type="button" onClick={() => void load()} disabled={loading}>Обновить</button><button className="native-download" type="button" onClick={download} disabled={visibleItems.length === 0}>Скачать .txt</button></div></div>{error && <p className="native-notice error" role="alert">{error}</p>}{loading && <p className="native-notice">Загружаю словарь…</p>}{!loading && dueItems.length > 0 && <section className="native-due-vocabulary"><div><strong>Время повторить</strong><span>{dueItems.length} {dueItems.length === 1 ? "слово" : "слов"}</span></div>{dueItems.slice(0, 1).map((item) => <article key={item.id}><strong>{item.word}</strong><span>{item.translation}</span>{item.example && <small>{item.example}</small>}<button type="button" onClick={() => void review(item)} disabled={reviewingId !== null}>{reviewingId === item.id ? "Сохраняю…" : "Повторил"}</button></article>)}</section>}<div className="native-vocabulary-tags"><button className={activeFilter === "" ? "active" : ""} type="button" onClick={() => selectFilter("")}>Все</button>{topics.map((topic) => <button className={activeFilter === topic ? "active" : ""} key={topic} type="button" onClick={() => selectFilter(topic)}>{topic}</button>)}</div>{!loading && visibleItems.length === 0 && <p className="native-notice">Каталог слов пока пуст.</p>}<div className="native-vocabulary-list">{visibleItems.map((item) => <article key={item.id}><div><strong>{item.translation} — {item.word}</strong>{item.example && <small>{item.example}</small>}</div><span>{item.is_saved ? item.is_due ? "К повторению" : `Следующее повторение через ${item.interval_days} дн.` : "Новое слово"}</span></article>)}</div></section>;
}
