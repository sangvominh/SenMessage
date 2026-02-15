# Contract: Parser Interface

**Date**: 2026-02-15  
**Type**: Internal service interface  
**Purpose**: Unified interface for parsing Facebook Messenger exports (JSON and HTML)

## Interface Definition

```typescript
/**
 * Unified parser interface. All format-specific parsers implement this.
 * Adding a new format (e.g., Telegram, Zalo) requires only a new implementation.
 */
interface ChatExportParser {
  /**
   * Detect if this parser can handle the given files.
   * @returns true if the files match this parser's expected format
   */
  canParse(files: File[]): Promise<boolean>;

  /**
   * Parse the uploaded files into a ConversationExport.
   * @param files - The uploaded files (one or more)
   * @param onProgress - Optional progress callback (0.0 to 1.0)
   * @returns Parsed export with all conversations and messages
   * @throws ParseError with user-friendly message on failure
   */
  parse(files: File[], onProgress?: (progress: number) => void): Promise<ConversationExport>;
}
```

## Parser Resolution Strategy

```
Files uploaded
      │
      ▽
  ┌──────────────────┐
  │ Try JSON parser   │ ← Check: any .json file with "messages" array?
  │ canParse(files)   │
  └──────┬───────────┘
         │ yes → use JSONParser.parse()
         │ no ▽
  ┌──────────────────┐
  │ Try HTML parser   │ ← Check: any .html file with Facebook message classes?
  │ canParse(files)   │
  └──────┬───────────┘
         │ yes → use HTMLParser.parse()
         │ no ▽
  ┌──────────────────┐
  │ ParseError:       │
  │ "Không nhận dạng  │
  │  được định dạng"  │
  └──────────────────┘
```

## JSON Parser Contract

### Input

One or more `.json` files with Facebook Messenger export structure:

```json
{
  "participants": [...],
  "messages": [...],
  "title": "...",
  "thread_path": "..."
}
```

### Processing Steps

1. Read each `.json` file as text
2. `JSON.parse()` the content
3. **Decode mojibake**: For every string field, apply:
   ```typescript
   function decodeFBString(str: string): string {
     try {
       return new TextDecoder("utf-8").decode(new Uint8Array([...str].map((c) => c.charCodeAt(0))));
     } catch {
       return str; // If decoding fails, return original
     }
   }
   ```
4. Normalize each message to the `Message` entity
5. **Reverse message order** (Facebook exports newest-first)
6. Merge multi-file conversations (`message_1.json` + `message_2.json` → single conversation, with `message_2` being older)
7. Assign sequential `order` indices (0 = oldest)

### Error Cases

| Error                    | Detection               | User Message (Vietnamese)                                                                   |
| ------------------------ | ----------------------- | ------------------------------------------------------------------------------------------- |
| Invalid JSON             | `JSON.parse` throws     | "File không phải định dạng JSON hợp lệ. Vui lòng kiểm tra lại file export từ Facebook."     |
| Missing `messages` field | Key not found           | "File JSON không chứa dữ liệu tin nhắn. Đảm bảo bạn đã export phần 'Tin nhắn' từ Facebook." |
| Empty messages array     | `messages.length === 0` | "Cuộc hội thoại này không có tin nhắn nào."                                                 |
| Mojibake decode failure  | TextDecoder throws      | Silently fall back to raw string (display may look garbled)                                 |

## HTML Parser Contract

### Input

One or more `.html` files with Facebook Messenger export structure.

### Processing Steps

1. Read each `.html` file as text (proper UTF-8 — no mojibake issue)
2. Parse with `DOMParser` (browser-native, no library needed)
3. Extract conversation title from `._a6-h._a6-i` element
4. Extract participants from `._a6-p` element text
5. For each message block (`.pam._3-95._2ph-._a6-g`):
   - Sender: first `._3-94._2lem` child text
   - Content: middle `._2ph_._a6-p > div` text
   - Timestamp: last `._3-94._2lem` child text → parse human-readable date
   - Reactions: `ul._a6-q > li` elements
6. Reverse order (newest-first in HTML too)
7. Assign sequential `order` indices

### Timestamp Parsing

HTML timestamps are locale-dependent. Support common formats:

- US: `"Feb 15, 2026, 10:30 AM"`
- Intl: `"15 feb. 2026, 10:30"`
- Numeric: `"15/02/2026 10:30"`

Use `Date.parse()` with fallback heuristics. If parsing fails, use file order position × 1 second as synthetic timestamp.

### Error Cases

| Error                   | Detection                                   | User Message (Vietnamese)                                                             |
| ----------------------- | ------------------------------------------- | ------------------------------------------------------------------------------------- |
| Not an HTML file        | DOMParser returns empty or no `role="main"` | "File không phải định dạng HTML export từ Facebook."                                  |
| No message blocks found | Zero matches for message CSS selectors      | "Không tìm thấy tin nhắn trong file HTML. Facebook có thể đã thay đổi format export." |
| CSS class mismatch      | Known classes not found                     | "Format HTML không được nhận dạng. Thử export lại ở định dạng JSON."                  |

## Output Contract

Both parsers produce the same output type:

```typescript
interface ConversationExport {
  sourceFormat: "json" | "html";
  conversations: ParsedConversation[];
  totalMessageCount: number;
}

interface ParsedConversation {
  id: string; // Derived from thread_path or hash
  title: string; // Decoded conversation title
  participants: { name: string }[];
  messages: ParsedMessage[];
  dateRange: { start: number; end: number };
}

interface ParsedMessage {
  sender: string; // Decoded sender name
  timestamp: number; // Epoch ms (UTC)
  content: string | null;
  type: MessageType;
  isUnsent: boolean;
  order: number; // Chronological position (0 = oldest)
}
```
