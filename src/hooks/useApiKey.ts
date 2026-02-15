import { useState, useCallback } from "react";
import {
  getUserSettings,
  saveUserSetting,
  clearApiKey as storageClearKey,
} from "../services/storage/storage-service";

interface UseApiKeyReturn {
  apiKey: string | null;
  isKeySet: boolean;
  saveKey: (key: string) => void;
  clearKey: () => void;
}

export function useApiKey(): UseApiKeyReturn {
  const [apiKey, setApiKey] = useState<string | null>(() => getUserSettings().geminiApiKey);

  const saveKey = useCallback((key: string) => {
    saveUserSetting("geminiApiKey", key);
    setApiKey(key);
  }, []);

  const clearKey = useCallback(() => {
    storageClearKey();
    setApiKey(null);
  }, []);

  return {
    apiKey,
    isKeySet: apiKey !== null && apiKey.length > 0,
    saveKey,
    clearKey,
  };
}
