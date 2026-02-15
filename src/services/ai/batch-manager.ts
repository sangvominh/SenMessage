import type { Message, AnalysisBatch, Participant } from "../../models/types";
import { GeminiService, type ScoreResult } from "./gemini-service";
import { RateLimiter } from "./rate-limiter";
import { saveBatches, updateBatch, updateScores } from "../storage/storage-service";

const BATCH_SIZE = 200;
const CONTEXT_WINDOW = 5;
const MAX_RETRIES = 3;
const BACKOFF_BASE_MS = 1000;

export interface BatchProgress {
  batchesCompleted: number;
  batchesTotal: number;
  messagesAnalyzed: number;
  messagesTotal: number;
}

export type BatchProgressCallback = (progress: BatchProgress) => void;
export type BatchErrorCallback = (error: string | null) => void;

/**
 * Batch manager service.
 * Creates batches, processes via Gemini with rate limiting, writes scores to IndexedDB.
 * Per gemini-api.md and data-model.md BatchStatus state machine.
 */
export class BatchManager {
  private gemini: GeminiService;
  private rateLimiter: RateLimiter;
  private cancelled = false;
  private participants: Participant[] = [];

  constructor(apiKey: string) {
    this.gemini = new GeminiService(apiKey);
    this.rateLimiter = new RateLimiter(2_500); // 30 RPM free tier for gemini-2.0-flash-lite
  }

  setParticipants(participants: Participant[]): void {
    this.participants = participants;
  }

  /**
   * Create batches from messages.
   * Filters to type === 'text' with non-null content before batching.
   */
  createBatches(messages: Message[], conversationId: string): AnalysisBatch[] {
    const textMessages = messages.filter((m) => m.type === "text" && m.content !== null);

    const batches: AnalysisBatch[] = [];
    for (let i = 0; i < textMessages.length; i += BATCH_SIZE) {
      const slice = textMessages.slice(i, i + BATCH_SIZE);
      batches.push({
        conversationId,
        messageIds: slice.map((m) => m.id),
        status: "pending",
        retryCount: 0,
        createdAt: Date.now(),
        completedAt: null,
        error: null,
      });
    }

    return batches;
  }

  /**
   * Process all batches with rate limiting and progressive updates.
   */
  async processBatches(
    batches: AnalysisBatch[],
    allMessages: Message[],
    onProgress?: BatchProgressCallback,
    onError?: BatchErrorCallback,
  ): Promise<void> {
    this.cancelled = false;

    // Store batches in IndexedDB, get auto-increment IDs
    const ids = await saveBatches(batches);
    batches.forEach((b, i) => {
      b.id = ids[i];
    });

    // Build a map for quick message lookup
    const messageMap = new Map(allMessages.map((m) => [m.id, m]));
    const textMessages = allMessages.filter((m) => m.type === "text" && m.content !== null);

    let batchesCompleted = 0;
    let messagesAnalyzed = 0;
    const messagesTotal = textMessages.length;
    const batchesTotal = batches.length;

    for (const batch of batches) {
      if (this.cancelled) break;
      if (!batch.id) continue;

      await updateBatch(batch.id, { status: "in-progress" });

      let success = false;
      let retryCount = 0;

      while (!success && retryCount <= MAX_RETRIES && !this.cancelled) {
        try {
          // Build payload: map sender names to aliases for privacy
          const batchMessages = batch.messageIds
            .map((id) => messageMap.get(id))
            .filter((m): m is Message => m !== undefined && m.content !== null);

          // Get context window from previous batch
          const firstMsg = batchMessages[0];
          const firstIdx = firstMsg ? textMessages.indexOf(firstMsg) : 0;
          const contextStart = Math.max(0, firstIdx - CONTEXT_WINDOW);
          const contextMessages = textMessages.slice(contextStart, firstIdx);

          // Use message IDs as numeric identifiers for the batch
          const numberedPayload = batchMessages.map((m, idx) => ({
            id: idx,
            sender: this.aliasSender(m.sender),
            text: m.content!,
          }));

          // Include context in prompt if available
          let finalPayload = numberedPayload;
          if (contextMessages.length > 0) {
            const contextPayload = contextMessages.map((m) => ({
              id: -1,
              sender: this.aliasSender(m.sender),
              text: m.content!,
            }));
            finalPayload = [...contextPayload, ...numberedPayload];
          }

          const results = await this.rateLimiter.enqueue(() =>
            this.gemini.analyzeBatch(finalPayload),
          );

          // Map results back to message IDs
          const scoreUpdates: {
            id: string;
            sweetnessScore: number | null;
            batchId: number | null;
          }[] = [];

          for (const r of results) {
            if (r.id < 0) continue; // Context message, skip
            const msg = batchMessages[r.id];
            if (msg) {
              scoreUpdates.push({
                id: msg.id,
                sweetnessScore: r.score,
                batchId: batch.id!,
              });
            }
          }

          // Mark missing messages as scored null
          for (const msg of batchMessages) {
            if (!scoreUpdates.some((u) => u.id === msg.id)) {
              scoreUpdates.push({
                id: msg.id,
                sweetnessScore: null,
                batchId: batch.id!,
              });
            }
          }

          if (scoreUpdates.length > 0) {
            await updateScores(scoreUpdates);
          }

          await updateBatch(batch.id, {
            status: "completed",
            completedAt: Date.now(),
          });

          success = true;
          batchesCompleted++;
          messagesAnalyzed += batchMessages.length;

          onProgress?.({
            batchesCompleted,
            batchesTotal,
            messagesAnalyzed,
            messagesTotal,
          });
        } catch (err) {
          retryCount++;
          const errorMsg = err instanceof Error ? err.message : "Unknown error";

          // Check for specific error types
          if (errorMsg.includes("403")) {
            onError?.("API key không hợp lệ.");
            await updateBatch(batch.id, { status: "failed", error: errorMsg });
            this.cancel();
            return;
          }

          // Rate limit (429) → wait 60s then retry (doesn't count as failure)
          if (errorMsg.includes("429") || errorMsg.toLowerCase().includes("rate")) {
            onError?.("Đã vượt giới hạn RPM. Đang chờ 60 giây...");
            await new Promise((resolve) => setTimeout(resolve, 60_000));
            onError?.(null); // Clear the temporary error after waiting
            retryCount--; // Don't count rate limit as a failure retry
            continue;
          }

          if (retryCount > MAX_RETRIES) {
            await updateBatch(batch.id, {
              status: "failed",
              retryCount,
              error: errorMsg,
              completedAt: Date.now(),
            });
            onError?.(errorMsg);
            batchesCompleted++;
            onProgress?.({
              batchesCompleted,
              batchesTotal,
              messagesAnalyzed,
              messagesTotal,
            });
            break;
          }

          // Exponential backoff
          const backoff = BACKOFF_BASE_MS * Math.pow(2, retryCount - 1);
          await new Promise((resolve) => setTimeout(resolve, backoff));

          await updateBatch(batch.id, { retryCount, status: "pending" });
        }
      }
    }
  }

  /** Cancel all pending work */
  cancel(): void {
    this.cancelled = true;
    this.rateLimiter.clear();
  }

  /** Map real sender names to generic aliases (privacy per gemini-api.md) */
  private aliasSender(sender: string): string {
    const current = this.participants.find((p) => p.isCurrentUser);
    if (current && sender === current.name) return "Anh";
    return "Em";
  }
}

// Re-export for convenience
export type { ScoreResult };
