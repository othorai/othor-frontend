// app/(auth)/login/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/context/auth-context';

// Loading overlay component
const LoadingOverlay = () => (
  <div className="fixed inset-0 bg-background flex items-center justify-center z-50">
    <div className="text-center space-y-4">
      <Loader2 className="h-8 w-8 animate-spin mx-auto" />
      <p className="text-muted-foreground">Signing you in...</p>
    </div>
  </div>
);

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const { login, user } = useAuth();

  // Redirect if user is already logged in
  useEffect(() => {
    if (user) {
      router.push('/home');
    }
  }, [user, router]);
  
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;

    setIsLoading(true);
    setIsRedirecting(true);

    try {
      await login(email, password, rememberMe);
      
      // Dispatch auth event after successful login
      window.dispatchEvent(new Event('auth-state-changed'));
      
      toast({
        title: "Login successful",
        description: "Redirecting to dashboard...",
      });
      
    } catch (error) {
      console.error('Login error:', error);
      toast({
        variant: "destructive",
        title: "Login failed",
        description: error instanceof Error ? error.message : "An error occurred during login",
      });
      setIsRedirecting(false);
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading overlay while redirecting
  if (isRedirecting) {
    return <LoadingOverlay />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
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
          <CardTitle className="text-2xl text-center">Welcome!</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Input
                type="email"
                placeholder="Work Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                required
                className="h-12"
              />
            </div>
            <div className="space-y-2">
              <Input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                required
                className="h-12"
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div 
                  onClick={() => setRememberMe(!rememberMe)}
                  className={`w-4 h-4 rounded border cursor-pointer flex items-center justify-center
                    ${rememberMe ? 'bg-primary border-primary' : 'border-gray-300'}`}
                >
                  {rememberMe && (
                    <span className="text-white text-xs">✓</span>
                  )}
                </div>
                <label
                  onClick={() => setRememberMe(!rememberMe)}
                  className="text-sm text-gray-600 cursor-pointer"
                >
                  Remember me
                </label>
              </div>
              <Button
                type="button"
                variant="link"
                className="text-sm text-primary px-0"
                onClick={() => router.push('/forgot-password')}
              >
                Forgot password?
              </Button>
            </div>

            <Button 
              type="submit" 
              className="w-full h-12"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </Button>

            <div className="text-center text-sm">
              <span className="text-gray-600">Don't have an account? </span>
              <Button
                type="button"
                variant="link"
                className="text-primary px-1"
                onClick={() => router.push('/signup')}
              >
                Sign up
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}