import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Box,
  Button,
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

const DealTypeComponent: React.FC<{ data: Data }> = ({ data = {} }) => {
  const sortedYears = Object.keys(data).sort(
    (a, b) => parseInt(b) - parseInt(a)
  );
  const [selectedTypes, setSelectedTypes] = useState<{
    [year: string]: "IPO" | "FO";
  }>(sortedYears.reduce((acc, year) => ({ ...acc, [year]: "IPO" }), {}));

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
          <Paper
            key={year}
            sx={{
              padding: 5,
              marginBottom: 3,
              width: "90%",
              background: "#F5E8DC",
            }}
          >
            <Typography
              variant="h6"
              align="center"
              sx={{ color: "#002060", fontWeight: "bold" }}
            >
              {`GAP Analysis for ${year}`}
            </Typography>
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                gap: 1,
                marginBottom: 2,
                marginTop:3
              }}
            >
              <Button
                variant={selectedType === "IPO" ? "contained" : "outlined"}
                sx={{
                  backgroundColor:
                    selectedType === "IPO" ? "#a204fc" : "transparent",
                  color: selectedType === "IPO" ? "#fff" : "#a204fc",
                  borderColor: "#a204fc",
                  "&:hover": {
                    backgroundColor: "#a204fc",
                    color: "#fff",
                  },
                }}
                onClick={() =>
                  setSelectedTypes((prev) => ({ ...prev, [year]: "IPO" }))
                }
              >
                IPO
              </Button>

              <Button
                variant={selectedType === "FO" ? "contained" : "outlined"}
                sx={{
                  backgroundColor:
                    selectedType === "FO" ? "#a204fc" : "transparent",
                  color: selectedType === "FO" ? "#fff" : "#a204fc",
                  borderColor: "#a204fc",
                  "&:hover": {
                    backgroundColor: "#a204fc",
                    color: "#fff",
                  },
                }}
                onClick={() =>
                  setSelectedTypes((prev) => ({ ...prev, [year]: "FO" }))
                }
              >
                FO
              </Button>
            </Box>

            <TableContainer component={Paper} sx={{ border: "1px solid #ccc" }}>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ backgroundColor: "#004577" }}>
                    <TableCell sx={{ color: "white",width:'30px' }}>Quintile</TableCell>
                    <TableCell sx={{ color: "white",width:'150px' }}>
                      T+1M Absolute Returns
                    </TableCell>
                    <TableCell sx={{ color: "white",width:'30px' }}>No of Deals</TableCell>
                    <TableCell sx={{ color: "white",width:'30px' }}>
                      Deal Volume ($)
                    </TableCell>
                    <TableCell sx={{ color: "white",width:'30px' }}>
                      Allocation as % of Deal Size (Weighted)
                    </TableCell>
                    <TableCell sx={{ color: "white" ,width:'30px'}}>
                      Allocation as % of IOI (Weighted)
                    </TableCell>
                    <TableCell
                      sx={{ color: "white", borderLeft: "2px solid #484547",width:'30px' }}
                    >
                      Monashee Actual Allocation PnL(Gross)
                    </TableCell>
                    <TableCell sx={{ color: "white" ,width:'30px'}}>
                      Model PnL With Actual Allocation(Gross)
                    </TableCell>
                    <TableCell sx={{ color: "white",width:'30px' }}>
                      {selectedType === "IPO"
                        ? "Model PnL with model Allocation(0.5%)"
                        : "Model PnL with model Allocation(1%)"}
                    </TableCell>
                    <TableCell
                      sx={{ color: "white", borderLeft: "2px solid #484547" ,width:'30px'}}
                    >
                      Monashee Actual AM PnL(Gross)
                    </TableCell>
                    <TableCell sx={{ color: "white",width:'30px' }}>
                      Model PnL with model AM(Gross)
                    </TableCell>
                    <TableCell
                      sx={{ color: "white", borderLeft: "2px solid #484547",width:'30px' }}
                    >
                      Monashee Actual Total PnL(Gross)
                    </TableCell>
                    <TableCell sx={{ color: "white",width:'30px' }}>
                      Model Actual Total PnL(Gross)
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {sortedCategories.map((category, index) => {
                    const values = tableData[category] || {};
                    const isSummary = category === "Summary";
                    return (
                      <TableRow
                      key={category}
                      sx={isSummary ? { backgroundColor: "#7bcf60" } : {}}
                    >
                      <TableCell>{isSummary ? <strong>{""}</strong> : index + 1}</TableCell>
                      <TableCell>{isSummary ? <strong>{category}</strong> : category}</TableCell>
                      <TableCell>{isSummary ? <strong>{values["Number of deals"] || 0}</strong> : values["Number of deals"] || 0}</TableCell>
                      <TableCell>{isSummary ? <strong>{formatValue(values["Deal volume"] || 0)}</strong> : formatValue(values["Deal volume"] || 0)}</TableCell>
                      <TableCell>
                        {isSummary ? (
                          <strong>{(values["Weighted Allocation as % of Deal Size"]?.toFixed(2) || "0.00") + "%"}</strong>
                        ) : (
                          (values["Weighted Allocation as % of Deal Size"]?.toFixed(2) || "0.00") + "%"
                        )}
                      </TableCell>
                      <TableCell>
                        {isSummary ? (
                          <strong>{(values["Weighted Allocation as % of IOI"]?.toFixed(2) || "0.00") + "%"}</strong>
                        ) : (
                          (values["Weighted Allocation as % of IOI"]?.toFixed(2) || "0.00") + "%"
                        )}
                      </TableCell>
                      <TableCell sx={{ borderLeft: "2px solid #484547" }}>
                        {isSummary ? <strong>{formatValue(values["Allocation Return"] || 0)}</strong> : formatValue(values["Allocation Return"] || 0)}
                      </TableCell>
                      <TableCell>{isSummary ? <strong>{formatValue(values["Model Actual Return"] || 0)}</strong> : formatValue(values["Model Actual Return"] || 0)}</TableCell>
                      <TableCell>{isSummary ? <strong>{formatValue(values["Model Return 1% Allocation"] || 0)}</strong> : formatValue(values["Model Return 1% Allocation"] || 0)}</TableCell>
                      <TableCell sx={{ borderLeft: "2px solid #484547" }}>
                        {isSummary ? <strong>{formatValue(values["AM Return"] || 0)}</strong> : formatValue(values["AM Return"] || 0)}
                      </TableCell>
                      <TableCell>{isSummary ? <strong>{formatValue(values["Model AM Return"] || 0)}</strong> : formatValue(values["Model AM Return"] || 0)}</TableCell>
                      <TableCell sx={{ borderLeft: "2px solid #484547" }}>
                        {isSummary ? <strong>{formatValue(values["Allocation Return"] + values["AM Return"] || 0)}</strong> : formatValue(values["Allocation Return"] + values["AM Return"] || 0)}
                      </TableCell>
                      <TableCell>
                        {isSummary ? <strong>{formatValue((values["Model Return 1% Allocation"] || 0) + (values["Model AM Return"] || 0))}</strong> : formatValue((values["Model Return 1% Allocation"] || 0) + (values["Model AM Return"] || 0))}
                      </TableCell>
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
