// components/chat/chat-messages/message-list.tsx
import { useEffect, useRef } from 'react';
import { MessageListProps } from '@/types/chat';
import { MessageItem } from './message-item';
import { WelcomeScreen } from './welcome-screen';

export function MessageList({ messages, showLogo }: MessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div className="flex-1 overflow-y-auto p-4 pb-32 min-h-0">
      {showLogo ? (
        <WelcomeScreen 
          logoUrl="/images/othor-logo.png"
          welcomeMessage="How can I help you today?"
        />
      ) : (
        <div className="space-y-4">
          {messages.map((message, index) => (
            <MessageItem 
              key={index} 
              message={message} 
            />
          ))}
          <div ref={messagesEndRef} />
        </div>
      )}
    </div>
  );
}