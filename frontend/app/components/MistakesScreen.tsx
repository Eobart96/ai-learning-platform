"use client";

import { KeyboardEvent, useEffect, useState } from "react";
import { type Mistake, getMistakes, resolveAllMistakes, resolveMistake } from "../lib/api";
import { MistakeChat } from "./MistakeChat";

const sourceNames: Record<string, string> = { exercise: "Упражнение", homework: "Домашнее задание", diary: "Дневник", dialogue: "Живой урок", test: "Тест" };

type MistakesScreenProps = { onPracticeStarted?: (sessionId: number, lessonId: number | null) => void; courseSlug?: string };

export function MistakesScreen({ courseSlug }: MistakesScreenProps) {
  const selectedCourseSlug = courseSlug ?? "slovak-a1";
  const isMath = selectedCourseSlug === "math-exam-prep";
  const [mistakes, setMistakes] = useState<Mistake[]>([]);
  const [selectedMistakeId, setSelectedMistakeId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [workingId, setWorkingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const nextMistakes = await getMistakes(selectedCourseSlug);
      setMistakes(nextMistakes);
      setSelectedMistakeId((current) => nextMistakes.some((mistake) => mistake.id === current) ? current : nextMistakes[0]?.id ?? null);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Не удалось загрузить ошибки.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void load(); }, [selectedCourseSlug]);

  const resolve = async (mistake: Mistake) => {
    if (!window.confirm("Подтвердить, что эта ошибка исправлена?")) return;
    setWorkingId(mistake.id);
    setError(null);
    try {
      await resolveMistake(mistake.id, selectedCourseSlug);
      await load();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Не удалось подтвердить исправление.");
    } finally { setWorkingId(null); }
  };

  const resolveAll = async () => {
    if (!mistakes.length || !window.confirm(`Подтвердить исправление всех ошибок (${mistakes.length})?`)) return;
    setWorkingId(-1);
    setError(null);
    try {
      await resolveAllMistakes(selectedCourseSlug);
      await load();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Не удалось подтвердить все исправления.");
    } finally { setWorkingId(null); }
  };

  const selectMistake = (mistakeId: number) => setSelectedMistakeId(mistakeId);
  const selectWithKeyboard = (event: KeyboardEvent<HTMLElement>, mistakeId: number) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      selectMistake(mistakeId);
    }
  };
  const selectedMistake = mistakes.find((mistake) => mistake.id === selectedMistakeId) ?? null;
  const description = isMath ? "Ошибки из математических задач и итоговых тестов. Исправь вычисление и подтверди результат." : "Здесь собраны активные ошибки из упражнений, тестов, дневника и живого урока.";

  return (
    <section className="native-mistakes" aria-labelledby="mistakes-title">
      <div className="native-exercises-heading">
        <div><p className="native-eyebrow">Аналитика</p><h2 id="mistakes-title">Ошибки</h2><p>{description}</p></div>
        <div className="native-mistakes-actions"><button className="native-refresh" type="button" onClick={() => void resolveAll()} disabled={loading || workingId !== null || mistakes.length === 0}>{workingId === -1 ? "Исправляю…" : "Исправить всё"}</button><button className="native-refresh" type="button" onClick={() => void load()} disabled={loading || workingId !== null}>Обновить</button></div>
      </div>
      {error && <p className="native-notice error" role="alert">{error}</p>}
      {loading && <p className="native-notice">Загружаю ошибки…</p>}
      {!loading && mistakes.length === 0 && <p className="native-notice">Активных ошибок для повторения нет.</p>}
      {!loading && selectedMistake && (
        <div className="native-mistakes-grid">
          <div className="native-mistake-list" aria-label="Список ошибок">
            {mistakes.map((mistake) => (
              <article className={`native-mistake-card ${mistake.id === selectedMistake.id ? "active" : ""}`} key={mistake.id} role="button" tabIndex={0} aria-pressed={mistake.id === selectedMistake.id} onClick={() => selectMistake(mistake.id)} onKeyDown={(event) => selectWithKeyboard(event, mistake.id)}>
                <div className="native-mistake-heading"><strong>{mistake.category}</strong><span>{sourceNames[mistake.source] ?? mistake.source} · {mistake.mistake_count} раз</span></div>
                {mistake.lesson_title && <small>Тема: {mistake.lesson_title}</small>}
                <div className="native-mistake-comparison"><p><b>Твой ответ</b>{mistake.original_answer}</p><p><b>Исправление</b>{mistake.corrected_answer}</p></div>
                <p>{mistake.explanation}</p>
                <div className="native-mistake-actions"><span>{isMath ? "Реши похожую задачу в разделе «Курс»." : `Отработок: ${mistake.practice_count}`}</span><button type="button" className="secondary" onClick={(event) => { event.stopPropagation(); void resolve(mistake); }} disabled={workingId !== null}>Подтвердить исправление</button></div>
              </article>
            ))}
          </div>
          {!isMath && <MistakeChat mistake={selectedMistake} courseSlug={selectedCourseSlug} />}
        </div>
      )}
    </section>
  );
}
