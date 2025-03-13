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

interface ConvertsSectorTableDataProps {
  data: {
    Yearwise: { [year: string]: TableData };
    yearwise_total: TableData;
  };
}

const formatNumber = (value: number): string => {
  if (Math.abs(value) >= 1e9) return `$${(value / 1e9).toFixed(0)}B`;
  if (Math.abs(value) >= 1e6) return `$${(value / 1e6).toFixed(0)}M`;
  if (Math.abs(value) >= 1e3) return `$${(value / 1e3).toFixed(0)}K`;
  return `$${value}`;
};

const ConvertsSectorTableData: React.FC<ConvertsSectorTableDataProps> = ({ data }) => {
  if (!data?.Yearwise || !data?.yearwise_total) return <div>No data available</div>;

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
              <TableCell key={column} sx={{ fontWeight: "bold", textAlign: "left", padding: "4px 8px", fontSize: "0.875rem", bgcolor: "#002060", color: "#FFFFFF" }}>
                {column}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {Object.entries(data.Yearwise).map(([year, row]) => (
            <TableRow key={year}>
              <TableCell sx={{ padding: "4px 8px" }}>{year }</TableCell>
              <TableCell sx={{ padding: "4px 8px" }}>{row.Total_Deal_Count}</TableCell>
              <TableCell sx={{ padding: "4px 8px" }}>{formatNumber(row.Total_Deal_Volume)}</TableCell>
              <TableCell sx={{ padding: "4px 8px" }}>{row.Deal_count_without_nulls}</TableCell>
              <TableCell sx={{ padding: "4px 8px" }}>{formatNumber(row.Deal_volume_without_nulls)}</TableCell>
              <TableCell sx={{ padding: "4px 8px" }}>{row.Positively_Performing_Deals_Percentage.toFixed(1)}%</TableCell>
              <TableCell sx={{ padding: "4px 8px" }}>{row.Negatively_Performing_Deals_Percentage.toFixed(1)}%</TableCell>
              <TableCell sx={{ padding: "4px 8px" }}>{row.Average_T1M_Abs_Return_of_Positively.toFixed(2)}%</TableCell>
              <TableCell sx={{ padding: "4px 8px" }}>{row.Average_T1M_Abs_Return_of_Negatively.toFixed(2)}%</TableCell>
              <TableCell sx={{ padding: "4px 8px" }}>{row.Expected_Returns_Excess.toFixed(1)}%</TableCell>
              <TableCell sx={{ padding: "4px 8px" }}>{formatNumber(row.Long_Opportunity_Value)}</TableCell>
            </TableRow>
          ))}
          <TableRow sx={{ backgroundColor: '#f0f4ff' }}>
            <TableCell sx={{ fontWeight: 'bold' ,padding: " 8px" }}>Total</TableCell>
            <TableCell sx={{ fontWeight: 'bold' ,padding: " 8px" }}>{data.yearwise_total.Total_Deal_Count}</TableCell>
            <TableCell sx={{ fontWeight: 'bold' ,padding: " 8px" }}>{formatNumber(data.yearwise_total.Total_Deal_Volume)}</TableCell>
            <TableCell sx={{ fontWeight: 'bold' ,padding: " 8px" }}>{data.yearwise_total.Deal_count_without_nulls}</TableCell>
            <TableCell sx={{ fontWeight: 'bold' ,padding: " 8px" }}>{formatNumber(data.yearwise_total.Deal_volume_without_nulls)}</TableCell>
            <TableCell sx={{ fontWeight: 'bold' ,padding: " 8px" }}>{data.yearwise_total.Positively_Performing_Deals_Percentage.toFixed(1)}%</TableCell>
            <TableCell sx={{ fontWeight: 'bold' ,padding: " 8px" }}>{data.yearwise_total.Negatively_Performing_Deals_Percentage.toFixed(1)}%</TableCell>
            <TableCell sx={{ fontWeight: 'bold' ,padding: " 8px" }}>{data.yearwise_total.Average_T1M_Abs_Return_of_Positively.toFixed(2)}%</TableCell>
            <TableCell sx={{ fontWeight: 'bold' ,padding: " 8px" }}>{data.yearwise_total.Average_T1M_Abs_Return_of_Negatively.toFixed(2)}%</TableCell>
            <TableCell sx={{ fontWeight: 'bold' ,padding: " 8px" }}>{data.yearwise_total.Expected_Returns_Excess.toFixed(1)}%</TableCell>
            <TableCell sx={{ fontWeight: 'bold' ,padding: " 8px" }}>{formatNumber(data.yearwise_total.Long_Opportunity_Value)}</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default ConvertsSectorTableData;