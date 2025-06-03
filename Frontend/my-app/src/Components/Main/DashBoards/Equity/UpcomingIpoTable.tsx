import React, { useEffect, useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Box,
  Container,
} from '@mui/material';

// Step 1: Define the type
interface IpoData {
  ticker: string;
  company_name: string;
  expected_date: string;
  price: string | number | null;
  exchange: string;
  offer_amount: number | null;
}

const UpcomingIpoTable: React.FC = () => {
  const [ipoData, setIpoData] = useState<IpoData[]>([]);
  const apiUrl = process.env.REACT_APP_API_URL;
  const token = localStorage.getItem('access_token');

  useEffect(() => {
    const fetchIpoData = async () => {
      try {
        const response = await fetch(`${apiUrl}/api/ipo_dashboard_data/`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: token ? `Bearer ${token}` : '',
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch IPO data');
        }

        const data: IpoData[] = await response.json();

        // Step 2: Filter duplicates
        const uniqueRows = Array.from(
          new Map(data.map((item) => [`${item.ticker}_${item.expected_date}`, item])).values()
        );

        setIpoData(uniqueRows);
      } catch (error) {
        console.error('Error fetching IPO data:', error);
      }
    };

    fetchIpoData();
  }, [apiUrl, token]);


const formatNumber = (value: number): string => {
  const absValue = Math.abs(value);
  let formattedValue: string;

  if (absValue >= 1e9) {
    formattedValue = `$${(absValue / 1e9).toFixed(1)}B`; // Billion
  } else if (absValue >= 1e6) {
    formattedValue = `$${(absValue / 1e6).toFixed(1)}M`; // Million
  } else if (absValue >= 1e3) {
    formattedValue = `$${(absValue / 1e3).toFixed(1)}K`; // Thousand
  } else {
    formattedValue = `$${absValue.toFixed(2)}`; // Small value with cents
  }

  return value < 0 ? `-${formattedValue}` : formattedValue;
};


  return (
    <Container maxWidth="lg" sx={{ marginTop: '20px', marginBottom: '20px', marginLeft: '0' }}>
      <Box sx={{ padding: '20px', backgroundColor: '#fff4f4' }}>
        <Typography
          variant="h5"
          gutterBottom
          sx={{
            color: '#054511',
            fontWeight: 'bold',
            textAlign: 'center',
            paddingBottom: '10px',
          }}
        >
          Upcoming IPOs of June 2025
        </Typography>
        <TableContainer component={Paper} sx={{ width: '100%' }}>
          <Table aria-label="upcoming IPOs">
            <TableHead>
              <TableRow sx={{ backgroundColor: '#002060' }}>
                {['Ticker', 'Company Name', 'Expected Date', 'Price', 'Exchange', 'Offer Amount'].map(
                  (heading) => (
                    <TableCell
                      key={heading}
                      sx={{
                        fontSize: '0.9rem',
                        padding: '8px',
                        color: 'white',
                        border: '1px solid #ddd',
                      }}
                    >
                      {heading}
                    </TableCell>
                  )
                )}
              </TableRow>
            </TableHead>
            <TableBody>
              {ipoData.map((row, index) => (
                <TableRow hover key={index}>
                  <TableCell sx={{ fontSize: '0.85rem', padding: '8px', border: '1px solid #ddd' }}>
                    {row.ticker}
                  </TableCell>
                  <TableCell sx={{ fontSize: '0.85rem', padding: '8px', border: '1px solid #ddd' }}>
                    {row.company_name}
                  </TableCell>
                  <TableCell sx={{ fontSize: '0.85rem', padding: '8px', border: '1px solid #ddd' }}>
                    {row.expected_date}
                  </TableCell>
                  <TableCell sx={{ fontSize: '0.85rem', padding: '8px', border: '1px solid #ddd' }}>
                    {row.price !== null ? `$${row.price}` : '-'}
                  </TableCell>

                  <TableCell sx={{ fontSize: '0.85rem', padding: '8px', border: '1px solid #ddd' }}>
                    {row.exchange}
                  </TableCell>
            <TableCell sx={{ fontSize: '0.85rem', padding: '8px', border: '1px solid #ddd' }}>
  {row.offer_amount !== null ? formatNumber(row.offer_amount) : '-'}
</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </Container>
  );
};

export default UpcomingIpoTable;
