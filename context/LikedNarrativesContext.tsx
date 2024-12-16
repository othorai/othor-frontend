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

interface LikedNarrativesContextType {
  likedNarratives: Article[];
  setLikedNarratives: (narratives: Article[]) => void;
  lastFetchDate: string | null;
  setLastFetchDate: (date: string) => void;
  clearCache: () => void;
}

const LikedNarrativesContext = createContext<LikedNarrativesContextType | undefined>(undefined);

export function LikedNarrativesProvider({ children }: { children: React.ReactNode }) {
  const [likedNarratives, setLikedNarratives] = useState<Article[]>([]);
  const [lastFetchDate, setLastFetchDate] = useState<string | null>(null);

  const clearCache = () => {
    setLikedNarratives([]);
    setLastFetchDate(null);
  };

  return (
    <LikedNarrativesContext.Provider
      value={{
        likedNarratives,
        setLikedNarratives,
        lastFetchDate,
        setLastFetchDate,
        clearCache
      }}
    >
      {children}
    </LikedNarrativesContext.Provider>
  );
}

export function useLikedNarratives() {
  const context = useContext(LikedNarrativesContext);
  if (context === undefined) {
    throw new Error('useLikedNarratives must be used within a LikedNarrativesProvider');
  }
  return context;
}