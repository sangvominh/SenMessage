interface DateSeparatorProps {
  date: string;
}

export default function DateSeparator({ date }: DateSeparatorProps) {
  return (
    <div className="flex items-center gap-3 px-4 py-3 sticky top-0 z-10 bg-gray-50/95 backdrop-blur-sm">
      <div className="flex-1 h-px bg-gray-200" />
      <span className="text-xs text-gray-400 font-medium whitespace-nowrap">{date}</span>
      <div className="flex-1 h-px bg-gray-200" />
    </div>
  );
}
