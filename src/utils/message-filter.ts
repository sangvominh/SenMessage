import type { Message } from "../models/types";

/**
 * Filter messages by sweetness level.
 * Level 0 returns all messages.
 * Levels 1-5 return messages with sweetnessScore >= level.
 * Messages with null/undefined score are hidden at levels 1-5.
 * Per research.md R4 and FR-009.
 */
export function filterBySweetness(messages: Message[], level: number): Message[] {
  if (level === 0) return messages;
  return messages.filter((m) => m.sweetnessScore !== null && m.sweetnessScore >= level);
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Filter messages by keyword (case-insensitive String.includes).
 * Optimized to use pre-compiled RegExp instead of toLowerCase().includes() to avoid string allocations.
 * Using standard for loop for better performance on large arrays.
 */
export function filterByKeyword(messages: Message[], query: string): Message[] {
  const trimmed = query.trim();
  if (!trimmed) return messages;

  const regex = new RegExp(escapeRegex(trimmed), "i");
  const result: Message[] = [];
  for (let i = 0; i < messages.length; i++) {
    const content = messages[i].content;
    if (content && regex.test(content)) {
      result.push(messages[i]);
    }
  }
  return result;
}

/**
 * Combined filter: sweetness level + keyword.
 */
export function filterMessages(messages: Message[], level: number, keyword: string): Message[] {
  let result = filterBySweetness(messages, level);
  result = filterByKeyword(result, keyword);
  return result;
}

/**
 * Count messages matching a sweetness level (for UI hints).
 */
export function countAtLevel(messages: Message[], level: number): number {
  return filterBySweetness(messages, level).length;
}
