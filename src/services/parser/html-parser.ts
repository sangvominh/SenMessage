import type { ChatExportParser } from "./types";
import { ParseError } from "./types";
import type {
  ConversationExport,
  ParsedConversation,
  ParsedMessage,
  MessageType,
} from "../../models/types";
import { vi } from "../../i18n/vi";

// ============================================================
// HTML Parser — Facebook Messenger HTML exports
// Per parser-interface.md and research.md R1
// ============================================================

export class HTMLParser implements ChatExportParser {
  async canParse(files: File[]): Promise<boolean> {
    for (const file of files) {
      if (!file.name.toLowerCase().endsWith(".html") && !file.name.toLowerCase().endsWith(".htm"))
        continue;
      try {
        const text = await file.text();
        // Check for Facebook-specific CSS classes
        if (text.includes("_a6-g") || text.includes("_3-95") || text.includes("pam")) {
          return true;
        }
      } catch {
        // Can't read file
      }
    }
    return false;
  }

  async parse(files: File[], onProgress?: (progress: number) => void): Promise<ConversationExport> {
    const htmlFiles = files.filter(
      (f) => f.name.toLowerCase().endsWith(".html") || f.name.toLowerCase().endsWith(".htm"),
    );
    if (htmlFiles.length === 0) {
      throw new ParseError(vi.errors.parseUnknownFormat);
    }

    const conversations: ParsedConversation[] = [];
    let processed = 0;

    for (const file of htmlFiles) {
      let text: string;
      try {
        text = await file.text();
      } catch {
        throw new ParseError(vi.errors.parseInvalidHtml);
      }

      const parser = new DOMParser();
      const doc = parser.parseFromString(text, "text/html");

      // Extract title
      const titleEl =
        doc.querySelector("._a6-h._a6-i") ??
        doc.querySelector("._a6-h") ??
        doc.querySelector("title");
      const title = titleEl?.textContent?.trim() ?? "Cuộc hội thoại";

      // Extract participants
      const participantEls = doc.querySelectorAll("._a6-p");
      const participantNames = new Set<string>();
      participantEls.forEach((el) => {
        const name = el.textContent?.trim();
        if (name) participantNames.add(name);
      });

      // Extract messages
      const messageBlocks = doc.querySelectorAll(".pam._3-95._2ph-._a6-g");

      if (messageBlocks.length === 0) {
        // Try alternative selectors
        const altBlocks = doc.querySelectorAll("._a6-g");
        if (altBlocks.length === 0) {
          throw new ParseError(vi.errors.parseNoHtmlMessages);
        }
      }

      const rawMessages: ParsedMessage[] = [];
      const blocks = messageBlocks.length > 0 ? messageBlocks : doc.querySelectorAll("._a6-g");

      blocks.forEach((block) => {
        const lemEls = block.querySelectorAll("._3-94._2lem");
        const contentEl =
          block.querySelector("._2ph_._a6-p > div") ?? block.querySelector("._a6-p > div");

        let sender = "Unknown";
        let timestampStr = "";

        if (lemEls.length >= 2) {
          sender = lemEls[0]?.textContent?.trim() ?? "Unknown";
          timestampStr = lemEls[lemEls.length - 1]?.textContent?.trim() ?? "";
        } else if (lemEls.length === 1) {
          sender = lemEls[0]?.textContent?.trim() ?? "Unknown";
        }

        // Add sender to participants
        if (sender !== "Unknown") {
          participantNames.add(sender);
        }

        const content = contentEl?.textContent?.trim() ?? null;
        const timestamp = parseTimestamp(timestampStr);
        const type: MessageType = content ? "text" : "other";

        rawMessages.push({
          sender,
          timestamp,
          content,
          type,
          isUnsent: false,
          order: 0, // Will be assigned after reversing
        });
      });

      if (rawMessages.length === 0) {
        throw new ParseError(vi.errors.parseNoHtmlMessages);
      }

      // HTML exports are newest-first → reverse for chronological
      rawMessages.reverse();
      rawMessages.forEach((msg, i) => {
        msg.order = i;
      });

      // Compute date range
      const timestamps = rawMessages.map((m) => m.timestamp).filter((t) => t > 0);
      const dateRange = {
        start: timestamps.length > 0 ? Math.min(...timestamps) : 0,
        end: timestamps.length > 0 ? Math.max(...timestamps) : 0,
      };

      const participants = [...participantNames].map((name) => ({ name }));

      const convId = `html_${file.name}_${title.replace(/\s+/g, "_")}`;

      conversations.push({
        id: convId,
        title,
        participants,
        messages: rawMessages,
        dateRange,
      });

      processed++;
      onProgress?.(processed / htmlFiles.length);
    }

    const totalMessageCount = conversations.reduce((sum, c) => sum + c.messages.length, 0);

    return {
      sourceFormat: "html",
      conversations,
      totalMessageCount,
    };
  }
}

// ============================================================
// Timestamp parsing helpers
// ============================================================

export function parseTimestamp(str: string): number {
  if (!str) return 0;

  // Try native Date.parse first
  const native = Date.parse(str);
  if (!isNaN(native)) return native;

  // Try common Facebook HTML formats
  // "15 thg 2, 2026, 10:30" (Vietnamese)
  const viMatch = /(\d{1,2})\s+thg\s+(\d{1,2}),?\s+(\d{4}),?\s+(\d{1,2}):(\d{2})/.exec(str);
  if (viMatch) {
    const [, day, month, year, hour, minute] = viMatch;
    return new Date(
      Number(year),
      Number(month) - 1,
      Number(day),
      Number(hour),
      Number(minute),
    ).getTime();
  }

  // "15/02/2026 10:30"
  const numMatch = /(\d{1,2})\/(\d{1,2})\/(\d{4})\s+(\d{1,2}):(\d{2})/.exec(str);
  if (numMatch) {
    const [, day, month, year, hour, minute] = numMatch;
    return new Date(
      Number(year),
      Number(month) - 1,
      Number(day),
      Number(hour),
      Number(minute),
    ).getTime();
  }

  return 0;
}
