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
  Positively_Performing_Deals_Percentage: number;
  Negatively_Performing_Deals_Percentage: number;
  Average_T1M_Abs_Return_of_Positively: number;
  Average_T1M_Abs_Return_of_Negatively: number;
  Expected_Returns_Excess: number;
  Long_Opportunity_Value: number;
}

interface SectorTableDataProps {
  data: {
    Yearwise: { [year: string]: TableData }; // Data passed from parent component
    yearwise_total: {
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

const SectorTableData: React.FC<SectorTableDataProps> = ({ data }) => {
  // Extract the Yearwise data and Yearwise Total data
  const yearwiseData = data?.Yearwise;
  const yearwiseTotal = data?.yearwise_total;

  // Define columns for the table
  const columns = [
    "Year",
    "Total Deal Count",
    "Total Deal Volume ($)",
    "% of Positively Performing Deals ",
    "% of Negatively Performing Deals ",
    "Weighted Avg T+1M Excess Return (Positive Deals)",
    "Weighted Avg T+1M Excess Return (Negative Deals)",
    "Expected Returns Excess",
    "Opportunity Value (T + 1M Excess)",
  ];

  // Render the table only if Yearwise data exists
  if (!yearwiseData || !yearwiseTotal) {
    return <div>No data available</div>;
  }

  // Calculate the averages for the total row
  const avgPositivelyPerformingDealsPercentage =
    yearwiseTotal.Total_Postively_Performing_Deals || 0;
  const avgNegativelyPerformingDealsPercentage =
    yearwiseTotal.Total_Negatively_Performing_Deals || 0;
  const avgAvgT1MAbsReturnPositively =
    yearwiseTotal.Total_Returns_positively || 0;
  const avgAvgT1MAbsReturnNegatively =
    yearwiseTotal.Total_Returns_negatively || 0;
  const avgExpectedReturnsExcess =
    yearwiseTotal.Total_Expected_returns_excess || 0;
  const totalLongOpportunityValue =
    yearwiseTotal.Total_Long_Opportunity_Value || 0;

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
          {/* Render data rows */}
          {Object.keys(yearwiseData).map((year) => {
            const row = yearwiseData[year];
            return (
              <TableRow key={year}>
                <TableCell sx={{ padding: "4px 8px" }}>{year}</TableCell>
                <TableCell sx={{ padding: "4px 8px" }}>
                  {row.Total_Deal_Count}
                </TableCell>
                <TableCell sx={{ padding: "4px 8px" }}>
                  {formatNumber(row.Total_Deal_Volume)}
                </TableCell>
                <TableCell sx={{ padding: "4px 8px" }}>
                  {row.Positively_Performing_Deals_Percentage.toFixed(0)}%
                </TableCell>
                <TableCell sx={{ padding: "4px 8px" }}>
                  {row.Negatively_Performing_Deals_Percentage.toFixed(0)}%
                </TableCell>
                <TableCell sx={{ padding: "4px 8px" }}>
                  {row.Average_T1M_Abs_Return_of_Positively.toFixed(1)}%
                </TableCell>
                <TableCell sx={{ padding: "4px 8px" }}>
                  {row.Average_T1M_Abs_Return_of_Negatively.toFixed(1)}%
                </TableCell>
                <TableCell sx={{ padding: "4px 8px" }}>
                  {row.Expected_Returns_Excess.toFixed(1)}%
                </TableCell>
                <TableCell sx={{ padding: "4px 8px" }}>
                  {formatNumber(row.Long_Opportunity_Value)}
                </TableCell>
              </TableRow>
            );
          })}

          {/* Last row with sum and averages from yearwise_total */}
          <TableRow key="total">
            <TableCell
              sx={{
                padding: "4px 8px",
                fontWeight: "bold",
                textAlign: "center",
              }}
            >
              Total
            </TableCell>
            <TableCell sx={{ padding: "4px 8px", fontWeight: "bold" }}>
              {yearwiseTotal.Total_Deal_Count_Sum}
            </TableCell>

            <TableCell sx={{ padding: "4px 8px", fontWeight: "bold" }}>
              {formatNumber(yearwiseTotal.Total_Deal_Volume_Sum)}
            </TableCell>

            <TableCell sx={{ padding: "4px 8px", fontWeight: "bold" }}>
              {avgPositivelyPerformingDealsPercentage.toFixed(0)}%
            </TableCell>
            <TableCell sx={{ padding: "4px 8px", fontWeight: "bold" }}>
              {avgNegativelyPerformingDealsPercentage.toFixed(0)}%
            </TableCell>
            <TableCell sx={{ padding: "4px 8px", fontWeight: "bold" }}>
              {avgAvgT1MAbsReturnPositively.toFixed(1)}%
            </TableCell>
            <TableCell sx={{ padding: "4px 8px", fontWeight: "bold" }}>
              {avgAvgT1MAbsReturnNegatively.toFixed(1)}%
            </TableCell>
            <TableCell sx={{ padding: "4px 8px", fontWeight: "bold" }}>
              {avgExpectedReturnsExcess.toFixed(1)}%
            </TableCell>
            <TableCell sx={{ padding: "4px 8px", fontWeight: "bold" }}>
              {formatNumber(totalLongOpportunityValue)}
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default SectorTableData;
