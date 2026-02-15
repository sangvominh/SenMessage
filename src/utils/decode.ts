/**
 * Decode Facebook's mojibake-encoded strings.
 * Facebook JSON exports encode Vietnamese text as Latin-1 byte escapes
 * instead of proper UTF-8. E.g., "Xin chào" → "Xin ch\u00c3\u00a0o"
 *
 * Per research.md R1.
 */
export function decodeFBString(str: string): string {
  try {
    const bytes = new Uint8Array([...str].map((c) => c.charCodeAt(0)));
    return new TextDecoder("utf-8").decode(bytes);
  } catch {
    return str; // If not mojibake, return original
  }
}

/**
 * Escape a string for safe handling (strip null bytes, etc.)
 */
export function escapeFBString(str: string): string {
  return str.replace(/\0/g, "");
}
