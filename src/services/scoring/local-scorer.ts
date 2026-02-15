/**
 * Local Vietnamese sweetness scorer.
 * Uses keyword dictionary + pattern matching for instant scoring.
 * No API calls needed — runs entirely client-side in O(n).
 */

// ============================================================
// Keyword dictionaries by sweetness level
// ============================================================

/** Level 5: Sến đỉnh cao — thư tình, bày tỏ cảm xúc mãnh liệt */
const LEVEL_5_PATTERNS: RegExp[] = [
  /yêu\s*(em|anh)\s*(nhiều|lắm|vô cùng|không thể tả|hơn tất cả)/i,
  /không\s*thể\s*(sống|thiếu|xa)\s*(thiếu|không có)?\s*(em|anh)/i,
  /(em|anh)\s*là\s*(tất cả|cả thế giới|cuộc sống|lý do|tình yêu)/i,
  /muốn\s*(bên|ở bên|ở cạnh)\s*(em|anh)\s*(suốt đời|mãi mãi|cả đời)/i,
  /(suốt đời|cả đời|mãi mãi)\s*(yêu|thương|bên|nhớ)/i,
  /em\s*(ơi)?\s*(anh)?\s*yêu\s*em\s*(rất\s*)?(nhiều|lắm)/i,
  /anh\s*(ơi)?\s*(em)?\s*yêu\s*anh\s*(rất\s*)?(nhiều|lắm)/i,
  /(cưới|lấy)\s*(em|anh)\s*(nha|nhé|đi|nghen)/i,
  /xin\s*(hứa|thề)\s*(sẽ)?\s*(yêu|thương|bảo vệ|chăm sóc)/i,
  /♥️.*♥️.*♥️/,
  /❤️.*❤️.*❤️/,
  /💕.*💕.*💕/,
];

/** Level 4: Rất sến — cảm xúc sâu sắc */
const LEVEL_4_PATTERNS: RegExp[] = [
  /yêu\s*(em|anh)\s*(nhất|nhiều|lắm)/i,
  /nhớ\s*(em|anh)\s*(quá|lắm|nhiều|ghê|kinh|khủng)/i,
  /thương\s*(em|anh)\s*(quá|lắm|nhiều|ghê)/i,
  /muốn\s*(gặp|ôm|hôn)\s*(em|anh)/i,
  /(em|anh)\s*(giỏi|ngoan|dễ thương|xinh|đẹp)\s*(lắm|quá|ghê)/i,
  /ước\s*gì\s*(được|có thể)\s*(bên|ôm|gặp)/i,
  /(ôm|hôn)\s*(em|anh)\s*(nha|nhé|đi|nghen|thật chặt)/i,
  /không\s*(muốn|nỡ)\s*(xa|rời|buông)\s*(em|anh)/i,
  /nhớ\s*(nhau|em|anh)\s*(da diết|quá chừng)/i,
  /iu\s*(em|anh|lắm|nhiều|quá)/i,
];

/** Level 3: Sến rõ — lãng mạn */
const LEVEL_3_KEYWORDS: string[] = [
  "yêu em", "yêu anh", "iu em", "iu anh", "love you",
  "thương em", "thương anh", "nhớ em", "nhớ anh",
  "bé yêu", "cưng ơi", "cưng à", "honey", "darling",
  "hôn em", "hôn anh", "muốn gặp", "muốn ôm",
  "em nhớ", "anh nhớ", "em yêu", "anh yêu",
  "tình yêu", "tình iu", "người yêu",
  "hai đứa mình", "hai ta", "chúng mình",
];

const LEVEL_3_PATTERNS: RegExp[] = [
  /\byêu\b/i,
  /\biu\b/i,
  /\bnh[oớ]\b.*\b(em|anh)\b/i,
  /\b(em|anh)\b.*\bnh[oớ]\b/i,
  /chu[ỳy]+\s*(á|nè|nha|nhé)/i,
  /😘{2,}/,
  /💋{2,}/,
  /🥰{2,}/,
];

