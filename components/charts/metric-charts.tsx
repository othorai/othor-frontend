// components/charts/metric-charts.tsx
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend
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
}

const formatValue = (value: number) => {
  if (value >= 1000000000) return `${(value / 1000000000).toFixed(1)}B`;
  if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
  return value.toFixed(1);
};

export function MetricChart({ data, type = 'line' }: MetricChartProps) {
  if (!data?.graph_data || !Array.isArray(data.graph_data) || data.graph_data.length === 0) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>No data available for visualization</AlertDescription>
      </Alert>
    );
  }

  const chartData = data.graph_data.map(point => ({
    date: new Date(point.date).toLocaleDateString(),
    value: point.value,
    ma3: point.ma3,
    ma7: point.ma7
  }));

  return (
    <ResponsiveContainer width="100%" height="100%">
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
        {!data.isForecast && data.graph_data[0]?.ma7 && (
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
        {!data.isForecast && data.graph_data[0]?.ma3 && (
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
          strokeWidth={2}
          dot={{ 
            fill: 'hsl(var(--background))',
            strokeWidth: 2,
          }}
          activeDot={{ r: 6 }}
          name={data.isForecast ? "Forecast" : "Actual"}
        />
        {(data.graph_data[0]?.ma3 || data.graph_data[0]?.ma7) && (
          <Legend
            verticalAlign="top"
            height={36}
            formatter={(value) => <span className="text-xs">{value}</span>}
          />
        )}
      </LineChart>
    </ResponsiveContainer>
  );
}