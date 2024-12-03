// components/settings/team/team-list.tsx
import { FC } from 'react';
import { Plus } from 'lucide-react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface Organization {
  id: string;
  name: string;
  role?: string;
}

interface TeamMember {
  id: string;
  email: string;
  username?: string;
  is_admin: boolean;
}

interface TeamListProps {
  teamMembers: TeamMember[];
  activeOrganization: Organization | null;
  currentUser: { id: string; is_admin: boolean } | null;
  isLoading: boolean;
  onAddMember: (emailData: { email: string }) => Promise<void>;
  onRemoveMember: (userId: string) => Promise<void>;
  onUpdateMemberRole: (userId: string, isAdmin: boolean) => Promise<void>;
}

export const TeamList: FC<TeamListProps> = ({
  teamMembers,
  activeOrganization,
  currentUser,
  isLoading,
  onAddMember,
  onRemoveMember,
  onUpdateMemberRole,
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
            <Button onClick={() => onAddMember({ email: '' })}>
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
                <div key={member.id} className="flex items-center justify-between py-2">
                  <div>
                    <p className="font-medium">{member.username || member.email}</p>
                    {member.username && (
                      <p className="text-sm text-muted-foreground">{member.email}</p>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    {member.is_admin && (
                      <Badge variant="secondary">Admin</Badge>
                    )}
                    {currentUser?.is_admin && !member.is_admin && member.id !== currentUser.id && (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-red-600 hover:text-red-700"
                        onClick={() => onRemoveMember(member.id)}
                      >
                        Remove
                      </Button>
                    )}
                    {currentUser?.is_admin && member.id !== currentUser.id && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onUpdateMemberRole(member.id, !member.is_admin)}
                      >
                        {member.is_admin ? 'Remove Admin' : 'Make Admin'}
                      </Button>
                    )}
                  </div>
                </div>
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