import React from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography, Paper } from '@mui/material';
import { DealFormData } from '../../../types/DealFormData';

// Define the structure for each transaction
interface Transaction {
  announcement_and_trade_date: string;
  price_discount: number;
  type: string;
  deal_size: {
    usd: number;
    percentage_of_co: number;
    shares_m: string;
  };
  bookrunners: string[];
  primary_secondary: string;
  monashee_demand_alloc_hold_period: string;
  lock_up_date: string;
  performance: {
    open: string;
    close: string;
    "1W": string;
    "1M": string;
  };
  sellers: string[];
}

interface HistoricalDataProps {
  data: Transaction[]; // Explicitly define the type of data
}

const HistoricalData: React.FC<HistoricalDataProps> = ({ data }) => {
  return (
    <div>
      <Typography variant="h6" gutterBottom>
        Historical Data
      </Typography>
      
      <TableContainer component={Paper} sx={{height:'400px'
      }}>
        <Table size="small" aria-label="historical data table">
          <TableHead>
            <TableRow>
              <TableCell><strong>Key</strong></TableCell>
              <TableCell><strong>Value</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.map((transaction, index) => (
              <React.Fragment key={index}>
                <TableRow>
                  <TableCell colSpan={2}><strong>Transaction {index + 1}</strong></TableCell>
                </TableRow>
                
                <TableRow>
                  <TableCell><strong>Announcement and Trade Date</strong></TableCell>
                  <TableCell>{transaction.announcement_and_trade_date}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><strong>Price Discount</strong></TableCell>
                  <TableCell>{transaction.price_discount}%</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><strong>Type</strong></TableCell>
                  <TableCell>{transaction.type}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><strong>Deal Size (USD)</strong></TableCell>
                  <TableCell>{transaction.deal_size.usd}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><strong>Deal Size (% of Co)</strong></TableCell>
                  <TableCell>{transaction.deal_size.percentage_of_co}%</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><strong>Deal Size (Shares M)</strong></TableCell>
                  <TableCell>{transaction.deal_size.shares_m}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><strong>Bookrunners</strong></TableCell>
                  <TableCell>{transaction.bookrunners.join(", ")}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><strong>Primary/Secondary</strong></TableCell>
                  <TableCell>{transaction.primary_secondary}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><strong>Monashee Demand Alloc Hold Period</strong></TableCell>
                  <TableCell>{transaction.monashee_demand_alloc_hold_period}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><strong>Lock-Up Date</strong></TableCell>
                  <TableCell>{transaction.lock_up_date}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><strong>Performance (Open)</strong></TableCell>
                  <TableCell>{transaction.performance.open}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><strong>Performance (Close)</strong></TableCell>
                  <TableCell>{transaction.performance.close}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><strong>Performance (1W)</strong></TableCell>
                  <TableCell>{transaction.performance["1W"]}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><strong>Performance (1M)</strong></TableCell>
                  <TableCell>{transaction.performance["1M"]}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><strong>Sellers</strong></TableCell>
                  <TableCell>{transaction.sellers.join(", ")}</TableCell>
                </TableRow>
              </React.Fragment>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
};

export default HistoricalData;
