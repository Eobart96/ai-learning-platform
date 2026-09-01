"use client";

import { type Dispatch, type SetStateAction, useEffect, useRef, useState } from "react";

import { a1CourseModules, findA1Lesson, getA1Module } from "../data/a1Course";
import { buildInitialProgress } from "../data/courseEngine";
import { type LessonSummary, type MistakeRecord } from "../data/courseProgress";
import { type LessonStatus } from "../data/courseTypes";
import { getCourseState, saveCourseState, type CourseState } from "../lib/api";

export type ProgressMap = Record<string, LessonStatus>;
export type ChatInteractionKind = "answer" | "clarification" | "continue";
export type ChatMessage = { id: number; role: "assistant" | "user"; text: string; task?: string; suggestions?: string[]; countsAsPractice?: boolean; createdAt?: string; interactionKind?: ChatInteractionKind; diagnostic?: Record<string, unknown> };
export type FontSize = "normal" | "large" | "extra-large";
export type { LessonSummary, MistakeRecord } from "../data/courseProgress";

type SessionSetter<Key extends keyof CourseSessionState> = Dispatch<SetStateAction<CourseSessionState[Key]>>;

export type CourseSessionState = {
  activeModule: number;
  selectedSlug: string;
  fontSize: FontSize;
  progress: ProgressMap;
  lessonSteps: Record<string, number>;
  checkSelections: Record<string, string>;
  practiceAnswers: Record<string, string>;
  practiceResults: Record<string, boolean>;
  mistakes: Record<string, MistakeRecord>;
  finalSelections: Record<string, string>;
  finalCompletedModules: Record<string, boolean>;
  chatHistories: Record<string, ChatMessage[]>;
  lessonSummaries: Record<string, LessonSummary>;
};

export type CourseSessionActions = {
  setActiveModule: SessionSetter<"activeModule">;
  setSelectedSlug: SessionSetter<"selectedSlug">;
  setFontSize: SessionSetter<"fontSize">;
  setProgress: SessionSetter<"progress">;
  setLessonSteps: SessionSetter<"lessonSteps">;
  setCheckSelections: SessionSetter<"checkSelections">;
  setPracticeAnswers: SessionSetter<"practiceAnswers">;
  setPracticeResults: SessionSetter<"practiceResults">;
  setMistakes: SessionSetter<"mistakes">;
  setFinalSelections: SessionSetter<"finalSelections">;
  setFinalCompletedModules: SessionSetter<"finalCompletedModules">;
  setChatHistories: SessionSetter<"chatHistories">;
  setLessonSummaries: SessionSetter<"lessonSummaries">;
};

export type CourseSession = CourseSessionState & CourseSessionActions & { persistenceError: string };

type PersistedCourseSession = Partial<CourseSessionState> & { finalCompleted?: boolean };

// These legacy keys are a compatibility boundary until a dedicated migration is approved.
const progressStorageKey = "slovak-module-1-beta-progress";
const sessionStorageKey = "slovak-module-1-beta-session-v1";
const fontSizeStorageKey = "slovak-module-1-beta-font-size";
const persistenceRetryDelayMs = 1_500;

function initialProgress(): ProgressMap {
  return buildInitialProgress(a1CourseModules);
}

function readJsonObject(key: string): Record<string, unknown> {
  const raw = window.localStorage.getItem(key);
  if (!raw) return {};
  try {
    const parsed: unknown = JSON.parse(raw);
    return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed as Record<string, unknown> : {};
  } catch {
    return {};
  }
}

function readLegacySession(): PersistedCourseSession {
  const storedFontSize = window.localStorage.getItem(fontSizeStorageKey);
  const fontSize: FontSize = storedFontSize === "normal" || storedFontSize === "large" || storedFontSize === "extra-large" ? storedFontSize : "large";
  return {
    ...readJsonObject(sessionStorageKey),
    progress: { ...initialProgress(), ...readJsonObject(progressStorageKey) } as ProgressMap,
    fontSize,
  };
}

