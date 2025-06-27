import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Box,
} from '@mui/material';

interface CountryData {
  country_code: string;
  Total_Deal_Count: number;
  Total_Deal_Volume: number;
  Positively_Performing_Deals_Percentage: number;
  Negatively_Performing_Deals_Percentage: number;
  Average_T1M_Abs_Return_of_Positively: number;
  Average_T1M_Abs_Return_of_Negatively: number;
  Expected_Returns_Excess: number;
  Long_Opportunity_Value: number;
}

interface Props {
  data: CountryData[] | null;
}

const formatNumber = (value: number): string => {
  const absValue = Math.abs(value);
  let formattedValue: string;

  if (absValue >= 1e9) formattedValue = `${(absValue / 1e9).toFixed(0)}B`;
  else if (absValue >= 1e6) formattedValue = `${(absValue / 1e6).toFixed(0)}M`;
  else if (absValue >= 1e3) formattedValue = `${(absValue / 1e3).toFixed(0)}K`;
  else formattedValue = absValue.toString();

  return value < 0 ? `-$${formattedValue}` : `$${formattedValue}`;
};

const CountryTableData: React.FC<Props> = ({ data }) => {
  if (!data || data.length === 0) {
    return <div>No data available</div>;
  }

  const columns = [
    "Country",
    "Total Deal Count",
    "Total Deal Volume ($)",
    "% Pos. Deals",
    "% Neg. Deals",
    "Avg. T+1M Return (Pos)",
    "Avg. T+1M Return (Neg)",
    "Expected Return Excess",
    "Opportunity Value",
  ];

  return (
    <TableContainer component={Paper} sx={{ marginTop: 2, marginBottom: 4 }}>
      <Table>
        <TableHead>
          <TableRow>
            {columns.map((col) => (
              <TableCell
                key={col}
                sx={{
                  fontWeight: "bold",
                  textAlign: "left",
                  padding: "4px 8px",
                  fontSize: "0.875rem",
                  bgcolor: "#002060",
                  color: "#FFFFFF",
                }}
              >
                {col}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {data.map((row) => (
            <TableRow key={row.country_code} hover>
              <TableCell sx={{ padding: "4px 8px", fontSize: "0.875rem" }}>{row.country_code}</TableCell>
              <TableCell sx={{ padding: "4px 8px", fontSize: "0.875rem" }}>{row.Total_Deal_Count}</TableCell>
              <TableCell sx={{ padding: "4px 8px", fontSize: "0.875rem" }}>{formatNumber(row.Total_Deal_Volume)}</TableCell>
              <TableCell sx={{ padding: "4px 8px", fontSize: "0.875rem" }}>{row.Positively_Performing_Deals_Percentage.toFixed(0)}%</TableCell>
              <TableCell sx={{ padding: "4px 8px", fontSize: "0.875rem" }}>{row.Negatively_Performing_Deals_Percentage.toFixed(0)}%</TableCell>
              <TableCell sx={{ padding: "4px 8px", fontSize: "0.875rem" }}>{row.Average_T1M_Abs_Return_of_Positively.toFixed(1)}%</TableCell>
              <TableCell sx={{ padding: "4px 8px", fontSize: "0.875rem" }}>{row.Average_T1M_Abs_Return_of_Negatively.toFixed(1)}%</TableCell>
              <TableCell sx={{ padding: "4px 8px", fontSize: "0.875rem" }}>{row.Expected_Returns_Excess.toFixed(1)}%</TableCell>
              <TableCell sx={{ padding: "4px 8px", fontSize: "0.875rem" }}>{formatNumber(row.Long_Opportunity_Value)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default CountryTableData;
