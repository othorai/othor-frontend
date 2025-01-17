// app/(dashboard)/home/pages.jsx//
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { NarrativeCard } from '@/components/narratives/card';
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { format } from 'date-fns';
import { API_URL } from '@/lib/config';
import { useNarratives } from '@/context/NarrativesContext'; 

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
  const [username, setUsername] = useState('');
  const router = useRouter();
  const { toast } = useToast();
  const { narratives, setNarratives, lastFetchDate, setLastFetchDate } = useNarratives();

  // Format today's date
  const today = new Date();
  const formattedDate = format(today, "dd MMM yyyy EEEE");

  useEffect(() => {
    const email = localStorage.getItem('savedEmail');
    if (email) {
      const name = email.split('@')[0];
      setUsername(name.charAt(0).toUpperCase() + name.slice(1));
    }
  }, []);

  const fetchNarratives = async () => {
    try {
      const date = new Date();
      const formattedDate = format(date, 'yyyy-MM-dd');
      
      // Check if we already have data for today
      if (lastFetchDate === formattedDate && narratives.length > 0) {
        setLoading(false);
        return;
      }

      const token = localStorage.getItem('authToken');
      if (!token) {
        router.push('/login');
        return;
      }

      const response = await fetch(`${API_URL}/narrative/feed?date=${formattedDate}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.status === 401) {
        localStorage.removeItem('authToken');
        router.push('authorization/login');
        return;
      }

      const data = await response.json();
      console.log('Received data:', data); // Debug log

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch narratives');
      }

      if (data.articles) {
        // Update the check for no data sources
        const hasNoDataSources = 
          data.articles.length === 0 || 
          (data.articles.length === 1 && data.articles[0].title === "No Articles Available");

        if (hasNoDataSources) {
          setNarratives([]); // Set empty array to trigger no data sources view
        } else {
          setNarratives(data.articles);
        }
        setLastFetchDate(formattedDate);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      console.error('Error fetching narratives:', error);
      setError(error instanceof Error ? error.message : 'Failed to load narratives');
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : 'Failed to load narratives'
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
        toast({
          variant: "destructive",
          title: "Error",
          description: "Please login to like narratives"
        });
        router.push('/login');
        return;
      }

      const response = await fetch(`${API_URL}/authorization/${liked ? 'like' : 'unlike'}/${articleId}`, {
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

      // Update both local state and context
      const updatedNarratives = narratives.map(article =>
        article.id === articleId ? { ...article, isLiked: liked } : article
      );
      setNarratives(updatedNarratives);

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

  // Check if we have the "No Articles Available" response
  const isNoDataSourcesConnected = 
    narratives.length === 0 || 
    (narratives.length === 1 && narratives[0].title === "No Articles Available");

  if (isNoDataSourcesConnected) {
    return (
      <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-[calc(100vh-200px)]">
        <Card className="w-full max-w-2xl p-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            No data sources connected
          </h2>
          <p className="text-lg text-gray-600 mb-6">
            Please connect a data source to generate narratives
          </p>
          <button 
            onClick={() => router.push('/settings')} 
            className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
          >
            Connect Data Source
          </button>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-2 py-8 max-w-4xl">
      <div className="space-y-6">
        {narratives && narratives.length > 0 ? (
          narratives.map((article) => (
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
            <p className="text-gray-600">No narratives available for {format(new Date(), 'dd MMM yyyy')}</p>
          </Card>
        )}
      </div>
    </div>
  );
}