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
    <div>
      {Object.entries(data)
        .sort(([yearA], [yearB]) => Number(yearB) - Number(yearA))
        .map(([year, categories]) => (
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
              sx={{
                textAlign: "center",
                mb: 2,
                fontWeight: "bold",
                color: "#002060",
              }}
            >
              {`${option} wise Data for ${year}`}
            </Typography>
            <TableContainer component={Paper} sx={{ border: "1px solid #ccc" }}>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ backgroundColor: "#466675" }}>
                    <TableCell sx={{ color: "white", minWidth: "150px" }}>
                      {option}
                    </TableCell>
                    <TableCell sx={{ color: "white", minWidth: "200px" }}>
                      T+1M Absolute Returns
                    </TableCell>
                    <TableCell sx={{ color: "white", minWidth: "100px" }}>
                      No of Deals
                    </TableCell>
                    <TableCell sx={{ color: "white", minWidth: "150px" }}>
                      Deal Volume ($)
                    </TableCell>
                    <TableCell sx={{ color: "white", minWidth: "200px" }}>
                      Allocation as % of Deal Size (Weighted)
                    </TableCell>
                    <TableCell sx={{ color: "white", minWidth: "200px" }}>
                      Allocation as % of IOI (Weighted)
                    </TableCell>
                    <TableCell
                      sx={{
                        color: "white",
                        borderLeft: "2px solid #484547",
                        minWidth: "200px",
                      }}
                    >
                      Monashee Actual Allocation PnL (Gross)
                    </TableCell>
                    <TableCell sx={{ color: "white", minWidth: "200px" }}>
                      Model PnL With Actual Allocation (Gross)
                    </TableCell>
                    <TableCell sx={{ color: "white", minWidth: "200px" }}>
                      Model PnL with model Allocation
                    </TableCell>
                    <TableCell sx={{ color: "white", minWidth: "100px" }}>
                      Model Allocation Gap
                    </TableCell>
                    <TableCell sx={{ color: "white", minWidth: "100px" }}>
                      Monashee Exit Gap
                    </TableCell>
                    <TableCell
                      sx={{
                        color: "white",
                        borderLeft: "2px solid #484547",
                        minWidth: "200px",
                      }}
                    >
                      Monashee Actual AM PnL (Gross)
                    </TableCell>
                    <TableCell sx={{ color: "white", minWidth: "200px" }}>
                      Model PnL with model AM(Gross)
                    </TableCell>
                    <TableCell sx={{ color: "white", minWidth: "100px" }}>
                      AM Gap
                    </TableCell>
                    <TableCell
                      sx={{
                        color: "white",
                        borderLeft: "2px solid #484547",
                        minWidth: "200px",
                      }}
                    >
                      Monashee Actual Total PnL (Gross)
                    </TableCell>
                    <TableCell sx={{ color: "white", minWidth: "200px" }}>
                      Model Actual Total PnL (Gross)
                    </TableCell>
                    <TableCell sx={{ color: "white", minWidth: "100px" }}>
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
                              minWidth: "150px",
                            }}
                          >
                            {category}
                          </TableCell>
                          <TableCell
                            sx={{
                              fontWeight: isSummary ? "bold" : "normal",
                              minWidth: "200px",
                            }}
                          >
                            {values["Min t1m_return_from_dealogic"] !==
                            undefined
                              ? `${values["Min t1m_return_from_dealogic"].toFixed(1)}%`
                              : "N/A"}{" "}
                            to{" "}
                            {values["Max t1m_return_from_dealogic"] !==
                            undefined
                              ? `${values["Max t1m_return_from_dealogic"].toFixed(1)}%`
                              : "N/A"}
                          </TableCell>
                          <TableCell
                            sx={{
                              fontWeight: isSummary ? "bold" : "normal",
                              minWidth: "100px",
                            }}
                          >
                            {values["Number of deals"]}
                          </TableCell>
                          <TableCell
                            sx={{
                              fontWeight: isSummary ? "bold" : "normal",
                              minWidth: "150px",
                            }}
                          >
                            {formatValue(values["Deal volume"])}
                          </TableCell>
                          <TableCell
                            sx={{
                              fontWeight: isSummary ? "bold" : "normal",
                              minWidth: "200px",
                            }}
                          >
                            {(values[
                              "Weighted Allocation as % of Deal Size"
                            ]?.toFixed(2) || "0.00") + "%"}
                          </TableCell>
                          <TableCell
                            sx={{
                              fontWeight: isSummary ? "bold" : "normal",
                              minWidth: "200px",
                            }}
                          >
                            {(values[
                              "Weighted Allocation as % of IOI"
                            ]?.toFixed(2) || "0.00") + "%"}
                          </TableCell>
                          <TableCell
                            sx={{
                              borderLeft: "2px solid #484547",
                              fontWeight: isSummary ? "bold" : "normal",
                              minWidth: "200px",
                            }}
                          >
                            {formatValue(values["Allocation Return"])}
                          </TableCell>
                          <TableCell
                            sx={{
                              fontWeight: isSummary ? "bold" : "normal",
                              minWidth: "200px",
                            }}
                          >
                            {formatValue(values["Model Actual Return"])}
                          </TableCell>
                          <TableCell
                            sx={{
                              fontWeight: isSummary ? "bold" : "normal",
                              minWidth: "200px",
                            }}
                          >
                            {formatValue(values["Model Return 1% Allocation"])}
                          </TableCell>
                          <TableCell sx={{ minWidth: "100px" }}>
                            {isSummary ? (
                              <strong>
                                {formatValue(
                                  values["Model Allocation Gap"] || 0
                                )}
                              </strong>
                            ) : (
                              formatValue(values["Model Allocation Gap"] || 0)
                            )}
                          </TableCell>
                          <TableCell sx={{ minWidth: "100px" }}>
                            {isSummary ? (
                              <strong>
                                {formatValue(values["Monashee Exit Gap"] || 0)}
                              </strong>
                            ) : (
                              formatValue(values["Monashee Exit Gap"] || 0)
                            )}
                          </TableCell>
                          <TableCell
                            sx={{
                              borderLeft: "2px solid #484547",
                              fontWeight: isSummary ? "bold" : "normal",
                              minWidth: "200px",
                            }}
                          >
                            {formatValue(values["AM Return"])}
                          </TableCell>
                          <TableCell
                            sx={{
                              fontWeight: isSummary ? "bold" : "normal",
                              minWidth: "200px",
                            }}
                          >
                            {formatValue(values["Model AM Return"])}
                          </TableCell>
                          <TableCell sx={{ minWidth: "100px" }}>
                            {isSummary ? (
                              <strong>
                                {formatValue(values["AM Gap"] || 0)}
                              </strong>
                            ) : (
                              formatValue(values["AM Gap"] || 0)
                            )}
                          </TableCell>
                          <TableCell
                            sx={{
                              borderLeft: "2px solid #484547",
                              fontWeight: isSummary ? "bold" : "normal",
                              minWidth: "200px",
                            }}
                          >
                            {formatValue(
                              values["Allocation Return"] + values["AM Return"]
                            )}
                          </TableCell>
                          <TableCell
                            sx={{
                              fontWeight: isSummary ? "bold" : "normal",
                              minWidth: "200px",
                            }}
                          >
                            {formatValue(
                              (values["Model Return 1% Allocation"] || 0) +
                                (values["Model AM Return"] || 0)
                            )}
                          </TableCell>
                          <TableCell sx={{ minWidth: "100px" }}>
                            {isSummary ? (
                              <strong>
                                {formatValue(
                                  (values["Allocation Return"] || 0) +
                                    (values["AM Return"] || 0) -
                                    (values["Model Return 1% Allocation"] ||
                                      0) -
                                    (values["Model AM Return"] || 0)
                                )}
                              </strong>
                            ) : (
                              formatValue(
                                (values["Allocation Return"] || 0) +
                                  (values["AM Return"] || 0) -
                                  (values["Model Return 1% Allocation"] || 0) -
                                  (values["Model AM Return"] || 0)
                              )
                            )}
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
