import type { ChatExportParser } from "./types";
import { ParseError } from "./types";
import type {
  ConversationExport,
  ParsedConversation,
  ParsedMessage,
  MessageType,
} from "../../models/types";
import { decodeFBString } from "../../utils/decode";
import { vi } from "../../i18n/vi";

// ============================================================
// Facebook JSON structures (raw from export)
// ============================================================

interface FBJsonExport {
  participants?: { name: string }[];
  messages?: FBJsonMessage[];
  title?: string;
  thread_path?: string;
}

interface FBJsonMessage {
  sender_name?: string;
  timestamp_ms?: number;
  content?: string;
  type?: string;
  is_unsent?: boolean;
  photos?: unknown[];
  videos?: unknown[];
  audio_files?: unknown[];
  sticker?: unknown;
  gifs?: unknown[];
  files?: unknown[];
  share?: unknown;
  call_duration?: number;
  reactions?: unknown[];
}

// ============================================================
// JSON Parser
// ============================================================

export class JSONParser implements ChatExportParser {
  async canParse(files: File[]): Promise<boolean> {
    // Prioritize files with message_*.json naming pattern
    const jsonFiles = files.filter((f) => f.name.toLowerCase().endsWith(".json"));
    const sorted = [...jsonFiles].sort((a, b) => {
      const aIsMsg = /^message_\d+\.json$/i.test(a.name) ? 0 : 1;
      const bIsMsg = /^message_\d+\.json$/i.test(b.name) ? 0 : 1;
      return aIsMsg - bIsMsg;
    });

    for (const file of sorted) {
      try {
        const text = await file.text();
        const data: unknown = JSON.parse(text);
        if (
          data &&
          typeof data === "object" &&
          "messages" in data &&
          Array.isArray((data as FBJsonExport).messages)
        ) {
          return true;
        }
      } catch {
        // Not valid JSON or not the right format — skip
      }
    }
    return false;
  }

  async parse(files: File[], onProgress?: (progress: number) => void): Promise<ConversationExport> {
    const jsonFiles = files.filter((f) => f.name.toLowerCase().endsWith(".json"));
    if (jsonFiles.length === 0) {
      throw new ParseError(vi.errors.parseUnknownFormat);
    }

    // Group files by conversation (thread_path or title)
    // Skip non-message JSON files gracefully
    const conversationMap = new Map<string, { data: FBJsonExport; fileName: string }[]>();
    let processed = 0;
    let messageFileCount = 0;

    for (const file of jsonFiles) {
      let text: string;
      try {
        text = await file.text();
      } catch {
        // Can't read file — skip
        processed++;
        onProgress?.(processed / (jsonFiles.length * 2));
        continue;
      }

      let data: FBJsonExport;
      try {
        data = JSON.parse(text) as FBJsonExport;
      } catch {
        // Not valid JSON — skip
        processed++;
        onProgress?.(processed / (jsonFiles.length * 2));
        continue;
      }

      // Skip JSON files that aren't Facebook message exports
      if (!data.messages || !Array.isArray(data.messages)) {
        processed++;
        onProgress?.(processed / (jsonFiles.length * 2));
        continue;
      }

      messageFileCount++;
      const convId = data.thread_path ?? data.title ?? "unknown";
      const existing = conversationMap.get(convId) ?? [];
      existing.push({ data, fileName: file.name });
      conversationMap.set(convId, existing);

      processed++;
      onProgress?.(processed / (jsonFiles.length * 2)); // First half: reading files
    }

    if (messageFileCount === 0) {
      throw new ParseError(vi.errors.parseNoMessageFiles);
    }

    // Build conversations
    const conversations: ParsedConversation[] = [];
    let convIndex = 0;

    for (const [convId, fileGroup] of conversationMap) {
      // Sort files: message_2.json (older) before message_1.json (newer)
      fileGroup.sort((a, b) => {
        const numA = extractFileNumber(a.fileName);
        const numB = extractFileNumber(b.fileName);
        // Higher number = older messages → put first
        return numB - numA;
      });

      // Merge messages from all files (oldest first after sort)
      const allMessages: FBJsonMessage[] = [];
      for (const { data } of fileGroup) {
        if (data.messages) {
          // Each file has messages newest-first → reverse
          allMessages.push(...[...data.messages].reverse());
        }
      }

      if (allMessages.length === 0) {
        throw new ParseError(vi.errors.parseEmptyConversation);
      }

      // Use data from the first file for metadata
      const firstData = fileGroup[0]!.data;
      const title = firstData.title ? decodeFBString(firstData.title) : "Cuộc hội thoại";
      const participants =
        firstData.participants?.map((p) => ({ name: decodeFBString(p.name) })) ?? [];

      // Normalize messages
      const messages: ParsedMessage[] = allMessages.map((msg, index) => ({
        sender: msg.sender_name ? decodeFBString(msg.sender_name) : "Unknown",
        timestamp: msg.timestamp_ms ?? 0,
        content: msg.content ? decodeFBString(msg.content) : null,
        type: resolveMessageType(msg),
        isUnsent: msg.is_unsent ?? false,
        order: index,
      }));

      // Compute date range
      const timestamps = messages.map((m) => m.timestamp).filter((t) => t > 0);
      const dateRange = {
        start: timestamps.length > 0 ? Math.min(...timestamps) : 0,
        end: timestamps.length > 0 ? Math.max(...timestamps) : 0,
      };

      conversations.push({
        id: convId,
        title,
        participants,
        messages,
        dateRange,
      });

      convIndex++;
      onProgress?.(0.5 + (convIndex / conversationMap.size) * 0.5);
    }

    const totalMessageCount = conversations.reduce((sum, c) => sum + c.messages.length, 0);

    return {
      sourceFormat: "json",
      conversations,
      totalMessageCount,
    };
  }
}

// ============================================================
// Helpers
// ============================================================

/** Extract number from "message_N.json" filename (default 1) */
function extractFileNumber(fileName: string): number {
  const match = /message_(\d+)\.json/i.exec(fileName);
  return match ? Number(match[1]) : 1;
}

/** Map Facebook's raw message to our MessageType enum */
function resolveMessageType(msg: FBJsonMessage): MessageType {
  if (msg.photos && msg.photos.length > 0) return "photo";
  if (msg.videos && msg.videos.length > 0) return "video";
  if (msg.audio_files && msg.audio_files.length > 0) return "audio";
  if (msg.sticker) return "sticker";
  if (msg.gifs && msg.gifs.length > 0) return "gif";
  if (msg.files && msg.files.length > 0) return "file";
  if (msg.share) return "share";
  if (msg.call_duration !== undefined) return "call";
  if (msg.type === "Subscribe" || msg.type === "Unsubscribe") return "system";
  if (msg.content) return "text";
  return "other";
}
