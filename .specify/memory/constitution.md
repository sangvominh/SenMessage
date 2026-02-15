<!--
  Sync Impact Report
  ==================
  Version change: 1.0.0 → 1.1.0 (MINOR — expand sweetness scale to include 0)
  Modified principles:
    - IV. Sweetness Classification System: expanded scale from 1–5 to 0–5.
      Score 0 = "analyzed but not sweet" (neutral messages). Levels 1–5
      unchanged. This aligns the constitution with the AI prompt, data model,
      and clarification decision (slider level 0 = all messages, score 0 =
      not sweet). No impact on other principles or templates.
  Added sections: N/A
  Removed sections: N/A
  Templates requiring updates:
    - .specify/templates/plan-template.md ✅ no changes needed
    - .specify/templates/spec-template.md ✅ no changes needed
    - .specify/templates/tasks-template.md ✅ no changes needed
  Follow-up TODOs: None

  Previous Sync Impact Report (v1.0.0):
    Version change: 0.0.0 → 1.0.0 (MAJOR — initial constitution adoption)
    Modified principles: N/A (first version)
    Added sections: Core Principles, Technology & Architecture Constraints,
                    Development Workflow, Governance
-->

# SenMessage Constitution

## Core Principles

### I. Privacy-First (NON-NEGOTIABLE)

- All chat data processing MUST happen client-side (in the
  browser) by default. Raw conversation data MUST NOT be sent
  to any server owned by SenMessage.
- When AI analysis is required, only the minimal necessary text
  fragments MUST be sent to the AI provider API. Full
  conversation exports MUST NOT be transmitted wholesale.
- The application MUST NOT store, cache, or log user
  conversation data on any backend. Session data lives only in
  the user's browser memory or local storage.
- Rationale: Users are sharing intimate personal conversations.
  Trust is the foundation of this product. Any privacy
  violation destroys the core value proposition.

### II. Format-Agnostic Parsing

- The parser MUST support both Facebook/Meta export formats:
  HTML and JSON.
- Parsing logic MUST be isolated behind a unified interface so
  that adding future export formats (e.g., Instagram, Zalo,
  Telegram) requires only a new parser implementation, not
  changes to downstream analysis code.
- Each parser MUST normalize messages into a common internal
  data structure containing at minimum: sender, timestamp,
  message content, and message type (text, media, reaction).
- Malformed or incomplete export files MUST produce clear,
  user-friendly error messages — never silent failures.
- Rationale: Facebook exports vary across regions and versions.
  A robust, extensible parser is the foundation for reliable
  AI analysis downstream.

### III. AI Batch Efficiency

- The system MUST NOT send one AI prompt per message. Messages
  MUST be grouped into batches (e.g., 50–200 messages per
  batch) for sentiment/sweetness analysis.
- Each batch prompt MUST include surrounding context (a sliding
  window of messages) so the AI can evaluate tone in
  conversation context, not in isolation.
- The AI response format MUST be structured (JSON) with a
  sweetness score (1–5 scale) per message, enabling client-side
  filtering without re-querying the AI.
- The system MUST support streaming/progressive results so
  users see partial results while remaining batches are still
  processing.
- API call failures MUST be retried with exponential backoff.
  Partial results MUST be preserved — a single batch failure
  MUST NOT discard already-completed analysis.
- Rationale: Chat exports can contain tens of thousands of
  messages. Per-message prompting is prohibitively slow and
  expensive. Batch processing with structured output enables
  the sweetness-level filter to work instantly on cached
  scores.

### IV. Sweetness Classification System

