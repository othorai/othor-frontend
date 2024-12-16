// components/chat/chat-history/chat-group.tsx
import { ChatItem } from './chat-item';

interface ChatSession {
  id: string;
  initial_message: string;
  last_interaction: string;
  question_count: number;
}

interface ChatGroupProps {
  groupName: string;
  chats: ChatSession[];
  selectedChatId: string | null;
  onChatSelect: (id: string) => void;
}

export function ChatGroup({
  groupName,
  chats,
  selectedChatId,
  onChatSelect
}: ChatGroupProps) {
  return (
    <div className="space-y-1">
      <div className="px-4 py-2 text-xs font-medium text-gray-500">
        {groupName}
      </div>
      {chats.map((chat) => (
        <ChatItem
          key={chat.id}
          id={chat.id}
          initial_message={chat.initial_message}
          timestamp={chat.last_interaction}
          isSelected={selectedChatId === chat.id}
          question_count={chat.question_count}
          onClick={onChatSelect}
        />
      ))}
    </div>
  );
}