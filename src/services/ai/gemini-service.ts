import { GoogleGenAI, Type } from "@google/genai";

/** Score result from Gemini */
export interface ScoreResult {
  id: number;
  score: number;
}

/**
 * Gemini AI service wrapper.
 * Per contracts/gemini-api.md.
 */
export class GeminiService {
  private ai: GoogleGenAI;

  constructor(apiKey: string) {
    this.ai = new GoogleGenAI({ apiKey });
  }

  /**
   * Analyze a batch of messages and return sweetness scores.
   * Returns array of { id, score } per gemini-api.md contract.
   */
  async analyzeBatch(
    messages: { id: number; sender: string; text: string }[],
  ): Promise<ScoreResult[]> {
    const systemPrompt = `Bạn là chuyên gia phân tích cảm xúc trong tin nhắn tiếng Việt giữa các cặp đôi.

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
- Nếu tin nhắn quá ngắn hoặc không rõ nghĩa, cho điểm 0`;

    const payload = JSON.stringify({ messages });

    const response = await this.ai.models.generateContent({
      model: "gemini-2.0-flash-lite",
      contents: [
        {
          role: "user",
          parts: [{ text: systemPrompt + "\n\n" + payload }],
        },
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.NUMBER, description: "Message ID from input" },
              score: { type: Type.NUMBER, description: "Sweetness score 0-5" },
            },
            required: ["id", "score"],
          },
        },
      },
    });

    const text = response.text;
    if (!text) return [];

    let raw: unknown;
    try {
      raw = JSON.parse(text);
    } catch {
      return [];
    }
    if (!Array.isArray(raw)) return [];

    // Validate + clamp scores
    const validIds = new Set<number>();
    for (let i = 0; i < messages.length; i++) {
      validIds.add(messages[i].id);
    }
    const results: ScoreResult[] = [];

    for (const item of raw) {
      if (
        typeof item === "object" &&
        item !== null &&
        "id" in item &&
        "score" in item &&
        typeof (item as ScoreResult).id === "number" &&
        typeof (item as ScoreResult).score === "number"
      ) {
        const { id, score } = item as ScoreResult;
        if (!validIds.has(id)) continue; // Unknown ID → ignore
        results.push({
          id,
          score: Math.max(0, Math.min(5, Math.round(score))),
        });
      }
    }

    return results;
  }
}
