// components/settings/sidebar.tsx
import { FC } from 'react';
import { LogOut, Database, Building2, Users, LucideIcon, Heart, CircleHelp } from 'lucide-react';

interface SidebarItem {
  name: string;
  icon: LucideIcon;
  className?: string;
}

interface SidebarProps {
  activeSidebarItem: string;
  setActiveSidebarItem: (item: string) => void;
  handleLogout: () => void;
}

const SIDEBAR_ITEMS: SidebarItem[] = [
  { name: 'Workspaces', icon: Building2 },
  { name: 'Data sources', icon: Database },
  { name: 'Team Members', icon: Users },
  { name: 'Liked Narratives', icon: Heart },
  { name: 'Help & Support', icon: CircleHelp},
  { name: 'Logout', icon: LogOut, className: 'text-red-600 hover:text-red-700' }
];

export const Sidebar: FC<SidebarProps> = ({
  activeSidebarItem,
  setActiveSidebarItem,
  handleLogout,
}) => {
  return (
    <div className="w-64 border-r bg-background h-full">
      <div className="p-6">
        <h2 className="text-lg font-semibold">Settings</h2>
      </div>
      <nav className="space-y-1 px-3">
        {SIDEBAR_ITEMS.map(item => (
          <button
            key={item.name}
            onClick={() => item.name === 'Logout' ? handleLogout() : setActiveSidebarItem(item.name)}
            className={`
              flex items-center w-full px-3 py-2 text-base rounded-md transition-colors
              ${activeSidebarItem === item.name 
                ? 'bg-primary/10 text-primary' 
                : 'text-muted-foreground hover:bg-muted'}
              ${item.className || ''}
            `}
          >
            <item.icon className="w-4 h-4 mr-3" />
            {item.name}
          </button>
        ))}
      </nav>
    </div>
  );
};