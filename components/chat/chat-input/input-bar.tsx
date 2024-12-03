// components/chat/chat-input/input-bar.tsx
import { Send } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChatInputProps } from '@/types/chat';

export function ChatInput({
  inputText,
  setInputText,
  onSend,
  isLoading,
  placeholder = "Ask anything...",
  disabled = false
}: ChatInputProps) {
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };

  return (
    <div className="flex gap-2 items-center w-full">
      <Input
        value={inputText}
        onChange={(e) => setInputText(e.target.value)}
        placeholder={placeholder}
        onKeyPress={handleKeyPress}
        className="flex-1"
        disabled={disabled || isLoading}
      />
      <Button
        onClick={() => onSend()}
        disabled={disabled || isLoading || !inputText.trim()}
      >
        {isLoading ? (
          <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
        ) : (
          <Send size={20} />
        )}
      </Button>
    </div>
  );
}