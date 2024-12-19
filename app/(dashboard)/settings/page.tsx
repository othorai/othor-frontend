// app/(dashboard)/settings/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from "@/hooks/use-toast";
import LikedNarrativesList from '@/components/settings/liked-narratives/liked-narratives-list';
import { 
  Sheet,
  SheetContent,
  SheetTrigger, SheetTitle
} from "@/components/ui/sheet";
import { Menu } from "lucide-react";

// Custom hooks
import { useOrganization } from '@/components/settings/hooks/use-organization';
import { useDataSource } from '@/components/settings/hooks/use-data-source';
import { useTeam } from '@/components/settings/hooks/use-team';


// Components
import { Sidebar } from '@/components/settings/sidebar';
import { useChat } from '@/context/ChatContext';
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

import HelpAndSupport from '@/components/settings/help-support/help-support-list';

export default function SettingsPage() {
  // State
  const [activeSidebarItem, setActiveSidebarItem] = useState('Workspaces');
  const [isCreateOrgModalOpen, setIsCreateOrgModalOpen] = useState(false);
  const [newOrgName, setNewOrgName] = useState('');
  const { clearStorage } = useChat();

  const wrappedHandleEditOrganization = async (orgId: string, name: string) => {
    await handleEditOrganization(orgId, name);
  };

  const wrappedHandleRemoveMember = async (userId: string) => {
    if (!activeOrganization) return;
    await handleRemoveMember(activeOrganization.id, userId);
  };

  const wrappedHandleUpdateMemberRole = async (userId: string, isAdmin: boolean) => {
    if (!activeOrganization) return;
    await handleUpdateMemberRole(activeOrganization.id, userId, isAdmin);
  };

  const handleEditWorkspaceWrapper = async (orgId: string, name: string) => {
    await handleEditOrganization(orgId, name);
    // Void the boolean return value
  };
  
  // Hooks
  const router = useRouter();
  const { toast } = useToast();
  
  // Custom hooks
  const {
    organizations,
    activeOrganization,
    currentUser,
    isLoading: isOrgLoading,
    initializeData,
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
      localStorage.clear();
      clearStorage();
      window.location.href = '/login';
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

  const handleWorkspaceSwitch = async (orgId: string): Promise<void> => {
    try {
      const success = await handleSwitchOrganization(orgId);
      if (success) {
        // Refetch the organization data to update the settings page state
        await initializeData();
        await fetchDataSources(orgId);
        await fetchTeamMembers(orgId);
        
        // Give a small delay to ensure state updates are complete
        await new Promise(resolve => setTimeout(resolve, 100));
        
        toast({
          title: "Success",
          description: "Organization switched successfully"
        });
      }
    } catch (error) {
      console.error('Error switching workspace:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to switch workspace"
      });
    }
  };

  // Effects
  useEffect(() => {
    console.log('Initializing settings data');
    initializeData();
  }, [initializeData]);

  useEffect(() => {
    if (activeOrganization?.id && !isOrgLoading) {
      console.log('Fetching organization-specific data');
      fetchDataSources(activeOrganization.id);
      fetchTeamMembers(activeOrganization.id);
    }
  }, [
    activeOrganization?.id,
    isOrgLoading,
    fetchDataSources,
    fetchTeamMembers
  ]);

  // Loading state
  const isLoading = isOrgLoading || isDataSourceLoading || isTeamLoading;

  return (
    <div className="flex h-screen bg-background">
      {/* Mobile Sidebar */}
      <div className="md:hidden fixed top-4 left-4 z-[60]">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon">
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 p-0">
            <SheetTitle className="sr-only">Settings Menu</SheetTitle>
            <Sidebar 
              activeSidebarItem={activeSidebarItem}
              setActiveSidebarItem={(item) => {
                setActiveSidebarItem(item);
                const closeButton = document.querySelector('[data-sheet-close]') as HTMLButtonElement;
                closeButton?.click();
              }}
              handleLogout={handleLogout}
            />
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden md:block">
        <Sidebar 
          activeSidebarItem={activeSidebarItem}
          setActiveSidebarItem={setActiveSidebarItem}
          handleLogout={handleLogout}
        />
      </div>
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
                  onSwitchWorkspace={handleWorkspaceSwitch}
                  onEditWorkspace={handleEditWorkspaceWrapper}
                  onDeleteWorkspace={handleDeleteOrganization}
                />
              )}
              {activeSidebarItem === 'Liked Narratives' && (
                <LikedNarrativesList />
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
              {activeSidebarItem === 'Team Members' && (
                <TeamList
                  teamMembers={teamMembers}
                  activeOrganization={activeOrganization}
                  currentUser={currentUser}
                  isLoading={isTeamLoading}
                  onAddMember={async (emailData) => {
                    if (!activeOrganization) return;
                    await handleAddMember(activeOrganization.id, emailData);
                  }}
                  onRemoveMember={wrappedHandleRemoveMember}
                  onUpdateMemberRole={wrappedHandleUpdateMemberRole}
                />
              )}

{activeSidebarItem === 'Help & Support' && (
  <HelpAndSupport />
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