// context/ChatContext.tsx
'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Message, Document, ChatSession, ChatSessionHistory } from '@/types/chat';
import { API_URL } from '@/lib/config';

interface ChatContextType {
  messages: Message[];
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  chatHistory: ChatSessionHistory[];
  setChatHistory: React.Dispatch<React.SetStateAction<ChatSessionHistory[]>>;
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
  lastFetchDate: string | null;
  setLastFetchDate: (date: string | null) => void;
  clearChat: () => void;
  fetchChatHistory: () => Promise<void>;
  clearStorage: () => void; 
}

export const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [sessionId, setSessionId] = useState('');
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [showLogo, setShowLogo] = useState(true);
  const [showDocumentSidebar, setShowDocumentSidebar] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [lastFetchDate, setLastFetchDate] = useState<string | null>(null);

  const [chatHistory, setChatHistory] = useState<ChatSessionHistory[]>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('chatHistory');
      return stored ? JSON.parse(stored) : [];
    }
    return [];
  });

  useEffect(() => {
    if (chatHistory.length > 0) {
      localStorage.setItem('chatHistory', JSON.stringify(chatHistory));
    }
  }, [chatHistory]);

  const fetchChatHistory = async () => {
    try {
      // First, load from localStorage to show immediately
      const storedHistory = localStorage.getItem('chatHistory');
      if (storedHistory) {
        const parsedHistory = JSON.parse(storedHistory);
        setChatHistory(parsedHistory);
      }

      // Then fetch from API to update
      const token = localStorage.getItem('authToken');
      if (!token) return;

      const response = await fetch(`${API_URL}/chatbot/user-sessions`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch chat history');
      }

      const data = await response.json();
      
      const formattedData: ChatSessionHistory[] = data.map((item: any) => ({
        session_id: item.session_id,
        initial_message: item.initial_message || item.title || '',
        title: item.title,
        last_interaction: item.last_interaction || item.timestamp || item.updated_at,
        timestamp: item.timestamp,
        created_at: item.created_at,
        updated_at: item.updated_at,
        last_message: item.last_message,
        question_count: item.question_count || 0
      }));

      setChatHistory(formattedData);
      localStorage.setItem('chatHistory', JSON.stringify(formattedData));
    } catch (error) {
      console.error('Error fetching chat history:', error);
      // On error, keep using localStorage data if available
      const storedHistory = localStorage.getItem('chatHistory');
      if (storedHistory) {
        setChatHistory(JSON.parse(storedHistory));
      }
    }
  };

  const clearChat = () => {
    setMessages([]);
    setSessionId('');
    setSelectedChatId(null);
    setDocuments([]);
    setShowSuggestions(true);
    setShowLogo(true);
    setShowDocumentSidebar(false);
    setLastFetchDate(null);
  };

  const clearStorage = () => {
    localStorage.removeItem('chatHistory');
    setChatHistory([]);
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
        fetchChatHistory,
        clearStorage,
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