import React from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Typography } from '@mui/material';

interface AfterMarketAnalysisProps {
  data: {
    safety_and_liquidity_check_max_size: string;
    shares_left_to_go_to_expected_allocation: number;
    current_price: string;
    percent_change_from_offer: string;
  };
}

const AfterMarketAnalysis: React.FC<AfterMarketAnalysisProps> = ({ data }) => {
  return (
    <div>
      <Typography variant="h6" gutterBottom>
        After Market Analysis
      </Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Attribute</TableCell>
              <TableCell align="right">Value</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              <TableCell>Safety & Liquidity Check Max Size</TableCell>
              <TableCell align="right">{data.safety_and_liquidity_check_max_size}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Shares Left to Go to Expected Allocation</TableCell>
              <TableCell align="right">{data.shares_left_to_go_to_expected_allocation}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Current Price</TableCell>
              <TableCell align="right">{data.current_price}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Percent Change from Offer</TableCell>
              <TableCell align="right">{data.percent_change_from_offer}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
};

export default AfterMarketAnalysis;
