'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from 'lucide-react';
import { API_URL } from '@/lib/config';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [focusedInput, setFocusedInput] = useState<string | null>(null);
  const router = useRouter();
  const { toast } = useToast();

  // Load saved email if remember me was checked
  useEffect(() => {
    const savedEmail = localStorage.getItem('savedEmail');
    const savedRememberMe = localStorage.getItem('rememberMe');
    
    if (savedRememberMe === 'true' && savedEmail) {
      setEmail(savedEmail);
      setRememberMe(true);
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;

    setIsLoading(true);

    try {
      console.log('Making login request...');
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      console.log('Login response status:', response.status);

      const data = await response.json();
      console.log('Login response received');

      if (!response.ok) {
        throw new Error(data.detail || 'Login failed');
      }

      if (!data.access_token) {
        throw new Error('No access token received');
      }

      // Store token and user data
      console.log('Storing auth token...');
      localStorage.setItem('authToken', data.access_token);
      
      if (rememberMe) {
        localStorage.setItem('savedEmail', email);
        localStorage.setItem('rememberMe', 'true');
      } else {
        localStorage.removeItem('savedEmail');
        localStorage.removeItem('rememberMe');
      }

      // Verify token is stored
      const storedToken = localStorage.getItem('authToken');
      console.log('Token stored successfully:', !!storedToken);

      toast({
        title: "Success",
        description: "Login successful!"
      });

      // Add a small delay before redirect
      await new Promise(resolve => setTimeout(resolve, 500));

      // Force a hard page reload to reset all states
      window.location.href = '/home';

    } catch (error) {
      console.error('Login error:', error);
      toast({
        variant: "destructive",
        title: "Login failed",
        description: error instanceof Error ? error.message : 'An error occurred during login'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/50">
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
          <CardTitle className="text-2xl text-center">Welcome back</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            {/* Email Input */}
            <div className="space-y-2">
              <Input
                type="email"
                placeholder="Work Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onFocus={() => setFocusedInput('email')}
                onBlur={() => setFocusedInput(null)}
                disabled={isLoading}
                required
                className={`h-12 bg-white ${
                  focusedInput === 'email' ? 'border-[#660085] border-2' : 'border-[#9100bd]'
                }`}
              />
            </div>

            {/* Password Input */}
            <div className="space-y-2">
              <Input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onFocus={() => setFocusedInput('password')}
                onBlur={() => setFocusedInput(null)}
                disabled={isLoading}
                required
                className={`h-12 bg-white ${
                  focusedInput === 'password' ? 'border-[#660085] border-2' : 'border-[#9100bd]'
                }`}
              />
            </div>

            {/* Remember Me and Forgot Password */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div 
                  onClick={() => setRememberMe(!rememberMe)}
                  className={`w-4 h-4 rounded border cursor-pointer flex items-center justify-center
                    ${rememberMe ? 'bg-[#9100bd] border-[#9100bd]' : 'border-[#9100bd]'}`}
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
                className="text-sm text-[#9100bd] hover:text-[#660085] px-0"
                onClick={() => router.push('/forgot-password')}
              >
                Forgot password?
              </Button>
            </div>

            {/* Login Button */}
            <Button 
              type="submit" 
              className="w-full h-12 bg-[#9100bd] hover:bg-[#660085]"
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

            {/* Sign Up Link */}
            <div className="text-center text-sm">
              <span className="text-gray-600">Don't have an account? </span>
              <Button
                type="button"
                variant="link"
                className="text-[#9100bd] hover:text-[#660085] px-1"
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