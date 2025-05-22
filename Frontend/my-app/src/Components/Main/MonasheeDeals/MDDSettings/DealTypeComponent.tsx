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
import DetailedGapData from "./DetailedGapData";

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

interface DealTypeComponentProps {
  data: Data;
  selectedFilters?: any;
}

const DealTypeComponent: React.FC<DealTypeComponentProps> = ({
  data = {},
  selectedFilters = {},
}) => {
  const handleClick = (year: number) => {
    const filters = { ...selectedFilters, years: [year] };

    const url = new URL(
      window.location.origin + "/equity/detailed_gap_analysis"
    );
    url.searchParams.set("filters", JSON.stringify(filters));

    window.open(url.toString(), "_blank");
  };

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
              width: "1300px",
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
                marginTop: 3,
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

            <TableContainer
              component={Paper}
              sx={{
                border: "1px solid #ccc",
                maxHeight: "600px", // Increase if needed
                overflowX: "auto", // Horizontal scroll
                overflowY: "auto", // Vertical scroll
                "&::-webkit-scrollbar": {
                  width: "4px", // Thin scrollbar width
                  height: "10px", // Thin scrollbar for horizontal scrolling
                },
                "&::-webkit-scrollbar-thumb": {
                  backgroundColor: "#888", // Scroll thumb color
                  borderRadius: "8px",
                },
                "&::-webkit-scrollbar-thumb:hover": {
                  backgroundColor: "#555",
                },
                "&::-webkit-scrollbar-track": {
                  background: "transparent", // Hide scrollbar track
                },
              }}
            >
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ backgroundColor: "#466675" }}>
                    {/* Set minWidth instead of fixed width */}
                    <TableCell sx={{ color: "white", minWidth: "40px" }}>
                      Quintile
                    </TableCell>
                    <TableCell sx={{ color: "white", minWidth: "120px" }}>
                      T+1M Absolute Returns
                    </TableCell>
                    <TableCell sx={{ color: "white", minWidth: "40px" }}>
                      No of Deals
                    </TableCell>
                    <TableCell sx={{ color: "white", minWidth: "40px" }}>
                      Deal Volume ($)
                    </TableCell>
                    <TableCell sx={{ color: "white", minWidth: "40px" }}>
                      Allocation as % of Deal Size (Weighted)
                    </TableCell>
                    <TableCell sx={{ color: "white", minWidth: "40px" }}>
                      Allocation as % of IOI (Weighted)
                    </TableCell>
                    <TableCell
                      sx={{
                        color: "white",
                        borderLeft: "2px solid #484547",
                        minWidth: "40px",
                      }}
                    >
                      Monashee Actual Allocation PnL (Gross)
                    </TableCell>
                    <TableCell sx={{ color: "white", minWidth: "40px" }}>
                      Model PnL With Actual Allocation (Gross)
                    </TableCell>
                    <TableCell sx={{ color: "white", maxWidth: "40px" }}>
                      {selectedType === "IPO"
                        ? "Model PnL with model Allocation (0.5%)"
                        : "Model PnL with model Allocation (1%)"}
                    </TableCell>
                    <TableCell sx={{ color: "white", minWidth: "40px" }}>
                      Model Allocation Gap
                    </TableCell>
                    <TableCell sx={{ color: "white", minWidth: "40px" }}>
                      Monashee Exit Gap
                    </TableCell>
                    <TableCell
                      sx={{
                        color: "white",
                        borderLeft: "2px solid #484547",
                        minWidth: "40px",
                      }}
                    >
                      Monashee Actual AM PnL(Gross)
                    </TableCell>
                    <TableCell sx={{ color: "white", minWidth: "40px" }}>
                      Model PnL with Actual AM
                    </TableCell>
                    <TableCell sx={{ color: "white", minWidth: "40px" }}>
                      Model PnL with model AM(Gross)
                    </TableCell>
                    <TableCell sx={{ color: "white", minWidth: "40px" }}>
                      Model AM Gap
                    </TableCell>
                    <TableCell sx={{ color: "white", minWidth: "40px" }}>
                      Monashee AM Exit Gap
                    </TableCell>
                    <TableCell
                      sx={{
                        color: "white",
                        borderLeft: "2px solid #484547",
                        minWidth: "40px",
                      }}
                    >
                      Monashee Actual Total PnL(Gross)
                    </TableCell>
                    <TableCell sx={{ color: "white", minWidth: "40px" }}>
                      Model Actual Total PnL(Gross)
                    </TableCell>
                    <TableCell sx={{ color: "white", minWidth: "40px" }}>
                      Total Gap
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
                        <TableCell>
                          {isSummary ? <strong>{""}</strong> : index + 1}
                        </TableCell>
                        <TableCell>
                          {isSummary ? <strong>{category}</strong> : category}
                        </TableCell>
                        <TableCell>
                          {isSummary ? (
                            <strong>{values["Number of deals"] || 0}</strong>
                          ) : (
                            values["Number of deals"] || 0
                          )}
                        </TableCell>
                        <TableCell>
                          {isSummary ? (
                            <strong>
                              {formatValue(values["Deal volume"] || 0)}
                            </strong>
                          ) : (
                            formatValue(values["Deal volume"] || 0)
                          )}
                        </TableCell>
                        <TableCell>
                          {isSummary ? (
                            <strong>
                              {(values[
                                "Weighted Allocation as % of Deal Size"
                              ]?.toFixed(2) || "0.00") + "%"}
                            </strong>
                          ) : (
                            (values[
                              "Weighted Allocation as % of Deal Size"
                            ]?.toFixed(2) || "0.00") + "%"
                          )}
                        </TableCell>
                        <TableCell>
                          {isSummary ? (
                            <strong>
                              {(values[
                                "Weighted Allocation as % of IOI"
                              ]?.toFixed(2) || "0.00") + "%"}
                            </strong>
                          ) : (
                            (values["Weighted Allocation as % of IOI"]?.toFixed(
                              2
                            ) || "0.00") + "%"
                          )}
                        </TableCell>

                        <TableCell sx={{ borderLeft: "2px solid #484547" }}>
                          <Box>
                            <Typography
                              variant="body2"
                              fontWeight={isSummary ? "bold" : "normal"}
                            >
                              {formatValue(values["Allocation Return"] || 0)}
                            </Typography>
                            {isSummary && (
                              <Typography
                                variant="caption"
                                color="red"
                                fontWeight="bold"
                              >
                                (A)
                              </Typography>
                            )}
                          </Box>
                        </TableCell>

                       <TableCell>
                        <Box>
                          <Typography variant="body2" fontWeight={isSummary ? "bold" : "normal"}>
                            {formatValue(values["Model Actual Return"] || 0)}
                          </Typography>
                          {isSummary && (
                            <Typography variant="caption" color="red" fontWeight="bold">
                              (B)
                            </Typography>
                          )}
                        </Box>
                      </TableCell>
                       <TableCell>
                          <Box>
                            <Typography variant="body2" fontWeight={isSummary ? "bold" : "normal"}>
                              {formatValue(values["Model Return 1% Allocation"] || 0)}
                            </Typography>
                            {isSummary && (
                              <Typography variant="caption" color="red" fontWeight="bold">
                                (C)
                              </Typography>
                            )}
                          </Box>
                        </TableCell>
                       <TableCell sx={{ bgcolor: !isSummary ? "#f8f9cd" : "transparent" }}>
                          <Box>
                            <Typography variant="body2" fontWeight={isSummary ? "bold" : "normal"}>
                              {formatValue(values["Model Allocation Gap"] || 0)}
                            </Typography>
                            {isSummary && (
                              <Typography variant="caption" color="red" fontWeight="bold">
                                (B - C)
                              </Typography>
                            )}
                          </Box>
                        </TableCell>

                        {/* Monashee Exit Gap */}
                        <TableCell sx={{ bgcolor: !isSummary ? "#f8f9cd" : "transparent" }}>
                          <Box>
                            <Typography variant="body2" fontWeight={isSummary ? "bold" : "normal"}>
                              {formatValue(values["Monashee Exit Gap"] || 0)}
                            </Typography>
                            {isSummary && (
                              <Typography variant="caption" color="red" fontWeight="bold">
                                (A - B)
                              </Typography>
                            )}
                          </Box>
                        </TableCell>
                      <TableCell sx={{ borderLeft: "2px solid #484547" }}>
                        <Box>
                          <Typography variant="body2" fontWeight={isSummary ? "bold" : "normal"}>
                            {formatValue(values["AM Return"] || 0)}
                          </Typography>
                          {isSummary && (
                            <Typography variant="caption" color="red" fontWeight="bold">
                              (D)
                            </Typography>
                          )}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box>
                          <Typography variant="body2" fontWeight={isSummary ? "bold" : "normal"}>
                            {formatValue(values["Model AM Return"] || 0)}
                          </Typography>
                          {isSummary && (
                            <Typography variant="caption" color="red" fontWeight="bold">
                              (E)
                            </Typography>
                          )}
                        </Box>
                      </TableCell>
                       <TableCell>
                        <Box>
                          <Typography variant="body2" fontWeight={isSummary ? "bold" : "normal"}>
                            {formatValue(values["Model AM Return"] || 0)}
                          </Typography>
                          {isSummary && (
                            <Typography variant="caption" color="red" fontWeight="bold">
                              (F)
                            </Typography>
                          )}
                        </Box>
                      </TableCell>
                       
                      {/* AM Gap */}
                      <TableCell sx={{ bgcolor: !isSummary ? "#f8f9cd" : "transparent" }}>
                        <Box>
                          <Typography variant="body2" fontWeight={isSummary ? "bold" : "normal"}>
                            {formatValue(values["AM Gap"] || 0)}
                          </Typography>
                          {isSummary && (
                            <Typography variant="caption" color="red" fontWeight="bold">
                              (E - F)
                            </Typography>
                          )}
                        </Box>
                      </TableCell>

                      {/* AM Exit Gap */}
                      <TableCell sx={{ bgcolor: !isSummary ? "#f8f9cd" : "transparent" }}>
                        <Box>
                          <Typography variant="body2" fontWeight={isSummary ? "bold" : "normal"}>
                            {formatValue(values["AM Exit Gap"] || 0)}
                          </Typography>
                          {isSummary && (
                            <Typography variant="caption" color="red" fontWeight="bold">
                              (D - E)
                            </Typography>
                          )}
                        </Box>
                      </TableCell>
                     <TableCell sx={{ borderLeft: "2px solid #484547" }}>
                      <Box>
                        <Typography variant="body2" fontWeight={isSummary ? "bold" : "normal"}>
                          {formatValue(
                            (values["Allocation Return"] || 0) + (values["AM Return"] || 0)
                          )}
                        </Typography>
                        {isSummary && (
                          <Typography variant="caption" color="red" fontWeight="bold">
                            (G)
                          </Typography>
                        )}
                      </Box>
                    </TableCell>
                       <TableCell>
                        <Box>
                          <Typography variant="body2" fontWeight={isSummary ? "bold" : "normal"}>
                            {formatValue(
                              (values["Model Return 1% Allocation"] || 0) +
                              (values["Model AM Return"] || 0)
                            )}
                          </Typography>
                          {isSummary && (
                            <Typography variant="caption" color="red" fontWeight="bold">
                              (H)
                            </Typography>
                          )}
                        </Box>
                      </TableCell>
                 <TableCell sx={{ bgcolor: !isSummary ? "#f8f9cd" : "transparent" }}>
                    <Box>
                      <Typography variant="body2" fontWeight={isSummary ? "bold" : "normal"}>
                        {formatValue(
                          (values["Allocation Return"] || 0) +
                          (values["AM Return"] || 0) -
                          (values["Model Return 1% Allocation"] || 0) -
                          (values["Model AM Return"] || 0)
                        )}
                      </Typography>
                      {isSummary && (
                        <Typography variant="caption" color="red" fontWeight="bold">
                          (G-H)
                        </Typography>
                      )}
                    </Box>
                  </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>

            <Button
              variant="contained"
              sx={{
                backgroundColor: "#16303d",
                marginTop: 2,
                color: "white",
                "&:hover": { backgroundColor: "#c8012b" },
              }}
              onClick={() => handleClick(Number(year))}
            >
              Click Here for Deal Details
            </Button>
          </Paper>
        );
      })}
    </Box>
  );
};

export default DealTypeComponent;
