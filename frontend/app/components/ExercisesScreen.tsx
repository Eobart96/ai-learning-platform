"use client";

import { FormEvent, useEffect, useRef, useState } from "react";

import {
  type Assessment,
  type Exercise,
  type Lesson,
  type LessonOption,
  generateExercise,
  getExerciseTopics,
  getLesson,
  submitLessonAnswer,
} from "../lib/api";

const lessonStorageKey = "learning_lesson_id";
const slovakKeys = ["á", "ä", "č", "ď", "é", "í", "ĺ", "ľ", "ň", "ó", "ô", "ŕ", "š", "ť", "ú", "ý", "ž", "ch", "dz", "dž"];

function topicStatus(topic: LessonOption) {
  return topic.status === "completed" ? "✓ Выполнено" : topic.status === "current" ? "● Текущая тема" : "○ Не начато";
}

export function ExercisesScreen() {
  const answerRef = useRef<HTMLTextAreaElement>(null);
  const [topics, setTopics] = useState<LessonOption[]>([]);
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [selectedExerciseId, setSelectedExerciseId] = useState<number | null>(null);
  const [answer, setAnswer] = useState("");
  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeExerciseTab, setActiveExerciseTab] = useState<"topic" | "generated">("topic");

  const loadLesson = async (lessonId: number, clearAssessment = true) => {
    setLoading(true);
    setError(null);
    if (clearAssessment) setAssessment(null);
    try {
      const next = await getLesson(lessonId);
      setLesson(next);
      setSelectedExerciseId(next.exercises[0]?.id ?? next.generated_exercises[0]?.id ?? null);
      window.localStorage.setItem(lessonStorageKey, String(lessonId));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Не удалось загрузить упражнения.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const load = async () => {
      try {
        const nextTopics = await getExerciseTopics();
        setTopics(nextTopics);
        const savedId = Number(window.localStorage.getItem(lessonStorageKey));
        const initial = nextTopics.find((topic) => topic.id === savedId && topic.status !== "upcoming")
          ?? nextTopics.find((topic) => topic.status === "current")
          ?? nextTopics.find((topic) => topic.status !== "upcoming");
        if (!initial) {
          setError("Нет доступных тем с упражнениями.");
          setLoading(false);
          return;
        }
        await loadLesson(initial.id);
      } catch (cause) {
        setError(cause instanceof Error ? cause.message : "Не удалось загрузить темы.");
        setLoading(false);
      }
    };
    void load();
  }, []);

  const selectedExercise: Exercise | undefined = lesson ? [...lesson.exercises, ...lesson.generated_exercises].find((exercise) => exercise.id === selectedExerciseId) : undefined;
  const visibleExercises = lesson ? (activeExerciseTab === "topic" ? lesson.exercises : lesson.generated_exercises) : [];

  const insertKey = (key: string) => {
    const textarea = answerRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart ?? answer.length;
    const end = textarea.selectionEnd ?? start;
    setAnswer(`${answer.slice(0, start)}${key}${answer.slice(end)}`);
    requestAnimationFrame(() => {
      textarea.focus();
      textarea.setSelectionRange(start + key.length, start + key.length);
    });
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!lesson || !selectedExercise || !answer.trim() || submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      const result = await submitLessonAnswer(lesson.id, selectedExercise.id, answer);
      setAssessment(result.assessment);
      setAnswer("");
      await loadLesson(lesson.id, false);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Не удалось проверить ответ.");
    } finally {
      setSubmitting(false);
    }
  };

  const generate = async () => {
    if (!lesson || generating) return;
    setGenerating(true);
    setError(null);
    try {
      const generated = await generateExercise(lesson.id);
      setLesson((current) => current ? { ...current, generated_exercises: [generated, ...current.generated_exercises] } : current);
      setActiveExerciseTab("generated");
      setSelectedExerciseId(generated.id);
      setAssessment(null);
      setAnswer("");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Не удалось сгенерировать упражнение.");
    } finally {
      setGenerating(false);
    }
  };

  return (
    <section className="native-exercises" aria-labelledby="exercises-title">
      <div className="native-exercises-heading">
        <div>
          <p className="native-eyebrow">Практика</p>
          <h2 id="exercises-title">Упражнения</h2>
          <p>Выбери тему, выполни задание и получи проверку от преподавателя.</p>
        </div>
        <div>
          <label className="native-topic-select">
            <span>Тема</span>
            <select value={lesson?.id ?? ""} onChange={(event) => void loadLesson(Number(event.target.value))} disabled={loading || generating}>
              {topics.map((topic) => <option key={topic.id} value={topic.id} disabled={topic.status === "upcoming"}>{topic.title} · {topicStatus(topic)}</option>)}
            </select>
          </label>
          <button className="native-refresh" type="button" onClick={() => void generate()} disabled={!lesson || generating}>
            {generating ? "Генерирую…" : "Новое задание"}
          </button>
        </div>
      </div>
      {error && <p className="native-notice error" role="alert">{error}</p>}
      {loading && <p className="native-notice">Загружаю упражнения…</p>}
      {!loading && lesson && (
        <div className="native-exercises-grid">
          <div className="native-exercise-list" aria-label="Список упражнений">
            <div className="native-exercise-tabs" role="tablist" aria-label="Тип заданий">
              <button className={activeExerciseTab === "topic" ? "active" : ""} type="button" role="tab" aria-selected={activeExerciseTab === "topic"} onClick={() => setActiveExerciseTab("topic")}>По теме <span>{lesson.exercises.length}</span></button>
              <button className={activeExerciseTab === "generated" ? "active" : ""} type="button" role="tab" aria-selected={activeExerciseTab === "generated"} onClick={() => setActiveExerciseTab("generated")}>Мои задания <span>{lesson.generated_exercises.length}</span></button>
            </div>
            {visibleExercises.length === 0 && <p className="native-exercise-empty">{activeExerciseTab === "topic" ? "Для этой темы упражнений пока нет." : "Здесь появятся задания, созданные для этой темы."}</p>}
            {visibleExercises.map((exercise, index) => (
              <button className={`native-exercise-card ${activeExerciseTab === "generated" ? "generated" : ""} ${selectedExerciseId === exercise.id ? "active" : ""}`} key={exercise.id} type="button" onClick={() => { setSelectedExerciseId(exercise.id); setAssessment(null); }}>
                <span>{activeExerciseTab === "topic" ? `УПРАЖНЕНИЕ ${index + 1}` : `МОЁ ЗАДАНИЕ ${index + 1}`}</span>
                <strong>{exercise.question}</strong>
                {exercise.instruction && <small>{exercise.instruction}</small>}
                {exercise.submitted_answer && <em className={exercise.is_completed ? "correct" : "pending"}>{exercise.is_resolved ? "Исправлено" : exercise.is_completed ? "Пройдено" : "Последний ответ"}{exercise.score !== null ? ` · ${exercise.score}/100` : ""}</em>}
              </button>
            ))}
          </div>
          <form className="native-answer-form" onSubmit={(event) => void submit(event)}>
            <div className="native-answer-heading"><span>Текущий ответ</span>{selectedExercise && <strong>{selectedExercise.question}</strong>}</div>
            <textarea ref={answerRef} rows={5} value={answer} onChange={(event) => setAnswer(event.target.value)} placeholder="Напиши ответ по-словацки…" disabled={!selectedExercise || submitting} required />
            <div className="native-keyboard" aria-label="Словацкие буквы">{slovakKeys.map((key) => <button key={key} type="button" onClick={() => insertKey(key)}>{key}</button>)}</div>
            <button className="native-submit-answer" type="submit" disabled={!selectedExercise || !answer.trim() || submitting}>{submitting ? "AI проверяет…" : "Проверить"}</button>
          </form>
        </div>
      )}
      {assessment && <article className={`native-assessment ${assessment.is_correct ? "correct" : "wrong"}`}><div><strong>{assessment.is_correct ? "Верно" : "Нужно исправить"}</strong><span>{assessment.score}/100</span></div>{!assessment.is_correct && <p><b>Исправленный вариант:</b> {assessment.corrected_answer}</p>}<p>{assessment.explanation}</p>{assessment.next_exercise && <p><b>Следующий шаг:</b> {assessment.next_exercise}</p>}</article>}
    </section>
  );
}
