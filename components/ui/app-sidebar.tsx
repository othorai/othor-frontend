'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, MessageSquare, BarChart2, Settings } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
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
  const { state, isMobile } = useSidebar();

  if (isMobile) {
    return (
      <div className="flex justify-around items-center w-full h-full px-4">
        {navigation.map((item) => (
          <Link 
            key={item.name}
            href={item.href}
            className={`flex flex-col items-center p-2 rounded-lg ${
              pathname === item.href ? 'text-[#c000fa]' : 'text-gray-600'
            }`}
          >
            <item.icon className="h-6 w-6" />
            <span className="text-xs mt-1">{item.name}</span>
          </Link>
        ))}
      </div>
    );
  }

  return (
    <Sidebar className="border-r" collapsible="icon">
      <SidebarHeader className="border-b">
        <div className="flex items-center p-4">
          <div className="relative h-12 w-full flex items-center">
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
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="p-2">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigation.map((item) => (
                <SidebarMenuItem key={item.name}>
                  <SidebarMenuButton 
                    asChild 
                    tooltip={item.name} 
                    isActive={pathname === item.href} 
                    size="lg" 
                    className="p-4"
                  >
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
    </Sidebar>
  );
}