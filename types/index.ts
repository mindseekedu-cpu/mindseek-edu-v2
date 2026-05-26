export type Mode = "practice" | "pr";

export type AppState = "idle" | "question" | "completed";

export type MessageRole = "ai" | "user";

export interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: Date;
}

export interface QuestionMeta {
  kelas: string;
  topik: string;
  bahasa: string;
}

export interface Question {
  id: string;
  text: string;
  answer: number | string;
  topic: string;
  clues: string[];
  meta?: QuestionMeta;
}

export interface PracticeRequest {
  kelas: string;
  topik: string;
  bahasa: string;
}

export interface PracticeResponse {
  question: Question;
  success: boolean;
}

export interface FallbackOption {
  id: string;
  emoji: string;
  label: string;
}

export interface ClueState {
  currentIndex: number;
  totalClues: number;
  isExhausted: boolean;
}