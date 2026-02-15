import { useCallback, useRef, useState, type DragEvent } from "react";
import { vi } from "../../i18n/vi";

/** Recursively read all File entries from a dropped directory */
async function readDirectoryEntries(entry: FileSystemDirectoryEntry): Promise<File[]> {
  const files: File[] = [];
  const reader = entry.createReader();

  const readBatch = (): Promise<FileSystemEntry[]> =>
    new Promise((resolve, reject) => reader.readEntries(resolve, reject));

  // readEntries returns batches of up to 100 entries — must loop
  let batch: FileSystemEntry[];
  do {
    batch = await readBatch();
    for (const child of batch) {
      if (child.isFile) {
        const file = await new Promise<File>((resolve, reject) =>
          (child as FileSystemFileEntry).file(resolve, reject),
        );
        files.push(file);
      } else if (child.isDirectory) {
        const nested = await readDirectoryEntries(child as FileSystemDirectoryEntry);
        files.push(...nested);
      }
    }
  } while (batch.length > 0);

  return files;
}

/** Filter to only message-relevant files */
function isRelevantFile(file: File): boolean {
  const name = file.name.toLowerCase();
  return name.endsWith(".json") || name.endsWith(".html") || name.endsWith(".htm");
}

interface UploadAreaProps {
  onFilesSelected: (files: File[]) => void;
  onPasteText: (text: string) => void;
  isLoading: boolean;
  progress: number | null;
  error: string | null;
}

export default function UploadArea({
  onFilesSelected,
  onPasteText,
  isLoading,
  progress,
  error,
}: UploadAreaProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [activeTab, setActiveTab] = useState<"file" | "paste">("file");
  const [pasteValue, setPasteValue] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);

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

  /** Handle dropped files or folders */
  const handleDrop = useCallback(
    async (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragOver(false);

      const items = e.dataTransfer.items;
      const allFiles: File[] = [];

      if (items && items.length > 0) {
        // Use webkitGetAsEntry to detect directories
        const entries: FileSystemEntry[] = [];
        for (let i = 0; i < items.length; i++) {
          const entry = items[i]?.webkitGetAsEntry?.();
          if (entry) entries.push(entry);
        }

        for (const entry of entries) {
          if (entry.isDirectory) {
            const dirFiles = await readDirectoryEntries(entry as FileSystemDirectoryEntry);
            allFiles.push(...dirFiles.filter(isRelevantFile));
          } else if (entry.isFile) {
            const file = await new Promise<File>((resolve, reject) =>
              (entry as FileSystemFileEntry).file(resolve, reject),
            );
            if (isRelevantFile(file)) allFiles.push(file);
          }
        }
      } else {
        // Fallback: plain file list
        allFiles.push(...Array.from(e.dataTransfer.files).filter(isRelevantFile));
      }

      if (allFiles.length > 0) {
        onFilesSelected(allFiles);
      }
    },
    [onFilesSelected],
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files ? Array.from(e.target.files) : [];
      if (files.length > 0) {
        onFilesSelected(files.filter(isRelevantFile));
      }
      // Reset so re-selecting the same files triggers onChange
      e.target.value = "";
    },
    [onFilesSelected],
  );

  const handleFolderInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files ? Array.from(e.target.files) : [];
      const relevant = files.filter(isRelevantFile);
      if (relevant.length > 0) {
        onFilesSelected(relevant);
      }
      e.target.value = "";
    },
    [onFilesSelected],
  );

  const handlePasteSubmit = useCallback(() => {
    if (pasteValue.trim().length > 0) {
      onPasteText(pasteValue.trim());
    }
  }, [pasteValue, onPasteText]);

  return (
    <div className="p-4">
      <h2 className="text-lg font-semibold text-gray-800 mb-4 text-center">{vi.upload.title}</h2>

      {/* Tab selector */}
      <div className="flex gap-1 mb-4 bg-gray-100 rounded-xl p-1">
        <button
          type="button"
          onClick={() => setActiveTab("file")}
          className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
            activeTab === "file"
              ? "bg-white text-blue-600 shadow-sm"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          📁 File / Thư mục
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("paste")}
          className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
            activeTab === "paste"
              ? "bg-white text-blue-600 shadow-sm"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          📋 Dán tin nhắn
        </button>
      </div>

      {activeTab === "file" ? (
        <>
          {/* Drag & Drop zone */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`
              border-2 border-dashed rounded-2xl p-10 text-center transition-all
              ${isDragOver ? "border-blue-500 bg-blue-50" : "border-gray-300 bg-white"}
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
                <p className="text-gray-400 text-sm mb-4">{vi.upload.or}</p>

                <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
                  <button
                    type="button"
                    onClick={() => folderInputRef.current?.click()}
                    className="px-5 py-2.5 bg-blue-500 text-white rounded-full text-sm font-medium hover:bg-blue-600 transition-colors"
                  >
                    {vi.upload.selectFolder}
                  </button>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-5 py-2.5 bg-white text-blue-500 border border-blue-300 rounded-full text-sm font-medium hover:bg-blue-50 transition-colors"
                  >
                    {vi.upload.selectFile}
                  </button>
                </div>

                <p className="text-gray-400 text-xs mt-4">{vi.upload.acceptedFormats}</p>
                <p className="text-gray-400 text-xs mt-1">{vi.upload.folderHint}</p>
              </>
            )}
          </div>
        </>
      ) : (
        /* Paste text area */
        <div className="space-y-3">
          <p className="text-sm text-gray-500">
            Copy tin nhắn từ messenger.com rồi dán vào đây. Định dạng: <code className="bg-gray-100 px-1 rounded">Tên: nội dung</code>
          </p>
          <textarea
            value={pasteValue}
            onChange={(e) => setPasteValue(e.target.value)}
            placeholder={"Ví dụ:\nAnh: Em ơi nhớ em quá\nEm: Em cũng nhớ anh\nAnh: Yêu em nhiều lắm ❤️"}
            className="w-full h-48 p-4 border border-gray-300 rounded-2xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-400"
            disabled={isLoading}
          />
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400">
              {pasteValue.trim().length > 0
                ? `${pasteValue.split("\n").filter((l) => l.trim()).length} dòng`
                : ""}
            </span>
            <button
              type="button"
              onClick={handlePasteSubmit}
              disabled={pasteValue.trim().length === 0 || isLoading}
              className="px-5 py-2.5 bg-blue-500 text-white rounded-full text-sm font-medium hover:bg-blue-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Phân tích
            </button>
          </div>
        </div>
      )}

      {error && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* File input (individual files) */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".json,.html,.htm"
        multiple
        onChange={handleFileInput}
        className="hidden"
      />

      {/* Folder input (webkitdirectory) */}
      <input
        ref={folderInputRef}
        type="file"
        // @ts-expect-error webkitdirectory is non-standard but widely supported
        webkitdirectory=""
        onChange={handleFolderInput}
        className="hidden"
      />
    </div>
  );
}
