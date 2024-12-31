import React, { useEffect, useState } from 'react';
import { Typography } from '@mui/material';
import VisibleChart from './VisibleChart';

// Define the structure of the data
interface ChartData {
  price: { date: string; price: number }[];
  dma9: { date: string; value: number }[];
  dma20: { date: string; value: number }[];
  dma26: { date: string; value: number }[];
  dma50: { date: string; value: number }[];
  dma100: { date: string; value: number }[];
  dma200: { date: string; value: number }[];
}

// Props for the MacdChart component
interface MacdChartProps {
  ticker: string;
}

const MacdChart: React.FC<MacdChartProps> = ({ ticker }) => {
  const [data, setData] = useState<ChartData | null>(null); // Correctly typed state for data
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
        const response = await fetch(`${apiUrl}/api/technical-analysis/`, {
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

        // Debugging: Log the full API response to verify structure
        console.log('API Response:', jsonData);

        // Access the nested `technical_data.output_ma_prices`
        const graphData = jsonData?.technical_data?.output_ma_prices;
        console.log("graphData",graphData)

        if (!graphData) {
          throw new Error('Invalid data structure: Missing `technical_data.output_ma_prices`');
        }

        // Transform the API response to match the ChartData structure
        const transformedData: ChartData = {
          price: graphData.price?.map((item: any) => ({
            date: item.date,
            price: item.price,
          })) || [],
          dma9: graphData.dma9?.map((item: any) => ({
            date: item.date,
            value: item.value,
          })) || [],
          dma20: graphData.dma20?.map((item: any) => ({
            date: item.date,
            value: item.value,
          })) || [],
          dma26: graphData.dma26?.map((item: any) => ({
            date: item.date,
            value: item.value,
          })) || [],
          dma50: graphData.dma50?.map((item: any) => ({
            date: item.date,
            value: item.value,
          })) || [],
          dma100: graphData.dma100?.map((item: any) => ({
            date: item.date,
            value: item.value,
          })) || [],
          dma200: graphData.dma200?.map((item: any) => ({
            date: item.date,
            value: item.value,
          })) || [],
        };

        setData(transformedData);
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
      data={data} // Pass the full data structure to VisibleChart
      visibleLines={visibleLines}
      handleLegendClick={handleLegendClick}
    />
  );
};

export default MacdChart;
