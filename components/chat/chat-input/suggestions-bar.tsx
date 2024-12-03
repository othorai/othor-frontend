// components/chat/chat-input/suggestions-bar.tsx
import { Star } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { SuggestionsBarProps } from '@/types/chat';

export function SuggestionsBar({
  suggestions,
  onSuggestionClick,
  isLoading,
  show
}: SuggestionsBarProps) {
  if (!show || suggestions.length === 0) {
    return null;
  }

  return (
    <div className="px-4 py-2 flex gap-2 overflow-x-auto border-t">
      <div className="flex gap-2 pb-2 overflow-x-auto hide-scrollbar">
        {suggestions.map((suggestion, index) => (
          <Button
            key={index}
            variant="outline"
            className="flex items-center gap-2 whitespace-nowrap"
            onClick={() => onSuggestionClick(suggestion)}
            disabled={isLoading}
          >
            <Star size={16} />
            <span className="text-sm">{suggestion}</span>
          </Button>
        ))}
      </div>
    </div>
  );
}