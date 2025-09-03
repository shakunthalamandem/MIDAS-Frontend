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
  "three_years_before",
  "two_years_before",
  "one_year_before",
  "current_year",
  "one_year_later",
];

const forecastYearLabels = ["2022 A", "2023 A", "2024 A", "2025 E", "2026 E"];

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

const priorityOrder = [
  "Sales",
  "Sales Growth",
  "Net Interest Income",
  "Net Interest Income Growth",
  "Gross Profit",
  "Gross Profit Growth",
  "Gross Profit Margin", // margin just after gross profit
  "EBIT",
  "EBIT Growth",
  "NII after provision for credit losses",
  "NII after provision for credit losses Growth",
  "PBT",
  "PBT Growth",
  "Net Income",
  "Net Income Growth",
  "Net Income Margin", // margin after net income
];

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
    // Ensure paired metrics and margins exist so calculations don't break
    const allNeeded = new Set<string>([...priorityOrder]);
    // also add whatever keys exist in copied (we don't want to lose them)
    Object.keys(copied || {}).forEach((k) => allNeeded.add(k));

    Array.from(allNeeded).forEach((key) => {
      ensureMetricStructure(copied, key);
    });

    // If growth fields are null but we can compute them from existing data, compute
    for (const metric of [
      "Sales",
      "Net Interest Income",
      "NII after provision for credit losses",
      "Gross Profit",
      "EBIT",
      "PBT",
      "Net Income",
    ]) {
      const growthMetric = metric + " Growth";
      if (!copied[growthMetric]) ensureMetricStructure(copied, growthMetric);

      for (const idx of [2, 3, 4]) {
        // indices for one_year_before (2), current_year (3), one_year_later (4) match forecastYearKeys
        // Only compute current_year and one_year_later
      }
      // compute current_year growth if possible
      const prev = safeNumber(copied[metric]?.["one_year_before"]);
      const curr = safeNumber(copied[metric]?.["current_year"]);
      const next = safeNumber(copied[metric]?.["one_year_later"]);

      const currGrowth = computeGrowthPct(prev, curr);
      const nextGrowth = computeGrowthPct(curr, next);

      copied[growthMetric]["one_year_before"] =
        copied[growthMetric]["one_year_before"] ?? null;
      copied[growthMetric]["current_year"] =
        currGrowth !== null
          ? Number(currGrowth)
          : (copied[growthMetric]["current_year"] ?? null);
      copied[growthMetric]["one_year_later"] =
        nextGrowth !== null
          ? Number(nextGrowth)
          : (copied[growthMetric]["one_year_later"] ?? null);

      // For margins compute if underlying values exist
      if (metric === "Gross Profit") {
        ensureMetricStructure(copied, "Gross Profit Margin");
        for (const ky of forecastYearKeys) {
          const gp = safeNumber(copied["Gross Profit"]?.[ky]);
          const sales = safeNumber(copied["Sales"]?.[ky]);
          copied["Gross Profit Margin"][ky] = sales
            ? (gp / sales) * 100
            : (copied["Gross Profit Margin"][ky] ?? null);
        }
      }
      if (metric === "Net Income") {
        ensureMetricStructure(copied, "Net Income Margin");
        for (const ky of forecastYearKeys) {
          const ni = safeNumber(copied["Net Income"]?.[ky]);
          const sales = safeNumber(copied["Sales"]?.[ky]);
          copied["Net Income Margin"][ky] = sales
            ? (ni / sales) * 100
            : (copied["Net Income Margin"][ky] ?? null);
        }
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

      // Helper to parse numbers safely
      const num = (v: any) => {
        const n = Number(v);
        return isNaN(n) ? 0 : n;
      };

      // When a base metric changes, update associated growth/margins
      const recalcGrowthForMetric = (baseMetric: string) => {
        const growthMetric = baseMetric + " Growth";
        ensureMetricStructure(data, growthMetric);

        const prevVal = safeNumber(data[baseMetric]?.["one_year_before"]);
        const currVal = safeNumber(data[baseMetric]?.["current_year"]);
        const nextVal = safeNumber(data[baseMetric]?.["one_year_later"]);

        data[growthMetric]["current_year"] = prevVal
          ? computeGrowthPct(prevVal, currVal)
          : data[growthMetric]["current_year"];
        data[growthMetric]["one_year_later"] = currVal
          ? computeGrowthPct(currVal, nextVal)
          : data[growthMetric]["one_year_later"];
      };

      const recalcBaseFromGrowth = (
        baseMetric: string,
        growthMetric: string
      ) => {
        ensureMetricStructure(data, baseMetric);
        // If user edited growth current_year -> base current_year = prev * (1 + growth/100)
        const prevVal = safeNumber(data[baseMetric]?.["one_year_before"]);
        const growthCurr = safeNumber(data[growthMetric]?.["current_year"]);
        const growthNext = safeNumber(data[growthMetric]?.["one_year_later"]);
        if (
          yearKey === "current_year" &&
          prevVal &&
          data[growthMetric]?.["current_year"] != null
        ) {
          data[baseMetric]["current_year"] = computeValueFromGrowth(
            prevVal,
            Number(data[growthMetric]["current_year"])
          );
        }
        if (
          yearKey === "one_year_later" &&
          safeNumber(data[baseMetric]?.["current_year"]) &&
          data[growthMetric]?.["one_year_later"] != null
        ) {
          const currBase = safeNumber(data[baseMetric]["current_year"]);
          data[baseMetric]["one_year_later"] = computeValueFromGrowth(
            currBase,
            Number(data[growthMetric]["one_year_later"])
          );
        }
      };

      // ==== SALES ↔ SALES GROWTH ====
      if (metricName === "Sales") {
        recalcGrowthForMetric("Sales");
      }
      if (metricName === "Sales Growth") {
        recalcBaseFromGrowth("Sales", "Sales Growth");
      }

      // ==== NET INTEREST INCOME ↔ NET INTEREST INCOME GROWTH ====
      if (metricName === "Net Interest Income") {
        recalcGrowthForMetric("Net Interest Income");
      }
      if (metricName === "Net Interest Income Growth") {
        recalcBaseFromGrowth(
          "Net Interest Income",
          "Net Interest Income Growth"
        );
      }

      // ==== NII after provision for credit losses ↔ its Growth ====
      if (metricName === "NII after provision for credit losses") {
        recalcGrowthForMetric("NII after provision for credit losses");
      }
      if (metricName === "NII after provision for credit losses Growth") {
        recalcBaseFromGrowth(
          "NII after provision for credit losses",
          "NII after provision for credit losses Growth"
        );
      }

      // ==== GROSS PROFIT ↔ GROSS PROFIT GROWTH & GROSS PROFIT MARGIN ====
      if (metricName === "Gross Profit") {
        recalcGrowthForMetric("Gross Profit");
        // update Gross Profit Margin for the changed yearKey
        const gp = safeNumber(data["Gross Profit"]?.[yearKey]);
        const sales = safeNumber(data["Sales"]?.[yearKey]);
        ensureMetricStructure(data, "Gross Profit Margin");
        data["Gross Profit Margin"][yearKey] = sales
          ? (gp / sales) * 100
          : data["Gross Profit Margin"][yearKey];
      }
      if (metricName === "Gross Profit Growth") {
        recalcBaseFromGrowth("Gross Profit", "Gross Profit Growth");
        // also update margin if Sales exists
        const gp = safeNumber(data["Gross Profit"]?.[yearKey]);
        const sales = safeNumber(data["Sales"]?.[yearKey]);
        ensureMetricStructure(data, "Gross Profit Margin");
        data["Gross Profit Margin"][yearKey] = sales
          ? (gp / sales) * 100
          : data["Gross Profit Margin"][yearKey];
      }
      if (metricName === "Gross Profit Margin") {
        // if margin edited, update Gross Profit = Sales * margin%
        const sales = safeNumber(data["Sales"]?.[yearKey]);
        const marginNum = Number(data["Gross Profit Margin"]?.[yearKey]);
        if (sales && !isNaN(marginNum)) {
          ensureMetricStructure(data, "Gross Profit");
          data["Gross Profit"][yearKey] = (sales * marginNum) / 100;
          // recalc gross profit growth as well
          recalcGrowthForMetric("Gross Profit");
        }
      }

      // ==== EBIT ↔ EBIT Growth ====
      if (metricName === "EBIT") {
        recalcGrowthForMetric("EBIT");
      }
      if (metricName === "EBIT Growth") {
        recalcBaseFromGrowth("EBIT", "EBIT Growth");
      }

      // ==== PBT ↔ PBT Growth ====
      if (metricName === "PBT") {
        recalcGrowthForMetric("PBT");
      }
      if (metricName === "PBT Growth") {
        recalcBaseFromGrowth("PBT", "PBT Growth");
      }

      // ==== NET INCOME ↔ NET INCOME GROWTH & NET INCOME MARGIN ====
      if (metricName === "Net Income") {
        recalcGrowthForMetric("Net Income");
        // update Net Income Margin
        const ni = safeNumber(data["Net Income"]?.[yearKey]);
        const sales = safeNumber(data["Sales"]?.[yearKey]);
        ensureMetricStructure(data, "Net Income Margin");
        data["Net Income Margin"][yearKey] = sales
          ? (ni / sales) * 100
          : data["Net Income Margin"][yearKey];
      }
      if (metricName === "Net Income Growth") {
        recalcBaseFromGrowth("Net Income", "Net Income Growth");
        // update margin too
        const ni = safeNumber(data["Net Income"]?.[yearKey]);
        const sales = safeNumber(data["Sales"]?.[yearKey]);
        ensureMetricStructure(data, "Net Income Margin");
        data["Net Income Margin"][yearKey] = sales
          ? (ni / sales) * 100
          : data["Net Income Margin"][yearKey];
      }
      if (metricName === "Net Income Margin") {
        // if margin edited, update Net Income = Sales * margin%
        const sales = safeNumber(data["Sales"]?.[yearKey]);
        const marginNum = Number(data["Net Income Margin"]?.[yearKey]);
        if (sales && !isNaN(marginNum)) {
          ensureMetricStructure(data, "Net Income");
          data["Net Income"][yearKey] = (sales * marginNum) / 100;
          recalcGrowthForMetric("Net Income");
        }
      }

      // When Sales changes, recompute all margins that depend on Sales
      if (metricName === "Sales") {
        // Gross Profit Margin and Net Income Margin
        for (const ky of forecastYearKeys) {
          const gp = safeNumber(data["Gross Profit"]?.[ky]);
          const ni = safeNumber(data["Net Income"]?.[ky]);
          const sales = safeNumber(data["Sales"]?.[ky]);
          ensureMetricStructure(data, "Gross Profit Margin");
          ensureMetricStructure(data, "Net Income Margin");
          data["Gross Profit Margin"][ky] = sales
            ? (gp / sales) * 100
            : data["Gross Profit Margin"][ky];
          data["Net Income Margin"][ky] = sales
            ? (ni / sales) * 100
            : data["Net Income Margin"][ky];
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

        // If originalRow is undefined, we still try to patch provided fields
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

  // Determine the ordering for display
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

    // Append any remaining metrics that existed but weren't in priorityOrder
    const remaining = Array.from(existing);
    // Keep original API order if possible (we don't have that reliably), else append alphabetically
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

                            const isMarginMetric = metricName
                              .toLowerCase()
                              .includes("margin");

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
                                      "& .MuiOutlinedInput-root": {
                                        padding: 0,
                                      },
                                      "& .MuiInputBase-input": {
                                        height: "1.5rem",
                                      },
                                    }}
                                  />
                                ) : isMarginMetric ? (
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
