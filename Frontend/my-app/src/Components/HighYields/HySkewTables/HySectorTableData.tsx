import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from "@mui/material";

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
    Yearwise: { [year: string]: TableData };
    yearwise_total: {
      Total_Deal_Count_Sum: number;
      Total_Deal_Volume_Sum: number;
      Total_Deal_Count_Sum_Without_Nulls: number;
      Total_Deal_Volume_Sum_Without_Nulls: number;
      Total_Positive_Performing_Deals_Percentage: number;
      Total_Negative_Performing_Deals_Percentage: number;
      Total_Returns_Positively: number;
      Total_Returns_Negatively: number;
      Total_Expected_Returns_Excess: number;
      Total_Long_Opportunity_Value: number;
    };
  };
}

// Function to format numbers (e.g., 1,200,000 -> 1.2M)
const formatNumber = (value: number): string => {
  const absValue = Math.abs(value);
  let formattedValue: string;

  if (absValue >= 1e9) {
    formattedValue = `${(absValue / 1e9).toFixed(0)}B`;
  } else if (absValue >= 1e6) {
    formattedValue = `${(absValue / 1e6).toFixed(0)}M`;
  } else if (absValue >= 1e3) {
    formattedValue = `${(absValue / 1e3).toFixed(0)}K`;
  } else {
    formattedValue = absValue.toString();
  }

  return value < 0 ? `-$${formattedValue}` : `$${formattedValue}`;
};

const HySectorTableData: React.FC<HySectorTableDataProps> = ({ data }) => {
  // Ensure data exists before rendering
  if (!data?.Yearwise || !data?.yearwise_total || Object.keys(data.Yearwise).length === 0) {
    return <div>No data available</div>;
  }

  // Extract the Yearwise and Total data
  const { Yearwise: yearwiseData, yearwise_total: yearwiseTotal } = data;

  // Define columns
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
              <TableCell
                key={column}
                sx={{
                  fontWeight: "bold",
                  textAlign: "left",
                  padding: "4px 8px",
                  fontSize: "0.875rem",
                  bgcolor: "#002060",
                  color: "#FFFFFF",
                }}
              >
                {column}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {/* Render yearly data rows */}
          {Object.entries(yearwiseData).map(([year, row]) => (
            <TableRow key={year}>
              <TableCell sx={{ padding: "4px 8px" }}>{year}</TableCell>
              <TableCell sx={{ padding: "4px 8px" }}>{row.Total_Deal_Count}</TableCell>
              <TableCell sx={{ padding: "4px 8px" }}>{formatNumber(row.Total_Deal_Volume)}</TableCell>
              <TableCell sx={{ padding: "4px 8px" }}>{row.Deal_count_without_nulls}</TableCell>
              <TableCell sx={{ padding: "4px 8px" }}>{formatNumber(row.Deal_volume_without_nulls)}</TableCell>
              <TableCell sx={{ padding: "4px 8px" }}>
                {row.Positively_Performing_Deals_Percentage?.toFixed(0) ?? "0"}%
              </TableCell>
              <TableCell sx={{ padding: "4px 8px" }}>
                {row.Negatively_Performing_Deals_Percentage?.toFixed(0) ?? "0"}%
              </TableCell>
              <TableCell sx={{ padding: "4px 8px" }}>
                {row.Average_T1M_Abs_Return_of_Positively?.toFixed(1) ?? "0"}%
              </TableCell>
              <TableCell sx={{ padding: "4px 8px" }}>
                {row.Average_T1M_Abs_Return_of_Negatively?.toFixed(1) ?? "0"}%
              </TableCell>
              <TableCell sx={{ padding: "4px 8px" }}>
                {row.Expected_Returns_Excess?.toFixed(1) ?? "0"}%
              </TableCell>
              <TableCell sx={{ padding: "4px 8px" }}>{formatNumber(row.Long_Opportunity_Value)}</TableCell>
            </TableRow>
          ))}

          {/* Total row */}
          <TableRow key="total">
            <TableCell sx={{ padding: "4px 8px", fontWeight: "bold", textAlign: "center" }}>
              Total
            </TableCell>
            <TableCell sx={{ padding: "4px 8px", fontWeight: "bold" }}>
              {yearwiseTotal.Total_Deal_Count_Sum}
            </TableCell>
            <TableCell sx={{ padding: "4px 8px", fontWeight: "bold" }}>
              {formatNumber(yearwiseTotal.Total_Deal_Volume_Sum)}
            </TableCell>
            <TableCell sx={{ padding: "4px 8px", fontWeight: "bold" }}>
              {yearwiseTotal.Total_Deal_Count_Sum_Without_Nulls}
            </TableCell>
            <TableCell sx={{ padding: "4px 8px", fontWeight: "bold" }}>
              {formatNumber(yearwiseTotal.Total_Deal_Volume_Sum_Without_Nulls)}
            </TableCell>
            <TableCell sx={{ padding: "4px 8px", fontWeight: "bold" }}>
              {yearwiseTotal.Total_Positive_Performing_Deals_Percentage?.toFixed(0) ?? "0"}%
            </TableCell>
            <TableCell sx={{ padding: "4px 8px", fontWeight: "bold" }}>
              {yearwiseTotal.Total_Negative_Performing_Deals_Percentage?.toFixed(0) ?? "0"}%
            </TableCell>
            <TableCell sx={{ padding: "4px 8px", fontWeight: "bold" }}>
              {yearwiseTotal.Total_Returns_Positively?.toFixed(1) ?? "0"}%
            </TableCell>
            <TableCell sx={{ padding: "4px 8px", fontWeight: "bold" }}>
              {yearwiseTotal.Total_Returns_Negatively?.toFixed(1) ?? "0"}%
            </TableCell>
            <TableCell sx={{ padding: "4px 8px", fontWeight: "bold" }}>
              {yearwiseTotal.Total_Expected_Returns_Excess?.toFixed(1) ?? "0"}%
            </TableCell>
            <TableCell sx={{ padding: "4px 8px", fontWeight: "bold" }}>
              {formatNumber(yearwiseTotal.Total_Long_Opportunity_Value)}
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default HySectorTableData;
