import { FC } from 'react';
import { Edit, Trash2, Loader2 } from 'lucide-react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DataSource } from '@/types/data-sources';

interface DataSourceCardProps {
  dataSource: DataSource;
  onEdit: (sourceId: string) => void;
  onDelete: (sourceId: string) => void;
  isProcessing?: boolean;
  isDeleting?: boolean;
}

export const DataSourceCard: FC<DataSourceCardProps> = ({
  dataSource,
  onEdit,
  onDelete,
  isProcessing = false,
  isDeleting = false,
}) => {
  if (!dataSource?.source_type) {
    return (
      <Card className="p-4">
        <div className="flex justify-between items-center">
          <div className="animate-pulse space-y-2 w-full">
            <div className="h-4 bg-muted rounded w-24"></div>
            <div className="h-3 bg-muted rounded w-48"></div>
            <div className="h-3 bg-muted rounded w-32"></div>
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
            {isProcessing ? (
              <div className="flex items-center">
                <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                {isDeleting ? 'Deleting...' : 'Processing...'}
              </div>
            ) : (
              dataSource.connected ? 'Connected' : 'Disconnected'
            )}
          </Badge>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => onEdit(dataSource.id)}
            disabled={isProcessing || isDeleting}
          >
            <Edit className="w-4 h-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-red-600 hover:text-red-700 disabled:text-red-300"
            onClick={() => onDelete(dataSource.id)}
            disabled={isProcessing || isDeleting}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
};