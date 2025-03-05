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

interface HyRatingTableDataProps {
  data: {
    RatingWise: { [year: string]: TableData };
    ratingwise_total: {
      Total_Deal_Count_Sum: number;
      Total_Deal_Volume_Sum: number;
      Total_Deal_Count_Sum_Without_Nulls: number;
      Total_Deal_Volume_Sum_Without_Nulls: number;
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

const HyRatingTableData: React.FC<HyRatingTableDataProps> = ({ data }) => {
  const yearwiseData = data?.RatingWise;
  const yearwiseTotal = data?.ratingwise_total;

  if (!yearwiseData || !yearwiseTotal) {
    return <div>No data available</div>;
  }

  const columns = [
    "Lead Bank",
    "Total Deal Count",
    "Total Deal Volume ($)",
    "% of Positively Performing Deals ",
    "% of Negatively Performing Deals ",
    "Weighted Avg T+1M Excess Return (Positive Deals)",
    "Weighted Avg T+1M Excess Return (Negative Deals)",
    "Expected Returns Excess",
    "Opportunity Value (T + 1M Excess)",
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
          {Object.keys(yearwiseData).map((year) => {
            const row = yearwiseData[year];
            return (
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
                <TableCell sx={{ padding: "4px 8px" }}>
                  {formatNumber(row.Long_Opportunity_Value)}
                </TableCell>
              </TableRow>
            );
          })}

          <TableRow key="total">
            <TableCell sx={{ padding: "4px 8px", fontWeight: "bold", textAlign: "center" }}>Total</TableCell>
            <TableCell sx={{ padding: "4px 8px", fontWeight: "bold" }}>{yearwiseTotal.Total_Deal_Count_Sum}</TableCell>
            <TableCell sx={{ padding: "4px 8px", fontWeight: "bold" }}>
              {formatNumber(yearwiseTotal.Total_Deal_Volume_Sum)}
            </TableCell>
            <TableCell sx={{ padding: "4px 8px", fontWeight: "bold" }}>
              {yearwiseTotal.Total_Deal_Count_Sum_Without_Nulls}
            </TableCell>
            <TableCell sx={{ padding: "4px 8px", fontWeight: "bold" }}>
              {formatNumber(yearwiseTotal.Total_Deal_Count_Sum_Without_Nulls)}
            </TableCell>
            <TableCell sx={{ padding: "4px 8px", fontWeight: "bold" }}>
              {yearwiseTotal.Total_Postively_Performing_Deals?.toFixed(0) ?? "0"}%
            </TableCell>
            <TableCell sx={{ padding: "4px 8px", fontWeight: "bold" }}>
              {yearwiseTotal.Total_Negatively_Performing_Deals?.toFixed(0) ?? "0"}%
            </TableCell>
            <TableCell sx={{ padding: "4px 8px", fontWeight: "bold" }}>
              {yearwiseTotal.Total_Returns_positively?.toFixed(1) ?? "0"}%
            </TableCell>
            <TableCell sx={{ padding: "4px 8px", fontWeight: "bold" }}>
              {yearwiseTotal.Total_Returns_negatively?.toFixed(1) ?? "0"}%
            </TableCell>
            <TableCell sx={{ padding: "4px 8px", fontWeight: "bold" }}>
              {yearwiseTotal.Total_Expected_returns_excess?.toFixed(1) ?? "0"}%
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

export default HyRatingTableData;
