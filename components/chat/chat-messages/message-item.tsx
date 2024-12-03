// components/chat/chat-messages/message-item.tsx
import { MessageItemProps } from '@/types/chat';
import { cn } from '@/lib/utils';

export function MessageItem({ message }: MessageItemProps) {
  return (
    <div
      className={cn(
        'flex mb-4',
        message.isUser ? 'justify-end' : 'justify-start'
      )}
    >
      <div
        className={cn(
          'max-w-[80%] rounded-lg p-3',
          message.isUser 
            ? 'bg-primary text-white rounded-br-none' 
            : 'bg-gray-100 text-gray-900 rounded-bl-none'
        )}
      >
        <p className="text-sm whitespace-pre-wrap break-words">
          {message.text}
        </p>
      </div>
    </div>
  );
}