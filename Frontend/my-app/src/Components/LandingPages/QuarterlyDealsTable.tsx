import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, Typography, CircularProgress
} from '@mui/material';

type QuarterData = {
  Total_Deal_Count: number;
  Total_Deal_Volume: number;
  Positively_Performing_Deals_Percentage: number;
  Negatively_Performing_Deals_Percentage: number;
  Average_T1M_Abs_Return_of_Positively: number;
  Average_T1M_Abs_Return_of_Negatively: number;
  Expected_Returns_Excess: number;
  Long_Opportunity_Value: number;
};

type ApiResponse = {
  Yearwise: {
    [quarter: string]: QuarterData;
  };
};

const QuarterlyDealsTable = () => {
  const [data, setData] = useState<QuarterData[]>([]);
  const [quarters, setQuarters] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDeals = async () => {
      try {
        const response = await axios.post<ApiResponse>(
          'https://your-api-endpoint.com/api/deals', // Replace with actual API endpoint
          {
            filters: {
              year_range: [2023, 2025],
              deal_type: ["IPO"],
              region: ["Non-US America", "US", "EMEA", "APAC"],
              year_period: "Quarterly"
            }
          }
        );

        const yearwiseData = response.data.Yearwise;
        const sortedKeys = Object.keys(yearwiseData).sort();
        const sortedData = sortedKeys.map(key => yearwiseData[key]);

        setQuarters(sortedKeys);
        setData(sortedData);
      } catch (err: any) {
        setError('Failed to fetch data');
      } finally {
        setLoading(false);
      }
    };

    fetchDeals();
  }, []);

  if (loading) return <CircularProgress />;
  if (error) return <Typography color="error">{error}</Typography>;

  return (
    <TableContainer component={Paper}>
      <Typography variant="h6" sx={{ p: 2 }}>
        Quarterly Deal Performance (2023 - 2025)
      </Typography>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Quarter</TableCell>
            <TableCell>Total Deal Count</TableCell>
            <TableCell>Total Deal Volume</TableCell>
            <TableCell>Positive %</TableCell>
            <TableCell>Negative %</TableCell>
            <TableCell>Avg Return (Positive)</TableCell>
            <TableCell>Avg Return (Negative)</TableCell>
            <TableCell>Expected Returns Excess</TableCell>
            <TableCell>Long Opportunity Value</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {data.map((row, idx) => (
            <TableRow key={quarters[idx]}>
              <TableCell>{quarters[idx]}</TableCell>
              <TableCell>{row.Total_Deal_Count}</TableCell>
              <TableCell>{row.Total_Deal_Volume.toLocaleString()}</TableCell>
              <TableCell>{row.Positively_Performing_Deals_Percentage}%</TableCell>
              <TableCell>{row.Negatively_Performing_Deals_Percentage}%</TableCell>
              <TableCell>{row.Average_T1M_Abs_Return_of_Positively}%</TableCell>
              <TableCell>{row.Average_T1M_Abs_Return_of_Negatively}%</TableCell>
              <TableCell>{row.Expected_Returns_Excess}%</TableCell>
              <TableCell>{row.Long_Opportunity_Value.toLocaleString()}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default QuarterlyDealsTable;
