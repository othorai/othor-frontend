// components/settings/hooks/use-data-source.ts
import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from "@/hooks/use-toast";
import { API_URL } from '@/lib/config';


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

interface UseDataSourceReturn {
  dataSources: DataSource[];
  isLoading: boolean;
  fetchDataSources: (organizationId: string) => Promise<void>;
  handleConnectDataSource: (organizationId: string, sourceData: Partial<DataSource>) => Promise<boolean>;
  handleEditDataSource: (organizationId: string, sourceId: string, sourceData: Partial<DataSource>) => Promise<boolean>;
  handleDeleteDataSource: (organizationId: string, sourceId: string) => Promise<boolean>;
}

export function useDataSource(): UseDataSourceReturn {
  const [dataSources, setDataSources] = useState<DataSource[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const fetchDataSources = useCallback(async (organizationId: string) => {
    if (!organizationId) {
      setDataSources([]);
      return;
    }

    setIsLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        router.push('/login');
        return;
      }

      const response = await fetch(
        `${API_URL}/data-source/organization/${organizationId}/data-sources`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
          cache: 'no-store'
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch data sources');
      }

      const data = await response.json();
      
      // Deduplicate data sources
      const uniqueSources = new Map();
      (data.data_sources || []).forEach((source: DataSource) => {
        const key = `${source.connection_details?.database}_${source.connection_details?.host}_${source.table_name}`;
        if (!uniqueSources.has(key)) {
          uniqueSources.set(key, source);
        }
      });
      
      setDataSources(Array.from(uniqueSources.values()));
    } catch (error) {
      console.error('Error fetching data sources:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch data sources"
      });
    } finally {
      setIsLoading(false);
    }
  }, [router, toast]);

  const handleConnectDataSource = async (
    organizationId: string, 
    sourceData: Partial<DataSource>
  ): Promise<boolean> => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_URL}/data-source/connect`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(sourceData),
      });

      if (!response.ok) throw new Error('Failed to connect data source');

      await response.json();
      await fetchDataSources(organizationId);
      
      toast({
        title: "Success",
        description: "Data source connected successfully"
      });
      return true;
    } catch (error) {
      console.error('Error connecting data source:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to connect data source"
      });
      return false;
    }
  };

  const handleEditDataSource = async (
    organizationId: string,
    sourceId: string,
    sourceData: Partial<DataSource>
  ): Promise<boolean> => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(
        `${API_URL}/data-source/connections/${sourceId}`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...sourceData,
            source_type: sourceData.source_type
          }),
        }
      );

      if (!response.ok) throw new Error('Failed to update data source');

      await response.json();
      await fetchDataSources(organizationId);
      
      toast({
        title: "Success",
        description: "Data source updated successfully"
      });
      return true;
    } catch (error) {
      console.error('Error updating data source:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update data source"
      });
      return false;
    }
  };

  const handleDeleteDataSource = async (
    organizationId: string,
    sourceId: string
  ): Promise<boolean> => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(
        `${API_URL}/data-source/connections/${sourceId}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) throw new Error('Failed to delete data source');
      
      // Wait for deletion to complete
      await response.json();
      
      // Refetch data sources to ensure sync
      await fetchDataSources(organizationId);
      
      toast({
        title: "Success",
        description: "Data source deleted successfully"
      });
      return true;
    } catch (error) {
      console.error('Error deleting data source:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete data source"
      });
      return false;
    }
  };

  return {
    dataSources,
    isLoading,
    fetchDataSources,
    handleConnectDataSource,
    handleEditDataSource,
    handleDeleteDataSource,
  };
}