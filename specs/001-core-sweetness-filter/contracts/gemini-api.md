# Contract: Gemini Sweetness Analysis API

**Date**: 2026-02-15  
**Type**: External AI API integration  
**Provider**: Google Gemini (`gemini-2.5-flash`)  
**SDK**: `@google/genai` v1.x

## Overview

This contract defines how SenMessage communicates with the Google Gemini API to classify chat messages by sweetness level. All calls are made directly from the browser using the user's own API key (BYOK model).

## Batch Analysis Request

### Endpoint

Gemini SDK wraps the REST API. Effective call:

```typescript
ai.models.generateContent({
  model: "gemini-2.5-flash",
  contents: systemPrompt + batchPayload,
  config: {
    responseMimeType: "application/json",
    responseSchema: responseSchema,
    thinkingConfig: { thinkingBudget: 0 },
  },
});
```

### System Prompt

```text
Bạn là chuyên gia phân tích cảm xúc trong tin nhắn tiếng Việt giữa các cặp đôi.

Nhiệm vụ: Đánh giá mức độ "sến" (tình cảm, ngọt ngào, yêu thương) của từng tin nhắn.

Thang điểm 0-5:
- 0: Không sến (tin nhắn bình thường, không có cảm xúc đặc biệt)
- 1: Hơi sến nhẹ (quan tâm nhẹ nhàng: "nhớ ăn cơm nha", "về chưa?")
- 2: Sến vừa (ấm áp, quan tâm rõ ràng: "nhớ em/anh quá", "ngủ ngon nha")
- 3: Sến rõ (lãng mạn: "yêu em/anh", tỏ tình, nói lời yêu thương)
- 4: Rất sến (cảm xúc sâu sắc, đoạn văn dài tâm sự, thơ mộng)
- 5: Sến đỉnh cao (thư tình, bày tỏ cảm xúc mãnh liệt, khoảnh khắc rất riêng tư)

Lưu ý:
- Ngữ cảnh quan trọng: cùng một câu có thể sến hoặc không tùy hoàn cảnh
- Hiểu tiếng lóng Việt Nam: "iu", "thg", "ck", "vk", "bb", "sk", "haha", ...
- Sticker/emoji không tính (chỉ đánh giá text)
- Nếu tin nhắn quá ngắn hoặc không rõ nghĩa, cho điểm 0
```

### Batch Payload Format

Input to Gemini (as user message content):

```json
{
  "messages": [
    { "id": 123, "sender": "Anh", "text": "Nhớ em quá đi" },
    { "id": 124, "sender": "Em", "text": "Em cũng nhớ anh" },
    { "id": 125, "sender": "Anh", "text": "Tối nay ăn gì?" },
    { "id": 126, "sender": "Em", "text": "Gì cũng được, miễn có anh ❤️" }
  ]
}
```

**Batch size**: 100 messages per request  
**Context**: Messages are sent in chronological order within the batch. Adjacent batches share a sliding window of 5 context messages for continuity.

### Response Schema

Gemini is configured with `responseSchema` to force this exact structure:

```typescript
const responseSchema = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      id: { type: Type.NUMBER, description: "Message ID from input" },
      score: { type: Type.NUMBER, description: "Sweetness score 0-5" },
    },
    required: ["id", "score"],
  },
};
```

### Expected Response

```json
[
  { "id": 123, "score": 2 },
  { "id": 124, "score": 2 },
  { "id": 125, "score": 0 },
  { "id": 126, "score": 3 }
]
```

### Validation Rules

1. Response MUST be a valid JSON array
2. Each item MUST have `id` (number) and `score` (number)
3. `score` MUST be integer 0–5. Values outside range → clamp to 0 or 5
4. `id` MUST match an input message ID. Unknown IDs → ignore
5. Missing IDs (messages in input but not in response) → mark as score `null` (unscored), do NOT retry just for missing IDs

## Error Handling Contract

| Error                 | Detection                                                      | Action                                                                        |
| --------------------- | -------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| 429 Rate Limit        | HTTP 429 or SDK rate limit error                               | Wait `Retry-After` header or exponential backoff (1s, 2s, 4s). Max 3 retries. |
| 403 Forbidden         | HTTP 403                                                       | Invalid API key → surface to user, pause all batches                          |
| 400 Bad Request       | HTTP 400                                                       | Malformed prompt → log error, skip batch, mark failed                         |
| 500/503 Server Error  | HTTP 5xx                                                       | Retry up to 3 times with backoff                                              |
| Network Error         | Fetch failure / timeout                                        | Pause analysis, show connectivity error, offer manual retry                   |
| Invalid JSON response | JSON.parse failure (should not happen with schema enforcement) | Retry once, then mark batch failed                                            |
| Partial response      | Some message IDs missing from response                         | Accept what we got, mark missing as unscored                                  |

## Rate Limiting Strategy

```
Batch Queue: [B1, B2, B3, ..., B50]
                │
                ▽
         ┌──────────────┐
         │  Rate Limiter │  ← 15 RPM (free) or 2000 RPM (paid)
         │  (token bucket)│
         └──────┬───────┘
                │
                ▽ (1 request at a time, with delay between)
         ┌──────────────┐
         │  Gemini API   │
         └──────┬───────┘
                │
                ▽
         Score updates → IndexedDB + memory → UI re-render
```

- **Free tier**: 1 request every 4 seconds (15 RPM)
- **Paid tier**: Burst up to concurrency limit
- Implement as a simple queue with `setTimeout` delay between requests
- On 429 error: pause queue, wait, resume

## Security Contract

1. API key MUST be stored in `localStorage` only — never in URL, cookies, or transmitted to any non-Gemini server
2. Message text sent to Gemini MUST contain only the text content field — no timestamps, no participant real names (use generic "Anh"/"Em" or "Person A"/"Person B")
3. The Gemini API call is made directly from the browser (`fetch` to `generativelanguage.googleapis.com`) — no proxy server involved
4. If the user clears their API key, all pending batches MUST be cancelled immediately

## Token Budget Estimation

| Component                                 | Tokens       |
| ----------------------------------------- | ------------ |
| System prompt                             | ~300         |
| 100 messages × ~65 tokens/msg             | ~6,500       |
| Total input per batch                     | ~6,800       |
| Response (100 × `{id, score}`)            | ~300         |
| **Total per batch**                       | **~7,100**   |
| **Total for 5,000 messages (50 batches)** | **~355,000** |
