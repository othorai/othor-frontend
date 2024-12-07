'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, AlertCircle, ArrowLeft, X } from 'lucide-react';
import { API_URL } from '@/lib/config';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [emailTouched, setEmailTouched] = useState(false);
  const [attemptCount, setAttemptCount] = useState(0);
  const router = useRouter();

  const validateEmail = (email: string) => {
    if (!email) return 'Email is required';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return 'Please enter a valid email address';
    }
    return null;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    if (error) setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;

    // Check rate limiting
    if (attemptCount >= 5) {
      setError('Too many attempts. Please try again in 30 minutes.');
      return;
    }

    // Clear previous error
    setError(null);

    // Validate email format
    const emailError = validateEmail(email);
    if (emailError) {
      setError(emailError);
      return;
    }

    setIsLoading(true);
    setAttemptCount(prev => prev + 1);

    try {
      const response = await fetch(`${API_URL}/authorization/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Handle specific error cases
        if (response.status === 404) {
          throw new Error('No account found with this email address');
        } else if (response.status === 429) {
          throw new Error('Too many requests. Please try again later');
        } else if (data.detail) {
          throw new Error(data.detail);
        } else {
          throw new Error('Failed to process request');
        }
      }

      // Redirect to confirmation page with email
      const encodedEmail = encodeURIComponent(email);
      router.push(`/reset-password-confirmation?email=${encodedEmail}`);
      
    } catch (error) {
      console.error('Forgot password error:', error);
      setError(error instanceof Error ? error.message : 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
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
          <CardTitle className="text-2xl text-center">Reset Password</CardTitle>
          <p className="text-center text-gray-600 text-sm">
            Enter your email address and we'll send you instructions to reset your password.
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Input
                type="email"
                placeholder="Email Address"
                value={email}
                onChange={handleInputChange}
                onBlur={() => setEmailTouched(true)}
                disabled={isLoading || attemptCount >= 5}
                required
                className={`h-12 ${error && emailTouched ? 'border-red-500 focus:ring-red-500' : ''}`}
              />
              {error && emailTouched && (
                <div className="flex items-center gap-1 text-sm text-red-500">
                  <X className="h-4 w-4" />
                  <span>{error}</span>
                </div>
              )}
            </div>

            <Button 
              type="submit" 
              className="w-full h-12"
              disabled={isLoading || attemptCount >= 5}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending Reset Link...
                </>
              ) : (
                'Send Reset Link'
              )}
            </Button>

            {attemptCount >= 5 && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Account temporarily locked due to too many attempts. 
                  Please try again in 30 minutes.
                </AlertDescription>
              </Alert>
            )}

            <Button
              type="button"
              variant="ghost"
              className="w-full h-12"
              onClick={() => router.push('/login')}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Login
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}