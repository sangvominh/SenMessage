// ============================================================
// Core types and interfaces for SenMessage
// Per data-model.md specification
// ============================================================

/** Supported Facebook export formats */
export type SourceFormat = "json" | "html";

/** Message content types in Facebook exports */
export type MessageType =
  | "text"
  | "photo"
  | "video"
  | "audio"
  | "sticker"
  | "gif"
  | "file"
  | "share"
  | "call"
  | "reaction"
  | "system"
  | "other";

/** Batch processing state machine */
export type BatchStatus = "pending" | "in-progress" | "completed" | "failed";

/** Application screen states */
export type AppScreen = "onboarding" | "upload" | "picker" | "viewer" | "settings";

// ============================================================
// Parser output types (transient — not persisted)
// ============================================================

/**
 * Full parsed export result. Transient — exists during parsing only.
 */
export interface ConversationExport {
  sourceFormat: SourceFormat;
  conversations: ParsedConversation[];
  totalMessageCount: number;
}

/** A single parsed conversation before storage */
export interface ParsedConversation {
  id: string;
  title: string;
  participants: { name: string }[];
  messages: ParsedMessage[];
  dateRange: { start: number; end: number };
}

/** A single parsed message before storage */
export interface ParsedMessage {
  sender: string;
  timestamp: number;
  content: string | null;
  type: MessageType;
  isUnsent: boolean;
  order: number;
}

// ============================================================
// Persisted entities (IndexedDB via Dexie)
// ============================================================

/** Conversation metadata stored in IndexedDB */
export interface Conversation {
  id: string;
  title: string;
  participants: Participant[];
  messageCount: number;
  dateRange: { start: number; end: number };
  sourceFormat: SourceFormat;
  analyzedAt: number | null;
  analysisProgress: number;
}

/** Participant in a conversation */
export interface Participant {
  name: string;
  isCurrentUser: boolean;
}

/** Single message stored in IndexedDB */
export interface Message {
  id: string;
  conversationId: string;
  sender: string;
  timestamp: number;
  content: string | null;
  type: MessageType;
  isUnsent: boolean;
  order: number;
  sweetnessScore: number | null;
  batchId: number | null;
}

/** Batch of messages sent to Gemini for analysis */
export interface AnalysisBatch {
  id?: number;
  conversationId: string;
  messageIds: string[];
  status: BatchStatus;
  retryCount: number;
  createdAt: number;
  completedAt: number | null;
  error: string | null;
}

// ============================================================
// User settings (localStorage)
// ============================================================

export interface UserSettings {
  geminiApiKey: string | null;
  lastConversationId: string | null;
  sliderLevel: number;
}

export const DEFAULT_USER_SETTINGS: UserSettings = {
  geminiApiKey: null,
  lastConversationId: null,
  sliderLevel: 0,
};
