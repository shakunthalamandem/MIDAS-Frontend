import React, { useEffect, useState } from 'react';
import {
  Box,
  Card,
  CardActionArea,
  CardContent,
  Typography,
  Grid,
  CircularProgress,
} from '@mui/material';

interface WriteUpReport {
  id: number;
  ticker: string;
  company_name: string;
  trade_date: string | null;
  exchange_name: string;
  deal_type: string | null;
  region: string;
  sector: string | null;
  document_link: string;
  created_at: string;
  updated_at: string;
}

const WriteUpdashboardMain: React.FC = () => {
  const [data, setData] = useState<WriteUpReport[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Replace with your actual API URL or environment variable
  const apiUrl = process.env.REACT_APP_API_URL || 'https://your-api-url.com';
  const token = localStorage.getItem('authToken') || '';

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await fetch(`${apiUrl}/api/write_up_reports/`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: token ? `Bearer ${token}` : '',
          },
        });
        const responseData = await response.json();
        console.log('API response:', responseData);

        // Adjust here depending on your API response structure:
        // if the API returns an array directly:
        if (Array.isArray(responseData)) {
          setData(responseData);
        }
        // if the API returns { data: [...] }:
        else if (Array.isArray(responseData.data)) {
          setData(responseData.data);
        } else {
          setData([]);
          console.warn('Unexpected response data format');
        }
      } catch (error) {
        console.error('Failed to fetch data:', error);
        setData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [apiUrl, token]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box padding={4}>
      <Typography variant="h4" mb={3}>
        Write Up Reports
      </Typography>

      {data.length === 0 ? (
        <Typography>No reports to show.</Typography>
      ) : (
        <Grid container spacing={3}>
          {data.map((report) => (
            <Grid item xs={12} sm={6} md={4} key={report.id}>
              <Card sx={{ border: '1px solid #ccc' }}>
                <CardActionArea onClick={() => window.open(report.document_link, '_blank')}>
                  <CardContent>
                    <Typography variant="h6" fontWeight="bold">
                      {report.company_name} ({report.ticker} | {report.exchange_name})
                    </Typography>
                    <Typography variant="body2" color="text.secondary" mt={1}>
                      Deal Type: {report.deal_type || 'N/A'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Trade Date: {report.trade_date || 'N/A'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Region: {report.region}
                    </Typography>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
};

export default WriteUpdashboardMain;
