// components/settings/workspaces/workspace-card.tsx
import { FC, useState } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

interface Organization {
  id: string;
  name: string;
  role?: string;
}

interface WorkspaceCardProps {
  organization: Organization;
  isActive: boolean;
  onSwitch: (orgId: string) => Promise<void>; 
  onEdit: (orgId: string, name: string) => Promise<void>;
  onDelete: (orgId: string) => Promise<void>;
}

export const WorkspaceCard: FC<WorkspaceCardProps> = ({ 
  organization,
  isActive,
  onSwitch,
  onEdit,
  onDelete
}) => {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editedName, setEditedName] = useState(organization.name);
  const [isSwitching, setIsSwitching] = useState(false);

  const handleSwitch = async () => {
    if (isActive) return;
    
    try {
      setIsSwitching(true);
      await onSwitch(organization.id);
    } catch (error) {
      console.error('Error switching organization:', error);
    }
  };

  return (
    <div className="flex items-center justify-between py-4">
      <div className="flex items-center space-x-4">
        <div className="font-medium">{organization.name}</div>
        {isActive && (
          <CheckCircle2 className="w-5 h-5 text-primary" />
        )}
      </div>
      <div className="space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handleSwitch}
          disabled={isSwitching || isActive}
        >
          {isSwitching ? 'Switching...' : isActive ? 'Current' : 'Switch'}
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsEditDialogOpen(true)}
        >
          Edit
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="text-red-600"
          onClick={() => onDelete(organization.id)}
          disabled={isActive}
        >
          Delete
        </Button>
      </div>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Workspace</DialogTitle>
            <DialogDescription>
              Update the name of your workspace.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Input
                id="name"
                value={editedName}
                onChange={(e) => setEditedName(e.target.value)}
                placeholder="Workspace name"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={async () => {
              await onEdit(organization.id, editedName);
              setIsEditDialogOpen(false);
            }}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};