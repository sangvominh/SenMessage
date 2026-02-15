# Data Model: Core Sweetness Filter

**Date**: 2026-02-15  
**Feature**: [spec.md](spec.md) | [plan.md](plan.md)

## Entity Relationship Diagram

```
ConversationExport (1) ──contains──▷ (*) Conversation
Conversation (1) ──contains──▷ (*) Message
Message (1) ──scored-as──▷ (0..1) SweetnessScore
AnalysisBatch (1) ──produces──▷ (*) SweetnessScore
AnalysisBatch (*) ──belongs-to──▷ (1) Conversation
```

## Entities

### ConversationExport

Represents the full uploaded Facebook export file/folder. Transient — exists only during parsing, not persisted.

| Field | Type | Description |
|-------|------|-------------|
| sourceFormat | `"json" \| "html"` | Detected export format |
| conversations | `Conversation[]` | All conversations found in the export |
| totalMessageCount | `number` | Sum of all messages across all conversations |
| rawFiles | `File[]` | Original uploaded files (kept in memory only) |

**Validation**: At least one conversation must be found. If zero, surface parsing error.

### Conversation

Represents one chat thread between participants. Persisted in IndexedDB.

| Field | Type | Description |
|-------|------|-------------|
| id | `string` | Unique ID derived from thread_path or hash of participants+title |
| title | `string` | Conversation title (from export) |
| participants | `Participant[]` | List of participants |
| messageCount | `number` | Total messages in this conversation |
| dateRange | `{ start: number, end: number }` | Epoch ms of earliest and latest message |
| sourceFormat | `"json" \| "html"` | Format this was parsed from |
| analyzedAt | `number \| null` | Epoch ms when analysis was last run (null if never) |
| analysisProgress | `number` | 0.0 to 1.0, fraction of messages analyzed |

**Validation**: Must have ≥ 1 participant. `dateRange.start ≤ dateRange.end`.

### Participant

Sub-entity of Conversation. Not stored separately.

| Field | Type | Description |
|-------|------|-------------|
| name | `string` | Display name (decoded from mojibake if JSON) |
| isCurrentUser | `boolean` | Whether this is the export owner (heuristic: most messages sent) |

### Message

A single message within a conversation. Persisted in IndexedDB.

| Field | Type | Description |
|-------|------|-------------|
| id | `string` | Unique ID: `{conversationId}_{index}` |
| conversationId | `string` | FK to Conversation |
| sender | `string` | Sender display name (decoded) |
| timestamp | `number` | Epoch milliseconds (UTC) |
| content | `string \| null` | Text content (null for media-only messages) |
| type | `MessageType` | Enum: see below |
| isUnsent | `boolean` | Whether message was unsent/deleted |
| order | `number` | Chronological position (0 = oldest) |
| sweetnessScore | `number \| null` | 0–5 (null = not yet analyzed) |
| batchId | `number \| null` | Which AnalysisBatch scored this |

**Indexes** (Dexie):
- Primary: `id`
- Compound: `[conversationId+order]` — for chronological listing
- Compound: `[conversationId+sweetnessScore]` — for slider filtering

**Validation**: `timestamp > 0`. `order ≥ 0`. If `sweetnessScore` is set, must be integer 0–5.

### MessageType (enum)

```typescript
type MessageType =
  | "text"       // Generic message with text content
  | "photo"      // Photo attachment
  | "video"      // Video attachment
  | "audio"      // Voice message
  | "sticker"    // Sticker
  | "gif"        // GIF
  | "file"       // File attachment
  | "share"      // Link share
  | "call"       // Voice/video call record
  | "reaction"   // Standalone reaction (rare)
  | "system"     // System message (subscribe/unsubscribe/name change)
  | "other";     // Unknown type
```

### AnalysisBatch

Tracks a batch of messages sent to Gemini. Persisted in IndexedDB for resume capability.

| Field | Type | Description |
|-------|------|-------------|
| id | `number` | Auto-increment primary key |
| conversationId | `string` | FK to Conversation |
| messageIds | `string[]` | List of Message IDs in this batch |
| status | `BatchStatus` | Current processing state |
| retryCount | `number` | Number of retries attempted (max 3) |
| createdAt | `number` | Epoch ms when batch was created |
| completedAt | `number \| null` | Epoch ms when batch finished (success or final failure) |
| error | `string \| null` | Error message if failed |

### BatchStatus (enum)

```typescript
type BatchStatus =
  | "pending"      // Created but not yet sent
  | "in-progress"  // Currently being processed by AI
  | "completed"    // Successfully scored all messages
  | "failed";      // All retries exhausted
```

**State transitions**:
```
pending → in-progress → completed
                      → failed (after 3 retries)
                      → pending (on retry: back to queue)
```

### UserSettings

Stored in localStorage (not IndexedDB). Simple key-value.

| Key | Type | Default | Description |
|-----|------|---------|-------------|
| `geminiApiKey` | `string \| null` | `null` | User's Gemini API key |
| `lastConversationId` | `string \| null` | `null` | Last selected conversation |
| `sliderLevel` | `number` | `0` | Last used sweetness filter level |


## IndexedDB Schema (Dexie)

```typescript
const db = new Dexie("SenMessageDB");

db.version(1).stores({
  conversations: "id, title, messageCount",
  messages: "id, [conversationId+order], [conversationId+sweetnessScore], conversationId",
  batches: "++id, conversationId, status"
});
```

## Data Flow

```
┌─────────────┐     ┌──────────┐     ┌───────────┐     ┌────────────┐
│  File Upload │────▷│  Parser  │────▷│ IndexedDB │────▷│  UI State  │
│  (HTML/JSON) │     │(client)  │     │ (Dexie)   │     │ (React)    │
└─────────────┘     └──────────┘     └─────┬─────┘     └──────┬─────┘
                                           │                   │
                                     ┌─────▽─────┐      ┌─────▽─────┐
                                     │  Batch     │      │  Slider   │
                                     │  Manager   │      │  Filter   │
                                     └─────┬─────┘      └───────────┘
                                           │           (in-memory filter)
                                     ┌─────▽─────┐
                                     │  Gemini   │
                                     │  API      │
                                     └───────────┘
```

1. **Upload** → File dropped/selected in browser
2. **Parse** → Client-side parser (JSON or HTML) → normalized Messages
3. **Store** → `bulkPut()` to IndexedDB (conversations + messages)
4. **Display** → Load messages into memory → render via react-virtuoso
5. **Analyze** → Batch manager creates AnalysisBatches → sends to Gemini
6. **Score** → Scores returned → `bulkPut()` score updates to IndexedDB + memory
7. **Filter** → Slider changes → `Array.filter()` on in-memory data → instant re-render
