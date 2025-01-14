// components/settings/workspaces/workspaces-list.tsx
import { FC, useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { WorkspaceCard } from './workspace-card';

const maxWorkspaces = process.env.NEXT_PUBLIC_MAX_WORKSPACES 
  ? Number(process.env.NEXT_PUBLIC_MAX_WORKSPACES) 
  : null;

interface Organization {
  id: string;
  name: string;
  role?: string;
}

interface WorkspacesListProps {
  organizations: Organization[];
  activeOrganization: Organization | null;
  onCreateWorkspace: () => void;
  onSwitchWorkspace: (orgId: string) => Promise<void>;
  onEditWorkspace: (orgId: string, name: string) => Promise<void>;
  onDeleteWorkspace: (orgId: string) => Promise<void>;
}

export const WorkspacesList: FC<WorkspacesListProps> = ({
  organizations,
  activeOrganization,
  onCreateWorkspace,
  onSwitchWorkspace,
  onEditWorkspace,
  onDeleteWorkspace
}) => {

  const isLimitReached = maxWorkspaces !== null && organizations.length >= maxWorkspaces;
  const workspaceDisplay = maxWorkspaces !== null ? `(${organizations.length}/${maxWorkspaces})` : `(${organizations.length})`;

  // Get the current organization ID directly from localStorage
  const [currentOrgId, setCurrentOrgId] = useState(() => 
    localStorage.getItem('currentOrgId')
  );

  // Update currentOrgId whenever localStorage changes
  useEffect(() => {
    setCurrentOrgId(localStorage.getItem('currentOrgId'));
  }, [activeOrganization?.id]); // Update when activeOrganization changes

  return (
    <Card className="p-6">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium">Workspaces {workspaceDisplay}</h3>
          <Button 
            onClick={onCreateWorkspace}
            disabled={isLimitReached}
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Workspace
          </Button>
        </div>
        <div className="divide-y">
          {organizations.map(org => (
            <WorkspaceCard
              key={org.id}
              organization={org}
              isActive={org.id === currentOrgId}
              onSwitch={onSwitchWorkspace}
              onEdit={onEditWorkspace}
              onDelete={onDeleteWorkspace}
            />
          ))}
          {organizations.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No workspaces found. Create your first workspace to get started.
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};