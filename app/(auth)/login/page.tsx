'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { Loader2, AlertCircle } from 'lucide-react';
import { useAuth } from '@/context/auth-context';

export default function LoginPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });
  const [errors, setErrors] = useState({
    email: '',
    password: '',
    general: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [attemptCount, setAttemptCount] = useState(0);
  const router = useRouter();
  const { toast } = useToast();
  const { login } = useAuth();

  useEffect(() => {
    // Load saved email if remember me was checked
    const savedEmail = localStorage.getItem('savedEmail');
    const rememberMe = localStorage.getItem('rememberMe') === 'true';
    if (savedEmail && rememberMe) {
      setFormData(prev => ({ ...prev, email: savedEmail, rememberMe }));
    }

    // Check for signup success
    if (window.location.search.includes('signup=success')) {
      toast({
        title: "Account created successfully",
        description: "You can now login with your email and password",
      });
      // Clean up URL
      window.history.replaceState({}, '', '/login');
    }
  }, [toast]);

  const validateForm = () => {
    const newErrors = {
      email: '',
      password: '',
      general: ''
    };

    // Email validation
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 4) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.values(newErrors).every(error => !error);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    // Clear error when user starts typing
    if (errors[name as keyof typeof errors]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      await login(formData.email, formData.password);
      
      // Handle remember me preferences
      if (formData.rememberMe) {
        localStorage.setItem('savedEmail', formData.email);
        localStorage.setItem('rememberMe', 'true');
      } else {
        localStorage.removeItem('savedEmail');
        localStorage.removeItem('rememberMe');
      }

      toast({
        title: "Login successful",
        description: "Redirecting to dashboard...",
      });
      
      router.push('/home');
    } catch (error) {
      console.error('Login error:', error);
      setAttemptCount(prev => prev + 1);
      
      // Handle specific error cases
      if (error instanceof Error) {
        if (error.message.includes('credentials')) {
          setErrors(prev => ({
            ...prev,
            general: 'Incorrect email or password'
          }));
        } else {
          setErrors(prev => ({
            ...prev,
            general: error.message
          }));
        }
      }

      // Show lockout warning after multiple failed attempts
      if (attemptCount >= 2) {
        toast({
          variant: "destructive",
          title: "Multiple failed attempts",
          description: "Please verify your credentials or reset your password",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

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
            {errors.general && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{errors.general}</AlertDescription>
              </Alert>
            )}
            
            <div className="space-y-2">
              <Input
                type="email"
                name="email"
                placeholder="Work Email"
                value={formData.email}
                onChange={handleInputChange}
                disabled={isLoading}
                required
                className={`h-12 ${errors.email ? 'border-red-500' : ''}`}
                aria-invalid={!!errors.email}
              />
              {errors.email && (
                <p className="text-sm text-red-500">{errors.email}</p>
              )}
            </div>

            <div className="space-y-2">
              <Input
                type="password"
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleInputChange}
                disabled={isLoading}
                required
                className={`h-12 ${errors.password ? 'border-red-500' : ''}`}
                aria-invalid={!!errors.password}
              />
              {errors.password && (
                <p className="text-sm text-red-500">{errors.password}</p>
              )}
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div 
                  onClick={() => setFormData(prev => ({ ...prev, rememberMe: !prev.rememberMe }))}
                  className={`w-4 h-4 rounded border cursor-pointer flex items-center justify-center
                    ${formData.rememberMe ? 'bg-primary border-primary' : 'border-gray-300'}`}
                >
                  {formData.rememberMe && (
                    <span className="text-white text-xs">✓</span>
                  )}
                </div>
                <label
                  onClick={() => setFormData(prev => ({ ...prev, rememberMe: !prev.rememberMe }))}
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