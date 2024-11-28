// components/empty-state.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Settings } from 'lucide-react';
import { useRouter } from 'next/navigation';

export function EmptyState() {
  const router = useRouter();
  const companyName = "your company"; // This should be dynamic based on current org

  return (
    <div className="flex items-center justify-center min-h-[80vh]">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="text-center text-3xl text-primary">
            Connect Your Data Sources
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 text-center">
          <p className="text-xl text-muted-foreground">
            Please connect at least one data source for {companyName} to generate insights.
          </p>
          <p className="text-lg">
            Go to Settings to connect your databases and start generating insights.
          </p>
          <Button 
            size="lg" 
            onClick={() => router.push('/settings')}
            className="mt-4"
          >
            <Settings className="mr-2 h-5 w-5" />
            Go to Settings
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}