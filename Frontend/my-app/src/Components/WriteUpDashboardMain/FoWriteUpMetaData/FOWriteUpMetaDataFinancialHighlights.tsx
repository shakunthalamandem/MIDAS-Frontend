import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Box,
  Typography,
  CircularProgress,
  IconButton,
  TextField,
  Tooltip,
} from "@mui/material";
import { motion } from "framer-motion";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import CloseIcon from "@mui/icons-material/Close";

interface FinancialYearData {
  [key: string]: string | number | undefined;
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

interface BasicDealDetails {
  deal_id: string;
  unique_deal_id?: string;
  ticker: string;
  pricing_date?: string;
  region: string;
  deal_type: "IPO" | "FO";
  company_name?: string;
  issuer_name?: string;
  exchange?: string;
}

interface FOWriteUpMetaDataFinancialHighlightsProps {
  basicDealDetails: BasicDealDetails;
}

const formatValue = (value: string | number | undefined) => {
  if (value === undefined || value === null || value === "") return "N/A";
  return String(value);
};

const FOWriteUpMetaDataFinancialHighlights: React.FC<FOWriteUpMetaDataFinancialHighlightsProps> = ({
  basicDealDetails,
}) => {
  const { ticker, pricing_date } = basicDealDetails;
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [metaData, setMetaData] = useState<Record<string, FinancialYearData> | null>(null);
  const [editData, setEditData] = useState<Record<string, FinancialYearData> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [newMetricName, setNewMetricName] = useState("");
  const editDataRef = useRef(editData);
  editDataRef.current = editData;
  const deletedMetricsRef = useRef<Set<string>>(new Set());

  const fetchFinancialData = useCallback(async () => {
    if (!ticker) return;

    setLoading(true);
    setError(null);
    try {
      const apiUrl = process.env.REACT_APP_API_URL;
      const token = localStorage.getItem("access_token");

      const response = await fetch(`${apiUrl}/api/fo_financial_forecasts_data/`, {
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
    setEditData((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        [year]: {
          ...prev[year],
          [metric]: value,
        },
      };
    });
  };

  const handleAddRow = () => {
    const current = editDataRef.current;
    if (!current || !newMetricName.trim()) return;

    const trimmed = newMetricName.trim();
    const updated: Record<string, FinancialYearData> = {};
    for (const year of Object.keys(current)) {
      updated[year] = { ...current[year], [trimmed]: undefined };
    }
    setEditData(updated);
    setNewMetricName("");
  };

  const handleDeleteRow = (metric: string) => {
    deletedMetricsRef.current.add(metric);
    setEditData((prev) => {
      if (!prev) return prev;
      const updated: Record<string, FinancialYearData> = {};
      for (const year of Object.keys(prev)) {
        const yearData = { ...prev[year] };
        delete yearData[metric];
        updated[year] = yearData;
      }
      return updated;
    });
  };

  const handleSave = async () => {
    const latestEditData = editDataRef.current;
    if (!latestEditData) return;

    // Strip any deleted metrics from the payload
    const cleanedData: Record<string, FinancialYearData> = {};
    for (const year of Object.keys(latestEditData)) {
      const yearData = { ...latestEditData[year] };
      Array.from(deletedMetricsRef.current).forEach((metric) => {
        delete yearData[metric];
      });
      cleanedData[year] = yearData;
    }

    setSaving(true);
    try {
      const apiUrl = process.env.REACT_APP_API_URL;
      const token = localStorage.getItem("access_token");

      const response = await fetch(`${apiUrl}/api/fo_financial_forecasts_data/`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify({
          ticker,
          pricing_date,
          meta_data: cleanedData,
        }),
      });

      if (response.ok) {
        deletedMetricsRef.current.clear();
        setMetaData(JSON.parse(JSON.stringify(cleanedData)));
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

  const handleCancelEdit = () => {
    deletedMetricsRef.current.clear();
    setEditData(JSON.parse(JSON.stringify(metaData)));
    setEditMode(false);
    setNewMetricName("");
  };

  // Get dynamic year columns sorted, with YoY Change always last
  const displayData = editMode ? editData : metaData;
  const yearColumns = displayData
    ? Object.keys(displayData)
        .sort()
        .sort((a, b) => {
          const aIsYoY = a.toLowerCase().includes("yoy");
          const bIsYoY = b.toLowerCase().includes("yoy");
          if (aIsYoY && !bIsYoY) return 1;
          if (!aIsYoY && bIsYoY) return -1;
          return 0;
        })
    : [];

  // Get all unique metrics from the data dynamically
  const sortedMetrics = displayData
    ? Array.from(
        new Set(
          Object.values(displayData).flatMap((yearData) => Object.keys(yearData))
        )
      )
    : [];

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
      <Box sx={{ position: "absolute", top: 12, right: 12, display: "flex", gap: 0.5 }}>
        {editMode && (
          <Tooltip title="Cancel">
            <IconButton onClick={handleCancelEdit} sx={{ color: "#d32f2f" }}>
              <CloseIcon />
            </IconButton>
          </Tooltip>
        )}
        <Tooltip title={editMode ? "Save" : "Edit"}>
          <IconButton
            onClick={handleEditClick}
            disabled={saving || loading}
            sx={{ color: "#002060" }}
          >
            {saving ? <CircularProgress size={20} /> : editMode ? <SaveIcon /> : <EditIcon />}
          </IconButton>
        </Tooltip>
      </Box>

      <Typography variant="h6" sx={{ fontWeight: 700, color: "#026269", mb: 3, textAlign: "center" }}>
        Financial Highlights
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
                textAlign: "left",
                borderBottom: "1px solid #e0e0e0",
              },
              "& th:last-of-type, & td:last-of-type": {
                textAlign: "right",
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
                {editMode && <th style={{ textAlign: "center", width: 50 }}>Action</th>}
              </tr>
            </thead>
            <tbody>
              {sortedMetrics.map((metric) => {
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
                              type="text"
                              value={value ?? ""}
                              onChange={(e) => handleChange(year, metric, e.target.value)}
                              sx={{
                                width: "120px",
                                "& .MuiInputBase-input": {
                                  textAlign: "left",
                                  padding: "6px 8px",
                                },
                              }}
                            />
                          ) : (
                            <Typography
                              component="span"
                              sx={{
                                fontWeight: 500,
                                color: "#333333",
                              }}
                            >
                              {formatValue(value)}
                            </Typography>
                          )}
                        </td>
                      );
                    })}
                    {editMode && (
                      <td style={{ textAlign: "center" }}>
                        <Tooltip title="Delete row">
                          <IconButton
                            size="small"
                            onClick={() => handleDeleteRow(metric)}
                            sx={{ color: "#d32f2f" }}
                          >
                            <DeleteOutlineIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </td>
                    )}
                  </tr>
                );
              })}

              {/* Add new row in edit mode */}
              {editMode && (
                <tr>
                  <td colSpan={yearColumns.length + 2}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 0.5 }}>
                      <TextField
                        size="small"
                        placeholder="New metric name"
                        value={newMetricName}
                        onChange={(e) => setNewMetricName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleAddRow();
                        }}
                        sx={{
                          width: "200px",
                          "& .MuiInputBase-input": {
                            padding: "6px 8px",
                          },
                        }}
                      />
                      <Tooltip title="Add row">
                        <IconButton
                          size="small"
                          onClick={handleAddRow}
                          disabled={!newMetricName.trim()}
                          sx={{ color: "#2e7d32" }}
                        >
                          <AddCircleOutlineIcon />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </td>
                </tr>
              )}
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
