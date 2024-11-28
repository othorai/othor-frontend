// hooks/use-feed.ts
import { useState, useCallback } from 'react';
import { format } from 'date-fns';
import { useToast } from "@/components/ui/use-toast";

export function useFeed() {
  const [feedData, setFeedData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const { toast } = useToast();

  const fetchData = useCallback(async (date = new Date()) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('authToken');
      const formattedDate = format(date, 'yyyy-MM-dd');
      
      const response = await fetch(`/api/narrative/feed?date=${formattedDate}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to fetch narratives');
      }
      
      const data = await response.json();
      
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
      setError(error.message);
      setFeedData([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  const handleLike = async (articleId, isLiked) => {
    try {
      const token = localStorage.getItem('authToken');
      const endpoint = isLiked ? '/api/narrative/unlike' : '/api/narrative/like';
      
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

  const handleDownload = async (articleId) => {
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