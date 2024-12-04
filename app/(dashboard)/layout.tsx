'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { WelcomeHeader } from "@/components/welcome-header";
import { 
  Home, 
  MessageSquare, 
  BarChart2, 
  Settings,
  Menu,
  Folder,
  TableProperties,
  ListTodo,
  X
} from 'lucide-react';

const navigation = [
  { name: 'Home', href: '/home', icon: Home },
  { name: 'Chat', href: '/chat', icon: MessageSquare },
  { name: 'Charts', href: '/metrics', icon: BarChart2 },
  { name: 'Settings', href: '/settings', icon: Settings },
];

const AppLayout = ({ children }: { children: React.ReactNode }) => {
  const [activeOrgName, setActiveOrgName] = useState<string>('');
  const pathname = usePathname();

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
    <div className="flex h-screen bg-gray-50">
      {/* Collapsible Sidebar */}
      <div 
        className={`
          fixed inset-y-0 left-0 z-50 bg-slate-100 border-r 
          transform flex flex-col
          w-16 hover:w-60
          transition-all duration-300 ease-in-out
          lg:relative
        `}
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-center overflow-hidden">
          <img
            src="/images/othor-logo.png"
            alt="Othor AI"
            className="h-10 min-w-[40px] object-contain"
          />
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2 overflow-hidden">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`
                  flex items-center px-4 py-2 rounded-lg text-base font-medium
                  whitespace-nowrap
                  transition-colors duration-200 ease-in-out
                  group
                  ${isActive 
                    ? 'bg-primary text-white' 
                    : 'text-gray-600 hover:bg-gray-200'
                  }
                `}
              >
                <item.icon className="w-6 h-6 min-w-[24px]" />
                <span className="ml-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  {item.name}
                </span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Main content wrapper */}
      <div className="flex-1 flex flex-col overflow-hidden pl-16">
        {/* Sticky header */}
        <div className="flex-shrink-0">
          <WelcomeHeader organizationName={activeOrgName} />
        </div>

        {/* Scrollable main content */}
        <main className="flex-1 overflow-auto bg-gray-50">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AppLayout;