'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { NarrativeCard } from '@/components/narratives/card';
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

export default function HomePage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [feedData, setFeedData] = useState([]);
  const router = useRouter();
  const { toast } = useToast();

  const fetchNarratives = async () => {
    try {
      const token = localStorage.getItem('authToken');
      console.log('Token available:', !!token);

      if (!token) {
        console.log('No token found, redirecting to login');
        router.push('/login');
        return;
      }

      const response = await fetch('/api/narrative/feed', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      });

      console.log('Response status:', response.status);

      if (response.status === 401) {
        console.log('Token invalid or expired');
        localStorage.removeItem('authToken');
        router.push('/login');
        return;
      }

      const data = await response.json();
      console.log('Response data:', data);

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch narratives');
      }

      if (data.articles && Array.isArray(data.articles)) {
        setFeedData(data.articles);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      console.error('Error fetching narratives:', error);
      setError(error.message || 'Failed to load narratives');
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || 'Failed to load narratives'
      });
    } finally {
      setLoading(false);
    }
  };

  // Add the missing handleLike function
  const handleLike = async (articleId, liked) => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Please login to like narratives"
        });
        router.push('/login');
        return;
      }

      const response = await fetch(`/api/narrative/${liked ? 'like' : 'unlike'}/${articleId}`, {
        method: liked ? 'POST' : 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.status === 401) {
        localStorage.removeItem('authToken');
        router.push('/login');
        return;
      }

      if (!response.ok) {
        throw new Error('Failed to update like status');
      }

      // Update local state optimistically
      setFeedData(prevData =>
        prevData.map(article =>
          article.id === articleId ? { ...article, isLiked: liked } : article
        )
      );

      toast({
        title: liked ? "Narrative liked" : "Narrative unliked",
        description: liked ? "Added to your likes" : "Removed from your likes",
      });

    } catch (error) {
      console.error('Error updating like status:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update like status"
      });
    }
  };

  useEffect(() => {
    fetchNarratives();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto" />
          <p className="text-lg text-gray-600">Loading narratives...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="p-6 text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <button
            onClick={fetchNarratives}
            className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark"
          >
            Try Again
          </button>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="space-y-6">
        {feedData.length > 0 ? (
          feedData.map((article) => (
            <NarrativeCard
              key={article.id}
              title={article.title}
              content={article.content}
              graphData={article.graph_data}
              sourceInfo={article.source_info}
              category={article.category}
              timePeriod={article.time_period}
              articleId={article.id}
              isLiked={article.isLiked}
              onLike={handleLike}
            />
          ))
        ) : (
          <Card className="p-6 text-center">
            <p className="text-gray-600">No narratives available</p>
          </Card>
        )}
      </div>
    </div>
  );
}