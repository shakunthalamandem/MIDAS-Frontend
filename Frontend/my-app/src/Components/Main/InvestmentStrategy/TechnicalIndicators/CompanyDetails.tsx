import React, { useState, useEffect } from 'react';
import { Typography, Card, CardContent, Box } from '@mui/material';
import axios from 'axios';

// Define types for the company details and RSI data
interface CompanyDetailsResponse {
  asofdate: string;
  companies: {
    fs_name: string;
    security_code: string;
    fs_ticker: string;
    exchange: string;
    companyName: string;
    description: string;
  }[];
}

interface CompanyDetailsProps {
  ticker: string;
}

const CompanyDetails: React.FC<CompanyDetailsProps> = ({ ticker }) => {
  const [companyData, setCompanyData] = useState<CompanyDetailsResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCompanyData = async () => {
      const apiUrl = process.env.REACT_APP_API_URL;
      if (!apiUrl) {
        throw new Error('API URL is not defined in environment variables.');
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
      } catch (err) {
        setError('Failed to fetch the company details.');
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    };

    if (ticker) {
      fetchCompanyData();
    }
  }, [ticker]);



  // Access the first company from the companies array if available
  const company = companyData?.companies[0];

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '30vh', maxWidth: '150vh', padding: 2 }}>
      <Card sx={{ maxWidth: 800, width: '100%', padding: 2, boxShadow: 3 }}>
        <CardContent>
          <Typography variant="h5" sx={{ fontWeight: 'bold', marginBottom: 2 }}>
            About {ticker}
          </Typography>

          {/* Display company description and other details */}
          {company ? (
            <>
              <Typography variant="h6" sx={{ fontWeight: 'bold', marginBottom: 1 }}>
                {company.companyName}
              </Typography>
              <Typography variant="body1" sx={{ marginBottom: 1 }}>
                {company.description || 'No description available.'}
              </Typography>
              {/* <Typography variant="body2" sx={{ marginBottom: 1 }}>
                Exchange: {company.exchange}
              </Typography>
              <Typography variant="body2" sx={{ marginBottom: 1 }}>
                Security Code: {company.security_code}
              </Typography> */}
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
