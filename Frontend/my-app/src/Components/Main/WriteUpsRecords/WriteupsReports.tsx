import React, { useEffect, useState } from 'react';
import {
  Box,
  Card,
  CardActionArea,
  CardContent,
  Typography,
  Grid,
  CircularProgress,
  Container,
} from '@mui/material';
// import CryptoReportCardVideo from '../../../Assets/videos/CryptoReportCard.mp4';
import bgimage from '../../../Assets/images/bgimage.jpg'


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

const WriteupsReports: React.FC = () => {
  const [data, setData] = useState<WriteUpReport[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const apiUrl = process.env.REACT_APP_API_URL;
  const token = localStorage.getItem("access_token");

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

        if (Array.isArray(responseData)) {
          setData(responseData);
        } else if (Array.isArray(responseData.data)) {
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
     <Container>
          <Box padding={2}>
            <Typography
              variant="h6"
              mb={3}
              color="#002060"
              fontWeight="bold"
              align="center"
            >
              Write Up Reports
            </Typography>
    
        {data.length === 0 ? (
          <Typography>No reports to show.</Typography>
            ) : (
              <Grid container spacing={3}>
                {data.map((report) => (
                  <Grid item xs={12} sm={6} md={4} key={report.id}>
                    <Card
                      sx={{
                        height: "250px",
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "space-between",
                        color: "#fff",
                        position: "relative",
                        overflow: "hidden",
                        padding: 2,
                        marginBottom: "16px",
                        boxShadow: "0 4px 8px 0 #C6F5E4, 0 6px 20px 0 #C6F5E4",
                      }}
                    >
    
                      <img
                        src={bgimage}
                        style={{
                          position: "absolute",
                          top: 0,
                          left: 0,
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                          zIndex: 0, // Ensures the image is behind the content
                        }}
                      />
    
                      <CardActionArea
                        onClick={() => window.open(report.document_link, "_blank")}
                        sx={{ position: "relative", zIndex: 1 }}
                      >
                        <CardContent>
                      <Typography variant="body1" fontWeight="bold" marginBottom={1}>
                        {report.company_name} ({report.ticker} | {report.exchange_name})
                          </Typography>
                         <Typography variant="body2">
  Trade Date: {report.trade_date ? new Date(report.trade_date).getFullYear() : 'N/A'}
</Typography>

                          <Typography variant="body2" mt={1} color="#fff">
                            Click to view analysis
                          </Typography>
                        </CardContent>
                      </CardActionArea>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            )}
          </Box>
        </Container>
  );
};

export default WriteupsReports;
