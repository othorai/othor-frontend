// components/chat/chat-history/chat-history.tsx
import { MessageSquare } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { ChatGroup } from './chat-group';

interface ChatSession {
  id: string;
  title: string;
  timestamp: string;
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

    const groups = {
      'Today': [],
      'Yesterday': [],
      'Previous 7 days': [],
      'Previous 30 Days': [],
      'Older': []
    };

    chats.forEach(chat => {
      const chatDate = new Date(chat.timestamp);
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
    <div className="w-64 border-r bg-white hidden md:flex flex-col h-full">
      {/* New Chat Button */}
      <div className="flex-shrink-0 p-4 border-b">
        <Button 
          onClick={onNewChat}
          className="w-full justify-start gap-2" 
          variant="ghost"
        >
          <MessageSquare size={20} />
          New Chat
        </Button>
      </div>

      {/* Chat History Header */}
      <div className="flex-shrink-0 px-3 py-2 text-sm font-medium text-gray-500 border-b">
        Chat History
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="p-4 space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-12 bg-gray-100 rounded-lg"></div>
              </div>
            ))}
          </div>
        ) : chatHistory.length === 0 ? (
          <div className="px-4 py-3 text-sm text-gray-500">
            No chat history yet
          </div>
        ) : (
          <div>
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