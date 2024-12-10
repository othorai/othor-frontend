// app/(dashboard)/layout.tsx
'use client';

import { useState, useEffect } from 'react';
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/ui/app-sidebar";
import { WelcomeHeader } from "@/components/welcome-header";
import { ProtectedRoute } from '@/components/protected-route';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [activeOrgName, setActiveOrgName] = useState<string>('');

  useEffect(() => {
    const fetchActiveOrg = () => {
      const orgName = localStorage.getItem('currentOrgName');
      if (orgName) {
        setActiveOrgName(orgName);
      }
    };

    fetchActiveOrg();
    window.addEventListener('organizationChanged', fetchActiveOrg);
    return () => window.removeEventListener('organizationChanged', fetchActiveOrg);
  }, []);

  return (
    <ProtectedRoute>
      <SidebarProvider defaultOpen={false}>
        <div className="flex h-screen w-full bg-gray-50 overflow-hidden">
          <div className="hidden md:block">
            <AppSidebar />
          </div>
          
          <div className="flex-1 flex flex-col h-screen w-full md:ml-[6rem] transition-all duration-300">
            <WelcomeHeader organizationName={activeOrgName} />
            <main className="flex-1 relative overflow-auto bg-gray-50">
              <div className="absolute inset-0 pb-20 md:pb-0">
                {children}
              </div>
            </main>
            <div className="block md:hidden fixed bottom-0 left-0 right-0 bg-white">
              <AppSidebar />
            </div>
          </div>
        </div>
      </SidebarProvider>
    </ProtectedRoute>
  );
}