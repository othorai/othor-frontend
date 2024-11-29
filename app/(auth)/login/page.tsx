// app/(auth)/login/page.tsx
'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from 'lucide-react';
import { API_URL } from '@/lib/config';
import { saveAuthState } from '@/lib/auth';

interface FormErrors {
  email: string;
  password: string;
}

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [focusedInput, setFocusedInput] = useState<string | null>(null);
  const [errors, setErrors] = useState<FormErrors>({
    email: '',
    password: ''
  });

  const router = useRouter();
  const passwordInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const loadSavedCredentials = () => {
      const savedEmail = localStorage.getItem('savedEmail');
      const savedRememberMe = localStorage.getItem('rememberMe');
      
      if (savedRememberMe === 'true' && savedEmail) {
        setEmail(savedEmail);
        setRememberMe(true);
      }
    };

    loadSavedCredentials();
  }, []);

  const validateForm = () => {
    let isValid = true;
    const newErrors = { email: '', password: '' };

    setErrors(newErrors);
    setErrorMessage('');

    if (!email.trim()) {
      newErrors.email = 'Please enter your email';
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Please enter a valid email';
      isValid = false;
    }

    if (!password.trim()) {
      newErrors.password = 'Please enter your password';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading || !validateForm()) return;

    setIsLoading(true);
    setErrorMessage('');

    try {
      const formBody = `username=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`;
      console.log('Making login request to:', `${API_URL}/authorization/login`);

      const response = await fetch(`${API_URL}/authorization/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json'
        },
        body: formBody
      });

      console.log('Login response status:', response.status);
      const data = await response.json();

      if (response.ok) {
        console.log('Login successful');
        await saveAuthState(data.access_token, email, rememberMe);
        window.location.href = '/home';
      } else {
        console.error('Login failed:', data);
        setErrorMessage(data.detail || 'Login failed. Please check your credentials and try again.');
      }
    } catch (error) {
      console.error('Login error:', error);
      setErrorMessage('A network error occurred. Please check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <Card className="w-full max-w-[400px] border-0 shadow-none">
        <CardContent className="pt-6">
          <form onSubmit={handleLogin} className="space-y-6">
            {/* Logo */}
            <div className="flex justify-center mb-8">
              <Image
                src="/images/othor-logo.png"
                alt="Othor AI"
                width={250}
                height={250}
                priority
                className="w-auto h-[80px] object-contain"
              />
            </div>

            {/* Email Input */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-900 block text-left">
                Work Email
              </label>
              <Input
                type="email"
                placeholder="name@company.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setErrors(prev => ({ ...prev, email: '' }));
                }}
                onFocus={() => setFocusedInput('email')}
                onBlur={() => setFocusedInput(null)}
                className={`h-[50px] bg-white border-[#9100bd] ${
                  errors.email ? 'border-red-500' : ''
                } ${
                  focusedInput === 'email' ? 'border-[#660085] border-2' : 'border'
                } text-black text-base px-4 rounded-md focus:ring-0 focus:outline-none`}
              />
              {errors.email && (
                <p className="text-xs text-red-500 text-left">{errors.email}</p>
              )}
            </div>

            {/* Password Input */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-900 block text-left">
                Password
              </label>
              <Input
                ref={passwordInputRef}
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setErrors(prev => ({ ...prev, password: '' }));
                }}
                onFocus={() => setFocusedInput('password')}
                onBlur={() => setFocusedInput(null)}
                className={`h-[50px] bg-white border-[#9100bd] ${
                  errors.password ? 'border-red-500' : ''
                } ${
                  focusedInput === 'password' ? 'border-[#660085] border-2' : 'border'
                } text-black text-base px-4 rounded-md focus:ring-0 focus:outline-none`}
              />
              {errors.password && (
                <p className="text-xs text-red-500 text-left">{errors.password}</p>
              )}
            </div>

            {/* Forgot Password Link */}
            <div className="flex justify-end -mt-2">
              <button
                type="button"
                onClick={() => router.push('/forgot-password')}
                className="text-xs text-[#9100bd] hover:text-[#660085]"
              >
                Forgot Password?
              </button>
            </div>

            {/* Remember Me Checkbox */}
            <div className="flex items-center -mt-2">
              <div 
                onClick={() => setRememberMe(!rememberMe)}
                className={`w-5 h-5 rounded border-2 cursor-pointer flex items-center justify-center mr-2 ${
                  rememberMe ? 'bg-[#9100bd] border-[#9100bd]' : 'border-[#9100bd]'
                }`}
              >
                {rememberMe && (
                  <span className="text-white text-sm">✓</span>
                )}
              </div>
              <label
                onClick={() => setRememberMe(!rememberMe)}
                className="text-sm text-gray-600 cursor-pointer"
              >
                Remember Me
              </label>
            </div>

            {/* Error Message */}
            {errorMessage && (
              <p className="text-red-500 text-sm text-center">{errorMessage}</p>
            )}

            {/* Login Button */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-[50px] bg-[#9100bd] hover:bg-[#660085] text-white text-lg font-light rounded-md transition-colors duration-200"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  <span>Signing in...</span>
                </div>
              ) : (
                'Login'
              )}
            </Button>

            {/* Sign Up Link */}
            <div className="flex justify-center items-center space-x-1 pt-2">
              <span className="text-sm text-gray-600">Not a Othor user?</span>
              <button
                type="button"
                onClick={() => router.push('/signup')}
                className="text-sm text-[#9100bd] hover:text-[#660085] font-normal"
              >
                Sign Up
              </button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}