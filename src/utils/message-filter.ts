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
  return messages.filter(
    (m) => m.sweetnessScore !== null && m.sweetnessScore >= level,
  );
}

/**
 * Filter messages by keyword (case-insensitive RegExp).
 * ⚡ Bolt: Uses pre-compiled RegExp and a standard for-loop instead of
 * String.toLowerCase().includes() inside .filter() to avoid massive string
 * allocation and function call overhead on 100k+ message arrays.
 */
export function filterByKeyword(messages: Message[], query: string): Message[] {
  const trimmed = query.trim();
  if (!trimmed) return messages;

  // Escape regex special characters
  const escaped = trimmed.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const regex = new RegExp(escaped, "i");

  const result: Message[] = [];
  for (let i = 0; i < messages.length; i++) {
    const m = messages[i];
    if (m?.content && regex.test(m.content)) {
      result.push(m);
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
