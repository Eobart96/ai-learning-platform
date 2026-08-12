export type PythonTestCase = { stdin: string; expected_output: string };
export type Exercise = { id: number; type: string; question: string; instruction: string | null; submitted_answer: string | null; is_completed: boolean; is_resolved: boolean; score: number | null; expected_output: string | null; test_cases: PythonTestCase[]; hint: string | null; explanation: string | null };
export type Lesson = { id: number; slug: string; title: string; theory: string | null; exercises: Exercise[]; generated_exercises: Exercise[] };
export type LessonOption = { id: number; title: string; status: "completed" | "current" | "upcoming"; can_repeat?: boolean };
export type RoadmapModule = { id: number; slug: string; title: string; lessons: LessonOption[]; test_available: boolean; test_passed: boolean; test_score: number | null };
export type RoadmapLevel = { slug: string; title: string; status: string; modules: RoadmapModule[] };
export type Assessment = { is_correct: boolean; score: number; corrected_answer: string; explanation: string; next_exercise: string; mistake_category: string | null };
export type LessonAnswerResponse = { assessment: Assessment };

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`/api/v1${path}`, { ...init, headers: { "Content-Type": "application/json", ...init?.headers } });
  if (!response.ok) {
    const body: unknown = await response.json().catch(() => null);
    const detail = typeof body === "object" && body !== null && "detail" in body ? String(body.detail) : `Ошибка сервера (${response.status})`;
    throw new Error(detail);
  }
  return response.json() as Promise<T>;
}

export async function getExerciseTopics(): Promise<LessonOption[]> { const levels = await request<RoadmapLevel[]>("/roadmap/levels"); return levels.flatMap((level) => level.modules.flatMap((module) => module.lessons)); }
export function getLesson(lessonId: number): Promise<Lesson> { return request<Lesson>(`/lessons/${lessonId}`); }
export function submitLessonAnswer(lessonId: number, exerciseId: number, answer: string): Promise<LessonAnswerResponse> { return request<LessonAnswerResponse>(`/lessons/${lessonId}/answer`, { method: "POST", body: JSON.stringify({ exercise_id: exerciseId, answer }) }); }
export function getCourseRoadmap(courseSlug: string): Promise<RoadmapModule[]> { return request<RoadmapModule[]>(`/roadmap?course_slug=${encodeURIComponent(courseSlug)}`); }
export function completeLesson(lessonId: number): Promise<{ completed: boolean }> { return request<{ completed: boolean }>(`/lessons/${lessonId}/complete`, { method: "POST" }); }
export function generateExercise(lessonId: number): Promise<Exercise> { return request<Exercise>(`/lessons/${lessonId}/generated-exercises`, { method: "POST" }); }
export function generateMathExercise(lessonId: number): Promise<Exercise> { return request<Exercise>(`/lessons/${lessonId}/generated-exercises`, { method: "POST" }); }
export function askMathTutor(lessonId: number, message: string): Promise<{ response: string }> { return request<{ response: string }>(`/math/lessons/${lessonId}/chat`, { method: "POST", body: JSON.stringify({ message }) }); }
export type ExerciseChatMessage = { role: "user" | "assistant"; content: string };
export function askExerciseTutor(lessonId: number, exerciseId: number, message: string, draftAnswer: string, history: ExerciseChatMessage[]): Promise<{ response: string }> { return request<{ response: string }>(`/lessons/${lessonId}/exercise-chat`, { method: "POST", body: JSON.stringify({ exercise_id: exerciseId, message, draft_answer: draftAnswer, history }) }); }
export type StudyRoadmapTopic = { slug: string; title: string; description: string; module_slug: string | null };
export type StudyRoadmap = { title: string; note: string; topics: StudyRoadmapTopic[] };
export function getStudyRoadmap(courseSlug: string): Promise<StudyRoadmap> { return request<StudyRoadmap>(`/courses/${encodeURIComponent(courseSlug)}/study-roadmap`); }
export type PythonRunResult = { stdout: string; stderr: string; timed_out: boolean; passed: boolean | null; explanation: string | null };
export function runPythonCode(lessonId: number, exerciseId: number, code: string, stdin: string): Promise<PythonRunResult> { return request<PythonRunResult>(`/python/lessons/${lessonId}/run`, { method: "POST", body: JSON.stringify({ exercise_id: exerciseId, code, stdin }) }); }

