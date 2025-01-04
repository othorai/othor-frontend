// context/OrganizationContext.tsx
'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { createOrganizationChangeEvent } from '@/utils/events';
import { API_URL } from '@/lib/config';
import { useToast } from "@/hooks/use-toast";
import { useRouter } from 'next/navigation';

interface Organization {
  id: string;
  name: string;
  role?: string;
}

interface OrganizationContextType {
  organizations: Organization[];
  activeOrganization: Organization | null;
  currentUser: any;
  isLoading: boolean;
  initializeData: () => Promise<void>;
  handleCreateOrg: (name: string) => Promise<boolean>;
  handleSwitchOrganization: (orgId: string) => Promise<boolean>;
  handleEditOrganization: (orgId: string, name: string) => Promise<boolean>;
  handleDeleteOrganization: (orgId: string) => Promise<boolean>;
  clearCache: () => void;
}

const OrganizationContext = createContext<OrganizationContextType | undefined>(undefined);

export function OrganizationProvider({ children }: { children: React.ReactNode }) {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [activeOrganization, setActiveOrganization] = useState<Organization | null>(() => {
    if (typeof window !== 'undefined') {
      const currentOrgId = localStorage.getItem('currentOrgId');
      const currentOrgName = localStorage.getItem('currentOrgName');
      return currentOrgId && currentOrgName 
        ? { id: currentOrgId, name: currentOrgName }
        : null;
    }
    return null;
  });
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const router = useRouter();
  const { toast } = useToast();

  const fetchOrganizations = async () => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      router.push('/login');
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/v1/organizations/`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (!response.ok) throw new Error('Failed to fetch workspaces');
      
      const data = await response.json();
      setOrganizations(data);
      
      // Set active organization if not already set
      const currentOrgId = localStorage.getItem('currentOrgId');
      if (currentOrgId) {
        const currentOrg = data.find((org: Organization) => org.id === currentOrgId);
        if (currentOrg) {
          setActiveOrganization(currentOrg);
        }
      } else if (data.length > 0) {
        setActiveOrganization(data[0]);
        localStorage.setItem('currentOrgId', data[0].id);
        localStorage.setItem('currentOrgName', data[0].name);
      }
    } catch (error) {
      console.error('Error fetching organizations:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch organizations"
      });
    }
  };

  const initializeData = async () => {
    setIsLoading(true);
    try {
      await fetchOrganizations();
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    initializeData();
  }, []);

  // context/OrganizationContext.tsx
// ... previous imports remain the same ...

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
  
      // Update active organization if it's the one being edited
      if (activeOrganization?.id === orgId) {
        setActiveOrganization({ ...activeOrganization, ...updatedOrg });
      }
  
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
  
      setOrganizations(prev => {
        const updatedOrgs = prev.filter(org => org.id !== orgId);
        // If we're deleting the active organization, update it
        if (activeOrganization?.id === orgId) {
          const newActiveOrg = updatedOrgs[0] || null;
          setActiveOrganization(newActiveOrg);
          if (newActiveOrg) {
            localStorage.setItem('currentOrgId', newActiveOrg.id);
            localStorage.setItem('currentOrgName', newActiveOrg.name);
          }
        }
        return updatedOrgs;
      });
  
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
      const newOrg = organizations.find(org => org.id === orgId);
      
      if (!newOrg) {
        throw new Error('Organization not found');
      }

      // Clear previous data
      localStorage.removeItem('currentOrgId');
      localStorage.removeItem('currentOrgName');

      // Update everything in order
      localStorage.setItem('authToken', data.access_token);
      localStorage.setItem('currentOrgId', orgId);
      localStorage.setItem('currentOrgName', newOrg.name);
      
      // Update active organization
      setActiveOrganization(newOrg);
      
      // Dispatch event
      window.dispatchEvent(createOrganizationChangeEvent(newOrg));

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

  const clearCache = () => {
    setOrganizations([]);
    setActiveOrganization(null);
    setCurrentUser(null);
  };

  return (
    <OrganizationContext.Provider
      value={{
        organizations,
        activeOrganization,
        currentUser,
        isLoading,
        initializeData,
        handleCreateOrg,
        handleSwitchOrganization,
        handleEditOrganization,
        handleDeleteOrganization,
        clearCache
      }}
    >
      {children}
    </OrganizationContext.Provider>
  );
}

export function useOrganization() {
  const context = useContext(OrganizationContext);
  if (context === undefined) {
    throw new Error('useOrganization must be used within an OrganizationProvider');
  }
  return context;
}