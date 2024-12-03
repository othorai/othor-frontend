// app/(dashboard)/settings/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from "@/hooks/use-toast";

// Custom hooks
import { useOrganization } from '@/components/settings/hooks/use-organization';
import { useDataSource } from '@/components/settings/hooks/use-data-source';
import { useTeam } from '@/components/settings/hooks/use-team';

// Components
import { Sidebar } from '@/components/settings/sidebar';
import { WorkspacesList } from '@/components/settings/workspaces/workspaces-list';
import { DataSourcesList } from '@/components/settings/data-sources/data-sources-list';
import { TeamList } from '@/components/settings/team/team-list';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function SettingsPage() {
  // State
  const [activeSidebarItem, setActiveSidebarItem] = useState('Workspaces');
  const [isCreateOrgModalOpen, setIsCreateOrgModalOpen] = useState(false);
  const [newOrgName, setNewOrgName] = useState('');
  
  // Hooks
  const router = useRouter();
  const { toast } = useToast();
  
  // Custom hooks
  const {
    organizations,
    activeOrganization,
    currentUser,
    isLoading: isOrgLoading,
    fetchCurrentUser,
    fetchUserOrganizations,
    handleCreateOrg,
    handleSwitchOrganization,
    handleEditOrganization,
    handleDeleteOrganization,
  } = useOrganization();

  const {
    dataSources,
    isLoading: isDataSourceLoading,
    fetchDataSources,
    handleConnectDataSource,
    handleEditDataSource,
    handleDeleteDataSource,
  } = useDataSource();

  const {
    teamMembers,
    isLoading: isTeamLoading,
    fetchTeamMembers,
    handleAddMember,
    handleRemoveMember,
    handleUpdateMemberRole,
  } = useTeam();

  // Handlers
  const handleLogout = async () => {
    try {
      localStorage.removeItem('authToken');
      router.push('/login');
    } catch (error) {
      console.error('Error logging out:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to logout"
      });
    }
  };

  const handleCreateWorkspace = async () => {
    const success = await handleCreateOrg(newOrgName);
    if (success) {
      setNewOrgName('');
      setIsCreateOrgModalOpen(false);
    }
  };

  // Effects
  useEffect(() => {
    const initializeSettings = async () => {
      try {
        await Promise.all([
          fetchUserOrganizations(),
          fetchCurrentUser()
        ]);
      } catch (error) {
        console.error('Error initializing settings:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load settings data"
        });
      }
    };

    initializeSettings();
  }, [fetchUserOrganizations, fetchCurrentUser]);

  useEffect(() => {
    if (activeOrganization?.id) {
      fetchDataSources(activeOrganization.id);
      fetchTeamMembers(activeOrganization.id);
    }
  }, [activeOrganization?.id, fetchDataSources, fetchTeamMembers]);

  // Loading state
  const isLoading = isOrgLoading || isDataSourceLoading || isTeamLoading;

  return (
    <div className="flex h-screen bg-background">
      <Sidebar 
        activeSidebarItem={activeSidebarItem}
        setActiveSidebarItem={setActiveSidebarItem}
        handleLogout={handleLogout}
      />
      <main className="flex-1 overflow-y-auto p-8">
        <div className="max-w-5xl mx-auto space-y-6">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4" />
                <p className="text-muted-foreground">Loading settings...</p>
              </div>
            </div>
          ) : (
            <>
              {activeSidebarItem === 'Workspaces' && (
                <WorkspacesList
                  organizations={organizations}
                  activeOrganization={activeOrganization}
                  onCreateWorkspace={() => setIsCreateOrgModalOpen(true)}
                  onSwitchWorkspace={handleSwitchOrganization}
                  onEditWorkspace={handleEditOrganization}
                  onDeleteWorkspace={handleDeleteOrganization}
                />
              )}
              {activeSidebarItem === 'Data sources' && (
                <DataSourcesList
                  dataSources={dataSources}
                  onConnectSource={(sourceData) => 
                    activeOrganization && handleConnectDataSource(activeOrganization.id, sourceData)
                  }
                  onEditSource={(sourceId, sourceData) => 
                    activeOrganization && handleEditDataSource(activeOrganization.id, sourceId, sourceData)
                  }
                  onDeleteSource={(sourceId) => 
                    activeOrganization && handleDeleteDataSource(activeOrganization.id, sourceId)
                  }
                />
              )}
              {activeSidebarItem === 'Team' && (
                <TeamList
                  teamMembers={teamMembers}
                  activeOrganization={activeOrganization}
                  currentUser={currentUser}
                  isLoading={isTeamLoading}
                  onAddMember={(emailData) => 
                    activeOrganization && handleAddMember(activeOrganization.id, emailData)
                  }
                  onRemoveMember={(userId) => 
                    activeOrganization && handleRemoveMember(activeOrganization.id, userId)
                  }
                  onUpdateMemberRole={(userId, isAdmin) =>
                    activeOrganization && handleUpdateMemberRole(activeOrganization.id, userId, isAdmin)
                  }
                />
              )}
            </>
          )}
        </div>
      </main>

      <Dialog open={isCreateOrgModalOpen} onOpenChange={setIsCreateOrgModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Workspace</DialogTitle>
            <DialogDescription>
              Enter the name for your new Workspace.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Input
                id="name"
                placeholder="Workspace name"
                value={newOrgName}
                onChange={(e) => setNewOrgName(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateOrgModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateWorkspace}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}