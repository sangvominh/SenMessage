import { useMemo } from "react";
import type { Message } from "../models/types";

interface GroupedData {
  groupCounts: number[];
  groupLabels: string[];
  flatMessages: Message[];
}

function formatDateLabel(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString("vi-VN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

/**
 * Prepare data for GroupedVirtuoso: group messages by date.
 */
export function useVirtualizedChat(messages: Message[]): GroupedData {
  return useMemo(() => {
    if (messages.length === 0) {
      return { groupCounts: [], groupLabels: [], flatMessages: [] };
    }

    const groups: { label: string; messages: Message[] }[] = [];
    let currentLabel = "";

    for (const msg of messages) {
      const label = formatDateLabel(msg.timestamp);
      if (label !== currentLabel) {
        currentLabel = label;
        groups.push({ label, messages: [msg] });
      } else {
        groups[groups.length - 1]!.messages.push(msg);
      }
    }

    return {
      groupCounts: groups.map((g) => g.messages.length),
      groupLabels: groups.map((g) => g.label),
      flatMessages: groups.flatMap((g) => g.messages),
    };
  }, [messages]);
}
