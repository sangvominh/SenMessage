import { useState, useCallback, useEffect, useRef } from "react";
import { vi } from "../../i18n/vi";

interface SearchBarProps {
  onSearch: (query: string) => void;
  matchCount: number;
  currentMatch: number;
  onNavigateNext: () => void;
  onNavigatePrev: () => void;
}

export default function SearchBar({
  onSearch,
  matchCount,
  currentMatch,
  onNavigateNext,
  onNavigatePrev,
}: SearchBarProps) {
  const [query, setQuery] = useState("");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value;
      setQuery(val);
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        onSearch(val);
      }, 150);
    },
    [onSearch],
  );

  const handleClear = useCallback(() => {
    setQuery("");
    onSearch("");
  }, [onSearch]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter") {
        e.shiftKey ? onNavigatePrev() : onNavigateNext();
      }
      if (e.key === "Escape") {
        handleClear();
      }
    },
    [onNavigateNext, onNavigatePrev, handleClear],
  );

  // Cleanup debounce
  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  return (
    <div className="px-4 py-2">
      <div className="flex items-center gap-2 bg-gray-100 rounded-lg px-3 py-1.5">
        <svg
          className="w-4 h-4 text-gray-400 shrink-0"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
        <input
          type="text"
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder={vi.viewer.searchPlaceholder}
          className="flex-1 bg-transparent text-sm text-gray-700 placeholder-gray-400 outline-none"
        />
        {query && (
          <div className="flex items-center gap-1">
            {matchCount > 0 && (
              <span className="text-xs text-gray-500">
                {currentMatch + 1}/{matchCount}
              </span>
            )}
            <button
              onClick={onNavigatePrev}
              className="p-1 text-gray-400 hover:text-gray-600"
              aria-label="Previous match"
            >
              ↑
            </button>
            <button
              onClick={onNavigateNext}
              className="p-1 text-gray-400 hover:text-gray-600"
              aria-label="Next match"
            >
              ↓
            </button>
            <button
              onClick={handleClear}
              className="p-1 text-gray-400 hover:text-gray-600"
              aria-label="Clear search"
            >
              ✕
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
