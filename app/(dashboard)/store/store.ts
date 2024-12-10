import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Article, MetricData, DataSource } from '@/types/data';
import { Message, Document, ChatSession } from '@/types/chat';

interface StoreState {
  // Narratives
  narratives: Article[];
  setNarratives: (narratives: Article[]) => void;
  suggestedQuestions: string[];  // Added for article suggestions
  setSuggestedQuestions: (questions: string[]) => void;

  // Chat
  messages: Message[];
  chatHistory: ChatSession[];
  uploadedDocuments: Document[];  // Renamed from 'documents'
  sessionId: string;
  setMessages: (messages: Message[]) => void;
  setChatHistory: (history: ChatSession[]) => void;
  setUploadedDocuments: (docs: Document[]) => void;  // Renamed from 'setDocuments'
  setSessionId: (id: string) => void;
  clearChat: () => void;

  // Metrics
  metrics: Record<string, MetricData>;
  setMetrics: (metrics: Record<string, MetricData>) => void;

  // Data Sources
  dataSources: DataSource[];
  setDataSources: (sources: DataSource[]) => void;
  
  // Clear store
  clearStore: () => void;
}

export const useStore = create<StoreState>()(
  persist(
    (set) => ({
      // Narratives
      narratives: [],
      setNarratives: (narratives) => set({ narratives }),
      suggestedQuestions: [],
      setSuggestedQuestions: (questions) => set({ suggestedQuestions: questions }),
      
      // Chat
      messages: [],
      chatHistory: [],
      uploadedDocuments: [],  // Renamed
      sessionId: '',
      setMessages: (messages) => set({ messages }),
      setChatHistory: (history) => set({ chatHistory: history }),
      setUploadedDocuments: (docs) => set({ uploadedDocuments: docs }),  // Renamed
      setSessionId: (id) => set({ sessionId: id }),
      
      // Metrics
      metrics: {},
      setMetrics: (metrics) => set({ metrics }),

      // Data Sources
      dataSources: [],
      setDataSources: (sources) => set({ dataSources: sources }),
      
      // Clear functions
      clearChat: () => set({
        messages: [],
        chatHistory: [],
        uploadedDocuments: [],  // Renamed
        sessionId: ''
      }),
      clearStore: () => set({
        narratives: [],
        suggestedQuestions: [],
        messages: [],
        chatHistory: [],
        uploadedDocuments: [],  // Renamed
        sessionId: '',
        metrics: {},
        dataSources: []
      }),
    }),
    {
      name: 'app-store'
    }
  )
);