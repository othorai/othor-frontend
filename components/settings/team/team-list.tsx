// components/settings/team/team-list.tsx
import { FC } from 'react';
import { Plus } from 'lucide-react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TeamMemberCard } from './team-member-card';

interface TeamMember {
  id: string;
  email: string;
  username?: string;
  is_admin: boolean;
}

interface Organization {
  id: string;
  name: string;
}

interface TeamListProps {
  teamMembers: TeamMember[];
  activeOrganization: Organization | null;
  currentUser: { id: string; is_admin: boolean } | null;
  isLoading: boolean;
  onAddMember: () => void;
  onRemoveMember: (userId: string) => void;
}

export const TeamList: FC<TeamListProps> = ({
  teamMembers,
  activeOrganization,
  currentUser,
  isLoading,
  onAddMember,
  onRemoveMember,
}) => {
  return (
    <Card className="p-6">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-medium">Team Members</h3>
            {activeOrganization && (
              <p className="text-sm text-muted-foreground mt-1">
                {activeOrganization.name}
              </p>
            )}
          </div>
          {currentUser?.is_admin && (
            <Button onClick={onAddMember}>
              <Plus className="w-4 h-4 mr-2" />
              Add Member
            </Button>
          )}
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        ) : (
          <div className="space-y-4">
            {teamMembers.length > 0 ? (
              teamMembers.map((member) => (
                <TeamMemberCard
                  key={member.id}
                  member={member}
                  currentUserId={currentUser?.id || ''}
                  isCurrentUserAdmin={currentUser?.is_admin || false}
                  onRemove={onRemoveMember}
                />
              ))
            ) : (
              <div className="text-center text-muted-foreground py-8">
                No team members found
              </div>
            )}
          </div>
        )}
      </div>
    </Card>
  );
};