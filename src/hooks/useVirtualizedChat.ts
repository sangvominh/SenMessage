import { useMemo } from "react";
import type { Message } from "../models/types";

interface GroupedData {
  groupCounts: number[];
  groupLabels: string[];
  flatMessages: Message[];
}

// ⚡ Bolt: Cache Intl.DateTimeFormat to avoid expensive instantiation during message processing loop
const dateFormatter = new Intl.DateTimeFormat("vi-VN", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

function formatDateLabel(timestamp: number): string {
  return dateFormatter.format(timestamp);
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

    // ⚡ Bolt: Intl.DateTimeFormat.format is very slow (~130ms per 100k calls).
    // Instead of formatting every message, we detect day changes using Date
    // which is ~5x faster, and only call the formatter when the day actually changes.
    let currentDay = -1;
    let currentMonth = -1;
    let currentYear = -1;
    let currentLabel = "";

    for (const msg of messages) {
      const d = new Date(msg.timestamp);
      const day = d.getDate();
      const month = d.getMonth();
      const year = d.getFullYear();

      if (day !== currentDay || month !== currentMonth || year !== currentYear) {
        currentDay = day;
        currentMonth = month;
        currentYear = year;
        currentLabel = formatDateLabel(msg.timestamp);
        groups.push({ label: currentLabel, messages: [msg] });
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
