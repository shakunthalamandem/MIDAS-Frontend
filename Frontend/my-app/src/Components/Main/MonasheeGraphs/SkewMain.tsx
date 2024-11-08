import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import {
  Box, Select, MenuItem, FormControl, InputLabel, Typography,
  CircularProgress, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, SelectChangeEvent, Container, Snackbar, Alert,
  Card, CardContent
} from '@mui/material';
import SectorSkewData from './SectorSkewData';

// Define the SkewData type based on the structure
interface SkewData {
  Year: string;
  Total_Deal_Count: number;
  Positively_Performing_Deals_Percentage: number;
  Negatively_Performing_Deals_Percentage: number;
  "Average_T+1M_Abs_Return_of_Positively": number;
  "Average_T+1M_Abs_Return_of_Negatively": number;
  Expected_Returns: number;
  Long_Opportunity_Value: number;
}

// Define the YearResponse type for fetching distinct years
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

  // Fetch distinct years from the API
  const fetchYears = useCallback(async () => {
    try {
      const response = await axios.get<YearResponse>("http://192.168.1.59:9000/api/distinct_years/");
      const yearList = response.data.years.sort((a, b) => a - b);
      setYears(yearList);
      if (yearList.length > 0) {
        setStartYear(yearList[0]);
        setEndYear(yearList[0] + 9); // default to a 10-year range
      }
    } catch (error) {
      console.error("Error fetching years:", error);
      setError("Failed to fetch years. Please try again later.");
    }
  }, []);

  // Fetch skew data based on the new structure
  const fetchSkewData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get<{ Year_Statistics: SkewData[] }>("http://192.168.1.59:9000/api/skewtable/calculations/");
      setSkewData(response.data.Year_Statistics); // Extract the Year_Statistics array from the response
    } catch (error) {
      console.error("Error fetching skew data:", error);
      setError("Failed to fetch skew data. Please try again later.");
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch data when the component is mounted
  useEffect(() => {
    fetchSkewData();
    fetchYears();
  }, [fetchSkewData, fetchYears]);

  // Filter skew data when start and end years are selected
  useEffect(() => {
    if (startYear && endYear) {
      const filtered = skewData.filter(data => {
        const year = parseInt(data.Year, 10);
        return year >= startYear && year <= endYear;
      });
      setFilteredData(filtered);
    }
  }, [skewData, startYear, endYear]);

  // Handle changes in the start year select dropdown
  const handleStartYearChange = (event: SelectChangeEvent<number>) => {
    setStartYear(Number(event.target.value));
  };

  // Handle changes in the end year select dropdown
  const handleEndYearChange = (event: SelectChangeEvent<number>) => {
    const newEndYear = Number(event.target.value);
    if (startYear && newEndYear < startYear) {
      setOpenSnackbar(true); // Show snackbar if the end year is less than the start year
    } else {
      setEndYear(newEndYear);
    }
  };

  // Close the snackbar when it's clicked away or auto-hidden
  const handleCloseSnackbar = (event?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    }
    setOpenSnackbar(false);
  };

  // Calculate totals and averages for the summary row
  const totalDealCount = filteredData.reduce((acc, row) => acc + row.Total_Deal_Count, 0);
  const avgPositivelyPerformingDeals = filteredData.reduce((acc, row) => acc + row.Positively_Performing_Deals_Percentage, 0) / filteredData.length;
  const avgNegativelyPerformingDeals = filteredData.reduce((acc, row) => acc + row.Negatively_Performing_Deals_Percentage, 0) / filteredData.length;
  const avgReturnPositively = filteredData.reduce((acc, row) => acc + row["Average_T+1M_Abs_Return_of_Positively"], 0) / filteredData.length;
  const avgReturnNegatively = filteredData.reduce((acc, row) => acc + row["Average_T+1M_Abs_Return_of_Negatively"], 0) / filteredData.length;
  const avgExpectedReturns = filteredData.reduce((acc, row) => acc + row.Expected_Returns, 0) / filteredData.length;
  const totalLongOpportunityValue = filteredData.reduce((acc, row) => acc + row.Long_Opportunity_Value, 0);

  return (
    <>
          <SectorSkewData />

      <Container maxWidth="lg" sx={{ paddingY: 4, backgroundColor: '#f4f4f9' }}>
        <Card sx={{ borderRadius: 3, boxShadow: 3 }}>
          <CardContent>
            <Box sx={{ padding: 3, width: '100%', backgroundColor: '#ffffff', borderRadius: 2 }}>
              <Typography
                variant="h6"
                sx={{
                  maxWidth: "600px",
                  fontSize: { xs: "1rem", sm: "1.2rem", md: "1.5rem" },
                  lineHeight: "1.6",
                  marginBottom: "10px",
                  color: "#333333",
                  fontWeight: "bold",
                }}
              >
                Yearly Performance Skew Analysis
              </Typography>

              <Box sx={{ display: 'flex', gap: 1, marginBottom: 3, flexWrap: 'wrap', justifyContent: 'flex-start' }}>
                <FormControl variant="outlined" size="small" sx={{ minWidth: 120, maxHeight: 40, backgroundColor: '#e0f2f1', borderRadius: 1 }}>
                  <InputLabel sx={{ color: '#004d40' }}>Start Year</InputLabel>
                  <Select
                    value={startYear ?? ''}
                    onChange={handleStartYearChange}
                    label="Start Year"
                    MenuProps={{ PaperProps: { style: { maxHeight: 300 } } }}
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
                    MenuProps={{ PaperProps: { style: { maxHeight: 300 } } }}
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
                <Typography variant="body1" color="error" align="center">
                  {error}
                </Typography>
              ) : (
                <TableContainer component={Paper} sx={{ maxHeight: 500, overflow: 'auto' }}>
                  <Table size="small" stickyHeader aria-label="skew table">
                    <TableHead sx={{ backgroundColor: '#002060' }}>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 'bold', color: '#002060' }}>Year</TableCell>
                        <TableCell sx={{ fontWeight: 'bold', color: '#002060' }}>Total Deal Count</TableCell>
                        <TableCell sx={{ fontWeight: 'bold', color: '#002060' }}>Positively Performing Deals (%)</TableCell>
                        <TableCell sx={{ fontWeight: 'bold', color: '#002060' }}>Negatively Performing Deals (%)</TableCell>
                        <TableCell sx={{ fontWeight: 'bold', color: '#002060' }}>Average Return (Positively) (%)</TableCell>
                        <TableCell sx={{ fontWeight: 'bold', color: '#002060' }}>Average Return (Negatively) (%)</TableCell>
                        <TableCell sx={{ fontWeight: 'bold', color: '#002060' }}>Expected Returns (%)</TableCell>
                        <TableCell sx={{ fontWeight: 'bold', color: '#002060' }}>Long Opportunity Value</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {filteredData.map((row) => (
                        <TableRow key={row.Year}>
                          <TableCell>{row.Year}</TableCell>
                          <TableCell>{row.Total_Deal_Count}</TableCell>
                          <TableCell>{row.Positively_Performing_Deals_Percentage.toFixed(0)}%</TableCell>
                          <TableCell>{row.Negatively_Performing_Deals_Percentage.toFixed(0)}%</TableCell>
                          <TableCell>{row["Average_T+1M_Abs_Return_of_Positively"].toFixed(1)}%</TableCell>
                          <TableCell>{row["Average_T+1M_Abs_Return_of_Negatively"].toFixed(1)}%</TableCell>
                          <TableCell>{row.Expected_Returns.toFixed(1)}%</TableCell>
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
          </CardContent>
        </Card>
      </Container>

      <Snackbar open={openSnackbar} autoHideDuration={6000} onClose={handleCloseSnackbar}>
        <Alert onClose={handleCloseSnackbar} severity="warning" sx={{ width: '100%' }}>
          End Year should not be less than Start Year!
        </Alert>
      </Snackbar>

    </>
  );
};

export default SkewMain;
