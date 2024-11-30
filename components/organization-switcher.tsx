// components/organization-switcher.tsx
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
import { API_URL } from '@/lib/config';  // Add this import

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
  }, []);

  const fetchOrganizations = async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        router.push('/login');
        return;
      }

      const response = await fetch('/api/organizations', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error('Failed to fetch organizations');

      const data = await response.json();
      setOrganizations(data || []);
      
      if (data?.length > 0) {
        const currentOrgId = localStorage.getItem('currentOrgId');
        const activeOrg = currentOrgId 
          ? data.find(org => org.id === currentOrgId)
          : data[0];
        setActiveOrganization(activeOrg || null);
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
      
      const newActiveOrg = organizations.find(org => org.id === orgId);
      setActiveOrganization(newActiveOrg || null);

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

  return (
    <Select 
      value={activeOrganization?.id}
      onValueChange={handleSwitchOrganization}
    >
      <SelectTrigger className="w-[200px] bg-background">
        <Building2 className="mr-2 h-4 w-4" />
        <SelectValue>
          {activeOrganization?.name || "Select organization"}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {organizations.map((org) => (
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