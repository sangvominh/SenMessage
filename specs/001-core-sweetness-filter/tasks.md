# Tasks: Core Sweetness Filter

**Input**: Design documents from `/specs/001-core-sweetness-filter/`
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, contracts/ ✅, quickstart.md ✅

**Tests**: Not explicitly requested — test tasks omitted. Add tests in Polish phase if needed.

**Organization**: Tasks grouped by user story (P1→P4) for independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies on incomplete tasks)
- **[Story]**: Which user story (US1–US4) this task belongs to
- All file paths are relative to repository root

---

## Phase 1: Setup (Project Initialization)

**Purpose**: Scaffold the Vite + React + TypeScript project with all tooling configured

- [x] T001 Create Vite + React + TypeScript project with `npm create vite@latest . -- --template react-ts` and install core dependencies: react 18+, react-dom, @google/genai, react-virtuoso, dexie, dexie-react-hooks, tailwindcss
- [x] T002 [P] Configure Tailwind CSS v4 with Vite plugin and create base theme (Messenger-inspired colors: blue-500 primary, gray-100 secondary) in tailwind.config.ts and src/index.css
- [x] T003 [P] Configure ESLint + Prettier for TypeScript/React with strict mode in eslint.config.js and .prettierrc
- [x] T004 [P] Create directory structure per plan.md: src/components/{upload,conversation,chat,filter,common}/, src/hooks/, src/services/{parser,ai,storage}/, src/models/, src/utils/, src/i18n/, tests/{unit,integration,e2e}/

**Checkpoint**: `npm run dev` starts without errors, blank page renders

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core types, database, storage, i18n, and shell UI that ALL user stories depend on

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T005 [P] Define all TypeScript types and interfaces in src/models/types.ts: ConversationExport, Conversation, Participant, Message, MessageType (12 variants), AnalysisBatch, BatchStatus, UserSettings, ParsedConversation, ParsedMessage — per data-model.md
- [x] T006 [P] Create Vietnamese i18n string constants in src/i18n/vi.ts: all UI labels, error messages, onboarding text, empty states, progress templates — per spec.md FR-005/FR-014/FR-021
- [x] T007 Initialize Dexie database (SenMessageDB v1) in src/services/storage/db.ts with stores: conversations("id, title, messageCount"), messages("id, [conversationId+order], [conversationId+sweetnessScore], conversationId"), batches("++id, conversationId, status") — per data-model.md schema
- [x] T008 Implement storage service in src/services/storage/storage-service.ts: saveConversation(), saveMessages(bulkPut), updateScores(bulkPut), getConversations(), getMessages(conversationId), clearConversation(), localStorage helpers for UserSettings — per data-model.md data flow
- [x] T009 [P] Create app layout shell component in src/components/common/Layout.tsx: responsive container (max-w-2xl centered), header with SenMessage branding, settings gear icon, Vietnamese UI
- [x] T010 [P] Create error boundary component in src/components/common/ErrorBoundary.tsx: catch React errors, display friendly Vietnamese error message with retry button
- [x] T011 Setup App.tsx with screen state management: screen enum (onboarding, upload, picker, viewer, settings), state transitions, render correct screen component — wires all stories together incrementally

**Checkpoint**: Foundation ready — types compile, Dexie initializes, Layout renders, App.tsx manages screens

---

## Phase 3: User Story 1 — Upload & Parse Chat Export (Priority: P1) 🎯 MVP

**Goal**: User uploads a Facebook Messenger export (JSON or HTML), sees a conversation list, picks one, and views the summary (participants, message count, date range)

**Independent Test**: Upload a sample Facebook JSON export and a sample HTML export → conversation picker shows correct participant names, message counts, and date ranges. No AI or filtering needed.

### Implementation for User Story 1

