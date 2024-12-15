import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Heart } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { API_URL } from '@/lib/config';

interface Visualization {
  type: string;
  axis_label: string;
  value_format: Record<string, any>;
  show_points: boolean;
  stack_type?: string;
  show_labels: boolean;
}

interface GraphData {
  current: number;
  previous: number;
  change: number;
  change_percentage: number;
  visualization?: Visualization;
}

interface Narrative {
  id: string;
  title: string;
  content: string;
  category: string;
  time_period: string;
  context?: string;
  graph_data: Record<string, GraphData>;
}

const LikedNarrativesList = () => {
  const [likedNarratives, setLikedNarratives] = useState<Narrative[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const router = useRouter();

  const getAuthHeaders = () => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      router.push('/login');
      return null;
    }
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  };

  useEffect(() => {
    fetchLikedNarratives();
  }, []);

  const fetchLikedNarratives = async () => {
    try {
      const headers = getAuthHeaders();
      if (!headers) return;

      const response = await fetch(`${API_URL}/authorization/liked-posts`, {
        headers,
      });
      
      if (response.ok) {
        const data = await response.json();
        setLikedNarratives(data);
      } else if (response.status === 401) {
        toast({
          variant: "destructive",
          title: "Authentication Error",
          description: "Please log in again"
        });
        router.push('/login');
      } else {
        throw new Error('Failed to fetch liked narratives');
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch liked narratives"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUnlike = async (narrativeId: string) => {
    try {
      const headers = getAuthHeaders();
      if (!headers) return;

      const response = await fetch(`${API_URL}/authorization/unlike/${narrativeId}`, {
        method: 'DELETE',
        headers,
      });

      if (response.ok) {
        setLikedNarratives(prev => prev.filter(narrative => narrative.id !== narrativeId));
        toast({
          title: "Success",
          description: "Narrative unliked successfully"
        });
      } else if (response.status === 401) {
        toast({
          variant: "destructive",
          title: "Authentication Error",
          description: "Please log in again"
        });
        router.push('/login');
      } else {
        throw new Error('Failed to unlike narrative');
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to unlike narrative"
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading liked narratives...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Liked Narratives</CardTitle>
          <CardDescription>View and manage your liked narratives</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {likedNarratives.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Heart className="w-12 h-12 mx-auto mb-3 stroke-1" />
                <p>No liked narratives yet</p>
              </div>
            ) : (
              likedNarratives.map((narrative) => (
                <Card key={narrative.id} className="overflow-hidden">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start gap-4">
                      <div className="space-y-2 flex-1">
                        <h3 className="font-semibold text-lg">{narrative.title}</h3>
                        <p className="text-sm text-muted-foreground">{narrative.content}</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-2">
                          <span className="px-2 py-1 bg-secondary rounded-md">{narrative.category}</span>
                          <span>•</span>
                          <span>{narrative.time_period}</span>
                          {narrative.context && (
                            <>
                              <span>•</span>
                              <span>{narrative.context}</span>
                            </>
                          )}
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleUnlike(narrative.id)}
                        className="shrink-0"
                      >
                        <Heart className="w-4 h-4 mr-2 fill-current" />
                        Unlike
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LikedNarrativesList;