// components/settings/data-sources/data-source-card.tsx
import { FC } from 'react';
import { Edit, Trash2 } from 'lucide-react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

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
  const {
    id,
    source_type,
    connected,
    connection_details,
    table_name
  } = dataSource;

  return (
    <Card className="p-4">
      <div className="flex justify-between items-center">
        <div>
          <h4 className="font-medium">{source_type.toUpperCase()}</h4>
          <p className="text-sm text-muted-foreground">
            {connection_details.database} • {connection_details.host}
          </p>
          <p className="text-sm text-muted-foreground">
            Table: {table_name}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant={connected ? "success" : "destructive"}>
            {connected ? 'Connected' : 'Disconnected'}
          </Badge>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => onEdit(id)}
          >
            <Edit className="w-4 h-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-red-600 hover:text-red-700"
            onClick={() => onDelete(id)}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
};