export type ModuleTestQuestion = { id: string; type: "choice" | "text"; question: string; options: string[] };
export type ModuleTestMistake = { question_id: string; question: string; submitted_answer: string; expected_answer: string; explanation: string | null };
export type ModuleTestAttempt = { id: number; score: number; passed: boolean; created_at: string; details_available: boolean; mistakes: ModuleTestMistake[] };
export type ModuleTest = { module_id: number; module_title: string; available: boolean; completed_lessons: number; total_lessons: number; passed: boolean; score: number | null; passing_score: number; questions: ModuleTestQuestion[]; history: ModuleTestAttempt[] };

export function getTestModules(courseSlug = "slovak-a1"): Promise<RoadmapModule[]> { return getCourseRoadmap(courseSlug); }
export function getModuleTest(moduleId: number): Promise<ModuleTest> { return request<ModuleTest>(`/modules/${moduleId}/final-test`); }
export function submitModuleTest(moduleId: number, answers: Record<string, string>): Promise<ModuleTest> { return request<ModuleTest>(`/modules/${moduleId}/final-test/submit`, { method: "POST", body: JSON.stringify({ answers }) }); }

export type Mistake = { id: number; lesson_id: number | null; lesson_title: string | null; source: string; category: string; original_answer: string; corrected_answer: string; explanation: string; mistake_count: number; practice_count: number };
export type DialogueSession = { session_id: number; title: string | null; current_lesson_id: number | null; current_lesson_title: string | null; current_phase: string; status: string };
export function getMistakes(courseSlug = "slovak-a1"): Promise<Mistake[]> { return request<Mistake[]>(`/progress/mistakes?course_slug=${encodeURIComponent(courseSlug)}`); }
export function startMistakePractice(mistakeId: number, courseSlug = "slovak-a1"): Promise<Mistake> { return request<Mistake>(`/progress/mistakes/${mistakeId}/practice?course_slug=${encodeURIComponent(courseSlug)}`, { method: "POST" }); }
export function resolveMistake(mistakeId: number, courseSlug = "slovak-a1"): Promise<Mistake> { return request<Mistake>(`/progress/mistakes/${mistakeId}/resolve?course_slug=${encodeURIComponent(courseSlug)}`, { method: "POST" }); }
export function resolveAllMistakes(courseSlug = "slovak-a1"): Promise<{ resolved_count: number }> { return request<{ resolved_count: number }>(`/progress/mistakes/resolve-all?course_slug=${encodeURIComponent(courseSlug)}`, { method: "POST" }); }
export function chatAboutMistake(mistakeId: number, message: string, courseSlug = "slovak-a1"): Promise<{ response: string }> { return request<{ response: string }>(`/progress/mistakes/${mistakeId}/chat?course_slug=${encodeURIComponent(courseSlug)}`, { method: "POST", body: JSON.stringify({ message }) }); }
export function createDialogueSession(title: string, lessonId: number | null): Promise<DialogueSession> { return request<DialogueSession>("/dialogue/sessions", { method: "POST", body: JSON.stringify({ title, lesson_id: lessonId }) }); }
export function sendDialogueMessage(sessionId: number, message: string): Promise<unknown> { return request<unknown>(`/dialogue/sessions/${sessionId}/messages`, { method: "POST", body: JSON.stringify({ message }) }); }

export type VocabularyItem = { id: number; lesson_id: number | null; word: string; translation: string; example: string | null; review_count: number; interval_days: number; next_review_at: string | null; is_due: boolean; is_saved: boolean; lesson_title: string | null };
export function getVocabulary(): Promise<VocabularyItem[]> { return request<VocabularyItem[]>("/progress/vocabulary"); }
export function getDueVocabulary(): Promise<VocabularyItem[]> { return request<VocabularyItem[]>("/progress/vocabulary/due"); }
export function reviewVocabulary(itemId: number): Promise<VocabularyItem> { return request<VocabularyItem>(`/progress/vocabulary/${itemId}/review`, { method: "POST" }); }

