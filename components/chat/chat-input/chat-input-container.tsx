// components/chat/chat-input/chat-input-container.tsx
import { ChatInput } from './input-bar';
import { FileUpload } from './file-upload';
import { SuggestionsBar } from './suggestions-bar';
import { Message } from '@/types/chat';

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
  return (
    <div className="border-t bg-white w-full">
      <SuggestionsBar
        suggestions={suggestions}
        onSuggestionClick={(suggestion) => onSend(suggestion)}
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
            onSend={onSend}
            isLoading={isLoading}
            placeholder={
              documents.length > 0
                ? "Ask questions about your document..."
                : "Ask anything..."
            }
            disabled={isUploading}
          />
        </div>
      </div>
    </div>
  );
}