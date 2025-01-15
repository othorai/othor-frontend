'use client';
 
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Home } from 'lucide-react';
 
export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Page Not Found</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-center text-muted-foreground">
            Could not find the requested resource
          </p>
          <div className="flex justify-center">
            <Button asChild>
              <Link href="/home" className="space-x-2 flex items-center">
                <Home className="h-4 w-4" />
                <span>Return Home</span>
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}