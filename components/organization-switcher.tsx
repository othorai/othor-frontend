// components/organization-switcher.tsx
'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Building2 } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { API_URL } from '@/lib/config';
import { createOrganizationChangeEvent } from '@/utils/events';

interface Organization {
  id: string;
  name: string;
}

export function OrganizationSwitcher() {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [activeOrganization, setActiveOrganization] = useState<Organization | null>(() => {
    // Initialize from localStorage
    const currentOrgId = localStorage.getItem('currentOrgId');
    const currentOrgName = localStorage.getItem('currentOrgName');
    return currentOrgId && currentOrgName 
      ? { id: currentOrgId, name: currentOrgName }
      : null;
  });
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const { toast } = useToast();

  const fetchOrganizations = useCallback(async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        router.push('/login');
        return;
      }

      const response = await fetch(`${API_URL}/api/v1/organizations/`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error('Failed to fetch organizations');

      const orgs = await response.json();

      // Fetch roles for each organization
      const orgsWithRoles = await Promise.all(orgs.map(async (org: Organization) => {
        try {
          const roleResponse = await fetch(`${API_URL}/authorization/org_role/${org.id}`, {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          });
          
          if (roleResponse.ok) {
            const roleData = await roleResponse.json();
            return {
              ...org,
              role: roleData.role
            };
          }
          return org;
        } catch (error) {
          console.error(`Error fetching role for org ${org.id}:`, error);
          return org;
        }
      }));

      setOrganizations(orgsWithRoles || []);

      // Update active organization if needed
      const currentOrgId = localStorage.getItem('currentOrgId');
      if (currentOrgId) {
        const activeOrg = orgsWithRoles.find((org: Organization) => org.id === currentOrgId);
        if (activeOrg) {
          setActiveOrganization(activeOrg);
        }
      } else if (orgsWithRoles.length > 0) {
        setActiveOrganization(orgsWithRoles[0]);
        localStorage.setItem('currentOrgId', orgsWithRoles[0].id);
        localStorage.setItem('currentOrgName', orgsWithRoles[0].name);
      }
    } catch (error) {
      console.error('Error fetching organizations:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch organizations"
      });
    } finally {
      setIsLoading(false);
    }
  }, [router, toast]);

  useEffect(() => {
    fetchOrganizations();

    const handleOrgChange = (event: CustomEvent<Organization>) => {
      const newOrg = event.detail;
      setActiveOrganization(newOrg);
      fetchOrganizations();
    };

    window.addEventListener('organizationChanged', handleOrgChange as EventListener);
    
    return () => {
      window.removeEventListener('organizationChanged', handleOrgChange as EventListener);
    };
  }, [fetchOrganizations]);
  
  const handleSwitchOrganization = async (orgId: string) => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        router.push('/login');
        return;
      }
  
      const newActiveOrg = organizations.find((org: Organization) => org.id === orgId);
      if (!newActiveOrg) {
        throw new Error('Organization not found');
      }
  
      const response = await fetch(`${API_URL}/authorization/switch-organization/${orgId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      });
  
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to switch organization');
      }
  
      localStorage.setItem('authToken', data.access_token);
      localStorage.setItem('currentOrgId', orgId);
      localStorage.setItem('currentOrgName', newActiveOrg.name);
      
      setActiveOrganization(newActiveOrg);
      window.dispatchEvent(createOrganizationChangeEvent(newActiveOrg));
      
      toast({
        title: "Success",
        description: "Organization switched successfully"
      });
  
      window.location.reload();
    } catch (error) {
      console.error('Error switching organization:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to switch organization"
      });
    }
  };

  if (isLoading) {
    return (
      <div className="w-[200px] h-10 bg-background animate-pulse rounded-md" />
    );
  }

  if (!organizations?.length) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="w-[200px] h-10 bg-background animate-pulse rounded-md" />
    );
  }

  if (!organizations?.length) {
    return null;
  }

  return (
    <Select 
      value={activeOrganization?.id || ''}
      onValueChange={handleSwitchOrganization}
    >
      <SelectTrigger className="w-[200px] bg-background">
        <Building2 className="mr-2 h-4 w-4" />
        <SelectValue placeholder="Select organization">
          {activeOrganization?.name || "Select organization"}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {organizations.map((org: Organization) => (
          <SelectItem 
            key={org.id} 
            value={org.id}
            className="cursor-pointer"
          >
            {org.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}