// app/(auth)/layout.tsx
'use client';

import { usePathname, useSearchParams } from 'next/navigation';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const hasVerificationToken = searchParams?.get('token');
  const isVerificationPage = pathname === '/verification';

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50/50 p-4">
      <div className="w-full max-w-[420px] mx-auto">
        {(isVerificationPage && hasVerificationToken) ? (
          children
        ) : (
          children
        )}
      </div>
    </div>
  );
}