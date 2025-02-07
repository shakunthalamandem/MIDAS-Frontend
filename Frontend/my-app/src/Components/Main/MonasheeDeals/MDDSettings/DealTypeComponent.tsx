import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Radio,
  RadioGroup,
  FormControlLabel,
  Typography,
  Box,
} from "@mui/material";

const formatValue = (value: number): string => {
  const absValue = Math.abs(value);
  const sign = value < 0 ? "-" : "";

  if (absValue >= 1_000_000_000) return `${sign}$${(absValue / 1_000_000_000).toFixed(1)}B`;
  if (absValue >= 1_000_000) return `${sign}$${(absValue / 1_000_000).toFixed(1)}M`;
  if (absValue >= 1_000) return `${sign}$${(absValue / 1_000).toFixed(1)}K`;

  return `${sign}$${absValue.toFixed(2)}`;
};

interface Data {
  [year: string]: {
    [dealType: string]: {
      [category: string]: {
        [metric: string]: number;
      };
    };
  };
}

const DealTypeComponent: React.FC<{ data: Data }> = ({ data = {} }) => {
  const sortedYears = Object.keys(data).sort((a, b) => parseInt(b) - parseInt(a)); // Latest year first
  const [selectedTypes, setSelectedTypes] = useState<{ [year: string]: "IPO" | "FO" }>(
    sortedYears.reduce((acc, year) => ({ ...acc, [year]: "IPO" }), {})
  );

  return (
    <Box display="flex" flexDirection="column" alignItems="center">
      {sortedYears.map((year) => {
        const selectedType = selectedTypes[year];
        const tableData = data[year]?.[selectedType] || {};
        const sortedCategories = Object.keys(tableData).sort((a, b) => {
          if (a === "Summary") return 1;
          if (b === "Summary") return -1;
          return parseFloat(b) - parseFloat(a);
        });

        return (
          <Paper key={year} sx={{ padding: 5, marginBottom: 3, width: "80%", background: "#F1E3A4" }}>
            <Typography variant="h6" align="center" sx={{ color: "#1976d2" }}>
              {`GAP Analysis for ${year}`}
            </Typography>
            <RadioGroup
              row
              value={selectedType}
              onChange={(e) =>
                setSelectedTypes((prev) => ({ ...prev, [year]: e.target.value as "IPO" | "FO" }))
              }
              sx={{ justifyContent: "center", marginBottom: 2 }}
            >
              <FormControlLabel value="IPO" control={<Radio />} label="IPO" />
              <FormControlLabel value="FO" control={<Radio />} label="FO" />
            </RadioGroup>

            <TableContainer component={Paper} sx={{ border: "1px solid #ccc" }}>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ backgroundColor: "#1976d2" }}>
                    <TableCell sx={{ color: "white" }}>Quintile</TableCell>
                    <TableCell sx={{ color: "white" }}>T+1M Absolute Returns</TableCell>
                    <TableCell sx={{ color: "white" }}>No of Deals</TableCell>
                    <TableCell sx={{ color: "white" }}>Deal Volume ($)</TableCell>
                    <TableCell sx={{ color: "white" }}>Allocation as % of Deal Size (Weighted)</TableCell>
                    <TableCell sx={{ color: "white" }}>Allocation as % of IOI (Weighted)</TableCell>
                    <TableCell sx={{ color: "white", borderLeft: "2px solid #484547" }}>Monashee Actual Allocation PnL(Gross $)</TableCell>
                    <TableCell sx={{ color: "white" }}>Model PnL With Actual Allocation(Gross $)</TableCell>
                    <TableCell sx={{ color: "white" }}>{selectedType === "IPO" ? "Model PnL with model Allocation(0.5%)" : "Model PnL with model Allocation(1%)"}</TableCell>
                    <TableCell sx={{ color: "white", borderLeft: "2px solid #484547" }}>Monashee Actual AM PnL(Gross $)</TableCell>
                    <TableCell sx={{ color: "white" }}>Model PnL with model AM(Gross $)</TableCell>
                    <TableCell sx={{ color: "white", borderLeft: "2px solid #484547" }}>Monashee Actual Total PnL(Gross $)</TableCell>
                    <TableCell sx={{ color: "white" }}>Model Actual Total PnL(Gross $)</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {sortedCategories.map((category, index) => {
                    const values = tableData[category] || {};
                    const isSummary = category === "Summary";
                    return (
                      <TableRow key={category} sx={isSummary ? { backgroundColor: "#d0f0c0" } : {}}>
                        <TableCell>{isSummary ? "" : index + 1}</TableCell>
                        <TableCell>{category}</TableCell>
                        <TableCell>{values["Number of deals"] || 0}</TableCell>
                        <TableCell>{formatValue(values["Deal volume"] || 0)}</TableCell>
                        <TableCell>{(values["Weighted Allocation as % of Deal Size"]?.toFixed(2) || "0.00") + "%"}</TableCell>
                        <TableCell>{(values["Weighted Allocation as % of IOI"]?.toFixed(2) || "0.00") + "%"}</TableCell>
                        <TableCell sx={{ borderLeft: "2px solid #484547" }}>{formatValue(values["Allocation Return"] || 0)}</TableCell>
                        <TableCell>{formatValue(values["Model Actual Return"] || 0)}</TableCell>
                        <TableCell>{formatValue(values["Model Return 1% Allocation"] || 0)}</TableCell>
                        <TableCell sx={{ borderLeft: "2px solid #484547" }}>{formatValue(values["AM Return"] || 0)}</TableCell>
                        <TableCell>{formatValue(values["Model AM Return"] || 0)}</TableCell>
                        <TableCell sx={{ borderLeft: "2px solid #484547" }}>{formatValue(values["Total Return"] || 0)}</TableCell>
                        <TableCell>{formatValue((values["Model Return 1% Allocation"] || 0) + (values["Model AM Return"] || 0))}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        );
      })}
    </Box>
  );
};

export default DealTypeComponent;
