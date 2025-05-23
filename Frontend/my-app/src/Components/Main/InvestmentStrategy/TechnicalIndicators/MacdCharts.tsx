import React, { useEffect, useState } from 'react';
import { Typography, Paper, Button } from '@mui/material';
import { ComposedChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { useNavigate } from 'react-router-dom';

interface ChartData {
  price: { date: string; price: number }[];
  dma9: { date: string; value: number }[];
  dma20: { date: string; value: number }[];
  dma26: { date: string; value: number }[];
  dma50: { date: string; value: number }[];
  dma100: { date: string; value: number }[];
  dma200: { date: string; value: number }[];
}

interface MacdChartProps {
  ticker: string;
}

const MacdChart: React.FC<MacdChartProps> = ({ ticker }) => {
  const [data, setData] = useState<ChartData | null>(null);
  const navigate = useNavigate(); 

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
      const token = localStorage.getItem("access_token");
      if (!apiUrl) {
        throw new Error('API URL is not defined in environment variables');
      }

      const payload = { ticker };

      try {
        const response = await fetch(`${apiUrl}/api/technical-analysis/`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json', 
            "Authorization": token ? `Bearer ${token}` : ''
          },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          throw new Error('Failed to fetch data');
        }

        const jsonData = await response.json();
        const graphData = jsonData?.technical_data?.output_ma_prices;

        if (!graphData) {
          throw new Error('Invalid data structure: Missing `technical_data.output_ma_prices`');
        }

        const transformedData: ChartData = {
          price: graphData.map((item: any) => ({ date: item.date, price: item.price })),
          dma9: graphData.map((item: any) => ({ date: item.date, value: item.dma9 })),
          dma20: graphData.map((item: any) => ({ date: item.date, value: item.dma20 })),
          dma26: graphData.map((item: any) => ({ date: item.date, value: item.dma26 })),
          dma50: graphData.map((item: any) => ({ date: item.date, value: item.dma50 })),
          dma100: graphData.map((item: any) => ({ date: item.date, value: item.dma100 })),
          dma200: graphData.map((item: any) => ({ date: item.date, value: item.dma200 })),
        };

        setData(transformedData);
      } catch (error) {
        console.error('Error fetching data:', error);
        // navigate("/error");  

      }
    };

    if (ticker) {
      fetchData();
    }
  }, [ticker]);

  const handleLegendClick = (dataKey: string) => {
    setVisibleLines((prevState) => ({
      ...prevState,
      [dataKey]: !prevState[dataKey as keyof typeof visibleLines],
    }));
  };

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

  if (!data) {
    return <Typography>Loading...</Typography>;
  }

  const formattedData = data.price.map((priceItem) => ({
    date: priceItem.date,
    price: priceItem.price,
    dma9: data.dma9.find((item) => item.date === priceItem.date)?.value ?? null,
    dma20: data.dma20.find((item) => item.date === priceItem.date)?.value ?? null,
    dma26: data.dma26.find((item) => item.date === priceItem.date)?.value ?? null,
    dma50: data.dma50.find((item) => item.date === priceItem.date)?.value ?? null,
    dma100: data.dma100.find((item) => item.date === priceItem.date)?.value ?? null,
    dma200: data.dma200.find((item) => item.date === priceItem.date)?.value ?? null,
  }));

  return (
    <Paper style={{ marginTop: '20px', padding: '20px', boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.15)' }}>
      <Typography variant="h6" align="center" style={{ color: '#002060', fontWeight: 'bold' }}>
        {ticker} - Price and Moving Averages
      </Typography>
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '10px', marginTop: '20px' }}>
        {Object.entries(visibleLines).map(([key, isVisible]) => (
          <Button
            key={key}
            onClick={() => handleLegendClick(key)}
            style={{
              borderBottom: `2px solid ${isVisible ? getLineColor(key) : 'transparent'}`,
              color: isVisible ? getLineColor(key) : 'inherit',
              margin: '0 8px',
            }}
          >
            {key.toUpperCase()}
          </Button>
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

export default MacdChart;