/** Level 2: Sến vừa — ấm áp, quan tâm rõ ràng */
const LEVEL_2_KEYWORDS: string[] = [
  "ngủ ngon", "chúc ngủ", "good night", "gn",
  "nhớ ăn", "ăn cơm chưa", "ăn gì chưa", "uống nước",
  "giữ sức khỏe", "giữ gìn", "cẩn thận", "đừng thức khuya",
  "em ngoan", "anh ngoan", "bé ngoan",
  "nhớ mặc ấm", "trời lạnh", "mưa rồi",
  "chờ em", "chờ anh", "đợi em", "đợi anh",
  "về nhà cẩn thận", "đến nơi chưa", "về tới chưa",
  "ngủ sớm", "nghỉ ngơi", "đi ngủ đi",
  "cưng", "bé", "baby", "bb",
  "lo cho", "sợ em", "sợ anh",
  "nằm mơ", "mơ thấy",
];

const LEVEL_2_PATTERNS: RegExp[] = [
  /chúc\s*(em|anh)\s*(ngủ|ngon|vui)/i,
  /\b(nhớ|đừng quên)\s*(ăn|uống|ngủ|nghỉ)/i,
  /giữ\s*(gìn)?\s*sức\s*khỏe/i,
  /😘/,
  /🥰/,
  /💋/,
  /😍/,
  /💕/,
  /💗/,
  /💖/,
  /💞/,
  /💓/,
  /❤️/,
  /♥️/,
];

/** Level 1: Hơi sến nhẹ — quan tâm nhẹ nhàng */
const LEVEL_1_KEYWORDS: string[] = [
  "về chưa", "đang làm gì", "ở đâu rồi",
  "hôm nay thế nào", "hôm nay sao rồi",
  "ăn chưa", "ngủ chưa", "dậy chưa",
  "miss you", "miss u", "nhớ",
  "chào buổi sáng", "good morning",
  "chúc một ngày", "vui nha", "vui nhé",
  "bạn ơi", "này", "ê",
  "haha", "hihi", "hehe", "kaka",
  "thích", "vui ghê", "hạnh phúc",
  "cảm ơn", "thanks", "tks",
];

const LEVEL_1_PATTERNS: RegExp[] = [
  /\b(về|đi|đến)\s*(chưa|rồi|chưa vậy)\b/i,
  /\bđang\s*(làm gì|ở đâu)\b/i,
  /🤗/,
  /😊/,
  /☺️/,
  /😌/,
  /🫶/,
  /💛/,
  /💙/,
];

// ============================================================
// Scorer
// ============================================================

/**
 * Score a single message's sweetness level 0-5 using local dictionary.
 * Runs in O(patterns) per message — effectively instant.
 */
export function scoreMessage(text: string): number {
  if (!text || text.trim().length === 0) return 0;

  const normalized = text.toLowerCase().trim();

  // Check level 5 first (highest)
  for (const pattern of LEVEL_5_PATTERNS) {
    if (pattern.test(normalized)) return 5;
  }

  // Level 4
  for (const pattern of LEVEL_4_PATTERNS) {
    if (pattern.test(normalized)) return 4;
  }

  // Level 3: keywords + patterns
  for (const kw of LEVEL_3_KEYWORDS) {
    if (normalized.includes(kw.toLowerCase())) return 3;
  }
  for (const pattern of LEVEL_3_PATTERNS) {
    if (pattern.test(normalized)) return 3;
  }

  // Level 2: keywords + patterns
  for (const kw of LEVEL_2_KEYWORDS) {
    if (normalized.includes(kw.toLowerCase())) return 2;
  }
  for (const pattern of LEVEL_2_PATTERNS) {
    if (pattern.test(text)) return 2; // Emoji check on original text
  }

  // Level 1: keywords + patterns
  for (const kw of LEVEL_1_KEYWORDS) {
    if (normalized.includes(kw.toLowerCase())) return 1;
  }
  for (const pattern of LEVEL_1_PATTERNS) {
    if (pattern.test(text)) return 1;
  }

  return 0;
}

/**
 * Score all messages in bulk. Returns a Map of messageId → score.
 * Runs synchronously and instantly for any conversation size.
 */
export function scoreAllMessages(
  messages: { id: string; content: string | null; type: string }[],
): Map<string, number> {
  const scores = new Map<string, number>();

  for (const msg of messages) {
    if (msg.type !== "text" || !msg.content) {
      scores.set(msg.id, 0);
      continue;
    }
    scores.set(msg.id, scoreMessage(msg.content));
  }

  return scores;
}
