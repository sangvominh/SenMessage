import { useCallback, useRef, useState, type DragEvent } from "react";
import { vi } from "../../i18n/vi";

interface UploadAreaProps {
  onFilesSelected: (files: File[]) => void;
  isLoading: boolean;
  progress: number | null;
  error: string | null;
}

export default function UploadArea({
  onFilesSelected,
  isLoading,
  progress,
  error,
}: UploadAreaProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = useCallback((e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback(
    (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragOver(false);
      const files = Array.from(e.dataTransfer.files);
      if (files.length > 0) {
        onFilesSelected(files);
      }
    },
    [onFilesSelected],
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files ? Array.from(e.target.files) : [];
      if (files.length > 0) {
        onFilesSelected(files);
      }
    },
    [onFilesSelected],
  );

  const handleClick = useCallback(() => {
    inputRef.current?.click();
  }, []);

  return (
    <div className="p-4">
      <h2 className="text-lg font-semibold text-gray-800 mb-4 text-center">{vi.upload.title}</h2>

      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
        className={`
          border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all
          ${isDragOver ? "border-blue-500 bg-blue-50" : "border-gray-300 hover:border-gray-400 bg-white"}
          ${isLoading ? "pointer-events-none opacity-60" : ""}
        `}
      >
        {isLoading ? (
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-gray-600">
              {progress !== null ? vi.upload.parseProgress(progress) : vi.upload.parsing}
            </p>
          </div>
        ) : (
          <>
            <div className="text-4xl mb-3">📁</div>
            <p className="text-gray-600 font-medium mb-1">{vi.upload.dragDrop}</p>
            <p className="text-gray-400 text-sm mb-3">{vi.upload.or}</p>
            <span className="inline-block px-4 py-2 bg-blue-500 text-white rounded-full text-sm font-medium hover:bg-blue-600 transition-colors">
              {vi.upload.selectFile}
            </span>
            <p className="text-gray-400 text-xs mt-3">{vi.upload.acceptedFormats}</p>
          </>
        )}
      </div>

      {error && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
          {error}
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept=".json,.html,.htm"
        multiple
        onChange={handleFileInput}
        className="hidden"
      />
    </div>
  );
}
