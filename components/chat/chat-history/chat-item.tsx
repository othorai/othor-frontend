// components/chat/chat-history/chat-item.tsx
import { MessageSquare } from 'lucide-react';
import { cn } from "@/lib/utils";
import { formatDateTime } from '@/lib/utils/chat-utils';

interface ChatItemProps {
  id: string;
  title: string;
  timestamp: string;
  isSelected: boolean;
  onClick: (id: string) => void;
}

export function ChatItem({ 
  id, 
  title, 
  timestamp, 
  isSelected, 
  onClick 
}: ChatItemProps) {
  return (
    <button
      onClick={() => onClick(id.replace(/[{}-]/g, ''))} // Clean the UUID format
      className={cn(
        "w-full text-left px-4 py-3 hover:bg-gray-100 transition-colors",
        isSelected && "bg-gray-100"
      )}
    >
      <div className="flex flex-col gap-1">
        <div className="flex items-center space-x-2">
          <MessageSquare className="w-4 h-4 flex-shrink-0 text-gray-500" />
          <span className="truncate text-sm">{title || 'New Chat'}</span>
        </div>
        <span className="text-xs text-gray-500">
          {formatDateTime(timestamp)}
        </span>
      </div>
    </button>
  );
}