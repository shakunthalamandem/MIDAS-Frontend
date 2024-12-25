import React, { useState, useMemo } from 'react';
import {
  ComposedChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  TooltipProps,
} from 'recharts';
import { Paper, Typography, Button, ButtonGroup } from '@mui/material';
import { styled } from '@mui/system';

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

// StyledButton component
const StyledButton = styled(Button)<{ isActive: boolean; lineColor: string }>(
  ({ isActive, lineColor }) => ({
    backgroundColor: isActive ? lineColor : 'transparent',
    border: `1px solid ${lineColor}`,
    color: isActive ? '#fff' : lineColor,
    fontWeight: 'bold',
    marginBottom: '5px',
    '&:hover': {
      backgroundColor: isActive ? lineColor : `${lineColor}70`,
    },
  })
);

const VisibleChart: React.FC<VisibleChartProps> = ({
  ticker,
  data,
  visibleLines,
  handleLegendClick,
}) => {
  const [lineVisibility, setLineVisibility] = useState(visibleLines);

  // Format date for the X-Axis
  const formatXAxisDate = (tickItem: string) => {
    const date = new Date(tickItem);
    if (isNaN(date.getTime())) {
      console.error(`Invalid date: ${tickItem}`);
      return ''; // Return empty string for invalid date
    }
    return `${date.toLocaleString('default', { month: 'short' })} ${date.getFullYear().toString().slice(-2)}`;
  };

  // Define the FormattedPoint interface
  interface FormattedPoint {
    date: string;
    price?: number | null;
    dma9?: number | null;
    dma20?: number | null;
    dma26?: number | null;
    dma50?: number | null;
    dma100?: number | null;
    dma200?: number | null;
  }

  // Memoize formattedData for optimization
  const formattedData: FormattedPoint[] = useMemo(() => {
    return data.moving_averages.map((point) => ({
      date: point.date,
      price: point.price ?? null,
      dma9: point.dma9 ?? null,
      dma20: point.dma20 ?? null,
      dma26: point.dma26 ?? null,
      dma50: point.dma50 ?? null,
      dma100: point.dma100 ?? null,
      dma200: point.dma200 ?? null,
    }));
  }, [data.moving_averages]);

  // Define colors for each line
  const lineColors: Record<string, string> = {
    close: '#413ea0', // Price line color
    MA9: '#00A878',
    MA20: '#002045',
    MA26: '#F633FF',
    MA50: '#0078FF',
    MA100: '#FDCA40',
    MA200: '#FF3339',
  };

  // Toggle the visibility of lines
  const toggleLineVisibility = (key: string) => {
    setLineVisibility((prevState) => ({
      ...prevState,
      [key]: !prevState[key],
    }));
  };

  return (
    <Paper sx={{ marginTop: 2, padding: 2, position: 'relative' }}>
      <Typography
        variant="h6"
        align="center"
        sx={{ color: '#002060', fontWeight: 'bold', marginTop: 2 }}
      >
        {ticker} - Moving Averages
      </Typography>

      {/* Buttons to toggle line visibility */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '10px' }}>
        {['close', 'MA9', 'MA20', 'MA26', 'MA50', 'MA100', 'MA200'].map((lineKey) => (
          <StyledButton
            key={lineKey}
            isActive={lineVisibility[lineKey]}
            onClick={() => toggleLineVisibility(lineKey)}
            lineColor={lineColors[lineKey]}
          >
            {lineKey.toUpperCase()}
          </StyledButton>
        ))}
      </div>

      <ComposedChart width={1000} height={400} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
        <XAxis dataKey="date" tickFormatter={formatXAxisDate} />
        <YAxis
          domain={['auto', 'auto']} // Dynamic scaling for Y-Axis
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend onClick={(e) => handleLegendClick(e.dataKey as string)} />
        <CartesianGrid stroke="#f5f5f5" />

        {/* Render visible lines dynamically */}
        {Object.keys(lineVisibility).map((avgKey) => {
          if (lineVisibility[avgKey]) {
            return (
              <Line
                key={avgKey}
                type="monotone"
                dataKey={avgKey as keyof FormattedPoint}
                data={formattedData}
                stroke={(lineColors as Record<string, string>)[avgKey] || '#8884d8'}
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
