# Implementation Plan: Core Sweetness Filter

**Branch**: `001-core-sweetness-filter` | **Date**: 2026-02-15 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/001-core-sweetness-filter/spec.md`

## Summary

Build the core SenMessage MVP: a client-side web app (React + Vite + TypeScript) that lets users upload Facebook Messenger exports (HTML or JSON), browse all messages in a fast local chat viewer, and use Google Gemini AI to classify messages by sweetness level (0–5 scale). An interactive slider filters messages instantly by sweetness threshold. All processing is client-side (BYOK model — user provides their own Gemini API key). AI analysis runs non-blocking in the background while users can immediately browse/search conversations.

## Technical Context

**Language/Version**: TypeScript 5.x (strict mode)  
**Primary Dependencies**: React 18+, Vite 5+, @google/genai (Gemini SDK v1.x), Tailwind CSS, react-virtuoso, Dexie.js v4  
**Storage**: Browser-only — IndexedDB (via Dexie.js v4) for caching parsed messages and analysis results, localStorage for API key and preferences. In-memory array for real-time slider filtering.  
**Testing**: Vitest (unit + integration), Playwright (E2E)  
**Target Platform**: Modern browsers (Chrome 90+, Firefox 90+, Safari 15+, Edge 90+), mobile-responsive  
**Project Type**: Web application (frontend-only SPA, no backend)  
**Performance Goals**: <3s initial load on 4G, <100ms slider filtering, <10s parse-to-first-results for 2K messages, 60fps scrolling with virtualized lists  
**Constraints**: No server-side data storage, BYOK API key, <2MB initial bundle, offline parsing (no network for parse step)  
**Scale/Scope**: 500–50,000 messages per conversation, single user at a time, ~5 screens (onboarding, upload, conversation picker, chat viewer, settings/API key)

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

| Principle                         | Status  | Evidence                                                                                                                                    |
| --------------------------------- | ------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| I. Privacy-First (NON-NEGOTIABLE) | ✅ PASS | All parsing client-side. Only message text fragments sent to Gemini API (user's own key). No backend storage. API key in localStorage only. |
| II. Format-Agnostic Parsing       | ✅ PASS | Parser interface abstracts HTML/JSON formats. Spec requires both. Extensible design for future formats.                                     |
| III. AI Batch Efficiency          | ✅ PASS | Batch processing (50–200 msgs/batch), structured JSON response with scores, progressive results, retry with backoff.                        |
| IV. Sweetness Classification      | ✅ PASS | 5-level scale defined. Slider 0–5 (0=all). Vietnamese-aware prompting.                                                                      |
| V. User Experience Excellence     | ✅ PASS | SPA, no login, Vietnamese UI, mobile-responsive, drag-and-drop upload, progressive rendering, <5s first results.                            |
| VI. Simplicity & Incremental      | ✅ PASS | Web MVP only. 4 user stories as independent vertical slices. Minimal dependencies. YAGNI.                                                   |
| Tech Constraints: Frontend        | ✅ PASS | React + Vite + TypeScript (modern framework chosen).                                                                                        |
| Tech Constraints: AI Provider     | ✅ PASS | Google Gemini with abstracted interface. BYOK.                                                                                              |
| Tech Constraints: Storage         | ✅ PASS | Browser-only (IndexedDB + localStorage).                                                                                                    |
| Tech Constraints: Deployment      | ✅ PASS | Static hosting compatible (Vite build → Vercel/Netlify).                                                                                    |

**GATE RESULT: PASS** — No violations. Proceeding to Phase 0.

### Post-Phase 1 Re-evaluation

_Re-checked after completing research.md, data-model.md, contracts/, and quickstart.md._

| Principle                    | Status  | Post-Design Evidence                                                                                                                                                                                                                      |
| ---------------------------- | ------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| I. Privacy-First             | ✅ PASS | gemini-api.md sends only text fragments (100/batch) with generic sender names ("A","B"). Parser runs 100% client-side. Dexie stores data in browser IndexedDB only. API key in localStorage — never transmitted to any SenMessage server. |
| II. Format-Agnostic Parsing  | ✅ PASS | parser-interface.md defines `ChatExportParser` interface with `canParse()`/`parse()` methods. JSON + HTML parsers normalize to common `Message` entity. Adding new formats requires only a new parser class.                              |
| III. AI Batch Efficiency     | ✅ PASS | 100 msgs/batch. `AnalysisBatch` entity tracks state machine (pending→processing→completed/failed). Structured JSON output via `responseSchema`. Retry with exponential backoff. Progressive results via `useLiveQuery()`.                 |
| IV. Sweetness Classification | ✅ PASS | Vietnamese system prompt with cultural examples for levels 1–5. Score 0 = analyzed but not sweet, null = unanalyzed. Slider 0=all, 1–5=threshold. In-memory filter <5ms.                                                                  |
| V. UX Excellence             | ✅ PASS | react-virtuoso for 60fps scrolling (50K+ items). Non-blocking AI analysis. Vietnamese UI throughout. Mobile-responsive Tailwind. Drag-and-drop upload. <5s first results target.                                                          |
| VI. Simplicity & Incremental | ✅ PASS | ~60KB gzip runtime bundle. 4 vertical slices. No backend. MVP features only (no sharing, stats, timeline).                                                                                                                                |

**POST-DESIGN GATE: PASS** — All principles upheld through detailed design. No new violations introduced.

## Project Structure

### Documentation (this feature)

```text
specs/001-core-sweetness-filter/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
│   ├── gemini-api.md    # AI batch analysis contract
│   └── parser-interface.md  # Parser interface contract
└── tasks.md             # Phase 2 output (/speckit.tasks command)
```

### Source Code (repository root)

```text
src/
├── components/          # React UI components
│   ├── upload/          # File upload, drag-and-drop
│   ├── conversation/    # Conversation picker, summary
│   ├── chat/            # Chat bubble view, virtualized list
│   ├── filter/          # Sweetness slider, search bar
│   └── common/          # Shared UI (progress, error, layout)
├── hooks/               # Custom React hooks
├── services/            # Business logic (no UI)
│   ├── parser/          # Facebook export parsers (HTML, JSON)
│   ├── ai/              # Gemini AI integration, batch manager
│   └── storage/         # IndexedDB/localStorage wrappers
├── models/              # TypeScript types & interfaces
├── utils/               # Pure utility functions
├── i18n/                # Vietnamese language strings
└── App.tsx              # Root component + routing

tests/
├── unit/                # Unit tests (parsers, models, utils)
├── integration/         # Integration tests (AI batch flow, storage)
└── e2e/                 # Playwright end-to-end tests

public/
└── assets/              # Static assets (icons, images)
```

**Structure Decision**: Frontend-only SPA (no backend directory). Single `src/` with clear separation: `components/` for UI, `services/` for business logic, `models/` for types. This is the simplest structure that supports the 4 user stories as independent vertical slices.

## Complexity Tracking

> No constitution violations detected. Table not required.
