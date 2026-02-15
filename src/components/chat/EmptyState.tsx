import { vi } from "../../i18n/vi";

interface EmptyStateProps {
  type: "no-upload" | "no-messages" | "no-results" | "analysis-in-progress";
  level?: number;
}

export default function EmptyState({ type, level }: EmptyStateProps) {
  switch (type) {
    case "no-upload":
      return (
        <div className="flex flex-col items-center justify-center h-64 text-center px-4">
          <div className="text-4xl mb-3">📭</div>
          <p className="text-gray-500 font-medium">{vi.empty.noUpload}</p>
          <p className="text-gray-400 text-sm mt-1">{vi.empty.noUploadHint}</p>
        </div>
      );

    case "no-messages":
      return (
        <div className="flex flex-col items-center justify-center h-64 text-center px-4">
          <div className="text-4xl mb-3">💬</div>
          <p className="text-gray-500 font-medium">{vi.empty.noMessages}</p>
        </div>
      );

    case "no-results":
      return (
        <div className="flex flex-col items-center justify-center h-64 text-center px-4">
          <div className="text-4xl mb-3">🥲</div>
          <p className="text-gray-500 font-medium">{vi.filter.noResults}</p>
          {level !== undefined && level > 1 && (
            <p className="text-gray-400 text-sm mt-1">{vi.filter.tryLower}</p>
          )}
        </div>
      );

    case "analysis-in-progress":
      return (
        <div className="flex flex-col items-center justify-center h-64 text-center px-4">
          <div className="text-4xl mb-3">🔍</div>
          <p className="text-gray-500 font-medium">{vi.empty.analysisInProgress}</p>
        </div>
      );

    default:
      return null;
  }
}
