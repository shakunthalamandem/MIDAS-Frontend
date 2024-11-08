import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import {
  Box, Typography,
  CircularProgress, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, Container,
  Card, CardContent
} from '@mui/material';

// Define the SectorStatistics type based on the structure of the API response
interface SectorStatistics {
  Sector: string;
  Total_Deal_Count: number;
  Positively_Performing_Deals_Percentage: number;
  Negatively_Performing_Deals_Percentage: number;
  "Average_T+1M_Abs_Return_of_Positively": number;
  "Average_T+1M_Abs_Return_of_Negatively": number;
  Expected_Returns: number;
  Long_Opportunity_Value: number;
}

const SectorSkewData: React.FC = () => {
  const [sectorStatistics, setSectorStatistics] = useState<SectorStatistics[]>([]);
  const [filteredData, setFilteredData] = useState<SectorStatistics[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch sector data from the API
  const fetchSectorData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get<{ Sector_Statistics: SectorStatistics[] }>("http://192.168.1.59:9000/api/skewtable/calculations/");
      setSectorStatistics(response.data.Sector_Statistics);
      setFilteredData(response.data.Sector_Statistics); // Initialize filtered data with all sectors
    } catch (error) {
      console.error("Error fetching sector data:", error);
      setError("Failed to fetch sector data. Please try again later.");
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch data when the component is mounted
  useEffect(() => {
    fetchSectorData();
  }, [fetchSectorData]);

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
                  color: "#33333",
                  fontWeight: "bold",
                }}
              >
                Sector Performance Skew Analysis              </Typography>

              {loading ? (
                <Box display="flex" justifyContent="center" alignItems="center">
                  <CircularProgress />
                </Box>
              ) : error ? (
                <Typography variant="body1" color="error" align="center">
                  {error}
                </Typography>
              ) : (
                <TableContainer component={Paper} sx={{ maxHeight: 600, overflow: 'auto' }}>
                  <Table size="small" stickyHeader aria-label="skew table">
                    <TableHead sx={{ backgroundColor: '#002060' }}>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 'bold', color: '#002060' }}>Sector</TableCell>
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
                        <TableRow key={row.Sector}>
                          <TableCell>{row.Sector}</TableCell>
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


    </>
  );
};

export default SectorSkewData;
