import type { ReactNode } from "react";
import { vi } from "../../i18n/vi";

interface LayoutProps {
  children: ReactNode;
  onSettingsClick?: () => void;
  onUploadNew?: () => void;
  showSettings?: boolean;
  showUploadNew?: boolean;
}

export default function Layout({
  children,
  onSettingsClick,
  onUploadNew,
  showSettings = true,
  showUploadNew = false,
}: LayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
          <h1 className="text-lg font-bold text-blue-500">{vi.appName}</h1>
          <div className="flex items-center gap-2">
            {showUploadNew && onUploadNew && (
              <button
                onClick={onUploadNew}
                className="text-sm text-gray-500 hover:text-gray-700 px-2 py-1 rounded transition-colors"
                title={vi.common.uploadNew}
              >
                {vi.common.uploadNew}
              </button>
            )}
            {showSettings && onSettingsClick && (
              <button
                onClick={onSettingsClick}
                className="p-2 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100 transition-colors"
                aria-label={vi.settings.title}
                title={vi.settings.title}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 max-w-2xl mx-auto w-full">{children}</main>
    </div>
  );
}
