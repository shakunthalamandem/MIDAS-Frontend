import React from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';

// Type definition for the table data
interface TableData {
  Total_Deal_Count: number;
  Total_Deal_Volume: number;
  Deal_count_without_nulls: number;
  Deal_volume_without_nulls: number;
  Positively_Performing_Deals_Percentage: number;
  Negatively_Performing_Deals_Percentage: number;
  Average_T1M_Abs_Return_of_Positively: number;
  Average_T1M_Abs_Return_of_Negatively: number;
  Expected_Returns_Excess: number;
  Long_Opportunity_Value: number;
}

interface HySectorTableDataProps {
  data: {
    Sectorwise: { [sector: string]: TableData };
    sectorwise_total: {
      Total_Deal_Count_Sum: number;
      Total_Deal_Volume_Sum: number;
      Total_Deal_Count_Sum_without_null: number;
      Total_Deal_Volume_Sum_without_null: number;
      Total_Positive_Performing_Deals_Percentage: number;
      Total_Negative_Performing_Deals_Percentage: number;
      Total_Returns_Positive: number;
      Total_Returns_Negative: number;
      Total_Expected_Returns_Excess: number;
      Total_Long_Opportunity_Value: number;
    };
  };
}

const formatNumber = (value: number): string => {
  const absValue = Math.abs(value); // Get the absolute value for formatting
  let formattedValue: string;

  if (absValue >= 1e9) {
    formattedValue = `${(absValue / 1e9).toFixed(0)}B`; // Format billions
  } else if (absValue >= 1e6) {
    formattedValue = `${(absValue / 1e6).toFixed(0)}M`; // Format millions
  } else if (absValue >= 1e3) {
    formattedValue = `${(absValue / 1e3).toFixed(0)}K`; // Format thousands
  } else {
    formattedValue = absValue.toString(); // Default format
  }

  return value < 0 ? `-$${formattedValue}` : `$${formattedValue}`; // Ensure dollar sign is correctly placed
};

