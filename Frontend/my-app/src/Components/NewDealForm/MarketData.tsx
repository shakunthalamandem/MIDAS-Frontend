


import React, { useState, useEffect } from "react";
import {
  Container,
  Card,
  CardContent,
  Box,
  Typography,
  Grid,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Paper,
  TextField,
  Select,
  MenuItem,
} from "@mui/material";
import { SelectChangeEvent } from '@mui/material/Select'; // Import the correct type

// Row type
interface Row {
  label: string;
  key: string;
  type?: 'text' | 'number' | 'select' | 'date';
  options?: string[];
}

interface MarketDealsProps {
  data?: {
    percent_of_free_float_current_float: number | string;
    percent_of_free_float_pre_deal: number | string;
    short_interest_shares: number | string;
    short_interest_dollar_amount: number | string;
    short_interest_percentage_of_deal: number | string;
    shares_outstanding_pre_deal: number | string;
    market_cap_pre_deal_usd: number | string;
    market_cap_pre_deal_chf: number | string;
    launch_date: string;
    trade_date: string;
    settlement_date: string;
    next_results_date: string;
    percent_change_last_7_days: number | string;
    week_52_high: number | string;
    percent_below_52_week_high: number | string;
    three_month_adtv_eu_usd: number | string;
    three_month_adtv_eu_shares: number | string;
    three_month_adtv_local_usd: number | string;
    three_month_adtv_local_shares: number | string;
    beta_smi: number | string;
    three_month_volatility: number | string;
    rsi_14d: number | string;
    rsi_30d: number | string;
    dmi_14d: number | string;
    macd_9d: number | string;
    stock_relative_to_ma_20d: number | string;
    stock_relative_to_ma_50d: number | string;
    stock_relative_to_ma_100d: number | string;
    stock_relative_to_ma_200d: number | string;
  };
}

const tableLeft: Row[] = [
    { label: '% of Free Float (Current Float)', key: 'percent_of_free_float_current_float' },
    { label: '% of Free Float (Pre-Deal)', key: 'percent_of_free_float_pre_deal' },
    { label: 'Short Interest (Shares)', key: 'short_interest_shares' },
    { label: 'Short Interest (Dollar Amount)', key: 'short_interest_dollar_amount' },
    { label: 'Short Interest (Percentage of Deal)', key: 'short_interest_percentage_of_deal' },
    { label: 'Shares Outstanding Pre-Deal', key: 'shares_outstanding_pre_deal', type: 'number' },
    { label: 'Market Cap Pre-Deal (USD)', key: 'market_cap_pre_deal_usd', type: 'number' },
    { label: 'Market Cap Pre-Deal (CHF)', key: 'market_cap_pre_deal_chf', type: 'number' },
    { label: 'Launch Date', key: 'launch_date', type: 'date' },
    { label: 'Trade Date', key: 'trade_date', type: 'date' },
    { label: 'Settlement Date', key: 'settlement_date', type: 'date' },
    { label: 'Next Results Date', key: 'next_results_date', type: 'date' },
    { label: 'Percent Change Last 7 Days', key: 'percent_change_last_7_days' },
    { label: '52 Week High', key: 'week_52_high', type: 'number' },
    { label: 'Percent Below 52 Week High', key: 'percent_below_52_week_high' },
    { label: '3M ADTV (EU) USD', key: 'three_month_adtv_eu_usd' },
];

const tableRight: Row[] = [
    { label: '3M ADTV (EU) Shares', key: 'three_month_adtv_eu_shares' },
    { label: '3M ADTV (Local) USD', key: 'three_month_adtv_local_usd' },
    { label: '3M ADTV (Local) Shares', key: 'three_month_adtv_local_shares' },
    { label: 'Beta (SMI)', key: 'beta_smi', type: 'number' },
    { label: '3M Volatility', key: 'three_month_volatility', type: 'number' },
    { label: 'RSI (14D)', key: 'rsi_14d', type: 'number' },
    { label: 'RSI (30D)', key: 'rsi_30d', type: 'number' },
    { label: 'DMI (14D)', key: 'dmi_14d', type: 'number' },
    { label: 'MACD (9D)', key: 'macd_9d', type: 'number' },
    { label: 'Stock Relative to MA (20D)', key: 'stock_relative_to_ma_20d' },
    { label: 'Stock Relative to MA (50D)', key: 'stock_relative_to_ma_50d' },
    { label: 'Stock Relative to MA (100D)', key: 'stock_relative_to_ma_100d' },
    { label: 'Stock Relative to MA (200D)', key: 'stock_relative_to_ma_200d' },
];

