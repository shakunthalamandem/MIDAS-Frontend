import React, { useState, useEffect, useCallback } from "react";
import { Box, Typography, CircularProgress, IconButton, TextField } from "@mui/material";
import { motion } from "framer-motion";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";

interface FinancialYearData {
  [key: string]: number | undefined;
}

interface FinancialForecastItem {
  id: number;
  ticker: string;
  pricing_date: string | null;
  deal_id: string | null;
  deal_type: string;
  flag_for_writeup: boolean;
  meta_data: Record<string, FinancialYearData>;
}

interface FinancialForecastResponse {
  status: boolean;
  data: FinancialForecastItem[];
}

interface FOWriteUpMetaDataFinancialHighlightsProps {
  ticker: string;
  pricing_date?: string;
  unique_deal_id?: string;
}

// Metrics that should be displayed as percentages
const percentageMetrics = [
  "Sales Growth",
  "EBITDA Margin",
  "Net Income Margin",
  "Gross Profit Margin",
];

// Define preferred order for metrics
const metricOrder = [
  "Sales",
  "Sales Growth",
  "Gross Profit",
  "Gross Profit Margin",
  "EBITDA",
  "EBITDA Margin",
  "Net Income",
  "Net Income Margin",
];

const formatValue = (value: number | undefined, isPercentage: boolean) => {
  if (value === undefined || value === null) return "N/A";
  if (isPercentage) {
    return `${Number(value).toFixed(2)}%`;
  }
  return `$${Number(value).toLocaleString(undefined, { maximumFractionDigits: 2 })}M`;
};

const FOWriteUpMetaDataFinancialHighlights: React.FC<FOWriteUpMetaDataFinancialHighlightsProps> = ({
  ticker,
}) => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [metaData, setMetaData] = useState<Record<string, FinancialYearData> | null>(null);
  const [editData, setEditData] = useState<Record<string, FinancialYearData> | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchFinancialData = useCallback(async () => {
    if (!ticker) return;

    setLoading(true);
    setError(null);
    try {
      const apiUrl = process.env.REACT_APP_API_URL;
      const token = localStorage.getItem("access_token");

      const response = await fetch(`${apiUrl}/api/financial_forecasts_data/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify({ ticker }),
      });

      if (response.ok) {
        const result: FinancialForecastResponse = await response.json();
        if (result.status && result.data && result.data.length > 0) {
          setMetaData(result.data[0].meta_data);
          setEditData(JSON.parse(JSON.stringify(result.data[0].meta_data)));
        } else {
          setError("No financial data available");
        }
      } else {
        setError("Failed to fetch financial data");
      }
    } catch (err) {
      console.error("Fetch error:", err);
      setError("Error fetching financial data");
    } finally {
      setLoading(false);
    }
  }, [ticker]);

  useEffect(() => {
    fetchFinancialData();
  }, [fetchFinancialData]);

  const handleChange = (year: string, metric: string, value: string) => {
    if (!editData) return;

    const parsed = parseFloat(value);
    setEditData({
      ...editData,
      [year]: {
        ...editData[year],
        [metric]: value === "" ? undefined : isNaN(parsed) ? editData[year]?.[metric] : parsed,
      },
    });
  };

  const handleSave = async () => {
    if (!editData) return;

    setSaving(true);
    try {
      const apiUrl = process.env.REACT_APP_API_URL;
      const token = localStorage.getItem("access_token");

      const response = await fetch(`${apiUrl}/api/financial_forecasts_data/`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify({
          ticker,
          meta_data: editData,
        }),
      });

      if (response.ok) {
        setMetaData(JSON.parse(JSON.stringify(editData)));
        setEditMode(false);
      } else {
        console.error("Save failed");
      }
    } catch (err) {
      console.error("Save error:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleEditClick = () => {
    if (editMode) {
      handleSave();
    } else {
      setEditData(JSON.parse(JSON.stringify(metaData)));
      setEditMode(true);
    }
  };

  // Get dynamic year columns sorted
  const displayData = editMode ? editData : metaData;
  const yearColumns = displayData ? Object.keys(displayData).sort() : [];

  // Get all unique metrics from the data dynamically
  const allMetrics = displayData
    ? Array.from(
        new Set(
          Object.values(displayData).flatMap((yearData) => Object.keys(yearData))
        )
      )
    : [];

  // Sort metrics by preferred order, unknown metrics go to the end
  const sortedMetrics = [...allMetrics].sort((a, b) => {
    const indexA = metricOrder.indexOf(a);
    const indexB = metricOrder.indexOf(b);
    if (indexA === -1 && indexB === -1) return a.localeCompare(b);
    if (indexA === -1) return 1;
    if (indexB === -1) return -1;
    return indexA - indexB;
  });

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 30 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      style={{
        borderRadius: 16,
        background: "linear-gradient(#f0f5ff)",
        boxShadow: "0 8px 20px rgba(0,0,0,0.08)",
        padding: "20px",
        position: "relative",
      }}
    >
      <IconButton
        onClick={handleEditClick}
        disabled={saving || loading}
        sx={{ position: "absolute", top: 12, right: 12, color: "#002060" }}
      >
        {saving ? <CircularProgress size={20} /> : editMode ? <SaveIcon /> : <EditIcon />}
      </IconButton>

      <Typography variant="h6" sx={{ fontWeight: 700, color: "#026269", mb: 3 }}>
        Financial Forecasts
      </Typography>

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Typography color="error" sx={{ textAlign: "center", py: 2 }}>
          {error}
        </Typography>
      ) : displayData && yearColumns.length > 0 ? (
        <Box sx={{ overflowX: "auto" }}>
          <Box
            component="table"
            sx={{
              width: "100%",
              borderCollapse: "collapse",
              "& th, & td": {
                padding: "12px 16px",
                textAlign: "right",
                borderBottom: "1px solid #e0e0e0",
              },
              "& th:first-of-type, & td:first-of-type": {
                textAlign: "left",
              },
              "& th": {
                fontWeight: 600,
                color: "#124180",
                backgroundColor: "#f5f8ff",
              },
              "& td": {
                color: "#333333",
              },
            }}
          >
            <thead>
              <tr>
                <th>Metric</th>
                {yearColumns.map((year) => (
                  <th key={year}>{year}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sortedMetrics.map((metric) => {
                const isPercentage = percentageMetrics.includes(metric);
                return (
                  <tr key={metric}>
                    <td style={{ fontWeight: 600 }}>{metric}</td>
                    {yearColumns.map((year) => {
                      const value = displayData[year]?.[metric];
                      return (
                        <td key={year}>
                          {editMode ? (
                            <TextField
                              size="small"
                              type="number"
                              value={value ?? ""}
                              onChange={(e) => handleChange(year, metric, e.target.value)}
                              sx={{
                                width: "100px",
                                "& .MuiInputBase-input": {
                                  textAlign: "right",
                                  padding: "6px 8px",
                                },
                              }}
                            />
                          ) : (
                            <Typography
                              component="span"
                              sx={{
                                fontWeight: 500,
                                color:
                                  value !== undefined && isPercentage
                                    ? value > 0
                                      ? "#2e7d32"
                                      : value < 0
                                      ? "#d32f2f"
                                      : "#333333"
                                    : "#333333",
                              }}
                            >
                              {formatValue(value, isPercentage)}
                            </Typography>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </Box>
        </Box>
      ) : (
        <Typography sx={{ textAlign: "center", py: 2, color: "#666" }}>
          No financial data available
        </Typography>
      )}
    </motion.div>
  );
};

export default FOWriteUpMetaDataFinancialHighlights;
