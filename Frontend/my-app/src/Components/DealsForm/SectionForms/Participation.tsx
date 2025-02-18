import React from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography, Paper, Container } from '@mui/material';

interface ParticipationData {
  allocation: {
    amount_usd: number;
    shares: number;
    deal_percentage: number;
    fill_percentage: number;
    days: number;
  };
  b_d_bank: string;
  final_indication: {
    amount_usd: number;
    shares: number;
    deal_percentage: number;
    days: number;
  };
  deal_size: {
    amount_usd: number;
    shares: number;
    company_percentage: number;
    days: number;
  };
  price_local: {
    value: number;
    discount_percentage: number;
    last_close: number;
  };
  initial_range: string;
  deal_colour: string;
  use_of_proceeds:string;
  allocation_layout: {
    institutional: number;
    retail: number;
    long_only: number;
    hedge_funds: number;
    local: number;
    international: number;
  };
  allocation_concentration: {
    top_10_percentage: number;
  };
  aftermarket: {
    order: boolean;
    strategy: string;
    target_price_local: {
      value: number;
      percentage_above_issue: number;
    };
    stop_price_local: {
      value: number;
      percentage_below_issue: number;
    };
  };
}

interface ParticipationProps {
  data: ParticipationData;
}

const Participation: React.FC<ParticipationProps> = ({ data }) => {
  return (
    <Container sx={{mt:2,mb:2}}>

     <Typography variant="h6" color='#aa1e13' style={{ textAlign: 'center',marginBottom:2}}>


        Participation Details
      </Typography>

      <TableContainer component={Paper} sx={{height:'400px'
      }}>
        <Table size="small" aria-label="participation details table">
          <TableHead>
            <TableRow>
              <TableCell><strong>Key</strong></TableCell>
              <TableCell><strong>Value</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              <TableCell><strong>Allocation Amount (USD)</strong></TableCell>
              <TableCell>{data.allocation.amount_usd}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell><strong>Allocation Shares</strong></TableCell>
              <TableCell>{data.allocation.shares}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell><strong>Deal Percentage (Allocation)</strong></TableCell>
              <TableCell>{data.allocation.deal_percentage}%</TableCell>
            </TableRow>
            <TableRow>
              <TableCell><strong>Fill Percentage</strong></TableCell>
              <TableCell>{data.allocation.fill_percentage}%</TableCell>
            </TableRow>
            <TableRow>
              <TableCell><strong>Days to Allocate</strong></TableCell>
              <TableCell>{data.allocation.days}</TableCell>
            </TableRow>

            <TableRow>
              <TableCell><strong>Bookrunner Bank</strong></TableCell>
              <TableCell>{data.b_d_bank}</TableCell>
            </TableRow>

            <TableRow>
              <TableCell><strong>Final Indication Amount (USD)</strong></TableCell>
              <TableCell>{data.final_indication.amount_usd}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell><strong>Final Indication Shares</strong></TableCell>
              <TableCell>{data.final_indication.shares}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell><strong>Final Indication Deal Percentage</strong></TableCell>
              <TableCell>{data.final_indication.deal_percentage}%</TableCell>
            </TableRow>
            <TableRow>
              <TableCell><strong>Final Indication Days</strong></TableCell>
              <TableCell>{data.final_indication.days}</TableCell>
            </TableRow>

            <TableRow>
              <TableCell><strong>Deal Size Amount (USD)</strong></TableCell>
              <TableCell>{data.deal_size.amount_usd}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell><strong>Deal Size Shares</strong></TableCell>
              <TableCell>{data.deal_size.shares}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell><strong>Company Percentage</strong></TableCell>
              <TableCell>{data.deal_size.company_percentage}%</TableCell>
            </TableRow>
            <TableRow>
              <TableCell><strong>Deal Size Days</strong></TableCell>
              <TableCell>{data.deal_size.days}</TableCell>
            </TableRow>

            <TableRow>
              <TableCell><strong>Price (Local Currency)</strong></TableCell>
              <TableCell>{data.price_local.value}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell><strong>Discount Percentage</strong></TableCell>
              <TableCell>{data.price_local.discount_percentage}%</TableCell>
            </TableRow>
            <TableRow>
              <TableCell><strong>Last Close Price</strong></TableCell>
              <TableCell>{data.price_local.last_close}</TableCell>
            </TableRow>

            <TableRow>
              <TableCell><strong>Initial Range</strong></TableCell>
              <TableCell>{data.initial_range}</TableCell>
            </TableRow>

            <TableRow>
              <TableCell><strong>Deal Colour</strong></TableCell>
              <TableCell>{data.deal_colour}</TableCell>
            </TableRow>

            <TableRow>
              <TableCell><strong>Use of Proceeds</strong></TableCell>
              <TableCell>{data.use_of_proceeds}</TableCell>
            </TableRow>

            <TableRow>
              <TableCell><strong>Institutional Allocation (%)</strong></TableCell>
              <TableCell>{data.allocation_layout.institutional}%</TableCell>
            </TableRow>
            <TableRow>
              <TableCell><strong>Retail Allocation (%)</strong></TableCell>
              <TableCell>{data.allocation_layout.retail}%</TableCell>
            </TableRow>
            <TableRow>
              <TableCell><strong>Long Only Allocation (%)</strong></TableCell>
              <TableCell>{data.allocation_layout.long_only}%</TableCell>
            </TableRow>
            <TableRow>
              <TableCell><strong>Hedge Funds Allocation (%)</strong></TableCell>
              <TableCell>{data.allocation_layout.hedge_funds}%</TableCell>
            </TableRow>
            <TableRow>
              <TableCell><strong>Local Allocation (%)</strong></TableCell>
              <TableCell>{data.allocation_layout.local}%</TableCell>
            </TableRow>
            <TableRow>
              <TableCell><strong>International Allocation (%)</strong></TableCell>
              <TableCell>{data.allocation_layout.international}%</TableCell>
            </TableRow>

            <TableRow>
              <TableCell><strong>Top 10 Allocation Concentration (%)</strong></TableCell>
              <TableCell>{data.allocation_concentration.top_10_percentage}%</TableCell>
            </TableRow>

            <TableRow>
              <TableCell><strong>Aftermarket Order</strong></TableCell>
              <TableCell>{data.aftermarket.order ? 'Yes' : 'No'}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell><strong>Aftermarket Strategy</strong></TableCell>
              <TableCell>{data.aftermarket.strategy}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell><strong>Target Price (Local)</strong></TableCell>
              <TableCell>{data.aftermarket.target_price_local.value}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell><strong>Target Price % Above Issue</strong></TableCell>
              <TableCell>{data.aftermarket.target_price_local.percentage_above_issue}%</TableCell>
            </TableRow>
            <TableRow>
              <TableCell><strong>Stop Price (Local)</strong></TableCell>
              <TableCell>{data.aftermarket.stop_price_local.value}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell><strong>Stop Price % Below Issue</strong></TableCell>
              <TableCell>{data.aftermarket.stop_price_local.percentage_below_issue}%</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
};

export default Participation;
