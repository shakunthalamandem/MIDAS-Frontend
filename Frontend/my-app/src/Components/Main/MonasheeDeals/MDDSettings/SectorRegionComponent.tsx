import React from "react";
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Typography } from "@mui/material";

interface DealData {
  [category: string]: {
    [metric: string]: number;
  };
}

interface YearlyData {
  [year: string]: DealData;
}

interface SectorRegionTypeComponentProps {
  data: YearlyData;
  option: string;
}

const formatValue = (value?: number): string => {
  if (value === undefined || value === null || isNaN(value)) return "N/A";
  
  const absValue = Math.abs(value);
  const sign = value < 0 ? "-" : "";

  if (absValue >= 1_000_000_000) return `${sign}$${(absValue / 1_000_000_000).toFixed(1)}B`;
  if (absValue >= 1_000_000) return `${sign}$${(absValue / 1_000_000).toFixed(1)}M`;
  if (absValue >= 1_000) return `${sign}$${(absValue / 1_000).toFixed(1)}K`;

  return `${sign}$${absValue.toFixed(2)}`;
};

const SectorRegionComponent: React.FC<SectorRegionTypeComponentProps> = ({ data, option }) => {
  return (
    <div>
      {Object.entries(data)
        .sort(([yearA], [yearB]) => Number(yearB) - Number(yearA))
        .map(([year, categories]) => (
          <Paper key={year} sx={{ padding: 5, marginBottom: 3, width: "90%", background: "#F1E3A4" }}>
            <Typography variant="h6" sx={{ textAlign: "center", mb: 2, fontWeight: "bold", color: "#1976d2" }}>
              {`Financial Data for ${year}`}
            </Typography>
            <TableContainer component={Paper} sx={{ border: "1px solid #ccc" }}>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ backgroundColor: "#1976d2" }}>
                    <TableCell sx={{ color: "white" }}>{option}</TableCell>
                    <TableCell sx={{ color: "white" }}>T+1M Absolute Returns</TableCell>
                    <TableCell sx={{ color: "white" }}>No of Deals</TableCell>
                    <TableCell sx={{ color: "white" }}>Deal Volume ($)</TableCell>
                    <TableCell sx={{ color: "white" }}>Allocation as % of Deal Size (Weighted)</TableCell>
                    <TableCell sx={{ color: "white" }}>Allocation as % of IOI (Weighted)</TableCell>
                    <TableCell sx={{ color: "white", borderLeft: "2px solid #484547" }}>Monashee Actual Allocation PnL (Gross $)</TableCell>
                    <TableCell sx={{ color: "white" }}>Model PnL With Actual Allocation (Gross $)</TableCell>
                    <TableCell sx={{ color: "white" }}>Model PnL with model Allocation (1%)</TableCell>
                    <TableCell sx={{ color: "white", borderLeft: "2px solid #484547" }}>Monashee Actual AM PnL (Gross $)</TableCell>
                    <TableCell sx={{ color: "white" }}>Model PnL with model AM(Gross $)</TableCell>
                    <TableCell sx={{ color: "white", borderLeft: "2px solid #484547" }}>Monashee Actual Total PnL (Gross $)</TableCell>
                    <TableCell sx={{ color: "white" }}>Model Actual Total PnL (Gross $)</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {Object.entries(categories)
                    .sort(([a], [b]) => (a === "Summary" ? 1 : b === "Summary" ? -1 : a.localeCompare(b)))
                    .map(([category, values]) => (
                      <TableRow key={category} sx={{ backgroundColor: category === "Summary" ? "#e3f2fd" : "inherit" }}>
                        <TableCell sx={{ fontWeight: category === "Summary" ? "bold" : "normal" }}>{category}</TableCell>
                        <TableCell>{values["Min t1m_return_from_dealogic"] !== undefined ? `${values["Min t1m_return_from_dealogic"].toFixed(1)}%` : "N/A"} 
                                  to {values["Max t1m_return_from_dealogic"] !== undefined ? `${values["Max t1m_return_from_dealogic"].toFixed(1)}%` : "N/A"} </TableCell>
                        <TableCell>{values["Number of deals"]}</TableCell>
                        <TableCell>{formatValue(values["Deal volume"])}</TableCell>
                        <TableCell>{(values["Weighted Allocation as % of Deal Size"]?.toFixed(2) || "0.00") + "%"}</TableCell>
                        <TableCell>{(values["Weighted Allocation as % of IOI"]?.toFixed(2) || "0.00") + "%"}</TableCell>
                        <TableCell sx={{ borderLeft: "2px solid #484547" }}>{formatValue(values["Allocation Return"])}</TableCell>
                        <TableCell>{formatValue(values["Model Actual Return"])}</TableCell>
                        <TableCell>{formatValue(values["Model Return 1% Allocation"])}</TableCell>
                        <TableCell sx={{ borderLeft: "2px solid #484547" }}>{formatValue(values["AM Return"])}</TableCell>
                        <TableCell>{formatValue(values["Model AM Return"])}</TableCell>
                        <TableCell sx={{ borderLeft: "2px solid #484547" }}>{formatValue(values["Total Return"])}</TableCell>
                        <TableCell>{formatValue((values["Model Return 1% Allocation"] || 0) + (values["Model AM Return"] || 0))}</TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        ))}
    </div>
  );
};

export default SectorRegionComponent;
