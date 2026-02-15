import type { ReactNode } from "react";
import type { Message, Participant } from "../../models/types";
import { vi } from "../../i18n/vi";
import SweetnessIndicator from "./SweetnessIndicator";

interface ChatBubbleProps {
  message: Message;
  participants: Participant[];
  highlightText?: (text: string) => ReactNode[];
}

function formatTime(timestamp: number): string {
  return new Date(timestamp).toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getMessageTypeLabel(type: string): string | null {
  const labels = vi.messageTypes as Record<string, string | undefined>;
  return labels[type] ?? null;
}

export default function ChatBubble({ message, participants, highlightText }: ChatBubbleProps) {
  const currentUser = participants.find((p) => p.isCurrentUser);
  const isOwn = currentUser ? message.sender === currentUser.name : false;

  // Render content
  let content: ReactNode;

  if (message.isUnsent) {
    content = <p className="text-sm italic opacity-60">{vi.viewer.unsent}</p>;
  } else if (message.content) {
    if (highlightText) {
      const parts = highlightText(message.content);
      content = (
        <p className="text-sm whitespace-pre-wrap break-words">
          {parts.map((part, idx) => {
            if (
              typeof part === "object" &&
              part !== null &&
              "type" in part &&
              (part as unknown as { type: string }).type === "mark"
            ) {
              const markPart = part as unknown as { key: number; text: string };
              return (
                <mark key={markPart.key ?? idx} className="bg-yellow-200 rounded px-0.5">
                  {markPart.text}
                </mark>
              );
            }
            return part;
          })}
        </p>
      );
    } else {
      content = <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>;
    }
  } else {
    const label = getMessageTypeLabel(message.type);
    content = label ? <p className="text-sm opacity-70">{label}</p> : null;
  }

  return (
    <div className={`flex ${isOwn ? "justify-end" : "justify-start"} px-4 py-0.5`}>
      <div className="relative">
        <div
          className={`
            max-w-[85%] sm:max-w-[75%] px-3 py-2 relative
            ${
              isOwn
                ? "bg-blue-500 text-white rounded-2xl rounded-br-md"
                : "bg-gray-100 text-gray-900 rounded-2xl rounded-bl-md"
            }
          `}
        >
          {!isOwn && (
            <p
              className={`text-xs font-medium mb-0.5 ${isOwn ? "text-blue-100" : "text-gray-500"}`}
            >
              {message.sender}
            </p>
          )}
          {content}
          <span
            className={`text-[10px] block mt-0.5 ${isOwn ? "text-blue-100 text-right" : "text-gray-400"}`}
          >
            {formatTime(message.timestamp)}
          </span>
        </div>
        {message.sweetnessScore !== null && message.sweetnessScore > 0 && (
          <SweetnessIndicator score={message.sweetnessScore} isOwn={isOwn} />
        )}
      </div>
    </div>
  );
}
