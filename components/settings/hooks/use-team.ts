import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from "@/hooks/use-toast";
import { API_URL } from '@/lib/config';


interface TeamMember {
  id: string;
  email: string;
  username?: string;
  is_admin: boolean;
}

interface UseTeamReturn {
  teamMembers: TeamMember[];
  isLoading: boolean;
  fetchTeamMembers: (organizationId: string) => Promise<void>;
  handleAddMember: (organizationId: string, emailData: { email: string }) => Promise<boolean>;
  handleRemoveMember: (organizationId: string, userId: string) => Promise<boolean>;
  handleUpdateMemberRole: (organizationId: string, userId: string, isAdmin: boolean) => Promise<boolean>;
}

export function useTeam(): UseTeamReturn {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const fetchTeamMembers = useCallback(async (organizationId: string) => {
    if (!organizationId) {
      setTeamMembers([]);
      return;
    }

    try {
      setIsLoading(true);
      const token = localStorage.getItem('authToken');
      if (!token) {
        router.push('/login');
        return;
      }

      const response = await fetch(`${API_URL}/api/v1/organizations/${organizationId}/users`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to fetch team members: ${response.status}`);
      }

      const data = await response.json();
      setTeamMembers(data);
    } catch (error) {
      console.error('Error fetching team members:', error);
      setTeamMembers([]);
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to fetch team members"
      });
    } finally {
      setIsLoading(false);
    }
  }, [router, toast]);

  const handleAddMember = async (
    organizationId: string,
    emailData: { email: string }
  ): Promise<boolean> => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        toast({
          title: "Error",
          description: "Authentication required",
          variant: "destructive",
        });
        return false;
      }

      const response = await fetch(`${API_URL}/authorization/find-by-email`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(emailData.email)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to add user to organization');
      }

      await fetchTeamMembers(organizationId);
      
      toast({
        title: "Success",
        description: "Team member added successfully"
      });
      return true;
    } catch (error) {
      console.error('Error adding team member:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to add team member"
      });
      return false;
    }
  };

  const handleRemoveMember = async (
    organizationId: string,
    userId: string
  ): Promise<boolean> => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(
        `${API_URL}/api/v1/organizations/${organizationId}/users/${userId}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to remove team member');
      }

      setTeamMembers(prev => prev.filter(member => member.id !== userId));
      toast({
        title: "Success",
        description: "Team member removed successfully"
      });
      return true;
    } catch (error) {
      console.error('Error removing team member:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to remove team member"
      });
      return false;
    }
  };

  const handleUpdateMemberRole = async (
    organizationId: string,
    userId: string,
    isAdmin: boolean
  ): Promise<boolean> => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(
        `/api/organizations/${organizationId}/users/${userId}/role`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ is_admin: isAdmin })
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update member role');
      }

      setTeamMembers(prev => prev.map(member => 
        member.id === userId ? { ...member, is_admin: isAdmin } : member
      ));

      toast({
        title: "Success",
        description: "Member role updated successfully"
      });
      return true;
    } catch (error) {
      console.error('Error updating member role:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update member role"
      });
      return false;
    }
  };

  return {
    teamMembers,
    isLoading,
    fetchTeamMembers,
    handleAddMember,
    handleRemoveMember,
    handleUpdateMemberRole,
  };
}