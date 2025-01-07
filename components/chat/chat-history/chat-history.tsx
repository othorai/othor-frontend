// components/chat/chat-history/chat-history.tsx
import { MessageSquare } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { ChatGroup } from './chat-group';

interface ChatSession {
  id: string;
  initial_message: string;
  timestamp: string;
  last_interaction: string;
  question_count: number;
}

interface ChatHistoryProps {
  isLoading: boolean;
  chatHistory: ChatSession[];
  selectedChatId: string | null;
  onNewChat: () => void;
  onChatSelect: (id: string) => void;
}

export function ChatHistory({
  isLoading,
  chatHistory,
  selectedChatId,
  onNewChat,
  onChatSelect,
}: ChatHistoryProps) {
  const groupChats = (chats: ChatSession[]): [string, ChatSession[]][] => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);
    const monthAgo = new Date(today);
    monthAgo.setMonth(monthAgo.getMonth() - 1);

    const groups: Record<string, ChatSession[]> = {
      'Today': [],
      'Yesterday': [],
      'Previous 7 days': [],
      'Previous 30 Days': [],
      'Older': []
    };

    chats.forEach(chat => {
      const chatDate = new Date(chat.last_interaction);
      if (chatDate >= today) {
        groups['Today'].push(chat);
      } else if (chatDate >= yesterday) {
        groups['Yesterday'].push(chat);
      } else if (chatDate >= weekAgo) {
        groups['Previous 7 days'].push(chat);
      } else if (chatDate >= monthAgo) {
        groups['Previous 30 Days'].push(chat);
      } else {
        groups['Older'].push(chat);
      }
    });

    return Object.entries(groups).filter(([_, chats]) => chats.length > 0);
  };

  return (
    <div className="w-80 h-full border-r border-gray-200 flex flex-col bg-white">
      <Button
        onClick={onNewChat}
        className="flex items-center gap-2 m-4 w-[calc(100%-2rem)]"
        variant="outline"
      >
        <MessageSquare className="w-4 h-4" />
        Start New Chat
      </Button>

      <div className="px-4 py-2 text-base font-medium text-gray-500">
        Chat History
      </div>

      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="space-y-2 p-4">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="h-12 bg-gray-100 animate-pulse rounded-md"
              />
            ))}
          </div>
        ) : chatHistory.length === 0 ? (
          <div className="p-4 text-base text-gray-500">
            No chat history yet
          </div>
        ) : (
          <div className="space-y-4">
            {groupChats(chatHistory).map(([groupName, chats]) => (
              <ChatGroup
                key={groupName}
                groupName={groupName}
                chats={chats}
                selectedChatId={selectedChatId}
                onChatSelect={onChatSelect}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}