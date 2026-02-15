import { useState, useCallback, useMemo } from "react";
import type { Message } from "../models/types";
import type { ReactNode } from "react";

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

interface UseSearchReturn {
  query: string;
  setQuery: (q: string) => void;
  matchIndices: number[];
  matchCount: number;
  currentMatch: number;
  navigateNext: () => void;
  navigatePrev: () => void;
  highlightText: (text: string) => ReactNode[];
  scrollTargetIndex: number | null;
}

export function useSearch(filteredMessages: Message[]): UseSearchReturn {
  const [query, setQuery] = useState("");
  const [currentMatch, setCurrentMatch] = useState(0);

  // Find indices of matching messages within filteredMessages
  const matchIndices = useMemo(() => {
    if (!query.trim()) return [];
    const lower = query.toLowerCase();
    const indices: number[] = [];
    filteredMessages.forEach((m, i) => {
      if (m.content?.toLowerCase().includes(lower)) {
        indices.push(i);
      }
    });
    return indices;
  }, [filteredMessages, query]);

  const matchCount = matchIndices.length;

  const navigateNext = useCallback(() => {
    if (matchCount === 0) return;
    setCurrentMatch((prev) => (prev + 1) % matchCount);
  }, [matchCount]);

  const navigatePrev = useCallback(() => {
    if (matchCount === 0) return;
    setCurrentMatch((prev) => (prev - 1 + matchCount) % matchCount);
  }, [matchCount]);

  // Reset current match when query or results change
  const handleSetQuery = useCallback((q: string) => {
    setQuery(q);
    setCurrentMatch(0);
  }, []);

  // Highlight matching text
  const highlightText = useCallback(
    (text: string): ReactNode[] => {
      if (!query.trim()) return [text];
      const regex = new RegExp(`(${escapeRegex(query)})`, "gi");
      const parts = text.split(regex);
      return parts.map((part, i) =>
        regex.test(part) ? { type: "mark", key: i, text: part } : part,
      ) as unknown as ReactNode[];
    },
    [query],
  );

  const scrollTargetIndex = matchCount > 0 ? (matchIndices[currentMatch] ?? null) : null;

  return {
    query,
    setQuery: handleSetQuery,
    matchIndices,
    matchCount,
    currentMatch,
    navigateNext,
    navigatePrev,
    highlightText,
    scrollTargetIndex,
  };
}
