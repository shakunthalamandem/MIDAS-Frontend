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
    sectorwise_total: TableData;
  };
}

const formatNumber = (value: number): string => {
  if (Math.abs(value) >= 1e9) return `$${(value / 1e9).toFixed(0)}B`;
  if (Math.abs(value) >= 1e6) return `$${(value / 1e6).toFixed(0)}M`;
  if (Math.abs(value) >= 1e3) return `$${(value / 1e3).toFixed(0)}K`;
  return `$${value}`;
};

const ConvertYearlyTableData: React.FC<HySectorTableDataProps> = ({ data }) => {
  if (!data?.Sectorwise || !data?.sectorwise_total) return <div>No data available</div>;

  const columns = [
    "Year",
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

  return (
    <TableContainer component={Paper} sx={{ marginTop: 2, marginBottom: 4 }}>
      <Table>
        <TableHead>
          <TableRow>
            {columns.map((column) => (
              <TableCell key={column} sx={{ fontWeight: 'bold', bgcolor: '#002060', color: '#FFF' }}>
                {column}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {Object.entries(data.Sectorwise).map(([sector, row]) => (
            <TableRow key={sector}>
              <TableCell>{sector || 'Unknown Sector'}</TableCell>
              <TableCell>{row.Total_Deal_Count}</TableCell>
              <TableCell>{formatNumber(row.Total_Deal_Volume)}</TableCell>
              <TableCell>{row.Deal_count_without_nulls}</TableCell>
              <TableCell>{formatNumber(row.Deal_volume_without_nulls)}</TableCell>
              <TableCell>{row.Positively_Performing_Deals_Percentage.toFixed(1)}%</TableCell>
              <TableCell>{row.Negatively_Performing_Deals_Percentage.toFixed(1)}%</TableCell>
              <TableCell>{row.Average_T1M_Abs_Return_of_Positively.toFixed(2)}%</TableCell>
              <TableCell>{row.Average_T1M_Abs_Return_of_Negatively.toFixed(2)}%</TableCell>
              <TableCell>{row.Expected_Returns_Excess.toFixed(1)}%</TableCell>
              <TableCell>{formatNumber(row.Long_Opportunity_Value)}</TableCell>
            </TableRow>
          ))}
          <TableRow>
            <TableCell sx={{ fontWeight: 'bold' }}>Total</TableCell>
            <TableCell sx={{ fontWeight: 'bold' }}>{data.sectorwise_total.Total_Deal_Count}</TableCell>
            <TableCell sx={{ fontWeight: 'bold' }}>{formatNumber(data.sectorwise_total.Total_Deal_Volume)}</TableCell>
            <TableCell sx={{ fontWeight: 'bold' }}>{data.sectorwise_total.Deal_count_without_nulls}</TableCell>
            <TableCell sx={{ fontWeight: 'bold' }}>{formatNumber(data.sectorwise_total.Deal_volume_without_nulls)}</TableCell>
            <TableCell sx={{ fontWeight: 'bold' }}>{data.sectorwise_total.Positively_Performing_Deals_Percentage.toFixed(1)}%</TableCell>
            <TableCell sx={{ fontWeight: 'bold' }}>{data.sectorwise_total.Negatively_Performing_Deals_Percentage.toFixed(1)}%</TableCell>
            <TableCell sx={{ fontWeight: 'bold' }}>{data.sectorwise_total.Average_T1M_Abs_Return_of_Positively.toFixed(2)}%</TableCell>
            <TableCell sx={{ fontWeight: 'bold' }}>{data.sectorwise_total.Average_T1M_Abs_Return_of_Negatively.toFixed(2)}%</TableCell>
            <TableCell sx={{ fontWeight: 'bold' }}>{data.sectorwise_total.Expected_Returns_Excess.toFixed(1)}%</TableCell>
            <TableCell sx={{ fontWeight: 'bold' }}>{formatNumber(data.sectorwise_total.Long_Opportunity_Value)}</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default ConvertYearlyTableData;