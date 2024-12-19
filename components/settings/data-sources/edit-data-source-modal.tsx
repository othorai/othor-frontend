import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { DataSource, ConnectionDetails } from '@/types/data-sources';

interface EditDataSourceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (sourceId: string, sourceData: Partial<DataSource>) => Promise<void>;
  currentSource: DataSource;
}

export default function EditDataSourceModal({
  isOpen,
  onClose,
  onSubmit,
  currentSource
}: EditDataSourceModalProps) {
  // Initialize form state with all required fields
  const [formData, setFormData] = useState({
    name: currentSource.name || '',
    table_name: currentSource.table_name || '',
    source_type: currentSource.source_type, // Include the required source_type
    connection_details: {
      database: currentSource.connection_details.database || '',
      host: currentSource.connection_details.host || ''
    }
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Reset form when currentSource changes
  useEffect(() => {
    setFormData({
      name: currentSource.name || '',
      table_name: currentSource.table_name || '',
      source_type: currentSource.source_type,
      connection_details: {
        database: currentSource.connection_details.database || '',
        host: currentSource.connection_details.host || ''
      }
    });
  }, [currentSource]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setIsLoading(true);
      
      // Create submission data with all required fields
      const submissionData: Partial<DataSource> = {
        name: formData.name,
        table_name: formData.table_name,
        source_type: formData.source_type, // Include source_type in submission
        connection_details: {
          database: formData.connection_details.database,
          host: formData.connection_details.host
        }
      };

      await onSubmit(currentSource.id, submissionData);
      onClose();
      toast({
        title: "Success",
        description: "Data source updated successfully"
      });
    } catch (error) {
      console.error('Error updating data source:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update data source"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Data Source</DialogTitle>
          <DialogDescription>
            Update your data source configuration details below.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input 
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  name: e.target.value 
                }))}
                className="col-span-3"
                placeholder="Enter data source name"
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="table_name" className="text-right">
                Table
              </Label>
              <Input 
                id="table_name"
                value={formData.table_name}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  table_name: e.target.value 
                }))}
                className="col-span-3"
                placeholder="Enter table name"
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="database" className="text-right">
                Database
              </Label>
              <Input 
                id="database"
                value={formData.connection_details.database}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  connection_details: {
                    ...prev.connection_details,
                    database: e.target.value
                  }
                }))}
                className="col-span-3"
                placeholder="Enter database name"
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="host" className="text-right">
                Host
              </Label>
              <Input 
                id="host"
                value={formData.connection_details.host}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  connection_details: {
                    ...prev.connection_details,
                    host: e.target.value
                  }
                }))}
                className="col-span-3"
                placeholder="Enter host"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button 
              type="submit"
              disabled={isLoading || !formData.name}
            >
              {isLoading ? "Updating..." : "Update"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}