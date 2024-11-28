// components/layout/nav-content.tsx
'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Home, 
  MessageSquare, 
  BarChart2, 
  Settings, 
  HelpCircle 
} from 'lucide-react';

const navigation = [
  { name: 'Home', href: '/home', icon: Home },
  { name: 'Chat', href: '/chat', icon: MessageSquare },
  { name: 'Charts', href: '/metrics', icon: BarChart2 },
  { name: 'Settings', href: '/settings', icon: Settings },
];

interface NavContentProps {
  isCollapsed: boolean;
  pathname?: string;
}

export function NavContent({ isCollapsed, pathname }: NavContentProps) {
  return (
    <ScrollArea className="flex flex-1 h-[calc(100vh-4rem)]">
      <div className="space-y-2 py-4">
        {navigation.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            className={cn(
              "flex items-center justify-center w-full p-2 rounded-lg transition-colors",
              pathname === item.href
                ? "bg-white/10 text-white"
                : "text-white/80 hover:bg-white/10 hover:text-white",
              isCollapsed ? "px-2" : "px-4"
            )}
          >
            <item.icon className={cn(
              "h-5 w-5",
              isCollapsed ? "mx-0" : "mr-2"
            )} />
            {!isCollapsed && <span>{item.name}</span>}
          </Link>
        ))}
      </div>

      {/* Help Button */}
      <div className="absolute bottom-4 left-0 right-0 p-2">
        <Button 
          variant="ghost" 
          size="lg"
          className={cn(
            "w-full justify-center text-white/80 hover:bg-white/10 hover:text-white",
            isCollapsed ? "px-2" : "px-4"
          )}
        >
          <HelpCircle className={cn(
            "h-5 w-5",
            isCollapsed ? "mx-0" : "mr-2"
          )} />
          {!isCollapsed && <span>Help</span>}
        </Button>
      </div>
    </ScrollArea>
  );
}