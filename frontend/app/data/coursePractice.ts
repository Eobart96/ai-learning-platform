import type { CourseLesson, StepPractice } from "./courseTypes";

export type PracticeMatch = "correct" | "missing_diacritics" | "close" | "incorrect";

export function normalizeAnswer(value: string): string {
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

function getAnswerMatch(answer: string, acceptableAnswers: string[] | undefined, value: string): PracticeMatch {
  const normalized = normalizeAnswer(value);
  const accepted = [...new Set([answer, ...(acceptableAnswers ?? [])].map(normalizeAnswer).filter(Boolean))];
  if (accepted.includes(normalized)) return "correct";
  if (normalized && accepted.some((acceptedAnswer) => stripAnswerDiacritics(acceptedAnswer) === stripAnswerDiacritics(normalized))) return "missing_diacritics";
  const typoThreshold = normalized.length >= 12 ? 2 : normalized.length >= 5 ? 1 : 0;
  if (typoThreshold > 0 && accepted.some((acceptedAnswer) => editDistance(acceptedAnswer, normalized) <= typoThreshold)) return "close";
  return "incorrect";
}

export function getPairAnswers(practice: StepPractice, value: string): string[] {
  const expectedLength = practice.pairs?.length ?? 0;
  if (!value.trim()) return Array(expectedLength).fill("");
  try {
    const parsed: unknown = JSON.parse(value);
    if (Array.isArray(parsed)) return Array.from({ length: expectedLength }, (_, index) => typeof parsed[index] === "string" ? parsed[index] : "");
  } catch {
    // Older saved answers used one semicolon-separated text field.
  }
  const legacy = value.split(";").map((item) => {
    const trimmed = item.trim();
    const quoted = [...trimmed.matchAll(/«([^»]+)»/gu)].at(-1)?.[1];
    return quoted ?? trimmed.split(/(?:=|→)/u).at(-1)?.trim() ?? trimmed;
  });
  return Array.from({ length: expectedLength }, (_, index) => legacy[index] ?? "");
}

export function getPairMatches(practice: StepPractice, value: string): PracticeMatch[] {
  const answers = getPairAnswers(practice, value);
  return (practice.pairs ?? []).map((pair, index) => getAnswerMatch(pair.answer, pair.acceptableAnswers, answers[index] ?? ""));
}

export function getPracticeMatch(practice: StepPractice, value: string): PracticeMatch {
  if (practice.type === "pairs") {
    const matches = getPairMatches(practice, value);
    if (matches.length > 0 && matches.every((match) => match === "correct")) return "correct";
    if (matches.includes("missing_diacritics")) return "missing_diacritics";
    if (matches.includes("close")) return "close";
    return "incorrect";
  }
  return getAnswerMatch(practice.answer, practice.acceptableAnswers, value);
}

export function isPracticeFilled(practice: StepPractice, value: string): boolean {
  if (practice.type === "pairs") return getPairAnswers(practice, value).every((answer) => answer.trim());
  return Boolean(value.trim());
}

export function isCorePractice(lesson: CourseLesson, practice: StepPractice): boolean {
  return lesson.sections[practice.sectionIndex]?.importance !== "extra";
}

export function buildReinforcementPractices(lesson: CourseLesson): StepPractice[] {
  if (lesson.reinforcementPractices?.length) return lesson.reinforcementPractices;
  const checkAsPractice = (check: CourseLesson["knowledgeChecks"][number]): StepPractice => ({
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

export type ModuleFinalQuestion = CourseLesson["knowledgeChecks"][number] & { lessonSlug: string; lessonTitle: string };

export function buildModuleFinalQuestions(lessons: CourseLesson[]): ModuleFinalQuestion[] {
  const usedAnswers = new Set<string>();
  return lessons.flatMap((lesson) => {
    const selected: ModuleFinalQuestion[] = [];
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
