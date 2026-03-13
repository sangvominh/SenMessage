import type { Conversation } from "../../models/types";
import { vi } from "../../i18n/vi";

interface ConversationSummaryProps {
  conversation: Conversation;
  onViewMessages: () => void;
}

// Cache the formatter to avoid expensive re-initialization
const dateFormatter = new Intl.DateTimeFormat("vi-VN", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

function formatDateRange(start: number, end: number): string {
  const startStr = dateFormatter.format(start);
  const endStr = dateFormatter.format(end);
  return startStr === endStr ? startStr : `${startStr} — ${endStr}`;
}

export default function ConversationSummary({
  conversation,
  onViewMessages,
}: ConversationSummaryProps) {
  return (
    <div className="p-4">
      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
        <h2 className="text-xl font-bold text-gray-800 mb-4 text-center">{conversation.title}</h2>

        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500">{vi.summary.participants}</span>
            <span className="text-gray-800 font-medium text-right">
              {conversation.participants.map((p) => p.name).join(", ")}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">{vi.summary.messageCount}</span>
            <span className="text-gray-800 font-medium">
              {conversation.messageCount.toLocaleString("vi-VN")}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">{vi.summary.dateRange}</span>
            <span className="text-gray-800 font-medium text-right">
              {formatDateRange(conversation.dateRange.start, conversation.dateRange.end)}
            </span>
          </div>
        </div>

        <button
          onClick={onViewMessages}
          className="mt-6 w-full py-3 bg-blue-500 text-white rounded-full font-medium hover:bg-blue-600 transition-colors"
        >
          {vi.summary.viewMessages}
        </button>
      </div>
    </div>
  );
}
