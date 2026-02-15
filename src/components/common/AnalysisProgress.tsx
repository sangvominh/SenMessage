import { vi } from "../../i18n/vi";

interface AnalysisProgressProps {
  messagesAnalyzed: number;
  messagesTotal: number;
  isRunning: boolean;
  error: string | null;
  onRetry?: () => void;
}

export default function AnalysisProgress({
  messagesAnalyzed,
  messagesTotal,
  isRunning,
  error,
  onRetry,
}: AnalysisProgressProps) {
  if (!isRunning && !error && messagesAnalyzed === 0) return null;

  const progress = messagesTotal > 0 ? messagesAnalyzed / messagesTotal : 0;
  const isComplete = messagesAnalyzed >= messagesTotal && messagesTotal > 0;

  return (
    <div className="px-4 py-2 bg-white/90 backdrop-blur-sm border-b border-gray-100">
      {error ? (
        <div className="flex items-center justify-between">
          <span className="text-red-600 text-xs">
            {vi.analysis.failed}: {error}
          </span>
          {onRetry && (
            <button
              onClick={onRetry}
              className="text-xs text-blue-500 hover:text-blue-600 font-medium"
            >
              {vi.analysis.retry}
            </button>
          )}
        </div>
      ) : isComplete ? (
        <div className="text-xs text-green-600 text-center">{vi.analysis.completed}</div>
      ) : (
        <div className="space-y-1">
          <div className="text-xs text-gray-500 text-center">
            {vi.analysis.progress(messagesAnalyzed, messagesTotal)}
          </div>
          <div className="w-full bg-gray-100 rounded-full h-1">
            <div
              className="bg-blue-500 h-1 rounded-full transition-all duration-300"
              style={{ width: `${progress * 100}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
