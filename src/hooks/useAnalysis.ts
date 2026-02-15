import { useState, useCallback, useRef, useEffect } from "react";
import type { Message, Participant } from "../models/types";
import { BatchManager, type BatchProgress } from "../services/ai/batch-manager";

type AnalysisState = "idle" | "running" | "paused" | "completed" | "error";

interface UseAnalysisReturn {
  state: AnalysisState;
  progress: BatchProgress | null;
  error: string | null;
  startAnalysis: (
    messages: Message[],
    conversationId: string,
    apiKey: string,
    participants: Participant[],
  ) => void;
  cancel: () => void;
}

export function useAnalysis(): UseAnalysisReturn {
  const [state, setState] = useState<AnalysisState>("idle");
  const [progress, setProgress] = useState<BatchProgress | null>(null);
  const [error, setError] = useState<string | null>(null);
  const managerRef = useRef<BatchManager | null>(null);

  const cancel = useCallback(() => {
    managerRef.current?.cancel();
    managerRef.current = null;
    setState("idle");
  }, []);

  const startAnalysis = useCallback(
    (messages: Message[], conversationId: string, apiKey: string, participants: Participant[]) => {
      // Cancel any existing analysis
      managerRef.current?.cancel();

      const manager = new BatchManager(apiKey);
      manager.setParticipants(participants);
      managerRef.current = manager;

      setState("running");
      setError(null);
      setProgress(null);

      const batches = manager.createBatches(messages, conversationId);

      if (batches.length === 0) {
        setState("completed");
        setProgress({
          batchesCompleted: 0,
          batchesTotal: 0,
          messagesAnalyzed: 0,
          messagesTotal: 0,
        });
        return;
      }

      void manager
        .processBatches(
          batches,
          messages,
          (p) => setProgress(p),
          (err) => {
            setError(err);
            setState("error");
          },
        )
        .then(() => {
          if (managerRef.current === manager) {
            setState("completed");
          }
        })
        .catch((err: unknown) => {
          const msg = err instanceof Error ? err.message : "Unknown error";
          setError(msg);
          setState("error");
        });
    },
    [],
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      managerRef.current?.cancel();
    };
  }, []);

  return { state, progress, error, startAnalysis, cancel };
}