- [x] T012 [P] [US1] Define ChatExportParser interface and ParseError class in src/services/parser/types.ts: canParse(files) → boolean, parse(files, onProgress?) → ConversationExport — per parser-interface.md
- [x] T013 [P] [US1] Implement Facebook string decoder utility in src/utils/decode.ts: decodeFBString() that fixes mojibake encoding (Latin-1 byte escapes → UTF-8) using TextDecoder, plus escapeFBString() for safe handling — per research.md R1
- [x] T014 [US1] Implement JSON parser in src/services/parser/json-parser.ts: canParse checks for .json with "messages" array, parse reads files, JSON.parse, decodeFBString on all string fields (content, sender_name, title, participants), reverse message order (newest→oldest to chronological), merge multi-file conversations (message_2.json older than message_1.json), assign sequential order indices, normalize to ParsedMessage, report progress — per parser-interface.md and research.md R1
- [x] T015 [US1] Implement HTML parser in src/services/parser/html-parser.ts: canParse checks for .html with Facebook message CSS classes, parse with DOMParser, extract title from \_a6-h/\_a6-i, participants from \_a6-p, messages from .pam.\_3-95.\_2ph-.\_a6-g blocks (sender, content, timestamp), handle locale-dependent timestamp parsing with fallbacks, reverse order, assign order indices — per parser-interface.md and research.md R1
- [x] T016 [US1] Implement parser resolver in src/services/parser/parser-resolver.ts: tryParse(files) that iterates [JSONParser, HTMLParser], calls canParse(), returns first match's parse() result, throws ParseError with Vietnamese message if no parser matches — per parser-interface.md resolution strategy
- [x] T017 [P] [US1] Create onboarding screen in src/components/upload/OnboardingScreen.tsx: welcoming Vietnamese text, step-by-step Facebook export instructions (go to facebook.com/dyi, select "Tin nhắn", choose JSON format, download, **unzip the downloaded file**), visual steps, "Bắt đầu" button to proceed to upload — per FR-014 and quickstart.md
- [x] T018 [P] [US1] Create file upload area component in src/components/upload/UploadArea.tsx: drag-and-drop zone with visual feedback (onDragOver/onDrop), file picker button, accept .json/.html files, loading spinner during parsing, error display — per FR-001
- [x] T019 [US1] Create conversation picker component in src/components/conversation/ConversationPicker.tsx: list of conversations with participant names and message count per conversation, click to select, auto-select if only one conversation found (skip picker per US1 scenario 7) — per FR-004
- [x] T020 [US1] Create conversation summary component in src/components/conversation/ConversationSummary.tsx: display participant names, total message count, date range (Vietnamese date format), "Xem tin nhắn" button to proceed to viewer — per FR-004a
- [x] T021 [US1] Implement useFileUpload hook in src/hooks/useFileUpload.ts: manages upload state (idle, parsing, success, error), calls parser-resolver.tryParse(), stores parsed conversations via storage-service, returns conversations list and error state
- [x] T022 [US1] Implement useConversations hook in src/hooks/useConversations.ts: loads conversations from IndexedDB, handles conversation selection, stores selected conversation ID in localStorage, **compute Participant.isCurrentUser heuristic (participant who sent the most messages)** for left/right chat bubble alignment, provides selectedConversation and messages for the viewer
- [x] T023 [US1] Wire upload → parse → picker → summary flow in App.tsx: onboarding → upload screen → parsing → conversation picker (or auto-skip) → summary → viewer screen transition, handle "upload new file" (FR-018: clear previous data)

**Checkpoint**: User Story 1 fully functional — upload JSON/HTML → see conversations → pick one → see summary. Testable independently.

---

## Phase 4: User Story 2 — AI Sweetness Analysis (Priority: P2)

**Goal**: After conversation selection, AI analysis auto-starts in background. User sees progress but is NOT blocked. Scores arrive progressively and persist in IndexedDB.

**Independent Test**: With pre-parsed messages in IndexedDB, trigger analysis → batches process with progress updates → messages get sweetness scores (0–5) → scores persist on refresh.

### Implementation for User Story 2

