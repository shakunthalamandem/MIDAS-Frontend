import React, { useState, useEffect } from "react";
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  CircularProgress,
  Alert,
  TextField,
  IconButton,
  Container,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Cancel";

const forecastYearKeys = [
  "three_years_before",
  "two_years_before",
  "one_year_before",
  "current_year", // 2025 E
  "one_year_later", // 2026 E
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

  const [editing, setEditing] = useState<boolean>(false);
  const [editedData, setEditedData] = useState<any>(null);

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
    // eslint-disable-next-line
  }, [defaultTicker]);

  const handleEdit = () => {
    setEditing(true);
    setEditedData({ ...forecasts });
  };

  const handleCancelEdit = () => {
    setEditing(false);
    setEditedData(null);
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

  const handleValueChange = (rowKey: string, yearKey: string, value: string) => {
    setEditedData((prevData: any) => ({
      ...prevData,
      [forecastsTicker.toUpperCase()]: {
        ...prevData[forecastsTicker.toUpperCase()],
        [rowKey]: {
          ...prevData[forecastsTicker.toUpperCase()][rowKey],
          [yearKey]: value,
        },
      },
    }));
  };

  return (
    <Container sx={{ maxWidth: "xl", b: 4 }}>
      <Typography
        variant="h6"
        sx={{ mb: 2, mt: 4 }}
        color="#002060"
        fontWeight={600}
        align="center"
      >
        Financial Forecasts (FYE{" "}
        {forecastsTicker?.toUpperCase() === "MH" ? "Mar 31" : "Dec 31"}, Internal
        Estimates)
      </Typography>

      {forecastsLoading && <CircularProgress />}
      {forecastsError && <Alert severity="error">{forecastsError}</Alert>}

      {!forecastsLoading &&
        forecasts &&
        forecasts[forecastsTicker.toUpperCase()] && (
          <TableContainer component={Paper} elevation={4}>
            <Table size="small">
              <TableHead sx={{ backgroundColor: "#002060" }}>
                <TableRow>
                  <TableCell
                    sx={{
                      fontWeight: "bold",
                      color: "#FFFFFF",
                      border: "1px solid #000000",
                      textAlign: "center",
                    }}
                  >
                    ($US M)
                  </TableCell>
  {forecastYearLabels.map((label, index) => (
  <TableCell
    key={label}
    sx={{
      fontWeight: "bold",
      color: "#FFFFFF",
      border: "1px solid #000000",
      textAlign: "center",
      backgroundColor: index === 3 || index === 4 ? "#5f521eff" : "",
      position: "relative", // needed for absolute positioning of icons
    }}
  >
    {/* Centered label */}
    <Typography
      variant="body2"
      sx={{
        color: "#FFFFFF",
        fontWeight: "bold",
        textAlign: "center",
      }}
    >
      {label}
    </Typography>

    {/* Buttons aligned to right inside the cell */}
    {(index === 3 || index === 4) && (
      <Box
        sx={{
          position: "absolute",
          right: 4,
          top: "50%",
          transform: "translateY(-50%)",
          display: "flex",
          gap: 0.5,
        }}
      >
        {!editing ? (
          <IconButton onClick={handleEdit} size="small">
            <EditIcon sx={{ color: "#FFFFFF", fontSize: 16 }} />
          </IconButton>
        ) : (
          <>
            <IconButton onClick={handleSave} size="small">
              <SaveIcon sx={{ color: "#eceef0ff", fontSize: 16 }} />
            </IconButton>
            <IconButton onClick={handleCancelEdit} size="small">
              <CancelIcon sx={{ color: "#f1f1f1ff", fontSize: 16 }} />
            </IconButton>
          </>
        )}
      </Box>
    )}
  </TableCell>
))}


                </TableRow>
              </TableHead>
              <TableBody>
                {Object.entries(
                  forecasts[forecastsTicker.toUpperCase()] || {}
                ).map(([metricName, years]: [string, any], rowIndex) => {
                  const isEvenRow = rowIndex % 2 === 0;

                  return (
                    <TableRow
                      key={metricName}
                      sx={{
                        backgroundColor: isEvenRow ? "#E9EBFA" : "#FFFFFF",
                      }}
                    >
                      <TableCell
                        sx={{
                          fontWeight: "bold",
                          border: "1px solid #000000",
                          textAlign: "left",
                          fontSize: "0.875rem",
                        }}
                      >
                        {metricName}
                      </TableCell>

                      {forecastYearKeys.map((yearKey, colIndex) => (
                        <TableCell
                          key={yearKey}
                          sx={{
                            border: "1px solid #000000",
                            textAlign: "center",
                            backgroundColor:
                              yearKey === "current_year" || yearKey === "one_year_later"
                                ? "#f9f7f1"
                                : "",
                            fontSize: isEvenRow ? "0.875rem" : "0.725rem",
                          }}
                        >
                          {editing &&
                          (yearKey === "current_year" ||
                            yearKey === "one_year_later") ? (
                            <TextField
                              value={
                                editedData?.[forecastsTicker.toUpperCase()]?.[metricName]?.[
                                  yearKey
                                ] || ""
                              }
                              onChange={(e) =>
                                handleValueChange(metricName, yearKey, e.target.value)
                              }
                              size="small"
                              variant="outlined"
                              inputProps={{
                                style: {
                                  textAlign: "center",
                                  fontSize: isEvenRow ? "0.875rem" : "0.725rem",
                                  padding: 4,
                                  width: "80px",
                                },
                              }}
                              sx={{
                                '& .MuiInputBase-root': {
                                  padding: "0 !important",
                                  height: "28px",
                                  minHeight: "28px",
                                },
                              }}
                            />
                          ) : metricName.includes("Margin") ? (
                            formatFinancialMargin(years[yearKey])
                          ) : (
                            formatFinancialValue(years[yearKey])
                          )}
                        </TableCell>
                      ))}
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
