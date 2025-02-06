'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { API_URL } from '@/lib/config';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { useDataSource } from '@/components/settings/hooks/use-data-source';

interface Agent {
  id: string;
  name: string;
  code_name: string;
  purpose: string;
  capabilities: string[];
  personality: string;
  tone: string;
  is_active: boolean;
}

interface Goal {
  metric_name: string;
  target_value: number;
  time_period: string;
}

interface AgentConfiguration {
  goals?: Goal[];
  [key: string]: any;
}

interface DataSourceMapping {
  datasource_id: string;
  mapping_config: {
    use_all_metrics: boolean;
    refresh_schedule: string;
    metric_mappings: Record<string, string>;
  };
}

interface AgentInstance {
  id: string;
  agent_id: string;
  organization_id: number;
  connection_id: string;
  configuration: Record<string, any>;
  is_active: boolean;
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

interface AgentsContextType {
  agents: Agent[];
  agentInstances: AgentInstance[];
  dataSources: DataSource[];
  selectedAgentId: string | null;
  loadingAgents: boolean;
  setSelectedAgentId: (id: string | null) => void;
  fetchAgents: () => Promise<void>;
  createAgentInstance: (agentId: string, connectionId: string, config: any) => Promise<void>;
  deactivateAgentInstance: (instanceId: string) => Promise<void>;
  updateAgentInstance: (instanceId: string, updates: any) => Promise<void>;
}

const AgentsContext = createContext<AgentsContextType | undefined>(undefined);

export function AgentsProvider({ children }: { children: React.ReactNode }) {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [agentInstances, setAgentInstances] = useState<AgentInstance[]>([]);
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);
  const [loadingAgents, setLoadingAgents] = useState(true);
  const router = useRouter();
  const { toast } = useToast();
  const { dataSources, fetchDataSources } = useDataSource();

  const getOrgId = (): string | null => {
    const currentOrgId = localStorage.getItem('currentOrgId') || localStorage.getItem('orgId');
    return currentOrgId;
  };

