import { 
    LineChart, 
    Line, 
    XAxis, 
    YAxis, 
    CartesianGrid, 
    Tooltip, 
    ResponsiveContainer,
    Area
  } from 'recharts';
  import { Alert, AlertDescription } from "@/components/ui/alert";
  import { AlertCircle } from 'lucide-react';
  
  interface ForecastData {
    date: string;
    value: number;
    trend?: string;
    confidence_interval?: {
      lower: number;
      upper: number;
    };
  }
  
  interface ForecastChartProps {
    data: {
      current?: number;
      previous?: number;
      graph_data: ForecastData[];
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
  
  const formatDate = (dateString: string, isForecast: boolean) => {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return dateString;
    }
    
    const options: Intl.DateTimeFormatOptions = {
      month: 'short',
      day: 'numeric'
    };
    
    if (date.getFullYear() !== new Date().getFullYear() || isForecast) {
      options.year = '2-digit';
    }
    
    return date.toLocaleDateString(undefined, options);
  };
  
  export function ForecastChart({ data, type = 'line', height = 300, compactView = false }: ForecastChartProps) {
    if (!data?.graph_data || !Array.isArray(data.graph_data) || data.graph_data.length === 0) {
      return (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>No data available for visualization</AlertDescription>
        </Alert>
      );
    }
  
    const chartData = data.graph_data.map(point => ({
      date: formatDate(point.date, Boolean(data.isForecast)),
      value: point.value,
      ...(point.confidence_interval && {
        lower: point.confidence_interval.lower,
        upper: point.confidence_interval.upper
      })
    }));
  
    const allValues = chartData.flatMap(d => [
      d.value,
      d.lower !== undefined ? d.lower : null,
      d.upper !== undefined ? d.upper : null
    ]).filter((v): v is number => v !== null);
    
    const minValue = Math.min(...allValues);
    const maxValue = Math.max(...allValues);
    const padding = compactView 
      ? (maxValue - minValue) * 0.1
      : (maxValue - minValue) * 0.25;
    
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
            formatter={(value: number, name: string) => {
              if (name === 'Confidence Interval') {
                return ['', ''];
              }
              return [formatValue(value), name === 'value' ? 'Value' : name];
            }}
          />
          {data.isForecast && chartData[0]?.lower !== undefined && (
            <Area
              dataKey="lower"
              stroke="none"
              fill="hsl(var(--primary))"
              fillOpacity={0.1}
              name="Confidence Interval"
            />
          )}
          {data.isForecast && chartData[0]?.upper !== undefined && (
            <Area
              dataKey="upper"
              stroke="none"
              fill="hsl(var(--primary))"
              fillOpacity={0.1}
              name="Confidence Interval"
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