import React, { useState, useEffect } from "react";
import {
  Container,
  Typography,
  CircularProgress,
  Alert,
  Snackbar,
  Box,
} from "@mui/material";
import InfoIcon from "@mui/icons-material/Info";

import NewFinancialTableData from "./NewFinancialTableData";

interface NewFinancialTableMainProps {
  defaultTicker?: string;
  deal_id?: string;
}

const NewFinancialTableMain: React.FC<NewFinancialTableMainProps> = ({
  defaultTicker = "",
  deal_id,
}) => {
  const [forecastsTicker, setForecastsTicker] = useState(defaultTicker);
  const [forecasts, setForecasts] = useState<any | null>(null);
  const [forecastsLoading, setForecastsLoading] = useState(false);
  const [forecastsError, setForecastsError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<"success" | "error">(
    "success",
  );

  const closeSnackbar = () => setSnackbarOpen(false);
  const showSnackbar = (msg: string, severity: "success" | "error") => {
    setSnackbarMessage(msg);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  const handleFetchForecasts = async (customTicker?: string) => {
    setForecastsLoading(true);
    setForecastsError(null);
    setForecasts(null);
    try {
      const apiUrl = process.env.REACT_APP_API_URL;
      const token = localStorage.getItem("access_token");
      if (!apiUrl) throw new Error("API URL not set");

      const tickerToFetch = customTicker ?? defaultTicker;
      const response = await fetch(`${apiUrl}/api/financial_forecasts_data/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify({
          ticker: tickerToFetch,
          ...(deal_id ? { deal_id } : {}),
        }),
      });

      const json = await response.json();
      if (!response.ok) {
        throw new Error(
          json.error || json.message || "Failed to fetch forecasts",
        );
      }

      if (!json?.status) {
        throw new Error(
          json?.error || json?.message || "Failed to fetch forecasts",
        );
      }

      const items = Array.isArray(json?.data) ? json.data : [];
      const matched =
        items.find(
          (item: any) =>
            String(item?.ticker || "").toUpperCase() ===
            String(tickerToFetch || "").toUpperCase(),
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
    setForecastsTicker(defaultTicker);
    handleFetchForecasts(defaultTicker);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultTicker]);

  const handleSave = async (meta: any) => {
    setSaving(true);
    setForecastsError(null);
    try {
      const apiUrl = process.env.REACT_APP_API_URL;
      const token = localStorage.getItem("access_token");
      if (!apiUrl) throw new Error("API URL not set");

      if (!meta || typeof meta !== "object") {
        throw new Error("No table data to save.");
      }

      const cleanedMeta: any = {};
      for (const key of Object.keys(meta)) {
        const value = meta[key];
        if (Array.isArray(value)) {
          cleanedMeta[key] = value;
          continue;
        }
        if (!value || typeof value !== "object") {
          cleanedMeta[key] = value;
          continue;
        }
        const cleanedCol: any = {};
        for (const metricName of Object.keys(value)) {
          const rawVal = value[metricName];
          if (rawVal === "" || rawVal === undefined || rawVal === null) {
            cleanedCol[metricName] = null;
          } else if (typeof rawVal === "number") {
            cleanedCol[metricName] = rawVal;
          } else {
            const num = Number(rawVal);
            cleanedCol[metricName] = Number.isNaN(num) ? rawVal : num;
          }
        }
        cleanedMeta[key] = cleanedCol;
      }

      const payload = {
        ticker: forecastsTicker,
        meta_data: cleanedMeta,
        replace: true,
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
        throw new Error(
          result.error || result.message || "Failed to update data",
        );
      }

      showSnackbar("Financial forecasts updated successfully!", "success");
      await handleFetchForecasts(forecastsTicker);
    } catch (error: any) {
      showSnackbar(error.message || "Failed to save data.", "error");
      setForecastsError(error.message || "Failed to save data.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Container
      sx={{ maxWidth: "xl", mb: 2, background: "#f0f5ff", borderRadius: 3 }}
    >
      <Typography
        variant="h6"
        sx={{ p: 3 }}
        color="#002060"
        fontWeight={600}
        align="center"
      >
        Financial Forecasts (FYE{" "}
        {forecastsTicker?.toUpperCase() === "MH" ? "Mar 31" : "Dec 31"},{" "}
        Internal Estimates) for {defaultTicker}
      </Typography>

      {forecastsLoading && <CircularProgress />}
      {forecastsError && <Alert severity="error">{forecastsError}</Alert>}

      {!forecastsLoading && forecasts && forecasts?.meta_data && (
        <NewFinancialTableData
          initialData={forecasts?.meta_data}
          saving={saving}
          onSave={handleSave}
        />
      )}

      {forecastsTicker.toUpperCase() !== "MINIMAX" && (
        <Box
          display="flex"
          alignItems="center"
          justifyContent="center"
          mt={2}
          pb={2}
        >
          <InfoIcon sx={{ mr: 1 }} />
          <Typography sx={{ mr: 3 }} variant="body2">
            Above values are in local currency
          </Typography>
          <InfoIcon sx={{ mr: 1 }} />
          <Typography variant="body2">
            High positive and negative values are shown as NM (Not Meaningful)
          </Typography>
        </Box>
      )}

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={4000}
        onClose={closeSnackbar}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={closeSnackbar}
          severity={snackbarSeverity}
          sx={{ width: "100%" }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default NewFinancialTableMain;
