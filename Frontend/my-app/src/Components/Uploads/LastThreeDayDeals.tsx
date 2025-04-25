import React, { useEffect, useState } from 'react';
import { Container, Typography, Box, Card, CardContent, Grid } from '@mui/material';
import axios from 'axios';

interface Deal {
  date: string;
  count: number;
  tickers: string[];
}

const LastThreeDayDeals: React.FC = () => {
  const [deals, setDeals] = useState<Deal[]>([]);

  useEffect(() => {
    const fetchDeals = async () => {
      const apiUrl = process.env.REACT_APP_API_URL;  // Ensure that this environment variable is set properly
      const token = localStorage.getItem("access_token");

      if (!token) {
        alert("Access token not found. Please log in.");
        return;
      }

      try {
        const response = await axios.get<Deal[]>(`${apiUrl}/api/prev_day_data/`, {
          headers: {
            "Authorization": `Bearer ${token}`,
          },
        });
        setDeals(response.data);
      } catch (error) {
        console.error("Error fetching deals:", error);
      }
    };

    fetchDeals();
  }, []);

  return (
    
    <Container>
 
      <Typography variant="h5" gutterBottom align="center" color="primary">
        Last 3 Day Deals from New Deal Form
      </Typography>
      {deals.map((deal) => (
        <Card sx={{ mb: 2 }} key={deal.date}>
          <CardContent>
            <Typography variant="h6" color="textSecondary">
              {deal.date}
            </Typography>
            <Typography variant="body1" color="textSecondary">
              Count: {deal.count}
            </Typography>
            {deal.count > 0 && (
              <Box>
                <Typography variant="body2" color="textSecondary">
                  Tickers:
                </Typography>
                <Grid container spacing={1}>
                  {deal.tickers.map((ticker: string, index: number) => (
                    <Grid item key={index}>
                      <Typography variant="body2">{ticker}</Typography>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            )}
          </CardContent>
        </Card>
      ))}
    </Container>
  );
};

export default LastThreeDayDeals;
