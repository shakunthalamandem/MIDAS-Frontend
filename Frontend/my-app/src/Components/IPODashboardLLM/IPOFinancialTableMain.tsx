import React, { useState, useEffect } from "react";
import {
  Container,
  Typography,
  CircularProgress,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  IconButton,
  Box,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Cancel";

const forecastYearKeys = [
  // "three_years_before",
  "two_years_before",
  "one_year_before",
  "current_year",
  "one_year_later",
];

const forecastYearLabels = [ "2023 A", "2024 A", "2025 E", "2026 E"];

interface FinancialForecastTableProps {
  defaultTicker?: string;
}

function formatFinancialValue(value: number | string): string {
  if (value === null || value === undefined || value === "N/A") return "N/A";
  const num = Number(value);
  if (isNaN(num)) return String(value);
  const rounded = Math.round(num);
  const absValue = Math.abs(rounded).toLocaleString("en-US");
  return rounded < 0 ? `(${absValue})` : absValue;
}

function formatFinancialMargin(value: number | string): string {
  if (value === null || value === undefined || value === "N/A") return "N/A";
  const num = Number(value);
  if (isNaN(num)) return String(value);
  const fixed = num.toFixed(2);
  const absValue = Math.abs(Number(fixed)).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return num < 0 ? `(${absValue})` : absValue;
}

// ---- NEW METRIC MODEL (finance perspective) ----
const priorityOrder = [
  "Sales",
  "Sales Growth",

  "Net Interest Income",
  "Net Interest Income Growth",

  "Gross Profit",
  "Gross Profit Margin",

  "EBIT",
  "EBIT Margin",

  "NII after provision for credit losses",
  "NII after provision for credit losses Growth",

  "EBITDA",
  "EBITDA Margin",

  "Adj. EBITDA",
  "Adj. EBITDA Margin",

  "PBT",
  "PBT Margin",

  "Net Income",
  "Net Income Margin",
];

// Which base metrics have a paired Growth metric
const growthPairs: Record<string, string> = {
  "Sales": "Sales Growth",
  "Net Interest Income": "Net Interest Income Growth",
  "NII after provision for credit losses":
    "NII after provision for credit losses Growth",
};

// Which base metrics have a paired Margin metric (as % of Sales)
const marginPairs: Record<string, string> = {
  "Gross Profit": "Gross Profit Margin",
  "EBIT": "EBIT Margin",
  "EBITDA": "EBITDA Margin",
  "Adj. EBITDA": "Adj. EBITDA Margin",
  "PBT": "PBT Margin",
  "Net Income": "Net Income Margin",
};

const FinancialForecastTable: React.FC<FinancialForecastTableProps> = ({
  defaultTicker = "",
}) => {
  const [forecastsInput, setForecastsInput] = useState(defaultTicker);
  const [forecastsTicker, setForecastsTicker] = useState(defaultTicker);
  const [forecasts, setForecasts] = useState<any | null>(null);
  const [forecastsLoading, setForecastsLoading] = useState(false);
  const [forecastsError, setForecastsError] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [editedData, setEditedData] = useState<any>({});

  const handleFetchForecasts = async (customTicker?: string) => {
    setForecastsLoading(true);
    setForecastsError(null);
    setForecasts(null);
    try {
      const apiUrl = process.env.REACT_APP_API_URL;
      const token = localStorage.getItem("access_token");
      if (!apiUrl) throw new Error("API URL not set");

      const tickerToFetch = customTicker ?? forecastsInput;
      const response = await fetch(
        `${apiUrl}/api/financial_forecasts_data_view/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : "",
          },
          body: JSON.stringify({ ticker: tickerToFetch }),
        }
      );

      const json = await response.json();
      if (!response.ok) {
        throw new Error(
          json.error || json.message || "Failed to fetch forecasts"
        );
      }

      setForecasts(json);
      setForecastsTicker(tickerToFetch);
    } catch (e: any) {
      setForecastsError(e.message || "Unknown error");
    } finally {
      setForecastsLoading(false);
    }
  };

  useEffect(() => {
    setForecastsInput(defaultTicker);
    setForecastsTicker(defaultTicker);
    handleFetchForecasts(defaultTicker);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultTicker]);

  const safeNumber = (v: any) => {
    const n = Number(v);
    return isNaN(n) ? 0 : n;
  };

  const computeGrowthPct = (prev: number, curr: number) => {
    if (!prev || prev === 0) return null;
    return ((curr - prev) / prev) * 100;
  };

  const computeValueFromGrowth = (prev: number, growthPct: number) => {
    return prev * (1 + growthPct / 100);
  };

  const ensureMetricStructure = (data: any, metric: string) => {
    if (!data[metric]) {
      data[metric] = {};
      for (const k of forecastYearKeys) data[metric][k] = null;
    }
  };

  const handleEdit = () => {
    setEditing(true);
    const copied = JSON.parse(
      JSON.stringify(forecasts[forecastsTicker.toUpperCase()] || {})
    );

    // Ensure all metrics in our finance model exist
    const needed = new Set<string>([...priorityOrder]);
    Object.keys(copied || {}).forEach((k) => needed.add(k));
    Array.from(needed).forEach((key) => ensureMetricStructure(copied, key));

    // Pre-compute growth for supported pairs and margins for all margin pairs
    for (const base of Object.keys(growthPairs)) {
      const growth = growthPairs[base];
      ensureMetricStructure(copied, base);
      ensureMetricStructure(copied, growth);

      const prev = safeNumber(copied[base]?.["one_year_before"]);
      const curr = safeNumber(copied[base]?.["current_year"]);
      const next = safeNumber(copied[base]?.["one_year_later"]);

      const currGrowth = computeGrowthPct(prev, curr);
      const nextGrowth = computeGrowthPct(curr, next);

      copied[growth]["one_year_before"] =
        copied[growth]["one_year_before"] ?? null;
      copied[growth]["current_year"] =
        currGrowth !== null
          ? Number(currGrowth)
          : copied[growth]["current_year"] ?? null;
      copied[growth]["one_year_later"] =
        nextGrowth !== null
          ? Number(nextGrowth)
          : copied[growth]["one_year_later"] ?? null;
    }

    for (const [base, margin] of Object.entries(marginPairs)) {
      ensureMetricStructure(copied, base);
      ensureMetricStructure(copied, "Sales");
      ensureMetricStructure(copied, margin);
      for (const ky of forecastYearKeys) {
        const b = safeNumber(copied[base][ky]);
        const s = safeNumber(copied["Sales"][ky]);
        copied[margin][ky] = s ? (b / s) * 100 : copied[margin][ky] ?? null;
      }
    }

    setEditedData({ [forecastsTicker.toUpperCase()]: copied });
  };

  const handleCancelEdit = () => {
    setEditing(false);
    setEditedData({});
  };

  const handleEditChange = (
    metricName: string,
    yearKey: string,
    value: string
  ) => {
    setEditedData((prev: any) => {
      const updated = {
        ...prev,
        [forecastsTicker.toUpperCase()]: {
          ...prev[forecastsTicker.toUpperCase()],
          [metricName]: {
            ...prev[forecastsTicker.toUpperCase()]?.[metricName],
            [yearKey]: value === "" ? null : value,
          },
        },
      };

      const data = updated[forecastsTicker.toUpperCase()];

      const recalcGrowthFor = (baseMetric: string) => {
        const growthMetric = growthPairs[baseMetric];
        if (!growthMetric) return;
        ensureMetricStructure(data, baseMetric);
        ensureMetricStructure(data, growthMetric);

        const prevVal = safeNumber(data[baseMetric]?.["one_year_before"]);
        const currVal = safeNumber(data[baseMetric]?.["current_year"]);
        const nextVal = safeNumber(data[baseMetric]?.["one_year_later"]);

        data[growthMetric]["current_year"] =
          prevVal ? computeGrowthPct(prevVal, currVal) : data[growthMetric]["current_year"];
        data[growthMetric]["one_year_later"] =
          currVal ? computeGrowthPct(currVal, nextVal) : data[growthMetric]["one_year_later"];
      };

      const recalcBaseFromGrowth = (baseMetric: string, growthMetric: string) => {
        ensureMetricStructure(data, baseMetric);
        ensureMetricStructure(data, growthMetric);

        const prevVal = safeNumber(data[baseMetric]?.["one_year_before"]);
        const currBase = safeNumber(data[baseMetric]?.["current_year"]);
        const growthCurr = data[growthMetric]?.["current_year"];
        const growthNext = data[growthMetric]?.["one_year_later"];

        if (yearKey === "current_year" && prevVal && growthCurr != null) {
          data[baseMetric]["current_year"] = computeValueFromGrowth(
            prevVal,
            Number(growthCurr)
          );
        }
        if (yearKey === "one_year_later" && currBase && growthNext != null) {
          data[baseMetric]["one_year_later"] = computeValueFromGrowth(
            currBase,
            Number(growthNext)
          );
        }
      };

      const recalcMarginFor = (baseMetric: string, key: string) => {
        const marginMetric = marginPairs[baseMetric];
        if (!marginMetric) return;
        ensureMetricStructure(data, "Sales");
        ensureMetricStructure(data, baseMetric);
        ensureMetricStructure(data, marginMetric);
        const s = safeNumber(data["Sales"]?.[key]);
        const b = safeNumber(data[baseMetric]?.[key]);
        data[marginMetric][key] = s ? (b / s) * 100 : data[marginMetric][key];
      };

      const applyMarginEdit = (marginMetric: string, key: string) => {
        // margin edited -> base = Sales * margin%
        const baseMetric = Object.keys(marginPairs).find(
          (b) => marginPairs[b] === marginMetric
        );
        if (!baseMetric) return;
        ensureMetricStructure(data, baseMetric);
        ensureMetricStructure(data, "Sales");
        const s = safeNumber(data["Sales"]?.[key]);
        const m = Number(data[marginMetric]?.[key]);
        if (s && !isNaN(m)) {
          data[baseMetric][key] = (s * m) / 100;
          // if base changed due to margin edit, re-derive its growth (if applicable)
          if (growthPairs[baseMetric]) recalcGrowthFor(baseMetric);
        }
      };

      // Base ↔ Growth pairs
      if (metricName in growthPairs) {
        recalcGrowthFor(metricName);
      } else {
        // if a *Growth metric* is being edited
        const baseForThisGrowth = Object.keys(growthPairs).find(
          (b) => growthPairs[b] === metricName
        );
        if (baseForThisGrowth) {
          recalcBaseFromGrowth(baseForThisGrowth, metricName);
        }
      }

      // Base ↔ Margin pairs
      if (metricName in marginPairs) {
        // base changed -> update its margin for the edited column
        recalcMarginFor(metricName, yearKey);
      } else {
        // margin edited -> recompute base from margin
        const baseForThisMargin = Object.keys(marginPairs).find(
          (b) => marginPairs[b] === metricName
        );
        if (baseForThisMargin) {
          applyMarginEdit(metricName, yearKey);
        }
      }

      // If Sales changes, recompute *all* margins that depend on Sales
      if (metricName === "Sales") {
        for (const [base, margin] of Object.entries(marginPairs)) {
          ensureMetricStructure(data, base);
          ensureMetricStructure(data, margin);
          const s = safeNumber(data["Sales"]?.[yearKey]);
          const b = safeNumber(data[base]?.[yearKey]);
          data[margin][yearKey] = s ? (b / s) * 100 : data[margin][yearKey];
        }
      }

      updated[forecastsTicker.toUpperCase()] = data;
      return updated;
    });
  };

  const handleSave = async () => {
    setEditing(false);
    setForecastsError(null);

    const apiUrl = process.env.REACT_APP_API_URL;
    const token = localStorage.getItem("access_token");
    if (!apiUrl) return;

    try {
      const updatedMetrics = editedData?.[forecastsTicker.toUpperCase()];
      if (!updatedMetrics) throw new Error("No edited data found.");

      for (const metricName in updatedMetrics) {
        const row = updatedMetrics[metricName];
        const originalRow =
          forecasts?.[forecastsTicker.toUpperCase()]?.[metricName];

        const fieldsToUpdate: any = {};
        if (
          !originalRow ||
          row["current_year"] !== originalRow["current_year"]
        ) {
          fieldsToUpdate["current_year"] = row["current_year"];
        }
        if (
          !originalRow ||
          row["one_year_later"] !== originalRow["one_year_later"]
        ) {
          fieldsToUpdate["one_year_later"] = row["one_year_later"];
        }

        if (Object.keys(fieldsToUpdate).length > 0) {
          const payload = {
            ticker_name: forecastsTicker.toUpperCase(),
            metric_name: metricName,
            ...fieldsToUpdate,
          };

          const response = await fetch(
            `${apiUrl}/api/financial_forecasts_data_view/`,
            {
              method: "PATCH",
              headers: {
                "Content-Type": "application/json",
                Authorization: token ? `Bearer ${token}` : "",
              },
              body: JSON.stringify(payload),
            }
          );

          const result = await response.json();
          if (!response.ok) {
            throw new Error(
              result.error || result.message || `Failed to update ${metricName}`
            );
          }
        }
      }

      await handleFetchForecasts(forecastsTicker);
    } catch (error: any) {
      setForecastsError(error.message || "Failed to save data.");
    }
  };

  const getOrderedMetricList = (dataObj: any) => {
    if (!dataObj) return [];
    const existing = new Set(Object.keys(dataObj));
    const ordered: string[] = [];

    for (const name of priorityOrder) {
      if (existing.has(name)) {
        ordered.push(name);
        existing.delete(name);
      }
    }
    const remaining = Array.from(existing);
    remaining.sort();
    ordered.push(...remaining);
    return ordered;
  };

  return (
    <Container sx={{ maxWidth: "xl", mb: 4 }}>
      <Typography
        variant="h6"
        sx={{ mb: 2, mt: 4 }}
        color="#002060"
        fontWeight={600}
        align="center"
      >
        Financial Forecasts (FYE{" "}
        {forecastsTicker?.toUpperCase() === "MH" ? "Mar 31" : "Dec 31"},{" "}
        Internal Estimates)
      </Typography>

      {forecastsLoading && <CircularProgress />}
      {forecastsError && <Alert severity="error">{forecastsError}</Alert>}

      {!forecastsLoading &&
        forecasts &&
        forecasts[forecastsTicker.toUpperCase()] && (
          <TableContainer component={Paper} elevation={4}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell
                    sx={{
                      fontWeight: "bold",
                      color: "#FFFFFF",
                      backgroundColor: "#002060",
                      border: "1px solid #000000",
                      textAlign: "center",
                    }}
                  >
                    ($US M)
                  </TableCell>
                  {forecastYearLabels.map((label, index) => {
                    const yearKey = forecastYearKeys[index];
                    const isEditableColumn =
                      yearKey === "current_year" ||
                      yearKey === "one_year_later";

                    return (
                      <TableCell
                        key={label}
                        sx={{
                          fontWeight: "bold",
                          color: "#FFFFFF",
                          border: "1px solid #000000",
                          textAlign: "center",
                          backgroundColor: isEditableColumn
                            ? "rgb(95, 82, 30)"
                            : "#002060",
                        }}
                      >
                        {label}
                        {isEditableColumn && (
                          <Box component="span" sx={{ ml: 1 }}>
                            {!editing ? (
                              <IconButton
                                onClick={handleEdit}
                                size="small"
                                sx={{ color: "#fff" }}
                              >
                                <EditIcon sx={{ fontSize: 16 }} />
                              </IconButton>
                            ) : (
                              <>
                                <IconButton
                                  onClick={handleSave}
                                  size="small"
                                  sx={{ color: "#fff" }}
                                >
                                  <SaveIcon sx={{ fontSize: 16 }} />
                                </IconButton>
                                <IconButton
                                  onClick={handleCancelEdit}
                                  size="small"
                                  sx={{ color: "#fff" }}
                                >
                                  <CancelIcon sx={{ fontSize: 16 }} />
                                </IconButton>
                              </>
                            )}
                          </Box>
                        )}
                      </TableCell>
                    );
                  })}
                </TableRow>
              </TableHead>

              <TableBody>
                {(() => {
                  const dataObj = forecasts[forecastsTicker.toUpperCase()];
                  const orderedMetrics = getOrderedMetricList(dataObj);

                  return orderedMetrics.map(
                    (metricName: string, rowIndex: number) => {
                      const years = dataObj[metricName] || {};
                      const isEvenRow = rowIndex % 2 === 0;

                      const isMarginMetric =
                        metricName.toLowerCase().includes("margin") ||
                        metricName.toLowerCase().includes("growth");

                      return (
                        <TableRow key={metricName}>
                          <TableCell
                            sx={{
                              border: "1px solid #000000",
                              fontWeight: "bold",
                              fontStyle: isEvenRow ? "normal" : "italic",
                              fontSize: isEvenRow ? "1.3rem" : "1.3rem",
                              backgroundColor: isEvenRow ? "" : "#ebebeb",
                            }}
                          >
                            {metricName}
                          </TableCell>
                          {forecastYearKeys.map((yearKey) => {
                            const isEditableCell =
                              editing &&
                              (yearKey === "current_year" ||
                                yearKey === "one_year_later");

                            const isHighlightColumn =
                              yearKey === "current_year" ||
                              yearKey === "one_year_later";

                            const value = editing
                              ? (editedData?.[forecastsTicker.toUpperCase()]?.[
                                  metricName
                                ]?.[yearKey] ?? years[yearKey])
                              : years[yearKey];

                            // render % for any *Margin or *Growth rows
                            const renderAsPercent =
                              metricName.toLowerCase().includes("margin") ||
                              metricName.toLowerCase().includes("growth");

                            return (
                              <TableCell
                                key={yearKey}
                                align="center"
                                sx={{
                                  border: "1px solid #000000",
                                  fontStyle: isEvenRow ? "normal" : "italic",
                                  fontSize: isEvenRow ? "1.3rem" : "1.3rem",
                                  backgroundColor: isHighlightColumn
                                    ? "rgba(248, 247, 245, 1)"
                                    : isEvenRow
                                      ? ""
                                      : "#ebebeb",
                                  color: "#000000",
                                }}
                              >
                                {isEditableCell ? (
                                  <TextField
                                    variant="outlined"
                                    value={value ?? ""}
                                    onChange={(e) =>
                                      handleEditChange(
                                        metricName,
                                        yearKey,
                                        e.target.value
                                      )
                                    }
                                    inputProps={{
                                      style: {
                                        fontSize: isEvenRow ? "1rem" : "1rem",
                                        textAlign: "center",
                                        padding: "6px 8px",
                                      },
                                    }}
                                    sx={{
                                      width: "100%",
                                      borderRadius: 1,
                                      "& .MuiOutlinedInput-root": { padding: 0 },
                                      "& .MuiInputBase-input": { height: "1.5rem" },
                                    }}
                                  />
                                ) : renderAsPercent ? (
                                  formatFinancialMargin(value)
                                ) : (
                                  formatFinancialValue(value)
                                )}
                              </TableCell>
                            );
                          })}
                        </TableRow>
                      );
                    }
                  );
                })()}
              </TableBody>
            </Table>
          </TableContainer>
        )}
    </Container>
  );
};

export default FinancialForecastTable;
