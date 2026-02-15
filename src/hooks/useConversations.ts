import { useState, useCallback, useEffect } from "react";
import type {
  Conversation,
  Message,
  Participant,
  ConversationExport,
  ParsedConversation,
} from "../models/types";
import {
  saveConversation,
  saveMessages,
  getConversations,
  getMessages,
  clearAllData,
  saveUserSetting,
  getUserSettings,
} from "../services/storage/storage-service";

interface UseConversationsReturn {
  conversations: Conversation[];
  selectedConversation: Conversation | null;
  messages: Message[];
  isLoading: boolean;
  selectConversation: (conv: Conversation) => void;
  storeExport: (exp: ConversationExport) => Promise<Conversation[]>;
  clearAll: () => Promise<void>;
}

/**
 * Heuristic: participant who sent the most messages is isCurrentUser.
 */
function computeParticipants(parsed: ParsedConversation): Participant[] {
  const sendCounts = new Map<string, number>();
  for (const msg of parsed.messages) {
    sendCounts.set(msg.sender, (sendCounts.get(msg.sender) ?? 0) + 1);
  }

  let maxSender = "";
  let maxCount = 0;
  for (const [sender, count] of sendCounts) {
    if (count > maxCount) {
      maxSender = sender;
      maxCount = count;
    }
  }

  return parsed.participants.map((p) => ({
    name: p.name,
    isCurrentUser: p.name === maxSender,
  }));
}

export function useConversations(): UseConversationsReturn {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Load persisted conversations on mount
  useEffect(() => {
    void (async () => {
      const stored = await getConversations();
      setConversations(stored);

      // Restore last selected conversation
      const settings = getUserSettings();
      if (settings.lastConversationId) {
        const last = stored.find((c) => c.id === settings.lastConversationId);
        if (last) {
          setSelectedConversation(last);
          const msgs = await getMessages(last.id);
          setMessages(msgs);
        }
      }
    })();
  }, []);

  const selectConversation = useCallback(async (conv: Conversation) => {
    setIsLoading(true);
    setSelectedConversation(conv);
    saveUserSetting("lastConversationId", conv.id);

    const msgs = await getMessages(conv.id);
    setMessages(msgs);
    setIsLoading(false);
  }, []);

  const storeExport = useCallback(async (exp: ConversationExport): Promise<Conversation[]> => {
    setIsLoading(true);
    await clearAllData();

    const storedConvs: Conversation[] = [];

    for (const parsed of exp.conversations) {
      const participants = computeParticipants(parsed);
      const conversation: Conversation = {
        id: parsed.id,
        title: parsed.title,
        participants,
        messageCount: parsed.messages.length,
        dateRange: parsed.dateRange,
        sourceFormat: exp.sourceFormat,
        analyzedAt: null,
        analysisProgress: 0,
      };

      await saveConversation(conversation);
      storedConvs.push(conversation);

      // Create Message entities
      const msgs: Message[] = parsed.messages.map((pm, idx) => ({
        id: `${parsed.id}_${idx}`,
        conversationId: parsed.id,
        sender: pm.sender,
        timestamp: pm.timestamp,
        content: pm.content,
        type: pm.type,
        isUnsent: pm.isUnsent,
        order: pm.order,
        sweetnessScore: null,
        batchId: null,
      }));

      await saveMessages(msgs);
    }

    setConversations(storedConvs);
    setIsLoading(false);
    return storedConvs;
  }, []);

  const clearAll = useCallback(async () => {
    await clearAllData();
    setConversations([]);
    setSelectedConversation(null);
    setMessages([]);
    saveUserSetting("lastConversationId", null);
  }, []);

  return {
    conversations,
    selectedConversation,
    messages,
    isLoading,
    selectConversation: (conv: Conversation) => void selectConversation(conv),
    storeExport,
    clearAll,
  };
}
