// components/chat/chat-messages/welcome-screen.tsx
import Image from 'next/image';
import { WelcomeScreenProps } from '@/types/chat';

export function WelcomeScreen({ logoUrl, welcomeMessage }: WelcomeScreenProps) {
  return (
    <div className="flex flex-col items-center justify-center h-full">
      <Image
        src={logoUrl}
        alt="Logo"
        width={120}
        height={120}
        className="mb-4"
        priority
      />
      <h2 className="text-2xl font-semibold mb-4 text-gray-900">
        {welcomeMessage}
      </h2>
    </div>
  );
}