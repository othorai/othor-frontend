'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  LogOut, 
  Database, 
  Building2, 
  Plus, 
  X, 
  CheckCircle2,
  ChevronDown,
  Settings as SettingsIcon,
  Edit,
  Trash2
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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

interface DataSource {
  id: string;
  source_type: string;
  connected: boolean;
  connection_details: {
    database: string;
    host: string;
  };
  table_name: string;
}

const Sidebar = ({ activeSidebarItem, setActiveSidebarItem, handleLogout }) => (
  <div className="w-64 border-r bg-background h-full">
    <div className="p-6">
      <h2 className="text-lg font-semibold">Settings</h2>
    </div>
    <nav className="space-y-1 px-3">
      {[
        { name: 'Workspaces', icon: Building2 },
        { name: 'Data sources', icon: Database },
        { name: 'Team', icon: Users },
        { name: 'Logout', icon: LogOut, className: 'text-red-600 hover:text-red-700' }
      ].map(item => (
        <button
          key={item.name}
          onClick={() => item.name === 'Logout' ? handleLogout() : setActiveSidebarItem(item.name)}
          className={`
            flex items-center w-full px-3 py-2 text-base rounded-md transition-colors
            ${activeSidebarItem === item.name 
              ? 'bg-primary/10 text-primary' 
              : 'text-muted-foreground hover:bg-muted'}
            ${item.className || ''}
          `}
        >
          <item.icon className="w-4 h-4 mr-3" />
          {item.name}
        </button>
      ))}
    </nav>
  </div>
);

