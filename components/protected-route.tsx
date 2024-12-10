// components/protected-route.tsx
'use client';

import { useEffect } from 'react';
import { clearAuthState } from "@/lib/auth"
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { Loader2 } from 'lucide-react';
import { PUBLIC_ROUTES } from '@/constants/routes';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const router = useRouter();
  const { user, loading } = useAuth();
  const pathname = usePathname();

  // Check if current route is public
  const isPublicRoute = PUBLIC_ROUTES.some(route => pathname?.startsWith(route));

  // Special case for verification with token
  const isVerificationWithToken = pathname?.includes('/verification') && 
                                pathname?.includes('token=');

  useEffect(() => {
    if (!loading) {
      if (!user && !isPublicRoute && !isVerificationWithToken) {
        console.log('No user, redirecting to login');
        clearAuthState();
        router.push('/login');
      }
    }
  }, [loading, user, router, pathname, isPublicRoute, isVerificationWithToken]);

  // Show loading state while checking auth
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Allow access if user is authenticated or route is public or verification with token
  if (user || isPublicRoute || isVerificationWithToken) {
    return <>{children}</>;
  }

  return null;
};