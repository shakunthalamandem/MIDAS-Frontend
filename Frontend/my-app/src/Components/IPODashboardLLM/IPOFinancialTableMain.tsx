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
  Button,
  IconButton,
  Container,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";

// Forecasts table columns
const forecastYearKeys = [
  "three_years_before",
  "two_years_before",
  "one_year_before",
  "current_year",
  "one_year_later",
];

const forecastYearLabels = [
  "2022 A",
  "2023 A",
  "2024 A",
  "2025 E",
  "2026 E",
];

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

  const fixed = num.toFixed(2); // Round to 2 decimal places
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

  // For editing mode
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
    // eslint-disable-next-line
  }, [defaultTicker]);

  const handleEdit = () => {
    setEditing(true);
    setEditedData({ ...forecasts });
  };

  const handleSave = async () => {
    setEditing(false);

    // Save the updated data (send to API)
    const apiUrl = process.env.REACT_APP_API_URL;
    const token = localStorage.getItem("access_token");
    if (!apiUrl) return;

    try {
      const response = await fetch(`${apiUrl}/api/save_forecast_data/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify({
          ticker: forecastsTicker,
          data: editedData,
        }),
      });

      const json = await response.json();
      if (response.ok) {
        setForecasts(json);
      } else {
        setForecastsError(json.error || json.message);
      }
    } catch (error) {
      setForecastsError("Failed to save data.");
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
                        backgroundColor:
                          index === 3 || index === 4 ? "#443600ff" : "",
                      }}
                    >
                      {label}
                      {(index === 3 || index === 4) && !editing && (
                        <IconButton onClick={handleEdit}>
                          <EditIcon sx={{ color: "#FFFFFF" ,fontSize:'16px'}} />
                        </IconButton>
                      )}
                      {editing && (index === 3 || index === 4) && (
                        <IconButton onClick={handleSave}>
                          <SaveIcon sx={{ color: "#FFFFFF" }} />
                        </IconButton>
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
                    <TableRow key={metricName}>
                      <TableCell
                        sx={{
                          border: "1px solid #000000",
                          fontWeight: "bold",
                          fontStyle: isEvenRow ? "normal" : "italic",
                          fontSize: isEvenRow ? "0.875rem" : "0.725rem",
                          backgroundColor: isEvenRow ? "" : "#ebebeb",
                        }}
                      >
                        {metricName}
                      </TableCell>
                      {forecastYearKeys.map((yearKey, columnIndex) => {
                        const formattedValue = formatFinancialValue(
                          years[yearKey]
                        );
                        const MarginformattedValue = formatFinancialMargin(
                          years[yearKey]
                        );
                        const displayValue = isEvenRow
                          ? formattedValue
                          : `${MarginformattedValue}%`;

                        return (
                          <TableCell
                            key={yearKey}
                            align="center"
                            sx={{
                              border: "1px solid #000000",
                              fontStyle: isEvenRow ? "normal" : "italic",
                              fontSize: isEvenRow ? "0.875rem" : "0.725rem",
                              backgroundColor:
                                columnIndex === 3 || columnIndex === 4
                                  ? "#a0a0a0ff"
                                  : "",
                            }}
                          >
                            {editing && (columnIndex === 3 || columnIndex === 4) ? (
                              <TextField
                                value={editedData?.[forecastsTicker.toUpperCase()]?.[metricName]?.[yearKey] || ""}
                                onChange={(e) =>
                                  handleValueChange(metricName, yearKey, e.target.value)
                                }
                                size="small"
                                variant="outlined"
                                fullWidth
                              />
                            ) : (
                              displayValue
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
      {!forecastsLoading &&
        forecasts &&
        !forecasts[forecastsTicker.toUpperCase()] && (
          <Alert severity="info">No forecasts found for this ticker.</Alert>
        )}
    </Container>
  );
};

export default FinancialForecastTable;
