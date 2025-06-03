import React from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Typography, Box, Container } from '@mui/material';
import { ContactEmergency } from '@mui/icons-material';

const UpcomingIpoTable = () => {
  const rows = [
    {
      symbol: 'VNTG',
      companyName: 'Vantage Corp (Singapore)',
      ipoDate: '10-06-2025',
      price: '$4.0-5.0',
      exchange: 'NYSE MKT',
      offerAmount: '$18.69M',
    },
    {
      symbol: 'OMDA',
      companyName: 'Omada Health, Inc.',
      ipoDate: '06-06-2025',
      price: '$18.0-20.0',
      exchange: 'NASDAQ Global',
      offerAmount: '$181.70M',
    },
    {
      symbol: 'CRCL',
      companyName: 'Circle Internet Group, Inc.',
      ipoDate: '05-06-2025',
      price: '$24.0-26.0',
      exchange: 'NYSE',
      offerAmount: '$717.60M',
    },
    {
      symbol: 'AIRO',
      companyName: 'Airo Group Holdings Inc',
      ipoDate: '05-06-2025',
      price: '$14.0-16.0',
      exchange: 'NASDAQ',
      offerAmount: '$80M',
    },
    {
      symbol: '2573 HK',
      companyName: 'Newtrend Group Holding Co',
      ipoDate: '10-06-2025',
      price: '-',
      exchange: 'HKEX',
      offerAmount: '-',
    },
  ];

  return (
    <Container maxWidth="lg" sx={{ marginTop: '20px', marginBottom: '20px' ,marginLeft: '0', }}>
      <Box sx={{  padding: '20px', backgroundColor: '#fff4f4' }}>
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
                <TableCell sx={{ fontSize: '0.9rem', padding: '8px', color: 'white', border: '1px solid #ddd' }}>
                  Ticker
                </TableCell>
                <TableCell sx={{ fontSize: '0.9rem', padding: '8px', color: 'white', border: '1px solid #ddd' }}>
                  Company Name
                </TableCell>
                <TableCell sx={{ fontSize: '0.9rem', padding: '8px', color: 'white', border: '1px solid #ddd' }}>
                  Expected Date
                </TableCell>
                <TableCell sx={{ fontSize: '0.9rem', padding: '8px', color: 'white', border: '1px solid #ddd' }}>
                  Price
                </TableCell>
                <TableCell sx={{ fontSize: '0.9rem', padding: '8px', color: 'white', border: '1px solid #ddd' }}>
                  Exchange
                </TableCell>
                <TableCell sx={{ fontSize: '0.9rem', padding: '8px', color: 'white', border: '1px solid #ddd' }}>
                  Offer Amount
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((row, index) => (
                <TableRow hover key={index}>
                  <TableCell sx={{ fontSize: '0.85rem', padding: '8px', border: '1px solid #ddd' }}>
                    {row.symbol}
                  </TableCell>
                  <TableCell sx={{ fontSize: '0.85rem', padding: '8px', border: '1px solid #ddd' }}>
                    {row.companyName}
                  </TableCell>
                  <TableCell sx={{ fontSize: '0.85rem', padding: '8px', border: '1px solid #ddd' }}>
                    {row.ipoDate}
                  </TableCell>
                  <TableCell sx={{ fontSize: '0.85rem', padding: '8px', border: '1px solid #ddd' }}>
                    {row.price}
                  </TableCell>
                  <TableCell sx={{ fontSize: '0.85rem', padding: '8px', border: '1px solid #ddd' }}>
                    {row.exchange}
                  </TableCell>
                  <TableCell sx={{ fontSize: '0.85rem', padding: '8px', border: '1px solid #ddd' }}>
                    {row.offerAmount}
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
