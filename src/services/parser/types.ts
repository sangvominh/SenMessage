import type { ConversationExport } from "../../models/types";

/**
 * Unified parser interface for Facebook Messenger exports.
 * Per parser-interface.md contract.
 */
export interface ChatExportParser {
  /** Detect if this parser can handle the given files */
  canParse(files: File[]): Promise<boolean>;

  /** Parse uploaded files into a ConversationExport */
  parse(files: File[], onProgress?: (progress: number) => void): Promise<ConversationExport>;
}

/**
 * Parse error with user-friendly Vietnamese message.
 */
export class ParseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ParseError";
  }
}
