'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { NarrativeCard } from '@/components/narratives/card';
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

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

export default function HomePage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [feedData, setFeedData] = useState<Article[]>([]);
  const router = useRouter();
  const { toast } = useToast();

  const fetchNarratives = async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('No auth token found');
      }

      console.log('Fetching narratives...');
      const response = await fetch('/api/narrative/feed', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          // Token expired or invalid
          localStorage.removeItem('authToken');
          router.push('/login');
          throw new Error('Session expired. Please login again.');
        }
        throw new Error('Failed to fetch narratives');
      }

      const data = await response.json();
      console.log('Narratives response:', data);

      if (data.articles && Array.isArray(data.articles)) {
        setFeedData(data.articles);
      } else {
        console.error('Invalid data format:', data);
        throw new Error('Invalid data format received');
      }
    } catch (error) {
      console.error('Error fetching narratives:', error);
      setError(error instanceof Error ? error.message : 'Failed to load narratives');
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : 'Failed to load narratives',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNarratives();
  }, []);

  const handleLike = async (articleId: string, liked: boolean) => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('No auth token found');
      }

      const response = await fetch(`/api/narrative/${liked ? 'like' : 'unlike'}/${articleId}`, {
        method: liked ? 'POST' : 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to update like status');
      }

      setFeedData(prevData =>
        prevData.map(article =>
          article.id === articleId ? { ...article, isLiked: liked } : article
        )
      );
    } catch (error) {
      console.error('Error updating like status:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update like status",
      });
    }
  };

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