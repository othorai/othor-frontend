// components/agents/edit-agent-dialog.tsx

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
import { Input } from "@/components/ui/input";
import { useAgents } from '@/context/AgentsContext';
import { useDataSource } from '@/components/settings/hooks/use-data-source';
import { Badge } from "@/components/ui/badge";
import { X, PlusCircle } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

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

interface EditAgentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  instanceId: string;
}

interface Goal {
  metric_name: string;
  target_value: number;
  time_period: string;
}

export function EditAgentDialog({
  open,
  onOpenChange,
  instanceId
}: EditAgentDialogProps) {
  const { updateAgentInstance } = useAgents();
  const { dataSources, fetchDataSources, isLoading } = useDataSource();
  const [loading, setLoading] = useState(false);
  const [selectedDataSources, setSelectedDataSources] = useState<DataSourceConfig[]>([]);
  const [currentDataSourceId, setCurrentDataSourceId] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [availableMetrics, setAvailableMetrics] = useState<string[]>([]);
  const [currentGoal, setCurrentGoal] = useState<Goal>({
    metric_name: '',
    target_value: 0,
    time_period: 'daily'
  });
  const [instance, setInstance] = useState<any>(null);

  // Fetch instance data when dialog opens
  useEffect(() => {
    const fetchInstanceData = async () => {
      if (!open || !instanceId) return;
  
      try {
        const token = localStorage.getItem('authToken');
        const response = await fetch(`${API_URL}/narrative/agents/instance/${instanceId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
  
        if (response.ok) {
          const data = await response.json();
          setInstance(data.instance); // Assuming the response has an instance field
          
          // Set initial data sources
          if (data.instance.data_sources) {
            setSelectedDataSources(data.instance.data_sources.map((ds: any) => ({
              datasource_id: ds.datasource_id,
              table_name: ds.table_name || ds.datasource_name, // Handle both possible field names
              is_primary: ds.is_primary,
              mapping_config: {
                use_all_metrics: true,
                refresh_schedule: "daily",
                metric_mappings: {}
              }
            })));
          } else if (data.instance.connection_id) {
            // Handle legacy format where only connection_id exists
            const primaryDataSource = dataSources.find(ds => ds.id === data.instance.connection_id);
            if (primaryDataSource) {
              setSelectedDataSources([{
                datasource_id: data.instance.connection_id,
                table_name: primaryDataSource.table_name,
                is_primary: true,
                mapping_config: {
                  use_all_metrics: true,
                  refresh_schedule: "daily",
                  metric_mappings: {}
                }
              }]);
            }
          }
  
          // Set initial goals from configuration
          if (data.instance.configuration?.goals) {
            setGoals(data.instance.configuration.goals.map((goal: any) => ({
              metric_name: goal.metric_name,
              target_value: goal.target_value,
              time_period: goal.time_period
            })));
          }
        }
      } catch (error) {
        console.error('Error fetching instance data:', error);
        setError('Failed to load agent instance data');
      }
    };
  
    fetchInstanceData();
  }, [open, instanceId, dataSources]);

  // Fetch data sources when dialog opens
  useEffect(() => {
    if (open) {
      const orgId = localStorage.getItem('currentOrgId') || localStorage.getItem('orgId');
      if (orgId) {
        fetchDataSources(orgId);
      }
    }
  }, [open]);

  // Update available metrics when data sources change
  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const token = localStorage.getItem('authToken');
        const metrics = new Set<string>();

        for (const ds of selectedDataSources) {
          const response = await fetch(`${API_URL}/data-source/data-sources/${ds.datasource_id}/metrics`, {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });

          if (response.ok) {
            const dsMetrics = await response.json();
            dsMetrics.forEach((metric: string) => metrics.add(metric));
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

  const addDataSource = () => {
    if (!currentDataSourceId) return;
  
    const dataSource = dataSources.find(ds => ds.id === currentDataSourceId);
    if (!dataSource) return;
  
    if (selectedDataSources.some(ds => ds.datasource_id === currentDataSourceId)) {
      setError('This data source is already selected');
      return;
    }
  
    const newDataSource: DataSourceConfig = {
      datasource_id: currentDataSourceId,
      table_name: dataSource.table_name,
      is_primary: selectedDataSources.length === 0,
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
  
    if (selectedDataSources.length === 0) {
      setError('Please select at least one data source');
      return;
    }
  
    setLoading(true);
    try {
      const primaryDataSource = selectedDataSources.find(ds => ds.is_primary);
      const orgId = localStorage.getItem('currentOrgId') || localStorage.getItem('orgId');
      
      // Prepare the full update payload
      const updatePayload = {
        organization_id: parseInt(orgId!),
        connection_id: primaryDataSource?.datasource_id || '',
        configuration: {
          goals: goals  // This will be an empty array if no goals
        },
        data_sources: selectedDataSources.map(ds => ({
          datasource_id: ds.datasource_id,
          mapping_config: {
            use_all_metrics: true,
            refresh_schedule: "daily",
            metric_mappings: {}
          }
        }))
      };
  
      // Update the agent instance with the full payload
      await updateAgentInstance(
        instanceId,
        updatePayload
      );
      
      onOpenChange(false);
    } catch (error) {
      console.error('Error updating agent:', error);
      setError(error instanceof Error ? error.message : 'Failed to update agent');
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
          <DialogTitle>
            Edit Agent: {instance?.name || 'Loading...'}
          </DialogTitle>
        </DialogHeader>
  
        {!instance ? (
          <div className="py-8 text-center">
            <p>Loading instance data...</p>
          </div>
        ) : (
          <>
            <div className="bg-muted p-4 rounded-lg mb-6">
              <h3 className="font-medium mb-2">Current Configuration</h3>
              <dl className="grid grid-cols-2 gap-2 text-sm">
                <dt className="text-muted-foreground">Primary Data Source:</dt>
                <dd>{selectedDataSources.find(ds => ds.is_primary)?.table_name || 'None'}</dd>
                
                <dt className="text-muted-foreground">Total Data Sources:</dt>
                <dd>{selectedDataSources.length}</dd>
                
                <dt className="text-muted-foreground">Active Goals:</dt>
                <dd>{goals.length}</dd>
                
                <dt className="text-muted-foreground">Last Updated:</dt>
                <dd>{instance?.updated_at ? new Date(instance.updated_at).toLocaleString() : 'Never'}</dd>
              </dl>
            </div>
  
            <form onSubmit={handleSubmit} className="space-y-4">
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
                      {availableDataSources.map((source) => (
                        <SelectItem key={source.id} value={source.id}>
                          {source.table_name}
                        </SelectItem>
                      ))}
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
                <ScrollArea className="h-48 border rounded-md p-4">
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
                      {availableMetrics.map((metric) => {
                        const isUsed = goals.some(g => g.metric_name === metric);
                        return (
                          <SelectItem 
                            key={metric} 
                            value={metric}
                            className={isUsed ? "opacity-50" : ""}
                          >
                            {metric} {isUsed && "(Already in use)"}
                          </SelectItem>
                        );
                      })}
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
  
              {goals.length > 0 && (
                <ScrollArea className="h-48 border rounded-md p-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Current Goals</label>
                    <div className="space-y-2">
                      {goals.map((goal, index) => (
                        <div key={index} className="flex items-center justify-between bg-secondary p-2 rounded-md">
                          <div className="flex items-center gap-2">
                            <span>{goal.metric_name}</span>
                            <Badge variant="default" className="cursor-help" title={`Target: ${goal.target_value}`}>
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
                  onClick={() => onOpenChange(false)}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={loading || selectedDataSources.length === 0}
                >
                  {loading ? "Updating..." : "Update Agent"}
                </Button>
              </div>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}