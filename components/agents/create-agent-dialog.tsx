// components/agents/create-agent-dialog.tsx
'use client';
import { useState, useEffect } from 'react';
import { API_URL } from '@/lib/config';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input"; // Fixed import for Input
import { useAgents } from '@/context/AgentsContext';
import { useDataSource } from '@/components/settings/hooks/use-data-source';
import { Badge } from "@/components/ui/badge";
import { X, PlusCircle } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Label } from "@/components/ui/label"; // Added for consistent form labeling

interface DataSourceConfig {
  datasource_id: string;
  table_name: string;
  is_primary: boolean;
  mapping_config: {
    use_all_metrics: boolean;
    refresh_schedule: string;
    metric_mappings: Record<string, string>;
  };
}

interface CreateAgentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  agents: Array<{
    id: string;
    name: string;
    purpose: string;
  }>;
}

interface Goal {
  metric_name: string;
  target_value: number;
  time_period: string;
}

export function CreateAgentDialog({
  open,
  onOpenChange,
  agents
}: CreateAgentDialogProps) {
  const { createAgentInstance } = useAgents();
  const { dataSources, fetchDataSources, isLoading } = useDataSource();
  const [loading, setLoading] = useState(false);
  const [selectedAgentId, setSelectedAgentId] = useState('');
  const [selectedDataSources, setSelectedDataSources] = useState([]);
  const [currentDataSourceId, setCurrentDataSourceId] = useState('');
  const [error, setError] = useState(null);
  const [goals, setGoals] = useState([]);
  const [availableMetrics, setAvailableMetrics] = useState([]);
  const [currentGoal, setCurrentGoal] = useState({
    metric_name: '',
    target_value: 0,
    time_period: 'daily'
  });


  // Fetch data sources when dialog opens
  useEffect(() => {
    if (open) {
      const orgId = localStorage.getItem('currentOrgId') || localStorage.getItem('orgId');
      if (orgId) {
        fetchDataSources(orgId);
      }
    }
  }, [open]);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const token = localStorage.getItem('authToken');
        const metrics = new Set();

        // Fetch metrics for each selected data source
        for (const ds of selectedDataSources) {
          const response = await fetch(`${API_URL}/data-source/data-sources/${ds.datasource_id}/metrics`, {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });

          if (response.ok) {
            const dsMetrics = await response.json();
            dsMetrics.forEach(metric => metrics.add(metric));
          }
        }

        setAvailableMetrics(Array.from(metrics));
      } catch (error) {
        console.error('Error fetching metrics:', error);
      }
    };

    if (selectedDataSources.length > 0) {
      fetchMetrics();
    } else {
      setAvailableMetrics([]);
    }
  }, [selectedDataSources]);

  // Reset form when dialog closes
  useEffect(() => {
    if (!open) {
      setSelectedAgentId('');
      setSelectedDataSources([]);
      setCurrentDataSourceId('');
      setError(null);
      setGoals([]);
      setCurrentGoal({
        metric_name: '',
        target_value: 0,
        time_period: 'daily'
      });
    }
  }, [open]);

  const addDataSource = () => {
    if (!currentDataSourceId) return;
  
    const dataSource = dataSources.find(ds => ds.id === currentDataSourceId);
    if (!dataSource) return;
  
    // Check if this data source is already selected
    if (selectedDataSources.some(ds => ds.datasource_id === currentDataSourceId)) {
      setError('This data source is already selected');
      return;
    }
  
    // Add new data source with default configuration
    const newDataSource: DataSourceConfig = {
      datasource_id: currentDataSourceId,
      table_name: dataSource.table_name,
      is_primary: selectedDataSources.length === 0, // First one is primary
      mapping_config: {
        use_all_metrics: true,
        refresh_schedule: "daily",
        metric_mappings: {} 
      }
    };

    setSelectedDataSources([...selectedDataSources, newDataSource]);
    setCurrentDataSourceId('');
    setError(null);
  };

  const removeDataSource = (datasourceId: string) => {
    setSelectedDataSources(prev => {
      const filtered = prev.filter(ds => ds.datasource_id !== datasourceId);
      // If we removed the primary, make the first remaining one primary
      if (filtered.length > 0 && prev.find(ds => ds.datasource_id === datasourceId)?.is_primary) {
        filtered[0].is_primary = true;
      }
      return filtered;
    });
  };

  const setPrimaryDataSource = (datasourceId: string) => {
    setSelectedDataSources(prev => 
      prev.map(ds => ({
        ...ds,
        is_primary: ds.datasource_id === datasourceId
      }))
    );
  };

  const addGoal = () => {
    if (!currentGoal.metric_name || currentGoal.target_value <= 0) {
      setError('Please enter valid goal details');
      return;
    }

    setGoals([...goals, currentGoal]);
    setCurrentGoal({
      metric_name: '',
      target_value: 0,
      time_period: 'daily'
    });
    setError(null);
  };

  const removeGoal = (index: number) => {
    setGoals(goals.filter((_, i) => i !== index));
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
  
    if (!selectedAgentId) {
      setError('Please select an agent type');
      return;
    }
  
    if (selectedDataSources.length === 0) {
      setError('Please select at least one data source');
      return;
    }
  
    setLoading(true);
    try {
      const primaryDataSource = selectedDataSources.find(ds => ds.is_primary);
      
      const dataSourcesConfig = selectedDataSources.map(ds => ({
        datasource_id: ds.datasource_id,
        mapping_config: {
          use_all_metrics: ds.mapping_config.use_all_metrics,
          refresh_schedule: ds.mapping_config.refresh_schedule,
          metric_mappings: ds.mapping_config.metric_mappings || {}
        }
      }));
  
      await createAgentInstance(
        selectedAgentId, 
        primaryDataSource?.datasource_id || '', 
        { goals },  // Add goals to configuration
        dataSourcesConfig
      );
      onOpenChange(false);
    } catch (error) {
      console.error('Error creating agent:', error);
      setError(error instanceof Error ? error.message : 'Failed to create agent');
    } finally {
      setLoading(false);
    }
  };

  const availableDataSources = dataSources.filter(
    source => source.connected && !selectedDataSources.some(ds => ds.datasource_id === source.id)
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create New Agent</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Agent Type</label>
            <Select
              value={selectedAgentId}
              onValueChange={setSelectedAgentId}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select an agent type" />
              </SelectTrigger>
              <SelectContent>
                {agents.map((agent) => (
                  <SelectItem key={agent.id} value={agent.id}>
                    {agent.name} - {agent.purpose}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Add Data Sources</label>
            <div className="flex gap-2">
              <Select
                value={currentDataSourceId}
                onValueChange={setCurrentDataSourceId}
                disabled={isLoading}
              >
                <SelectTrigger className="flex-grow">
                  <SelectValue placeholder={isLoading ? "Loading data sources..." : "Select a data source"} />
                </SelectTrigger>
                <SelectContent>
                  {availableDataSources.length > 0 ? (
                    availableDataSources.map((source) => (
                      <SelectItem key={source.id} value={source.id}>
                        {source.table_name}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="no-sources" disabled>
                      {isLoading ? "Loading..." : "No data sources available"}
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
              <Button 
                type="button" 
                onClick={addDataSource}
                disabled={!currentDataSourceId}
              >
                Add
              </Button>
            </div>
          </div>

          {selectedDataSources.length > 0 && (
            <ScrollArea className="h-[200px] border rounded-md p-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Selected Data Sources</label>
                <div className="space-y-2">
                  {selectedDataSources.map((ds) => (
                    <div key={ds.datasource_id} className="flex items-center justify-between bg-secondary p-2 rounded-md">
                      <div className="flex items-center gap-2">
                        <span>{ds.table_name}</span>
                        {ds.is_primary && <Badge variant="default">Primary</Badge>}
                      </div>
                      <div className="flex items-center gap-2">
                        {!ds.is_primary && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setPrimaryDataSource(ds.datasource_id)}
                          >
                            Make Primary
                          </Button>
                        )}
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeDataSource(ds.datasource_id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </ScrollArea>
          )}

          {error && (
            <div className="text-sm text-red-500">
              {error}
            </div>
          )}

           {/* Goals Section */}
           <div className="space-y-2">
            <label className="text-sm font-medium">Add Goals</label>
            <div className="grid grid-cols-3 gap-2">
              <Select
                value={currentGoal.metric_name}
                onValueChange={(value) => setCurrentGoal({
                  ...currentGoal,
                  metric_name: value
                })}
                disabled={availableMetrics.length === 0}
              >
                <SelectTrigger>
                  <SelectValue placeholder={
                    availableMetrics.length === 0 
                      ? "Select a data source first" 
                      : "Select a metric"
                  } />
                </SelectTrigger>
                <SelectContent>
                  {availableMetrics.map((metric) => (
                    <SelectItem key={metric} value={metric}>
                      {metric}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Input
                type="number"
                placeholder="Target value"
                value={currentGoal.target_value || ''}
                onChange={(e) => setCurrentGoal({
                  ...currentGoal,
                  target_value: parseFloat(e.target.value)
                })}
              />

              <Select
                value={currentGoal.time_period}
                onValueChange={(value) => setCurrentGoal({
                  ...currentGoal,
                  time_period: value
                })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="quarterly">Quarterly</SelectItem>
                  <SelectItem value="yearly">Yearly</SelectItem>
                </SelectContent>
              </Select>

              <Button
                type="button"
                variant="outline"
                onClick={addGoal}
                className="col-span-3"
                disabled={availableMetrics.length === 0}
              >
                <PlusCircle className="h-4 w-4 mr-2" />
                Add Goal
              </Button>
            </div>
          </div>

          {/* Goals List */}
          {goals.length > 0 && (
            <ScrollArea className="h-[200px] border rounded-md p-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Set Goals</label>
                <div className="space-y-2">
                  {goals.map((goal, index) => (
                    <div key={index} className="flex items-center justify-between bg-secondary p-2 rounded-md">
                      <div className="flex items-center gap-2">
                        <span>{goal.metric_name}</span>
                        <Badge variant="default">
                          {goal.target_value} ({goal.time_period})
                        </Badge>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeGoal(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </ScrollArea>
          )}

          {error && (
            <div className="text-sm text-red-500">
              {error}
            </div>
          )}

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setError(null);
                onOpenChange(false);
              }}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={loading || !selectedAgentId || selectedDataSources.length === 0}
            >
              {loading ? "Creating..." : "Create Agent"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}