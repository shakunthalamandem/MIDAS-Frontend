import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import {
  Box, Select, MenuItem, FormControl, InputLabel, Typography,
  CircularProgress, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, SelectChangeEvent, Container, Snackbar, Alert
} from '@mui/material';

interface SkewData {
  Year: string;
  Total_Deal_Count: number;
  Positively_Performing_Deals_Percentage: number;
  Negatively_Performing_Deals_Percentage: number;
  "Average_T+1M_Abs_Return of Positively": number;
  "Average_T+1M_Abs_Return of Negatively": number;
  Expected_Returns: number;
  Long_Opportunity_Value: number;
}

interface YearResponse {
  years: number[];
}

const SkewMain: React.FC = () => {
  const [skewData, setSkewData] = useState<SkewData[]>([]);
  const [filteredData, setFilteredData] = useState<SkewData[]>([]);
  const [years, setYears] = useState<number[]>([]);
  const [startYear, setStartYear] = useState<number | undefined>(undefined);
  const [endYear, setEndYear] = useState<number | undefined>(undefined);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [openSnackbar, setOpenSnackbar] = useState(false);

  const fetchYears = useCallback(async () => {
    try {
      const response = await axios.get<YearResponse>("http://192.168.1.59:9000/api/distinct_years/");
      const yearList = response.data.years.sort((a, b) => a - b);
      setYears(yearList);
      if (yearList.length > 0) {
        setStartYear(yearList[0]);
        setEndYear(yearList[0] + 9); // default to 10-year range
      }
    } catch (error) {
      console.error("Error fetching years:", error);
      setError("Failed to fetch years. Please try again later.");
    }
  }, []);

  const fetchSkewData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get<SkewData[]>("http://192.168.1.59:9000/api/skew-table/calculations/");
      setSkewData(response.data);
    } catch (error) {
      console.error("Error fetching skew data:", error);
      setError("Failed to fetch skew data. Please try again later.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSkewData();
    fetchYears();
  }, [fetchSkewData, fetchYears]);

  useEffect(() => {
    if (startYear && endYear) {
      const filtered = skewData.filter(data => {
        const year = parseInt(data.Year, 10);
        return year >= startYear && year <= endYear;
      });
      setFilteredData(filtered);
    }
  }, [skewData, startYear, endYear]);

  const handleStartYearChange = (event: SelectChangeEvent<number>) => {
    setStartYear(Number(event.target.value));
  };

  const handleEndYearChange = (event: SelectChangeEvent<number>) => {
    const newEndYear = Number(event.target.value);
    if (startYear && newEndYear < startYear) {
      setOpenSnackbar(true);
    } else {
      setEndYear(newEndYear);
    }
  };

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };

  // Calculate totals and averages for the summary row
  const totalDealCount = filteredData.reduce((acc, row) => acc + row.Total_Deal_Count, 0);
  const avgPositivelyPerformingDeals = filteredData.reduce((acc, row) => acc + row.Positively_Performing_Deals_Percentage, 0) / filteredData.length;
  const avgNegativelyPerformingDeals = filteredData.reduce((acc, row) => acc + row.Negatively_Performing_Deals_Percentage, 0) / filteredData.length;
  const avgReturnPositively = filteredData.reduce((acc, row) => acc + row["Average_T+1M_Abs_Return of Positively"], 0) / filteredData.length;
  const avgReturnNegatively = filteredData.reduce((acc, row) => acc + row["Average_T+1M_Abs_Return of Negatively"], 0) / filteredData.length;
  const avgExpectedReturns = filteredData.reduce((acc, row) => acc + row.Expected_Returns, 0) / filteredData.length;
  const totalLongOpportunityValue = filteredData.reduce((acc, row) => acc + row.Long_Opportunity_Value, 0);

  return (
    <>
      <Container maxWidth="lg" sx={{ paddingY: 4, backgroundColor: '#f4f4f9' }}>
        <Box sx={{ padding: 3, width: '100%', backgroundColor: '#ffffff', borderRadius: 2 }}>
          <Box sx={{ display: 'flex', gap: 2, marginBottom: 3, flexWrap: 'wrap', justifyContent: 'space-between' }}>
            <FormControl variant="outlined" size="small" sx={{ minWidth: 120, maxHeight: 40, backgroundColor: '#e0f2f1', borderRadius: 1 }}>
              <InputLabel sx={{ color: '#004d40' }}>Start Year</InputLabel>
              <Select
                value={startYear ?? ''}
                onChange={handleStartYearChange}
                label="Start Year"
                MenuProps={{ PaperProps: { style: { maxHeight: 200 } } }}
                sx={{
                  backgroundColor: '#e0f2f1', 
                  color: '#004d40', 
                  '& .MuiOutlinedInput-root': { borderRadius: '8px' },
                  '& .MuiInputLabel-root': { color: '#004d40' }
                }}
              >
                {years.map((year) => (
                  <MenuItem key={year} value={year} sx={{ color: '#004d40' }}>
                    {year}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl variant="outlined" size="small" sx={{ minWidth: 120, maxHeight: 40, backgroundColor: '#e0f2f1', borderRadius: 1 }}>
              <InputLabel sx={{ color: '#004d40' }}>End Year</InputLabel>
              <Select
                value={endYear ?? ''}
                onChange={handleEndYearChange}
                label="End Year"
                MenuProps={{ PaperProps: { style: { maxHeight: 200 } } }}
                sx={{
                  backgroundColor: '#e0f2f1', 
                  color: '#004d40', 
                  '& .MuiOutlinedInput-root': { borderRadius: '8px' },
                  '& .MuiInputLabel-root': { color: '#004d40' }
                }}
              >
                {years.map((year) => (
                  <MenuItem key={year} value={year} sx={{ color: '#004d40' }}>
                    {year}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          {loading ? (
            <Box display="flex" justifyContent="center" alignItems="center">
              <CircularProgress />
            </Box>
          ) : error ? (
            <Typography color="error">{error}</Typography>
          ) : (
            <TableContainer component={Paper} sx={{ maxHeight: 600, overflow: 'auto', marginTop: 2, borderRadius: 2 }}>
              <Table size="small" stickyHeader aria-label="skew table">
                <TableHead sx={{ backgroundColor: '#002060' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold', color: '#002060' }}>Year</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: '#002060' }}>Total Deal Count</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: '#002060' }}>% of Positively Performing Deals</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: '#002060' }}>% of Negatively Performing Deals</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: '#002060' }}>Avg T+1M Abs. Return Pos</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: '#002060' }}>Avg T+1M Abs. Return Neg</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: '#002060' }}>Expected Return</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: '#002060' }}>Long Only Opportunity Value</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredData.map((row) => (
                    <TableRow key={row.Year}>
                      <TableCell>{row.Year}</TableCell>
                      <TableCell>{row.Total_Deal_Count}</TableCell>
                      <TableCell>{row.Positively_Performing_Deals_Percentage.toFixed(0)}%</TableCell>
                      <TableCell>{row.Negatively_Performing_Deals_Percentage.toFixed(0)}%</TableCell>
                      <TableCell>{row["Average_T+1M_Abs_Return of Positively"].toFixed(1)}</TableCell>
                      <TableCell>{row["Average_T+1M_Abs_Return of Negatively"].toFixed(1)}</TableCell>
                      <TableCell>{row.Expected_Returns.toFixed(1)}</TableCell>
                      <TableCell>${row.Long_Opportunity_Value.toFixed(1)}B</TableCell>
                    </TableRow>
                  ))}
                  {/* Summary Row */}
                  <TableRow sx={{ backgroundColor: '#e0f2f1' }}>
                    <TableCell sx={{ fontWeight: 'bold' }}>Total</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>{totalDealCount}</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>{avgPositivelyPerformingDeals.toFixed(0)}%</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>{avgNegativelyPerformingDeals.toFixed(0)}%</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>{avgReturnPositively.toFixed(1)}%</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>{avgReturnNegatively.toFixed(1)}%</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>{avgExpectedReturns.toFixed(1)}%</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>${totalLongOpportunityValue.toFixed(1)}B</TableCell>
                  </TableRow>

                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Box>
      </Container>

      <Snackbar open={openSnackbar} autoHideDuration={3000} onClose={handleCloseSnackbar}>
        <Alert onClose={handleCloseSnackbar} severity="warning" sx={{ width: '100%' }}>
          End year cannot be earlier than the start year!
        </Alert>
      </Snackbar>
    </>
  );
};

export default SkewMain;
