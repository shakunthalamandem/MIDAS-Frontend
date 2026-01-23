import React, { useState, useEffect } from "react";
import {
  Container,
  Typography,
  CircularProgress,
  Alert,
  Snackbar,
  Box,
  Card,
  CardContent,
  Grid,
  IconButton,
} from "@mui/material";
import InfoIcon from "@mui/icons-material/Info";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";

import NewFinancialTableData from "./NewFinancialTableData";
import FONewFinancialTableData from "./FONewFinancialTableData";

interface FONewFinancialTableMainProps {
  defaultTicker?: string;
  deal_id?: string;
}

const FONewFinancialTableMain: React.FC<
  FONewFinancialTableMainProps
> = ({ defaultTicker = "", deal_id }) => {
  const [forecastsInput, setForecastsInput] = useState(defaultTicker);
  const [forecastsTicker, setForecastsTicker] = useState(defaultTicker);
  const [forecasts, setForecasts] = useState<any | null>(null);
  const [forecastsLoading, setForecastsLoading] = useState(false);
  const [forecastsError, setForecastsError] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [editedData, setEditedData] = useState<any>({});
  const [saving, setSaving] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<"success" | "error">(
    "success"
  );

  const handleCloseSnackbar = () => setSnackbarOpen(false);

  // ---------------------- Fetch ----------------------
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
        `${apiUrl}/api/financial_forecasts_data/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : "",
          },
          body: JSON.stringify({
            ticker: tickerToFetch,
            ...(deal_id ? { deal_id } : {}),
          }),
        }
      );

      const json = await response.json();
      if (!response.ok) {
        throw new Error(
          json.error || json.message || "Failed to fetch forecasts"
        );
      }

      if (!json?.status) {
        throw new Error(json?.error || json?.message || "Failed to fetch forecasts");
      }

      const items = Array.isArray(json?.data) ? json.data : [];
      const matched =
        items.find(
          (item: any) =>
            String(item?.ticker || "").toUpperCase() ===
            String(tickerToFetch || "").toUpperCase()
        ) || items[0];

      if (!matched) {
        throw new Error("No forecast data found.");
      }

      setForecasts(matched);
      setForecastsTicker(matched?.ticker || tickerToFetch);
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

  // ---------------------- Edit ----------------------
  const handleEdit = () => {
    setEditing(true);
    const metaData = forecasts?.meta_data || {};
    const copied = JSON.parse(JSON.stringify(metaData || {}));
    setEditedData(copied);
  };

  const handleCancelEdit = () => {
    setEditing(false);
    setEditedData({});
  };

  const handleEditToggle = () => {
    if (editing) {
      void handleSave();
      return;
    }
    handleEdit();
  };

  // ---------------------- Cell Edit Change ----------------------
  const handleEditChange = (
    metricName: string,
    yearKey: string,
    value: string
  ) => {
    setEditedData((prev: any) => {
      const updated = {
        ...prev,
        [yearKey]: {
          ...prev?.[yearKey],
          [metricName]: value === "" ? null : value,
        },
      };

      return updated;
    });
  };

  const handleSave = async () => {
    setEditing(false);
    setForecastsError(null);
    setSaving(true);

    const apiUrl = process.env.REACT_APP_API_URL;
    const token = localStorage.getItem("access_token");
    if (!apiUrl) return;

    try {
      const updatedMeta = editedData;
      if (!updatedMeta || !Object.keys(updatedMeta).length) {
        throw new Error("No edited data found.");
      }

      const columnKeys = Object.keys(updatedMeta);
      const editableColumnKeys = columnKeys.slice(-1);
      const metaDataPayload: any = {};

      for (const colKey of editableColumnKeys) {
        const colData = updatedMeta[colKey] || {};
        const cleanedCol: any = {};
        for (const metricName of Object.keys(colData)) {
          const rawVal = colData[metricName];
          if (rawVal === "" || rawVal === undefined) {
            cleanedCol[metricName] = null;
          } else if (rawVal === null) {
            cleanedCol[metricName] = null;
          } else if (typeof rawVal === "number") {
            cleanedCol[metricName] = rawVal;
          } else {
            const num = Number(rawVal);
            cleanedCol[metricName] = Number.isNaN(num) ? rawVal : num;
          }
        }
        metaDataPayload[colKey] = cleanedCol;
      }

      const payload = {
        ticker: forecastsTicker,
        meta_data: metaDataPayload,
        ...(deal_id ? { deal_id } : {}),
      };

      const response = await fetch(`${apiUrl}/api/financial_forecasts_data/`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || result.message || "Failed to update data");
      }
      setSnackbarMessage("Financial forecasts updated successfully!");
      setSnackbarSeverity("success");
      setSnackbarOpen(true);

      // ---------------- Refresh forecasts ----------------
      await handleFetchForecasts(forecastsTicker);
    } catch (error: any) {
      setForecastsError(error.message || "Failed to save data.");
    } finally {
      setSaving(false);
    }
  };

  // ---------------------- Render ----------------------
  return (
    <Container maxWidth="xl" sx={{ mb: 4 }}>
      <Card variant="outlined" sx={{ boxShadow: 2, borderRadius: 2 }}>
        <CardContent sx={{ background: "linear-gradient(#f0f5ff, #f0f5ff)" }}>
          <Grid container spacing={4} mb={4} mt={2}>
            <Grid item xs={12}>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 2,
                  mb: 2,
                }}
              >
                <Typography
                  variant="h5"
                  sx={{
                    fontWeight: "bold",
                    textAlign: "center",
                    color: "#026269",
                    flex: 1,
                  }}
                >
                  Financial Highlights
                </Typography>
                <IconButton
                  onClick={handleEditToggle}
                  disabled={saving || forecastsLoading}
                  sx={{ color: "#002060" }}
                  aria-label={
                    editing
                      ? "save financial highlights"
                      : "edit financial highlights"
                  }
                >
                  {editing ? <SaveIcon /> : <EditIcon />}
                </IconButton>
              </Box>

              {forecastsLoading && (
                <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
                  <CircularProgress />
                </Box>
              )}

              {forecastsError && (
                <Alert severity="error" sx={{ mt: 3 }}>
                  {forecastsError}
                </Alert>
              )}

              {!forecastsLoading &&
                forecasts &&
                forecasts?.meta_data && (
                  <FONewFinancialTableData
                    data={editing ? editedData : forecasts?.meta_data}
                    editing={editing}
                    onChange={handleEditChange}
                  />
                )}

              {forecastsTicker.toUpperCase() !== "MINIMAX" && (
                <Box
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  mt={2}
                >
                  <InfoIcon sx={{ mr: 1 }} />
                  <Typography sx={{ mr: 3 }}>
                    Above values are in local currency
                  </Typography>
                  <InfoIcon sx={{ mr: 1 }} />
                  <Typography>
                    High positive and negative values are shown as NM (Not
                    Meaningful)
                  </Typography>
                </Box>
              )}
            </Grid>
          </Grid>
        </CardContent>
      </Card>
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbarSeverity}
          sx={{ width: "100%" }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default FONewFinancialTableMain;