- [x] T024 [P] [US2] Implement Gemini AI service wrapper in src/services/ai/gemini-service.ts: initialize GoogleGenAI with user API key, analyzeBatch(messages) → {id, score}[] using gemini-2.5-flash with responseMimeType "application/json", responseSchema (array of {id: NUMBER, score: NUMBER}), thinkingConfig {thinkingBudget: 0}, Vietnamese system prompt from gemini-api.md, validate response (clamp scores 0-5, ignore unknown IDs, mark missing IDs as null), error mapping (429→rate limit, 403→invalid key, 5xx→server error) — per contracts/gemini-api.md
- [x] T025 [P] [US2] Implement rate limiter in src/services/ai/rate-limiter.ts: simple queue with configurable delay between requests (default 4s for free tier 15 RPM), enqueue(fn) → Promise, pause/resume on 429, respect Retry-After header — per gemini-api.md rate limiting strategy
- [x] T026 [US2] Implement batch manager service in src/services/ai/batch-manager.ts: createBatches(messages, batchSize=100) → AnalysisBatch[] — **filter to type === 'text' with non-null content before batching** (FR-011: skip non-text messages), **map sender names to generic aliases ('Anh'/'Em' based on isCurrentUser) before constructing batch payload** (gemini-api.md Security Contract #2), processBatches(batches) with rate limiter queue, sliding window of 5 context messages between batches, update batch status (pending→in-progress→completed/failed), retry failed batches (max 3 with exponential backoff 1s/2s/4s), write scores to IndexedDB via storage-service.updateScores(), emit progress callbacks (batchesCompleted/batchesTotal), cancel all on API key removal — per gemini-api.md and data-model.md BatchStatus state machine
- [x] T027 [P] [US2] Create API key input component in src/components/common/ApiKeyInput.tsx: text input (type=password) with show/hide toggle, save to localStorage, validate format (non-empty), clear button, Vietnamese labels — per FR-019
- [x] T028 [P] [US2] Create API key guide component in src/components/common/ApiKeyGuide.tsx: Vietnamese step-by-step instructions for getting a free Gemini API key from aistudio.google.com, link to Google AI Studio, visual steps — per FR-021
- [x] T029 [US2] Create analysis progress indicator in src/components/common/AnalysisProgress.tsx: subtle non-blocking progress bar/text showing "Đang phân tích... X/Y tin nhắn", batch count, estimated time remaining, does NOT obstruct conversation browsing, error state for failed batches with retry button — per FR-008a and FR-013
- [x] T030 [US2] Implement useApiKey hook in src/hooks/useApiKey.ts: read/write API key from localStorage, isKeySet boolean, clearKey(), key validation state
- [x] T031 [US2] Implement useAnalysis hook in src/hooks/useAnalysis.ts: orchestrates batch-manager, tracks analysis state (idle, running, paused, completed, error), progress (messagesAnalyzed/total), auto-starts when conversation selected + API key exists, pauses on error, provides cancel(), uses Dexie useLiveQuery for reactive score updates — per FR-008
- [x] T032 [US2] Wire analysis auto-start and progressive updates in App.tsx: on conversation selection check API key → if missing show ApiKeyInput → if present auto-start analysis, show AnalysisProgress overlay on viewer, handle "key removed" → cancel batches, prompt for key if user tries slider levels 1-5 without key (FR-020)

**Checkpoint**: User Story 2 fully functional — API key saved → analysis auto-starts → progress shows → scores appear progressively → persists on refresh. Testable with pre-parsed data.

---

## Phase 5: User Story 3 — Sweetness Level Filter (Priority: P3)

**Goal**: Interactive slider (0–5) instantly filters messages. Level 0 = all messages (fast local viewer with search). Levels 1–5 = sweet messages only at that threshold. No AI calls needed for filtering.

**Independent Test**: With pre-scored mock messages, slider at 0 shows all, slider at 3 shows only score ≥ 3, keyword search highlights matches, count updates instantly (<100ms).

### Implementation for User Story 3

- [x] T033 [P] [US3] Implement in-memory message filter logic in src/utils/message-filter.ts: filterBySweetness(messages, level) → level 0 returns all, level 1-5 returns messages with sweetnessScore ≥ level (hide null/unscored at levels 1-5 per FR-009b), filterByKeyword(messages, query) → case-insensitive String.includes matching, combined filter function, count helpers — per research.md R4 and FR-009/FR-009a/FR-009b
- [x] T034 [P] [US3] Create sweetness slider component in src/components/filter/SweetnessSlider.tsx: range input 0–5 with step 1, Vietnamese labels ("Tất cả" at 0, heart icons at 1-5), current level display, visual track with color gradient, accessible ARIA labels — per FR-009
- [x] T035 [P] [US3] Create keyword search bar component in src/components/filter/SearchBar.tsx: text input with search icon, clear button, Vietnamese placeholder "Tìm kiếm tin nhắn...", debounced input (150ms), match count display, ↑↓ navigation buttons for jumping between matches — per FR-009a
- [x] T036 [US3] Implement useMessageFilter hook in src/hooks/useMessageFilter.ts: combines slider level + keyword filter, loads messages from IndexedDB into memory on conversation selection, applies filterBySweetness then filterByKeyword, useDeferredValue for non-blocking UI, returns filteredMessages array and filteredCount, updates reactively when new scores arrive (useLiveQuery) — per FR-009 and research.md R4
- [x] T037 [US3] Implement useSearch hook in src/hooks/useSearch.ts: manages search query state, generates highlight ranges (text.split with regex for <mark> wrapping), current match index, navigateToNext/navigateToPrev functions for ↑↓ buttons, scrollToIndex integration with Virtuoso
- [x] T038 [US3] Create filter status display in src/components/filter/FilterStatus.tsx: shows "Đang hiển thị X/Y tin nhắn" count that updates when slider or search changes, empty state message when no results at current level ("Không tìm thấy tin nhắn sến ở mức này 🥲") — per FR-017 and US3 scenario 4
- [x] T039 [US3] Integrate slider, search bar, and filter status into viewer screen in App.tsx: add filter bar (slider + search + status) above chat list, connect useMessageFilter to chat list data source, ensure slider at 0 works immediately after parsing (no AI needed), slider 1-5 activates after first AI batch completes

**Checkpoint**: User Story 3 fully functional — slider at 0 shows all messages, slider 1-5 filters by sweetness, keyword search highlights, count updates <100ms. Testable with mock scored data.

---

## Phase 6: User Story 4 — Message Display & Browsing (Priority: P4)

**Goal**: Beautiful Messenger-style chat bubble view with date grouping, sweetness indicators, virtualized 60fps scrolling for 50K+ messages

**Independent Test**: Static list of 1,000+ mock messages → chat bubbles with left/right alignment, date separators between days, sweetness hearts on scored messages, smooth scrolling at 60fps.

### Implementation for User Story 4

- [x] T040 [P] [US4] Create chat bubble component in src/components/chat/ChatBubble.tsx: Messenger-style bubbles with Tailwind — own messages right-aligned (bg-blue-500 text-white rounded-2xl rounded-br-md), other's left-aligned (bg-gray-100 text-gray-900 rounded-2xl rounded-bl-md), sender name above bubble, timestamp below, max-w-[85%] sm:max-w-[75%], highlight support (<mark> for search matches), non-text message type indicators (📷 photo, 🎥 video, etc.) — per research.md R6
- [x] T041 [P] [US4] Create date separator component in src/components/chat/DateSeparator.tsx: sticky header showing Vietnamese date format ("15 tháng 2, 2026"), centered with horizontal lines, uses GroupedVirtuoso group headers — per US4 scenario 2
- [x] T042 [P] [US4] Create sweetness indicator component in src/components/chat/SweetnessIndicator.tsx: displays 1–5 heart icons (♥) matching the score, small badge positioned on the chat bubble corner, color-coded (pink gradient by level), hidden when score is 0 or null — per FR-016 and US4 scenario 4
- [x] T043 [P] [US4] Create empty state component in src/components/chat/EmptyState.tsx: friendly Vietnamese messages for different states — no messages uploaded yet, no messages at current sweetness level with "thử giảm mức sến nhé!" suggestion, no search results, analysis in progress encouragement
- [x] T044 [US4] Implement virtualized chat list with GroupedVirtuoso in src/components/chat/ChatList.tsx: GroupedVirtuoso from react-virtuoso, group by date for DateSeparator headers, render ChatBubble per item, defaultItemHeight={72}, followOutput for auto-scroll to bottom, scroll-to-index API for search navigation, Participant.isCurrentUser for left/right alignment — per research.md R3
- [x] T045 [US4] Implement useVirtualizedChat hook in src/hooks/useVirtualizedChat.ts: prepares GroupedVirtuoso data from filtered messages — group messages by date, compute groupCounts and group labels (Vietnamese date), provide scrollToIndex callback, manage Virtuoso ref
- [x] T046 [US4] Compose full chat viewer screen in src/components/chat/ChatViewer.tsx: combines ChatList + SweetnessSlider + SearchBar + FilterStatus + AnalysisProgress into one cohesive screen, responsive layout (filter bar sticky top, chat list fills remaining height, progress indicator overlay), keyboard shortcut for search (Ctrl+F)

**Checkpoint**: User Story 4 fully functional — beautiful chat bubbles, date separators, sweetness hearts, 60fps virtualized scrolling. All 4 user stories work together end-to-end.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Final quality pass across all user stories

- [x] T047 [P] Mobile-responsive design polish across all screens in src/components/: test on 360px–768px viewports, ensure touch-friendly slider, readable bubbles, collapsible filter bar on small screens
- [x] T048 [P] Error handling and edge case polish in src/: memory pressure warning for 100K+ messages (FR edge case), single-participant conversation notice, multi-language conversation handling, clear previous data on new upload (FR-018)
- [x] T049 Performance optimization: verify <2MB bundle (FR constraint), add lazy loading for settings/guide screens, confirm <100ms slider filtering with 50K messages, 60fps scroll performance audit
- [x] T050 Run quickstart.md validation checklist: npm run dev starts, upload page renders Vietnamese, drag-and-drop JSON export works, conversation picker appears, chat viewer shows messages, API key → analysis starts, slider filters, search highlights, `npm run build` succeeds

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately
- **Foundational (Phase 2)**: Depends on Phase 1 — **BLOCKS all user stories**
- **US1 (Phase 3)**: Depends on Phase 2 — no other story dependencies
- **US2 (Phase 4)**: Depends on Phase 2 — service layer independent of US1, but integration needs parsed messages
- **US3 (Phase 5)**: Level 0 depends on US1 (parsed messages), Levels 1-5 depend on US2 (scored messages)
- **US4 (Phase 6)**: Display components independent of other stories, full integration depends on US3 (filtered data source)
- **Polish (Phase 7)**: Depends on all user stories being complete

### User Story Dependencies

```
Phase 1 (Setup)
    │
    ▽
Phase 2 (Foundational) ← BLOCKS EVERYTHING
    │
    ├──────────────────────┐
    ▽                      ▽
Phase 3 (US1: Upload)   Phase 4 (US2: AI) ← services are independent
    │                      │                   but integration needs US1
    ├──────────────────────┘
    ▽
Phase 5 (US3: Filter) ← level 0 needs US1, levels 1-5 need US2
    │
    ▽
Phase 6 (US4: Display) ← full integration needs US3
    │
    ▽
Phase 7 (Polish)
```

### Within Each User Story

- Types/interfaces before implementations
- Utility functions before services that use them
- Services before UI components that consume them
- Hooks before screen composition
- Core implementation before App.tsx wiring
- [P] tasks within same phase can run in parallel

### Parallel Opportunities

**Phase 1 parallel batch**:

```
T002 (Tailwind) | T003 (ESLint) | T004 (directories)
```

**Phase 2 parallel batch**:

```
T005 (types) | T006 (i18n)
T009 (Layout) | T010 (ErrorBoundary)  ← after T005
```

**US1 parallel batch**:

```
T012 (parser types) | T013 (decode util)
T017 (onboarding)   | T018 (upload area)  ← after T012
```

**US2 parallel batch**:

```
T024 (Gemini service) | T025 (rate limiter)
T027 (API key input)  | T028 (API key guide)
```

**US3 parallel batch**:

```
T033 (filter logic) | T034 (slider) | T035 (search bar)
```

**US4 parallel batch**:

```
T040 (ChatBubble) | T041 (DateSeparator) | T042 (SweetnessIndicator) | T043 (EmptyState)
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational
3. Complete Phase 3: User Story 1 (Upload & Parse)
4. **STOP and VALIDATE**: Upload a Facebook JSON export → see conversations → pick one → see summary
5. Deployable as a "Facebook chat viewer" even without AI

### Incremental Delivery

1. **Setup + Foundational** → Project skeleton ready
2. **+ User Story 1** → Upload, parse, browse conversations (MVP!)
3. **+ User Story 2** → AI sweetness scoring runs in background
4. **+ User Story 3** → Slider filters messages, keyword search
5. **+ User Story 4** → Beautiful Messenger-style chat bubbles, 60fps scroll
6. **+ Polish** → Mobile-responsive, edge cases, performance verified
7. Each increment is independently deployable and adds user value

### Suggested Commit Strategy

- Commit after each completed task or logical group
- Tag after each user story checkpoint for easy rollback
- Each user story = one deployable increment

---

## Notes

- No test tasks generated (not explicitly requested). Add Vitest unit tests and Playwright E2E tests in Phase 7 if needed.
- All UI text must be Vietnamese — use i18n strings from T006, not hardcoded English.
- The `@google/genai` SDK (NOT deprecated `@google/generative-ai`) must be used — per research.md R2.
- Facebook JSON exports have mojibake encoding — always apply `decodeFBString()` from T013.
- Slider level 0 = all messages (works without AI). Levels 1-5 = sweet filter (needs AI scores).
- In-memory `Array.filter()` for slider (<5ms for 50K items). No IndexedDB query per slider change.
- `thinkingBudget: 0` on Gemini calls reduces cost 3-5x — per gemini-api.md.
