/**
 * Decode Facebook's mojibake-encoded strings.
 * Facebook JSON exports encode Vietnamese text as Latin-1 byte escapes
 * instead of proper UTF-8. E.g., "Xin chào" → "Xin ch\u00c3\u00a0o"
 *
 * Per research.md R1.
 */
export function decodeFBString(str: string): string {
  // If the string contains characters > 255, it's already properly decoded (not mojibake)
  for (let i = 0; i < str.length; i++) {
    if (str.charCodeAt(i) > 255) {
      return str;
    }
  }

  try {
    // eslint-disable-next-line @typescript-eslint/no-misused-spread
    const bytes = new Uint8Array([...str].map((c) => c.charCodeAt(0)));
    return new TextDecoder("utf-8", { fatal: true }).decode(bytes);
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
