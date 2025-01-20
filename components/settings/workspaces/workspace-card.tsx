// components/settings/workspaces/workspace-card.tsx
import { FC, useState, useEffect } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
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
  const [localIsActive, setLocalIsActive] = useState(isActive);
  const isAdmin = organization.role === 'admin';

  useEffect(() => {
    setLocalIsActive(isActive);
  }, [isActive]);

  const handleSwitch = async () => {
    if (localIsActive) return;
    
    try {
      setIsSwitching(true);
      setLocalIsActive(true);  // Set active immediately
      await onSwitch(organization.id);
    } catch (error) {
      console.error('Error switching organization:', error);
      setLocalIsActive(false);  // Reset on error
    } finally {
      setIsSwitching(false);
    }
  };

  return (
    <div className="flex items-center justify-between py-4">
      <div className="flex items-center space-x-4">
        <div className="font-medium">{organization.name}</div>
        {localIsActive && (
          <CheckCircle2 className="w-5 h-5 text-primary" />
        )}
      </div>
      <div className="space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handleSwitch}
          disabled={localIsActive || isSwitching}
          className={cn(
            "min-w-[100px]",
            localIsActive && "border-green-500 text-green-500 hover:text-green-500 hover:border-green-500 bg-transparent opacity-100"
          )}
        >
          {localIsActive ? "Current" : isSwitching ? "Switching..." : "Switch"}
        </Button>
        {isAdmin && (
          <>
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
              disabled={localIsActive}
            >
              Delete
            </Button>
          </>
        )}
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