function resolveSession(parsed: PersistedCourseSession): CourseSessionState {
  const restoredLesson = parsed.selectedSlug ? findA1Lesson(parsed.selectedSlug) : undefined;
  const restoredModule = restoredLesson ? a1CourseModules.find((module) => module.lessons.some((lesson) => lesson.slug === restoredLesson.slug)) : undefined;
  const activeModule = restoredModule?.order ?? (parsed.activeModule && a1CourseModules.some((module) => module.order === parsed.activeModule) ? parsed.activeModule : 1);
  return {
    activeModule,
    selectedSlug: restoredLesson?.slug ?? getA1Module(activeModule).lessons[0].slug,
    fontSize: parsed.fontSize ?? "large",
    progress: { ...initialProgress(), ...(parsed.progress ?? {}) },
    lessonSteps: parsed.lessonSteps ?? {},
    checkSelections: parsed.checkSelections ?? {},
    practiceAnswers: parsed.practiceAnswers ?? {},
    practiceResults: parsed.practiceResults ?? {},
    mistakes: parsed.mistakes ?? {},
    finalSelections: parsed.finalSelections ?? {},
    finalCompletedModules: { ...(parsed.finalCompleted ? { "1": true } : {}), ...(parsed.finalCompletedModules ?? {}) },
    chatHistories: parsed.chatHistories ?? {},
    lessonSummaries: parsed.lessonSummaries ?? {},
  };
}

function toCourseState(session: CourseSessionState): CourseState {
  return { ...session, finalCompleted: Boolean(session.finalCompletedModules["1"]) };
}

function writeLegacySession(session: CourseSessionState): void {
  window.localStorage.setItem(sessionStorageKey, JSON.stringify(toCourseState(session)));
  window.localStorage.setItem(progressStorageKey, JSON.stringify(session.progress));
  window.localStorage.setItem(fontSizeStorageKey, session.fontSize);
}

