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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Paper
} from '@mui/material';

interface Props {
  ticker: string;
}

const FundamentalMetricsCard: React.FC<Props> = ({ ticker }) => {
  const [data, setData] = useState<Record<string, Record<string, string>> | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const apiUrl = process.env.REACT_APP_API_URL;
const token = localStorage.getItem("access_token");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${apiUrl}/api/fundamentals/${ticker}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": token ? `Bearer ${token}` : "",
          }});
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
  }, [apiUrl, ticker]);

  const renderSection = (title: string, sectionData: Record<string, string>) => (
    <Grid item xs={12} sm={6} md={6} lg={6} key={title}>
      <Box
        sx={{
          padding: 2,
          borderRadius: 2,
          boxShadow: 3,
          bgcolor: '#e5f0ee',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
        }}
      >
        <Typography
  variant="subtitle1"
  color="#58002f"
  gutterBottom
  fontWeight="bold"
  sx={{ textAlign: 'center' }} // This will center the text
>
  {title}
</Typography>

        <Divider sx={{ marginBottom: 2 }} />
        <TableContainer component={Paper} sx={{ width: '100%', margin: 'auto' }}>
  <Table size="small" sx={{ width: '100%' }}>
    <TableBody>
      {Object.entries(sectionData).map(([key, value], index) => (
        <TableRow
          key={key}
          sx={{
            backgroundColor: index % 2 === 0 ? "#f3f3f3" : "#ffffff", // Alternating row colors
            "&:hover": {

              backgroundColor: "#e0f7fa", // Highlight on hover
            },
          }}
        >
          <TableCell
            sx={{
              fontWeight: 'bold',
              color: '#333',
              border: '1px solid #ccc',
              textAlign: 'left',
              padding: '8px 16px',
              whiteSpace: 'nowrap', 
            }}
          >
            {key}
          </TableCell>
          <TableCell
            sx={{
              border: '1px solid #ccc',
              textAlign: 'left',
              padding: '8px 16px',
            }}
          >
            {/* Large number formatting */}
            {key === 'Market Cap' || key === 'Enterprise Value' || key === 'Revenue' ? (
              <span>
                {value && !isNaN(Number(value)) ? Number(value).toLocaleString() : 'Not available'}
              </span>
            ) : key.includes('Growth') || 
                 key.includes('Margin') || 
                 key === 'Dividend Yield (TTM)' || 
                 key === 'Enterprise Value / EBITA (TTM)' || 
                 key === 'Enterprise Value / Revenue (TTM)' || 
                 key === 'Price to Book (PB)(MRQ)' || 
                 key === 'Price to Earnings (PE)(TTM)' || 
                 key === 'Return on Equity (TTM)' || 
                 key === 'ROCE (TTM)' || 
                 key === 'Revenue to Total Assets (TTM)' ? (
              // Percentage formatting
              <span>
                {value && !isNaN(Number(value)) ? `${Number(value).toLocaleString()}%` : 'Not available'}
              </span>
            ) : (
              // Default fallback
              value ?? 'Not Available'
            )}
          </TableCell>
        </TableRow>
      ))}
    </TableBody>
  </Table>
</TableContainer>


      </Box>
    </Grid>
  );

  if (loading) {
    return (
      <Grid container spacing={3} sx={{ padding: 2 }}>
        {[...Array(4)].map((_, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
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
        width: '100%', // Ensure the card takes the full width
        marginTop: 2,
        borderRadius: 3,
        boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.2)',
        bgcolor: '#fdf7ff',
      }}
    >
      <CardContent>
        <Typography variant="h5" align="center" sx={{ marginBottom: 3, fontWeight: 'bold' }}>
          <span style={{ color: '#002060' }}>Fundamental Metrics for</span>{' '}
          <span style={{ color: '#006e18' }}>{ticker}</span>
        </Typography>

        {/* First row with two tables */}
        <Grid container spacing={3}>
          {data &&
            Object.entries(data).slice(0, 2).map(([section, values], index) =>
              renderSection(section, values)
            )}
        </Grid>

        {/* Second row with two tables */}
        <Grid container spacing={3} sx={{ marginTop: 3 }}>
          {data &&
            Object.entries(data).slice(2, 4).map(([section, values], index) =>
              renderSection(section, values)
            )}
        </Grid>
      </CardContent>
    </Card>
  );
};

export default FundamentalMetricsCard;
