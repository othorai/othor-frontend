// components/settings/team/team-member-card.tsx
import { FC } from 'react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface TeamMember {
  id: string;
  email: string;
  username?: string;
  is_admin: boolean;
}

interface TeamMemberCardProps {
  member: TeamMember;
  currentUserId: string;
  isCurrentUserAdmin: boolean;
  onRemove: (userId: string) => void;
}

export const TeamMemberCard: FC<TeamMemberCardProps> = ({
  member,
  currentUserId,
  isCurrentUserAdmin,
  onRemove,
}) => {
  const { id, email, username, is_admin } = member;
  const canRemoveMember = isCurrentUserAdmin && !member.is_admin && member.id !== currentUserId;

  return (
    <div className="flex items-center justify-between py-2">
      <div>
        <p className="font-medium">{username || email}</p>
        {username && <p className="text-sm text-muted-foreground">{email}</p>}
      </div>
      <div className="flex items-center space-x-2">
        {is_admin && (
          <Badge>Admin</Badge>
        )}
        {canRemoveMember && (
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-red-600 hover:text-red-700"
            onClick={() => onRemove(id)}
          >
            Remove
          </Button>
        )}
      </div>
    </div>
  );
};
