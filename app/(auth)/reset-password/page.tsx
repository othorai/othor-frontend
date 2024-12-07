'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, AlertCircle, Check, X } from 'lucide-react';
import { API_URL } from '@/lib/config';

export default function ResetPasswordPage() {
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  });

  const [validation, setValidation] = useState({
    password: {
      isValid: true,
      checks: {
        length: false,
        uppercase: false,
        lowercase: false,
        number: false,
        special: false
      }
    },
    confirmPassword: { isValid: true, message: '' }
  });

  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  // Redirect if no token is present
  if (!token) {
    router.push('/forgot-password');
    return null;
  }

  const validatePassword = (password: string) => {
    const checks = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    };

    const isValid = Object.values(checks).every(check => check);
    return { isValid, checks };
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    if (name === 'password') {
      const passwordValidation = validatePassword(value);
      setValidation(prev => ({
        ...prev,
        password: {
          isValid: passwordValidation.isValid,
          checks: passwordValidation.checks
        },
        confirmPassword: {
          isValid: formData.confirmPassword === value,
          message: formData.confirmPassword && formData.confirmPassword !== value 
            ? 'Passwords do not match' 
            : ''
        }
      }));
    }

    if (name === 'confirmPassword') {
      setValidation(prev => ({
        ...prev,
        confirmPassword: {
          isValid: value === formData.password,
          message: value && value !== formData.password ? 'Passwords do not match' : ''
        }
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;

    // Validate passwords
    if (!validation.password.isValid || !validation.confirmPassword.isValid) {
      setError('Please ensure your passwords meet all requirements and match');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`${API_URL}/authorization/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          password: formData.password
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.detail || 'Failed to reset password');
      }

      // Redirect to success page
      router.push('/reset-password-success');
      
    } catch (error) {
      console.error('Reset password error:', error);
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
          <CardTitle className="text-2xl text-center">Create New Password</CardTitle>
          <p className="text-center text-gray-600 text-sm">
            Enter your new password below
          </p>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Input
                type="password"
                name="password"
                placeholder="New Password"
                value={formData.password}
                onChange={handleInputChange}
                disabled={isLoading}
                required
                className={`h-12 ${!validation.password.isValid && formData.password ? 'border-red-500' : ''}`}
              />
              {formData.password && (
                <div className="space-y-1 text-sm">
                  {Object.entries(validation.password.checks).map(([check, isValid]) => (
                    <p key={check} className={`flex items-center gap-1 ${isValid ? 'text-green-600' : 'text-gray-500'}`}>
                      {isValid ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
                      {check === 'length' ? 'At least 8 characters' :
                       check === 'uppercase' ? 'One uppercase letter' :
                       check === 'lowercase' ? 'One lowercase letter' :
                       check === 'number' ? 'One number' :
                       'One special character'}
                    </p>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Input
                type="password"
                name="confirmPassword"
                placeholder="Confirm New Password"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                disabled={isLoading}
                required
                className={`h-12 ${!validation.confirmPassword.isValid && formData.confirmPassword ? 'border-red-500' : ''}`}
              />
              {!validation.confirmPassword.isValid && formData.confirmPassword && (
                <p className="text-sm text-red-500 flex items-center gap-1">
                  <X className="h-4 w-4" /> {validation.confirmPassword.message}
                </p>
              )}
            </div>

            <Button 
              type="submit" 
              className="w-full h-12"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Resetting Password...
                </>
              ) : (
                'Reset Password'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}