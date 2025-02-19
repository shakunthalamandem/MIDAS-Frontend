import React from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography, Paper, Container } from '@mui/material';

interface AfterMarketAnalysisData {
  safety_and_liquidity_check_max_size: string;
  shares_left_to_go_to_expected_allocation: number;
  current_price: string;
  percent_change_from_offer: string;
}

interface AfterMarketAnalysisProps {
  data: AfterMarketAnalysisData;
}

const AfterMarketAnalysis: React.FC<AfterMarketAnalysisProps> = ({ data }) => {
  return (
    <Container sx={{mt:2,mb:2}}>

     <Typography variant="h6" color='#aa1e13' style={{ textAlign: 'center',marginBottom:2}}>


        After Market Analysis
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
>
        <Table size="small" aria-label="aftermarket analysis table">
          <TableHead>
            <TableRow>
              <TableCell sx={{color:'#002060'}}><strong>Key</strong></TableCell>
              <TableCell sx={{color:'#002060'}}><strong>Value</strong></TableCell>

            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              <TableCell><strong>Safety and Liquidity Check Max Size</strong></TableCell>
              <TableCell>{data.safety_and_liquidity_check_max_size}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell><strong>Shares Left to Go to Expected Allocation</strong></TableCell>
              <TableCell>{data.shares_left_to_go_to_expected_allocation}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell><strong>Current Price</strong></TableCell>
              <TableCell sx={{bgcolor:"#FFFF00"}}>{data.current_price}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell><strong>Percent Change from Offer</strong></TableCell>
              <TableCell sx={{bgcolor:"#FFFF00"}}>{data.percent_change_from_offer}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
};

export default AfterMarketAnalysis;
