// app/(auth)/verification/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { API_URL } from '@/lib/config';

export default function VerificationPage() {
  const [verificationStatus, setVerificationStatus] = useState<'loading' | 'success' | 'error' | 'idle'>('idle');
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  // app/(auth)/verification/page.tsx
const verifyEmail = async (token: string) => {
    setVerificationStatus('loading');
    try {
      const response = await fetch(`${API_URL}/authorization/verify-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token }),
      });
  
      const data = await response.json();
      console.log('Verification response:', data); // Add this to debug
  
      // Check for success message in both formats
      if (data.message?.includes('success') || data.detail?.includes('success')) {
        setVerificationStatus('success');
        toast({
          title: "Success!",
          description: "Your email has been verified successfully.",
        });
      } else {
        // If response is OK but no success message, still treat as success
        if (response.ok) {
          setVerificationStatus('success');
          toast({
            title: "Success!",
            description: "Your email has been verified successfully.",
          });
        } else {
          throw new Error(data.detail || 'Verification failed');
        }
      }
  
    } catch (error) {
      console.error('Verification error:', error);
      // Check if the error message indicates success
      if (error instanceof Error && error.message.toLowerCase().includes('success')) {
        setVerificationStatus('success');
        toast({
          title: "Success!",
          description: "Your email has been verified successfully.",
        });
      } else {
        setVerificationStatus('error');
        toast({
          variant: "destructive",
          title: "Verification failed",
          description: "Invalid or expired verification link. Please try again.",
        });
      }
    }
  };

  useEffect(() => {
    const token = searchParams.get('token');
    if (token) {
      verifyEmail(token);
    }
  }, [searchParams]);

  return (
    <Card className="w-full">
      <CardHeader className="space-y-1">
        <div className="flex justify-center mb-8">
          <Image
            src="/images/othor-logo.png"
            alt="Othor AI"
            width={200}
            height={48}
            priority
            className="h-12 w-auto"
          />
        </div>
        <CardTitle className="text-2xl text-center">Email Verification</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex justify-center">
          {verificationStatus === 'loading' && (
            <Loader2 className="h-16 w-16 text-primary animate-spin" />
          )}
          {verificationStatus === 'success' && (
            <CheckCircle2 className="h-16 w-16 text-green-500" />
          )}
          {verificationStatus === 'error' && (
            <XCircle className="h-16 w-16 text-red-500" />
          )}
        </div>

        <div className="text-center space-y-4">
          {verificationStatus === 'loading' && (
            <p className="text-lg">Verifying your email address...</p>
          )}
          
          {verificationStatus === 'success' && (
            <>
              <p className="text-lg font-medium text-green-600">
                Email verified successfully!
              </p>
              <p className="text-gray-600">
                You can now sign in to your account.
              </p>
              <Button 
                className="mt-4 w-full"
                onClick={() => router.push('/login')}
              >
                Continue to Login
              </Button>
            </>
          )}
          
          {verificationStatus === 'error' && (
            <>
              <p className="text-lg font-medium text-red-600">
                Verification failed
              </p>
              <p className="text-gray-600">
                The verification link may be expired or invalid.
              </p>
              <Button 
                variant="outline" 
                className="mt-4 w-full"
                onClick={() => router.push('/login')}
              >
                Back to Login
              </Button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}