// app/(dashboard)/home/page.tsx
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { useToast } from "@/components/ui/use-toast";
import { LoadingQuotes } from '@/components/loading-quotes';
import { Card } from "@/components/ui/card";
import { MetricChart } from '@/components/charts/metric-chart';
import { EmptyState } from '@/components/empty-state';
import { useFeed } from '@/hooks/use-feed';

export default function HomePage() {
  const router = useRouter();
  const { toast } = useToast();
  const { 
    feedData, 
    loading, 
    error, 
    refreshing, 
    handleLike, 
    handleDownload, 
    fetchData 
  } = useFeed();

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      router.push('/login');
      return;
    }
  }, [router]);

  if (loading) {
    return <LoadingQuotes />;
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Card className="w-full max-w-md p-6">
          <p className="text-center text-destructive mb-4">{error}</p>
          <button 
            onClick={() => fetchData()} 
            className="mx-auto text-primary hover:underline"
          >
            Try again
          </button>
        </Card>
      </div>
    );
  }

  if (feedData.length === 0 || 
      (feedData.length === 1 && 
       (feedData[0].title === "No Data Available" || 
        feedData[0].title === "Connect Your Data Sources"))) {
    return <EmptyState />;
  }

  return (
    <div className="container mx-auto px-4">
      <div className="grid gap-6">
        {feedData.map((article) => (
          <Card key={article.id} className="overflow-hidden">
            {/* Rest of the card content as shown in previous home page component */}
          </Card>
        ))}
      </div>
    </div>
  );
}