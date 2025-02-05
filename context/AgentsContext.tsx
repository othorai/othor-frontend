// context/AgentsContext.tsx
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
  [key: string]: any;  // For other configuration properties
}

interface DataSourceMapping {
  datasource_id: string;
  mapping_config: {
    use_all_metrics: boolean;
    refresh_schedule: string;
    metric_mappings: Record<string, string>;
  };
}

interface AgentInstanceUpdate {
  organization_id: number;
  connection_id: string;
  configuration: {
    goals: Array<{
      metric_name: string;
      target_value: number;
      time_period: string;
    }>;
  };
  data_sources: Array<{
    datasource_id: string;
    mapping_config: {
      use_all_metrics: boolean;
      refresh_schedule: string;
      metric_mappings: Record<string, string>;
    };
  }>;
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
  updateAgentInstance: (
    instanceId: string,
    connectionId: string,
    configuration: AgentConfiguration,
    dataSources: DataSourceMapping[]
  ) => Promise<void>;
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

  const getOrgId = (): string => {
    const currentOrgId = localStorage.getItem('currentOrgId') || localStorage.getItem('orgId');
    if (!currentOrgId) {
      throw new Error('Organization ID not found');
    }
    return currentOrgId;
  };

  const fetchAgents = async () => {
    try {
      setLoadingAgents(true);
      const token = localStorage.getItem('authToken');
      
      if (!token) {
        router.push('/login');
        return;
      }

      let orgId;
      try {
        orgId = getOrgId();
        await fetchDataSources(orgId);
      } catch (error) {
        console.error('Error getting organization ID:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Organization ID not found"
        });
        return;
      }

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

      if (!agentsResponse.ok || !instancesResponse.ok) {
        throw new Error('Failed to fetch agents data');
      }

      const agentsData = await agentsResponse.json();
      const instancesData = await instancesResponse.json();

      setAgents(agentsData);
      setAgentInstances(instancesData);

      // Only set selectedAgentId if it's not already set and there are instances
      if (!selectedAgentId && instancesData.length > 0) {
        const newSelectedId = instancesData[0].agent_id;
        setSelectedAgentId(newSelectedId);
        localStorage.setItem('lastSelectedAgentId', newSelectedId);
      }

    } catch (error) {
      console.error('Error fetching agents:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to load agents"
      });
    } finally {
      setLoadingAgents(false);
    }
  };

  // Update localStorage when selectedAgentId changes
  useEffect(() => {
    if (selectedAgentId) {
      localStorage.setItem('lastSelectedAgentId', selectedAgentId);
    } else {
      localStorage.removeItem('lastSelectedAgentId');
    }
  }, [selectedAgentId]);
  
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
  
      let orgId;
      try {
        orgId = getOrgId();
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Organization ID not found"
        });
        return;
      }
  
      // Extract goals from config if present
      const { goals, ...restConfig } = config;
  
      // Prepare request body
      const requestBody = {
        agent_id: agentId,
        connection_id: connectionId,
        organization_id: parseInt(orgId),
        configuration: restConfig,
        data_sources: dataSources ? dataSources.map(ds => ({
          datasource_id: ds.datasource_id,
          mapping_config: {
            ...ds.mapping_config,
            metric_mappings: ds.mapping_config.metric_mappings || {}
          }
        })) : undefined,
        goals: goals ? goals.map(goal => ({
          metric_name: goal.metric_name,
          target_value: goal.target_value,
          time_period: goal.time_period
        })) : undefined
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

  const updateAgentInstance = async (
    instanceId: string, 
    updates: any  // Change the parameters to accept the full update payload
  ) => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        router.push('/login');
        return;
      }
  
      const response = await fetch(`${API_URL}/narrative/agents/instance/${instanceId}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updates)  // Send the complete updates object
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

  useEffect(() => {
    const initializeAgents = async () => {
      try {
        await fetchAgents();
      } catch (error) {
        console.error('Error initializing agents:', error);
      }
    };

    initializeAgents();
  }, []);

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