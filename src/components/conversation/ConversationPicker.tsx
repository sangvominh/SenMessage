import type { Conversation } from "../../models/types";
import { vi } from "../../i18n/vi";

interface ConversationPickerProps {
  conversations: Conversation[];
  onSelect: (conversation: Conversation) => void;
}

export default function ConversationPicker({ conversations, onSelect }: ConversationPickerProps) {
  return (
    <div className="p-4">
      <h2 className="text-lg font-semibold text-gray-800 mb-4 text-center">{vi.picker.title}</h2>
      <div className="space-y-2">
        {conversations.map((conv) => (
          <button
            key={conv.id}
            onClick={() => onSelect(conv)}
            className="w-full text-left bg-white rounded-xl p-4 border border-gray-100 hover:border-blue-300 hover:shadow-sm transition-all"
          >
            <h3 className="font-medium text-gray-800 truncate">{conv.title}</h3>
            <div className="flex items-center gap-2 mt-1 text-sm text-gray-500">
              <span>
                {vi.picker.participants}: {conv.participants.map((p) => p.name).join(", ")}
              </span>
            </div>
            <p className="text-xs text-gray-400 mt-1">
              {vi.picker.messageCount(conv.messageCount)}
            </p>
          </button>
        ))}
      </div>
    </div>
  );
}
