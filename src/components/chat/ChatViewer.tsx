import { useEffect, useCallback, type ReactNode } from "react";
import type { Conversation, Message, Participant } from "../../models/types";
import { useMessageFilter } from "../../hooks/useMessageFilter";
import { useSearch } from "../../hooks/useSearch";
import { useAnalysis } from "../../hooks/useAnalysis";
import SweetnessSlider from "../filter/SweetnessSlider";
import SearchBar from "../filter/SearchBar";
import FilterStatus from "../filter/FilterStatus";
import AnalysisProgress from "../common/AnalysisProgress";
import ChatList from "./ChatList";

interface ChatViewerProps {
  conversation: Conversation;
  messages: Message[];
  participants: Participant[];
  apiKey: string | null;
}

export default function ChatViewer({
  conversation,
  messages,
  participants,
  apiKey,
}: ChatViewerProps) {
  const filter = useMessageFilter(messages);
  const search = useSearch(filter.filteredMessages);
  const analysis = useAnalysis();

  // Auto-start analysis when API key is set and messages available
  useEffect(() => {
    if (apiKey && messages.length > 0 && analysis.state === "idle") {
      analysis.startAnalysis(messages, conversation.id, apiKey, participants);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiKey, messages.length, conversation.id]);

  const handleSearch = useCallback(
    (query: string) => {
      search.setQuery(query);
      filter.setKeyword(query);
    },
    [search, filter],
  );

  // Ctrl+F handler
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "f") {
        e.preventDefault();
        // Focus search bar — let the SearchBar component handle it
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const highlightText = useCallback(
    (text: string): ReactNode[] => {
      return search.highlightText(text);
    },
    [search],
  );

  return (
    <div className="flex flex-col h-[calc(100vh-3.5rem)]">
      {/* Analysis progress (non-blocking overlay) */}
      <AnalysisProgress
        messagesAnalyzed={analysis.progress?.messagesAnalyzed ?? 0}
        messagesTotal={analysis.progress?.messagesTotal ?? 0}
        isRunning={analysis.state === "running"}
        error={analysis.error}
      />

      {/* Filter bar: slider + search + status */}
      <div className="bg-white border-b border-gray-100">
        <SweetnessSlider level={filter.sliderLevel} onChange={filter.setSliderLevel} />
        <SearchBar
          onSearch={handleSearch}
          matchCount={search.matchCount}
          currentMatch={search.currentMatch}
          onNavigateNext={search.navigateNext}
          onNavigatePrev={search.navigatePrev}
        />
        <FilterStatus
          shown={filter.filteredCount}
          total={filter.totalCount}
          level={filter.sliderLevel}
          hasSearch={search.query.length > 0}
        />
      </div>

      {/* Chat message list */}
      <div className="flex-1 overflow-hidden">
        <ChatList
          messages={filter.filteredMessages}
          participants={participants}
          scrollToIndex={search.scrollTargetIndex}
          highlightText={search.query ? highlightText : undefined}
          level={filter.sliderLevel}
        />
      </div>
    </div>
  );
}
