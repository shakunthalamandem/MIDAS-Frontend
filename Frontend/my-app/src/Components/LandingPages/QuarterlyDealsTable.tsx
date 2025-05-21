import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, Typography, CircularProgress, Box
} from '@mui/material';

type QuarterData = {
  Total_Deal_Count: number;
  Total_Deal_Volume: number;
  Positively_Performing_Deals_Percentage: number;
  Expected_Returns_Excess: number;
  Long_Opportunity_Value: number;
};

type ApiResponse = {
  Yearwise: {
    [quarter: string]: QuarterData;
  };
};

const QuarterlyDealsTable = () => {
  const [ipoData, setIpoData] = useState<{ quarter: string, data: QuarterData }[]>([]);
  const [foData, setFoData] = useState<{ quarter: string, data: QuarterData }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDeals = async () => {
      try {
        const [response1, response2] = await Promise.all([
          axios.post<ApiResponse>('http://192.168.1.38:9000/api/skewtable/calculations/', {
            filters: {
              year_range: [2023, 2025],
              deal_type: ['IPO'],
              region: ['Non-US America', 'US', 'EMEA', 'APAC'],
              year_period: 'Quarterly',
            },
          }),
          axios.post<ApiResponse>('http://192.168.1.38:9000/api/skewtable/calculations/', {
            filters: {
              year_range: [2023, 2025],
              deal_type: ['FO'],
              region: ['Non-US America', 'US', 'EMEA', 'APAC'],
              year_period: 'Quarterly',
            },
          }),
        ]);

        const processData = (yearwise: { [key: string]: QuarterData }) => {
          const sortedKeys = Object.keys(yearwise)
            .sort()
            .filter(q => ['2023 Q1', '2024 Q1', '2025 Q1'].includes(q));

          return sortedKeys.map(key => ({
            quarter: key,
            data: yearwise[key],
          }));
        };

        setIpoData(processData(response1.data.Yearwise));
        setFoData(processData(response2.data.Yearwise));
      } catch (err) {
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
    <Box sx={{ width: '60%', height: 'auto', float: 'left' }}>
      <TableContainer component={Paper}>
        <Typography variant="h6" sx={{ p: 2 }}>Quarterly Deal Performance</Typography>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell colSpan={6} sx={{ fontWeight: 'bold', backgroundColor: '#002060',color:"white",textAlign:"center" }}>
                IPO
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell  sx={{fontWeight:'bold'}}>Quarter</TableCell>
              <TableCell sx={{fontWeight:'bold'}}>Total Deal Count</TableCell>
              <TableCell sx={{fontWeight:'bold'}}>Total Deal Volume</TableCell>
              <TableCell sx={{fontWeight:'bold'}}>Positive %</TableCell>
              <TableCell>Expected Returns Excess</TableCell>
              <TableCell>Long Opportunity Value</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {ipoData.map(row => (
              <TableRow key={`IPO-${row.quarter}`}>
                <TableCell>{row.quarter}</TableCell>
                <TableCell>{row.data.Total_Deal_Count}</TableCell>
                <TableCell>{row.data.Total_Deal_Volume.toLocaleString()}</TableCell>
                <TableCell>{row.data.Positively_Performing_Deals_Percentage}%</TableCell>
                <TableCell>{row.data.Expected_Returns_Excess}%</TableCell>
                <TableCell>{row.data.Long_Opportunity_Value.toLocaleString()}</TableCell>
              </TableRow>
            ))}
            <TableRow>
              <TableCell colSpan={6} sx={{ fontWeight: 'bold', backgroundColor: '#002060',color:"white",textAlign:"center"  }}>
                FO
              </TableCell>
            </TableRow>
            {foData.map(row => (
              <TableRow key={`FO-${row.quarter}`}>
                <TableCell>{row.quarter}</TableCell>
                <TableCell>{row.data.Total_Deal_Count}</TableCell>
                <TableCell>{row.data.Total_Deal_Volume.toLocaleString()}</TableCell>
                <TableCell>{row.data.Positively_Performing_Deals_Percentage}%</TableCell>
                <TableCell>{row.data.Expected_Returns_Excess}%</TableCell>
                <TableCell>{row.data.Long_Opportunity_Value.toLocaleString()}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default QuarterlyDealsTable;
