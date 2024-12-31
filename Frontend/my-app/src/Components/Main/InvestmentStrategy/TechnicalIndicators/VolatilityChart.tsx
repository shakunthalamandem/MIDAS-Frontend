import React, { useState, useEffect } from 'react';
import { Card, CardContent, Typography } from '@mui/material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

// Define the types
interface VolatilityData {
  date: string; // Assuming date is in "YYYY-MM-DD" format
  value: number;
}

interface VolatilityChartProps {
  ticker: string;
}

const VolatilityChart: React.FC<VolatilityChartProps> = ({ ticker }) => {
  const [data, setData] = useState<VolatilityData[]>([]);

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
        const VolatilityGraphData = jsonData.technical_data?.volatility_60d || [];
        setData(VolatilityGraphData); // Update the state with the extracted Volatility graph data
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    if (ticker) {
      fetchData();
    }
  }, [ticker]);

  // Helper function to format date as "MMM YY"
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
  };

  return (
    <Card
      sx={{
        maxWidth: 600,
        margin: 'auto',
        mt: 4,
        p: 2,
        boxShadow: 3,
      }}
      elevation={4}
    >
      <CardContent>
        <Typography
          variant="h6"
          align="center"
          style={{
            color: '#002060',
            fontWeight: 'bold',
            marginTop: '10px',
            marginBottom: '10px',
          }}
        >
          Volatility
        </Typography>
        {data.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data}>
              <XAxis
                dataKey="date"
                tickFormatter={formatDate}
                interval={Math.floor(data.length / 4)}
              />
              <YAxis />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="value"
                stroke="#dc0d03"
                strokeWidth={1}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <Typography variant="body2" color="text.secondary">
            Loading data...
          </Typography>
        )}
      </CardContent>
    </Card>
  );
};

export default VolatilityChart;
