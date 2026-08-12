"use client";

import { FormEvent, useEffect, useState } from "react";
import { type Exercise, type Lesson, type RoadmapModule, type PythonTestCase, getCourseRoadmap, getLesson } from "../lib/api";
import { runPythonInBrowser } from "../lib/pythonWorker";

const courseSlug = "python-course";
const pythonPassedKey = "python-passed-exercises";
const pythonCompletedLessonsKey = "python-completed-lessons";

export function PythonScreen() {
  const [roadmap, setRoadmap] = useState<RoadmapModule[]>([]);
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [exercise, setExercise] = useState<Exercise | null>(null);
  const [code, setCode] = useState("");
  const [stdin, setStdin] = useState("");
  const [output, setOutput] = useState("");
  const [notice, setNotice] = useState<string | null>(null);
  const [running, setRunning] = useState(false);
  const [passedExerciseIds, setPassedExerciseIds] = useState<Set<number>>(() => new Set());
  const [completedLessonIds, setCompletedLessonIds] = useState<Set<number>>(() => new Set());

  useEffect(() => {
    setPassedExerciseIds(new Set(JSON.parse(window.localStorage.getItem(pythonPassedKey) ?? "[]") as number[]));
    setCompletedLessonIds(new Set(JSON.parse(window.localStorage.getItem(pythonCompletedLessonsKey) ?? "[]") as number[]));
  }, []);

  const markPassed = (exerciseId: number) => {
    const passed = new Set(passedExerciseIds);
    passed.add(exerciseId);
    window.localStorage.setItem(pythonPassedKey, JSON.stringify([...passed]));
    setPassedExerciseIds(passed);
  };

  const openLesson = async (lessonId: number) => {
    const nextLesson = await getLesson(lessonId);
    const nextExercise = nextLesson.exercises[0] ?? null;
    setLesson(nextLesson);
    setExercise(nextExercise);
    setCode(nextExercise?.instruction ?? "");
    setStdin("");
    setOutput("");
    setNotice(null);
  };

  const refreshRoadmap = async () => {
    const nextRoadmap = await getCourseRoadmap(courseSlug);
    setRoadmap(nextRoadmap);
    return nextRoadmap;
  };

  useEffect(() => { void (async () => {
    try {
      const nextRoadmap = await refreshRoadmap();
      const first = nextRoadmap.flatMap((module) => module.lessons).find((item) => item.status === "current") ?? nextRoadmap.flatMap((module) => module.lessons)[0];
      if (first) await openLesson(first.id);
    } catch (cause) { setNotice(cause instanceof Error ? cause.message : "Не удалось загрузить курс Python."); }
  })(); }, []);

  const selectExercise = (nextExercise: Exercise) => {
    setExercise(nextExercise);
    setCode(nextExercise.instruction ?? "");
    setOutput("");
    setNotice(null);
  };

  const run = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!lesson || !exercise || !code.trim() || running) return;
    setRunning(true);
    setNotice(null);
    try {
      const cases: PythonTestCase[] = exercise.test_cases.length ? exercise.test_cases : [{ stdin, expected_output: exercise.expected_output ?? "" }];
      const results = await Promise.all(cases.map((testCase) => runPythonInBrowser(code, testCase.stdin)));
      const failedCase = results.find((result, index) => result.stderr || result.stdout.trim() !== cases[index].expected_output.trim());
      const result = failedCase ?? results[0];
      setOutput([result.stdout, result.stderr].filter(Boolean).join(result.stdout && result.stderr ? "\n" : ""));
      window.localStorage.setItem(`python-draft-${exercise.id}`, code);
      const passed = !failedCase;
      if (passed) markPassed(exercise.id);
      setNotice(result.stderr ? "Код завершился с ошибкой. Исправь её и запусти снова." : passed ? `✓ Пройдены все сценарии (${cases.length}). Черновик и результат сохранены в браузере.` : "Код выполнился, но не прошёл один из сценариев. Сверь вывод и граничные случаи." );
    } catch (cause) { setNotice(cause instanceof Error ? cause.message : "Не удалось запустить код."); }
    finally { setRunning(false); }
  };

  const finishLesson = async () => {
    if (!lesson || running) return;
    if (!lesson.exercises.some((item) => passedExerciseIds.has(item.id))) {
      setNotice("Сначала пройди хотя бы одну задачу этой темы: все её сценарии должны завершиться успешно.");
      return;
    }
    const completed = new Set(completedLessonIds);
    completed.add(lesson.id);
    window.localStorage.setItem(pythonCompletedLessonsKey, JSON.stringify([...completed]));
    setCompletedLessonIds(completed);
    const lessons = roadmap.flatMap((module) => module.lessons);
    const currentIndex = lessons.findIndex((item) => item.id === lesson.id);
    const next = lessons[currentIndex + 1];
    if (next) {
      await openLesson(next.id);
      setNotice("✓ Тема завершена локально в этом браузере. Открыта следующая тема.");
    } else setNotice("✓ Курс завершён локально в этом браузере. Выбери тему для повторения.");
  };

  return <section className="python-screen" aria-labelledby="python-title">
    <header className="python-heading"><div><p className="native-eyebrow">Интерактивный курс · 4 части</p><h2 id="python-title">Python: учись и запускай код</h2><p>Редактор запускает короткие учебные программы. Импорты, сеть, файлы, GUI и сторонние библиотеки выполняй в локальном Python на компьютере.</p></div></header>
    {notice && <p className="native-notice" role="status">{notice}</p>}
    <div className="python-grid">
      <aside className="native-roadmap python-roadmap" aria-label="Маршрут Python">
        {roadmap.map((module) => <section key={module.id}><h3>{module.title}</h3>{module.lessons.map((item) => <button key={item.id} type="button" disabled={running} className={`native-roadmap-item ${completedLessonIds.has(item.id) ? "completed" : item.status} ${lesson?.id === item.id ? "active" : ""}`} onClick={() => void openLesson(item.id)}><span className="native-roadmap-dot">{completedLessonIds.has(item.id) || item.status === "completed" ? "✓" : item.status === "current" ? "•" : "○"}</span><span>{item.title}</span></button>)}</section>)}
      </aside>
      <div className="python-workspace">
        {lesson && <><article className="python-theory"><p className="native-eyebrow">Тема</p><h3>{lesson.title}</h3>{(lesson.theory ?? "").split("\n").map((paragraph, index) => <p key={index}>{paragraph}</p>)}</article>
        <div className="python-exercises">{lesson.exercises.map((item, index) => <button key={item.id} type="button" className={exercise?.id === item.id ? "active" : ""} onClick={() => selectExercise(item)}><span>ЗАДАЧА {index + 1}</span><strong>{item.question}</strong>{(passedExerciseIds.has(item.id) || item.is_completed) && <em>✓ Выполнено</em>}</button>)}</div>
        {exercise && <form className="python-editor" onSubmit={(event) => void run(event)}><label htmlFor="python-code">Код</label><textarea id="python-code" spellCheck={false} value={code} onChange={(event) => setCode(event.target.value)} rows={14} disabled={running} />{exercise.hint && <p className="python-hint">Подсказка: {exercise.hint}</p>}<label htmlFor="python-input">Ввод для input() — по одному значению на строку</label><textarea id="python-input" value={stdin} onChange={(event) => setStdin(event.target.value)} rows={3} disabled={running} placeholder="Например: 6" /><div><button className="native-submit-answer" type="submit" disabled={running || !code.trim()}>{running ? "Запускаю…" : "▶ Запустить код"}</button><button className="native-refresh" type="button" disabled={running} onClick={() => void finishLesson()}>Завершить тему</button></div><label htmlFor="python-output">Вывод</label><pre id="python-output" className="python-output">{output || "Здесь появится результат запуска."}</pre>{exercise.explanation && <details className="python-explanation"><summary>Разбор решения (по желанию)</summary><p>{exercise.explanation}</p></details>}</form>}</>}
      </div>
    </div>
  </section>;
}
