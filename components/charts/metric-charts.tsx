// components/charts/metric-charts.tsx
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer
} from 'recharts';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from 'lucide-react';

interface MetricChartProps {
  data: {
    current?: number;
    previous?: number;
    graph_data?: Array<{
      date: string;
      value: number;
      trend?: string;
      ma3?: number;
      ma7?: number;
    }>;
    visualization?: {
      type: string;
    };
  };
  type?: string;
}

const formatValue = (value: number) => {
  if (value >= 1000000000) return `${(value / 1000000000).toFixed(1)}B`;
  if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
  return value.toFixed(1);
};

export function MetricChart({ data, type = 'line' }: MetricChartProps) {
  // Debug logging
  console.log('MetricChart received data:', data);

  // Check if we have graph_data
  if (!data?.graph_data || !Array.isArray(data.graph_data) || data.graph_data.length === 0) {
    console.log('No graph_data available:', data);
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>No data available for visualization</AlertDescription>
      </Alert>
    );
  }

  // Transform data for chart
  const chartData = data.graph_data.map(point => ({
    date: new Date(point.date).toLocaleDateString(),
    value: point.value,
    ma3: point.ma3,
    ma7: point.ma7
  }));

  console.log('Transformed chart data:', chartData);

  return (
    <ResponsiveContainer width="100%" height={220}>
      <LineChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
        <XAxis 
          dataKey="date" 
          className="text-xs fill-muted-foreground"
        />
        <YAxis 
          className="text-xs fill-muted-foreground"
          tickFormatter={formatValue}
        />
        <Tooltip
          contentStyle={{ 
            backgroundColor: 'hsl(var(--background))',
            borderColor: 'hsl(var(--border))',
          }}
          formatter={(value: number) => [formatValue(value), 'Value']}
        />
        {/* Main value line */}
        <Line 
          type="monotone" 
          dataKey="value" 
          stroke="hsl(var(--primary))" 
          strokeWidth={2}
          dot={{ 
            fill: 'hsl(var(--background))',
            strokeWidth: 2,
          }}
          activeDot={{ r: 6 }}
        />
        {/* MA3 line */}
        {chartData[0]?.ma3 && (
          <Line
            type="monotone"
            dataKey="ma3"
            stroke="#90CAF9"
            strokeWidth={1}
            strokeDasharray="4 4"
            dot={false}
          />
        )}
        {/* MA7 line */}
        {chartData[0]?.ma7 && (
          <Line
            type="monotone"
            dataKey="ma7"
            stroke="#81C784"
            strokeWidth={1}
            strokeDasharray="2 2"
            dot={false}
          />
        )}
      </LineChart>
    </ResponsiveContainer>
  );
}