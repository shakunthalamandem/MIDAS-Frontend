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
      const response = await fetch(`${apiUrl}/api/financial_forecasts_data_view/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify({ ticker: tickerToFetch }),
      });

      const json = await response.json();
      if (!response.ok) {
        throw new Error(json.error || json.message || "Failed to fetch forecasts");
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
  }, [defaultTicker]);

  const handleEdit = () => {
    setEditing(true);
    const copied = JSON.parse(
      JSON.stringify(forecasts[forecastsTicker.toUpperCase()] || {})
    );
    setEditedData({ [forecastsTicker.toUpperCase()]: copied });
  };

  const handleCancelEdit = () => {
    setEditing(false);
    setEditedData({});
  };
const handleEditChange = (metricName: string, yearKey: string, value: string) => {
  setEditedData((prev: any) => {
    const updated = {
      ...prev,
      [forecastsTicker.toUpperCase()]: {
        ...prev[forecastsTicker.toUpperCase()],
        [metricName]: {
          ...prev[forecastsTicker.toUpperCase()]?.[metricName],
          [yearKey]: value,
        },
      },
    };

    const data = updated[forecastsTicker.toUpperCase()];
    const numValue = Number(value) || 0;

    // ==== SALES ↔ SALES GROWTH ====
    if (metricName === "Sales") {
      const salesPrev = Number(data["Sales"]?.["one_year_before"]) || 0;
      const salesCurr = Number(data["Sales"]?.["current_year"]) || 0;
      const salesNext = Number(data["Sales"]?.["one_year_later"]) || 0;

      if (yearKey === "current_year" && salesPrev) {
        data["Sales Growth"] = {
          ...data["Sales Growth"],
          current_year: ((salesCurr - salesPrev) / salesPrev) * 100,
        };
      }
      if (yearKey === "one_year_later" && salesCurr) {
        data["Sales Growth"] = {
          ...data["Sales Growth"],
          one_year_later: ((salesNext - salesCurr) / salesCurr) * 100,
        };
      }
    }
    if (metricName === "Sales Growth") {
      if (yearKey === "current_year") {
        const salesPrev = Number(data["Sales"]?.["one_year_before"]) || 0;
        if (salesPrev) {
          data["Sales"] = {
            ...data["Sales"],
            current_year: salesPrev * (1 + numValue / 100),
          };
        }
      }
      if (yearKey === "one_year_later") {
        const salesCurr = Number(data["Sales"]?.["current_year"]) || 0;
        if (salesCurr) {
          data["Sales"] = {
            ...data["Sales"],
            one_year_later: salesCurr * (1 + numValue / 100),
          };
        }
      }
    }

    // ==== GROSS PROFIT ↔ GROSS PROFIT MARGIN ====
    if (metricName === "Gross Profit" || metricName === "Sales") {
      const gp = Number(data["Gross Profit"]?.[yearKey]) || 0;
      const sales = Number(data["Sales"]?.[yearKey]) || 0;
      if (sales) {
        data["Gross Profit Margin"] = {
          ...data["Gross Profit Margin"],
          [yearKey]: (gp / sales) * 100,
        };
      }
    }
    if (metricName === "Gross Profit Margin") {
      const sales = Number(data["Sales"]?.[yearKey]) || 0;
      if (sales) {
        data["Gross Profit"] = {
          ...data["Gross Profit"],
          [yearKey]: sales * (numValue / 100),
        };
      }
    }

    // ==== NET INCOME ↔ NET INCOME MARGIN ====
    if (metricName === "Net Income" || metricName === "Sales") {
      const ni = Number(data["Net Income"]?.[yearKey]) || 0;
      const sales = Number(data["Sales"]?.[yearKey]) || 0;
      if (sales) {
        data["Net Income Margin"] = {
          ...data["Net Income Margin"],
          [yearKey]: (ni / sales) * 100,
        };
      }
    }
    if (metricName === "Net Income Margin") {
      const sales = Number(data["Sales"]?.[yearKey]) || 0;
      if (sales) {
        data["Net Income"] = {
          ...data["Net Income"],
          [yearKey]: sales * (numValue / 100),
        };
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
        const originalRow = forecasts?.[forecastsTicker.toUpperCase()]?.[metricName];

        const fieldsToUpdate: any = {};
        if (row["current_year"] !== originalRow["current_year"]) {
          fieldsToUpdate["current_year"] = row["current_year"];
        }
        if (row["one_year_later"] !== originalRow["one_year_later"]) {
          fieldsToUpdate["one_year_later"] = row["one_year_later"];
        }

        if (Object.keys(fieldsToUpdate).length > 0) {
          const payload = {
            ticker_name: forecastsTicker.toUpperCase(),
            metric_name: metricName,
            ...fieldsToUpdate,
          };

          const response = await fetch(`${apiUrl}/api/financial_forecasts_data_view/`, {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
              Authorization: token ? `Bearer ${token}` : "",
            },
            body: JSON.stringify(payload),
          });

          const result = await response.json();
          if (!response.ok) {
            throw new Error(result.error || result.message || `Failed to update ${metricName}`);
          }
        }
      }

      await handleFetchForecasts(forecastsTicker);
    } catch (error: any) {
      setForecastsError(error.message || "Failed to save data.");
    }
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
                      yearKey === "current_year" || yearKey === "one_year_later";

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
                {Object.entries(
                  forecasts[forecastsTicker.toUpperCase()] || {}
                ).map(([metricName, years]: [string, any], rowIndex) => {
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
                          ? editedData?.[forecastsTicker.toUpperCase()]?.[metricName]?.[yearKey] ??
                            years[yearKey]
                          : years[yearKey];

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
                            ) : metricName.includes("margin") ? (
                              formatFinancialMargin(value)
                            ) : (
                              formatFinancialValue(value)
                            )}
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        )}
    </Container>
  );
};

export default FinancialForecastTable;
