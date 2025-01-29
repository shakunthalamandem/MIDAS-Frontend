import React from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';

// Type definition for the table data
interface TableData {
  Total_Deal_Count: number;
  Total_Deal_Volume: number;
  Positively_Performing_Deals_Percentage: number;
  Negatively_Performing_Deals_Percentage: number;
  Average_T1M_Abs_Return_of_Positively: number;
  Average_T1M_Abs_Return_of_Negatively: number;
  Expected_Returns_Excess: number;
  Long_Opportunity_Value: number;
}

interface SectorTableDataProps {
  data: {
    Sectorwise: { [sector: string]: TableData };
    sectorwise_total: {
      Total_Deal_Count_Sum: number;
      Total_Deal_Volume_Sum: number;
      Total_Postively_Performing_Deals: number;
      Total_Negatively_Performing_Deals: number;
      Total_Returns_positively: number;
      Total_Returns_negatively: number;
      Total_Expected_returns_excess: number;
      Total_Long_Opportunity_Value: number;
    };
  };
}

const YearlyTableData: React.FC<SectorTableDataProps> = ({ data }) => {
  const sectorwiseData = data?.Sectorwise;
  const sectorwiseTotal = data?.sectorwise_total;

  if (!sectorwiseData || !sectorwiseTotal) {
    return <div>No data available</div>;
  }

  // Columns for the table
  const columns = [
    'Sector',
    'Total Deal Count',
    'Total Deal Volume ($)',
    '% of Positively Performing Deals ',
    '% of Negatively Performing Deals ',
    'Weighted Avg T+1M Excess Return (Positive Deals)',
    'Weighted Avg T+1M Excess Return (Negative Deals)',
    'Expected Returns Excess',
    'Opportunity Value (T + 1M Excess)',
  ];

  // Extract totals from sectorwiseTotal
  const totalDealCount = sectorwiseTotal.Total_Deal_Count_Sum || 0;
  const totalDealVolume = sectorwiseTotal.Total_Deal_Volume_Sum || 0;
  const avgPositivelyPerformingDealsPercentage = sectorwiseTotal.Total_Postively_Performing_Deals || 0;
  const avgNegativelyPerformingDealsPercentage = sectorwiseTotal.Total_Negatively_Performing_Deals || 0;
  const avgAvgT1MAbsReturnPositively = sectorwiseTotal.Total_Returns_positively || 0;
  const avgAvgT1MAbsReturnNegatively = sectorwiseTotal.Total_Returns_negatively || 0;
  const avgExpectedReturnsExcess = sectorwiseTotal.Total_Expected_returns_excess || 0;
  const totalLongOpportunityValue = sectorwiseTotal.Total_Long_Opportunity_Value || 0;

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
            const row = sectorwiseData[sector];
            return (
              <TableRow key={sector}>
                <TableCell sx={{ padding: '4px 8px', width: '200px' }}>{sector}</TableCell>
                <TableCell sx={{ padding: '4px 8px' }}>{row.Total_Deal_Count}</TableCell>
                <TableCell sx={{ padding: '4px 8px' }}>${row.Total_Deal_Volume.toFixed(0)}B</TableCell>
                <TableCell sx={{ padding: '4px 8px' }}>{row.Positively_Performing_Deals_Percentage.toFixed(0)}%</TableCell>
                <TableCell sx={{ padding: '4px 8px' }}>{row.Negatively_Performing_Deals_Percentage.toFixed(0)}%</TableCell>
                <TableCell sx={{ padding: '4px 8px' }}>{row.Average_T1M_Abs_Return_of_Positively.toFixed(1)}%</TableCell>
                <TableCell sx={{ padding: '4px 8px' }}>{row.Average_T1M_Abs_Return_of_Negatively.toFixed(1)}%</TableCell>
                <TableCell sx={{ padding: '4px 8px' }}>{row.Expected_Returns_Excess.toFixed(1)}%</TableCell>
                <TableCell sx={{ padding: '4px 8px' }}>${row.Long_Opportunity_Value.toFixed(0)}B</TableCell>
              </TableRow>
            );
          })}

          {/* Last row with sum and averages */}
          <TableRow key="total">
            <TableCell sx={{ padding: '4px 8px', fontWeight: 'bold', textAlign: 'center' }}>Total</TableCell>
            <TableCell sx={{ padding: '4px 8px', fontWeight: 'bold' }}>{totalDealCount}</TableCell>
            <TableCell sx={{ padding: '4px 8px', fontWeight: 'bold' }}>${totalDealVolume.toFixed(0)}B</TableCell>
            <TableCell sx={{ padding: '4px 8px', fontWeight: 'bold' }}>{avgPositivelyPerformingDealsPercentage.toFixed(0)}%</TableCell>
            <TableCell sx={{ padding: '4px 8px', fontWeight: 'bold' }}>{avgNegativelyPerformingDealsPercentage.toFixed(0)}%</TableCell>
            <TableCell sx={{ padding: '4px 8px', fontWeight: 'bold' }}>{avgAvgT1MAbsReturnPositively.toFixed(1)}%</TableCell>
            <TableCell sx={{ padding: '4px 8px', fontWeight: 'bold' }}>{avgAvgT1MAbsReturnNegatively.toFixed(1)}%</TableCell>
            <TableCell sx={{ padding: '4px 8px', fontWeight: 'bold' }}>{avgExpectedReturnsExcess.toFixed(1)}%</TableCell>
            <TableCell sx={{ padding: '4px 8px', fontWeight: 'bold' }}>${totalLongOpportunityValue.toFixed(0)}B</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default YearlyTableData;
