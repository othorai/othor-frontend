// app/(auth)/signup/page.tsx

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from 'lucide-react';
import { API_URL } from '@/lib/config';

export default function SignupPage() {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [isUsernameModified, setIsUsernameModified] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      router.push('/home');
    }
  }, [router]);

  const generateDefaultUsername = (email: string) => {
    const namePart = email.split('@')[0];
    const firstThreeLetters = namePart.slice(0, 3).toLowerCase();
    const randomNumber = Math.floor(1000 + Math.random() * 9000);
    return `${firstThreeLetters}${randomNumber}`;
  };

  const validateEmail = (text: string) => {
    setEmail(text);
    const personalDomains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com'];
    const domain = text.split('@')[1];
    
    if (personalDomains.includes(domain)) {
      setEmailError('Please use your company/business email.');
      return false;
    } else {
      setEmailError('');
      if (!isUsernameModified) {
        setUsername(generateDefaultUsername(text));
      }
      return true;
    }
  };

  const validatePassword = (pass: string) => {
    const errors = [];
    if (pass.length < 8) errors.push("be at least 8 characters long");
    if (!/[A-Z]/.test(pass)) errors.push("include an uppercase letter");
    if (!/[a-z]/.test(pass)) errors.push("include a lowercase letter");
    if (!/[0-9]/.test(pass)) errors.push("include a number");
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(pass)) errors.push("include a special character");
    return errors;
  };

  const handlePasswordChange = (text: string) => {
    setPassword(text);
    const errors = validatePassword(text);
    if (errors.length > 0) {
      setPasswordError(`Password must ${errors.join(', ')}`);
    } else {
      setPasswordError('');
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;

    if (!email || !username || !password || !confirmPassword) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please fill in all fields",
      });
      return;
    }

    if (emailError) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please use a valid company email",
      });
      return;
    }

    if (password !== confirmPassword) {
      setPasswordError('Passwords do not match');
      return;
    }

    const passwordErrors = validatePassword(password);
    if (passwordErrors.length > 0) {
      setPasswordError(`Password must ${passwordErrors.join(', ')}`);
      return;
    }

    if (!acceptTerms) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please accept the Terms of Service and Privacy Policy",
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`${API_URL}/authorization/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username,
          email,
          password,
          role: 'admin',
          data_access: 'admin',
          organization_name: 'Wayne Enterprises'
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Signup failed');
      }

      toast({
        title: "Account created successfully",
        description: "Please log in with your credentials.",
      });

      router.push('/login');
      
    } catch (error) {
      console.error('Signup error:', error);
      toast({
        variant: "destructive",
        title: "Signup failed",
        description: error instanceof Error ? error.message : "An error occurred during signup",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
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
          <CardTitle className="text-2xl text-center">Create an account</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSignup} className="space-y-4">
            <div className="space-y-2">
              <Input
                type="email"
                placeholder="Work Email"
                value={email}
                onChange={(e) => validateEmail(e.target.value)}
                disabled={isLoading}
                required
                className="h-12"
              />
              {emailError && (
                <p className="text-sm text-red-500">{emailError}</p>
              )}
            </div>

            <div className="space-y-2">
              <Input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  setIsUsernameModified(true);
                }}
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
                onChange={(e) => handlePasswordChange(e.target.value)}
                disabled={isLoading}
                required
                className="h-12"
              />
              {password && (
                <p className="text-xs text-gray-500">
                  Password must be at least 8 characters long and include an uppercase letter, 
                  lowercase letter, number, and special character.
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Input
                type="password"
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={isLoading}
                required
                className="h-12"
              />
              {passwordError && (
                <p className="text-sm text-red-500">{passwordError}</p>
              )}
            </div>

            <div className="flex items-center space-x-2">
              <div 
                onClick={() => setAcceptTerms(!acceptTerms)}
                className={`w-4 h-4 rounded border cursor-pointer flex items-center justify-center
                  ${acceptTerms ? 'bg-primary border-primary' : 'border-gray-300'}`}
              >
                {acceptTerms && (
                  <span className="text-white text-xs">✓</span>
                )}
              </div>
              <label className="text-sm text-gray-600">
                I accept the{' '}
                <Button
                  type="button"
                  variant="link"
                  className="text-primary h-auto p-0"
                  onClick={() => window.open('/terms', '_blank')}
                >
                  Terms of Service
                </Button>
                {' '}and{' '}
                <Button
                  type="button"
                  variant="link"
                  className="text-primary h-auto p-0"
                  onClick={() => window.open('/privacy', '_blank')}
                >
                  Privacy Policy
                </Button>
              </label>
            </div>

            <Button 
              type="submit" 
              className="w-full h-12"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating account...
                </>
              ) : (
                'Sign Up'
              )}
            </Button>

            <div className="text-center text-sm">
              <span className="text-gray-600">Already have an account? </span>
              <Button
                type="button"
                variant="link"
                className="text-primary px-1"
                onClick={() => router.push('/login')}
              >
                Sign in
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}