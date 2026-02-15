import { useRef, useEffect, useCallback, type ReactNode } from "react";
import { GroupedVirtuoso, type GroupedVirtuosoHandle } from "react-virtuoso";
import type { Message, Participant } from "../../models/types";
import { useVirtualizedChat } from "../../hooks/useVirtualizedChat";
import ChatBubble from "./ChatBubble";
import DateSeparator from "./DateSeparator";
import EmptyState from "./EmptyState";

interface ChatListProps {
  messages: Message[];
  participants: Participant[];
  scrollToIndex: number | null;
  highlightText?: (text: string) => ReactNode[];
  level: number;
}

export default function ChatList({
  messages,
  participants,
  scrollToIndex,
  highlightText,
  level,
}: ChatListProps) {
  const virtuosoRef = useRef<GroupedVirtuosoHandle>(null);
  const { groupCounts, groupLabels, flatMessages } = useVirtualizedChat(messages);

  // Scroll to index when search navigates
  useEffect(() => {
    if (scrollToIndex !== null && virtuosoRef.current) {
      virtuosoRef.current.scrollToIndex({
        index: scrollToIndex,
        align: "center",
        behavior: "smooth",
      });
    }
  }, [scrollToIndex]);

  const renderGroup = useCallback(
    (index: number) => <DateSeparator date={groupLabels[index] ?? ""} />,
    [groupLabels],
  );

  const renderItem = useCallback(
    (index: number) => {
      const msg = flatMessages[index];
      if (!msg) return null;
      return <ChatBubble message={msg} participants={participants} highlightText={highlightText} />;
    },
    [flatMessages, participants, highlightText],
  );

  if (messages.length === 0) {
    return <EmptyState type={level > 0 ? "no-results" : "no-messages"} level={level} />;
  }

  return (
    <GroupedVirtuoso
      ref={virtuosoRef}
      groupCounts={groupCounts}
      groupContent={renderGroup}
      itemContent={renderItem}
      defaultItemHeight={72}
      style={{ height: "100%" }}
    />
  );
}