export type DiaryPrompt = { prompt: string; lesson_id: number | null; lesson_title: string | null; has_entry_today: boolean };
export type DiaryEntry = { id: number; prompt: string; original_text: string; corrected_text: string; explanation: string; is_correct: boolean; score: number; mistake_id: number | null; created_at: string; new_words: Array<{ word: string; translation: string; example: string | null }> };
export type DiarySummary = { period_days: number; entries_count: number; average_score: number | null; mistakes_count: number; new_words_count: number };
export function getDiaryPrompt(): Promise<DiaryPrompt> { return request<DiaryPrompt>("/diary/today"); }
export function getDiaryEntries(): Promise<DiaryEntry[]> { return request<DiaryEntry[]>("/diary/entries"); }
export function getDiarySummary(): Promise<DiarySummary> { return request<DiarySummary>("/diary/weekly-summary"); }
export function submitDiaryEntry(prompt: DiaryPrompt, answer: string): Promise<DiaryEntry> { return request<DiaryEntry>("/diary/entries", { method: "POST", body: JSON.stringify({ prompt: prompt.prompt, answer, lesson_id: prompt.lesson_id }) }); }

export type Homework = { id: number; lesson_id: number; title: string; description: string; status: string; score: number | null; focus_category: string | null; mistake_id: number | null; submitted_answer: string | null; ai_feedback: string | null };
export type HomeworkResult = Homework & { assessment: Assessment };
export function getHomework(): Promise<Homework[]> { return request<Homework[]>("/homework"); }
export function generateHomework(lessonId: number): Promise<Homework> { return request<Homework>("/homework/generate", { method: "POST", body: JSON.stringify({ lesson_id: lessonId }) }); }
export function submitHomework(homeworkId: number, answer: string): Promise<HomeworkResult> { return request<HomeworkResult>(`/homework/${homeworkId}/submit`, { method: "POST", body: JSON.stringify({ answer }) }); }

export type DialogueMessage = { role: "user" | "assistant"; content: string };
export type DialogueSessionListItem = DialogueSession & { message_count: number; created_at: string; updated_at: string };
export type DialogueHistory = DialogueSession & { messages: DialogueMessage[] };
export type DialogueMessageResult = DialogueSession & { response: string; progress_saved: boolean };
export function getRoadmap(): Promise<RoadmapLevel[]> { return request<RoadmapLevel[]>("/roadmap/levels"); }
export function listDialogueSessions(): Promise<DialogueSessionListItem[]> { return request<DialogueSessionListItem[]>("/dialogue/sessions"); }
export function getDialogueSession(sessionId: number): Promise<DialogueHistory> { return request<DialogueHistory>(`/dialogue/sessions/${sessionId}`); }
export function createLearningDialogue(): Promise<DialogueSession> { return request<DialogueSession>("/dialogue/sessions", { method: "POST" }); }
export function selectDialogueLesson(sessionId: number, lessonId: number): Promise<DialogueSession> { return request<DialogueSession>(`/dialogue/sessions/${sessionId}/select-lesson`, { method: "POST", body: JSON.stringify({ lesson_id: lessonId }) }); }
export function sendLearningMessage(sessionId: number, message: string): Promise<DialogueMessageResult> { return request<DialogueMessageResult>(`/dialogue/sessions/${sessionId}/messages`, { method: "POST", body: JSON.stringify({ message }) }); }
export function clearLearningDialogue(sessionId: number): Promise<DialogueHistory> { return request<DialogueHistory>(`/dialogue/sessions/${sessionId}/clear`, { method: "POST" }); }
export function deleteLearningDialogue(sessionId: number): Promise<{ deleted: boolean }> { return request<{ deleted: boolean }>(`/dialogue/sessions/${sessionId}`, { method: "DELETE" }); }
export type CodexConnection = { installed: boolean; authenticated: boolean; message: string };
export function getCodexStatus(): Promise<CodexConnection> { return request<CodexConnection>("/codex/status"); }
export function startCodexLogin(): Promise<CodexConnection> { return request<CodexConnection>("/codex/login", { method: "POST" }); }
export function resetProgress(): Promise<{ reset: boolean }> { return request<{ reset: boolean }>("/progress/reset", { method: "POST", body: JSON.stringify({ confirm: true }) }); }
