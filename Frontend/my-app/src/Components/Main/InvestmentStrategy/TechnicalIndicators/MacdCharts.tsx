import React, { useEffect, useState } from 'react';
import { Typography } from '@mui/material';
import VisibleChart from './VisibleChart';

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

interface MacdChartProps {
  ticker: string;
}

const MacdChart: React.FC<MacdChartProps> = ({ ticker }) => {
  const [data, setData] = useState<{ output_ma_prices: any[] } | null>(null);  // Adjusted for the new API response format
  const [visibleLines, setVisibleLines] = useState({
    price: true,
    MA9: true,
    MA20: true,
    MA26: true,
    MA50: true,
    MA100: true,
    MA200: true,
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
        setData(jsonData);  // Set the fetched data to state
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
      data={data}  // Pass the full data structure to VisibleChart
      visibleLines={visibleLines}
      handleLegendClick={handleLegendClick}
    />
  );
};

export default MacdChart;
