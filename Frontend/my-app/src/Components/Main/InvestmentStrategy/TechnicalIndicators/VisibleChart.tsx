import React from 'react';
import { ComposedChart, Line, XAxis, YAxis, Tooltip, Legend, CartesianGrid, TooltipProps } from 'recharts';
import { Paper, Typography } from '@mui/material';

interface MovingAverage {
  name: string;
  linewidth: number;
  color: string;
  data: [string, number][]; // Array of tuples where the first element is a date (string) and the second is a value (number)
}

interface VisibleChartProps {
  ticker: string;
  data: { ticker: string; moving_averages: MovingAverage[] }; // Moving averages now use MovingAverage[] directly
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

  // Define the FormattedPoint interface to handle date as a string and the dynamic properties (like dma9, dma20, etc.)
  interface FormattedPoint {
    date: string; // The date is a string
    [key: string]: number | null; // The other properties are number or null
  }

  // Format data to match Recharts expected format for the X and Y values
  const formattedData: FormattedPoint[] = data.moving_averages[0].data.map((point, index) => {
    const formattedPoint: FormattedPoint = { date: point[0] }; // Date is a string
    data.moving_averages.forEach((avg) => {
      const matchingPoint = avg.data[index];
      formattedPoint[avg.name] = matchingPoint ? matchingPoint[1] : null; // Add moving average value or null
    });
    return formattedPoint;
  });

  return (
    <Paper style={{ marginTop: '20px', padding: '20px' }}>
      <Typography variant="h6" align="center" style={{ color: '#002060', fontWeight: 'bold', marginTop: '10px' }}>
        {ticker} - Moving Averages
      </Typography>
      <ComposedChart width={700} height={400} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
        <XAxis dataKey="date" tickFormatter={formatXAxisDate} />
        <YAxis />
        <Tooltip content={<CustomTooltip />} />
        <Legend onClick={(e) => handleLegendClick(e.dataKey as string)} />
        <CartesianGrid stroke="#f5f5f5" />
        {data.moving_averages.map((avg) => (
          <Line
            key={avg.name}
            type="monotone"
            dataKey={avg.name}
            data={formattedData}
            stroke={avg.color} // Use the specified color
            name={avg.name.toUpperCase()} // Capitalize the moving average name for legend
            dot={false}
            strokeWidth={avg.linewidth}
          />
        ))}
      </ComposedChart>
    </Paper>
  );
};

export default VisibleChart;
