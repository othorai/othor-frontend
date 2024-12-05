// hooks/use-feed.ts
import { useState, useCallback } from 'react';
import { format } from 'date-fns';
import { useToast } from "@/hooks/use-toast";
import { API_URL } from '@/lib/config';
import type { 
  Article, 
  ApiError, 
  FeedResponse, 
  UseFeedReturn 
} from '@/types/feed';

export function useFeed(): UseFeedReturn {
  const [feedData, setFeedData] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const { toast } = useToast();

  const fetchData = useCallback(async (date = new Date()) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('authToken');
      const formattedDate = format(date, 'yyyy-MM-dd');
      
      const response = await fetch(`${API_URL}/narrative/feed?date=${formattedDate}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (!response.ok) {
        const errorData = await response.json() as ApiError;
        throw new Error(errorData.message || 'Failed to fetch narratives');
      }
      
      const data = await response.json() as FeedResponse;
      
      if (data.articles && Array.isArray(data.articles)) {
        setFeedData(data.articles.map(article => ({
          ...article,
          graph_data: article.graph_data || {},
        })));
        setError(null);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      setError(error instanceof Error ? error.message : 'An unknown error occurred');
      setFeedData([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  const handleLike = async (articleId: string, isLiked: boolean) => {
    try {
      const token = localStorage.getItem('authToken');
      const endpoint = isLiked ? `${API_URL}/authorization/unlike` : `${API_URL}/authorization/like`;
      
      const response = await fetch(`${endpoint}/${articleId}`, {
        method: isLiked ? 'DELETE' : 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to update like status');
      }

      setFeedData(prev => 
        prev.map(article => 
          article.id === articleId 
            ? { ...article, isLiked: !isLiked }
            : article
        )
      );
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update like status",
        variant: "destructive",
      });
    }
  };

  const handleDownload = async (articleId:string) => {
    // Implement PDF download logic
  };

  return {
    feedData,
    loading,
    error,
    refreshing,
    fetchData,
    handleLike,
    handleDownload,
  };
}