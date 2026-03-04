import { useState, useCallback } from "react";
import { vi } from "../../i18n/vi";

interface ApiKeyInputProps {
  currentKey: string | null;
  onSave: (key: string) => void;
  onClear: () => void;
}

export default function ApiKeyInput({ currentKey, onSave, onClear }: ApiKeyInputProps) {
  const [value, setValue] = useState(currentKey ?? "");
  const [showKey, setShowKey] = useState(false);

  const handleSave = useCallback(() => {
    const trimmed = value.trim();
    if (trimmed) {
      onSave(trimmed);
    }
  }, [value, onSave]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter") handleSave();
    },
    [handleSave],
  );

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-700">{vi.apiKey.title}</label>
      <p className="text-xs text-gray-500">{vi.apiKey.description}</p>
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <input
            type={showKey ? "text" : "password"}
            value={value}
            onChange={(e) => { setValue(e.target.value); }}
            onKeyDown={handleKeyDown}
            placeholder={vi.apiKey.placeholder}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 pr-16"
          />
          <button
            onClick={() => { setShowKey(!showKey); }}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-gray-500 hover:text-gray-700"
          >
            {showKey ? vi.apiKey.hide : vi.apiKey.show}
          </button>
        </div>
        <button
          onClick={handleSave}
          disabled={!value.trim()}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {vi.apiKey.save}
        </button>
      </div>
      {currentKey && (
        <button onClick={onClear} className="text-xs text-red-500 hover:text-red-600">
          {vi.apiKey.clear}
        </button>
      )}
    </div>
  );
}
