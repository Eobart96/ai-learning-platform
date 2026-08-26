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

export type BetaTutorReply = {
  provider: string;
  reply: string;
  correction: string | null;
  explanation: string | null;
  next_question: string | null;
  suggestions: string[];
  mistake_original: string | null;
  mistake_corrected: string | null;
};

export type BetaTutorRequest = {
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

export function askModule1Tutor(payload: BetaTutorRequest): Promise<BetaTutorReply> {
  return request<BetaTutorReply>("/tutor/module1-chat", { method: "POST", body: JSON.stringify(payload) });
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

export type Module1BetaState = {
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

export type Module1BetaStateResponse = { exists: boolean; schema_version: number; state: Module1BetaState | null; updated_at: string | null };
export function getModule1BetaState(): Promise<Module1BetaStateResponse> { return request<Module1BetaStateResponse>("/module1-beta/state"); }
export function saveModule1BetaState(state: Module1BetaState): Promise<Module1BetaStateResponse> { return request<Module1BetaStateResponse>("/module1-beta/state", { method: "PUT", body: JSON.stringify(state) }); }

export type Module1BetaExerciseAttempt = { id: number; answer: string; is_correct: boolean; score: number; corrected_answer: string; explanation: string; next_exercise: string; created_at: string };
export type Module1BetaExercise = { id: number; lesson_slug: string; lesson_title: string; question: string; instruction: string; created_at: string; latest_attempt: Module1BetaExerciseAttempt | null };
export function getModule1BetaExercises(lessonSlug?: string): Promise<Module1BetaExercise[]> { const query = lessonSlug ? `?lesson_slug=${encodeURIComponent(lessonSlug)}` : ""; return request<Module1BetaExercise[]>(`/module1-beta/exercises${query}`); }
export function generateModule1BetaExercise(payload: { lesson_slug: string; lesson_title: string; theory: string }): Promise<Module1BetaExercise> { return request<Module1BetaExercise>("/module1-beta/exercises", { method: "POST", body: JSON.stringify(payload) }); }
export function answerModule1BetaExercise(exerciseId: number, answer: string): Promise<Module1BetaExerciseAttempt> { return request<Module1BetaExerciseAttempt>(`/module1-beta/exercises/${exerciseId}/answer`, { method: "POST", body: JSON.stringify({ answer }) }); }
export function deleteModule1BetaExercise(exerciseId: number): Promise<{ deleted: boolean }> { return request<{ deleted: boolean }>(`/module1-beta/exercises/${exerciseId}`, { method: "DELETE" }); }

export type Module1BetaReadingAttempt = { id: number; retelling: string; score: number; feedback: string; corrected_retelling: string; created_at: string };
export type Module1BetaReading = { id: number; lesson_slug: string; lesson_title: string; title: string; text: string; instruction: string; created_at: string; latest_attempt: Module1BetaReadingAttempt | null };
export function getModule1BetaReadings(): Promise<Module1BetaReading[]> { return request<Module1BetaReading[]>("/module1-beta/readings"); }
export function generateModule1BetaReading(payload: { lesson_slug: string; lesson_title: string; theory: string; completed_theory: string }): Promise<Module1BetaReading> { return request<Module1BetaReading>("/module1-beta/readings", { method: "POST", body: JSON.stringify(payload) }); }
export function checkModule1BetaReading(readingId: number, retelling: string): Promise<Module1BetaReadingAttempt> { return request<Module1BetaReadingAttempt>(`/module1-beta/readings/${readingId}/check`, { method: "POST", body: JSON.stringify({ retelling }) }); }
export function deleteModule1BetaReading(readingId: number): Promise<{ deleted: boolean }> { return request<{ deleted: boolean }>(`/module1-beta/readings/${readingId}`, { method: "DELETE" }); }

export type Module1BetaVocabularyItem = { id: number; lesson_slug: string; lesson_title: string; word: string; translation: string; example: string | null; review_count: number; interval_days: number; next_review_at: string | null; is_due: boolean };
export type Module1BetaVocabularySeed = Omit<Module1BetaVocabularyItem, "id" | "review_count" | "interval_days" | "next_review_at" | "is_due">;
export function syncModule1BetaVocabulary(items: Module1BetaVocabularySeed[]): Promise<Module1BetaVocabularyItem[]> { return request<Module1BetaVocabularyItem[]>("/module1-beta/vocabulary/sync", { method: "PUT", body: JSON.stringify({ items }) }); }
export function getModule1BetaVocabulary(): Promise<Module1BetaVocabularyItem[]> { return request<Module1BetaVocabularyItem[]>("/module1-beta/vocabulary"); }
export function reviewModule1BetaVocabulary(itemId: number): Promise<Module1BetaVocabularyItem> { return request<Module1BetaVocabularyItem>(`/module1-beta/vocabulary/${itemId}/review`, { method: "POST" }); }

export type Module1BetaHomeworkAttempt = { id: number; answer: string; is_correct: boolean; score: number; corrected_answer: string; explanation: string; next_exercise: string; created_at: string };
export type Module1BetaHomework = { id: number; lesson_slug: string; lesson_title: string; title: string; description: string; focus_category: string; created_at: string; latest_attempt: Module1BetaHomeworkAttempt | null };
export function getModule1BetaHomework(): Promise<Module1BetaHomework[]> { return request<Module1BetaHomework[]>("/module1-beta/homework"); }
export function generateModule1BetaHomework(payload: { lesson_slug: string; lesson_title: string; theory: string; known_mistakes: string[] }): Promise<Module1BetaHomework> { return request<Module1BetaHomework>("/module1-beta/homework", { method: "POST", body: JSON.stringify(payload) }); }
export function submitModule1BetaHomework(homeworkId: number, answer: string): Promise<Module1BetaHomeworkAttempt> { return request<Module1BetaHomeworkAttempt>(`/module1-beta/homework/${homeworkId}/submit`, { method: "POST", body: JSON.stringify({ answer }) }); }
export function deleteModule1BetaHomework(homeworkId: number): Promise<{ deleted: boolean }> { return request<{ deleted: boolean }>(`/module1-beta/homework/${homeworkId}`, { method: "DELETE" }); }
