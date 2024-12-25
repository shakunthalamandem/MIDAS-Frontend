import React, { useMemo } from 'react';
import { ComposedChart, Line, XAxis, YAxis, Tooltip, Legend, CartesianGrid, TooltipProps } from 'recharts';
import { Paper, Typography } from '@mui/material';

interface MovingAverage {
  date: string;
  price: number;
  dma9: number;
  dma20: number;
  dma26: number;
  dma50: number;
  dma100: number;
  dma200: number;
}

interface VisibleChartProps {
  ticker: string;
  data: { ticker: string; moving_averages: MovingAverage[] };
  visibleLines: Record<string, boolean>;
  handleLegendClick: (dataKey: string) => void;
}

// Custom tooltip for displaying values on hover
const CustomTooltip = ({ active, payload, label }: TooltipProps<any, any>) => {
  if (active && payload && payload.length) {
    return (
      <div className="custom-tooltip">
        <p>{`Date: ${label}`}</p>
        {payload.map((entry, index) => (
          <p key={index} style={{ color: entry.color }}>
            {`${entry.name}: ${entry.value}`}
          </p>
        ))}
      </div>
    );
  }

  return null;
};

const VisibleChart: React.FC<VisibleChartProps> = ({ ticker, data, visibleLines, handleLegendClick }) => {
  // Format date for the X-Axis
  const formatXAxisDate = (tickItem: string) => {
    const date = new Date(tickItem);
    if (isNaN(date.getTime())) {
      console.error(`Invalid date: ${tickItem}`);
      return ''; // Return empty string for invalid date
    }
    return `${date.toLocaleString('default', { month: 'short' })} ${date.getFullYear().toString().slice(-2)}`;
  };

  // Define the FormattedPoint interface to handle known and dynamic properties
  interface FormattedPoint {
    date: string;  // The date is explicitly a string
    dma9?: number | null;
    dma20?: number | null;
    dma26?: number | null;
    dma50?: number | null;
    dma100?: number | null;
    dma200?: number | null;
    [key: string]: number | null | undefined; // This allows for dynamic keys, but restricts values to numbers or null
  }

  // Memoize formattedData for optimization
  const formattedData: FormattedPoint[] = useMemo(() => {
    return data.moving_averages.map((point) => {
      const formattedPoint: FormattedPoint = { date: point.date };

      // Iterate through the keys of the MovingAverage interface
      Object.keys(point).forEach((key) => {
        if (key !== 'date') {
          const movingAverageKey = key as keyof MovingAverage;

          // Assign numeric values (default to null if undefined)
          formattedPoint[movingAverageKey] = point[movingAverageKey] ?? null;
        }
      });

      return formattedPoint;
    });
  }, [data.moving_averages]);

  return (
    <Paper sx={{ marginTop: 2, padding: 2 }}>
      <Typography variant="h6" align="center" sx={{ color: '#002060', fontWeight: 'bold', marginTop: 2 }}>
        {ticker} - Moving Averages
      </Typography>
      <ComposedChart width={700} height={400} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
        <XAxis dataKey="date" tickFormatter={formatXAxisDate} />
        <YAxis />
        <Tooltip content={<CustomTooltip />} />
        <Legend onClick={(e) => handleLegendClick(e.dataKey as string)} />
        <CartesianGrid stroke="#f5f5f5" />
        
        {/* Render visible lines dynamically based on the visibleLines prop */}
        {Object.keys(data.moving_averages[0]).map((avgKey) => {
          if (avgKey !== 'date' && visibleLines[avgKey]) {
            return (
              <Line
                key={avgKey}
                type="monotone"
                dataKey={avgKey}
                data={formattedData}
                stroke="#8884d8"
                name={avgKey.toUpperCase()}
                dot={false}
                strokeWidth={2}
              />
            );
          }
          return null;
        })}
      </ComposedChart>
    </Paper>
  );
};

export default VisibleChart;
