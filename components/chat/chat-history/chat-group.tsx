// components/chat/chat-history/chat-group.tsx
import { ChatItem } from './chat-item';

interface ChatSession {
  id: string;
  title: string;
  timestamp: string;
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
    <div>
      <div className="px-4 py-2 text-xs font-medium text-gray-500 sticky top-0 bg-white z-10">
        {groupName}
      </div>
      {chats.map((chat) => (
        <ChatItem
          key={chat.id}
          id={chat.id}
          title={chat.title}
          timestamp={chat.timestamp}
          isSelected={selectedChatId === chat.id}
          onClick={onChatSelect}
        />
      ))}
    </div>
  );
}