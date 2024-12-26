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
interface RsiData {
  date: string; // Assuming date is in "YYYY-MM-DD" format
  value: number;
}

interface RsiMainProps {
  ticker: string;
}

const RsiMain: React.FC<RsiMainProps> = ({ ticker }) => {
  const [data, setData] = useState<RsiData[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const apiUrl = process.env.REACT_APP_API_URL;
      if (!apiUrl) {
        throw new Error("API URL is not defined in environment variables");
      }

      const payload = { ticker };

      try {
        const response = await fetch(`${apiUrl}/api/rsi/`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          throw new Error("Failed to fetch data");
        }

        const jsonData = await response.json();
        setData(jsonData.rsi); // Assuming `rsi` array from response
      } catch (error) {
        console.error("Error fetching data:", error);
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
    margin: "auto",
    mt: 4,
    p: 2,
    boxShadow: 3, // Adds shadow to the card
  }}
  elevation={4} // Additional shadow customization
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
          RSI
        </Typography>
        {data.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data}>
              <XAxis
                dataKey="date"
                tickFormatter={formatDate} // Format date for X-axis
                interval={Math.floor(data.length / 4)} // Show 4-month intervals
              />
              <YAxis />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="value"
                stroke="#8884d8"
                strokeWidth={1} // Tiny line
                dot={false} // No dots
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

export default RsiMain;
