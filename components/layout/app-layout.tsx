'use client';

import { NavContent } from './nav-content';
import React, { useState } from 'react';
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Home, 
  MessageSquare,
  BarChart2,
  Settings,
  Menu,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const navigation = [
  { name: 'Home', href: '/home', icon: Home },
  { name: 'Chat', href: '/chat', icon: MessageSquare },
  { name: 'Charts', href: '/metrics', icon: BarChart2 },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isRightPanelOpen, setIsRightPanelOpen] = useState(true);
  const [isMobile, setIsMobile] = React.useState(false);
  const pathname = usePathname();

  React.useEffect(() => {
    const checkWindowSize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkWindowSize();
    window.addEventListener('resize', checkWindowSize);
    return () => window.removeEventListener('resize', checkWindowSize);
  }, []);

  return (
    <div className="flex min-h-screen bg-background">
      {isMobile ? (
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden fixed top-4 left-4 z-50">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 bg-gradient-to-b from-[#c000fa] to-[#9100bd]">
            <NavContent isCollapsed={false} pathname={pathname} />
          </SheetContent>
        </Sheet>
      ) : (
        <div
          className={cn(
            "h-screen bg-gradient-to-b from-[#c000fa] to-[#9100bd] border-r transition-all duration-300",
            isCollapsed ? "w-16" : "w-64"
          )}
        >
          <div className="h-16 px-3 flex items-center justify-between border-b border-white/10">
            <div className="flex items-center">
              <img 
                src="/images/full-logo-othor.png" 
                alt="Othor AI"
                className={cn(
                  "transition-all duration-300",
                  isCollapsed ? "w-8" : "w-32"
                )}
              />
            </div>
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="text-white hover:bg-white/10"
            >
              {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
            </Button>
          </div>
          <NavContent isCollapsed={isCollapsed} pathname={pathname} />
        </div>
      )}

      <main className="flex-1 overflow-y-auto bg-muted/20">
        <div className="container mx-auto py-6">
          {children}
        </div>
      </main>

      {isRightPanelOpen && (
        <div className="w-80 border-l bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <ScrollArea className="h-full">
            {/* Right panel content */}
          </ScrollArea>
        </div>
      )}
    </div>
  );
}
