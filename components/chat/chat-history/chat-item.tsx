// components/chat/chat-history/chat-item.tsx
import { MessageSquare } from 'lucide-react';
import { cn } from "@/lib/utils";
import { formatDateTime } from '@/lib/utils/chat-utils';

interface ChatItemProps {
  id: string;
  initial_message: string;
  timestamp: string;
  isSelected: boolean;
  question_count: number;
  onClick: (id: string) => void;
}

export function ChatItem({
  id,
  initial_message,
  timestamp,
  isSelected,
  question_count,
  onClick
}: ChatItemProps) {
  return (
    <button
      onClick={() => onClick(id)}
      className={cn(
        "w-full text-left px-4 py-3 hover:bg-gray-100 transition-colors",
        isSelected && "bg-gray-100"
      )}
    >
      <div className="flex items-start gap-3">
        <MessageSquare className="w-4 h-4 mt-1 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="text-base font-medium truncate">
            {initial_message || 'Start New Chat'}
          </div>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs text-gray-500">
              {formatDateTime(timestamp)}
            </span>
            {question_count > 1 && (
              <span className="text-xs text-gray-400">
                {question_count} messages
              </span>
            )}
          </div>
        </div>
      </div>
    </button>
  );
}
