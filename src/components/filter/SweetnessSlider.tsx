import { vi } from "../../i18n/vi";

interface SweetnessSliderProps {
  level: number;
  onChange: (level: number) => void;
}

const LABELS = [
  vi.filter.allMessages,
  vi.filter.level1,
  vi.filter.level2,
  vi.filter.level3,
  vi.filter.level4,
  vi.filter.level5,
];

export default function SweetnessSlider({ level, onChange }: SweetnessSliderProps) {
  return (
    <div className="px-4 py-2">
      <div className="flex items-center gap-3">
        <input
          type="range"
          min={0}
          max={5}
          step={1}
          value={level}
          onChange={(e) => { onChange(Number(e.target.value)); }}
          className="flex-1 h-2 rounded-full appearance-none cursor-pointer accent-pink-500"
          style={{
            background: `linear-gradient(to right, #3b82f6 0%, #ec4899 ${level * 20}%, #e5e7eb ${level * 20}%, #e5e7eb 100%)`,
          }}
          aria-label="Mức độ sến"
          aria-valuemin={0}
          aria-valuemax={5}
          aria-valuenow={level}
          aria-valuetext={LABELS[level]}
        />
        <span className="text-sm font-medium text-gray-700 min-w-[80px] text-right">
          {level === 0 ? LABELS[0] : `${"♥".repeat(level)} ${LABELS[level] ?? ""}`}
        </span>
      </div>
    </div>
  );
}
