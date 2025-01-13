// components/settings/team/add-member-modal.tsx

import { FC, useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AddMemberModal } from './add-member-modal';
import { useTeam } from '@/components/settings/hooks/use-team';

const maxTeamMembers = process.env.NEXT_PUBLIC_TEAM_MEMBERS 
  ? Number(process.env.NEXT_PUBLIC_TEAM_MEMBERS) 
  : null;

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
  onUpdateMemberRole
}) => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isAddingMember, setIsAddingMember] = useState(false);

  const isLimitReached = maxTeamMembers !== null && teamMembers.length >= maxTeamMembers;
  const memberDisplay = maxTeamMembers !== null ? `(${teamMembers.length}/${maxTeamMembers})` : `(${teamMembers.length})`;

  const handleAddMemberSubmit = async (emailData: { email: string }) => {
    setIsAddingMember(true);
    try {
      await onAddMember(emailData);
      setIsAddModalOpen(false);
    } finally {
      setIsAddingMember(false);
    }
  };

  const handleRemoveMemberClick = async (userId: string) => {
    await onRemoveMember(userId);
  };

  const handleUpdateRole = async (userId: string, isAdmin: boolean) => {
    await onUpdateMemberRole(userId, isAdmin);
  };

  return (
    <Card className="p-6">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-medium">Team Members {memberDisplay}</h3>
            {activeOrganization && (
              <p className="text-sm text-muted-foreground mt-1">
                {activeOrganization.name}
              </p>
            )}
          </div>
          {currentUser?.is_admin && (
            <Button 
              onClick={() => setIsAddModalOpen(true)}
              disabled={isLimitReached}
            >
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
                <div 
                  key={member.id} 
                  className="flex items-center justify-between py-3 border-b last:border-0"
                >
                  <div>
                    <p className="font-medium">{member.username || member.email}</p>
                    {member.username && (
                      <p className="text-sm text-muted-foreground">{member.email}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-4">
                    {member.is_admin && (
                      <Badge variant="secondary">Admin</Badge>
                    )}
                    {currentUser?.is_admin && member.id !== currentUser.id && (
                      <>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleUpdateRole(member.id, !member.is_admin)}
                        >
                          {member.is_admin ? 'Remove Admin' : 'Make Admin'}
                        </Button>
                        {!member.is_admin && (
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-red-600 hover:text-red-700"
                            onClick={() => handleRemoveMemberClick(member.id)}
                          >
                            Remove
                          </Button>
                        )}
                      </>
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

      <AddMemberModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleAddMemberSubmit}
        isLoading={isAddingMember}
      />
    </Card>
  );
};