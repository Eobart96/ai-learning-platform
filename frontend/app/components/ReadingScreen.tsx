"use client";

import { FormEvent, useState } from "react";
import { checkReading, generateReading, type ReadingCheck, type ReadingText } from "../lib/api";
import { SlovakKeyboard } from "./SlovakKeyboard";

export function ReadingScreen() {
  const [reading, setReading] = useState<ReadingText | null>(null);
  const [retelling, setRetelling] = useState("");
  const [result, setResult] = useState<ReadingCheck | null>(null);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const generate = async () => { setLoading(true); setError(null); setResult(null); setRetelling(""); try { setReading(await generateReading()); } catch (cause) { setError(cause instanceof Error ? cause.message : "Не удалось создать текст."); } finally { setLoading(false); } };
  const submit = async (event: FormEvent<HTMLFormElement>) => { event.preventDefault(); if (!reading || !retelling.trim()) return; setChecking(true); setError(null); try { setResult(await checkReading(reading.text, retelling)); } catch (cause) { setError(cause instanceof Error ? cause.message : "Не удалось проверить пересказ."); } finally { setChecking(false); } };
  return <section className="native-exercises" aria-labelledby="reading-title"><div className="native-exercises-heading"><div><p className="native-eyebrow">Практика понимания</p><h2 id="reading-title">Чтение</h2><p>Прочитай текст на словацком и расскажи по-русски, о чём он.</p></div><button className="native-refresh" type="button" onClick={() => void generate()} disabled={loading}>{loading ? "Генерирую…" : "Новый текст"}</button></div>{error && <p className="native-notice error" role="alert">{error}</p>}{!reading && !loading && <div className="native-notice">Нажми «Новый текст», чтобы получить рассказ для чтения.</div>}{reading && <><article className="native-exercise-card active"><h3>{reading.title}</h3><p className="native-reading-text">{reading.text}</p><small>{reading.instruction}</small></article><form className="native-answer-form" onSubmit={(event) => void submit(event)}><textarea rows={6} value={retelling} onChange={(event) => setRetelling(event.target.value)} placeholder="Напиши, о чём этот текст…" disabled={checking} required /><SlovakKeyboard onInsert={(key) => setRetelling((value) => `${value}${key}`)} disabled={checking} /><button className="native-submit-answer" type="submit" disabled={!retelling.trim() || checking}>{checking ? "Проверяю…" : "Проверить пересказ"}</button></form>{result && <article className={`native-assessment ${result.score >= 70 ? "correct" : "wrong"}`}><div><strong>Результат пересказа</strong><span>{result.score}/100</span></div><p>{result.feedback}</p><p><b>Хороший вариант пересказа:</b> {result.corrected_retelling}</p></article>}</>}</section>;
}
