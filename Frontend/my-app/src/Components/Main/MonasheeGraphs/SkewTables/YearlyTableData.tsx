import React from 'react';
import {
  Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, Box
} from '@mui/material';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';

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
  onRowClick?: (sector: string) => void;
}

const formatNumber = (value: number, decimals: number = 0): string => {
  const absValue = Math.abs(value);
  let formattedValue: string;

  if (absValue >= 1e9) {
    formattedValue = `${(absValue / 1e9).toFixed(decimals)}B`;
  } else if (absValue >= 1e6) {
    formattedValue = `${(absValue / 1e6).toFixed(decimals)}M`;
  } else if (absValue >= 1e3) {
    formattedValue = `${(absValue / 1e3).toFixed(decimals)}K`;
  } else {
    formattedValue = decimals > 0 ? absValue.toFixed(decimals) : absValue.toString();
  }

  return value < 0 ? `-$${formattedValue}` : `$${formattedValue}`;
};

const YearlyTableData: React.FC<SectorTableDataProps> = ({ data, onRowClick }) => {
  const sectorwiseData = data?.Sectorwise;
  const sectorwiseTotal = data?.sectorwise_total;

  if (!sectorwiseData || !sectorwiseTotal) return <div>No data available</div>;

  const columns = [
    'Sector', 'Total Deal Count', 'Total Deal Volume ($)',
    '% of Positively Performing Deals ', '% of Negatively Performing Deals ',
    'Weighted Avg T+1M Excess Return (Positive Deals)',
    'Weighted Avg T+1M Excess Return (Negative Deals)',
    'Expected Returns Excess', 'Opportunity Value (T + 1M Excess)'
  ];

  const {
    Total_Deal_Count_Sum: totalDealCount = 0,
    Total_Deal_Volume_Sum: totalDealVolume = 0,
    Total_Postively_Performing_Deals: avgPositivelyPerformingDealsPercentage = 0,
    Total_Negatively_Performing_Deals: avgNegativelyPerformingDealsPercentage = 0,
    Total_Returns_positively: avgAvgT1MAbsReturnPositively = 0,
    Total_Returns_negatively: avgAvgT1MAbsReturnNegatively = 0,
    Total_Expected_returns_excess: avgExpectedReturnsExcess = 0,
    Total_Long_Opportunity_Value: totalLongOpportunityValue = 0
  } = sectorwiseTotal;

  return (
    <TableContainer component={Paper} sx={{ marginTop: 2, marginBottom: 4 }}>
      <Table>
        <TableHead>
          <TableRow>
            {columns.map((col) => (
              <TableCell key={col} sx={{
                fontWeight: 'bold',
                textAlign: 'left',
                padding: '4px 8px',
                fontSize: '0.875rem',
                bgcolor: '#002060',
                color: '#FFFFFF'
              }}>
                {col}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {Object.entries(sectorwiseData).map(([sector, row]) => (
            <TableRow key={sector} hover>
              <TableCell sx={{ padding: '4px 8px', fontSize: '0.875rem', width: '200px' }}>{sector}</TableCell>
              <TableCell sx={{ padding: '4px 8px', fontSize: '0.875rem' }}>{row.Total_Deal_Count}</TableCell>
              <TableCell sx={{ padding: '4px 8px', fontSize: '0.875rem' }}>{formatNumber(row.Total_Deal_Volume)}</TableCell>
              <TableCell sx={{ padding: '4px 8px', fontSize: '0.875rem' }}>{row.Positively_Performing_Deals_Percentage.toFixed(0)}%</TableCell>
              <TableCell sx={{ padding: '4px 8px', fontSize: '0.875rem' }}>{row.Negatively_Performing_Deals_Percentage.toFixed(0)}%</TableCell>
              <TableCell sx={{ padding: '4px 8px', fontSize: '0.875rem' }}>{row.Average_T1M_Abs_Return_of_Positively.toFixed(1)}%</TableCell>
              <TableCell sx={{ padding: '4px 8px', fontSize: '0.875rem' }}>{row.Average_T1M_Abs_Return_of_Negatively.toFixed(1)}%</TableCell>
              <TableCell sx={{ padding: '4px 8px', fontSize: '0.875rem' }}>{row.Expected_Returns_Excess.toFixed(1)}%</TableCell>
              <TableCell sx={{ padding: '4px 8px', fontSize: '0.875rem' }}>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      width: '100%',
                    }}
                  >
                    <span>{formatNumber(row.Long_Opportunity_Value, 1)}</span>
                    <Box
                      onClick={() => onRowClick?.(sector)}
                      sx={{ cursor: 'pointer', pl: 1 }}
                    >
                      <MoreHorizIcon fontSize="small" />
                    </Box>
                  </Box>
                </TableCell>
            </TableRow>
          ))}
          {/* Total row */}
          <TableRow key="total">
            <TableCell sx={{ padding: '4px 8px', fontWeight: 'bold', fontSize: '0.875rem', textAlign: 'center' }}>Total</TableCell>
            <TableCell sx={{ padding: '4px 8px', fontWeight: 'bold', fontSize: '0.875rem' }}>{totalDealCount}</TableCell>
            <TableCell sx={{ padding: '4px 8px', fontWeight: 'bold', fontSize: '0.875rem' }}>{formatNumber(totalDealVolume)}</TableCell>
            <TableCell sx={{ padding: '4px 8px', fontWeight: 'bold', fontSize: '0.875rem' }}>{avgPositivelyPerformingDealsPercentage.toFixed(0)}%</TableCell>
            <TableCell sx={{ padding: '4px 8px', fontWeight: 'bold', fontSize: '0.875rem' }}>{avgNegativelyPerformingDealsPercentage.toFixed(0)}%</TableCell>
            <TableCell sx={{ padding: '4px 8px', fontWeight: 'bold', fontSize: '0.875rem' }}>{avgAvgT1MAbsReturnPositively.toFixed(1)}%</TableCell>
            <TableCell sx={{ padding: '4px 8px', fontWeight: 'bold', fontSize: '0.875rem' }}>{avgAvgT1MAbsReturnNegatively.toFixed(1)}%</TableCell>
            <TableCell sx={{ padding: '4px 8px', fontWeight: 'bold', fontSize: '0.875rem' }}>{avgExpectedReturnsExcess.toFixed(1)}%</TableCell>
            <TableCell sx={{ padding: '4px 8px', fontWeight: 'bold', fontSize: '0.875rem' }}>{formatNumber(totalLongOpportunityValue, 1)}</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default YearlyTableData;
