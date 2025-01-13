import { useEffect, useState } from 'react';
import { ChatInput } from './input-bar';
import { FileUpload } from './file-upload';
import { SuggestionsBar } from './suggestions-bar';
import { Message } from '@/types/chat';
import { useChatRateLimit } from '@/components/settings/hooks/use-chat-rate-limit';
import { useToast } from "@/hooks/use-toast";

interface ChatInputContainerProps {
  inputText: string;
  setInputText: (text: string) => void;
  onSend: (text?: string) => Promise<void>;
  onFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
  isLoading: boolean;
  isUploading: boolean;
  suggestions: string[];
  showSuggestions: boolean;
  documents: { id: string; filename: string; }[];
  maxFileSize: number;
}

export function ChatInputContainer({
  inputText,
  setInputText,
  onSend,
  onFileUpload,
  isLoading,
  isUploading,
  suggestions,
  showSuggestions,
  documents,
  maxFileSize
}: ChatInputContainerProps) {
  const { toast } = useToast();
  const {
    canSendMessage,
    incrementMessageCount,
    getRemainingMessages,
    getTimeUntilReset,
    maxMessagesPerHour
  } = useChatRateLimit();

  const [timeUntilReset, setTimeUntilReset] = useState<string>('');

  useEffect(() => {
    const updateTimeUntilReset = () => {
      const msLeft = getTimeUntilReset();
      const minutesLeft = Math.ceil(msLeft / 60000);
      setTimeUntilReset(
        minutesLeft > 0 ? `${minutesLeft} minute${minutesLeft !== 1 ? 's' : ''}` : 'less than a minute'
      );
    };

    const interval = setInterval(updateTimeUntilReset, 60000); // Update every minute
    updateTimeUntilReset(); // Initial update

    return () => clearInterval(interval);
  }, [getTimeUntilReset]);

  const handleSend = async (text?: string) => {
    if (!canSendMessage()) {
      toast({
        variant: "destructive",
        title: "Rate limit reached",
        description: `Please wait ${timeUntilReset} before sending more messages.`
      });
      return;
    }

    incrementMessageCount();
    await onSend(text);
  };

  const remainingMessages = getRemainingMessages();
  const showRateLimit = maxMessagesPerHour !== null;

  return (
    <div className="absolute bottom-0 left-0 right-0 border-t bg-white">
      {showRateLimit && (
        <div className="px-4 py-1 text-xs text-muted-foreground text-right">
          {remainingMessages === 0 ? (
            `Rate limit reached. Reset in ${timeUntilReset}.`
          ) : (
            `${remainingMessages} message${remainingMessages !== 1 ? 's' : ''} remaining this hour`
          )}
        </div>
      )}
      <SuggestionsBar
        suggestions={suggestions}
        onSuggestionClick={(suggestion) => handleSend(suggestion)}
        isLoading={isLoading}
        show={showSuggestions}
      />
      <div className="p-4 w-full">
        <div className="flex gap-2 w-full items-center">
          <FileUpload
            onFileUpload={onFileUpload}
            isUploading={isUploading}
            maxFileSize={maxFileSize}
          />
          <ChatInput
            inputText={inputText}
            setInputText={setInputText}
            onSend={() => handleSend()}
            isLoading={isLoading}
            placeholder={
              documents.length > 0
                ? "Ask questions about your document..."
                : "Ask anything..."
            }
            disabled={isUploading || !canSendMessage()}
          />
        </div>
      </div>
    </div>
  );
}