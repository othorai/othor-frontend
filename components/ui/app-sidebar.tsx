'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, MessageSquare, BarChart2, Settings, ChevronFirst, ChevronLast } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarGroup,
  SidebarGroupContent,
} from "./sidebar";
import { useSidebar } from "./sidebar";

const navigation = [
  { name: 'Home', href: '/home', icon: Home },
  { name: 'Chat', href: '/chat', icon: MessageSquare },
  { name: 'Charts', href: '/metrics', icon: BarChart2 },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export function AppSidebar() {
  const pathname = usePathname();
  const { state, toggleSidebar } = useSidebar();

  const ToggleButton = () => (
    <button onClick={toggleSidebar} className="h-6 w-6 flex items-center justify-center">
      {state === "collapsed" ? (
        <ChevronLast className="h-8 w-8" />
      ) : (
        <ChevronFirst className="h-8 w-8" />
      )}
    </button>
  );

  return (
    <Sidebar className="border-r" collapsible="icon">
      <SidebarHeader className="border-b">
        <div className="flex items-center justify-between p-4">
          <button 
            onClick={toggleSidebar} 
            className="relative h-12 w-full flex items-center"
          >
            <img
              src="/images/othor-logo.png"
              alt="Othor AI"
              className={`absolute h-12 object-contain transition-all duration-300 ${
                state === "collapsed" ? "opacity-0 scale-0" : "opacity-100 scale-100"
              }`}
            />
            <img
              src="/images/othor-icon.png"
              alt="Othor Symbol"
              className={`absolute h-12 w-12 object-contain transition-all duration-300 ${
                state === "collapsed" ? "opacity-100 scale-100" : "opacity-0 scale-0"
              }`}
            />
          </button>
        </div>
      </SidebarHeader>

      <SidebarContent className="p-2">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigation.map((item) => (
                <SidebarMenuItem key={item.name}>
                  <SidebarMenuButton asChild tooltip={item.name} isActive={pathname === item.href} size="lg" className="p-4">
                    <Link href={item.href} className="flex items-center w-full">
                      <item.icon className="h-8 w-8 mr-4" />
                      <span className="text-lg">{item.name}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t p-4">
        <div className="flex justify-center">
          <ToggleButton />
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}