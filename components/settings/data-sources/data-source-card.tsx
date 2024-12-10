// components/settings/data-sources/data-source-card.tsx
import { FC } from 'react';
import { Edit, Trash2 } from 'lucide-react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DataSource } from '@/types/data-sources';

interface DataSourceCardProps {
  dataSource: DataSource;
  onEdit: (sourceId: string) => void;
  onDelete: (sourceId: string) => void;
}

export const DataSourceCard: FC<DataSourceCardProps> = ({
  dataSource,
  onEdit,
  onDelete,
}) => {
  // Early return with loading state if data isn't ready
  if (!dataSource?.source_type) {
    return (
      <Card className="p-4">
        <div className="flex justify-between items-center">
          <div>
            <h4 className="font-medium">Loading...</h4>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-4">
      <div className="flex justify-between items-center">
        <div>
          <h4 className="font-medium">{(dataSource.source_type || '').toUpperCase()}</h4>
          <p className="text-sm text-muted-foreground">
            {dataSource.connection_details?.database || 'N/A'} • {dataSource.connection_details?.host || 'N/A'}
          </p>
          <p className="text-sm text-muted-foreground">
            Table: {dataSource.table_name || 'N/A'}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant={dataSource.connected ? "success" : "destructive"}>
            {dataSource.connected ? 'Connected' : 'Disconnected'}
          </Badge>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => onEdit(dataSource.id)}
          >
            <Edit className="w-4 h-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-red-600 hover:text-red-700"
            onClick={() => onDelete(dataSource.id)}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
};