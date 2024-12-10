export interface Article {
  id: string;
  title: string;
  content: string;
  graph_data: Record<string, any>;
  source_info: any;
  category: string;
  time_period: string;
  isLiked: boolean;
}

export interface MetricPoint {
  date: string;
  value: number;
  trend?: 'up' | 'down';
  ma3?: number | null;
  ma7?: number | null;
}

export interface MetricData {
  percentage_change: number;
  trend: 'up' | 'down';
  start_date: string;
  end_date: string;
  start_amount: number;
  end_amount: number;
  graph_data: MetricPoint[];
}

export interface DataSource {
  id: string;
  source_type: string;
  connected: boolean;
  connection_details: {
    database: string;
    host: string;
  };
  table_name: string;
  name: string;
}