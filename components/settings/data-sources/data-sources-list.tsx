// components/settings/data-sources/data-sources-list.tsx
import { FC, useState } from 'react';
import { Plus } from 'lucide-react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DataSourceCard } from './data-source-card';
import { ConnectDataSourceModal } from './connect-data-source-modal';

interface ConnectionDetails {
  database: string;
  host: string;
}

interface DataSource {
  id: string;
  source_type: string;
  connected: boolean;
  connection_details: ConnectionDetails;
  table_name: string;
}

interface DataSourcesListProps {
  dataSources: DataSource[];
  onConnectSource: (sourceData: any) => void;
  onEditSource: (sourceId: string, sourceData: any) => void;
  onDeleteSource: (sourceId: string) => void;
}

export const DataSourcesList: FC<DataSourcesListProps> = ({
  dataSources,
  onConnectSource,
  onEditSource,
  onDeleteSource,
}) => {
  const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);

  const handleConnectSource = async (sourceData: any) => {
    setIsConnecting(true);
    try {
      await onConnectSource(sourceData);
      setIsConnectModalOpen(false);
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <Card className="p-6">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium">Data Sources</h3>
          <Button
            onClick={() => setIsConnectModalOpen(true)}
            disabled={dataSources.length >= 5}
          >
            <Plus className="w-4 h-4 mr-2" />
            Connect Data Source ({dataSources.length}/5)
          </Button>
        </div>
        <div className="space-y-4">
          {dataSources.map((source) => (
            <DataSourceCard
              key={source.id}
              dataSource={source}
              onEdit={onEditSource}
              onDelete={onDeleteSource}
            />
          ))}
          {dataSources.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No data sources connected. Connect your first data source to get started.
            </div>
          )}
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
};