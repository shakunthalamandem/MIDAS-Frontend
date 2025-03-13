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
  Total_Deal_Count_without_null: number;
  Total_Deal_Volume_without_null: number;
  Positively_Performing_Deals_Percentage: number;
  Negatively_Performing_Deals_Percentage: number;
  Average_T1M_Abs_Return_of_Positively: number;
  Average_T1M_Abs_Return_of_Negatively: number;
  Expected_Returns_Excess: number;
  Long_Opportunity_Value: number;
}

interface HyRatingTableDataProps {
  data: {
    Ratingswise: { [year: string]: TableData };
    ratingswise_total: {
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
    // Ensure data exists before rendering
    
    if (!data?.Ratingswise || !data?.ratingswise_total || Object.keys(data.Ratingswise).length === 0) {
      return <div>No data available</div>;
    }
  
    // Extract the Yearwise and Total data
    const { Ratingswise: Ratingswise, ratingswise_total: ratingswise_total } = data;

  const columns = [
    "Rank",
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
          {Object.keys(Ratingswise).map((year) => {
            const row = Ratingswise[year];
            return (
              <TableRow key={year}>
                <TableCell sx={{ padding: "4px 8px" }}>{year}</TableCell>
                <TableCell sx={{ padding: "4px 8px" }}>{row.Total_Deal_Count}</TableCell>
                <TableCell sx={{ padding: "4px 8px" }}>{formatNumber(row.Total_Deal_Volume)}</TableCell>



                <TableCell sx={{ padding: "4px 8px" }}>{row.Total_Deal_Count_without_null}</TableCell>
                <TableCell sx={{ padding: "4px 8px" }}>{formatNumber(row.Total_Deal_Volume_without_null)}</TableCell>


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

          <TableRow key="total" sx={{ backgroundColor: '#f0f4ff' }}>
            
            <TableCell sx={{ padding: "4px 8px", fontWeight: "bold", textAlign: "center" }}>Total</TableCell>
            <TableCell sx={{ padding: "4px 8px", fontWeight: "bold" }}>{ratingswise_total.Total_Deal_Count_Sum}</TableCell>
            <TableCell sx={{ padding: "4px 8px", fontWeight: "bold" }}>
              {formatNumber(ratingswise_total.Total_Deal_Volume_Sum)}
            </TableCell>
            <TableCell sx={{ padding: "4px 8px", fontWeight: "bold" }}>
              {ratingswise_total.Total_Deal_Count_Sum_without_null}
            </TableCell>
            <TableCell sx={{ padding: "4px 8px", fontWeight: "bold" }}>
              {formatNumber(ratingswise_total.Total_Deal_Volume_Sum_without_null)}
            </TableCell>
            <TableCell sx={{ padding: "4px 8px", fontWeight: "bold" }}>
              {ratingswise_total.Total_Positive_Performing_Deals_Percentage?.toFixed(0) ?? "0"}%
            </TableCell>
            <TableCell sx={{ padding: "4px 8px", fontWeight: "bold" }}>
              {ratingswise_total.Total_Negative_Performing_Deals_Percentage?.toFixed(0) ?? "0"}%
            </TableCell>
            <TableCell sx={{ padding: "4px 8px", fontWeight: "bold" }}>
              {ratingswise_total.Total_Returns_Positive?.toFixed(1) ?? "0"}%
            </TableCell>
            <TableCell sx={{ padding: "4px 8px", fontWeight: "bold" }}>
              {ratingswise_total.Total_Returns_Negative?.toFixed(1) ?? "0"}%
            </TableCell>
            <TableCell sx={{ padding: "4px 8px", fontWeight: "bold" }}>
              {ratingswise_total.Total_Expected_Returns_Excess?.toFixed(1) ?? "0"}%
            </TableCell>
            <TableCell sx={{ padding: "4px 8px", fontWeight: "bold" }}>
              {formatNumber(ratingswise_total.Total_Long_Opportunity_Value)}
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default HyRatingTableData;
