'use client';

import { useAgents } from '@/context/AgentsContext';
import { Button } from '@/components/ui/button';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { CreateAgentDialog } from './create-agent-dialog';
import { EditAgentDialog } from './edit-agent-dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { API_URL } from '@/lib/config';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

export function AgentsSidebar() {
  const {
    agents,
    agentInstances,
    selectedAgentId,
    setSelectedAgentId,
    loadingAgents,
    deactivateAgentInstance,
  } = useAgents();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedInstanceId, setSelectedInstanceId] = useState<string>('');
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingInstanceId, setEditingInstanceId] = useState<string>('');
  const [isOrgAdmin, setIsOrgAdmin] = useState(false);
  const [loadingRole, setLoadingRole] = useState(true);

  // Fetch user's organization role
  useEffect(() => {
    const fetchOrgRole = async () => {
      try {
        setLoadingRole(true);
        const currentOrgId = localStorage.getItem('currentOrgId');
        if (!currentOrgId) {
          setLoadingRole(false);
          return;
        }

        const token = localStorage.getItem('authToken');
        if (!token) {
          setLoadingRole(false);
          return;
        }

        const response = await fetch(`${API_URL}/authorization/org_role/${currentOrgId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
        });

        if (response.ok) {
          const data = await response.json();
          setIsOrgAdmin(data.role === 'admin');
        } else {
          console.error('Failed to fetch role:', response.status);
          setIsOrgAdmin(false);
        }
      } catch (error) {
        console.error('Error fetching organization role:', error);
        setIsOrgAdmin(false);
      } finally {
        setLoadingRole(false);
      }
    };

    fetchOrgRole();

    // Listen for organization changes
    const handleOrgChange = () => {
      fetchOrgRole();
    };

    window.addEventListener('organizationChanged', handleOrgChange);
    
    return () => {
      window.removeEventListener('organizationChanged', handleOrgChange);
    };
  }, []);

  const handleDelete = async (instanceId: string) => {
    if (!isOrgAdmin) return;
    setSelectedInstanceId(instanceId);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!isOrgAdmin) return;
    try {
      await deactivateAgentInstance(selectedInstanceId);
      if (selectedAgentId === selectedInstanceId) {
        setSelectedAgentId(null);
      }
    } catch (error) {
      console.error('Error deleting agent:', error);
    } finally {
      setDeleteDialogOpen(false);
    }
  };

  const handleEdit = (instanceId: string) => {
    if (!isOrgAdmin) return;
    setEditingInstanceId(instanceId);
    setEditDialogOpen(true);
  };

  if (loadingAgents || loadingRole) {
    return (
      <div className="h-full bg-white">
        <div className="p-4 border-b">
          <h2 className="text-sm font-semibold text-gray-900">Choose Agent</h2>
        </div>
        <div className="p-4 space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-white flex flex-col">
      <div className="p-4 border-b">
        <h2 className="text-sm font-semibold text-gray-900">Choose Agent</h2>
      </div>
      
      <div className="flex-1 overflow-auto">
        <div className="p-3 space-y-1">
          {/* Default Daily Reporter */}
          <Button
            variant={selectedAgentId === null ? "secondary" : "ghost"}
            className={cn(
              "w-full justify-start text-sm h-9",
              selectedAgentId === null && "bg-primary/10"
            )}
            onClick={() => setSelectedAgentId(null)}
          >
            Daily Reporter
          </Button>

          {/* Custom Agent Instances */}
          {agentInstances.map((instance) => {
            const agent = agents.find(a => a.id === instance.agent_id);
            if (!agent) return null;

            return (
              <div key={instance.id} className="flex items-center gap-1">
                <Button
                  variant={selectedAgentId === instance.agent_id ? "secondary" : "ghost"}
                  className={cn(
                    "flex-1 justify-start text-sm h-9",
                    selectedAgentId === instance.agent_id && "bg-primary/10"
                  )}
                  onClick={() => setSelectedAgentId(instance.agent_id)}
                >
                  {agent.name}
                </Button>
                
                {isOrgAdmin && (
                  <>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEdit(instance.id);
                      }}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-red-500 hover:text-red-600"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(instance.id);
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {isOrgAdmin && (
        <div className="p-3 border-t mt-auto">
          <Button
            onClick={() => setCreateDialogOpen(true)}
            className="w-full h-9"
            variant="outline"
            size="sm"
          >
            <Plus className="mr-2 h-4 w-4" />
            Create Agent
          </Button>
        </div>
      )}

      {isOrgAdmin && (
        <>
          <CreateAgentDialog
            open={createDialogOpen}
            onOpenChange={setCreateDialogOpen}
            agents={agents}
          />

          <EditAgentDialog
            open={editDialogOpen}
            onOpenChange={setEditDialogOpen}
            instanceId={editingInstanceId}
          />

          <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Delete Agent</DialogTitle>
                <DialogDescription>
                  Are you sure you want to delete this agent? This action cannot be undone.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter className="flex gap-2 justify-end mt-4">
                <Button 
                  variant="outline" 
                  onClick={() => setDeleteDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button 
                  variant="destructive"
                  onClick={confirmDelete}
                >
                  Delete
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </>
      )}
    </div>
  );
}