import { useState, useEffect } from "react";
import { vi } from "../../i18n/vi";

interface AnalysisProgressProps {
  messagesAnalyzed: number;
  messagesTotal: number;
  batchesCompleted: number;
  batchesTotal: number;
  isRunning: boolean;
  isComplete: boolean;
  error: string | null;
  onRetry?: () => void;
}

/** Format seconds to mm:ss */
function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function AnalysisProgress({
  messagesAnalyzed,
  messagesTotal,
  batchesCompleted,
  batchesTotal,
  isRunning,
  isComplete,
  error,
  onRetry,
}: AnalysisProgressProps) {
  const [elapsedSec, setElapsedSec] = useState(0);

  // Elapsed time counter
  useEffect(() => {
    if (!isRunning) {
      setElapsedSec(0);
      return;
    }
    setElapsedSec(0);
    const interval = setInterval(() => setElapsedSec((s) => s + 1), 1000);
    return () => clearInterval(interval);
  }, [isRunning]);

  // Don't show anything if idle and nothing done
  if (!isRunning && !isComplete && !error && messagesAnalyzed === 0) return null;

  const progress = messagesTotal > 0 ? messagesAnalyzed / messagesTotal : 0;
  const pct = Math.round(progress * 100);

  // Estimate remaining time based on elapsed time and progress
  const etaText =
    isRunning && progress > 0 && progress < 1
      ? `~${formatTime(Math.round((elapsedSec / progress) * (1 - progress)))} còn lại`
      : null;

  return (
    <div className="px-4 py-2.5 bg-gradient-to-r from-blue-50 to-purple-50 border-b border-blue-100">
      {error ? (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-base">⚠️</span>
            <span className="text-red-600 text-xs font-medium">{error}</span>
          </div>
          {onRetry && (
            <button
              onClick={onRetry}
              className="text-xs text-blue-500 hover:text-blue-600 font-medium px-3 py-1 border border-blue-200 rounded-full"
            >
              {vi.analysis.retry}
            </button>
          )}
        </div>
      ) : isComplete ? (
        <div className="flex items-center justify-center gap-2">
          <span className="text-base">✅</span>
          <span className="text-green-700 text-xs font-medium">
            {vi.analysis.completed} — {messagesAnalyzed.toLocaleString("vi-VN")} tin nhắn đã phân
            tích
          </span>
        </div>
      ) : (
        <div className="space-y-1.5">
          {/* Header row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-base animate-pulse">🔍</span>
              <span className="text-xs font-medium text-gray-700">Đang phân tích độ sến...</span>
            </div>
            <div className="flex items-center gap-3 text-xs text-gray-500">
              {etaText && <span>{etaText}</span>}
              <span className="font-mono">{formatTime(elapsedSec)}</span>
            </div>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-white/60 rounded-full h-2 shadow-inner">
            <div
              className="bg-gradient-to-r from-blue-400 to-purple-500 h-2 rounded-full transition-all duration-500 relative"
              style={{ width: `${Math.max(pct, 1)}%` }}
            >
              {isRunning && (
                <div className="absolute inset-0 rounded-full bg-white/30 animate-pulse" />
              )}
            </div>
          </div>

          {/* Detail row */}
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>
              {messagesAnalyzed.toLocaleString("vi-VN")}/{messagesTotal.toLocaleString("vi-VN")} tin
              nhắn
            </span>
            <span>
              Batch {batchesCompleted}/{batchesTotal} · {pct}%
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
