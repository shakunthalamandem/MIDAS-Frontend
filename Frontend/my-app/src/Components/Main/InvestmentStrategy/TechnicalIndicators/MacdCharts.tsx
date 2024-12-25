import React, { useEffect, useState } from 'react';
import { Typography } from '@mui/material';
import VisibleChart from './VisibleChart';

interface MovingAverage {
  date: string;
  price: number;   // Changed from string to number
  dma9: number;    // Changed from string to number
  dma20: number;   // Changed from string to number
  dma26: number;   // Changed from string to number
  dma50: number;   // Changed from string to number
  dma100: number;  // Changed from string to number
  dma200: number;  // Changed from string to number
}

interface MacdChartProps {
  ticker: string;
}

const MacdChart: React.FC<MacdChartProps> = ({ ticker }) => {
  const [data, setData] = useState<{ ticker: string; moving_averages: MovingAverage[] } | null>(null);
  const [visibleLines, setVisibleLines] = useState({
    price: true,
    dma9: true,
    dma20: true,
    dma26: true,
    dma50: true,
    dma100: true,
    dma200: true,
  });

  useEffect(() => {
    const fetchData = async () => {
      const apiUrl = process.env.REACT_APP_API_URL;
      if (!apiUrl) {
        throw new Error('API URL is not defined in environment variables');
      }

      const payload = { ticker };

      try {
        const response = await fetch(`${apiUrl}/api/moving_averages/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          throw new Error('Failed to fetch data');
        }

        const jsonData = await response.json();
        setData(jsonData); // Set the fetched data to state
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    if (ticker) {
      fetchData();
    }
  }, [ticker]);

  // Handle the visibility toggle for each line in the chart
  const handleLegendClick = (dataKey: string) => {
    setVisibleLines((prevState) => ({
      ...prevState,
      [dataKey]: !prevState[dataKey as keyof typeof visibleLines],
    }));
  };

  if (!data) {
    return <Typography>Loading...</Typography>;
  }

  return (
    <VisibleChart
      ticker={ticker}
      data={data}
      visibleLines={visibleLines}
      handleLegendClick={handleLegendClick}
    />
  );
};

export default MacdChart;
