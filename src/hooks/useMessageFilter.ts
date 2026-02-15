import { useMemo, useState, useCallback, useDeferredValue } from "react";
import type { Message } from "../models/types";
import { filterMessages } from "../utils/message-filter";
import { getUserSettings, saveUserSetting } from "../services/storage/storage-service";

interface UseMessageFilterReturn {
  sliderLevel: number;
  setSliderLevel: (level: number) => void;
  keyword: string;
  setKeyword: (kw: string) => void;
  filteredMessages: Message[];
  filteredCount: number;
  totalCount: number;
}

export function useMessageFilter(messages: Message[]): UseMessageFilterReturn {
  const [sliderLevel, setSliderLevelState] = useState<number>(() => getUserSettings().sliderLevel);
  const [keyword, setKeyword] = useState("");

  const deferredLevel = useDeferredValue(sliderLevel);
  const deferredKeyword = useDeferredValue(keyword);

  const setSliderLevel = useCallback((level: number) => {
    setSliderLevelState(level);
    saveUserSetting("sliderLevel", level);
  }, []);

  const filteredMessages = useMemo(
    () => filterMessages(messages, deferredLevel, deferredKeyword),
    [messages, deferredLevel, deferredKeyword],
  );

  return {
    sliderLevel,
    setSliderLevel,
    keyword,
    setKeyword,
    filteredMessages,
    filteredCount: filteredMessages.length,
    totalCount: messages.length,
  };
}
