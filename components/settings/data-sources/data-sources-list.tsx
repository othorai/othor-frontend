// components/settings/data-sources/data-source-list.tsx
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
  // State management
  const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [currentSources, setCurrentSources] = useState<DataSource[]>([]);
  const [editingSource, setEditingSource] = useState<DataSource | null>(null);
  const { toast } = useToast();

  // Sync local state with props
  useEffect(() => {
    setCurrentSources(dataSources);
  }, [dataSources]);

  // Connect source handler
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
      console.error('Error connecting source:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to connect data source"
      });
    } finally {
      setIsConnecting(false);
    }
  }, [onConnectSource, toast]);

  // Edit source handler
  const handleEditSource = useCallback(async (sourceId: string, sourceData: Partial<DataSource>) => {
    try {
      const success = await onEditSource(sourceId, sourceData);
      if (success) {
        setEditingSource(null);
        // Update local state with edited source
        setCurrentSources(prev => 
          prev.map(source => 
            source.id === sourceId 
              ? { ...source, ...sourceData }
              : source
          )
        );
      }
    } catch (error) {
      console.error('Error editing source:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to edit data source"
      });
    }
  }, [onEditSource, toast]);

  // Delete source handler
  const handleDeleteSource = useCallback(async (sourceId: string) => {
    try {
      await onDeleteSource(sourceId);
      // Update local state after successful deletion
      setCurrentSources(prev => prev.filter(source => source.id !== sourceId));
      toast({
        title: "Success",
        description: "Data source deleted successfully"
      });
    } catch (error) {
      console.error('Error deleting source:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete data source"
      });
    }
  }, [onDeleteSource, toast]);

  // Modal handlers
  const handleOpenModal = useCallback(() => {
    setIsConnectModalOpen(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setIsConnectModalOpen(false);
  }, []);

  // Render data sources
  const renderDataSources = () => {
    if (!currentSources.length) {
      return (
        <div className="text-center py-8 text-muted-foreground">
          No data sources connected. Connect your first data source to get started.
        </div>
      );
    }

    return currentSources.map((source) => (
      <DataSourceCard
        key={source.id}
        dataSource={source}
        onEdit={() => setEditingSource(source)}
        onDelete={() => handleDeleteSource(source.id)}
      />
    ));
  };

  return (
    <Card className="p-6">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium">Data Sources</h3>
          <Button
            onClick={handleOpenModal}
            disabled={currentSources.length >= 5}
          >
            <Plus className="w-4 h-4 mr-2" />
            Connect Data Source ({currentSources.length}/5)
          </Button>
        </div>
        
        <div className="space-y-4">
          {renderDataSources()}
        </div>
      </div>

      {/* Connect Modal */}
      <ConnectDataSourceModal
        isOpen={isConnectModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleConnectSource}
        isLoading={isConnecting}
      />

      {/* Edit Modal */}
      {editingSource && (
      <EditDataSourceModal
        isOpen={!!editingSource}
        onClose={() => setEditingSource(null)}
        onSubmit={handleEditSource}
        currentSource={editingSource}
      />
    )}
    </Card>
  );
};