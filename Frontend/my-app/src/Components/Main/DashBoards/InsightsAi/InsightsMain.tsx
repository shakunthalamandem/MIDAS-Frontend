import React, { useEffect, useState } from 'react';
import { Typography, Card, CardContent, Box } from '@mui/material';

type InsightItem = {
  card_id?: string | number;
  title: string;
  description: string;
};

const InsightsMain = () => {
  const [data, setData] = useState<InsightItem[]>([]);

  // Fetch data from the API
  useEffect(() => {
    const fetchData = async () => {
      const apiUrl = process.env.REACT_APP_API_URL;
      const token = localStorage.getItem('access_token');

      try {
        const response = await fetch(`${apiUrl}/api/ai_insights_data/`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: token ? `Bearer ${token}` : '',
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch data');
        }

        const result = await response.json();
        setData(result);
      } catch (error) {
        console.error('Error fetching AI Insights data:', error);
      }
    };

    fetchData();
  }, []);

  // Inject rainbow animation once
  useEffect(() => {
    const style = document.createElement('style');
    style.innerHTML = `
      @keyframes rainbowBorder {
        0% { border-color: red; }
        14% { border-color: orange; }
        28% { border-color: yellow; }
        42% { border-color: green; }
        57% { border-color: blue; }
        71% { border-color: indigo; }
        85% { border-color: violet; }
        100% { border-color: black; }
      }
    `;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  return (
    <>
      <Typography
        color="#1300fc"
        align="center"
        variant="h6"
        fontWeight="bold"
        sx={{ mb: 2.5, mt: 2.5 }}
      >
        AI Insights
      </Typography>

      {data.map((item, index) => (
        <Box key={item.card_id || index} sx={{ p: 1, borderRadius: 1 }}>
          <Card
            elevation={4}
            sx={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              padding: '1px',
              border: '2px solid red',
              animation: `rainbowBorder 4s linear infinite`,
              animationDelay: `${index * 0.3}s`,
            }}
          >
            <CardContent sx={{ height: '100%' }}>
              <Typography variant="body1" color="#fc0004" fontWeight="bold">
                {item.title}
              </Typography>
              <Typography variant="body2" color="#002060" sx={{ mt: 1, whiteSpace: 'pre-line' }}>
                {item.description}
              </Typography>
            </CardContent>
          </Card>
        </Box>
      ))}
    </>
  );
};

export default InsightsMain;
