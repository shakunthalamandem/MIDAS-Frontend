import React, { useEffect, useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Grid,
  Box,
  Divider,
  Skeleton,
  Alert,
} from '@mui/material';

interface Props {
  ticker: string;
}

const FundamentalMetricsCard: React.FC<Props> = ({ ticker }) => {
  const [data, setData] = useState<Record<string, Record<string, string>> | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const apiUrl = process.env.REACT_APP_API_URL;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${apiUrl}/api/fundamentals/${ticker}`);
        if (!response.ok) {
          throw new Error('Failed to fetch data');
        }
        const result = await response.json();
        setData(result);
      } catch (err) {
        setError('Failed to load data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [ticker]);

  const renderSection = (title: string, sectionData: Record<string, string>) => (
    <Grid item xs={12} sm={6} md={4} lg={3} key={title}>
      <Box
        sx={{
          padding: 2,
          borderRadius: 2,
          boxShadow: 3,
          bgcolor: '#e5f0ee',
          height: '90%',
          
        }}
      >
        <Typography variant="subtitle1" color="#58002f" gutterBottom fontWeight="bold">
          {title}
        </Typography>
        <Divider sx={{ marginBottom: 2 }} />
        {Object.entries(sectionData).map(([key, value]) => (
          <Typography
            key={key}
            variant="body2"
            color="text.secondary"
            gutterBottom
          >
            <strong>{key}:</strong> {value ?? 'Not available'}
          </Typography>
        ))}
      </Box>
    </Grid>
  );

  if (loading) {
    return (
      <Grid container spacing={3} sx={{ padding: 2 }}>
        {[...Array(4)].map((_, index) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
            <Skeleton variant="rectangular" height={150} />
            <Skeleton width="60%" sx={{ marginTop: 1 }} />
            <Skeleton width="80%" />
            <Skeleton width="40%" />
          </Grid>
        ))}
      </Grid>
    );
  }

  if (error) {
    return (
      <Box sx={{ padding: 2 }}>
        <Alert severity="error" variant="outlined">
          {error}
        </Alert>
      </Box>
    );
  }

  return (
    <Card
      elevation={3}
      sx={{
        maxWidth: '100%',
        marginTop: 2,
        borderRadius: 3,
        boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.2)',
        bgcolor:'#fdf7ff'
      }}
    >
      <CardContent>
        <Typography
          variant="h5"
          align="center"
          sx={{ marginBottom: 3,  fontWeight: 'bold' }}
        >
          <span style={{ color: '#002060'}}>Fundamental Metrics for</span> <span style={{color:'#006e18'}}>{ticker}</span>
        </Typography>
        <Grid container spacing={3}>
          {data &&
            Object.entries(data).map(([section, values]) =>
              renderSection(section, values)
            )}
        </Grid>
      </CardContent>
    </Card>
  );
};

export default FundamentalMetricsCard;
