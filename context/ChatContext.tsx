// context/ChatContext.tsx
'use client';

import React, { createContext, useContext, useState } from 'react';
import { Message, Document, ChatSession } from '@/types/chat';

interface ChatContextType {
  messages: Message[];
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  chatHistory: ChatSession[];
  setChatHistory: React.Dispatch<React.SetStateAction<ChatSession[]>>;
  sessionId: string;
  setSessionId: (id: string) => void;
  selectedChatId: string | null;
  setSelectedChatId: (id: string | null) => void;
  documents: Document[];
  setDocuments: React.Dispatch<React.SetStateAction<Document[]>>;
  suggestions: string[];
  setSuggestions: React.Dispatch<React.SetStateAction<string[]>>;
  showSuggestions: boolean;
  setShowSuggestions: (show: boolean) => void;
  showLogo: boolean;
  setShowLogo: (show: boolean) => void;
  showDocumentSidebar: boolean;
  setShowDocumentSidebar: (show: boolean) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  lastFetchDate: string | null;  // Add this
  setLastFetchDate: (date: string | null) => void;  // Add this
  clearChat: () => void;
}

export const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [chatHistory, setChatHistory] = useState<ChatSession[]>([]);
  const [sessionId, setSessionId] = useState('');
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [showLogo, setShowLogo] = useState(true);
  const [showDocumentSidebar, setShowDocumentSidebar] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [lastFetchDate, setLastFetchDate] = useState<string | null>(null);  // Add this

  const clearChat = () => {
    setMessages([]);
    setSessionId('');
    setSelectedChatId(null);
    setDocuments([]);
    setShowSuggestions(true);
    setShowLogo(true);
    setShowDocumentSidebar(false);
    setLastFetchDate(null);  // Add this
  };

  return (
    <ChatContext.Provider
      value={{
        messages,
        setMessages,
        chatHistory,
        setChatHistory,
        sessionId,
        setSessionId,
        selectedChatId,
        setSelectedChatId,
        documents,
        setDocuments,
        suggestions,
        setSuggestions,
        showSuggestions,
        setShowSuggestions,
        showLogo,
        setShowLogo,
        showDocumentSidebar,
        setShowDocumentSidebar,
        isLoading,
        setIsLoading,
        lastFetchDate,
        setLastFetchDate,
        clearChat,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}

export const useChat = () => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};