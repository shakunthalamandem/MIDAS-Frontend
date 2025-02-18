import React from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Typography } from '@mui/material';

interface DealActivityProps {
  data: {
    ticker: string;
  };
}

const DealActivity: React.FC<DealActivityProps> = ({ data }) => {
  const { ticker } = data;

  return (
    <div>
      <Typography variant="h6" gutterBottom>
        Deal Activity
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
              <TableCell>Ticker</TableCell>
              <TableCell align="right">{ticker}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
};

export default DealActivity;
