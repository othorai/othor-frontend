// components/layout/app-layout.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { OrganizationSwitcher } from "@/components/organization-switcher";
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
  const pathname = usePathname();
  const router = useRouter();

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-60 bg-slate-100 border-r transform 
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:relative lg:translate-x-0 transition-transform duration-200 ease-in-out
      `}>
        <div className="h-16 flex items-center justify-between px-4">
          <img
            src="/images/othor-logo.png"
            alt="Othor AI"
            className="h-10 pl-4"
          />
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-6 w-6" />
          </Button>
        </div>

        <nav className="p-4 space-y-2">
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

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 ">
          <div className=" px-4 flex items-center justify-between">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-6 w-6" />
            </Button>
            
            {/* Add Organization Switcher here */}
            <div className="ml-auto">
              <OrganizationSwitcher />
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-auto bg-gray-50">
          {children}
        </main>
      </div>
    </div>
  );
}