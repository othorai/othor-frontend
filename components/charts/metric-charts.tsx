// components/charts/metric-chart.tsx
import { 
    LineChart, 
    Line, 
    BarChart, 
    Bar, 
    AreaChart, 
    Area,
    XAxis, 
    YAxis, 
    CartesianGrid, 
    Tooltip, 
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell
  } from 'recharts';
  import { Alert, AlertDescription } from "@/components/ui/alert";
  import { AlertCircle } from 'lucide-react';
  
  interface MetricChartProps {
    data: {
      current: number;
      previous: number;
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
  
  const COLORS = ['#86B6F6', '#FF9EB1'];
  
  export function MetricChart({ data, type = 'line' }: MetricChartProps) {
    if (!data || (!data.current && data.current !== 0) || (!data.previous && data.previous !== 0)) {
      return (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>No data available for visualization</AlertDescription>
        </Alert>
      );
    }
  
    const chartData = [
      { name: 'Previous', value: data.previous },
      { name: 'Current', value: data.current }
    ];
  
    const renderLineChart = () => (
      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
          <XAxis 
            dataKey="name" 
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
        </LineChart>
      </ResponsiveContainer>
    );
  
    const renderBarChart = () => (
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
          <XAxis 
            dataKey="name" 
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
          <Bar 
            dataKey="value" 
            fill="hsl(var(--primary))"
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    );
  
    const renderAreaChart = () => (
      <ResponsiveContainer width="100%" height={220}>
        <AreaChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
          <XAxis 
            dataKey="name" 
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
          <Area
            type="monotone"
            dataKey="value"
            stroke="hsl(var(--primary))"
            fill="hsl(var(--primary)/0.2)"
          />
        </AreaChart>
      </ResponsiveContainer>
    );
  
    const renderPieChart = () => (
      <ResponsiveContainer width="100%" height={220}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={80}
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={COLORS[index % COLORS.length]}
              />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{ 
              backgroundColor: 'hsl(var(--background))',
              borderColor: 'hsl(var(--border))',
            }}
            formatter={(value: number) => [formatValue(value), 'Value']}
          />
        </PieChart>
      </ResponsiveContainer>
    );
  
    const renderGaugeChart = () => {
      // Calculate percentage for gauge
      const max = Math.max(data.current, data.previous);
      const percentage = (data.current / max) * 100;
  
      return (
        <div className="relative w-full h-[220px] flex items-center justify-center">
          <svg className="transform -rotate-90 w-48 h-48">
            {/* Background circle */}
            <circle
              cx="96"
              cy="96"
              r="88"
              fill="none"
              stroke="hsl(var(--muted))"
              strokeWidth="12"
              strokeDasharray={2 * Math.PI * 88}
              strokeDashoffset={0}
              className="stroke-muted"
            />
            {/* Foreground circle */}
            <circle
              cx="96"
              cy="96"
              r="88"
              fill="none"
              stroke="hsl(var(--primary))"
              strokeWidth="12"
              strokeDasharray={2 * Math.PI * 88}
              strokeDashoffset={2 * Math.PI * 88 * ((100 - percentage) / 100)}
              strokeLinecap="round"
              className="transition-all duration-1000 ease-in-out"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-2xl font-bold">
              {formatValue(data.current)}
            </span>
          </div>
        </div>
      );
    };
  
    switch (type.toLowerCase()) {
      case 'bar':
        return renderBarChart();
      case 'gauge':
        return renderGaugeChart();
      case 'area':
        return renderAreaChart();
      case 'column':
        return renderBarChart(); // Column is same as bar but vertical
      case 'pie':
        return renderPieChart();
      case 'line':
      default:
        return renderLineChart();
    }
  }