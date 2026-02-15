import type { ConversationExport } from "../../models/types";
import type { ChatExportParser } from "./types";
import { ParseError } from "./types";
import { JSONParser } from "./json-parser";
import { HTMLParser } from "./html-parser";
import { vi } from "../../i18n/vi";

/** All available parsers in resolution order */
const parsers: ChatExportParser[] = [new JSONParser(), new HTMLParser()];

/**
 * Try to parse uploaded files using available parsers.
 * Returns the first successful match per parser-interface.md resolution strategy.
 */
export async function tryParse(
  files: File[],
  onProgress?: (progress: number) => void,
): Promise<ConversationExport> {
  for (const parser of parsers) {
    const canHandle = await parser.canParse(files);
    if (canHandle) {
      return parser.parse(files, onProgress);
    }
  }

  throw new ParseError(vi.errors.parseUnknownFormat);
}
