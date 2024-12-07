// token validation will happen on the backend when they try to reset the password anyway. If someone accesses these pages directly:

// For /reset-password: If there's no token in the URL, they can't submit the form successfully
// For /reset-password-success: Even if they see the success page directly, it doesn't impact security since all it shows is a generic success message and a link to login

// The current implementation maintains security while keeping the code simpler. The backend validation of the reset token during the actual password reset is the critical security check that matters most.


'use client';

import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Mail } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function ResetPasswordConfirmationPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const email = searchParams.get('email');

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
          <div className="flex justify-center mb-4">
            <Mail className="h-12 w-12 text-primary" />
          </div>
          <CardTitle className="text-2xl text-center">Check Your Email</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center space-y-4">
            <p className="text-gray-600">
              We've sent password reset instructions to:
            </p>
            <p className="font-medium">{email}</p>
            <p className="text-sm text-gray-500">
              If you don't see the email, check your spam folder. The link in the email will expire in 24 hours.
            </p>

            <div className="pt-4">
              <Button
                type="button"
                variant="ghost"
                className="w-full h-12"
                onClick={() => router.push('/login')}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Login
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}