// app/(dashboard)/layout.tsx
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getAuthToken } from '@/lib/auth';
import { AppLayout } from '@/components/layout/app-layout';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      const token = getAuthToken();
      if (!token) {
        router.push('/login');
      }
    };

    checkAuth();
  }, [router]);

  return <AppLayout>{children}</AppLayout>;
}