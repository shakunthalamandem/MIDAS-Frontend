import React from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';

interface MarketData {
  latest_date: string;
  snp_500: number;
  dow_jones: number;
  russell_2000: number;
}

interface DataTableProps {
  latest_data: MarketData;
}

const USMarketIndexTable: React.FC<DataTableProps> = ({ latest_data }) => {
  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Date</TableCell>
            <TableCell>S&P 500</TableCell>
            <TableCell>Dow Jones</TableCell>
            <TableCell>Russell 2000</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          <TableRow>
            <TableCell>{latest_data.latest_date}</TableCell>
            <TableCell>{latest_data.snp_500.toFixed(2)}</TableCell>
            <TableCell>{latest_data.dow_jones.toFixed(2)}</TableCell>
            <TableCell>{latest_data.russell_2000.toFixed(2)}</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default USMarketIndexTable;
