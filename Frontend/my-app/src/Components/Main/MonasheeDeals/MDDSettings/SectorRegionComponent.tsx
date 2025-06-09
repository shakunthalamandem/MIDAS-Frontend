import React from "react";
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
} from "@mui/material";

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

  if (absValue >= 1_000_000_000)
    return `${sign}$${(absValue / 1_000_000_000).toFixed(1)}B`;
  if (absValue >= 1_000_000)
    return `${sign}$${(absValue / 1_000_000).toFixed(1)}M`;
  if (absValue >= 1_000) return `${sign}$${(absValue / 1_000).toFixed(1)}K`;

  return `${sign}$${absValue.toFixed(2)}`;
};

const SectorRegionComponent: React.FC<SectorRegionTypeComponentProps> = ({
  data,
  option,
}) => {
  return (
    <div style={{marginLeft: "59px"}}>
      {Object.entries(data)
        .sort(([yearA], [yearB]) => Number(yearB) - Number(yearA))
        .map(([year, categories]) => (
          <Paper
            key={year}
            sx={{
              padding: 5,
              marginBottom: 3,
               width: "100%",
               maxWidth: "1300px",
               minWidth: "300px",
               flex: "1 1 100%",
              background: "#F5E8DC",
            }}
          >
            <Typography
              variant="h6"
              sx={{
                textAlign: "center",
                mb: 2,
                fontWeight: "bold",
                color: "#002060",
              }}
            >
              {`${option} wise Data for ${year}`}
            </Typography>
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
              {" "}
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ backgroundColor: "#466675" }}>
                    <TableCell sx={{ color: "white", minWidth: "160px" }}>
                      {option}
                    </TableCell>
                    <TableCell sx={{ color: "white", minWidth: "120px" }}>
                      T+1M Absolute Returns
                    </TableCell>
                    <TableCell sx={{ color: "white", minWidth: "20px" }}>
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
                    <TableCell sx={{ color: "white", minWidth: "40px" }}>
                      Model PnL with model Allocation
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
                      Monashee Actual AM PnL (Gross)
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
                      Monashee Actual Total PnL (Gross)
                    </TableCell>
                    <TableCell sx={{ color: "white", minWidth: "40px" }}>
                      Model Actual Total PnL (Gross)
                    </TableCell>
                    <TableCell sx={{ color: "white", minWidth: "40px" }}>
                      Total Gap
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {Object.entries(categories)
                    .sort(([a], [b]) =>
                      a === "Summary"
                        ? 1
                        : b === "Summary"
                          ? -1
                          : a.localeCompare(b)
                    )
                    .map(([category, values]) => {
                      const isSummary = category === "Summary";
                      return (
                        <TableRow
                          key={category}
                          sx={{
                            backgroundColor: isSummary ? "#7bcf60" : "inherit",
                            fontWeight: isSummary ? "bold" : "normal",
                          }}
                        >
                          <TableCell
                            sx={{
                              fontWeight: isSummary ? "bold" : "normal",
                              minWidth: "140px",
                            }}
                          >
                            {category}
                          </TableCell>
                          <TableCell
                            sx={{
                              fontWeight: isSummary ? "bold" : "normal",
                              minWidth: "100px",
                            }}
                          >
                            {values["Min t1m_return_from_bloomberg"] !==
                            undefined
                              ? `${values["Min t1m_return_from_bloomberg"].toFixed(1)}%`
                              : "N/A"}{" "}
                            to{" "}
                            {values["Max t1m_return_from_bloomberg"] !==
                            undefined
                              ? `${values["Max t1m_return_from_bloomberg"].toFixed(1)}%`
                              : "N/A"}
                          </TableCell>
                          <TableCell
                            sx={{
                              fontWeight: isSummary ? "bold" : "normal",
                              minWidth: "30px",
                            }}
                          >
                            {values["Number of deals"]}
                          </TableCell>
                          <TableCell
                            sx={{
                              fontWeight: isSummary ? "bold" : "normal",
                              minWidth: "40px",
                            }}
                          >
                            {formatValue(values["Deal volume"])}
                          </TableCell>
                          <TableCell
                            sx={{
                              fontWeight: isSummary ? "bold" : "normal",
                              minWidth: "40px",
                            }}
                          >
                            {(values[
                              "Weighted Allocation as % of Deal Size"
                            ]?.toFixed(2) || "0.00") + "%"}
                          </TableCell>
                          <TableCell
                            sx={{
                              fontWeight: isSummary ? "bold" : "normal",
                              minWidth: "40px",
                            }}
                          >
                            {(values[
                              "Weighted Allocation as % of IOI"
                            ]?.toFixed(2) || "0.00") + "%"}
                          </TableCell>

                          {/* Allocation Return (A) */}
                          <TableCell
                            sx={{
                              borderLeft: "2px solid #484547",
                              fontWeight: isSummary ? "bold" : "normal",
                              minWidth: "40px",
                            }}
                          >
                            <Box>
                              <Typography
                                variant="body2"
                                fontWeight={isSummary ? "bold" : "normal"}
                              >
                                {formatValue(values["Allocation Return"])}
                              </Typography>
                              {isSummary && (
                                <Typography
                                  variant="caption"
                                  color="#002060"
                                  fontWeight="bold"
                                >
                                  (A)
                                </Typography>
                              )}
                            </Box>
                          </TableCell>

                          {/* Model Actual Return (B) */}
                          <TableCell
                            sx={{
                              fontWeight: isSummary ? "bold" : "normal",
                              minWidth: "40px",
                            }}
                          >
                            <Box>
                              <Typography
                                variant="body2"
                                fontWeight={isSummary ? "bold" : "normal"}
                              >
                                {formatValue(values["Model Actual Return"])}
                              </Typography>
                              {isSummary && (
                                <Typography
                                  variant="caption"
                                  color="#002060"
                                  fontWeight="bold"
                                >
                                  (B)
                                </Typography>
                              )}
                            </Box>
                          </TableCell>

                          {/* Model Return 1% Allocation (C) */}
                          <TableCell
                            sx={{
                              fontWeight: isSummary ? "bold" : "normal",
                              minWidth: "40px",
                            }}
                          >
                            <Box>
                              <Typography
                                variant="body2"
                                fontWeight={isSummary ? "bold" : "normal"}
                              >
                                {formatValue(
                                  values["Model Return 1% Allocation"]
                                )}
                              </Typography>
                              {isSummary && (
                                <Typography
                                  variant="caption"
                                  color="#002060"
                                  fontWeight="bold"
                                >
                                  (C)
                                </Typography>
                              )}
                            </Box>
                          </TableCell>

                          {/* Model Allocation Gap */}
                          <TableCell
                            sx={{
                              bgcolor: !isSummary ? "#f8f9cd" : "transparent",
                            }}
                          >
                            <Box>
                              <Typography
                                variant="body2"
                                fontWeight={isSummary ? "bold" : "normal"}
                              >
                                {formatValue(
                                  values["Model Allocation Gap"] || 0
                                )}
                              </Typography>
                              {isSummary && (
                                <Typography
                                  variant="caption"
                                  color="#002060"
                                  fontWeight="bold"
                                >
                                  (B - C)
                                </Typography>
                              )}
                            </Box>
                          </TableCell>

                          {/* Monashee Exit Gap */}
                          <TableCell
                            sx={{
                              bgcolor: !isSummary ? "#f8f9cd" : "transparent",
                            }}
                          >
                            <Box>
                              <Typography
                                variant="body2"
                                fontWeight={isSummary ? "bold" : "normal"}
                              >
                                {formatValue(values["Monashee Exit Gap"] || 0)}
                              </Typography>
                              {isSummary && (
                                <Typography
                                  variant="caption"
                                  color="#002060"
                                  fontWeight="bold"
                                >
                                  (A - B)
                                </Typography>
                              )}
                            </Box>
                          </TableCell>

                          {/* AM Return (D) */}
                          <TableCell
                            sx={{
                              borderLeft: "2px solid #484547",
                              fontWeight: isSummary ? "bold" : "normal",
                              minWidth: "40px",
                            }}
                          >
                            <Box>
                              <Typography
                                variant="body2"
                                fontWeight={isSummary ? "bold" : "normal"}
                              >
                                {formatValue(values["AM Return"])}
                              </Typography>
                              {isSummary && (
                                <Typography
                                  variant="caption"
                                  color="#002060"
                                  fontWeight="bold"
                                >
                                  (D)
                                </Typography>
                              )}
                            </Box>
                          </TableCell>

                          {/* Model Actual AM Return (E) */}
                          <TableCell
                            sx={{
                              fontWeight: isSummary ? "bold" : "normal",
                              minWidth: "40px",
                            }}
                          >
                            <Box>
                              <Typography
                                variant="body2"
                                fontWeight={isSummary ? "bold" : "normal"}
                              >
                                {formatValue(values["Model Actual AM Return"])}
                              </Typography>
                              {isSummary && (
                                <Typography
                                  variant="caption"
                                  color="#002060"
                                  fontWeight="bold"
                                >
                                  (E)
                                </Typography>
                              )}
                            </Box>
                          </TableCell>

                          {/* Model AM Return (F) */}
                          <TableCell
                            sx={{
                              fontWeight: isSummary ? "bold" : "normal",
                              minWidth: "40px",
                            }}
                          >
                            <Box>
                              <Typography
                                variant="body2"
                                fontWeight={isSummary ? "bold" : "normal"}
                              >
                                {formatValue(values["Model AM Return"])}
                              </Typography>
                              {isSummary && (
                                <Typography
                                  variant="caption"
                                  color="#002060"
                                  fontWeight="bold"
                                >
                                  (F)
                                </Typography>
                              )}
                            </Box>
                          </TableCell>

                          {/* AM Gap */}
                          <TableCell
                            sx={{
                              bgcolor: !isSummary ? "#f8f9cd" : "transparent",
                            }}
                          >
                            <Box>
                              <Typography
                                variant="body2"
                                fontWeight={isSummary ? "bold" : "normal"}
                              >
                                {formatValue(values["AM Gap"] || 0)}
                              </Typography>
                              {isSummary && (
                                <Typography
                                  variant="caption"
                                  color="#002060"
                                  fontWeight="bold"
                                >
                                  (E - F)
                                </Typography>
                              )}
                            </Box>
                          </TableCell>

                          {/* AM Exit Gap */}
                          <TableCell
                            sx={{
                              bgcolor: !isSummary ? "#f8f9cd" : "transparent",
                            }}
                          >
                            <Box>
                              <Typography
                                variant="body2"
                                fontWeight={isSummary ? "bold" : "normal"}
                              >
                                {formatValue(values["AM Exit Gap"] || 0)}
                              </Typography>
                              {isSummary && (
                                <Typography
                                  variant="caption"
                                  color="#002060"
                                  fontWeight="bold"
                                >
                                  (D - E)
                                </Typography>
                              )}
                            </Box>
                          </TableCell>

                          {/* Allocation Return + AM Return */}
                          <TableCell
                            sx={{
                              borderLeft: "2px solid #484547",
                              fontWeight: isSummary ? "bold" : "normal",
                              minWidth: "40px",
                            }}
                          >
                            <Box>
                              <Typography
                                variant="body2"
                                fontWeight={isSummary ? "bold" : "normal"}
                              >
                                {formatValue(
                                  values["Allocation Return"] +
                                    values["AM Return"]
                                )}
                              </Typography>
                              {isSummary && (
                                <Typography
                                  variant="caption"
                                  color="#002060"
                                  fontWeight="bold"
                                >
                                  (G)
                                </Typography>
                              )}
                            </Box>
                          </TableCell>

                          {/* Model Return 1% Allocation + Model AM Return */}
                          <TableCell
                            sx={{
                              fontWeight: isSummary ? "bold" : "normal",
                              minWidth: "40px",
                            }}
                          >
                            <Box>
                              <Typography
                                variant="body2"
                                fontWeight={isSummary ? "bold" : "normal"}
                              >
                                {formatValue(
                                  (values["Model Return 1% Allocation"] || 0) +
                                    (values["Model AM Return"] || 0)
                                )}
                              </Typography>
                              {isSummary && (
                                <Typography
                                  variant="caption"
                                  color="#002060"
                                  fontWeight="bold"
                                >
                                  (H)
                                </Typography>
                              )}
                            </Box>
                          </TableCell>

                          {/* Complex calculation */}
                          <TableCell
                            sx={{
                              bgcolor: !isSummary ? "#f8f9cd" : "transparent",
                            }}
                          >
                            <Box>
                              <Typography
                                variant="body2"
                                fontWeight={isSummary ? "bold" : "normal"}
                              >
                                {formatValue(
                                  (values["Allocation Return"] || 0) +
                                    (values["AM Return"] || 0) -
                                    (values["Model Return 1% Allocation"] ||
                                      0) -
                                    (values["Model AM Return"] || 0)
                                )}
                              </Typography>
                              {isSummary && (
                                <Typography
                                  variant="caption"
                                  color="#002060"
                                  fontWeight="bold"
                                >
                                  (G - H)
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
          </Paper>
        ))}
    </div>
  );
};

export default SectorRegionComponent;
