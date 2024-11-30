// components/layout/app-layout.tsx
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
  { name: 'Planner', href: '/planner', icon: ListTodo },
  { name: 'Documents', href: '/documents', icon: Folder },
  { name: 'Forms', href: '/forms', icon: TableProperties },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export function AppLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeOrgName, setActiveOrgName] = useState<string>('');
  const pathname = usePathname();
  const router = useRouter();

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
      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-60 bg-slate-100 border-r transform flex flex-col
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:relative lg:translate-x-0 transition-transform duration-200 ease-in-out
      `}>
        {/* Logo */}
        <div className="h-16 flex items-center px-4">
          <img
            src="/images/othor-logo.png"
            alt="Othor AI"
            className="h-10 pl-4"
          />
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden ml-auto"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-6 w-6" />
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`
                  flex items-center px-4 py-2 rounded-lg text-base font-medium
                  ${isActive 
                    ? 'bg-primary text-white' 
                    : 'text-gray-600 hover:bg-gray-100'
                  }
                `}
              >
                <item.icon className="mr-3 h-6 w-6" />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Mobile menu button */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 z-50 lg:hidden"
        onClick={() => setSidebarOpen(true)}
      >
        <Menu className="h-6 w-6" />
      </Button>

      {/* Main content */}
      <div className="flex-1 overflow-hidden">
        <WelcomeHeader organizationName={activeOrgName} />
        <main className="h-full overflow-auto bg-gray-50 px-6">
          {children}
        </main>
      </div>
    </div>
  );
}