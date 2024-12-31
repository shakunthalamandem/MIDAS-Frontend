import React, { useEffect } from 'react';
import { Paper, Typography, Button } from '@mui/material';
import { styled } from '@mui/system';
import {
  ComposedChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from 'recharts';

interface VisibleChartProps {
  ticker: string;
  data: {
    price: { date: string; price: number }[];
    dma9: { date: string; value: number }[];
    dma20: { date: string; value: number }[];
    dma26: { date: string; value: number }[];
    dma50: { date: string; value: number }[];
    dma100: { date: string; value: number }[];
    dma200: { date: string; value: number }[];
  };
  visibleLines: Record<string, boolean>;
  handleLegendClick: (dataKey: string) => void;
}

const VisibleChart: React.FC<VisibleChartProps> = ({ ticker, data, visibleLines, handleLegendClick }) => {
  // Map the data correctly
  const formattedData = data.price.map((item, index) => ({
    date: item.date,
    price: item.price,
    dma9: data.dma9[index]?.value ?? null,  // Check for null values
    dma20: data.dma20[index]?.value ?? null,
    dma26: data.dma26[index]?.value ?? null,
    dma50: data.dma50[index]?.value ?? null,
    dma100: data.dma100[index]?.value ?? null,
    dma200: data.dma200[index]?.value ?? null,
  }));

  useEffect(() => {
    // Debug: check formattedData in console to ensure all lines are included
    console.log('Formatted Data:', formattedData);
  }, [formattedData]);

  const StyledButton = styled(Button)(({ isActive, lineColor }: { isActive: boolean; lineColor: string }) => ({
    borderBottom: `2px solid ${isActive ? lineColor : 'transparent'}`,
    color: isActive ? lineColor : 'inherit',
    margin: '0 8px',
  }));

  const getLineColor = (key: string): string => {
    const colors: Record<string, string> = {
      price: '#413ea0',
      dma9: '#00A878',
      dma20: '#205011',
      dma26: '#F633FF',
      dma50: '#0078FF',
      dma100: '#FDCA40',
      dma200: '#FF3339',
    };
    return colors[key] || '#000';
  };

  return (
    <Paper style={{ marginTop: '20px', padding: '20px' }}>
      <Typography variant="h6" align="center" style={{ color: '#002060', fontWeight: 'bold' }}>
        {ticker} - Price and Moving Averages
      </Typography>
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '10px' }}>
        {Object.entries(visibleLines).map(([key, isVisible]) => (
          <StyledButton
            key={key}
            isActive={isVisible}
            onClick={() => handleLegendClick(key)}
            lineColor={getLineColor(key)}
          >
            {key.toUpperCase()}
          </StyledButton>
        ))}
      </div>
      <ComposedChart width={1000} height={400} data={formattedData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip />
        <Legend />
        <CartesianGrid stroke="#f5f5f5" />
        {Object.entries(visibleLines).map(
          ([key, isVisible]) =>
            isVisible && (
              <Line
                key={key}
                type="monotone"
                dataKey={key}
                stroke={getLineColor(key)}
                dot={false}
                strokeWidth={2}
              />
            )
        )}
      </ComposedChart>
    </Paper>
  );
};

export default VisibleChart;
