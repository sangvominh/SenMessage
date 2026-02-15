import { vi } from "../../i18n/vi";

interface FilterStatusProps {
  shown: number;
  total: number;
  level: number;
  hasSearch: boolean;
}

export default function FilterStatus({ shown, total, level, hasSearch }: FilterStatusProps) {
  if (shown === total && level === 0 && !hasSearch) return null;

  return (
    <div className="px-4 py-1 text-center">
      {shown === 0 ? (
        <p className="text-sm text-gray-400">
          {hasSearch ? vi.filter.noSearchResults : vi.filter.noResults}
          {!hasSearch && level > 1 && (
            <span className="block text-xs mt-0.5">{vi.filter.tryLower}</span>
          )}
        </p>
      ) : (
        <p className="text-xs text-gray-400">{vi.filter.showing(shown, total)}</p>
      )}
    </div>
  );
}
