interface SweetnessIndicatorProps {
  score: number;
  isOwn: boolean;
}

export default function SweetnessIndicator({ score, isOwn }: SweetnessIndicatorProps) {
  if (score <= 0) return null;

  const hearts = "♥".repeat(Math.min(score, 5));

  // Color intensity by level
  const colorClass =
    score >= 5
      ? "text-rose-500"
      : score >= 4
        ? "text-pink-500"
        : score >= 3
          ? "text-pink-400"
          : score >= 2
            ? "text-pink-300"
            : "text-pink-200";

  return (
    <span
      className={`
        absolute -bottom-1 ${isOwn ? "-left-1" : "-right-1"}
        text-[10px] ${colorClass} select-none
      `}
      title={`Mức sến: ${score}/5`}
    >
      {hearts}
    </span>
  );
}
