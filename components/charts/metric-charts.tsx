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
    graph_data: Array<{
      date: string;
      value: number;
      trend?: string;
      ma3?: number;
      ma7?: number;
    }>;
    visualization?: {
      type: string;
    };
    isForecast?: boolean;
  };
  type?: string;
  height?: number;
  compactView?: boolean;
}

const formatValue = (value: number) => {
  if (value >= 1000000000) return `${(value / 1000000000).toFixed(1)}B`;
  if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
  return value.toFixed(1);
};

export function MetricChart({ data, type = 'line', height = 300, compactView = false }: MetricChartProps) {
  if (!data?.graph_data || !Array.isArray(data.graph_data) || data.graph_data.length === 0) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>No data available for visualization</AlertDescription>
      </Alert>
    );
  }

  const chartData = data.graph_data
    .map(point => ({
      date: new Date(point.date).toLocaleDateString(),
      originalDate: new Date(point.date), // Keep original date for sorting
      value: point.value,
      ma3: point.ma3,
      ma7: point.ma7
    }))
    .sort((a, b) => a.originalDate.getTime() - b.originalDate.getTime()); // Sort chronologically

  // Calculate domain with reduced scale for compact view
  const yValues = chartData.map(d => d.value);
  const minValue = Math.min(...yValues);
  const maxValue = Math.max(...yValues);
  const padding = compactView 
    ? (maxValue - minValue) * 0.1  // 10% padding for compact view
    : (maxValue - minValue) * 0.25; // 25% padding for expanded view
  
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
        <XAxis 
          dataKey="date" 
          className="text-xs fill-muted-foreground"
          tick={{ fontSize: compactView ? 10 : 12 }}
          tickMargin={compactView ? 5 : 10}
        />
        <YAxis 
          className="text-xs fill-muted-foreground"
          tickFormatter={formatValue}
          domain={[minValue - padding, maxValue + padding]}
          tick={{ fontSize: compactView ? 10 : 12 }}
          tickMargin={compactView ? 5 : 10}
        />
        <Tooltip
          contentStyle={{ 
            backgroundColor: 'hsl(var(--background))',
            borderColor: 'hsl(var(--border))',
            fontSize: compactView ? 12 : 14
          }}
          formatter={(value: number) => [formatValue(value), 'Value']}
        />
        {!data.isForecast && chartData[0]?.ma7 && (
          <Line
            type="monotone"
            dataKey="ma7"
            stroke="#90CAF9"
            strokeWidth={1}
            strokeDasharray="4 4"
            dot={false}
            name="7-day MA"
          />
        )}
        {!data.isForecast && chartData[0]?.ma3 && (
          <Line
            type="monotone"
            dataKey="ma3"
            stroke="#81C784"
            strokeWidth={1}
            strokeDasharray="2 2"
            dot={false}
            name="3-day MA"
          />
        )}
        <Line 
          type="monotone" 
          dataKey="value" 
          stroke="hsl(var(--primary))" 
          strokeWidth={compactView ? 1.5 : 2}
          dot={{ 
            fill: 'hsl(var(--background))',
            strokeWidth: compactView ? 1.5 : 2,
            r: compactView ? 3 : 4
          }}
          activeDot={{ r: compactView ? 4 : 6 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}