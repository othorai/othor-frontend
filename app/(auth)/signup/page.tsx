'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { Loader2, AlertCircle, Check, X } from 'lucide-react';
import { API_URL } from '@/lib/config';
import { useAuth } from '@/context/auth-context';

type ErrorState = {
  title: string;
  message: string;
} | null;

type ValidationState = {
  email: { isValid: boolean; message: string };
  username: { isValid: boolean; message: string };
  password: {
    isValid: boolean;
    checks: {
      length: boolean;
      uppercase: boolean;
      lowercase: boolean;
      number: boolean;
      special: boolean;
    };
  };
  confirmPassword: { isValid: boolean; message: string };
};

export default function SignupPage() {
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: '',
    confirmPassword: '',
    acceptTerms: false
  });

  const [validation, setValidation] = useState<ValidationState>({
    email: { isValid: true, message: '' },
    username: { isValid: true, message: '' },
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

  const [emailTouched, setEmailTouched] = useState(false);
  const [error, setError] = useState<ErrorState>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const router = useRouter();
  const { toast } = useToast();
  const { login } = useAuth();

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      router.push('/home');
    }
  }, [router]);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const personalDomains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com'];
    const domain = email.split('@')[1];

    if (!emailRegex.test(email)) {
      return { isValid: false, message: 'Please enter a valid email address' };
    }
    if (personalDomains.includes(domain)) {
      return { isValid: false, message: 'Please use your company/business email' };
    }
    return { isValid: true, message: '' };
  };

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

  const getPasswordStrength = (checks: typeof validation.password.checks) => {
    const validChecks = Object.values(checks).filter(Boolean).length;
    if (validChecks === 5) return 'strong';
    if (validChecks >= 3) return 'medium';
    return 'weak';
  };

  const generateUsername = (email: string) => {
    const namePart = email.split('@')[0];
    return namePart.slice(0, 3).toLowerCase() + Math.floor(1000 + Math.random() * 9000);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;

    setFormData(prev => ({
      ...prev,
      [name]: newValue
    }));

    if (error) setError(null);

    if (name === 'email') {
      const emailValidation = validateEmail(value);
      setValidation(prev => ({
        ...prev,
        email: emailValidation
      }));

      if (emailValidation.isValid) {
        setFormData(prev => ({
          ...prev,
          username: generateUsername(value)
        }));
      }
    }

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

  const validateForm = () => {
    const errors = [];
    
    if (!formData.email) {
      errors.push('Email is required');
    } else if (!validation.email.isValid) {
      errors.push(validation.email.message);
    }

    if (!formData.password) {
      errors.push('Password is required');
    } else if (!validation.password.isValid) {
      errors.push('Password must meet all requirements');
    }

    if (!formData.confirmPassword) {
      errors.push('Please confirm your password');
    } else if (!validation.confirmPassword.isValid) {
      errors.push('Passwords do not match');
    }

    if (!formData.acceptTerms) {
      errors.push('Please accept the Terms of Service and Privacy Policy');
    }

    return errors;
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;
   
    setError(null);
   
    const validationErrors = validateForm();
    if (validationErrors.length > 0) {
      setError({
        title: 'Please fix the following errors:',
        message: validationErrors.join('\n')
      });
      return;
    }
   
    setIsLoading(true);
   
    try {
      // 1. Register the user
      const response = await fetch(`${API_URL}/authorization/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: formData.username,
          email: formData.email,
          password: formData.password,
          role: 'tester',
          data_access: 'tester',
          organization_name: 'Wayne Enterprise'
        }),
      });
   
      const data = await response.json();
   
      if (!response.ok) {
        if (Array.isArray(data.detail)) {
          throw new Error(data.detail[0]?.msg || 'Signup failed');
        }
        throw new Error(data.detail || 'Signup failed');
      }

      // 2. Automatically log in the user
      await login(formData.email, formData.password);
      
      // 3. Show success message
      toast({
        title: "Account created successfully",
        description: "Welcome to Othor AI!",
      });
      
      // 4. Redirect to home page
      router.push('/home');
      
    } catch (error) {
      console.error('Signup error:', error);
      setError({
        title: 'Signup failed',
        message: error instanceof Error ? error.message : 'An unexpected error occurred'
      });
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
          <CardTitle className="text-2xl text-center">Create an account</CardTitle>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <div className="font-semibold">{error.title}</div>
                <div className="whitespace-pre-line mt-1">{error.message}</div>
              </AlertDescription>
            </Alert>
          )}
   
          <form onSubmit={handleSignup} className="space-y-4">
            <div className="space-y-2">
              <Input
                type="email"
                name="email"
                placeholder="Work Email"
                value={formData.email}
                onChange={handleInputChange}
                onBlur={() => setEmailTouched(true)}
                disabled={isLoading}
                required
                className={`h-12 ${!validation.email.isValid && formData.email && emailTouched ? 'border-red-500' : ''}`}
              />
              {!validation.email.isValid && formData.email && emailTouched && (
                <p className="text-sm text-red-500 flex items-center gap-1">
                  <X className="h-4 w-4" /> {validation.email.message}
                </p>
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
                className={`h-12 ${!validation.password.isValid && formData.password ? 'border-red-500' : ''}`}
              />
              {formData.password && (
                <div className="space-y-2">
                  <div className="text-sm flex items-center gap-2">
                    <span>Password strength:</span>
                    <span className={`font-semibold ${
                      getPasswordStrength(validation.password.checks) === 'strong' 
                        ? 'text-green-600' 
                        : getPasswordStrength(validation.password.checks) === 'medium'
                          ? 'text-yellow-600'
                          : 'text-red-600'
                    }`}>
                      {getPasswordStrength(validation.password.checks).toUpperCase()}
                    </span>
                  </div>
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
                </div>
              )}
            </div>
   
            <div className="space-y-2">
              <Input
                type="password"
                name="confirmPassword"
                placeholder="Confirm Password"
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
   
            <div className="flex items-center space-x-2">
              <div 
                onClick={() => handleInputChange({
                  target: { name: 'acceptTerms', type: 'checkbox', checked: !formData.acceptTerms }
                } as React.ChangeEvent<HTMLInputElement>)}
                className={`w-4 h-4 rounded border cursor-pointer flex items-center justify-center
                  ${formData.acceptTerms ? 'bg-primary border-primary' : 'border-gray-300'}`}
              >
                {formData.acceptTerms && (
                  <Check className="h-3 w-3 text-white" />
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