import type { ConversationExport, ParsedMessage, MessageType } from "../../models/types";

/**
 * Parse pasted text from Facebook Messenger.
 * Supports common copy-paste formats from messenger.com.
 *
 * Expected patterns:
 *   "Name\nMessage text\nTimestamp"
 *   or "Name: Message text"
 *   or freestyle text (treat as single conversation)
 */
export function parsePastedText(text: string): ConversationExport {
  const lines = text.split("\n").filter((l) => l.trim().length > 0);

  if (lines.length === 0) {
    throw new Error("Không có nội dung để phân tích");
  }

  const messages: ParsedMessage[] = [];
  const participantNames = new Set<string>();

  // Try to detect "Name: message" pattern
  const colonPattern = /^(.{1,30}):\s+(.+)$/;
  let colonMatches = 0;

  for (const line of lines) {
    if (colonPattern.test(line)) colonMatches++;
  }

  const isColonFormat = colonMatches > lines.length * 0.3; // >30% lines match

  if (isColonFormat) {
    // Parse "Name: message" format
    let order = 0;
    for (const line of lines) {
      const match = colonPattern.exec(line);
      if (match) {
        const sender = match[1]!.trim();
        const content = match[2]!.trim();
        participantNames.add(sender);
        messages.push({
          sender,
          timestamp: Date.now() - (lines.length - order) * 60_000, // Fake timestamps
          content,
          type: "text" as MessageType,
          isUnsent: false,
          order: order++,
        });
      } else {
        // Continuation of previous message or standalone line
        if (messages.length > 0) {
          const prev = messages[messages.length - 1]!;
          prev.content = (prev.content ?? "") + "\n" + line.trim();
        } else {
          messages.push({
            sender: "Unknown",
            timestamp: Date.now(),
            content: line.trim(),
            type: "text" as MessageType,
            isUnsent: false,
            order: order++,
          });
        }
      }
    }
  } else {
    // Treat all lines as individual messages from "Unknown"
    lines.forEach((line, i) => {
      messages.push({
        sender: "Bạn",
        timestamp: Date.now() - (lines.length - i) * 60_000,
        content: line.trim(),
        type: "text" as MessageType,
        isUnsent: false,
        order: i,
      });
    });
    participantNames.add("Bạn");
  }

  const participants = Array.from(participantNames).map((name) => ({ name }));
  if (participants.length === 0) participants.push({ name: "Unknown" });

  const timestamps = messages.map((m) => m.timestamp);

  return {
    sourceFormat: "json", // Treat as JSON format internally
    conversations: [
      {
        id: `pasted_${Date.now()}`,
        title: participants.length > 1
          ? participants.map((p) => p.name).join(" & ")
          : "Tin nhắn dán",
        participants,
        messages,
        dateRange: {
          start: Math.min(...timestamps),
          end: Math.max(...timestamps),
        },
      },
    ],
    totalMessageCount: messages.length,
  };
}
