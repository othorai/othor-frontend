import { FC, useState, useCallback, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DataSourceCard } from './data-source-card';
import { ConnectDataSourceModal } from './connect-data-source-modal';
import { DataSource } from '@/types/data-sources';

interface DataSourcesListProps {
  dataSources: DataSource[];
  onConnectSource: (sourceData: any) => Promise<void>;
  onEditSource: (sourceId: string) => void;
  onDeleteSource: (sourceId: string) => void;
}

export const DataSourcesList: FC<DataSourcesListProps> = ({
  dataSources = [], // Provide default value to prevent undefined
  onConnectSource,
  onEditSource,
  onDeleteSource,
}) => {
  const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [currentSources, setCurrentSources] = useState<DataSource[]>([]);

  // Use useEffect to update local state when props change
  useEffect(() => {
    setCurrentSources(dataSources);
  }, [dataSources]);

  const handleConnectSource = useCallback(async (sourceData: any) => {
    setIsConnecting(true);
    try {
      await onConnectSource(sourceData);
      setIsConnectModalOpen(false);
    } catch (error) {
      console.error('Error connecting source:', error);
    } finally {
      setIsConnecting(false);
    }
  }, [onConnectSource]);

  const handleOpenModal = useCallback(() => {
    setIsConnectModalOpen(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setIsConnectModalOpen(false);
  }, []);

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
        dataSource={{
          ...source,
          name: source.connection_details?.database || 'N/A'
        }}
        onEdit={onEditSource}
        onDelete={onDeleteSource}
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
        
        <div className="space-y-4" key="data-sources-list">
          {renderDataSources()}
        </div>
      </div>

      <ConnectDataSourceModal
        isOpen={isConnectModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleConnectSource}
        isLoading={isConnecting}
      />
    </Card>
  );
};