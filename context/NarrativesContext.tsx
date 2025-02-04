// context/NarrativesContext.tsx

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
  isLiked: boolean;
}

interface SuggestedQuestionsCache {
  [articleId: string]: string[];
}

interface NarrativesContextType {
  narratives: Article[];
  setNarratives: (narratives: Article[]) => void;
  lastFetchDate: string | null;
  setLastFetchDate: (date: string) => void;
  suggestedQuestions: SuggestedQuestionsCache;
  setSuggestedQuestions: (articleId: string, questions: string[]) => void;
  clearCache: () => void;
}

const NarrativesContext = createContext<NarrativesContextType | undefined>(undefined);

export function NarrativesProvider({ children }: { children: React.ReactNode }) {
  const [narratives, setNarratives] = useState<Article[]>([]);
  const [lastFetchDate, setLastFetchDate] = useState<string | null>(null);
  const [suggestedQuestions, setSuggestedQuestionsState] = useState<SuggestedQuestionsCache>({});

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
    <NarrativesContext.Provider 
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
    </NarrativesContext.Provider>
  );
}

export function useNarratives() {
  const context = useContext(NarrativesContext);
  if (context === undefined) {
    throw new Error('useNarratives must be used within a NarrativesProvider');
  }
  return context;
}