'use client';

import React, { createContext, useContext, useState } from 'react';

interface Article {
  id: string;
  title: string;
  content: string;
  graph_data: Record<string, any>;
  source_info: any;
  category: string;
  time_period: string;
  context: string;
  isLiked: boolean;
}

interface HomeContextType {
  narratives: Article[];
  setNarratives: (narratives: Article[]) => void;
  lastFetchDate: string | null;
  setLastFetchDate: (date: string) => void;
  suggestedQuestions: Record<string, string[]>;
  setSuggestedQuestions: (articleId: string, questions: string[]) => void;
  clearCache: () => void;
}

const HomeContext = createContext<HomeContextType | undefined>(undefined);

export function HomeProvider({ children }: { children: React.ReactNode }) {
  const [narratives, setNarratives] = useState<Article[]>([]);
  const [lastFetchDate, setLastFetchDate] = useState<string | null>(null);
  const [suggestedQuestions, setSuggestedQuestionsState] = useState<Record<string, string[]>>({});

  const setSuggestedQuestions = (articleId: string, questions: string[]) => {
    setSuggestedQuestionsState(prev => ({
      ...prev,
      [articleId]: questions
    }));
  };

  const clearCache = () => {
    setNarratives([]);
    setLastFetchDate(null);
    setSuggestedQuestionsState({});
  };

  return (
    <HomeContext.Provider
      value={{
        narratives,
        setNarratives,
        lastFetchDate,
        setLastFetchDate,
        suggestedQuestions,
        setSuggestedQuestions,
        clearCache
      }}
    >
      {children}
    </HomeContext.Provider>
  );
}

export function useHome() {
  const context = useContext(HomeContext);
  if (context === undefined) {
    throw new Error('useHome must be used within a HomeProvider');
  }
  return context;
}