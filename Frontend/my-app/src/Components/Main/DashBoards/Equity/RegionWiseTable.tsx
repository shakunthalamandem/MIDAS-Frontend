import React, { useEffect, useState } from 'react';
import {
  Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, Typography, CircularProgress, Box
} from '@mui/material';

type RegionData = {
  Total_Deal_Count: number;
  Total_Deal_Volume: number;
  Positively_Performing_Deals_Percentage: number;
  Expected_Returns_Excess: number;
  Long_Opportunity_Value: number;
};

type ApiRegionResponse = {
  Regionwise_IPO: { [region: string]: RegionData };
  Regionwise_FO: { [region: string]: RegionData };
};

const formatNumber = (value: number): string => {
  if (value === null || value === undefined) {
    return 'N/A';
  }
  const absValue = Math.abs(value);
  let formattedValue: string;

  if (absValue >= 1e9) {
    formattedValue = `${(absValue / 1e9).toFixed()}B`;
  } else if (absValue >= 1e6) {
    formattedValue = `${(absValue / 1e6).toFixed()}M`;
  } else if (absValue >= 1e3) {
    formattedValue = `${(absValue / 1e3).toFixed()}K`;
  } else {
    formattedValue = absValue.toString();
  }

  return value < 0 ? `-${formattedValue}` : formattedValue;
};

const RegionWiseTable = () => {
  const [ipoData, setIpoData] = useState<{ region: string; data: RegionData }[]>([]);
  const [foData, setFoData] = useState<{ region: string; data: RegionData }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDeals = async () => {
      const apiUrl = process.env.REACT_APP_API_URL;
      const token = localStorage.getItem("access_token");

      if (!apiUrl) {
        setError("API URL is not defined in environment variables");
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`${apiUrl}/api/summary_data/`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": token ? `Bearer ${token}` : "",
          }
        });
        console.log("The api responce is ",response)

        if (!response.ok) throw new Error('Failed to fetch data');
        const result: ApiRegionResponse = await response.json();

        const processData = (regionwise: { [region: string]: RegionData }) =>
          Object.entries(regionwise).map(([region, data]) => ({ region, data }));

        setIpoData(processData(result.Regionwise_IPO));
        setFoData(processData(result.Regionwise_FO));
      } catch (err) {
        setError('Failed to fetch data');
      } finally {
        setLoading(false);
      }
    };

    fetchDeals();
  }, []);

  if (loading) return <Box textAlign="center" mt={4}><CircularProgress /></Box>;
  if (error) return <Typography color="error" textAlign="center">{error}</Typography>;

  return (
    <Box sx={{ width: '60%', margin: 'auto', mt: 4 }}>
      <TableContainer component={Paper}>
        <Typography variant="h6" sx={{ p: 2 ,fontWeight: "bold"}}>
          RegionWise SkewTable -IPO and FO Deals for 2025 (Q1) with Top1 Highlights
        </Typography>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold' }}>Region</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Total Deal Count</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Total Deal Volume ($)</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Opportunity Value (T + 1M Excess)
              </TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>% of Positively Performing Deals</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Expected Returns Excess(T + 1M)</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              <TableCell colSpan={6} sx={{ fontWeight: 'bold', backgroundColor: '#002060', color: "white", textAlign: "center" }}>
                IPO
              </TableCell>
            </TableRow>
            {ipoData.map(row => (
              <TableRow key={`IPO-${row.region}`}>
                <TableCell>{row.region}</TableCell>
                <TableCell>{row.data.Total_Deal_Count}</TableCell>
                <TableCell>{formatNumber(row.data.Total_Deal_Volume)}</TableCell>
                <TableCell>{formatNumber(row.data.Long_Opportunity_Value)}</TableCell>
                <TableCell>{row.data.Positively_Performing_Deals_Percentage}%</TableCell>
                <TableCell>{row.data.Expected_Returns_Excess}%</TableCell>
              </TableRow>
            ))}
            <TableRow>
              <TableCell colSpan={6} sx={{ fontWeight: 'bold', backgroundColor: '#002060', color: "white", textAlign: "center" }}>
                FO
              </TableCell>
            </TableRow>
            {foData.map(row => (
              <TableRow key={`FO-${row.region}`}>
                <TableCell>{row.region}</TableCell>
                <TableCell>{row.data.Total_Deal_Count}</TableCell>
                <TableCell>{formatNumber(row.data.Total_Deal_Volume)}</TableCell>
                <TableCell>{formatNumber(row.data.Long_Opportunity_Value)}</TableCell>
                <TableCell>{row.data.Positively_Performing_Deals_Percentage}%</TableCell>
                <TableCell>{row.data.Expected_Returns_Excess}%</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default RegionWiseTable;
