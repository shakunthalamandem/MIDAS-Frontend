import React, { useEffect, useState } from 'react';
import { Card, CardContent, Typography, Grid, Box, Divider, CircularProgress } from '@mui/material';
import { Skeleton } from '@mui/material';

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
        const response = await fetch(`${apiUrl}/api/fundamentals/CIVI`);
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
    <Grid item xs={12} sm={6} md={3} key={title}>
      <Box padding={2} borderRadius={2} boxShadow={2} bgcolor="#f5f5f5" height="100%">
        <Typography variant="h6" gutterBottom color="primary" fontWeight="bold">
          {title}
        </Typography>
        <Divider sx={{ marginBottom: 2 }} />
        {Object.entries(sectionData).map(([key, value]) => (
          <Typography key={key} variant="body2" color="textSecondary" gutterBottom>
            <strong>{key}:</strong> {value !== null ? value : "Not available"}
          </Typography>
        ))}
      </Box>
    </Grid>
  );

  if (loading) {
    return (
      <Box sx={{ padding: 2 }}>
        <Skeleton variant="rectangular" width="100%" height={140} />
        <Skeleton width="60%" />
        <Skeleton width="80%" />
        <Skeleton width="40%" />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ padding: 2 }}>
        <Typography color="error" variant="body1" align="center">
          {error}
        </Typography>
      </Box>
    );
  }

  return (
    <Card elevation={3} sx={{ maxWidth: '100%', marginTop: 2 }}>
      <CardContent>
        <Grid container spacing={3} justifyContent="flex-start">
          {data &&
            Object.entries(data).map(([section, values]) => renderSection(section, values))}
        </Grid>
      </CardContent>
    </Card>
  );
};

export default FundamentalMetricsCard;
