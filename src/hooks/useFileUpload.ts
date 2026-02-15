import { useState, useCallback } from "react";
import type { ConversationExport } from "../models/types";
import { tryParse } from "../services/parser/parser-resolver";

type UploadState = "idle" | "parsing" | "success" | "error";

interface UseFileUploadReturn {
  state: UploadState;
  progress: number | null;
  error: string | null;
  result: ConversationExport | null;
  handleFiles: (files: File[]) => void;
  reset: () => void;
}

export function useFileUpload(): UseFileUploadReturn {
  const [state, setState] = useState<UploadState>("idle");
  const [progress, setProgress] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ConversationExport | null>(null);

  const handleFiles = useCallback((files: File[]) => {
    setState("parsing");
    setProgress(0);
    setError(null);
    setResult(null);

    tryParse(files, (p) => setProgress(p))
      .then((exportResult) => {
        setResult(exportResult);
        setState("success");
        setProgress(1);
      })
      .catch((err: unknown) => {
        const message = err instanceof Error ? err.message : "Unknown error";
        setError(message);
        setState("error");
        setProgress(null);
      });
  }, []);

  const reset = useCallback(() => {
    setState("idle");
    setProgress(null);
    setError(null);
    setResult(null);
  }, []);

  return { state, progress, error, result, handleFiles, reset };
}
