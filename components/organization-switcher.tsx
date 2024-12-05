'use client';

import { useEffect, useState } from 'react';
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

interface Organization {
  id: string;
  name: string;
}

export function OrganizationSwitcher() {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [activeOrganization, setActiveOrganization] = useState<Organization | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    fetchOrganizations();

    // Listen for organization changes
    const handleOrgChange = () => {
      const currentOrgId = localStorage.getItem('currentOrgId');
      const currentOrgName = localStorage.getItem('currentOrgName');
      
      if (currentOrgId && currentOrgName) {
        setActiveOrganization({
          id: currentOrgId,
          name: currentOrgName
        });
      }
    };

    window.addEventListener('organizationChanged', handleOrgChange);
    
    // Set initial active organization from localStorage
    const currentOrgId = localStorage.getItem('currentOrgId');
    const currentOrgName = localStorage.getItem('currentOrgName');
    if (currentOrgId && currentOrgName) {
      setActiveOrganization({
        id: currentOrgId,
        name: currentOrgName
      });
    }

    return () => {
      window.removeEventListener('organizationChanged', handleOrgChange);
    };
  }, []);

  const fetchOrganizations = async () => {
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

      const data = await response.json();
      setOrganizations(data || []);
      
      // Set active organization
      if (data?.length > 0) {
        const currentOrgId = localStorage.getItem('currentOrgId');
        const activeOrg = currentOrgId 
          ? data.find((org: Organization) => org.id === currentOrgId)
          : data[0];
          
        if (activeOrg) {
          setActiveOrganization(activeOrg);
          // Update localStorage if not already set
          if (!currentOrgId) {
            localStorage.setItem('currentOrgId', activeOrg.id);
            localStorage.setItem('currentOrgName', activeOrg.name);
          }
        }
      }
    } catch (error) {
      console.error('Error fetching organizations:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch organizations"
      });
      setOrganizations([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSwitchOrganization = async (orgId: string) => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        router.push('/login');
        return;
      }

      // Find the new organization before making the API call
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

      // Update active organization immediately
      setActiveOrganization(newActiveOrg);
      localStorage.setItem('authToken', data.access_token);
      localStorage.setItem('currentOrgId', orgId);
      localStorage.setItem('currentOrgName', newActiveOrg.name);
      
      // Dispatch event for org change
      window.dispatchEvent(new Event('organizationChanged'));
      
      toast({
        title: "Success",
        description: "Organization switched successfully"
      });
      
      // Reload the page to refresh all data
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

  return (
    <Select 
      value={activeOrganization?.id}
      onValueChange={handleSwitchOrganization}
    >
      <SelectTrigger className="w-[200px] bg-background">
        <Building2 className="mr-2 h-4 w-4" />
        <SelectValue placeholder="Select organization">
          {activeOrganization?.name}
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