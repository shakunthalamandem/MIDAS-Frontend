import React from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Typography } from '@mui/material';

const UpcomingIpoTable = () => {
  const rows = [
    {
      symbol: 'AAPL',
      companyName: 'Apple Inc.',
      exchange: 'NASDAQ',
      price: '$145.00',
      shares: '100M',
      ipoDate: '2025-07-15',
      offerAmount: '$14.5B',
    },
    {
      symbol: 'GOOG',
      companyName: 'Alphabet Inc.',
      exchange: 'NASDAQ',
      price: '$2,800.00',
      shares: '50M',
      ipoDate: '2025-08-01',
      offerAmount: '$140B',
    },
    {
      symbol: 'AMZN',
      companyName: 'Amazon.com, Inc.',
      exchange: 'NASDAQ',
      price: '$3,300.00',
      shares: '75M',
      ipoDate: '2025-08-20',
      offerAmount: '$247.5B',
    },
    {
      symbol: 'TSLA',
      companyName: 'Tesla Inc.',
      exchange: 'NASDAQ',
      price: '$700.00',
      shares: '80M',
      ipoDate: '2025-09-05',
      offerAmount: '$56B',
    },
    {
      symbol: 'MSFT',
      companyName: 'Microsoft Corporation',
      exchange: 'NASDAQ',
      price: '$280.00',
      shares: '60M',
      ipoDate: '2025-09-25',
      offerAmount: '$16.8B',
    },
  ];

  return (
    <div style={{ paddingLeft: '20px', paddingTop: '20px' }}>
      <Typography variant="h5" gutterBottom sx={{ color: '#054511', fontWeight: 'bold', textAlign: 'center' }}>
        Upcoming IPOs of 2025
      </Typography>
      <TableContainer component={Paper} sx={{ width: '80%' }}>
        <Table aria-label="upcoming IPOs">
          <TableHead>
            <TableRow sx={{ backgroundColor: '#002060' }}>
              <TableCell sx={{ fontSize: '0.9rem', padding: '8px', color: 'white', border: '1px solid #ddd' }}>Symbol</TableCell>
              <TableCell sx={{ fontSize: '0.9rem', padding: '8px', color: 'white', border: '1px solid #ddd' }}>Company Name</TableCell>
              <TableCell sx={{ fontSize: '0.9rem', padding: '8px', color: 'white', border: '1px solid #ddd' }}>Exchange/ Market</TableCell>
              <TableCell sx={{ fontSize: '0.9rem', padding: '8px', color: 'white', border: '1px solid #ddd' }}>Price</TableCell>
              {/* <TableCell sx={{ fontSize: '0.9rem', padding: '8px', color: 'white', border: '1px solid #ddd' }}>Shares</TableCell> */}
              <TableCell sx={{ fontSize: '0.9rem', padding: '8px', color: 'white', border: '1px solid #ddd' }}>Expected IPO Date</TableCell>
              <TableCell sx={{ fontSize: '0.9rem', padding: '8px', color: 'white', border: '1px solid #ddd' }}>Offer Amount</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row, index) => (
              <TableRow hover key={index}>
                <TableCell sx={{ fontSize: '0.85rem', padding: '8px', border: '1px solid #ddd' }}>{row.symbol}</TableCell>
                <TableCell sx={{ fontSize: '0.85rem', padding: '8px', border: '1px solid #ddd' }}>{row.companyName}</TableCell>
                <TableCell sx={{ fontSize: '0.85rem', padding: '8px', border: '1px solid #ddd' }}>{row.exchange}</TableCell>
                <TableCell sx={{ fontSize: '0.85rem', padding: '8px', border: '1px solid #ddd' }}>{row.price}</TableCell>
                {/* <TableCell sx={{ fontSize: '0.85rem', padding: '8px', border: '1px solid #ddd' }}>{row.shares}</TableCell> */}
                <TableCell sx={{ fontSize: '0.85rem', padding: '8px', border: '1px solid #ddd' }}>{row.ipoDate}</TableCell>
                <TableCell sx={{ fontSize: '0.85rem', padding: '8px', border: '1px solid #ddd' }}>{row.offerAmount}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
};

export default UpcomingIpoTable;
