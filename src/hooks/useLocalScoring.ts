import { useState, useCallback, useEffect, useRef } from "react";
import type { Message } from "../models/types";
import { scoreAllMessages } from "../services/scoring/local-scorer";
import { updateScores } from "../services/storage/storage-service";

type LocalScoringState = "idle" | "scoring" | "done";

interface UseLocalScoringReturn {
  state: LocalScoringState;
  scoredCount: number;
  totalCount: number;
}

/**
 * Hook that runs the local dictionary-based scorer on all messages.
 * Executes instantly and writes scores to IndexedDB.
 * Only scores messages that don't already have a score.
 */
export function useLocalScoring(messages: Message[]): UseLocalScoringReturn {
  const [state, setState] = useState<LocalScoringState>("idle");
  const [scoredCount, setScoredCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const hasRun = useRef(false);

  const runScoring = useCallback(async (msgs: Message[]) => {
    // Only score messages without an existing score
    const unscored = msgs.filter((m) => m.sweetnessScore === null);
    if (unscored.length === 0) {
      setState("done");
      setScoredCount(msgs.length);
      setTotalCount(msgs.length);
      return;
    }

    setState("scoring");
    setTotalCount(msgs.length);

    // Run local scorer (synchronous, instant)
    const scores = scoreAllMessages(unscored);

    // Write to IndexedDB
    const updates = Array.from(scores.entries()).map(([id, score]) => ({
      id,
      sweetnessScore: score,
      batchId: null, // null = local scoring, not AI
    }));

    if (updates.length > 0) {
      await updateScores(updates);
    }

    setScoredCount(msgs.length);
    setState("done");
  }, []);

  useEffect(() => {
    if (messages.length === 0 || hasRun.current) return;
    hasRun.current = true;
    void runScoring(messages);
  }, [messages, runScoring]);

  // Reset when conversation changes
  useEffect(() => {
    return () => {
      hasRun.current = false;
    };
  }, [messages]);

  return { state, scoredCount, totalCount };
}
