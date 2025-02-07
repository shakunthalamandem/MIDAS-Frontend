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
} from "@mui/material";

const formatValue = (value: number): string => {
  const absValue = Math.abs(value);
  const sign = value < 0 ? "-" : "";

  if (absValue >= 1_000_000_000)
    return `${sign}$${(absValue / 1_000_000_000).toFixed(1)}B`;
  if (absValue >= 1_000_000)
    return `${sign}$${(absValue / 1_000_000).toFixed(1)}M`;
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

const DealTypeComponent: React.FC<{ data?: Data }> = ({ data = {} }) => {
  const [selectedTypes, setSelectedTypes] = useState<{ [year: string]: "IPO" | "FO" }>(
    Object.keys(data).reduce((acc, year) => ({ ...acc, [year]: "IPO" }), {})
  );

  return (
    <div>
      {Object.keys(data).map((year) => {
        const selectedType = selectedTypes[year] || "IPO";
        const tableData = data[year]?.[selectedType] || {};
        const sortedCategories = Object.keys(tableData).sort((a, b) => {
          if (a === "Summary") return 1;
          if (b === "Summary") return -1;
          return parseFloat(b) - parseFloat(a);
        });

        return (
          <Paper key={year} sx={{ padding: 2, marginBottom: 3, boxShadow: 3 }}>
            <Typography variant="h6" align="center" gutterBottom>
              {`Financial Data for ${year}`}
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

            <TableContainer component={Paper} sx={{ border: "1px solid #ddd" }}>
              <Table sx={{ borderCollapse: "collapse" }}>
                <TableHead>
                  <TableRow sx={{ backgroundColor: "#1976d2", color: "white" }}>
                    <TableCell sx={{ fontWeight: "bold", color: "white" }}>Quintile</TableCell>
                    <TableCell sx={{ fontWeight: "bold", color: "white" }}>T+1M Absolute Returns</TableCell>
                    <TableCell sx={{ fontWeight: "bold", color: "white" }}>No of Deals</TableCell>
                    <TableCell sx={{ fontWeight: "bold", color: "white" }}>Deal Volume ($)</TableCell>
                    <TableCell sx={{ fontWeight: "bold", color: "white" }}>Allocation as % of IOI</TableCell>
                    <TableCell sx={{ fontWeight: "bold", color: "white" }}>Monashee Actual Allocation PnL</TableCell>
                    <TableCell sx={{ fontWeight: "bold", color: "white" }}>Model PnL With Actual Allocation</TableCell>
                    <TableCell sx={{ fontWeight: "bold", color: "white" }}>{
                      selectedType === "IPO" ? "Model PnL (0.5%)" : "Model PnL (1%)"
                    }</TableCell>
                    <TableCell sx={{ fontWeight: "bold", color: "white" }}>Monashee Actual AM PnL</TableCell>
                    <TableCell sx={{ fontWeight: "bold", color: "white" }}>Model AM PnL</TableCell>
                    <TableCell sx={{ fontWeight: "bold", color: "white" }}>Monashee Total PnL</TableCell>
                    <TableCell sx={{ fontWeight: "bold", color: "white" }}>Model Total PnL</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {sortedCategories.map((category, index) => {
                    const values = tableData[category] || {};
                    const isSummary = category === "Summary";
                    return (
                      <TableRow
                        key={category}
                        sx={{ backgroundColor: isSummary ? "#d0f0c0" : "inherit" }}
                      >
                        <TableCell>{isSummary ? "" : index + 1}</TableCell>
                        <TableCell>{category}</TableCell>
                        <TableCell>{values["Number of deals"] || 0}</TableCell>
                        <TableCell>{formatValue(values["Deal volume"] || 0)}</TableCell>
                        <TableCell>
                          {(values["Weighted Allocation as % of IOI"]?.toFixed(2) || "0.00") + "%"}
                        </TableCell>
                        <TableCell>{formatValue(values["Allocation Return"] || 0)}</TableCell>
                        <TableCell>{formatValue(values["Model Actual Return"] || 0)}</TableCell>
                        <TableCell>{formatValue(values["Model Return 1% Allocation"] || 0)}</TableCell>
                        <TableCell>{formatValue(values["AM Return"] || 0)}</TableCell>
                        <TableCell>{formatValue(values["Model AM Return"] || 0)}</TableCell>
                        <TableCell>{formatValue(values["Total Return"] || 0)}</TableCell>
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
    </div>
  );
};

export default DealTypeComponent;
