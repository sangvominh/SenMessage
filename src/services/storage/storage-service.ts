import { db } from "./db";
import type { Conversation, Message, AnalysisBatch, UserSettings } from "../../models/types";
import { DEFAULT_USER_SETTINGS } from "../../models/types";

// ============================================================
// Conversation operations
// ============================================================

export async function saveConversation(conversation: Conversation): Promise<void> {
  await db.conversations.put(conversation);
}

export async function getConversations(): Promise<Conversation[]> {
  return db.conversations.toArray();
}

export async function getConversation(id: string): Promise<Conversation | undefined> {
  return db.conversations.get(id);
}

export async function clearConversation(id: string): Promise<void> {
  await db.transaction("rw", db.conversations, db.messages, db.batches, async () => {
    await db.messages.where("conversationId").equals(id).delete();
    await db.batches.where("conversationId").equals(id).delete();
    await db.conversations.delete(id);
  });
}

export async function clearAllData(): Promise<void> {
  await db.transaction("rw", db.conversations, db.messages, db.batches, async () => {
    await db.messages.clear();
    await db.batches.clear();
    await db.conversations.clear();
  });
}

// ============================================================
// Message operations
// ============================================================

export async function saveMessages(messages: Message[]): Promise<void> {
  await db.messages.bulkPut(messages);
}

export async function getMessages(conversationId: string): Promise<Message[]> {
  return db.messages
    .where("[conversationId+order]")
    .between([conversationId, -Infinity], [conversationId, Infinity])
    .toArray();
}

export async function updateScores(
  updates: { id: string; sweetnessScore: number | null; batchId: number | null }[],
): Promise<void> {
  await db.messages.bulkUpdate(
    updates.map((u) => ({
      key: u.id,
      changes: { sweetnessScore: u.sweetnessScore, batchId: u.batchId },
    })),
  );
}

// ============================================================
// Batch operations
// ============================================================

export async function saveBatches(batches: AnalysisBatch[]): Promise<number[]> {
  return db.batches.bulkAdd(batches, { allKeys: true }) as Promise<number[]>;
}

export async function updateBatch(id: number, changes: Partial<AnalysisBatch>): Promise<void> {
  await db.batches.update(id, changes);
}

export async function getBatches(conversationId: string): Promise<AnalysisBatch[]> {
  return db.batches.where("conversationId").equals(conversationId).toArray();
}

// ============================================================
// UserSettings (localStorage)
// ============================================================

const SETTINGS_PREFIX = "senmessage_";

export function getUserSettings(): UserSettings {
  try {
    const apiKey = localStorage.getItem(`${SETTINGS_PREFIX}geminiApiKey`);
    const lastConvId = localStorage.getItem(`${SETTINGS_PREFIX}lastConversationId`);
    const sliderStr = localStorage.getItem(`${SETTINGS_PREFIX}sliderLevel`);
    return {
      geminiApiKey: apiKey,
      lastConversationId: lastConvId,
      sliderLevel: sliderStr ? Number(sliderStr) : DEFAULT_USER_SETTINGS.sliderLevel,
    };
  } catch {
    return { ...DEFAULT_USER_SETTINGS };
  }
}

export function saveUserSetting<K extends keyof UserSettings>(
  key: K,
  value: UserSettings[K],
): void {
  try {
    if (value === null) {
      localStorage.removeItem(`${SETTINGS_PREFIX}${key}`);
    } else {
      localStorage.setItem(`${SETTINGS_PREFIX}${key}`, String(value));
    }
  } catch {
    // localStorage may be full or unavailable — silently ignore
  }
}

export function clearApiKey(): void {
  saveUserSetting("geminiApiKey", null);
}
