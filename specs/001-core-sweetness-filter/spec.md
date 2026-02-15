# Feature Specification: Core Sweetness Filter

**Feature Branch**: `001-core-sweetness-filter`  
**Created**: 2026-02-15  
**Status**: Draft  
**Input**: User description: "Build core feature: upload Facebook chat export, parse HTML/JSON, AI batch sweetness analysis with 5-level classification, and interactive sweetness filter slider"

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Upload & Parse Chat Export (Priority: P1)

A user exports their Facebook Messenger conversation data (via Facebook's "Download Your Information" feature) and receives either an HTML or JSON file. They visit the SenMessage web app, drag-and-drop (or pick) their export file, and see a confirmation that their conversation has been loaded with a summary: number of messages found, participants' names, and date range of the conversation.

**Why this priority**: Without parsing, no downstream feature works. This is the entry point for the entire product. A user who cannot upload and see their data confirmed will abandon the app immediately.

**Independent Test**: Can be fully tested by uploading a sample Facebook HTML export and a sample Facebook JSON export, then verifying the summary screen shows correct participant names, message count, and date range. No AI or filtering needed.

**Acceptance Scenarios**:

1. **Given** a user has a Facebook JSON export file on their device, **When** they drag the file onto the upload area, **Then** the system parses the file and displays a list of conversations found (participant names, message count per conversation).
2. **Given** a user has a Facebook HTML export file (or folder of HTML files), **When** they select it via the file picker, **Then** the system parses the HTML and displays the same conversation list as with JSON.
3. **Given** the export contains multiple conversations, **When** the conversation list is displayed, **Then** the user can select which conversation to analyze, and the system shows a summary for the selected conversation: participant names, total message count, and date range.
4. **Given** a user uploads a file that is not a valid Facebook export (e.g., a random PDF or a corrupted JSON), **When** parsing fails, **Then** the system shows a clear, friendly error message in Vietnamese explaining the file could not be read and suggests checking the export steps.
5. **Given** a user uploads a very large export (50,000+ messages across all conversations), **When** the file is parsed, **Then** a progress indicator shows parsing progress and completes within 10 seconds on a mid-range device.
6. **Given** a user has not yet uploaded anything, **When** they land on the app, **Then** they see a welcoming screen with simple step-by-step instructions (in Vietnamese) for how to export data from Facebook Messenger.
7. **Given** the export contains only one conversation, **When** it is parsed, **Then** the system skips the conversation picker and goes directly to the conversation summary.

---

### User Story 2 - AI Sweetness Analysis (Priority: P2)

After a conversation is selected, the user can immediately browse all messages at slider level 0 (full conversation viewer). Meanwhile, AI sweetness analysis begins automatically in the background. The user sees a subtle progress indicator (e.g., "Đang phân tích... 340/2,100 tin nhắn") but is NOT blocked — they can scroll, search, and read messages while analysis runs. As batches complete, sweet messages become available in the slider levels 1–5. The user does not need to configure anything — analysis begins automatically after conversation selection (provided a Gemini API key has been entered).

**Why this priority**: This is the core value proposition — turning raw chat data into curated sweet moments. Without AI analysis, the app is just a chat viewer. This depends on P1 (parsed data) but delivers the "magic" of the product.

**Independent Test**: Can be tested with pre-parsed conversation data (bypassing upload) by triggering AI analysis on a known set of messages and verifying that results return with sweetness scores in the 1–5 range, that progress updates appear incrementally, and that sweet messages display as batches complete.

**Acceptance Scenarios**:

1. **Given** a conversation has been selected and a Gemini API key is saved, **When** the conversation view loads, **Then** the user can immediately browse all messages at level 0 while AI analysis begins in the background, showing a subtle non-blocking progress indicator.
2. **Given** AI analysis is in progress, **When** the first batch of results returns, **Then** the sweetness slider (levels 1–5) becomes active, and messages with scores are filterable while remaining batches continue processing.
3. **Given** a batch of messages is sent to the AI, **When** the AI returns results, **Then** each message in the batch has a sweetness score (integer 0–5, where 0 means "analyzed but not sweet") and the original message text is preserved alongside the score.
4. **Given** an AI API call fails for a specific batch, **When** the error occurs, **Then** the system retries that batch (up to 3 times with increasing delay) without losing results from already-completed batches, and the user sees a subtle notification if retries ultimately fail for that batch.
5. **Given** a conversation contains only non-text messages (photos, stickers, reactions with no text), **When** AI analysis runs, **Then** these messages are gracefully skipped (not sent to AI) and the user is informed that no text messages were found for analysis.

---

### User Story 3 - Sweetness Level Filter (Priority: P3)

Once analysis results are available (even partial), the user sees a slider control labeled with levels 0 through 5. Level 0 (default) shows ALL messages — the full conversation as a fast, local chat viewer where the user can scroll, search, and browse faster than in Messenger (since data is local, not fetched from Meta's servers). Moving the slider to level 1 and above filters to only sweet messages at that minimum sweetness threshold. Filtering is instant — no additional AI calls are needed because scores are already cached locally.

**Why this priority**: The slider serves dual purpose: at level 0 it makes the app a useful fast local chat viewer (value even without AI), and at levels 1–5 it becomes the key differentiator for curating sweet moments. Depends on P2 (scored messages for levels 1–5) but level 0 works immediately after parsing (P1).

**Independent Test**: Can be tested with a pre-scored set of messages (mock data with known sweetness levels) plus a full conversation dataset. Level 0 shows all messages with scroll/search; levels 1–5 filter by sweetness score. No AI or file upload needed.

**Acceptance Scenarios**:

1. **Given** a conversation has been parsed (no AI analysis yet), **When** the slider is at level 0, **Then** ALL messages are displayed in chronological order, and the user can scroll and browse the full conversation.
2. **Given** the slider is at level 0, **When** the user searches for a keyword, **Then** matching messages are highlighted/filtered instantly from the local data.
3. **Given** analysis has produced messages with sweetness scores ranging from 1 to 5, **When** the user sets the slider to level 3, **Then** only messages with sweetness score ≥ 3 are displayed, and the count of visible messages updates immediately.
4. **Given** the slider is set to level 5, **When** there are no messages at that level, **Then** the app displays a friendly message like "Không tìm thấy tin nhắn sến ở mức này 🥲 — thử giảm mức sến nhé!" (No messages found at this level — try lowering the sweetness level!).
5. **Given** the slider is at level 0, **When** the user moves it to level 4, **Then** the message list updates in under 100 milliseconds with no visible loading spinner or delay.
6. **Given** AI analysis is still in progress (partial results), **When** the user adjusts the slider to level 1+, **Then** the filter applies to all currently scored results, and newly arriving results also respect the current slider position.
7. **Given** messages are displayed in the results (any slider level), **When** the user views a message that has been scored, **Then** each scored message shows: sender name, timestamp, message text, and a visual indicator of its sweetness level (e.g., heart icons, color coding, or a badge with the level number).

---

### User Story 4 - Message Display & Browsing (Priority: P4)

The user browses their filtered sweet messages in a chat-bubble style view reminiscent of a messaging app. Messages are displayed chronologically with clear visual distinction between the two participants. The user can scroll through results smoothly, and messages are grouped by date for easy navigation.

**Why this priority**: Display quality directly impacts user satisfaction and shareability. While basic display is implicit in P3, this story covers the polish: chat-bubble layout, date grouping, participant colors, and smooth scrolling for large result sets.

**Independent Test**: Can be tested with a static list of mock messages (with participant info, timestamps, and sweetness scores). Verify chat-bubble layout, date grouping, participant differentiation, and scroll performance with 1,000+ messages.

**Acceptance Scenarios**:

1. **Given** filtered sweet messages are available, **When** the user views the results, **Then** messages appear in a chat-bubble layout with left/right alignment based on sender, each bubble showing sender name, time, and message text.
2. **Given** results span multiple dates, **When** the user scrolls through messages, **Then** date separators appear between groups of messages (e.g., "15 tháng 2, 2026") for easy temporal navigation.
3. **Given** there are 500+ filtered messages, **When** the user scrolls through the list, **Then** scrolling is smooth (60 fps) with no visible jank, using virtualized rendering if needed.
4. **Given** a message has a sweetness level, **When** it is displayed, **Then** a small visual sweetness indicator appears on or near the bubble (e.g., 1–5 heart icons or a colored badge).

---

### Edge Cases

- What happens when the user uploads multiple files at once? The system accepts one upload session at a time. Multiple files from the same export (e.g., split JSON files like message_1.json + message_2.json) are merged into a single conversation. Uploading a completely new export replaces the previous one.
- What happens when the export file contains messages in multiple languages (not just Vietnamese)? The AI analysis still runs and scores what it can; non-Vietnamese messages may receive lower accuracy but are not excluded.
- What happens when the conversation has only one participant's messages (e.g., the other person never replied)? The system still parses and analyzes, but displays a notice that sweetness analysis works best with two-way conversations.
- What happens when the user's browser runs out of memory with a very large export (100,000+ messages)? The system detects memory pressure and suggests the user export a smaller date range from Facebook, displaying a user-friendly warning before crashing.
- What happens when the AI API key is invalid or rate-limited? The system displays a clear error to the user and pauses analysis, offering to retry when ready.
- What happens when the user has not entered a Gemini API key yet? The system allows file upload and parsing (P1 still works) but prompts the user to enter their key before AI analysis can begin, with a simple guide on how to get a free Gemini API key.
- What happens when the user uploads a file and then uploads a different one? The previous analysis results are cleared, and the new file's analysis begins fresh.

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: System MUST accept file uploads via drag-and-drop and file picker UI elements.
- **FR-002**: System MUST parse Facebook Messenger JSON export format and extract all conversations with their messages (sender, timestamp, message content, and message type).
- **FR-003**: System MUST parse Facebook Messenger HTML export format and extract the same normalized data as FR-002.
- **FR-004**: System MUST display a conversation picker when multiple conversations are found in the export, listing each conversation's participant names and message count. When only one conversation is found, skip the picker.
- **FR-004a**: System MUST display a conversation summary after selection: participant names, total message count, and date range.
- **FR-005**: System MUST show clear, Vietnamese-language error messages when an uploaded file cannot be parsed, including guidance on correct export procedures.
- **FR-006**: System MUST send messages to the AI in batches (not individually) for sweetness analysis, with each batch containing surrounding conversational context.
- **FR-007**: System MUST assign a sweetness score of 0 to 5 to each analyzed text message, following the classification scale defined in the constitution (Level 0: not sweet through Level 5: peak sweetness). Score 0 = analyzed but not sweet; unanalyzed messages have no score (null).
- **FR-008**: System MUST display analysis results progressively — sweet messages become filterable as each batch completes, without blocking user interaction. The user MUST be able to browse the full conversation (level 0) during analysis.
- **FR-008a**: System MUST show a subtle, non-blocking progress indicator during AI analysis (e.g., "Đang phân tích... 340/2,100") that does not obstruct conversation browsing. Future: add distraction/delight micro-features during processing (deferred post-MVP).
- **FR-009**: System MUST provide a slider UI control with levels 0–5. Level 0 displays ALL messages (full conversation view). Levels 1–5 filter to messages with sweetness score at or above that level. Filtering operates instantly on local/cached data without triggering new AI calls.
- **FR-009a**: At slider level 0, the system MUST function as a fast local chat viewer — supporting smooth scrolling and basic keyword search (simple text matching, highlights results) across the full conversation without requiring AI analysis. Advanced search features (fuzzy, regex, date-range) are deferred to future iterations.
- **FR-009b**: At slider levels 1–5, messages without a sweetness score (not yet analyzed or skipped) MUST be hidden.
- **FR-010**: System MUST display messages in a chat-bubble layout with sender differentiation (left/right alignment), timestamps, and date grouping.
- **FR-011**: System MUST skip non-text messages (photos, stickers, audio, video) during AI analysis and handle them gracefully.
- **FR-012**: System MUST retry failed AI batch requests up to 3 times with exponential backoff, preserving results from successful batches.
- **FR-013**: System MUST show a progress indicator during both file parsing and AI analysis phases.
- **FR-014**: System MUST display an onboarding screen with step-by-step instructions (in Vietnamese) for exporting data from Facebook Messenger.
- **FR-015**: System MUST process all data client-side; only minimal text fragments for AI scoring may leave the browser, sent directly to the AI provider.
- **FR-016**: System MUST display a sweetness-level visual indicator on each message bubble (hearts, color coding, or badge).
- **FR-017**: System MUST update the visible message count when the sweetness filter slider is adjusted.
- **FR-018**: System MUST clear previous analysis results when a new file is uploaded.
- **FR-019**: System MUST provide a UI for the user to enter and save their own Google Gemini API key, stored exclusively in the browser's localStorage. The key MUST NOT be sent to any server other than the Gemini API directly.
- **FR-020**: System MUST allow file upload and parsing to work without an API key. AI analysis MUST prompt for the key only when analysis is triggered.
- **FR-021**: System MUST display a brief guide (in Vietnamese) explaining how to obtain a free Google Gemini API key, accessible from the API key input screen.

### Key Entities

- **ConversationExport**: Represents the full uploaded Facebook export, which may contain one or many conversations. Key attributes: source format (HTML or JSON), total number of conversations found, total message count across all conversations.
- **Conversation**: Represents one chat between two or more participants within the export. Key attributes: participant names, message count, date range (earliest and latest message timestamps). Selection state is tracked via `lastConversationId` in UserSettings (localStorage).
- **Message**: A single message within a conversation. Key attributes: sender name, timestamp, text content, message type (text, photo, sticker, reaction, audio, video, other), original position/order in conversation.
- **ScoredMessage** _(design-time concept — implemented as optional fields on the Message entity)_: Represents a Message that has been analyzed by AI. The Message entity includes optional `sweetnessScore` (integer 0–5, where 0 = "analyzed but not sweet"; `null` = unanalyzed) and `batchId` (which AnalysisBatch produced this score). Future: may extend to negative sentiment scores (sad/angry) in later features.
- **AnalysisBatch**: A group of messages sent to the AI as one request. Key attributes: batch number, list of message IDs included, status (pending, in-progress, completed, failed), number of retries attempted.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: Users can go from file upload to seeing their first parsed messages (level 0) in under 5 seconds, and their first sweet messages (level 1+) in under 10 seconds, for conversations with up to 2,000 messages.
- **SC-002**: The sweetness filter slider updates the displayed message list in under 100 milliseconds (perceived instant).
- **SC-003**: 90% of users successfully complete the upload-to-results flow on their first attempt without external help. _(Aspirational — measured via post-MVP user testing sessions, not in-app analytics.)_
- **SC-004**: The system correctly parses both Facebook HTML and JSON export formats with a success rate of 95%+ across different regional Facebook export variations.
- **SC-005**: AI analysis processes a 5,000-message conversation within 3 minutes while showing progressive results throughout.
- **SC-006**: The app loads and is interactive within 3 seconds on a mid-range mobile device over a 4G connection.
- **SC-007**: Users report the sweetness classification as "mostly accurate" (≥ 70% agreement with their own judgment) when reviewing scored messages. _(Aspirational — measured via post-MVP user testing sessions, not in-app analytics.)_
- **SC-008**: Zero user conversation data is stored on any server — all processing verifiable as client-side only (except AI API calls containing message text fragments).

## Clarifications

### Session 2026-02-15

- Q: Who provides and pays for the AI API key? → A: BYOK (Bring Your Own Key) — user enters their own Google Gemini API key in the browser. Key stored in localStorage only. User pays their own AI costs. No backend/proxy needed.
- Q: Single conversation or multi-conversation export support? → A: Multi-conversation with picker — user can upload a full Facebook export; the app lists all conversations and lets the user select which one to analyze.
- Q: Should users see only sweet messages, or all messages? → A: Slider level 0 shows ALL messages (full conversation — fast local viewer with scroll, search, etc.). Levels 1–5 filter to sweet messages only with increasing sweetness. The app is a fast local chat viewer first, sweetness filtering is the premium layer. Future: negative scores (sad/angry) may be added as a separate feature.
- Q: Scope of text search at level 0? → A: Basic keyword search for MVP — simple search box that filters/highlights messages matching a text query on local data. No fuzzy matching, no regex, no date-range filters. Can be expanded in future iterations.
- Q: Can user interact with the app while AI analysis runs? → A: Non-blocking — user can browse/search at level 0 immediately while AI runs in background. Sweet filter (levels 1–5) populates progressively. Future: add interesting distraction/delight features during AI processing to reduce perceived wait time (deferred post-MVP).

## Assumptions

- Facebook's "Download Your Information" feature continues to produce HTML and JSON exports in the current known formats. If Facebook changes formats significantly, parser updates will be needed.
- Users have already exported their data from Facebook before visiting SenMessage — the app does not integrate with Facebook's API or automate the export process.
- The AI provider is Google Gemini. Users provide their own Gemini API key. If the provider experiences outages, the analysis feature degrades gracefully but file upload/parsing still works.
- Vietnamese is the primary language of conversations. The AI prompt will be optimized for Vietnamese text, but mixed-language conversations (Vietnamese + English) are common and should be handled reasonably.
- The 5-level sweetness scale is sufficient for MVP. User feedback may lead to scale adjustments in future iterations.
- Users typically have conversations of 500–20,000 messages. Edge cases above 50,000 messages are supported but with explicit performance disclaimers.
