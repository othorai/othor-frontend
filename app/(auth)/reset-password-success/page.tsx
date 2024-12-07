'use client';

import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2 } from 'lucide-react';


export default function ResetPasswordSuccessPage() {
    const router = useRouter();
  
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
              <CheckCircle2 className="h-12 w-12 text-green-500" />
            </div>
            <CardTitle className="text-2xl text-center">Password Reset Successful</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center space-y-4">
              <p className="text-gray-600">
                Your password has been successfully reset. You can now log in with your new password.
              </p>
  
              <Button 
                type="button" 
                className="w-full h-12 mt-4"
                onClick={() => router.push('/login')}
              >
                Back to Login
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }