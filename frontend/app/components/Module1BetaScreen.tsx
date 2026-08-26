"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";

import { a1CourseModules, allA1Lessons, findA1Lesson, getA1Module } from "../data/a1Course";
import { buildInitialProgress, orderedModuleLessons as getOrderedModuleLessons, topicGroupLessons } from "../data/courseEngine";
import { type BetaLesson, type LessonStatus, type StepPractice } from "../data/courseTypes";
import { askModule1Tutor, getModule1BetaState, saveModule1BetaState, type Module1BetaState } from "../lib/api";
import { SlovakKeyboard } from "./SlovakKeyboard";
import { Module1BetaExercises } from "./Module1BetaExercises";
import { Module1BetaReading } from "./Module1BetaReading";
import { Module1BetaVocabulary } from "./Module1BetaVocabulary";
import { Module1BetaHomework } from "./Module1BetaHomework";

type BetaView = "topics" | "material" | "exercises" | "reading" | "vocabulary" | "homework" | "chat" | "review" | "final" | "stats";
type ProgressMap = Record<string, LessonStatus>;
type ChatInteractionKind = "answer" | "clarification" | "continue";
type ChatMessage = { id: number; role: "assistant" | "user"; text: string; task?: string; suggestions?: string[]; countsAsPractice?: boolean; createdAt?: string; interactionKind?: ChatInteractionKind; diagnostic?: Record<string, unknown> };
type MistakeRecord = { id: string; lessonSlug: string; prompt: string; answer: string; attempts: number; mastered: boolean; reviewStage?: number; dueAt?: string };
type FontSize = "normal" | "large" | "extra-large";
type LessonSummary = { understanding: number; level: string; strengths: string[]; mistakes?: string[]; review: string[]; userTurns: number; evidence?: { coreCorrect: number; coreTotal: number } };
type ModuleArea = "learning" | "exercises" | "reading" | "vocabulary" | "homework" | "review";
type PracticeMatch = "correct" | "missing_diacritics" | "close" | "incorrect";

const progressStorageKey = "slovak-module-1-beta-progress";
const sessionStorageKey = "slovak-module-1-beta-session-v1";
const fontSizeStorageKey = "slovak-module-1-beta-font-size";
const targetChatTurns = 4;
const minimumChatTurns = 2;
const finalPassingPercent = 70;
const statusLabels: Record<LessonStatus, string> = {
  not_started: "Не начата",
  in_progress: "В процессе",
  completed: "Завершена",
};
function initialProgress(): ProgressMap {
  return buildInitialProgress(a1CourseModules);
}

function mockReply(lesson: BetaLesson, message: string): string {
  const normalized = message.toLocaleLowerCase("sk");
  if (lesson.slug === "greetings" && !normalized.includes("ahoj") && !normalized.includes("dobrý")) {
    return "Начни с приветствия: Ahoj — неформально, Dobrý deň — нейтрально и вежливо. Затем добавь Volám sa…";
  }
  if (lesson.slug === "verb-byt" && normalized.includes("nie") && !normalized.includes("nie som")) {
    return "Почти. Для «я не дома» нужна полная форма: Nie som doma. У глагола byť отрицание в настоящем времени пишется раздельно.";
  }
  if (lesson.slug === "numbers" && normalized.includes("dva káv")) {
    return "После числа 2 с káva используем женскую форму dve: Prosím si dve kávy.";
  }
  return `Хороший ответ для темы «${lesson.title}». Попробуй теперь расширить его ещё одной короткой фразой. Подсказка: ${lesson.chatSuggestions[0]}`;
}

function normalizeAnswer(value: string): string {
  return value
    .normalize("NFC")
    .toLocaleLowerCase("sk")
    .replace(/\p{P}+/gu, " ")
    .replace(/\s+/gu, " ")
    .trim();
}

function stripAnswerDiacritics(value: string): string {
  return value.normalize("NFD").replace(/\p{M}+/gu, "");
}

function editDistance(left: string, right: string): number {
  const leftChars = Array.from(left);
  const rightChars = Array.from(right);
  const previous = rightChars.map((_, index) => index + 1);
  previous.unshift(0);
  for (let leftIndex = 1; leftIndex <= leftChars.length; leftIndex += 1) {
    const current = [leftIndex];
    for (let rightIndex = 1; rightIndex <= rightChars.length; rightIndex += 1) {
      current[rightIndex] = Math.min(
        current[rightIndex - 1] + 1,
        previous[rightIndex] + 1,
        previous[rightIndex - 1] + (leftChars[leftIndex - 1] === rightChars[rightIndex - 1] ? 0 : 1),
      );
    }
    previous.splice(0, previous.length, ...current);
  }
  return previous[rightChars.length];
}

function isChatClarification(value: string): boolean {
  return /(?:не\s+понима|что\s+(?:нужно|делать)|объясни|поясни|повтори\s+задани|nerozumiem|čo\s+mám\s+robiť|vysvetli)/iu.test(value);
}

function isChatContinueCommand(value: string): boolean {
  const normalized = normalizeAnswer(value);
  return /^(?:а\s+)?(?:что\s+)?дальше(?:\s+делать)?$|^(?:продолжай|продолжить|следующее|следующий\s+(?:вопрос|шаг|задание))$|^(?:ďalej|pokračuj|pokračovať)$/iu.test(normalized);
}

function extractLegacyChatTask(message: ChatMessage): string | undefined {
  if (message.role !== "assistant") return undefined;
  const marker = "Следующее задание:";
  const markerIndex = message.text.lastIndexOf(marker);
  if (markerIndex < 0) return undefined;
  const task = message.text.slice(markerIndex + marker.length).trim();
  return task || undefined;
}

