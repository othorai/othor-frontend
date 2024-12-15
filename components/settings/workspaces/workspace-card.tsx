// components/settings/workspaces/workspace-card.tsx
import { FC } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { Button } from "@/components/ui/button";

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
  onDelete: (orgId: string) => void;
}

export const WorkspaceCard: FC<WorkspaceCardProps> = ({ 
  organization,
  isActive,
  onSwitch,
  onEdit,
  onDelete
}) => {
  const handleSwitch = async () => {
    try {
      await onSwitch(organization.id);
    } catch (error) {
      console.error('Error switching organization:', error);
    }
  };

  const handleEdit = async () => {
    try {
      await onEdit(organization.id, organization.name);
    } catch (error) {
      console.error('Error editing organization:', error);
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
        >
          Switch
        </Button>
        <Button 
          variant="outline" 
          size="sm"
          onClick={handleEdit}  
        >
          Edit
        </Button>
        <Button 
          variant="outline" 
          size="sm" 
          className="text-red-600"
          onClick={() => onDelete(organization.id)}
        >
          Delete
        </Button>
      </div>
    </div>
  );
};