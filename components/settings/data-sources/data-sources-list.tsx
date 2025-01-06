import { FC, useState, useCallback, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DataSourceCard } from './data-source-card';
import { ConnectDataSourceModal } from './connect-data-source-modal';
import EditDataSourceModal from './edit-data-source-modal';
import { DataSource } from '@/types/data-sources';
import { useToast } from "@/hooks/use-toast";

interface DataSourcesListProps {
  dataSources: DataSource[];
  onConnectSource: (sourceData: any) => Promise<void>;
  onEditSource: (sourceId: string, sourceData: Partial<DataSource>) => Promise<boolean>;
  onDeleteSource: (sourceId: string) => Promise<void>;
}

export const DataSourcesList: FC<DataSourcesListProps> = ({
  dataSources = [],
  onConnectSource,
  onEditSource,
  onDeleteSource,
}) => {
  const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [editingSource, setEditingSource] = useState<DataSource | null>(null);
  const [processingSourceId, setProcessingSourceId] = useState<string | null>(null);
  const [localDataSources, setLocalDataSources] = useState<DataSource[]>([]);
  const [deletingSourceIds, setDeletingSourceIds] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  useEffect(() => {
    const uniqueSources = new Map<string, DataSource>();
    
    dataSources.forEach(source => {
      const key = `${source.connection_details?.database}_${source.connection_details?.host}_${source.table_name}`;
      if (!uniqueSources.has(key)) {
        uniqueSources.set(key, source);
      }
    });

    setLocalDataSources(Array.from(uniqueSources.values()));
  }, [dataSources]);

  const handleConnectSource = useCallback(async (sourceData: any) => {
    setIsConnecting(true);
    try {
      await onConnectSource(sourceData);
      setIsConnectModalOpen(false);
      toast({
        title: "Success",
        description: "Data source connected successfully"
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to connect data source"
      });
    } finally {
      setIsConnecting(false);
    }
  }, [onConnectSource, toast]);

  const handleEditSource = useCallback(async (sourceId: string, sourceData: Partial<DataSource>) => {
    if (processingSourceId) return;
    setProcessingSourceId(sourceId);
    
    try {
      const success = await onEditSource(sourceId, sourceData);
      if (success) {
        setEditingSource(null);
        toast({
          title: "Success",
          description: "Data source updated successfully"
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to edit data source"
      });
    } finally {
      setProcessingSourceId(null);
    }
  }, [onEditSource, processingSourceId, toast]);

  const handleDeleteSource = useCallback(async (sourceId: string) => {
    if (deletingSourceIds.has(sourceId)) return;
    
    setDeletingSourceIds(prev => new Set([...prev, sourceId]));
    setProcessingSourceId(sourceId);

    try {
      await onDeleteSource(sourceId);
      setLocalDataSources(prev => prev.filter(source => source.id !== sourceId));
      toast({
        title: "Success",
        description: "Data source deleted successfully"
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete data source"
      });
    } finally {
      setProcessingSourceId(null);
      setDeletingSourceIds(prev => {
        const next = new Set(prev);
        next.delete(sourceId);
        return next;
      });
    }
  }, [onDeleteSource, deletingSourceIds, toast]);

  if (!localDataSources.length) {
    return (
      <Card className="p-6">
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Data Sources</h3>
            <Button onClick={() => setIsConnectModalOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Connect Data Source (0/5)
            </Button>
          </div>
          <div className="text-center py-8 text-muted-foreground">
            No data sources connected. Connect your first data source to get started.
          </div>
        </div>
        <ConnectDataSourceModal
          isOpen={isConnectModalOpen}
          onClose={() => setIsConnectModalOpen(false)}
          onSubmit={handleConnectSource}
          isLoading={isConnecting}
        />
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium">Data Sources</h3>
          <Button
            onClick={() => setIsConnectModalOpen(true)}
            disabled={localDataSources.length >= 5}
          >
            <Plus className="w-4 h-4 mr-2" />
            Connect Data Source ({localDataSources.length}/5)
          </Button>
        </div>
        
        <div className="space-y-4">
          {localDataSources.map((source) => (
            <DataSourceCard
              key={source.id}
              dataSource={source}
              onEdit={() => setEditingSource(source)}
              onDelete={() => handleDeleteSource(source.id)}
              isProcessing={processingSourceId === source.id || deletingSourceIds.has(source.id)}
              isDeleting={deletingSourceIds.has(source.id)}
            />
          ))}
        </div>
      </div>

      <ConnectDataSourceModal
        isOpen={isConnectModalOpen}
        onClose={() => setIsConnectModalOpen(false)}
        onSubmit={handleConnectSource}
        isLoading={isConnecting}
      />

      {editingSource && (
        <EditDataSourceModal
          isOpen={true}
          onClose={() => setEditingSource(null)}
          onSubmit={handleEditSource}
          currentSource={editingSource}
        />
      )}
    </Card>
  );
};