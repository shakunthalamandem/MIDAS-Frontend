import React from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography, Paper } from '@mui/material';

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
    <div>
      <Typography variant="h6" gutterBottom>
        After Market Analysis
      </Typography>

      <TableContainer component={Paper}>
        <Table size="small" aria-label="aftermarket analysis table">
          <TableHead>
            <TableRow>
              <TableCell><strong>Key</strong></TableCell>
              <TableCell><strong>Value</strong></TableCell>
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
              <TableCell>{data.current_price}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell><strong>Percent Change from Offer</strong></TableCell>
              <TableCell>{data.percent_change_from_offer}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
};

export default AfterMarketAnalysis;
