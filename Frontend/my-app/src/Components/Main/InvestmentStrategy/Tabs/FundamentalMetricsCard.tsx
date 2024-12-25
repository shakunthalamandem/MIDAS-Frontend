import React, { useEffect, useState } from 'react';
import { Card, CardContent, Typography, Grid, CircularProgress } from '@mui/material';

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
    <Grid item xs={3}>
      <Typography variant="h6" gutterBottom>
        {title}
      </Typography>
      {Object.entries(sectionData).map(([key, value]) => (
        <Typography key={key} variant="body2">
          {key}: {value}
        </Typography>
      ))}
    </Grid>
  );

  if (loading) return <CircularProgress />;
  if (error) return <Typography color="error">{error}</Typography>;

  return (
    <Card>
      <CardContent>
        <Grid container spacing={3}>
          {data && Object.entries(data).map(([section, values]) =>
            renderSection(section, values)
          )}
        </Grid>
      </CardContent>
    </Card>
  );
};

export default FundamentalMetricsCard;
