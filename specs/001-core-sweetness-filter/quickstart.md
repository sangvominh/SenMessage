# Quickstart: Core Sweetness Filter

**Date**: 2026-02-15  
**Feature**: [spec.md](spec.md) | [plan.md](plan.md)

## Prerequisites

- **Node.js** 18+ (LTS recommended)
- **npm** 9+ (comes with Node.js)
- A **Google Gemini API key** (free tier available at [aistudio.google.com](https://aistudio.google.com))
- A **Facebook Messenger export** file (JSON or HTML format)

## How to Export Facebook Messenger Data

1. Go to [facebook.com/dyi](https://facebook.com/dyi) (Download Your Information)
2. Click **"Request a download"** or **"Yêu cầu tải xuống"**
3. Select **"Tin nhắn"** (Messages) only — deselect everything else for faster download
4. Choose format: **JSON** (recommended) or **HTML**
5. Select date range (or "All time" / "Tất cả")
6. Select media quality: **Low** (we only need text, this makes the download smaller)
7. Click **"Create File"** / **"Tạo file"**
8. Wait for Facebook to prepare your download (can take minutes to hours)
9. Download the ZIP file when ready
10. **Unzip the downloaded file** — the `.json` or `.html` files are inside the extracted folder

## Project Setup

```bash
# Clone the repository
git clone <repo-url>
cd SenMessage

# Install dependencies
npm install

# Start development server
npm run dev
```

The app will open at `http://localhost:5173`.

## Usage Flow

### 1. Landing Page

You'll see a welcoming screen in Vietnamese with instructions on how to export data from Facebook Messenger.

Click **"Bắt đầu"** (Get Started) to proceed.

### 2. Upload Export File

- **Drag and drop** your Facebook export file(s) onto the upload area, OR
- Click **"Chọn file"** to open the file picker
- Supported files: `.json` or `.html` from Facebook Messenger export

The app will parse the file and show a list of conversations found.

### 3. Select Conversation

If your export contains multiple conversations, you'll see a conversation picker listing:

- Participant names
- Message count per conversation

Click on the conversation you want to explore. (If only one conversation exists, this step is skipped automatically.)

### 4. Browse Messages (Level 0)

The conversation opens in a chat viewer immediately — no AI needed yet! At slider level 0 (default), you see ALL messages in a Messenger-style layout with:

- Chat bubbles (your messages right-aligned in blue, theirs left-aligned in gray)
- Date separators between message groups
- Keyword search (Ctrl+F or search bar)

### 5. Enter Gemini API Key

To analyze sweetness levels, tap the settings icon and enter your Google Gemini API key:

1. Go to [aistudio.google.com](https://aistudio.google.com)
2. Sign in with your Google account
3. Click **"Get API Key"** → **"Create API key"**
4. Copy the key and paste it into SenMessage

Your key is stored only in your browser's localStorage — never sent to any server except Google's API directly.

### 6. AI Sweetness Analysis

Once your API key is saved, analysis starts automatically in the background. You'll see a subtle progress indicator:

> **Đang phân tích... 340/2,100 tin nhắn**

You can continue browsing messages at level 0 while analysis runs. As batches complete, sweet messages become available in the slider.

### 7. Filter by Sweetness

Move the slider from 0 to 1–5 to filter messages by sweetness level:

- **Level 0**: All messages (default — fast local chat viewer)
- **Level 1**: Mildly sweet (casual affection)
- **Level 2**: Warm and caring
- **Level 3**: Clearly romantic
- **Level 4**: Deeply emotional
- **Level 5**: Peak sweetness (love letters, deeply vulnerable moments)

Filtering is instant — no additional API calls needed. The count of visible messages updates immediately.

## Validation Checklist

Use this to verify the app is working correctly after setup:

- [ ] `npm run dev` starts without errors
- [ ] Landing page renders in Vietnamese
- [ ] Drag-and-drop a Facebook JSON export → conversations listed
- [ ] Select a conversation → chat viewer shows messages with bubble layout
- [ ] Slider at level 0 → all messages visible, keyword search works
- [ ] Enter a Gemini API key → analysis starts with progress indicator
- [ ] As analysis completes → slider levels 1–5 filter sweet messages
- [ ] Moving slider → message list updates instantly (<100ms)
- [ ] `npm run build` succeeds with no errors

## Development Commands

| Command           | Purpose                          |
| ----------------- | -------------------------------- |
| `npm run dev`     | Start development server (Vite)  |
| `npm run build`   | Production build                 |
| `npm run preview` | Preview production build locally |
| `npm run lint`    | Run ESLint                       |
| `npm run format`  | Run Prettier                     |

## Tech Stack Quick Reference

| Dependency        | Version      | Purpose                    |
| ----------------- | ------------ | -------------------------- |
| React             | 18+          | UI framework               |
| Vite              | 5+           | Build tool & dev server    |
| TypeScript        | 5.x (strict) | Type safety                |
| @google/genai     | 1.x          | Gemini AI SDK (GA)         |
| react-virtuoso    | latest       | Virtualized chat list      |
| dexie             | 4.x          | IndexedDB wrapper          |
| dexie-react-hooks | latest       | Reactive IndexedDB queries |
| tailwindcss       | 4.x          | Utility-first CSS          |