export default function SettingsPage() {
  const [activeSidebarItem, setActiveSidebarItem] = useState('Workspaces');
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [activeOrganization, setActiveOrganization] = useState<Organization | null>(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [dataSources, setDataSources] = useState<DataSource[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateOrgModalOpen, setIsCreateOrgModalOpen] = useState(false);
  const [newOrgName, setNewOrgName] = useState('');
  const router = useRouter();
  const { toast } = useToast();

  const fetchCurrentUser = async () => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      router.push('/login');
      return;
    }

    try {
      const response = await fetch('/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch user data');
      }

      const userData = await response.json();
      setCurrentUser(userData);
    } catch (error) {
      console.error('Error fetching user:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to fetch user information"
      });
    }
  };

  const fetchUserOrganizations = async () => {
    const token = localStorage.getItem('authToken');
    if (!token) return;

    try {
      const response = await fetch('/api/organizations', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (!response.ok) throw new Error('Failed to fetch workspaces');
      
      const data = await response.json();
      setOrganizations(data);
      
      if (!activeOrganization && data.length > 0) {
        setActiveOrganization(data[0]);
      }
    } catch (error) {
      console.error('Error fetching workspaces:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch workspaces"
      });
    }
  };

  const fetchDataSources = useCallback(async () => {
    if (!activeOrganization) {
      setDataSources([]);
      return;
    }

    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        router.push('/login');
        return;
      }

      const response = await fetch(
        `/api/data-source/${activeOrganization.id}/data-sources`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch data sources');
      }

      const data = await response.json();
      setDataSources(data.data_sources || []);
    } catch (error) {
      console.error('Error fetching data sources:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch data sources"
      });
    }
  }, [activeOrganization, router, toast]);

  const [teamMembersLoading, setTeamMembersLoading] = useState(false);

  // Update the fetchTeamMembers function
  const fetchTeamMembers = useCallback(async () => {
    if (!activeOrganization?.id) {
      setTeamMembers([]);
      return;
    }
  
    try {
      setTeamMembersLoading(true);
      const token = localStorage.getItem('authToken');
      if (!token) {
        router.push('/login');
        return;
      }
  
      console.log('Fetching team members for org:', activeOrganization.id);
  
      const response = await fetch(`/api/organizations/${activeOrganization.id}/users`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        cache: 'no-store'
      });
  
      const data = await response.json();
      console.log('Team members response:', data);
  
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch team members');
      }
  
      if (Array.isArray(data)) {
        setTeamMembers(data);
      } else {
        console.warn('Unexpected response format:', data);
        setTeamMembers([]);
      }
    } catch (error) {
      console.error('Error fetching team members:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to fetch team members"
      });
      setTeamMembers([]);
    } finally {
      setTeamMembersLoading(false);
    }
  }, [activeOrganization?.id, router, toast]);
  
  // Update useEffect
  useEffect(() => {
    if (activeOrganization?.id) {
      console.log('Active organization changed, fetching team members'); // Debug log
      fetchTeamMembers();
    }
  }, [activeOrganization?.id, fetchTeamMembers]);
  
  // Add these team-related functions
  const handleAddMember = async (emailData: { email: string }) => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token || !activeOrganization) {
        toast({
          title: "Error",
          description: "Please select an organization first",
          variant: "destructive",
        });
        return;
      }
  
      // First find the user by email
      const findUserResponse = await fetch('/api/auth/find-user', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: emailData.email })
      });
  
      if (!findUserResponse.ok) {
        const error = await findUserResponse.json();
        throw new Error(error.message || 'Failed to find user');
      }
  
      const userData = await findUserResponse.json();
  
      // Then add the user to the organization
      const response = await fetch(`/api/organizations/${activeOrganization.id}/users`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: userData.id })
      });
  
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to add user to organization');
      }
  
      toast({
        title: "Success",
        description: "Team member added successfully"
      });
  
      // Refresh team members list
      fetchTeamMembers();
      setIsCreateOrgModalOpen(false);
    } catch (error) {
      console.error('Error adding team member:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to add team member"
      });
    }
  };
  
  const handleRemoveUser = async (userId: string) => {
    try {
      if (!activeOrganization) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "No active organization selected"
        });
        return;
      }
  
      const token = localStorage.getItem('authToken');
      const response = await fetch(`/api/organizations/${activeOrganization.id}/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
  
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to remove team member');
      }
  
      toast({
        title: "Success",
        description: "Team member removed successfully"
      });
  
      // Refresh team members list
      fetchTeamMembers();
    } catch (error) {
      console.error('Error removing team member:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to remove team member"
      });
    }
  };

  const handleCreateOrg = async () => {
    if (!newOrgName.trim()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Workspace name is required"
      });
      return;
    }

    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('/api/organizations', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: newOrgName }),
      });

      if (!response.ok) throw new Error('Failed to create workspace');

      const newOrg = await response.json();
      setOrganizations(prev => [...prev, newOrg]);
      setNewOrgName('');
      setIsCreateOrgModalOpen(false);
      toast({
        title: "Success",
        description: "workspace created successfully"
      });
    } catch (error) {
      console.error('Error creating workspace:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to create workspace"
      });
    }
  };

  const handleSwitchOrganization = async (orgId) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`/api/organizations/${orgId}/switch`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error('Failed to switch workspace');

      const data = await response.json();
      localStorage.setItem('authToken', data.access_token);
      setActiveOrganization(organizations.find(org => org.id === orgId));
      toast({
        title: "Success",
        description: "Workspace switched successfully"
      });
    } catch (error) {
      console.error('Error switching workspace:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to switch workspace"
      });
    }
  };

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
      } finally {
        setIsLoading(false);
      }
    };

    initializeSettings();
  }, []);

  useEffect(() => {
    if (activeOrganization) {
      fetchDataSources();
      fetchTeamMembers();
    }
  }, [activeOrganization, fetchDataSources, fetchTeamMembers]);

  const OrganizationsList = () => (
    <Card className="p-6">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium">Workspaces</h3>
          <Button onClick={() => setIsCreateOrgModalOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Create Workspace
          </Button>
        </div>
        <div className="divide-y">
          {organizations.map(org => (
            <div key={org.id} className="flex items-center justify-between py-4">
              <div className="flex items-center space-x-4">
                <div className="font-medium">{org.name}</div>
                {activeOrganization?.id === org.id && (
                  <CheckCircle2 className="w-5 h-5 text-primary" />
                )}
              </div>
              <div className="space-x-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleSwitchOrganization(org.id)}
                >
                  Switch
                </Button>
                <Button variant="outline" size="sm">Edit</Button>
                <Button variant="outline" size="sm" className="text-red-600">
                  Delete
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );

  const DataSourcesList = () => (
    <Card className="p-6">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium">Data Sources</h3>
          <Button
            onClick={() => {/* Handle connect data source */}}
            disabled={dataSources.length >= 5}
          >
            <Plus className="w-4 h-4 mr-2" />
            Connect Data Source ({dataSources.length}/5)
          </Button>
        </div>
        <div className="space-y-4">
          {dataSources.map((source) => (
            <Card key={source.id} className="p-4">
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="font-medium">{source.source_type.toUpperCase()}</h4>
                  <p className="text-sm text-muted-foreground">
                    {source.connection_details.database} • {source.connection_details.host}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Table: {source.table_name}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant={source.connected ? "success" : "destructive"}>
                    {source.connected ? 'Connected' : 'Disconnected'}
                  </Badge>
                  <Button variant="ghost" size="sm">
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm" className="text-red-600">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </Card>
  );

  const TeamList = () => (
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
            <Button onClick={() => setIsCreateOrgModalOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Member
            </Button>
          )}
        </div>
  
        {teamMembersLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="space-y-4">
            {teamMembers.length > 0 ? (
              teamMembers.map((member) => (
                <div key={member.id} className="flex items-center justify-between py-2">
                  <div>
                    <p className="font-medium">{member.username || member.email}</p>
                    <p className="text-sm text-muted-foreground">{member.email}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    {member.is_admin && (
                      <Badge>Admin</Badge>
                    )}
                    {currentUser?.is_admin && !member.is_admin && member.id !== currentUser.id && (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-red-600 hover:text-red-700"
                        onClick={() => handleRemoveUser(member.id)}
                      >
                        Remove
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
              {activeSidebarItem === 'Workspaces' && <OrganizationsList />}
              {activeSidebarItem === 'Data sources' && <DataSourcesList />}
              {activeSidebarItem === 'Team' && <TeamList />}
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
                placeholder="Worskpace name"
                value={newOrgName}
                onChange={(e) => setNewOrgName(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateOrgModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateOrg}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}