export function useCourseSession(): CourseSession {
  const [activeModule, setActiveModule] = useState(1);
  const [selectedSlug, setSelectedSlug] = useState(a1CourseModules[0].lessons[0].slug);
  const [fontSize, setFontSize] = useState<FontSize>("large");
  const [progress, setProgress] = useState<ProgressMap>(initialProgress);
  const [lessonSteps, setLessonSteps] = useState<Record<string, number>>({});
  const [checkSelections, setCheckSelections] = useState<Record<string, string>>({});
  const [practiceAnswers, setPracticeAnswers] = useState<Record<string, string>>({});
  const [practiceResults, setPracticeResults] = useState<Record<string, boolean>>({});
  const [mistakes, setMistakes] = useState<Record<string, MistakeRecord>>({});
  const [finalSelections, setFinalSelections] = useState<Record<string, string>>({});
  const [finalCompletedModules, setFinalCompletedModules] = useState<Record<string, boolean>>({});
  const [chatHistories, setChatHistories] = useState<Record<string, ChatMessage[]>>({});
  const [lessonSummaries, setLessonSummaries] = useState<Record<string, LessonSummary>>({});
  const [storageReady, setStorageReady] = useState(false);
  const [persistenceError, setPersistenceError] = useState("");
  const sessionRef = useRef<CourseSessionState>({ activeModule, selectedSlug, fontSize, progress, lessonSteps, checkSelections, practiceAnswers, practiceResults, mistakes, finalSelections, finalCompletedModules, chatHistories, lessonSummaries });
  const serverReadyRef = useRef(false);
  const offlineBaselineRef = useRef("");
  const offlineDirtyRef = useRef(false);
  const scheduleRetryRef = useRef<() => void>(() => undefined);

  const applySession = (session: CourseSessionState) => {
    sessionRef.current = session;
    setActiveModule(session.activeModule);
    setSelectedSlug(session.selectedSlug);
    setFontSize(session.fontSize);
    setProgress(session.progress);
    setLessonSteps(session.lessonSteps);
    setCheckSelections(session.checkSelections);
    setPracticeAnswers(session.practiceAnswers);
    setPracticeResults(session.practiceResults);
    setMistakes(session.mistakes);
    setFinalSelections(session.finalSelections);
    setFinalCompletedModules(session.finalCompletedModules);
    setChatHistories(session.chatHistories);
    setLessonSummaries(session.lessonSummaries);
  };

  useEffect(() => {
    let cancelled = false;
    let retryTimer: number | null = null;
    let synchronizing = false;

    const scheduleRetry = () => {
      if (cancelled || retryTimer !== null) return;
      retryTimer = window.setTimeout(() => {
        retryTimer = null;
        void synchronize();
      }, persistenceRetryDelayMs);
    };

    const synchronize = async () => {
      if (cancelled || synchronizing) return;
      synchronizing = true;
      try {
        if (!serverReadyRef.current) {
          const server = await getCourseState();
          if (cancelled) return;
          if (server.exists && server.state && !offlineDirtyRef.current) {
            const serverSession = resolveSession(server.state as PersistedCourseSession);
            applySession(serverSession);
            writeLegacySession(serverSession);
            offlineBaselineRef.current = JSON.stringify(toCourseState(serverSession));
          } else {
            await saveCourseState(toCourseState(sessionRef.current));
          }
          serverReadyRef.current = true;
          offlineDirtyRef.current = false;
        } else {
          await saveCourseState(toCourseState(sessionRef.current));
        }
        if (!cancelled) setPersistenceError("");
      } catch (cause) {
        if (!cancelled) {
          setPersistenceError(cause instanceof Error ? cause.message : "Не удалось синхронизировать данные курса с сервером.");
          scheduleRetry();
        }
      } finally {
        synchronizing = false;
      }
    };

    scheduleRetryRef.current = scheduleRetry;
    const localSession = resolveSession(readLegacySession());
    applySession(localSession);
    writeLegacySession(localSession);
    offlineBaselineRef.current = JSON.stringify(toCourseState(localSession));
    setStorageReady(true);
    void synchronize();

    return () => {
      cancelled = true;
      if (retryTimer !== null) window.clearTimeout(retryTimer);
      scheduleRetryRef.current = () => undefined;
    };
  }, []);

  useEffect(() => {
    if (!storageReady) return;
    const session = { activeModule, selectedSlug, fontSize, progress, lessonSteps, checkSelections, practiceAnswers, practiceResults, mistakes, finalSelections, finalCompletedModules, chatHistories, lessonSummaries };
    sessionRef.current = session;
    writeLegacySession(session);
    const serialized = JSON.stringify(toCourseState(session));
    if (!serverReadyRef.current) {
      if (serialized !== offlineBaselineRef.current) offlineDirtyRef.current = true;
      return;
    }
    const timer = window.setTimeout(() => {
      void saveCourseState(toCourseState(sessionRef.current))
        .then(() => setPersistenceError(""))
        .catch((cause) => {
          setPersistenceError(cause instanceof Error ? cause.message : "Не удалось сохранить данные курса.");
          scheduleRetryRef.current();
        });
    }, 350);
    return () => window.clearTimeout(timer);
  }, [storageReady, activeModule, selectedSlug, fontSize, progress, lessonSteps, checkSelections, practiceAnswers, practiceResults, mistakes, finalSelections, finalCompletedModules, chatHistories, lessonSummaries]);

  return { activeModule, selectedSlug, fontSize, progress, lessonSteps, checkSelections, practiceAnswers, practiceResults, mistakes, finalSelections, finalCompletedModules, chatHistories, lessonSummaries, setActiveModule, setSelectedSlug, setFontSize, setProgress, setLessonSteps, setCheckSelections, setPracticeAnswers, setPracticeResults, setMistakes, setFinalSelections, setFinalCompletedModules, setChatHistories, setLessonSummaries, persistenceError };
}
