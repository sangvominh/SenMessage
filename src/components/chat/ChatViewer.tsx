import { useEffect, useCallback, useState, type ReactNode } from "react";
import type { Conversation, Message, Participant } from "../../models/types";
import { useMessageFilter } from "../../hooks/useMessageFilter";
import { useSearch } from "../../hooks/useSearch";
import { useAnalysis } from "../../hooks/useAnalysis";
import { useLocalScoring } from "../../hooks/useLocalScoring";
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
  const localScoring = useLocalScoring(messages);
  const filter = useMessageFilter(messages);
  const search = useSearch(filter.filteredMessages);
  const analysis = useAnalysis();
  const [showAiOption, setShowAiOption] = useState(true);

  // Start AI analysis only when user explicitly requests it
  const handleStartAiAnalysis = useCallback(() => {
    if (apiKey && messages.length > 0) {
      analysis.startAnalysis(messages, conversation.id, apiKey, participants);
      setShowAiOption(false);
    }
  }, [apiKey, messages, conversation.id, participants, analysis]);

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

  const isAiRunning = analysis.state === "running";
  const isAiComplete = analysis.state === "completed";

  return (
    <div className="flex flex-col h-[calc(100vh-3.5rem)]">
      {/* Scoring status bar */}
      {localScoring.state === "done" && !isAiRunning && !isAiComplete && showAiOption ? (
        <div className="px-4 py-2.5 bg-gradient-to-r from-green-50 to-emerald-50 border-b border-green-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-base">✨</span>
              <span className="text-green-700 text-xs font-medium">
                Đã chấm điểm sến {localScoring.scoredCount.toLocaleString("vi-VN")} tin nhắn (từ điển)
              </span>
            </div>
            {apiKey ? (
              <button
                onClick={handleStartAiAnalysis}
                className="text-xs text-purple-600 hover:text-purple-700 font-medium px-3 py-1 border border-purple-200 rounded-full bg-white hover:bg-purple-50 transition-colors"
              >
                🤖 Phân tích sâu hơn bằng AI
              </button>
            ) : (
              <span className="text-xs text-gray-400">
                Thêm API key ở ⚙️ để dùng AI
              </span>
            )}
          </div>
        </div>
      ) : null}

      {/* AI Analysis progress (when running) */}
      {(isAiRunning || isAiComplete || analysis.error) && (
        <AnalysisProgress
          messagesAnalyzed={analysis.progress?.messagesAnalyzed ?? 0}
          messagesTotal={analysis.progress?.messagesTotal ?? 0}
          batchesCompleted={analysis.progress?.batchesCompleted ?? 0}
          batchesTotal={analysis.progress?.batchesTotal ?? 0}
          isRunning={isAiRunning}
          isComplete={isAiComplete}
          error={analysis.error}
        />
      )}

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
