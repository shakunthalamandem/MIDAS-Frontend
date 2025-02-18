import React from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography, Paper, Container, CardContent, Card } from '@mui/material';

interface BackgroundData {
  syndicate: string[];
  pe_vendor: string;
  index_fund_participation: string[];
  recent_earnings_estimate_revision: string;
  recent_positive_news: string;
  vix_elevated: string;
  restrictions: string;
  lock_up: string;
  "%_of_free_float_current_float": {
    percentage_free_float: number;
    pre_deal_free_float_percentage: number;
  };
  short_interest: {
    shares: string;
    dollar_amount: string;
    percentage_of_deal: string;
  };
  shares_outstanding_pre_deal: number;
  market_cap_pre_deal: {
    usd: number;
    chf: number;
  };
  launch_date: string;
  trade_date: string;
  settlement_date: string;
  next_results_date: string;
  club_deal: string;
}

interface BackgroundProps {
  data: BackgroundData;
}

const Background: React.FC<BackgroundProps> = ({ data }) => {
  return (
    <Container sx={{mt:2,mb:2}}>
    
     <Typography variant="h6" color='#aa1e13' style={{ textAlign: 'center',marginBottom:2}}>


        Background Data
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
        <Table size="small" aria-label="background data table">
          <TableHead>
            <TableRow>
              <TableCell sx={{color:'#002060'}}><strong>Key</strong></TableCell>
              <TableCell sx={{color:'#002060'}}><strong>Value</strong></TableCell>

            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              <TableCell sx={{color:'#4d4d4d'}}><strong>Syndicate</strong></TableCell>
              <TableCell>{data.syndicate.join(", ")}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell sx={{color:'#4d4d4d'}}><strong>PE Vendor</strong></TableCell>
              <TableCell>{data.pe_vendor}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell sx={{color:'#4d4d4d'}}><strong>Index Fund Participation</strong></TableCell>
              <TableCell>{data.index_fund_participation.join(", ")}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell sx={{color:'#4d4d4d'}}><strong>Recent Earnings Estimate Revision</strong></TableCell>
              <TableCell>{data.recent_earnings_estimate_revision}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell sx={{color:'#4d4d4d'}}><strong>Recent Positive News</strong></TableCell>
              <TableCell>{data.recent_positive_news}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell sx={{color:'#4d4d4d'}}><strong>VIX Elevated</strong></TableCell>
              <TableCell>{data.vix_elevated}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell sx={{color:'#4d4d4d'}}><strong>Restrictions</strong></TableCell>
              <TableCell>{data.restrictions}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell sx={{color:'#4d4d4d'}}><strong>Lock-Up</strong></TableCell>
              <TableCell>{data.lock_up}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell sx={{color:'#4d4d4d'}}><strong>% of Free Float (Current Float)</strong></TableCell>
              <TableCell>{data["%_of_free_float_current_float"].percentage_free_float}%</TableCell>
            </TableRow>
            <TableRow>
              <TableCell sx={{color:'#4d4d4d'}}><strong>% of Free Float (Pre-Deal)</strong></TableCell>
              <TableCell>{data["%_of_free_float_current_float"].pre_deal_free_float_percentage}%</TableCell>
            </TableRow>
            <TableRow>
              <TableCell sx={{color:'#4d4d4d'}}><strong>Short Interest (Shares)</strong></TableCell>
              <TableCell>{data.short_interest.shares}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell sx={{color:'#4d4d4d'}}><strong>Short Interest (Dollar Amount)</strong></TableCell>
              <TableCell>{data.short_interest.dollar_amount}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell sx={{color:'#4d4d4d'}}><strong>Short Interest (Percentage of Deal)</strong></TableCell>
              <TableCell>{data.short_interest.percentage_of_deal}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell sx={{color:'#4d4d4d'}}><strong>Shares Outstanding Pre-Deal</strong></TableCell>
              <TableCell>{data.shares_outstanding_pre_deal}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell sx={{color:'#4d4d4d'}}><strong>Market Cap Pre-Deal (USD)</strong></TableCell>
              <TableCell>{data.market_cap_pre_deal.usd}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell sx={{color:'#4d4d4d'}}><strong>Market Cap Pre-Deal (CHF)</strong></TableCell>
              <TableCell>{data.market_cap_pre_deal.chf}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell sx={{color:'#4d4d4d'}}><strong>Launch Date</strong></TableCell>
              <TableCell>{data.launch_date}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell sx={{color:'#4d4d4d'}}><strong>Trade Date</strong></TableCell>
              <TableCell>{data.trade_date}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell sx={{color:'#4d4d4d'}}><strong>Settlement Date</strong></TableCell>
              <TableCell>{data.settlement_date}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell sx={{color:'#4d4d4d'}}><strong>Next Results Date</strong></TableCell>
              <TableCell>{data.next_results_date}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell sx={{color:'#4d4d4d'}}><strong>Club Deal</strong></TableCell>
              <TableCell>{data.club_deal}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>

    </Container>
  );
};

export default Background;
