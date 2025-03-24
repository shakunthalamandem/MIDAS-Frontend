import React from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Paper, 
  Grid, 
  Typography 
} from '@mui/material';

interface MarketData {
  latest_date: string;
  snp_500: number;
  dow_jones: number;
  russell_2000: number;
  top_gainers: Record<string, number>;
  top_losers: Record<string, number>;
}

interface DataTableProps {
  latest_data: MarketData;
}

const USMarketIndexTable: React.FC<DataTableProps> = ({ latest_data }) => {
  return (
    <Grid container spacing={2}>
      {/* Main Market Indices Table */}
      <Grid item xs={12}>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Date</TableCell>
                <TableCell align="right">S&P 500</TableCell>
                <TableCell align="right">Dow Jones</TableCell>
                <TableCell align="right">Russell 2000</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow>
                <TableCell>{latest_data.latest_date}</TableCell>
                <TableCell align="right">{latest_data.snp_500.toFixed(2)}%</TableCell>
                <TableCell align="right">{latest_data.dow_jones.toFixed(2)}%</TableCell>
                <TableCell align="right">{latest_data.russell_2000.toFixed(2)}%</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </Grid>

      {/* Side-by-side tables for Gainers and Losers */}
      <Grid item xs={12} md={6}>
        <Typography variant="h6" gutterBottom>
          Top Gainers
        </Typography>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Sector</TableCell>
                <TableCell align="right">Change (%)</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {Object.entries(latest_data.top_gainers).map(([sector, change]) => (
                <TableRow key={sector}>
                  <TableCell>{sector}</TableCell>
                  <TableCell align="right">{change.toFixed(2)}%</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Grid>

      <Grid item xs={12} md={6}>
        <Typography variant="h6" gutterBottom>
          Top Losers
        </Typography>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Sector</TableCell>
                <TableCell align="right">Change (%)</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {Object.entries(latest_data.top_losers).map(([sector, change]) => (
                <TableRow key={sector}>
                  <TableCell>{sector}</TableCell>
                  <TableCell align="right">{change.toFixed(2)}%</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Grid>
    </Grid>
  );
};

export default USMarketIndexTable;