const MarketDeals: React.FC<MarketDealsProps> = ({ data }) => {
  const [formData, setFormData] = useState({});

  useEffect(() => {
    if (data) {
      setFormData({ ...data });
    }
  }, [data]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (e: SelectChangeEvent<string | number>) => {
    const name = e.target.name as string;
    const value = e.target.value;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    console.log("Saved Data:", formData);
    // You can add an API call or callback here
  };

  return (
    <Container maxWidth="lg" sx={{ padding: 0, marginBottom: 4 }}>
      <Card sx={{ marginTop: 4 }}>
        <CardContent>
          <Box sx={{ padding: 2 }}>
            <Typography
              variant="h5"
              gutterBottom
              color="#002060"
              align="center"
              sx={{ fontWeight: 'bold' }}
            >
              Market Deals
            </Typography>
          </Box>
          <Grid container spacing={2} maxWidth="lg">
            <Grid item xs={12} sx={{ textAlign: 'right', marginTop: 2 }}>
              <Button variant="contained" color="primary" onClick={handleSave}>
                Save
              </Button>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TableContainer component={Paper}>
                <Table size="small">
                  <TableBody>
                    {tableLeft.map((row, i) => (
                      <TableRow
                        key={row.key}
                        sx={{
                          backgroundColor: i % 2 === 0 ? '#f3f3f3' : '#fff',
                          '&:hover': { backgroundColor: '#e0f7fa' },
                        }}
                      >
                        <TableCell sx={{ fontWeight: 'bold', border: '1px solid #ccc', fontSize: '0.85rem' }}>
                          {row.label}
                        </TableCell>
                        <TableCell sx={{ border: '1px solid #ccc' }}>
                          {row.type === 'select' ? (
                            <Select
                              fullWidth
                              size="small"
                              name={row.key}
                              value={formData[row.key as keyof typeof formData] || ''}
                              onChange={handleSelectChange}
                            >
                              {row.options?.map(opt => (
                                <MenuItem key={opt} value={opt}>
                                  {opt}
                                </MenuItem>
                              ))}
                            </Select>
                          ) : (
                            <TextField
                              fullWidth
                              size="small"
                              type={row.type || 'text'}
                              name={row.key}
                              value={formData[row.key as keyof typeof formData] || ''}
                              onChange={handleChange}
                              variant="outlined"
                            />
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TableContainer component={Paper}>
                <Table size="small">
                  <TableBody>
                    {tableRight.map((row, i) => (
                      <TableRow
                        key={row.key}
                        sx={{
                          backgroundColor: i % 2 === 0 ? '#f3f3f3' : '#fff',
                          '&:hover': { backgroundColor: '#e0f7fa' },
                        }}
                      >
                        <TableCell sx={{ fontWeight: 'bold', border: '1px solid #ccc', fontSize: '0.85rem' }}>
                          {row.label}
                        </TableCell>
                        <TableCell sx={{ border: '1px solid #ccc' }}>
                          {row.type === 'select' ? (
                            <Select
                              fullWidth
                              size="small"
                              name={row.key}
                              value={formData[row.key as keyof typeof formData] || ''}
                              onChange={handleSelectChange}
                            >
                              {row.options?.map(opt => (
                                <MenuItem key={opt} value={opt}>
                                  {opt}
                                </MenuItem>
                              ))}
                            </Select>
                          ) : (
                            <TextField
                              fullWidth
                              size="small"
                              type={row.type || 'text'}
                              name={row.key}
                              value={formData[row.key as keyof typeof formData] || ''}
                              onChange={handleChange}
                              variant="outlined"
                            />
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Container>
  );
};

export default MarketDeals;

















