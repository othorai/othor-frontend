// types/data-sources.ts
export interface ConnectionDetails {
    database: string;
    host: string;
    port?: string | number;
    schema?: string;
    warehouse?: string;
    account?: string;
  }
  
  export interface DataSource {
    id: string;
    source_type: string;
    connected: boolean;
    connection_details: ConnectionDetails;
    table_name: string;
    name: string;
  }
  
  export interface DataSourceFormData {
    name: string;
    host?: string;
    port?: string;
    username: string;
    password: string;
    database: string;
    schema?: string;
    table_name: string;
    account?: string;
    warehouse?: string;
  }
  
  export type DataSourceType = 'mysql' | 'postgresql' | 'snowflake';