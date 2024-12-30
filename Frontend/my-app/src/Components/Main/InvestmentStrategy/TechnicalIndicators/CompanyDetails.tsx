import React, { useState, useEffect } from 'react';
import { Typography, Card, CardContent, Box } from '@mui/material';
import axios from 'axios';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

// Define types for the company details and RSI data
interface CompanyDetailsResponse {
  description: string;
  exchange: string;
  security_code: string;
}

interface RsiData {
  date: string; // Assuming date is in "YYYY-MM-DD" format
  value: number;
}

interface CompanyDetailsProps {
  ticker: string;
}

const CompanyDetails: React.FC<CompanyDetailsProps> = ({ ticker }) => {
  const [companyData, setCompanyData] = useState<CompanyDetailsResponse | null>(null);
  const [rsiData, setRsiData] = useState<RsiData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCompanyData = async () => {
      const apiUrl = process.env.REACT_APP_API_URL;
      if (!apiUrl) {
        throw new Error("API URL is not defined in environment variables.");
      }

      const payload = { ticker };

      try {
        // Fetch company details
        const companyResponse = await axios.post<CompanyDetailsResponse>(
          `${apiUrl}/api/stockbasicdata/`,
          payload,
          {
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );
        setCompanyData(companyResponse.data);

        // Fetch RSI data
        const rsiResponse = await axios.post<{ rsi: RsiData[] }>(
          `${apiUrl}/api/rsi/`,
          payload,
          {
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );
        setRsiData(rsiResponse.data.rsi);

      } catch (err) {
        setError("Failed to fetch the company details or RSI data.");
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };

    if (ticker) {
      fetchCompanyData();
    }
  }, [ticker]);

  // Helper function to format date for the RSI chart
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
  };

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '30vh',maxWidth:'150vh' ,padding: 2 }}>
      <Card sx={{ maxWidth: 800, width: '100%', padding: 2, boxShadow: 3 }}>
        <CardContent>
          <Typography variant="h5" sx={{ fontWeight: 'bold', marginBottom: 2 }}>
            About {ticker}
          </Typography>

          {/* Display company description and other details */}
          {companyData ? (
            <>
              <Typography variant="body1" sx={{ marginBottom: 1 }}>
                {companyData.description || 'No description available.'}
              </Typography>
              
            </>
          ) : (
            <Typography variant="body1">No company details available.</Typography>
          )}

          
        </CardContent>
      </Card>
    </Box>
  );
};

export default CompanyDetails;
