import React, { useEffect, useState } from 'react';
import { Container, Card, CardContent, Typography, CircularProgress, Box } from '@mui/material';
import FOSectionsMain from './FOWriteUpHooks/FOSectionsMain';
import FOWriteUpDashboardMain from './FOWriteUpDashboardMain';

interface ApiResponse {
  ticker: string;
  deal_id: string;
}

const FOWriteUpMain: React.FC = () => {
  const [data, setData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const selectedFilters = {
    sector: "Tech",
    region: "US",
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        const apiUrl = process.env.REACT_APP_API_URL;
        const token = localStorage.getItem("access_token");

        if (!apiUrl) {
          throw new Error("API URL is not defined in environment variables");
        }

        const response = await fetch(`${apiUrl}/api/fo_writeup_data/`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": token ? `Bearer ${token}` : "",
          },
          body: JSON.stringify(selectedFilters),
        });

        if (!response.ok) {
          throw new Error(`API error: ${response.statusText}`);
        }

        const result: ApiResponse = await response.json();
        setData(result);
      } catch (err: any) {
        setError(err.message || "Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <Box>
       <Typography
        variant="body2"
        sx={{
          fontWeight: 500,  
          color: "#FFFFFF",
          fontSize: { xs: "1rem", sm: "1.2rem" },
          backgroundColor: "#002060",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "4vh",
          padding: "8px 16px",
          borderRadius: "8px",
          textAlign: "center",
          marginBottom: "40px",
          boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
          animation: "fadeIn 1.5s ease-in-out",
          "@keyframes fadeIn": {
            "0%": { opacity: 0 },
            "100%": { opacity: 1 },
          },
        }}
      >
        Welcome to detailed Insights on Follow-On (FO) Write-Ups!
      </Typography>
    <Container maxWidth="xl" sx={{ mt: 2 }}>
      <Card sx={{ borderRadius: 3, boxShadow: 3 }}>
        <CardContent>
         <FOWriteUpDashboardMain />

          {/* Loading State */}
          {loading && (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
              <CircularProgress />
            </Box>
          )}

          {/* Error State */}
          {error && (
            <Typography variant="body1" color="error" align="center">
              {error}
            </Typography>
          )}

          {/* Data Loaded */}
          {!loading && !error && data && (
            <FOSectionsMain ticker={data.ticker} deal_id={data.deal_id} />
          )}
        </CardContent>
      </Card>
    </Container>
    </Box>
  );
};

export default FOWriteUpMain;
