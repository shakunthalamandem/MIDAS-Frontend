import React, { useState, useEffect } from 'react';
import { Card, CardContent, Typography } from '@mui/material';
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from 'recharts';
import { useNavigate } from 'react-router-dom';

// Define the types
interface VolumeData {
  date: string; // Assuming date is in "YYYY-MM-DD" format
  volume: number;
  '20day_volume': number;
}

interface VolumeChartProps {
  ticker: string;
}

const VolumeChart: React.FC<VolumeChartProps> = ({ ticker }) => {
  const [data, setData] = useState<VolumeData[]>([]);
  const navigate = useNavigate(); 


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
            "Authorization": token ? `Bearer ${token}` : '',
          },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          throw new Error('Failed to fetch data');
        }

        const jsonData = await response.json();
        const volumeGraphData = jsonData.technical_data?.volume_graph || [];
        setData(volumeGraphData); // Update the state with the volume graph data
      } catch (error) {
        console.error('Error fetching data:', error);
        // navigate("/error");  

      }
    };

    if (ticker) {
      fetchData();
    }
  }, [ticker]);

  // Helper function to format X-axis date as "MMM YY"
  const formatXAxisDate = (tickItem: string) => {
    const date = new Date(tickItem);
    return `${date.toLocaleString('default', { month: 'short' })} ${date.getFullYear().toString().slice(-2)}`;
  };

  // Helper function to format Y-axis numbers as "M" or "B"
  const formatYAxisNumber = (value: number) => {
    if (value >= 1000000000) {
      return `${(value / 1000000000).toFixed(1)}B`; // Convert to billions and keep 1 decimal
    } else if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`; // Convert to millions and keep 1 decimal
    }
    return value.toString(); // Return as is for smaller values
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
          Volume
        </Typography>
        {data.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <ComposedChart data={data}>
              {/* <CartesianGrid strokeDasharray="3 3" /> */}
              <XAxis
                dataKey="date"
                tickFormatter={formatXAxisDate}
                interval={Math.floor(data.length / 4)}
              />
              <YAxis tickFormatter={formatYAxisNumber} />
              <Tooltip />
              <Legend />
              {/* Volume as Bar */}
              <Bar
                dataKey="volume"
                fill="#dc4c03"
                barSize={8} // Adjust the width of the bars
                name="Volume"
              />
              {/* 20 Day Volume as Line */}
              <Line
                type="monotone"
                dataKey="20day_volume"
                stroke="#2e006c"
                strokeWidth={2}
                dot={false}
                name="20 Day Volume"
              />
            </ComposedChart>
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

export default VolumeChart;
