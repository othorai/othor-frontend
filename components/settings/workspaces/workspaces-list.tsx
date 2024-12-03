// components/settings/workspaces/workspaces-list.tsx
import { FC } from 'react';
import { Plus } from 'lucide-react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { WorkspaceCard } from './workspace-card';

interface Organization {
  id: string;
  name: string;
  role?: string;
}

interface WorkspacesListProps {
  organizations: Organization[];
  activeOrganization: Organization | null;
  onCreateWorkspace: () => void;
  onSwitchWorkspace: (orgId: string) => void;
  onEditWorkspace: (orgId: string) => void;
  onDeleteWorkspace: (orgId: string) => void;
}

export const WorkspacesList: FC<WorkspacesListProps> = ({
  organizations,
  activeOrganization,
  onCreateWorkspace,
  onSwitchWorkspace,
  onEditWorkspace,
  onDeleteWorkspace
}) => {
  return (
    <Card className="p-6">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium">Workspaces</h3>
          <Button onClick={onCreateWorkspace}>
            <Plus className="w-4 h-4 mr-2" />
            Create Workspace
          </Button>
        </div>
        <div className="divide-y">
          {organizations.map(org => (
            <WorkspaceCard
              key={org.id}
              organization={org}
              isActive={activeOrganization?.id === org.id}
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