'use client';

import { useState, useEffect } from 'react';
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/ui/app-sidebar";
import { WelcomeHeader } from "@/components/welcome-header";

const AppLayout = ({ children }: { children: React.ReactNode }) => {
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
    <SidebarProvider defaultOpen={false}>
      <div className="flex h-screen w-full bg-gray-50">
        <AppSidebar />
        
        <div className="flex-1 flex flex-col min-h-screen w-full">
          <WelcomeHeader organizationName={activeOrgName} />
          <main className="flex-1 min-h-0 w-full overflow-auto bg-gray-50">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default AppLayout;