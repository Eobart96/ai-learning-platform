async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`/api/v1${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...init?.headers },
  });
  if (!response.ok) {
    const body: unknown = await response.json().catch(() => null);
    const detail = typeof body === "object" && body !== null && "detail" in body
      ? String(body.detail)
      : `Ошибка сервера (${response.status})`;
    throw new Error(detail);
  }
  return response.json() as Promise<T>;
}

export type TutorReply = {
  provider: string;
  reply: string;
  correction: string | null;
  explanation: string | null;
  next_question: string | null;
  suggestions: string[];
  mistake_original: string | null;
  mistake_corrected: string | null;
};

export type TutorRequest = {
  lesson_slug: string;
  lesson_title: string;
  goals: string[];
  theory: string;
  known_mistakes: string[];
  history: Array<{ role: "user" | "assistant"; content: string }>;
  message: string;
  current_task?: string;
  interaction_kind?: "answer" | "clarification" | "continue";
  is_final_turn?: boolean;
};

export function askModule1Tutor(payload: TutorRequest): Promise<TutorReply> {
  return request<TutorReply>("/tutor/module1-chat", { method: "POST", body: JSON.stringify(payload) });
}

export type TutorProviderName = "codex" | "openai" | "polza";
export type TutorSettings = {
  provider: TutorProviderName;
  codex_installed: boolean;
  codex_authenticated: boolean;
  codex_message: string;
  openai_api_key_configured: boolean;
  openai_model: string;
  polza_api_key_configured: boolean;
  polza_model: string;
  polza_base_url: string;
};
export type TutorSettingsUpdate = {
  provider: TutorProviderName;
  openai_api_key?: string;
  openai_model: string;
  polza_api_key?: string;
  polza_model: string;
  clear_openai_api_key?: boolean;
  clear_polza_api_key?: boolean;
};
export type CodexLoginStatus = { installed: boolean; authenticated: boolean; message: string };

export function getTutorSettings(): Promise<TutorSettings> { return request<TutorSettings>("/tutor/settings"); }
export function updateTutorSettings(payload: TutorSettingsUpdate): Promise<TutorSettings> { return request<TutorSettings>("/tutor/settings", { method: "PUT", body: JSON.stringify(payload) }); }
export function startCodexLogin(): Promise<CodexLoginStatus> { return request<CodexLoginStatus>("/tutor/codex-login", { method: "POST" }); }

export type CourseState = {
  activeModule?: number;
  selectedSlug?: string;
  fontSize: "normal" | "large" | "extra-large";
  progress: Record<string, string>;
  lessonSteps: Record<string, number>;
  checkSelections: Record<string, string>;
  practiceAnswers: Record<string, string>;
  practiceResults: Record<string, boolean>;
  mistakes: Record<string, unknown>;
  finalSelections: Record<string, string>;
  finalCompleted: boolean;
  finalCompletedModules?: Record<string, boolean>;
  chatHistories: Record<string, unknown>;
  lessonSummaries: Record<string, unknown>;
};

export type CourseStateResponse = { exists: boolean; schema_version: number; state: CourseState | null; updated_at: string | null };
export function getCourseState(): Promise<CourseStateResponse> { return request<CourseStateResponse>("/course/state"); }
export function saveCourseState(state: CourseState): Promise<CourseStateResponse> { return request<CourseStateResponse>("/course/state", { method: "PUT", body: JSON.stringify(state) }); }

export type CourseExerciseAttempt = { id: number; answer: string; is_correct: boolean; score: number; corrected_answer: string; explanation: string; next_exercise: string; created_at: string };
export type CourseExercise = { id: number; lesson_slug: string; lesson_title: string; question: string; instruction: string; created_at: string; latest_attempt: CourseExerciseAttempt | null };
export function getCourseExercises(lessonSlug?: string): Promise<CourseExercise[]> { const query = lessonSlug ? `?lesson_slug=${encodeURIComponent(lessonSlug)}` : ""; return request<CourseExercise[]>(`/course/exercises${query}`); }
export function generateCourseExercise(payload: { lesson_slug: string; lesson_title: string; theory: string }): Promise<CourseExercise> { return request<CourseExercise>("/course/exercises", { method: "POST", body: JSON.stringify(payload) }); }
export function answerCourseExercise(exerciseId: number, answer: string): Promise<CourseExerciseAttempt> { return request<CourseExerciseAttempt>(`/course/exercises/${exerciseId}/answer`, { method: "POST", body: JSON.stringify({ answer }) }); }
export function deleteCourseExercise(exerciseId: number): Promise<{ deleted: boolean }> { return request<{ deleted: boolean }>(`/course/exercises/${exerciseId}`, { method: "DELETE" }); }

export type CourseReadingAttempt = { id: number; retelling: string; score: number; feedback: string; corrected_retelling: string; created_at: string };
export type CourseReading = { id: number; lesson_slug: string; lesson_title: string; title: string; text: string; instruction: string; created_at: string; latest_attempt: CourseReadingAttempt | null };
export function getCourseReadings(): Promise<CourseReading[]> { return request<CourseReading[]>("/course/readings"); }
export function generateCourseReading(payload: { lesson_slug: string; lesson_title: string; theory: string; completed_theory: string }): Promise<CourseReading> { return request<CourseReading>("/course/readings", { method: "POST", body: JSON.stringify(payload) }); }
export function checkCourseReading(readingId: number, retelling: string): Promise<CourseReadingAttempt> { return request<CourseReadingAttempt>(`/course/readings/${readingId}/check`, { method: "POST", body: JSON.stringify({ retelling }) }); }
export function deleteCourseReading(readingId: number): Promise<{ deleted: boolean }> { return request<{ deleted: boolean }>(`/course/readings/${readingId}`, { method: "DELETE" }); }

export type CourseVocabularyItem = { id: number; lesson_slug: string; lesson_title: string; word: string; translation: string; example: string | null; review_count: number; interval_days: number; next_review_at: string | null; is_due: boolean };
export type CourseVocabularySeed = Omit<CourseVocabularyItem, "id" | "review_count" | "interval_days" | "next_review_at" | "is_due">;
export function syncCourseVocabulary(items: CourseVocabularySeed[]): Promise<CourseVocabularyItem[]> { return request<CourseVocabularyItem[]>("/course/vocabulary/sync", { method: "PUT", body: JSON.stringify({ items }) }); }
export function getCourseVocabulary(): Promise<CourseVocabularyItem[]> { return request<CourseVocabularyItem[]>("/course/vocabulary"); }
export function reviewCourseVocabulary(itemId: number): Promise<CourseVocabularyItem> { return request<CourseVocabularyItem>(`/course/vocabulary/${itemId}/review`, { method: "POST" }); }

export type CourseHomeworkAttempt = { id: number; answer: string; is_correct: boolean; score: number; corrected_answer: string; explanation: string; next_exercise: string; created_at: string };
export type CourseHomework = { id: number; lesson_slug: string; lesson_title: string; title: string; description: string; focus_category: string; created_at: string; latest_attempt: CourseHomeworkAttempt | null };
export function getCourseHomework(): Promise<CourseHomework[]> { return request<CourseHomework[]>("/course/homework"); }
export function generateCourseHomework(payload: { lesson_slug: string; lesson_title: string; theory: string; known_mistakes: string[] }): Promise<CourseHomework> { return request<CourseHomework>("/course/homework", { method: "POST", body: JSON.stringify(payload) }); }
export function submitCourseHomework(homeworkId: number, answer: string): Promise<CourseHomeworkAttempt> { return request<CourseHomeworkAttempt>(`/course/homework/${homeworkId}/submit`, { method: "POST", body: JSON.stringify({ answer }) }); }
export function deleteCourseHomework(homeworkId: number): Promise<{ deleted: boolean }> { return request<{ deleted: boolean }>(`/course/homework/${homeworkId}`, { method: "DELETE" }); }