const latinWordSeparator = /(\p{Script=Latin}+(?:['’\-]\p{Script=Latin}+)*)/gu;
const latinWord = /^\p{Script=Latin}+(?:['’\-]\p{Script=Latin}+)*$/u;

function renderHighlightedChatText(text: string) {
  return text.split(latinWordSeparator).map((part, index) => latinWord.test(part)
    ? <mark className="module-beta-slovak-word" lang="sk" key={`${part}-${index}`}>{part}</mark>
    : part);
}

function getPracticeMatch(practice: StepPractice, value: string): PracticeMatch {
  const normalized = normalizeAnswer(value);
  const accepted = [...new Set([practice.answer, ...(practice.acceptableAnswers ?? [])].map(normalizeAnswer).filter(Boolean))];
  if (accepted.includes(normalized)) return "correct";
  if (normalized && accepted.some((answer) => stripAnswerDiacritics(answer) === stripAnswerDiacritics(normalized))) return "missing_diacritics";
  const typoThreshold = normalized.length >= 12 ? 2 : normalized.length >= 5 ? 1 : 0;
  if (typoThreshold > 0 && accepted.some((answer) => editDistance(answer, normalized) <= typoThreshold)) return "close";
  return "incorrect";
}

function isCorePractice(lesson: BetaLesson, practice: StepPractice): boolean {
  return lesson.sections[practice.sectionIndex]?.importance !== "extra";
}

export function buildReinforcementPractices(lesson: BetaLesson): StepPractice[] {
  const checkAsPractice = (check: BetaLesson["knowledgeChecks"][number]): StepPractice => ({
    id: check.id,
    sectionIndex: 0,
    type: "choice",
    prompt: check.question,
    options: check.options,
    answer: check.answer,
    hint: "Вспомните соответствующее правило и примеры темы.",
    explanation: check.explanation,
  });
  const firstText = lesson.stepPractices.find((practice) => practice.type === "text");
  const firstOrder = lesson.stepPractices.find((practice) => practice.type === "order");
  const prioritized = [
    lesson.finalChecks[0] ? checkAsPractice(lesson.finalChecks[0]) : null,
    firstText,
    firstOrder,
    ...lesson.knowledgeChecks.map(checkAsPractice),
    ...lesson.stepPractices,
    ...lesson.finalChecks.slice(1).map(checkAsPractice),
  ].filter((practice): practice is StepPractice => practice !== null && practice !== undefined);
  const selected: StepPractice[] = [];
  const usedAnswers = new Set<string>();
  const answerTokens = (answer: string): string[] => normalizeAnswer(answer).split(" ").filter(Boolean);
  const overlapsSelectedConcept = (answer: string): boolean => {
    const candidate = new Set(answerTokens(answer));
    return selected.some((item) => {
      const existing = new Set(answerTokens(item.answer));
      const smaller = candidate.size <= existing.size ? candidate : existing;
      const larger = candidate.size <= existing.size ? existing : candidate;
      return smaller.size > 0 && [...smaller].every((token) => larger.has(token));
    });
  };
  for (const practice of prioritized) {
    const answerKey = normalizeAnswer(practice.answer);
    if (!answerKey || usedAnswers.has(answerKey) || overlapsSelectedConcept(practice.answer)) continue;
    usedAnswers.add(answerKey);
    selected.push({ ...practice, id: `reinforcement:${lesson.slug}:${selected.length + 1}` });
    if (selected.length === 6) break;
  }
  if (selected.length < 6) {
    for (const practice of prioritized) {
      if (selected.some((item) => item.prompt === practice.prompt)) continue;
      selected.push({ ...practice, id: `reinforcement:${lesson.slug}:${selected.length + 1}` });
      if (selected.length === 6) break;
    }
  }
  return selected;
}

export function buildModuleFinalQuestions(lessons: BetaLesson[]) {
  const usedAnswers = new Set<string>();
  return lessons.flatMap((lesson) => {
    const selected = [] as Array<BetaLesson["knowledgeChecks"][number] & { lessonSlug: string; lessonTitle: string }>;
    const candidates = [lesson.knowledgeChecks[0], lesson.finalChecks[0], ...lesson.knowledgeChecks.slice(1), ...lesson.finalChecks.slice(1)].filter(Boolean);
    for (const question of candidates) {
      const answerKey = normalizeAnswer(question.answer);
      if (!answerKey || usedAnswers.has(answerKey)) continue;
      usedAnswers.add(answerKey);
      selected.push({ ...question, lessonSlug: lesson.slug, lessonTitle: lesson.title });
      if (selected.length === 2) break;
    }
    return selected;
  });
}

export function Module1BetaScreen({ requestedArea = "learning", onAreaChange }: { requestedArea?: ModuleArea; onAreaChange?: (area: ModuleArea) => void }) {
  const [view, setView] = useState<BetaView>("topics");
  const [topicGroup, setTopicGroup] = useState("root");
  const [activeModule, setActiveModule] = useState(1);
  const [selectedSlug, setSelectedSlug] = useState(a1CourseModules[0].lessons[0].slug);
  const [progress, setProgress] = useState<ProgressMap>(initialProgress);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [chatHistories, setChatHistories] = useState<Record<string, ChatMessage[]>>({});
  const [lessonSummaries, setLessonSummaries] = useState<Record<string, LessonSummary>>({});
  const [draft, setDraft] = useState("");
  const [chatMode, setChatMode] = useState<"codex" | "mock">("codex");
  const [chatError, setChatError] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [checkSelections, setCheckSelections] = useState<Record<string, string>>({});
  const [lessonSteps, setLessonSteps] = useState<Record<string, number>>({});
  const [practiceAnswers, setPracticeAnswers] = useState<Record<string, string>>({});
  const [practiceResults, setPracticeResults] = useState<Record<string, boolean>>({});
  const [mistakes, setMistakes] = useState<Record<string, MistakeRecord>>({});
  const [finalSelections, setFinalSelections] = useState<Record<string, string>>({});
  const [finalCompletedModules, setFinalCompletedModules] = useState<Record<string, boolean>>({});
  const [storageReady, setStorageReady] = useState(false);
  const [persistenceError, setPersistenceError] = useState("");
  const [fontSize, setFontSize] = useState<FontSize>("large");
  const practiceInputRef = useRef<HTMLInputElement>(null);
  const chatInputRef = useRef<HTMLTextAreaElement>(null);
  const chatMessagesRef = useRef<HTMLDivElement>(null);

  const activeCourseModule = useMemo(() => getA1Module(activeModule), [activeModule]);
  const orderedModuleLessons = useMemo(() => getOrderedModuleLessons(activeCourseModule), [activeCourseModule]);
  const displayLessonNumber = (lesson: BetaLesson): number => orderedModuleLessons.findIndex((item) => item.slug === lesson.slug) + 1;
  const topicGroups = activeCourseModule.topicGroups ?? [];
  const selectedTopicGroup = topicGroups.find((group) => group.id === topicGroup);
  const visibleTopicLessons = selectedTopicGroup
    ? topicGroupLessons(activeCourseModule, selectedTopicGroup.id)
    : topicGroups.length ? [] : activeCourseModule.lessons;
  const selectedLesson = useMemo(
    () => activeCourseModule.lessons.find((lesson) => lesson.slug === selectedSlug) ?? activeCourseModule.lessons[0],
    [activeCourseModule, selectedSlug],
  );
  const completedCount = activeCourseModule.lessons.filter((lesson) => progress[lesson.slug] === "completed").length;
  const selectedCheckScore = selectedLesson.knowledgeChecks.filter((check) => checkSelections[check.id] === check.answer).length;
  const selectedChecksAnswered = selectedLesson.knowledgeChecks.filter((check) => checkSelections[check.id]).length;
  const reinforcementPractices = useMemo(() => buildReinforcementPractices(selectedLesson), [selectedLesson]);
  const reinforcementScore = reinforcementPractices.filter((practice) => practiceResults[practice.id] === true).length;
  const reinforcementAnswered = reinforcementPractices.filter((practice) => practice.id in practiceResults).length;
  const reinforcementPassed = reinforcementScore === reinforcementPractices.length;
  const allReinforcementFilled = reinforcementPractices.every((practice) => (practiceAnswers[practice.id] ?? "").trim());
  const totalLessonSteps = selectedLesson.sections.length + 1;
  const currentLessonStep = Math.min(lessonSteps[selectedLesson.slug] ?? 0, totalLessonSteps - 1);
  const isCheckStep = currentLessonStep === selectedLesson.sections.length;
  const currentSection = selectedLesson.sections[currentLessonStep];
  const currentSectionOptional = currentSection?.importance === "extra";
  const currentPractice = selectedLesson.stepPractices.find((practice) => practice.sectionIndex === currentLessonStep);
  const currentPracticePassed = currentPractice ? practiceResults[currentPractice.id] === true : true;
  const currentPracticeCorrect = currentSectionOptional || currentPracticePassed;
  const extraSectionCount = selectedLesson.sections.filter((section) => section.importance === "extra").length;
  const checksPassed = selectedCheckScore === selectedLesson.knowledgeChecks.length;
  const allLessonsCompleted = completedCount === activeCourseModule.lessons.length;
  const activeLessonSlugs = new Set(activeCourseModule.lessons.map((lesson) => lesson.slug));
  const optionalPracticeIds = new Set(activeCourseModule.lessons.flatMap((lesson) => lesson.stepPractices.filter((practice) => !isCorePractice(lesson, practice)).map((practice) => practice.id)));
  const activeMistakes = Object.values(mistakes).filter((mistake) => !mistake.mastered && activeLessonSlugs.has(mistake.lessonSlug));
  const dueMistakes = activeMistakes.filter((mistake) => !mistake.dueAt || new Date(mistake.dueAt).getTime() <= Date.now());
  const totalPracticeCount = activeCourseModule.lessons.reduce((sum, lesson) => sum + lesson.stepPractices.filter((practice) => isCorePractice(lesson, practice)).length + lesson.knowledgeChecks.length, 0);
  const correctPracticeCount = activeCourseModule.lessons.reduce((sum, lesson) => sum + lesson.stepPractices.filter((practice) => isCorePractice(lesson, practice) && practiceResults[practice.id]).length + lesson.knowledgeChecks.filter((check) => checkSelections[check.id] === check.answer).length, 0);
  const totalMistakeAttempts = Object.values(mistakes).filter((mistake) => activeLessonSlugs.has(mistake.lessonSlug) && !optionalPracticeIds.has(mistake.id)).reduce((sum, mistake) => sum + mistake.attempts, 0);
  const accuracy = correctPracticeCount + totalMistakeAttempts === 0 ? 0 : Math.round((correctPracticeCount / (correctPracticeCount + totalMistakeAttempts)) * 100);
  const finalQuestions = useMemo(() => buildModuleFinalQuestions(activeCourseModule.lessons), [activeCourseModule]);
  const finalCompleted = Boolean(finalCompletedModules[String(activeModule)]);
  const finalScore = finalQuestions.filter((question) => finalSelections[question.id] === question.answer).length;
  const finalPassingScore = Math.ceil(finalQuestions.length * finalPassingPercent / 100);
  const finalPercentage = finalQuestions.length === 0 ? 0 : Math.round(finalScore / finalQuestions.length * 100);
  const finalPassed = finalCompleted && finalScore >= finalPassingScore;
  const finalIncorrectLessons = finalCompleted
    ? activeCourseModule.lessons.filter((lesson) => finalQuestions.some((question) => question.lessonSlug === lesson.slug && finalSelections[question.id] !== question.answer))
    : [];
  const currentChatTurns = messages.filter((message) => message.role === "user" && message.countsAsPractice !== false).length;
  const remainingRequiredChatTurns = Math.max(0, minimumChatTurns - currentChatTurns);
  const hasUserChatMessage = messages.some((message) => message.role === "user");
  const currentSummary = lessonSummaries[selectedLesson.slug];
  const currentSummaryMistakes = [...new Set(currentSummary?.mistakes ?? currentSummary?.review.filter((item) => item.includes("→")) ?? [])];
  const currentSummaryRecommendations = currentSummary?.mistakes === undefined && currentSummaryMistakes.length > 0
    ? ["Исправьте отмеченные формы и повторите их без подсказки.", "Вернитесь к ключевым фразам темы через 3 дня."]
    : currentSummary?.review ?? [];
  const currentTaskMessage = [...messages].reverse().find((message) => message.task?.trim() || extractLegacyChatTask(message));
  const currentChatTask = currentTaskMessage?.task?.trim() || (currentTaskMessage ? extractLegacyChatTask(currentTaskMessage) : undefined) || selectedLesson.chatPrompt;
  const currentChatSuggestions = (currentTaskMessage?.suggestions ?? (!hasUserChatMessage ? selectedLesson.chatSuggestions : [])).slice(0, 3);

  useEffect(() => {
    if (requestedArea === "learning") { setView("topics"); return; }
    setView(requestedArea === "exercises" ? "exercises" : requestedArea === "reading" ? "reading" : requestedArea === "vocabulary" ? "vocabulary" : requestedArea === "homework" ? "homework" : "review");
  }, [requestedArea]);

  useEffect(() => {
    const restore = (parsed: {
          selectedSlug?: string;
          activeModule?: number;
          fontSize?: FontSize;
          progress?: ProgressMap;
          lessonSteps?: Record<string, number>;
          checkSelections?: Record<string, string>;
          practiceAnswers?: Record<string, string>;
          practiceResults?: Record<string, boolean>;
          mistakes?: Record<string, MistakeRecord>;
          finalSelections?: Record<string, string>;
          finalCompleted?: boolean;
          finalCompletedModules?: Record<string, boolean>;
          chatHistories?: Record<string, ChatMessage[]>;
          lessonSummaries?: Record<string, LessonSummary>;
        }) => {
        const restoredLesson = parsed.selectedSlug ? findA1Lesson(parsed.selectedSlug) : undefined;
        const restoredModule = restoredLesson ? a1CourseModules.find((module) => module.lessons.some((lesson) => lesson.slug === restoredLesson.slug)) : undefined;
        const restoredModuleOrder = restoredModule?.order ?? (parsed.activeModule && a1CourseModules.some((module) => module.order === parsed.activeModule) ? parsed.activeModule : 1);
        setActiveModule(restoredModuleOrder);
        setSelectedSlug(restoredLesson?.slug ?? getA1Module(restoredModuleOrder).lessons[0].slug);
        if (parsed.fontSize) setFontSize(parsed.fontSize);
        setProgress({ ...initialProgress(), ...(parsed.progress ?? {}) });
        setLessonSteps(parsed.lessonSteps ?? {});
        setCheckSelections(parsed.checkSelections ?? {});
        setPracticeAnswers(parsed.practiceAnswers ?? {});
        setPracticeResults(parsed.practiceResults ?? {});
        setMistakes(parsed.mistakes ?? {});
        const restoredFinalSelections = parsed.finalSelections ?? {};
        setFinalSelections(restoredFinalSelections);
        setFinalCompletedModules({ ...(parsed.finalCompleted ? { "1": true } : {}), ...(parsed.finalCompletedModules ?? {}) });
        setChatHistories(parsed.chatHistories ?? {});
        setLessonSummaries(parsed.lessonSummaries ?? {});
    };

    void (async () => {
      try {
        const server = await getModule1BetaState();
        if (server.exists && server.state) {
          restore(server.state as typeof server.state & Parameters<typeof restore>[0]);
        } else {
          const legacyProgress = window.localStorage.getItem(progressStorageKey);
          const legacySession = window.localStorage.getItem(sessionStorageKey);
          const legacyFontSize = window.localStorage.getItem(fontSizeStorageKey);
          const importedFontSize: FontSize = legacyFontSize === "normal" || legacyFontSize === "large" || legacyFontSize === "extra-large" ? legacyFontSize : "large";
          const imported = {
            ...(legacySession ? JSON.parse(legacySession) as object : {}),
            progress: legacyProgress ? JSON.parse(legacyProgress) as ProgressMap : initialProgress(),
            fontSize: importedFontSize,
          };
          restore(imported);
          await saveModule1BetaState(imported as Module1BetaState);
        }
        setStorageReady(true);
      } catch (cause) {
        setPersistenceError(cause instanceof Error ? cause.message : "Не удалось загрузить данные курса с сервера.");
      }
    })();
  }, []);

  useEffect(() => {
    if (!storageReady) return;
    const timer = window.setTimeout(() => {
      const state: Module1BetaState = { activeModule, selectedSlug, fontSize, progress, lessonSteps, checkSelections, practiceAnswers, practiceResults, mistakes, finalSelections, finalCompleted: Boolean(finalCompletedModules["1"]), finalCompletedModules, chatHistories, lessonSummaries };
      void saveModule1BetaState(state).then(() => setPersistenceError("")).catch((cause) => setPersistenceError(cause instanceof Error ? cause.message : "Не удалось сохранить данные курса."));
    }, 350);
    return () => window.clearTimeout(timer);
  }, [storageReady, activeModule, selectedSlug, fontSize, progress, lessonSteps, checkSelections, practiceAnswers, practiceResults, mistakes, finalSelections, finalCompletedModules, chatHistories, lessonSummaries]);

  useEffect(() => {
    if (view !== "chat") return;
    const frame = window.requestAnimationFrame(() => {
      const container = chatMessagesRef.current;
      if (container) container.scrollTo({ top: container.scrollHeight, behavior: "smooth" });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [view, messages, isSending]);

  const openMaterial = (lesson: BetaLesson) => {
    setSelectedSlug(lesson.slug);
    setProgress((current) => ({ ...current, [lesson.slug]: current[lesson.slug] === "completed" ? "completed" : "in_progress" }));
    setView("material");
  };

  const selectModule = (moduleOrder: number) => {
    const nextModule = getA1Module(moduleOrder);
    setActiveModule(nextModule.order);
    setTopicGroup("root");
    setSelectedSlug(nextModule.lessons[0].slug);
    setMessages([]);
    setView("topics");
  };

  const openChat = () => {
    setDraft("");
    setChatMode("codex");
    setChatError("");
    setView("chat");
  };

  const setCurrentLessonStep = (step: number) => {
    setLessonSteps((current) => ({ ...current, [selectedLesson.slug]: Math.max(0, Math.min(step, totalLessonSteps - 1)) }));
  };

  const updatePracticeAnswer = (practice: StepPractice, answer: string) => {
    setPracticeAnswers((current) => ({ ...current, [practice.id]: answer }));
    setPracticeResults((current) => {
      const next = { ...current };
      delete next[practice.id];
      return next;
    });
  };

  const insertPracticeKey = (practice: StepPractice, key: string) => {
    const input = practiceInputRef.current;
    const answer = practiceAnswers[practice.id] ?? "";
    const start = input?.selectionStart ?? answer.length;
    const end = input?.selectionEnd ?? start;
    updatePracticeAnswer(practice, `${answer.slice(0, start)}${key}${answer.slice(end)}`);
    requestAnimationFrame(() => { input?.focus(); input?.setSelectionRange(start + key.length, start + key.length); });
  };

  const insertChatKey = (key: string) => {
    const textarea = chatInputRef.current;
    const start = textarea?.selectionStart ?? draft.length;
    const end = textarea?.selectionEnd ?? start;
    setDraft(`${draft.slice(0, start)}${key}${draft.slice(end)}`);
    requestAnimationFrame(() => { textarea?.focus(); textarea?.setSelectionRange(start + key.length, start + key.length); });
  };

  const appendChatSuggestion = (suggestion: string) => {
    setDraft((current) => current.trimEnd() ? `${current.trimEnd()} ${suggestion}` : suggestion);
    requestAnimationFrame(() => {
      const textarea = chatInputRef.current;
      textarea?.focus();
      textarea?.setSelectionRange(textarea.value.length, textarea.value.length);
    });
  };

  const checkPractice = (practice: StepPractice) => {
    const correct = getPracticeMatch(practice, practiceAnswers[practice.id] ?? "") === "correct";
    setPracticeResults((current) => ({ ...current, [practice.id]: correct }));
    setMistakes((current) => {
      if (correct && !current[practice.id]) return current;
      const previous = current[practice.id];
      const nextStage = correct ? Math.min((previous?.reviewStage ?? 0) + 1, 2) : 0;
      const dueAt = correct ? new Date(Date.now() + (nextStage === 1 ? 3 : 7) * 86400000).toISOString() : new Date().toISOString();
      return { ...current, [practice.id]: { id: practice.id, lessonSlug: selectedLesson.slug, prompt: practice.prompt, answer: practice.answer, attempts: (previous?.attempts ?? 0) + (correct ? 0 : 1), mastered: correct && nextStage >= 2, reviewStage: nextStage, dueAt } };
    });
  };

  const selectKnowledgeAnswer = (check: BetaLesson["knowledgeChecks"][number], option: string) => {
    setCheckSelections((current) => ({ ...current, [check.id]: option }));
    setMistakes((current) => {
      if (option === check.answer && !current[check.id]) return current;
      const previous = current[check.id];
      const correct = option === check.answer;
      const nextStage = correct ? Math.min((previous?.reviewStage ?? 0) + 1, 2) : 0;
      const dueAt = correct ? new Date(Date.now() + (nextStage === 1 ? 3 : 7) * 86400000).toISOString() : new Date().toISOString();
      return { ...current, [check.id]: { id: check.id, lessonSlug: selectedLesson.slug, prompt: check.question, answer: check.answer, attempts: (previous?.attempts ?? 0) + (correct ? 0 : 1), mastered: correct && nextStage >= 2, reviewStage: nextStage, dueAt } };
    });
  };

  const resetLesson = (lesson: BetaLesson) => {
    if (!window.confirm(`Сбросить прогресс темы «${lesson.title}»?`)) return;
    const ids = new Set([...lesson.stepPractices.map((practice) => practice.id), ...buildReinforcementPractices(lesson).map((practice) => practice.id), ...lesson.knowledgeChecks.map((check) => check.id), ...lesson.finalChecks.map((check) => check.id)]);
    setProgress((current) => ({ ...current, [lesson.slug]: "not_started" }));
    setLessonSteps((current) => ({ ...current, [lesson.slug]: 0 }));
    setPracticeAnswers((current) => Object.fromEntries(Object.entries(current).filter(([id]) => !ids.has(id))));
    setPracticeResults((current) => Object.fromEntries(Object.entries(current).filter(([id]) => !ids.has(id))));
    setCheckSelections((current) => Object.fromEntries(Object.entries(current).filter(([id]) => !ids.has(id))));
    setFinalSelections((current) => Object.fromEntries(Object.entries(current).filter(([id]) => !ids.has(id))));
    setFinalCompletedModules((current) => ({ ...current, [String(activeModule)]: false }));
    setMistakes((current) => Object.fromEntries(Object.entries(current).filter(([, mistake]) => mistake.lessonSlug !== lesson.slug)));
    setChatHistories((current) => Object.fromEntries(Object.entries(current).filter(([slug]) => slug !== lesson.slug)));
    setLessonSummaries((current) => Object.fromEntries(Object.entries(current).filter(([slug]) => slug !== lesson.slug)));
    setView("topics");
  };

  const resetModuleProgress = () => {
    if (!window.confirm(`Сбросить прогресс, ответы, ошибки и итоговый тест для ${activeCourseModule.title}?`)) return;
    const slugs = new Set(activeCourseModule.lessons.map((lesson) => lesson.slug));
    const ids = new Set(activeCourseModule.lessons.flatMap((lesson) => [...lesson.stepPractices.map((practice) => practice.id), ...buildReinforcementPractices(lesson).map((practice) => practice.id), ...lesson.knowledgeChecks.map((check) => check.id), ...lesson.finalChecks.map((check) => check.id)]));
    setProgress((current) => ({ ...current, ...Object.fromEntries([...slugs].map((slug) => [slug, "not_started" as const])) }));
    setLessonSteps((current) => Object.fromEntries(Object.entries(current).filter(([slug]) => !slugs.has(slug))));
    setPracticeAnswers((current) => Object.fromEntries(Object.entries(current).filter(([id]) => !ids.has(id))));
    setPracticeResults((current) => Object.fromEntries(Object.entries(current).filter(([id]) => !ids.has(id))));
    setCheckSelections((current) => Object.fromEntries(Object.entries(current).filter(([id]) => !ids.has(id))));
    setFinalSelections((current) => Object.fromEntries(Object.entries(current).filter(([id]) => !ids.has(id))));
    setFinalCompletedModules((current) => ({ ...current, [String(activeModule)]: false }));
    setMistakes((current) => Object.fromEntries(Object.entries(current).filter(([, mistake]) => !slugs.has(mistake.lessonSlug))));
    setChatHistories((current) => Object.fromEntries(Object.entries(current).filter(([slug]) => !slugs.has(slug))));
    setLessonSummaries((current) => Object.fromEntries(Object.entries(current).filter(([slug]) => !slugs.has(slug))));
    setMessages([]);
    setView("topics");
  };

  const buildLessonSummary = (userTurns = currentChatTurns, newestMistake?: MistakeRecord): LessonSummary => {
    const optionalLessonPracticeIds = new Set(selectedLesson.stepPractices.filter((practice) => !isCorePractice(selectedLesson, practice)).map((practice) => practice.id));
    const corePractices = selectedLesson.stepPractices.filter((practice) => isCorePractice(selectedLesson, practice));
    const successfulPractices = corePractices.filter((practice) => practiceResults[practice.id] === true);
    const successfulChecks = selectedLesson.knowledgeChecks.filter((check) => checkSelections[check.id] === check.answer);
    const activities = [...corePractices.map((practice) => practiceResults[practice.id] === true), ...selectedLesson.knowledgeChecks.map((check) => checkSelections[check.id] === check.answer), ...reinforcementPractices.map((practice) => practiceResults[practice.id] === true)];
    const activityScore = activities.length ? activities.filter(Boolean).length / activities.length : 0;
    const mistakeMap = new Map(Object.values(mistakes).filter((mistake) => mistake.lessonSlug === selectedLesson.slug && !mistake.mastered && !optionalLessonPracticeIds.has(mistake.id)).map((mistake) => [mistake.id, mistake]));
    if (newestMistake) mistakeMap.set(newestMistake.id, newestMistake);
    const lessonMistakes = [...mistakeMap.values()];
    const understanding = Math.max(0, Math.min(100, Math.round(activityScore * 100 - Math.min(15, lessonMistakes.length * 3))));
    const level = understanding >= 85 ? "Уверенное понимание" : understanding >= 65 ? "Хорошая основа" : "Нужно повторение";
    const strengths = [...new Set([
      ...successfulPractices.slice(0, 2).map((practice) => `Самостоятельно выполнено: ${practice.prompt}`),
      ...successfulChecks.slice(0, 1).map((check) => `Распознана нормативная форма: ${check.answer}`),
      ...(userTurns > 0 ? [`Выполнено заданий на закрепление: ${userTurns}`] : []),
    ])].slice(0, 3);
    const mistakeSummaries = lessonMistakes.slice(0, 3).map((mistake) => `${mistake.prompt} → нормативно: ${mistake.answer}`);
    const unfinishedExtraSections = selectedLesson.sections.filter((section, index) => section.importance === "extra" && !selectedLesson.stepPractices.some((practice) => practice.sectionIndex === index && practiceResults[practice.id] === true));
    const review = [
      ...(lessonMistakes.length ? [`Исправьте и повторите: ${lessonMistakes[0].prompt} → ${lessonMistakes[0].answer}`] : []),
      ...(userTurns < reinforcementPractices.length ? [`Завершите задания на закрепление: осталось ${reinforcementPractices.length - userTurns}.`] : []),
      "Повторите ключевые формы без подсказки через 3 дня.",
      ...(unfinishedExtraSections.length ? [`По желанию изучите дополнительный раздел «${unfinishedExtraSections[0].title}».`] : []),
    ].slice(0, 3);
    return { understanding, level, strengths: strengths.length ? strengths : selectedLesson.goals.slice(0, 1), mistakes: mistakeSummaries, review, userTurns, evidence: { coreCorrect: activities.filter(Boolean).length, coreTotal: activities.length } };
  };

  const finishChatPractice = (userTurns = currentChatTurns, newestMistake?: MistakeRecord) => {
    if (userTurns < minimumChatTurns) return;
    setLessonSummaries((current) => ({ ...current, [selectedLesson.slug]: buildLessonSummary(userTurns, newestMistake) }));
    setProgress((current) => ({ ...current, [selectedLesson.slug]: "completed" }));
  };

  const finishReinforcementPractice = () => {
    if (!reinforcementPassed) return;
    setLessonSummaries((current) => ({ ...current, [selectedLesson.slug]: buildLessonSummary(reinforcementScore) }));
    setProgress((current) => ({ ...current, [selectedLesson.slug]: "completed" }));
  };

  const checkAllReinforcement = () => {
    if (!allReinforcementFilled) return;
    reinforcementPractices.forEach((practice) => checkPractice(practice));
  };

  const continueAfterSummary = () => {
    const nextLesson = orderedModuleLessons[displayLessonNumber(selectedLesson)];
    if (nextLesson) openMaterial(nextLesson);
    else setView("final");
  };

  const clearCurrentChat = () => {
    const initial = [{ id: Date.now(), role: "assistant" as const, text: selectedLesson.chatPrompt, task: selectedLesson.chatPrompt, suggestions: selectedLesson.chatSuggestions.slice(0, 3), createdAt: new Date().toISOString() }];
    setMessages(initial);
    setChatHistories((current) => ({ ...current, [selectedLesson.slug]: initial }));
    setLessonSummaries((current) => Object.fromEntries(Object.entries(current).filter(([slug]) => slug !== selectedLesson.slug)));
    setProgress((current) => ({ ...current, [selectedLesson.slug]: "in_progress" }));
    setChatError("");
  };

  const exportChatLog = () => {
    const exportedAt = new Date().toISOString();
    const payload = {
      format: "slovak-module-chat-log",
      version: 1,
      exportedAt,
      activeLesson: { slug: selectedLesson.slug, title: selectedLesson.title, slovakTitle: selectedLesson.slovakTitle, currentTask: currentChatTask },
      counters: { meaningfulAnswers: currentChatTurns, targetAnswers: targetChatTurns, minimumAnswers: minimumChatTurns },
      mode: chatMode,
      lastError: chatError || null,
      currentConversation: messages,
      histories: chatHistories,
      summaries: lessonSummaries,
      mistakes: Object.values(mistakes).filter((mistake) => mistake.lessonSlug === selectedLesson.slug),
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `chat-log-${selectedLesson.slug}-${exportedAt.slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const sendMessage = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const text = draft.trim();
    if (!text || isSending || currentSummary) return;
    const interactionKind: ChatInteractionKind = isChatClarification(text) ? "clarification" : isChatContinueCommand(text) ? "continue" : "answer";
    const countsAsPractice = interactionKind === "answer";
    const nextUserTurnCount = currentChatTurns + (countsAsPractice ? 1 : 0);
    const userMessage = { id: Date.now(), role: "user" as const, text, countsAsPractice, interactionKind, createdAt: new Date().toISOString(), diagnostic: { taskAtSubmission: currentChatTask } };
    const history = messages.slice(-6);
    setMessages((current) => [...current, userMessage].slice(-20));
    setChatHistories((current) => ({ ...current, [selectedLesson.slug]: [...(current[selectedLesson.slug] ?? messages), userMessage].slice(-20) }));
    setDraft("");
    setIsSending(true);
    setChatError("");
    const theoryIntroduction = [selectedLesson.theory.summary, ...selectedLesson.theory.rules, ...selectedLesson.theory.examples.map((example) => `${example.slovak} — ${example.russian}. ${example.explanation}`)];
    const theory = [...theoryIntroduction, ...selectedLesson.sections.map((section) => [section.title, ...(section.paragraphs ?? []), ...(section.items ?? []), ...(section.table?.rows.map((row) => row.join(" — ")) ?? []), section.note ?? ""].filter(Boolean).join("\n"))].join("\n\n").slice(0, 8000);
    const lessonMistakes = Object.values(mistakes).filter((mistake) => mistake.lessonSlug === selectedLesson.slug).map((mistake) => `${mistake.prompt} → ${mistake.answer}`).slice(0, 20);
    try {
      const result = await askModule1Tutor({ lesson_slug: selectedLesson.slug, lesson_title: `${selectedLesson.title} (${selectedLesson.slovakTitle})`, goals: selectedLesson.goals, theory, known_mistakes: lessonMistakes, history: history.map((message) => ({ role: message.role, content: message.text })), message: text, current_task: currentChatTask, interaction_kind: interactionKind, is_final_turn: countsAsPractice && nextUserTurnCount >= targetChatTurns });
      const responseText = [result.reply, result.correction ? `Исправление: ${result.correction}` : "", result.explanation ?? ""].filter(Boolean).join("\n\n");
      const nextSuggestions = (result.suggestions ?? []).map((suggestion) => suggestion.trim()).filter(Boolean).slice(0, 3);
      const assistantMessage = { id: Date.now() + 1, role: "assistant" as const, text: responseText, task: result.next_question?.trim() || undefined, suggestions: nextSuggestions, createdAt: new Date().toISOString(), diagnostic: { provider: result.provider, reply: result.reply, correction: result.correction, explanation: result.explanation, mistakeOriginal: result.mistake_original, mistakeCorrected: result.mistake_corrected } };
      setMessages((current) => [...current, assistantMessage].slice(-20));
      setChatHistories((current) => ({ ...current, [selectedLesson.slug]: [...(current[selectedLesson.slug] ?? []), assistantMessage].slice(-20) }));
      let newestChatMistake: MistakeRecord | undefined;
      if (result.mistake_original && result.mistake_corrected) {
        const id = `chat:${selectedLesson.slug}:${normalizeAnswer(result.mistake_corrected).slice(0, 80)}`;
        newestChatMistake = { id, lessonSlug: selectedLesson.slug, prompt: result.mistake_original, answer: result.mistake_corrected, attempts: (mistakes[id]?.attempts ?? 0) + 1, mastered: false, reviewStage: 0, dueAt: new Date().toISOString() };
        setMistakes((current) => ({ ...current, [id]: { ...newestChatMistake!, attempts: (current[id]?.attempts ?? 0) + 1 } }));
      }
      setChatMode("codex");
      if (countsAsPractice && nextUserTurnCount >= targetChatTurns) finishChatPractice(nextUserTurnCount, newestChatMistake);
    } catch (error) {
      const fallbackMessage = { id: Date.now() + 1, role: "assistant" as const, text: mockReply(selectedLesson, text) };
      setMessages((current) => [...current, fallbackMessage].slice(-20));
      setChatHistories((current) => ({ ...current, [selectedLesson.slug]: [...(current[selectedLesson.slug] ?? []), fallbackMessage].slice(-20) }));
      setChatMode("mock");
      setChatError(error instanceof Error ? error.message : "Codex CLI временно недоступен");
      if (countsAsPractice && nextUserTurnCount >= targetChatTurns) finishChatPractice(nextUserTurnCount);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <section className="module-beta" data-font-size={fontSize} aria-labelledby="module-beta-title">
      <header className="module-beta-hero">
        <div>
          <label className="module-beta-module-switcher">
            <span>Учебный модуль</span>
            <select value={activeModule} onChange={(event) => selectModule(Number(event.target.value))} aria-label="Выберите учебный модуль">
              {a1CourseModules.map((module) => <option value={module.order} key={module.slug}>{module.title}</option>)}
            </select>
          </label>
          <span className="module-beta-kicker">Интерактивный курс · {activeCourseModule.level}</span>
          <h2 id="module-beta-title">{activeCourseModule.title}</h2>
          <p>{activeCourseModule.description}</p>
        </div>
        <div className="module-beta-progress" aria-label={`Завершено ${completedCount} из ${activeCourseModule.lessons.length} тем`}>
          <strong>{completedCount}/{activeCourseModule.lessons.length}</strong>
          <span>тем завершено</span>
          <div><i style={{ width: `${(completedCount / activeCourseModule.lessons.length) * 100}%` }} /></div>
        </div>
        <fieldset className="module-beta-font-control">
          <legend>Размер текста</legend>
          {(["normal", "large", "extra-large"] as const).map((size, index) => (
            <button type="button" key={size} className={fontSize === size ? "active" : ""} onClick={() => setFontSize(size)} aria-pressed={fontSize === size} aria-label={["Обычный размер текста", "Крупный размер текста", "Очень крупный размер текста"][index]}>A{index > 0 ? <sup>{index + 1}</sup> : ""}</button>
          ))}
        </fieldset>
      </header>
      {persistenceError && <p className="module-beta-persistence-error" role="alert">Данные временно не синхронизированы с базой: {persistenceError}</p>}

      {requestedArea === "learning" && <nav className="module-beta-breadcrumbs" aria-label={`Навигация обучения ${activeCourseModule.title}`}>
        <button type="button" className={view === "topics" ? "active" : ""} onClick={() => setView("topics")}>Темы</button>
        <span>›</span>
        <button type="button" className={view === "material" ? "active" : ""} disabled={view === "topics"} onClick={() => setView("material")}>Материал</button>
        <span>›</span>
        <button type="button" className={view === "chat" ? "active" : ""} disabled={progress[selectedLesson.slug] === "not_started"} onClick={() => setView("chat")}>Закрепление</button>
        <span>·</span>
        <button type="button" className={view === "final" ? "active" : ""} disabled={!allLessonsCompleted} onClick={() => setView("final")}>Итоговый тест</button>
        <span>·</span>
        <button type="button" className={view === "stats" ? "active" : ""} onClick={() => setView("stats")}>Статистика</button>
      </nav>}

      {view === "topics" && (
        <div className="module-beta-topics">
          <div className="module-beta-section-heading"><div><span>{selectedTopicGroup ? "Раздел" : "Шаг 1"}</span><h3>{selectedTopicGroup?.title ?? (topicGroups.length ? "Выберите раздел" : "Выберите тему")}</h3></div><p>{selectedTopicGroup ? `${visibleTopicLessons.length} связанные темы. Выберите следующую для изучения.` : topicGroups.length ? `Темы собраны в ${topicGroups.length} учебных раздела.` : "Темы можно проходить в любом порядке."}</p></div>
          {selectedTopicGroup && <button type="button" className="module-beta-group-back" onClick={() => setTopicGroup("root")}>← К разделам</button>}
          <div className="module-beta-topic-grid">
            {topicGroup === "root" && topicGroups.map((group, groupIndex) => {
              const lessons = topicGroupLessons(activeCourseModule, group.id);
              const completed = lessons.filter((lesson) => progress[lesson.slug] === "completed").length;
              const status: LessonStatus = completed === lessons.length ? "completed" : lessons.some((lesson) => progress[lesson.slug] !== "not_started") ? "in_progress" : "not_started";
              return <button className="module-beta-topic-card module-beta-group-card" type="button" key={group.id} onClick={() => setTopicGroup(group.id)}>
                <span className="module-beta-topic-number">{String(groupIndex + 1).padStart(2, "0")}</span>
                <span className={`module-beta-status ${status}`}>{statusLabels[status]}</span>
                <strong>{group.title}</strong>
                <small>{group.slovakTitle}</small>
                <p>{group.description}</p>
                <span className="module-beta-topic-meta">{completed}/{lessons.length} тем завершено<b>Открыть раздел →</b></span>
              </button>;
            })}
            {visibleTopicLessons.map((lesson) => {
              const status = progress[lesson.slug] ?? "not_started";
              return (
                <button className="module-beta-topic-card" type="button" key={lesson.slug} onClick={() => openMaterial(lesson)}>
                  <span className="module-beta-topic-number">{String(displayLessonNumber(lesson)).padStart(2, "0")}</span>
                  <span className={`module-beta-status ${status}`}>{statusLabels[status]}</span>
                  <strong>{lesson.title}</strong>
                  <small>{lesson.slovakTitle}</small>
                  <p>{lesson.description}</p>
                  <span className="module-beta-topic-meta">{lesson.duration} · основной материал<b>Открыть тему →</b></span>
                </button>
              );
            })}
          </div>
          <div className="module-beta-learning-tools">
            <button type="button" onClick={() => setView("review")} disabled={Object.keys(mistakes).length === 0}>
              <span>Повторение ошибок</span><strong>{activeMistakes.length ? `${activeMistakes.length} нужно повторить` : Object.keys(mistakes).length ? "Все исправлены" : "Появится после первой ошибки"}</strong>
            </button>
            <button type="button" onClick={() => setView("final")} disabled={!allLessonsCompleted}>
              <span>Итоговый тест модуля</span><strong>{finalCompleted ? finalPassed ? `Сдано · ${finalScore}/${finalQuestions.length}` : `Нужно повторить · ${finalScore}/${finalQuestions.length}` : allLessonsCompleted ? "Тест открыт" : `Завершите ещё ${activeCourseModule.lessons.length - completedCount} тем`}</strong>
            </button>
            <button type="button" onClick={() => setView("stats")}><span>Мой прогресс</span><strong>{accuracy}% точности · {correctPracticeCount}/{totalPracticeCount} обязательных заданий</strong></button>
          </div>
        </div>
      )}

      {view === "exercises" && <Module1BetaExercises completedLessonSlugs={allA1Lessons.filter((lesson) => progress[lesson.slug] === "completed").map((lesson) => lesson.slug)} />}
      {view === "reading" && <Module1BetaReading completedLessonSlugs={allA1Lessons.filter((lesson) => progress[lesson.slug] === "completed").map((lesson) => lesson.slug)} />}
      {view === "vocabulary" && <Module1BetaVocabulary completedLessonSlugs={allA1Lessons.filter((lesson) => progress[lesson.slug] === "completed").map((lesson) => lesson.slug)} />}
      {view === "homework" && <Module1BetaHomework completedLessonSlugs={allA1Lessons.filter((lesson) => progress[lesson.slug] === "completed").map((lesson) => lesson.slug)} mistakeHints={Object.values(mistakes).filter((mistake) => !mistake.mastered).map((mistake) => ({ lessonSlug: mistake.lessonSlug, text: `${mistake.prompt}: ${mistake.answer}` }))} />}

      {view === "material" && (
        <div className="module-beta-material-layout">
          <aside className="module-beta-lesson-list" aria-label={`Темы ${activeCourseModule.title}`}>
            <span>Темы модуля</span>
            {orderedModuleLessons.map((lesson) => (
              <button type="button" key={lesson.slug} className={lesson.slug === selectedLesson.slug ? "active" : ""} onClick={() => openMaterial(lesson)}>
                <i>{progress[lesson.slug] === "completed" ? "✓" : displayLessonNumber(lesson)}</i><span>{lesson.title}<small>{statusLabels[progress[lesson.slug] ?? "not_started"]}</small></span>
              </button>
            ))}
          </aside>
          <article className="module-beta-material">
            <div className="module-beta-material-heading">
              <div><span>Тема {displayLessonNumber(selectedLesson)} · {selectedLesson.duration} основной материал{extraSectionCount > 0 ? ` · ${extraSectionCount} дополнительно` : ""}</span><h3>{selectedLesson.title}</h3><p>{selectedLesson.slovakTitle}</p></div>
              <span className={`module-beta-status ${progress[selectedLesson.slug]}`}>{statusLabels[progress[selectedLesson.slug]]}</span>
            </div>
            <div className="module-beta-stepper" aria-label={`Шаг ${currentLessonStep + 1} из ${totalLessonSteps}`}>
              <div><span>Шаг {currentLessonStep + 1} из {totalLessonSteps}{currentSectionOptional ? " · дополнительно" : ""}</span><strong>{isCheckStep ? "Проверка знаний" : currentSection.title}</strong></div>
              <div className="module-beta-stepper-track"><i style={{ width: `${((currentLessonStep + 1) / totalLessonSteps) * 100}%` }} /></div>
              <nav aria-label="Разделы темы">{Array.from({ length: totalLessonSteps }, (_, index) => { const optional = selectedLesson.sections[index]?.importance === "extra"; return <button type="button" key={index} className={`${index === currentLessonStep ? "active" : index < currentLessonStep ? "visited" : ""} ${optional ? "optional" : ""}`.trim()} onClick={() => setCurrentLessonStep(index)} aria-label={`Открыть ${optional ? "дополнительный " : ""}шаг ${index + 1}`} />; })}</nav>
            </div>
            {currentLessonStep === 0 && <div className="module-beta-goals"><strong>После темы вы сможете</strong><ul>{selectedLesson.goals.map((goal) => <li key={goal}>{goal}</li>)}</ul></div>}
            {currentLessonStep === 0 && (
              <section className="module-beta-theory" aria-labelledby="module-beta-theory-title">
                <div className="module-beta-theory-heading"><span>Сначала теория</span><h4 id="module-beta-theory-title">Как устроена тема</h4></div>
                <p className="module-beta-theory-summary">{selectedLesson.theory.summary}</p>
                <div className="module-beta-theory-rules"><h5>Необходимые правила</h5><ol>{selectedLesson.theory.rules.map((rule) => <li key={rule}>{rule}</li>)}</ol></div>
                <div className="module-beta-theory-examples"><h5>Примеры с разбором</h5>{selectedLesson.theory.examples.map((example) => <article key={example.slovak}><strong lang="sk">{example.slovak}</strong><span>{example.russian}</span><p>{example.explanation}</p></article>)}</div>
                <p className="module-beta-theory-next">После этого блока изучите материал шага и выполните практику ниже.</p>
              </section>
            )}
            {!isCheckStep && currentSection && (
              <section className={`module-beta-content-section module-beta-content-step ${currentSectionOptional ? "extra" : "core"}`} key={currentSection.title}>
                <div className="module-beta-content-heading"><span>{currentSectionOptional ? "Дополнительное углубление" : "Обязательный материал"}</span><h4>{currentSection.title}</h4>{currentSectionOptional && <small>Этот раздел можно пропустить: он не влияет на завершение темы и основную статистику.</small>}</div>
                {currentSection.paragraphs?.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
                {currentSection.items && <ul>{currentSection.items.map((item) => <li key={item}>{item}</li>)}</ul>}
                {currentSection.table && <div className="module-beta-table-wrap"><table><thead><tr>{currentSection.table.headers.map((header, headerIndex) => <th key={`${currentSection.title}-${header}-${headerIndex}`}>{header}</th>)}</tr></thead><tbody>{currentSection.table.rows.map((row, index) => <tr key={`${currentSection.title}-${index}`}>{row.map((cell, cellIndex) => <td key={`${cell}-${cellIndex}`}>{cell}</td>)}</tr>)}</tbody></table></div>}
                {currentSection.note && <aside className="module-beta-note"><b>Обратите внимание</b>{currentSection.note}</aside>}
              </section>
            )}
            {!isCheckStep && currentPractice && (() => {
              const answer = practiceAnswers[currentPractice.id] ?? "";
              const checked = currentPractice.id in practiceResults;
              const correct = practiceResults[currentPractice.id] === true;
              const match = checked && !correct ? getPracticeMatch(currentPractice, answer) : correct ? "correct" : "incorrect";
              const close = match === "missing_diacritics" || match === "close";
              const feedbackTitle = correct ? "Верно — можно идти дальше" : match === "missing_diacritics" ? "Почти — проверьте диакритику" : match === "close" ? "Ответ близок — проверьте форму" : "Попробуйте ещё раз";
              const feedbackNote = match === "missing_diacritics"
                ? "Буквы и порядок слов совпадают, но в словацком диакритика различает нормативное написание и иногда значение."
                : match === "close" ? "Есть небольшое расхождение: это может быть опечатка или важная грамматическая форма." : "";
              return <section className={`module-beta-practice ${currentSectionOptional ? "extra" : "core"} ${checked ? correct ? "correct" : close ? "close" : "incorrect" : ""}`} aria-labelledby={`${currentPractice.id}-title`}>
                <div className="module-beta-practice-heading"><span>{currentSectionOptional ? "Дополнительная практика" : "Обязательная практика"}</span><strong id={`${currentPractice.id}-title`}>{currentPractice.prompt}</strong></div>
                {currentPractice.type === "choice" && <div className="module-beta-practice-options">{currentPractice.options?.map((option) => <button type="button" key={option} className={answer === option ? "selected" : ""} onClick={() => updatePracticeAnswer(currentPractice, option)}>{option}</button>)}</div>}
                {currentPractice.type === "text" && <><input ref={practiceInputRef} value={answer} onChange={(event) => updatePracticeAnswer(currentPractice, event.target.value)} placeholder="Введите ответ по-словацки" autoComplete="off" /><SlovakKeyboard onInsert={(key) => insertPracticeKey(currentPractice, key)} /></>}
                {currentPractice.type === "order" && <>
                  <div className="module-beta-order-answer">{answer || "Соберите фразу из слов ниже"}</div>
                  <div className="module-beta-practice-options">{currentPractice.tokens?.map((token, index) => <button type="button" key={`${token}-${index}`} onClick={() => updatePracticeAnswer(currentPractice, `${answer} ${token}`.trim())}>{token}</button>)}</div>
                  {answer && <button type="button" className="module-beta-practice-clear" onClick={() => updatePracticeAnswer(currentPractice, "")}>Очистить</button>}
                </>}
                <div className="module-beta-practice-footer"><small>Подсказка: {currentPractice.hint}</small><button type="button" onClick={() => checkPractice(currentPractice)} disabled={!answer.trim()}>Проверить ответ</button></div>
                {checked && <aside role="status"><b>{feedbackTitle}</b>{feedbackNote && <span>{feedbackNote}</span>}<span>{currentPractice.explanation}</span>{!correct && <small>Нормативный ответ: {currentPractice.answer}</small>}</aside>}
              </section>;
            })()}
            {isCheckStep && <section className="module-beta-check" aria-labelledby="module-beta-check-title">
              <div className="module-beta-check-heading">
                <div><span>Мини-проверка</span><h4 id="module-beta-check-title">Проверьте себя</h4></div>
                <strong>{selectedCheckScore}/{selectedLesson.knowledgeChecks.length}</strong>
              </div>
              <p>Выберите ответ — результат и объяснение появятся сразу.</p>
              <div className="module-beta-check-list">
                {selectedLesson.knowledgeChecks.map((check, index) => {
                  const selected = checkSelections[check.id];
                  const answered = Boolean(selected);
                  const correct = selected === check.answer;
                  return (
                    <fieldset className={answered ? correct ? "correct" : "incorrect" : ""} key={check.id}>
                      <legend>{index + 1}. {check.question}</legend>
                      <div>
                        {check.options.map((option) => (
                          <button
                            type="button"
                            key={option}
                            className={selected === option ? "selected" : ""}
                            onClick={() => selectKnowledgeAnswer(check, option)}
                          >
                            <i>{selected === option ? correct ? "✓" : "×" : ""}</i>{option}
                          </button>
                        ))}
                      </div>
                      {answered && <aside><b>{correct ? "Верно" : "Нужно исправить"}</b><span>{check.explanation}</span>{!correct && <small>Правильный ответ: {check.answer}</small>}</aside>}
                    </fieldset>
                  );
                })}
              </div>
              {selectedChecksAnswered === selectedLesson.knowledgeChecks.length && (
                <div className={`module-beta-check-summary ${selectedCheckScore === selectedLesson.knowledgeChecks.length ? "passed" : "retry"}`}>
                  <strong>{selectedCheckScore === selectedLesson.knowledgeChecks.length ? "Отлично — материал понятен" : "Стоит повторить сложные места"}</strong>
                  <span>{selectedCheckScore === selectedLesson.knowledgeChecks.length ? "Можно переходить к заданиям на закрепление." : "Измените выбранные ответы после повторения материала."}</span>
                </div>
              )}
            </section>}
            <div className="module-beta-actions module-beta-step-actions">
              <button type="button" className="secondary" onClick={() => currentLessonStep === 0 ? setView("topics") : setCurrentLessonStep(currentLessonStep - 1)}>{currentLessonStep === 0 ? "← К списку тем" : "← Предыдущий шаг"}</button>
              <button type="button" className="secondary module-beta-reset" onClick={() => resetLesson(selectedLesson)}>Сбросить тему</button>
              {!isCheckStep && <button type="button" onClick={() => setCurrentLessonStep(currentLessonStep + 1)} disabled={!currentPracticeCorrect}>{currentSectionOptional && !currentPracticePassed ? "Пропустить дополнительный шаг →" : "Следующий шаг →"}</button>}
              {isCheckStep && <button type="button" onClick={openChat} disabled={!checksPassed}>Перейти к закреплению →</button>}
            </div>
            {isCheckStep && !checksPassed && <p className="module-beta-step-hint">Ответьте правильно на все вопросы, чтобы перейти к закреплению.</p>}
            {!isCheckStep && currentPractice && !currentPracticeCorrect && <p className="module-beta-step-hint">Выполните обязательную практику шага, чтобы продолжить.</p>}
          </article>
        </div>
      )}

      {view === "review" && (
        <section className="module-beta-review">
          <div className="module-beta-section-heading"><div><span>Персональное повторение</span><h3>Работа над ошибками</h3></div><p>{dueMistakes.length ? `Доступно сейчас: ${dueMistakes.length}` : activeMistakes.length ? "Следующее повторение запланировано" : "Все сохранённые ошибки исправлены."}</p></div>
          {Object.values(mistakes).every((mistake) => !activeLessonSlugs.has(mistake.lessonSlug)) ? <div className="module-beta-empty"><strong>Ошибок в этом модуле пока нет</strong><p>Продолжайте обучение — сложные вопросы автоматически появятся здесь.</p></div> : <div className="module-beta-review-list">
            {Object.values(mistakes).filter((mistake) => activeLessonSlugs.has(mistake.lessonSlug)).map((mistake) => {
              const lesson = findA1Lesson(mistake.lessonSlug);
              if (!lesson) return null;
              return <article key={mistake.id} className={mistake.mastered ? "mastered" : ""}>
                <span>{lesson.title} · {mistake.attempts} ошиб.</span><h4>{mistake.prompt}</h4><p>Правильный ответ: <b>{mistake.answer}</b></p><small>{mistake.mastered ? "Закреплено" : !mistake.dueAt || new Date(mistake.dueAt).getTime() <= Date.now() ? "Можно повторить сейчас" : `Следующее повторение: ${new Date(mistake.dueAt).toLocaleDateString("ru-RU")}`}</small>
                <button type="button" disabled={!mistake.mastered && Boolean(mistake.dueAt) && new Date(mistake.dueAt!).getTime() > Date.now()} onClick={() => { setSelectedSlug(lesson.slug); setLessonSteps((current) => ({ ...current, [lesson.slug]: lesson.stepPractices.find((practice) => practice.id === mistake.id)?.sectionIndex ?? lesson.sections.length })); setView("material"); }}>{mistake.mastered ? "Повторить ещё раз" : "Исправить в теме →"}</button>
              </article>;
            })}
          </div>}
          <div className="module-beta-actions"><button type="button" className="secondary" onClick={() => { setView("topics"); onAreaChange?.("learning"); }}>← К обучению</button></div>
        </section>
      )}

      {view === "final" && (
        <section className="module-beta-final">
          <div className="module-beta-section-heading"><div><span>Финал {activeCourseModule.title}</span><h3>Итоговый тест</h3></div><p>По 2 ключевых вопроса из каждой темы · всего {finalQuestions.length}. Для сдачи нужно не менее {finalPassingPercent}% ({finalPassingScore} правильных ответов).</p></div>
          {finalCompleted && <div className={`module-beta-final-score ${finalPassed ? "passed" : "failed"}`} role="status" aria-live="polite"><strong>{finalPercentage}%</strong><span><b>{finalPassed ? "Модуль сдан" : "Порог пока не достигнут"}</b>{finalScore}/{finalQuestions.length} правильных ответов · нужно минимум {finalPassingScore}</span>{finalPassed && activeModule < a1CourseModules.length && <button type="button" onClick={() => selectModule(activeModule + 1)}>Перейти к Module {activeModule + 1} →</button>}</div>}
          {finalCompleted && !finalPassed && finalIncorrectLessons.length > 0 && <div className="module-beta-final-review" aria-labelledby="module-beta-final-review-title"><div><strong id="module-beta-final-review-title">Что повторить перед новой попыткой</strong><span>Исправьте ответы сразу или вернитесь к материалу этих тем.</span></div><div>{finalIncorrectLessons.map((lesson) => <button type="button" key={lesson.slug} onClick={() => openMaterial(lesson)}>{displayLessonNumber(lesson)}. {lesson.title} →</button>)}</div></div>}
          <div className="module-beta-check-list">{finalQuestions.map((question, index) => {
            const selected = finalSelections[question.id];
            const showResult = finalCompleted && Boolean(selected);
            return <fieldset className={showResult ? selected === question.answer ? "correct" : "incorrect" : ""} key={question.id}><legend>{index + 1}. {question.question}</legend><small>{question.lessonTitle}</small><div>{question.options.map((option) => <button type="button" className={selected === option ? "selected" : ""} key={option} onClick={() => { setFinalCompletedModules((current) => ({ ...current, [String(activeModule)]: false })); setFinalSelections((current) => ({ ...current, [question.id]: option })); }}>{option}</button>)}</div>{showResult && <aside><b>{selected === question.answer ? "✓ Верно" : `Правильный ответ: ${question.answer}`}</b><span><strong>Почему:</strong> {question.explanation}</span></aside>}</fieldset>;
          })}</div>
          <div className="module-beta-actions"><button type="button" className="secondary" onClick={() => setView("topics")}>← К темам</button><button type="button" disabled={finalQuestions.some((question) => !finalSelections[question.id])} onClick={() => setFinalCompletedModules((current) => ({ ...current, [String(activeModule)]: true }))}>Проверить итоговый тест</button></div>
        </section>
      )}

      {view === "stats" && (
        <section className="module-beta-stats">
          <div className="module-beta-section-heading"><div><span>{activeCourseModule.title}</span><h3>Статистика обучения</h3></div><p>Данные сохраняются в локальной SQLite-базе приложения.</p></div>
          <div className="module-beta-stat-grid"><article><strong>{completedCount}/{activeCourseModule.lessons.length}</strong><span>тем завершено</span></article><article><strong>{accuracy}%</strong><span>точность обязательных ответов</span></article><article><strong>{correctPracticeCount}/{totalPracticeCount}</strong><span>обязательных заданий решено</span></article><article><strong>{dueMistakes.length}</strong><span>повторений сейчас</span></article></div>
          <div className="module-beta-topic-stats">{orderedModuleLessons.map((lesson) => { const corePractices = lesson.stepPractices.filter((practice) => isCorePractice(lesson, practice)); const solved = corePractices.filter((practice) => practiceResults[practice.id]).length + lesson.knowledgeChecks.filter((check) => checkSelections[check.id] === check.answer).length; const total = corePractices.length + lesson.knowledgeChecks.length; const summary = lessonSummaries[lesson.slug]; return <article key={lesson.slug}><div><b>{displayLessonNumber(lesson)}. {lesson.title}</b><span>{statusLabels[progress[lesson.slug] ?? "not_started"]}</span></div><div><i style={{ width: `${(solved / total) * 100}%` }} /></div><small>{solved}/{total} обязательных заданий{summary ? ` · понимание ${summary.understanding}%` : ""}</small></article>; })}</div>
          <div className="module-beta-actions"><button type="button" className="secondary" onClick={() => setView("topics")}>← К темам</button><button type="button" className="module-beta-danger" onClick={resetModuleProgress}>Сбросить прогресс модуля</button></div>
        </section>
      )}

      {view === "chat" && (
        <div className="module-beta-chat-layout">
          <aside className="module-beta-chat-context"><span>Закрепление темы</span><h3>{selectedLesson.title}</h3><p>{selectedLesson.slovakTitle}</p><div><b>Цели</b>{selectedLesson.goals.map((goal) => <small key={goal}>✓ {goal}</small>)}</div><button type="button" onClick={() => setView("material")}>← Вернуться к материалу</button></aside>
          <div className="module-beta-chat">
            <header><div>Самостоятельная практика</div><small>{currentSummary ? "Тема завершена" : `${reinforcementScore}/${reinforcementPractices.length} верно`}</small></header>
            {currentSummary ? (
              <section className="module-beta-chat-summary" aria-labelledby="module-beta-chat-summary-title">
                <div><span>Итог темы</span><h3 id="module-beta-chat-summary-title">{currentSummary.level}</h3><p>{currentSummary.evidence ? `Выполнено заданий: ${currentSummary.evidence.coreCorrect}/${currentSummary.evidence.coreTotal} · закрепление: ${currentSummary.userTurns}/${reinforcementPractices.length}.` : `Оценка учитывает материал, мини-проверку и самостоятельное закрепление.`}</p></div>
                <strong aria-label={`Понимание темы ${currentSummary.understanding} процентов`}>{currentSummary.understanding}%<small>понимание темы</small></strong>
                <div className="module-beta-chat-summary-details">
                  <article><h4>Освоенные навыки</h4><ul>{currentSummary.strengths.map((item, index) => <li key={`${index}:${item}`}>{item}</li>)}</ul></article>
                  <article><h4>Ошибки и исправления</h4>{currentSummaryMistakes.length ? <ul>{currentSummaryMistakes.map((item, index) => <li key={`${index}:${item}`}>{item}</li>)}</ul> : <p>Активных ошибок в обязательной части не зафиксировано.</p>}</article>
                  <article><h4>Что делать дальше</h4><ul>{currentSummaryRecommendations.map((item, index) => <li key={`${index}:${item}`}>{item}</li>)}</ul></article>
                </div>
              </section>
            ) : (
              <section className="module-beta-reinforcement module-beta-check" aria-labelledby="module-beta-reinforcement-title">
                <div className="module-beta-current-task"><span>Закрепление темы</span><strong id="module-beta-reinforcement-title">Выполните все задания самостоятельно</strong><small>Ответы проверяются по материалу урока. Неверный вариант можно изменить.</small></div>
                {reinforcementPractices.map((practice, index) => {
                  const answer = practiceAnswers[practice.id] ?? "";
                  const checked = practice.id in practiceResults;
                  const correct = practiceResults[practice.id] === true;
                  const match = checked ? getPracticeMatch(practice, answer) : null;
                  return <fieldset className={checked ? correct ? "correct" : "incorrect" : ""} key={practice.id}>
                    <legend>{index + 1}. {practice.prompt}</legend>
                    {practice.type === "choice" && <div className="module-beta-check-options">{practice.options?.map((option) => <button type="button" key={option} className={answer === option ? "selected" : ""} onClick={() => updatePracticeAnswer(practice, option)}>{option}</button>)}</div>}
                    {practice.type === "text" && <div className="module-beta-reinforcement-text"><input value={answer} onChange={(event) => updatePracticeAnswer(practice, event.target.value)} placeholder="Введите ответ по-словацки" autoComplete="off" /><SlovakKeyboard onInsert={(key) => updatePracticeAnswer(practice, `${answer}${key}`)} /></div>}
                    {practice.type === "order" && <><div className="module-beta-check-options">{practice.tokens?.map((token, tokenIndex) => <button type="button" key={`${token}-${tokenIndex}`} onClick={() => updatePracticeAnswer(practice, `${answer}${answer ? practice.tokenSeparator ?? " " : ""}${token}`)}>{token}</button>)}</div>{answer && <div className="module-beta-reinforcement-assembled"><span>{answer}</span><button type="button" onClick={() => updatePracticeAnswer(practice, "")}>Очистить</button></div>}</>}
                    <div className="module-beta-reinforcement-check"><small>Подсказка: {practice.hint}</small><button type="button" onClick={() => checkPractice(practice)} disabled={!answer.trim()}>Проверить</button></div>
                    {checked && <p className={correct ? "correct" : "incorrect"}>{correct ? `Верно. ${practice.explanation}` : match === "missing_diacritics" ? `Почти — проверьте диакритику. ${practice.explanation}` : match === "close" ? `Почти — проверьте написание. ${practice.explanation}` : `Пока неверно. ${practice.explanation}`}</p>}
                  </fieldset>;
                })}
                {reinforcementAnswered === reinforcementPractices.length && <div className={`module-beta-check-summary ${reinforcementPassed ? "passed" : "retry"}`}><strong>{reinforcementPassed ? "Закрепление пройдено" : "Есть ответы для исправления"}</strong><span>{reinforcementPassed ? "Можно завершить тему." : "Исправьте неверные ответы и проверьте их повторно."}</span></div>}
                <div className="module-beta-check-all"><span>Можно проверять задания по одному или заполнить всё сразу.</span><button type="button" onClick={checkAllReinforcement} disabled={!allReinforcementFilled}>Проверить всё</button></div>
              </section>
            )}
            <footer>{currentSummary ? <><span>Тема завершена. Прогресс сохранён.</span><button type="button" onClick={continueAfterSummary}>{displayLessonNumber(selectedLesson) < orderedModuleLessons.length ? "Следующая тема →" : "К итоговому тесту →"}</button></> : <><span>Проверено: {reinforcementAnswered}/{reinforcementPractices.length} · верно {reinforcementScore}</span><button type="button" onClick={finishReinforcementPractice} disabled={!reinforcementPassed}>Завершить закрепление и получить итог</button></>}</footer>
          </div>
        </div>
      )}
    </section>
  );
}
