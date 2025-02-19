import React from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography, Paper, Container } from '@mui/material';

interface AllocExpected {
  shares: number;
  deal_percentage: number;
  fill_percentage: number;
  amount_usd: number;
}

interface MonasheeDealActivity {
  conviction: string;
  monashee_wallcrossing_size_shares: number;
  monashee_wallcrossing_discount_percent: number;
  wallcrossing_invitation_bank: string;
  monashee_reverse_size_shares: number;
  monashee_reverse_discount_percent: number;
  alloc_expected: AllocExpected;
}

interface DealActivityProps {
  data: MonasheeDealActivity;
}

const DealActivity: React.FC<DealActivityProps> = ({ data }) => {
  return (
    <Container sx={{mt:2,mb:2}}>

     <Typography variant="h6" color='#aa1e13' style={{ textAlign: 'center',marginBottom:2}}>


        Monashee Deal Activity
      </Typography>

      <TableContainer
  component={Paper}
  sx={{
    height: '400px',
    overflowY: 'auto',
    '&::-webkit-scrollbar': {
      width: '6px',
    },
    '&::-webkit-scrollbar-thumb': {
      backgroundColor: '#aaa',
      borderRadius: '10px',
    },
    '&::-webkit-scrollbar-thumb:hover': {
      backgroundColor: '#888',
    },
    '&::-webkit-scrollbar-track': {
      backgroundColor: '#f0f0f0',
      borderRadius: '10px',
    },
  }}
>        <Table size="small" aria-label="monashee deal activity table">
          <TableHead>
            <TableRow>
              <TableCell sx={{color:'#002060'}}><strong>Key</strong></TableCell>
              <TableCell sx={{color:'#002060'}}><strong>Value</strong></TableCell>

            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              <TableCell><strong>Conviction</strong></TableCell>
              <TableCell sx={{bgcolor:"#00FFFF"}}>{data.conviction}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell><strong>Wallcrossing Size (Shares)</strong></TableCell>
              <TableCell>{data.monashee_wallcrossing_size_shares.toLocaleString()}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell><strong>Wallcrossing Discount (%)</strong></TableCell>
              <TableCell>{data.monashee_wallcrossing_discount_percent}%</TableCell>
            </TableRow>
            <TableRow>
              <TableCell><strong>Invitation Bank</strong></TableCell>
              <TableCell>{data.wallcrossing_invitation_bank}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell><strong>Reverse Size (Shares)</strong></TableCell>
              <TableCell>{data.monashee_reverse_size_shares.toLocaleString()}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell><strong>Reverse Discount (%)</strong></TableCell>
              <TableCell>{data.monashee_reverse_discount_percent}%</TableCell>
            </TableRow>
            <TableRow>
              <TableCell><strong>Alloc Expected - Shares</strong></TableCell>
              <TableCell>{data.alloc_expected.shares.toLocaleString()}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell><strong>Alloc Expected - Deal Percentage</strong></TableCell>
              <TableCell>{data.alloc_expected.deal_percentage}%</TableCell>
            </TableRow>
            <TableRow>
              <TableCell><strong>Alloc Expected - Fill Percentage</strong></TableCell>
              <TableCell>{data.alloc_expected.fill_percentage}%</TableCell>
            </TableRow>
            <TableRow>
              <TableCell><strong>Alloc Expected - Amount (USD)</strong></TableCell>
              <TableCell>${data.alloc_expected.amount_usd.toFixed(2)}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
};

export default DealActivity;