- The system MUST classify messages on a discrete sweetness
  scale of 0 to 5:
  - **Level 0**: Not sweet (neutral/everyday messages with no
    romantic or affectionate sentiment — e.g., "ok", "tối
    nay ăn gì?", logistics). Score 0 means "analyzed but
    not sweet"; unanalyzed messages have no score (null).
  - **Level 1**: Friendly/casual affection (e.g., "nhớ ăn cơm
    nha", "về chưa?")
  - **Level 2**: Warm caring (e.g., "nhớ em/anh quá", "ngủ
    ngon nha")
  - **Level 3**: Clearly romantic (e.g., "yêu em/anh", love
    declarations)
  - **Level 4**: Deeply emotional (e.g., long heartfelt
    paragraphs, poetry-like expressions)
  - **Level 5**: Peak sweetness (e.g., elaborate love letters,
    deeply vulnerable emotional moments)
- The UI MUST provide a slider/filter that allows users to set
  a minimum sweetness threshold. Adjusting the slider MUST
  instantly filter displayed messages without additional API
  calls.
- Classification MUST account for Vietnamese-language nuances,
  slang, and context-dependent expressions common in
  Vietnamese romantic communication.
- Rationale: The sweetness filter is the core feature
  differentiator. A well-defined scale enables consistent AI
  labeling and a responsive, delightful user experience.

### V. User Experience Excellence

- The upload-to-results flow MUST complete within a perceived
  time of under 5 seconds for the first visible sweet messages
  (streaming/progressive rendering).
- The UI MUST be mobile-responsive — the primary use case is
  users browsing sweet messages on their phones.
- The application MUST work as a single-page web app requiring
  no installation, no account creation, and no login.
- The interface language MUST be Vietnamese by default with
  clear, casual, friendly tone matching the product's playful
  "sến" branding.
- File upload MUST support drag-and-drop and file picker, with
  clear guidance on how to export data from Facebook.
- Rationale: The target audience is everyday Vietnamese couples
  who are not necessarily tech-savvy. Friction kills adoption.

### VI. Simplicity & Incremental Delivery

- Start with the web version only. Mobile apps (if needed)
  MUST come after the web MVP is validated.
- The MVP MUST include only: file upload, parsing, AI
  analysis, sweetness filter, and message display. Additional
  features (sharing, statistics, timeline view) MUST be
  deferred to post-MVP.
- Every feature MUST be deliverable as an independent vertical
  slice — from UI to data layer — testable in isolation.
- External dependencies MUST be minimized. Prefer browser-
  native APIs over heavy libraries when possible.
- Rationale: YAGNI. Shipping a focused, polished MVP fast is
  more valuable than a feature-bloated product that never
  launches.

## Technology & Architecture Constraints

- **Platform**: Web application (SPA), no backend server for
  data processing. A minimal backend or serverless function is
  permitted ONLY for proxying AI API calls (to protect API
  keys).
- **Frontend**: Modern JavaScript/TypeScript framework (React,
  Vue, or Svelte — to be decided in planning phase).
- **AI Provider**: Google Gemini API (user-provided key, BYOK
  model). The AI integration layer MUST be abstracted behind
  an interface to allow swapping providers in the future.
- **Storage**: Browser-only (IndexedDB or localStorage for
  caching analysis results). No server-side database.
- **Deployment**: Static hosting (Vercel, Netlify, or GitHub
  Pages) with optional serverless functions for AI proxy.
- **Language**: Vietnamese as primary UI language. Code,
  comments, and documentation MUST be in English.

## Development Workflow

- All code changes MUST go through pull requests with at least
  one review before merging to main.
- Each PR MUST be scoped to a single user story or task — no
  multi-feature PRs.
- The main branch MUST always be deployable. Broken builds on
  main are treated as P0 incidents.
- Feature branches MUST follow the naming convention:
  `<issue-number>-<short-description>` (e.g.,
  `012-sweetness-filter`).
- Commit messages MUST follow Conventional Commits format
  (e.g., `feat:`, `fix:`, `docs:`, `refactor:`).
- Automated linting and formatting MUST run on every commit
  (pre-commit hooks or CI).

## Governance

- This constitution supersedes all other development practices
  and ad-hoc decisions. When in conflict, the constitution
  wins.
- Amendments require: (1) a written proposal describing the
  change and rationale, (2) review of impact on existing
  principles and templates, (3) version bump following semver
  rules documented below.
- Version policy:
  - MAJOR: Removing or fundamentally redefining a principle.
  - MINOR: Adding a new principle or materially expanding
    existing guidance.
  - PATCH: Clarifications, typo fixes, non-semantic wording
    changes.
- All PRs and code reviews MUST verify compliance with this
  constitution. Non-compliance MUST be flagged and resolved
  before merge.
- Use `.specify/` documentation for runtime development
  guidance including specs, plans, and task tracking.

**Version**: 1.1.0 | **Ratified**: 2026-02-15 | **Last Amended**: 2026-02-15