const HyYearlyTableData: React.FC<HySectorTableDataProps> = ({ data }) => {
  const sectorwiseData = data?.Sectorwise;
  const sectorwiseTotal = data?.sectorwise_total;

  if (!sectorwiseData || !sectorwiseTotal) {
    return <div>No data available</div>;
  }

  // Columns for the table
  const columns = [
    'Sector',
    "Total Deal Count",
    "Total Deal Volume ($)",
    "Deal Count Without Nulls",
    "Deal Volume Without Nulls",
    "% of Positively Performing Deals",
    "% of Negatively Performing Deals",
    "Weighted Avg T+1M Return (Positive Deals)",
    "Weighted Avg T+1M Return (Negative Deals)",
    "Expected Returns",
    "Opportunity Value (T + 1M)",
  ];

  // Extract totals from sectorwiseTotal
  const totalDealCount = sectorwiseTotal.Total_Deal_Count_Sum || 0;
  const totalDealVolume = sectorwiseTotal.Total_Deal_Volume_Sum || 0;
  const totalDealCount_without_nulls = sectorwiseTotal.Total_Deal_Count_Sum_without_null || 0;
  const totalDealVolume_without_nulls = sectorwiseTotal.Total_Deal_Volume_Sum_without_null || 0;
  const avgPositivelyPerformingDealsPercentage = sectorwiseTotal.Total_Positive_Performing_Deals_Percentage || 0;
  const avgNegativelyPerformingDealsPercentage = sectorwiseTotal.Total_Negative_Performing_Deals_Percentage || 0;

  const avgExpectedReturnsExcess = sectorwiseTotal.Total_Expected_Returns_Excess || 0;
  const totalLongOpportunityValue = sectorwiseTotal.Total_Long_Opportunity_Value || 0;


  const avgAvgT1MAbsReturnPositively = sectorwiseTotal.Total_Returns_Positive || 0;
  const avgAvgT1MAbsReturnNegatively = sectorwiseTotal.Total_Returns_Negative || 0;







  // "Total_Deal_Count_Sum": 6425,
  // "Total_Deal_Volume_Sum": 4562813847996,
  // "Total_Deal_Count_Sum_Without_Nulls": 4678,
  // "Total_Deal_Volume_Sum_Without_Nulls": 3639561435432,
  // "Total_Positive_Performing_Deals_Percentage": 97.06,
  // "Total_Negative_Performing_Deals_Percentage": 2.94,
  // "Total_Expected_Returns_Excess": 0.86,
  // "Total_Returns_Positive": 0.73,
  // "Total_Returns_Negatively": -2.01
  






  return (
    <TableContainer component={Paper} sx={{ marginTop: 2, marginBottom: 4 }}>
      <Table>
        <TableHead>
          <TableRow>
            {columns.map((column) => (
              <TableCell
                key={column}
                sx={{
                  fontWeight: 'bold',
                  textAlign: 'left',
                  padding: '4px 8px',
                  fontSize: '0.875rem',
                  bgcolor: '#002060',
                  color: '#FFFFFF',
                }}
              >
                {column}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {/* Render data rows */}
          {Object.keys(sectorwiseData).map((sector) => {
            // Handle the 'null' sector key
            const sectorName = sector === 'null' ? 'Unknown Sector' : sector;
            const row = sectorwiseData[sector];
            return (
              <TableRow key={sector}>
                <TableCell sx={{ padding: '4px 8px', width: '200px' }}>{sectorName}</TableCell>
                <TableCell sx={{ padding: '4px 8px' }}>{row.Total_Deal_Count}</TableCell>
                <TableCell sx={{ padding: '4px 8px' }}>{formatNumber(row.Total_Deal_Volume)}</TableCell>
                <TableCell sx={{ padding: '4px 8px' }}>{row.Deal_count_without_nulls}</TableCell>
                <TableCell sx={{ padding: '4px 8px' }}>{formatNumber(row.Deal_volume_without_nulls)}</TableCell>
                <TableCell sx={{ padding: '4px 8px' }}>
                  {row.Positively_Performing_Deals_Percentage.toFixed(0)}%
                </TableCell>
                <TableCell sx={{ padding: '4px 8px' }}>
                  {row.Negatively_Performing_Deals_Percentage.toFixed(0)}%
                </TableCell>
                <TableCell sx={{ padding: '4px 8px' }}>
                  {row.Average_T1M_Abs_Return_of_Positively.toFixed(1)}%
                </TableCell>
                <TableCell sx={{ padding: '4px 8px' }}>
                  {row.Average_T1M_Abs_Return_of_Negatively.toFixed(1)}%
                </TableCell>
                <TableCell sx={{ padding: '4px 8px' }}>
                  {row.Expected_Returns_Excess.toFixed(1)}%
                </TableCell>
                <TableCell sx={{ padding: '4px 8px' }}>{formatNumber(row.Long_Opportunity_Value)}</TableCell>
              </TableRow>
            );
          })}

          {/* Last row with sum and averages */}
          <TableRow key="total">
            <TableCell sx={{ padding: '4px 8px', fontWeight: 'bold', textAlign: 'center' }}>Total</TableCell>
            <TableCell sx={{ padding: '4px 8px', fontWeight: 'bold' }}>{totalDealCount}</TableCell>
            <TableCell sx={{ padding: '4px 8px', fontWeight: 'bold' }}>{formatNumber(totalDealVolume)}</TableCell>
            <TableCell sx={{ padding: '4px 8px', fontWeight: 'bold' }}>{totalDealCount_without_nulls}</TableCell>
            <TableCell sx={{ padding: '4px 8px', fontWeight: 'bold' }}>{formatNumber(totalDealVolume_without_nulls)}</TableCell>
            <TableCell sx={{ padding: '4px 8px', fontWeight: 'bold' }}>
              {avgPositivelyPerformingDealsPercentage.toFixed(0)}%
            </TableCell>
            <TableCell sx={{ padding: '4px 8px', fontWeight: 'bold' }}>
              {avgNegativelyPerformingDealsPercentage.toFixed(0)}%
            </TableCell>
            <TableCell sx={{ padding: '4px 8px', fontWeight: 'bold' }}>
              {avgAvgT1MAbsReturnPositively.toFixed(1)}%
            </TableCell>
            <TableCell sx={{ padding: '4px 8px', fontWeight: 'bold' }}>
              {avgAvgT1MAbsReturnNegatively.toFixed(1)}%
            </TableCell>
            <TableCell sx={{ padding: '4px 8px', fontWeight: 'bold' }}>
              {avgExpectedReturnsExcess.toFixed(1)}%
            </TableCell>
            <TableCell sx={{ padding: '4px 8px', fontWeight: 'bold' }}>
              {formatNumber(totalLongOpportunityValue)}
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default HyYearlyTableData;
