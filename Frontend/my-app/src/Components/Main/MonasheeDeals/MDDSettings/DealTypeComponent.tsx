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

const DealTypeComponent: React.FC<{ data: Data }> = ({ data }) => {
  const [selectedTypes, setSelectedTypes] = useState<{ [year: string]: "IPO" | "FO" }>(
    Object.keys(data).reduce((acc, year) => ({ ...acc, [year]: "IPO" }), {})
  );

  return (
    <div>
      {Object.keys(data).map((year) => {
        const selectedType = selectedTypes[year];
        const tableData = data[year][selectedType];
        const sortedCategories = Object.keys(tableData).sort((a, b) => {
          if (a === "Summary") return 1;
          if (b === "Summary") return -1;
          return parseFloat(b) - parseFloat(a);
        });

        return (
          <Paper key={year} sx={{ padding: 2, marginBottom: 3 }}>
            <Typography variant="h6" align="center">{`Financial Data for ${year}`}</Typography>
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

            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Quintile</TableCell>
                    <TableCell>T+1M Absolute Returns</TableCell>
                    <TableCell>No of Deals</TableCell>
                    <TableCell>Deal Volume ($)</TableCell>
                    <TableCell>Allocation as % of IOI (Weighted)</TableCell>
                    <TableCell>Monashee Actual Allocation PnL (Gross $)</TableCell>
                    <TableCell>Model PnL With Actual Allocation (Gross $)</TableCell>
                    <TableCell>{selectedType === "IPO" ? "Model PnL with model Allocation (0.5%)" : "Model PnL with model Allocation (1%)"}</TableCell>
                    <TableCell>Monashee Actual AM PnL (Gross $)</TableCell>
                    <TableCell>Model PnL with model AM allocation (Gross $)</TableCell>
                    <TableCell>Monashee Actual Total PnL (Gross $)</TableCell>
                    <TableCell>Model Actual Total PnL (Gross $)</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {sortedCategories.map((category, index) => {
                    const values = tableData[category] || {};
                    const isSummary = category === "Summary";
                    return (
                      <TableRow key={category}>
                        <TableCell>{isSummary ? "" : index + 1}</TableCell>
                        <TableCell>{category}</TableCell>
                        <TableCell>{values["Number of deals"] || 0}</TableCell>
                        <TableCell>{formatValue(values["Deal volume"] || 0)}</TableCell>
                        <TableCell>{(values["Weighted Allocation as % of IOI"]?.toFixed(2) || "0.00") + "%"}</TableCell>
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
