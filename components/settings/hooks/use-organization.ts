// components/settings/hooks/use-organization.ts
import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from "@/hooks/use-toast";
import { API_URL } from '@/lib/config';


interface Organization {
  id: string;
  name: string;
  role?: string;
}

interface UseOrganizationReturn {
  organizations: Organization[];
  activeOrganization: Organization | null;
  currentUser: any;
  isLoading: boolean;
  initializeData: () => Promise<void>;
  fetchCurrentUser: () => Promise<void>;
  fetchUserOrganizations: () => Promise<void>;
  handleCreateOrg: (name: string) => Promise<boolean>;
  handleSwitchOrganization: (orgId: string) => Promise<boolean>;
  handleEditOrganization: (orgId: string, name: string) => Promise<boolean>;
  handleDeleteOrganization: (orgId: string) => Promise<boolean>;
  setActiveOrganization: (org: Organization | null) => void;
}

export function useOrganization(): UseOrganizationReturn {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [activeOrganization, setActiveOrganization] = useState<Organization | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const router = useRouter();
  const { toast } = useToast();

  const fetchCurrentUser = useCallback(async () => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      router.push('/login');
      return;
    }

    try {
      console.log('Fetching user data from API');
      const response = await fetch(`${API_URL}/authorization/me`, {
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
      console.log('User data fetched successfully');
      setCurrentUser(userData);
    } catch (error) {
      console.error('Error fetching user:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to fetch user information"
      });
    }
  }, [router, toast]);

  const fetchUserOrganizations = useCallback(async () => {
    const token = localStorage.getItem('authToken');
    if (!token) return;

    try {
      console.log('Fetching organizations data');
      const response = await fetch(`${API_URL}/api/v1/organizations/`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (!response.ok) throw new Error('Failed to fetch workspaces');
      
      const data = await response.json();
      console.log('Organizations data fetched successfully');
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
  }, [toast, activeOrganization]);

  const initializeData = useCallback(async () => {
    setIsLoading(true);
    try {
      await Promise.all([
        fetchCurrentUser(),
        fetchUserOrganizations()
      ]);
    } finally {
      setIsLoading(false);
    }
  }, [fetchCurrentUser, fetchUserOrganizations]);

  const handleCreateOrg = async (name: string): Promise<boolean> => {
    if (!name.trim()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Workspace name is required"
      });
      return false;
    }

    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_URL}/api/v1/organizations/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name }),
      });

      if (!response.ok) throw new Error('Failed to create workspace');

      const newOrg = await response.json();
      setOrganizations(prev => [...prev, newOrg]);
      toast({
        title: "Success",
        description: "Workspace created successfully"
      });
      return true;
    } catch (error) {
      console.error('Error creating workspace:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to create workspace"
      });
      return false;
    }
  };

  const handleSwitchOrganization = async (orgId: string): Promise<boolean> => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_URL}/authorization/switch-organization/${orgId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) throw new Error('Failed to switch workspace');

      const data = await response.json();
      localStorage.setItem('authToken', data.access_token);
      setActiveOrganization(organizations.find(org => org.id === orgId) || null);
      toast({
        title: "Success",
        description: "Workspace switched successfully"
      });
      return true;
    } catch (error) {
      console.error('Error switching workspace:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to switch workspace"
      });
      return false;
    }
  };

  const handleEditOrganization = async (orgId: string, name: string): Promise<boolean> => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_URL}/api/v1/organizations/${orgId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name }),
      });

      if (!response.ok) throw new Error('Failed to edit workspace');

      const updatedOrg = await response.json();
      setOrganizations(prev => prev.map(org => 
        org.id === orgId ? { ...org, ...updatedOrg } : org
      ));
      toast({
        title: "Success",
        description: "Workspace updated successfully"
      });
      return true;
    } catch (error) {
      console.error('Error editing workspace:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to edit workspace"
      });
      return false;
    }
  };

  const handleDeleteOrganization = async (orgId: string): Promise<boolean> => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_URL}/api/v1/organizations/${orgId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error('Failed to delete workspace');

      setOrganizations(prev => prev.filter(org => org.id !== orgId));
      if (activeOrganization?.id === orgId) {
        setActiveOrganization(organizations[0] || null);
      }
      toast({
        title: "Success",
        description: "Workspace deleted successfully"
      });
      return true;
    } catch (error) {
      console.error('Error deleting workspace:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete workspace"
      });
      return false;
    }
  };

  return {
    organizations,
    activeOrganization,
    currentUser,
    isLoading,
    initializeData,
    fetchCurrentUser,
    fetchUserOrganizations,
    handleCreateOrg,
    handleSwitchOrganization,
    handleEditOrganization,
    handleDeleteOrganization,
    setActiveOrganization,
  };
}