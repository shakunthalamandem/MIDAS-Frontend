import React from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography, Paper, Container } from '@mui/material';

interface PerformanceStatisticsData {
  percent_change_on_day: string;
  percent_change_last_7_days: string;
  "52_week_high": number;
  percent_below_52_week_high: string;
  sector_stats_l30d_performance: string;
  sector_stats_correlation: number;
  "3m_adtv_eu_line": {
    usd: string;
    shares: string;
  };
  "3m_adtv_local_line": {
    usd: string;
    shares: string;
  };
  beta_smi: number;
  beta_sx5e: number;
  "1_sigma_block_trading_days_l12m": string;
  "3m_volatility": number;
  rsi_14d: number;
  rsi_30d: number;
  dmi_14d: number;
  macd_9d: number;
  stock_relative_to_ma: {
    "10d": string;
    "20d": string;
    "50d": string;
    "100d": string;
    "200d": string;
  };
}

interface PerformanceStrategyProps {
  data: PerformanceStatisticsData;
}

const PerformanceStrategy: React.FC<PerformanceStrategyProps> = ({ data }) => {
  return (
    <Container sx={{mt:2,mb:2}}>

     <Typography variant="h6" color='#aa1e13' style={{ textAlign: 'center',marginBottom:2}}>


      Performance Statistics      </Typography>

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
        <Table size="small" aria-label="performance strategy table">
          <TableHead>
            <TableRow>
              <TableCell><strong>Key</strong></TableCell>
              <TableCell><strong>Value</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              <TableCell><strong>Percent Change on Day</strong></TableCell>
              <TableCell>{data.percent_change_on_day}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell><strong>Percent Change Last 7 Days</strong></TableCell>
              <TableCell>{data.percent_change_last_7_days}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell><strong>52 Week High</strong></TableCell>
              <TableCell>{data["52_week_high"]}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell><strong>Percent Below 52 Week High</strong></TableCell>
              <TableCell>{data.percent_below_52_week_high}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell><strong>Sector Stats (Last 30 Days) Performance</strong></TableCell>
              <TableCell>{data.sector_stats_l30d_performance}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell><strong>Sector Stats Correlation</strong></TableCell>
              <TableCell>{data.sector_stats_correlation}</TableCell>
            </TableRow>

            <TableRow>
              <TableCell><strong>3M ADTV (EU) USD</strong></TableCell>
              <TableCell>{data["3m_adtv_eu_line"].usd}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell><strong>3M ADTV (EU) Shares</strong></TableCell>
              <TableCell>{data["3m_adtv_eu_line"].shares}</TableCell>
            </TableRow>

            <TableRow>
              <TableCell><strong>3M ADTV (Local) USD</strong></TableCell>
              <TableCell>{data["3m_adtv_local_line"].usd}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell><strong>3M ADTV (Local) Shares</strong></TableCell>
              <TableCell>{data["3m_adtv_local_line"].shares}</TableCell>
            </TableRow>

            <TableRow>
              <TableCell><strong>Beta (SMI)</strong></TableCell>
              <TableCell>{data.beta_smi}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell><strong>Beta (SX5E)</strong></TableCell>
              <TableCell>{data.beta_sx5e}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell><strong>1 Sigma Block Trading Days (12M)</strong></TableCell>
              <TableCell>{data["1_sigma_block_trading_days_l12m"]}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell><strong>3M Volatility</strong></TableCell>
              <TableCell>{data["3m_volatility"]}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell><strong>RSI (14D)</strong></TableCell>
              <TableCell>{data.rsi_14d}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell><strong>RSI (30D)</strong></TableCell>
              <TableCell>{data.rsi_30d}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell><strong>DMI (14D)</strong></TableCell>
              <TableCell>{data.dmi_14d}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell><strong>MACD (9D)</strong></TableCell>
              <TableCell>{data.macd_9d}</TableCell>
            </TableRow>

            <TableRow>
              <TableCell><strong>Stock Relative to MA (10D)</strong></TableCell>
              <TableCell>{data.stock_relative_to_ma["10d"]}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell><strong>Stock Relative to MA (20D)</strong></TableCell>
              <TableCell>{data.stock_relative_to_ma["20d"]}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell><strong>Stock Relative to MA (50D)</strong></TableCell>
              <TableCell>{data.stock_relative_to_ma["50d"]}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell><strong>Stock Relative to MA (100D)</strong></TableCell>
              <TableCell>{data.stock_relative_to_ma["100d"]}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell><strong>Stock Relative to MA (200D)</strong></TableCell>
              <TableCell>{data.stock_relative_to_ma["200d"]}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
};

export default PerformanceStrategy;