  const fetchAgents = async () => {
    try {
      console.log('Starting fetchAgents');
      setLoadingAgents(true);
      const token = localStorage.getItem('authToken');
      
      console.log('Token exists:', !!token);
      
      if (!token) {
        setLoadingAgents(false);
        return;
      }
  
      const orgId = getOrgId();
      console.log('OrgId:', orgId);
      
      if (!orgId) {
        setLoadingAgents(false);
        return;
      }
  
      // Log the requests being made
      console.log('Fetching agents and instances...');
  
      const [agentsResponse, instancesResponse] = await Promise.all([
        fetch(`${API_URL}/narrative/agents`, {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }),
        fetch(`${API_URL}/narrative/agents/organization`, {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })
      ]);
  
      console.log('Responses received:', {
        agents: agentsResponse.ok,
        instances: instancesResponse.ok
      });
  
      if (!agentsResponse.ok || !instancesResponse.ok) {
        throw new Error('Failed to fetch agents data');
      }
  
      const [agentsData, instancesData] = await Promise.all([
        agentsResponse.json(),
        instancesResponse.json()
      ]);
  
      console.log('Data received:', {
        agentsCount: agentsData.length,
        instancesCount: instancesData.length
      });
  
      setAgents(agentsData);
      setAgentInstances(instancesData);
  
      // ... rest of the function stays the same ...
    } catch (error) {
      console.error('Error in fetchAgents:', error);
      // ... error handling ...
    } finally {
      setLoadingAgents(false);
    }
  };

  
  const createAgentInstance = async (
    agentId: string, 
    connectionId: string, 
    config: any,
    dataSources?: Array<{
      datasource_id: string;
      mapping_config: {
        use_all_metrics: boolean;
        refresh_schedule: string;
        metric_mappings: Record<string, string>;
      };
    }>
  ) => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        router.push('/login');
        return;
      }

      const orgId = getOrgId();
      if (!orgId) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Organization ID not found"
        });
        return;
      }

      const { goals, ...restConfig } = config;

      const requestBody = {
        agent_id: agentId,
        connection_id: connectionId,
        organization_id: parseInt(orgId),
        configuration: restConfig,
        data_sources: dataSources?.map(ds => ({
          datasource_id: ds.datasource_id,
          mapping_config: {
            ...ds.mapping_config,
            metric_mappings: ds.mapping_config.metric_mappings || {}
          }
        })),
        goals: goals?.map(goal => ({
          metric_name: goal.metric_name,
          target_value: goal.target_value,
          time_period: goal.time_period
        }))
      };

      const response = await fetch(`${API_URL}/narrative/agents/instance`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to create agent instance');
      }

      await fetchAgents();
      toast({
        title: "Success",
        description: "Agent instance created successfully"
      });

    } catch (error) {
      console.error('Error creating agent instance:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create agent instance"
      });
      throw error;
    }
  };

  const deactivateAgentInstance = async (instanceId: string) => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        router.push('/login');
        return;
      }

      const orgId = getOrgId();
      if (!orgId) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Organization ID not found"
        });
        return;
      }

      const response = await fetch(`${API_URL}/narrative/agents/instance/${instanceId}`, {
        method: 'DELETE',
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to deactivate agent instance');
      }

      await fetchAgents();
      toast({
        title: "Success",
        description: "Agent instance deactivated successfully"
      });

    } catch (error) {
      console.error('Error deactivating agent instance:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to deactivate agent instance"
      });
      throw error;
    }
  };

  const updateAgentInstance = async (instanceId: string, updates: any) => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        router.push('/login');
        return;
      }

      const orgId = getOrgId();
      if (!orgId) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Organization ID not found"
        });
        return;
      }

      const response = await fetch(`${API_URL}/narrative/agents/instance/${instanceId}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updates)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to update agent instance');
      }

      await fetchAgents();
      toast({
        title: "Success",
        description: "Agent instance updated successfully"
      });

    } catch (error) {
      console.error('Error updating agent instance:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update agent instance"
      });
      throw error;
    }
  };

  // Single initialization effect that handles both initial load and organization changes
  useEffect(() => {
    const checkAuthAndFetch = async () => {
      const token = localStorage.getItem('authToken');
      console.log('Auth check - token:', token ? 'exists' : 'missing');
      
      if (token) {
        await fetchAgents();
      } else {
        // Clear agents data when logged out
        setAgents([]);
        setAgentInstances([]);
        setSelectedAgentId(null);
      }
    };
  
    // Initial check
    checkAuthAndFetch();
  
    // Handle auth changes
    const handleAuthChange = () => {
      console.log('Auth changed event received');
      checkAuthAndFetch();
    };
  
    // Handle org changes
    const handleOrgChange = () => {
      console.log('Organization changed event received');
      checkAuthAndFetch();
    };
  
    // Add event listeners
    window.addEventListener('auth-state-changed', handleAuthChange);
    window.addEventListener('organizationChanged', handleOrgChange as EventListener);
    window.addEventListener('storage', (e) => {
      if (e.key === 'authToken') {
        console.log('Auth storage changed');
        checkAuthAndFetch();
      }
    });
  
    // Cleanup
    return () => {
      window.removeEventListener('auth-state-changed', handleAuthChange);
      window.removeEventListener('organizationChanged', handleOrgChange as EventListener);
      window.removeEventListener('storage', (e) => {
        if (e.key === 'authToken') {
          checkAuthAndFetch();
        }
      });
    };
  }, []);

  // Update localStorage when selectedAgentId changes
  useEffect(() => {
    if (selectedAgentId) {
      localStorage.setItem('lastSelectedAgentId', selectedAgentId);
    } else {
      localStorage.removeItem('lastSelectedAgentId');
    }
  }, [selectedAgentId]);

  return (
    <AgentsContext.Provider
      value={{
        agents,
        agentInstances,
        dataSources,
        selectedAgentId,
        loadingAgents,
        setSelectedAgentId,
        fetchAgents,
        createAgentInstance,
        deactivateAgentInstance,
        updateAgentInstance
      }}
    >
      {children}
    </AgentsContext.Provider>
  );
}

export function useAgents() {
  const context = useContext(AgentsContext);
  if (context === undefined) {
    throw new Error('useAgents must be used within an AgentsProvider');
  }
  return context;
}