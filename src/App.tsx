import { useState, useCallback, useEffect } from "react";
import type { AppScreen, Conversation } from "./models/types";
import ErrorBoundary from "./components/common/ErrorBoundary";
import Layout from "./components/common/Layout";
import OnboardingScreen from "./components/upload/OnboardingScreen";
import UploadArea from "./components/upload/UploadArea";
import ConversationPicker from "./components/conversation/ConversationPicker";
import ConversationSummary from "./components/conversation/ConversationSummary";
import ChatViewer from "./components/chat/ChatViewer";
import ApiKeyInput from "./components/common/ApiKeyInput";
import ApiKeyGuide from "./components/common/ApiKeyGuide";
import { useFileUpload } from "./hooks/useFileUpload";
import { useConversations } from "./hooks/useConversations";
import { useApiKey } from "./hooks/useApiKey";
import { vi } from "./i18n/vi";

function App() {
  const [screen, setScreen] = useState<AppScreen>("onboarding");
  const upload = useFileUpload();
  const convs = useConversations();
  const apiKeyHook = useApiKey();

  // When upload succeeds, store and transition
  useEffect(() => {
    if (upload.state === "success" && upload.result) {
      void (async () => {
        const stored = await convs.storeExport(upload.result!);
        if (stored.length === 1) {
          // Auto-select if only one conversation
          convs.selectConversation(stored[0]!);
          setScreen("viewer");
        } else if (stored.length > 1) {
          setScreen("picker");
        }
      })();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [upload.state, upload.result]);

  const handleStart = useCallback(() => {
    setScreen("upload");
  }, []);

  const handleConversationSelected = useCallback(
    (conversation: Conversation) => {
      convs.selectConversation(conversation);
      setScreen("viewer");
    },
    [convs],
  );

  const handleViewMessages = useCallback(() => {
    setScreen("viewer");
  }, []);

  const handleUploadNew = useCallback(() => {
    upload.reset();
    void convs.clearAll();
    setScreen("upload");
  }, [upload, convs]);

  const handleSettingsClick = useCallback(() => {
    setScreen("settings");
  }, []);

  const handleSettingsBack = useCallback(() => {
    if (convs.selectedConversation) {
      setScreen("viewer");
    } else {
      setScreen("upload");
    }
  }, [convs.selectedConversation]);

  const renderScreen = () => {
    switch (screen) {
      case "onboarding":
        return (
          <Layout showSettings={false}>
            <OnboardingScreen onStart={handleStart} />
          </Layout>
        );

      case "upload":
        return (
          <Layout showSettings={false}>
            <UploadArea
              onFilesSelected={upload.handleFiles}
              onPasteText={upload.handlePaste}
              isLoading={upload.state === "parsing"}
              progress={upload.progress}
              error={upload.error}
            />
          </Layout>
        );

      case "picker":
        return (
          <Layout onSettingsClick={handleSettingsClick}>
            {convs.selectedConversation ? (
              <ConversationSummary
                conversation={convs.selectedConversation}
                onViewMessages={handleViewMessages}
              />
            ) : (
              <ConversationPicker
                conversations={convs.conversations}
                onSelect={handleConversationSelected}
              />
            )}
          </Layout>
        );

      case "viewer":
        return (
          <Layout onSettingsClick={handleSettingsClick} onUploadNew={handleUploadNew} showUploadNew>
            {convs.selectedConversation ? (
              <ChatViewer
                conversation={convs.selectedConversation}
                messages={convs.messages}
                participants={convs.selectedConversation.participants}
                apiKey={apiKeyHook.apiKey}
              />
            ) : (
              <div className="p-4 text-center text-gray-500">{vi.empty.noUpload}</div>
            )}
          </Layout>
        );

      case "settings":
        return (
          <Layout showSettings={false}>
            <div className="p-4 space-y-6">
              <button onClick={handleSettingsBack} className="text-blue-500 hover:text-blue-600">
                ← {vi.settings.back}
              </button>
              <h2 className="text-xl font-bold text-gray-800">{vi.settings.title}</h2>
              <ApiKeyInput
                currentKey={apiKeyHook.apiKey}
                onSave={apiKeyHook.saveKey}
                onClear={apiKeyHook.clearKey}
              />
              <ApiKeyGuide />
            </div>
          </Layout>
        );

      default:
        return null;
    }
  };

  return <ErrorBoundary>{renderScreen()}</ErrorBoundary>;
}

export default App;
