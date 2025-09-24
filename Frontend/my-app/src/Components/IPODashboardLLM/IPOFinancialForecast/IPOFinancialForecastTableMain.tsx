import React, { useState, useEffect } from "react";
import { Container, Typography, CircularProgress, Alert } from "@mui/material";

import FinancialTableData from "./FinancialTableData";
import {
  forecastYearKeys,
  growthPairs,
  marginPairs,
  safeNumber,
  computeGrowthPct,
  computeValueFromGrowth,
  ensureMetricStructure,
} from "./utils/financialHelpers";

interface IPOFinancialForecastTableMainProps {
  defaultTicker?: string;
}

const IPOFinancialForecastTableMain: React.FC<IPOFinancialForecastTableMainProps> = ({
  defaultTicker = "",
}) => {
  const [forecastsInput, setForecastsInput] = useState(defaultTicker);
  const [forecastsTicker, setForecastsTicker] = useState(defaultTicker);
  const [forecasts, setForecasts] = useState<any | null>(null);
  const [forecastsLoading, setForecastsLoading] = useState(false);
  const [forecastsError, setForecastsError] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [editedData, setEditedData] = useState<any>({});

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

  // ---------------------- Edit ----------------------
const handleEdit = () => {
  setEditing(true);
  const copied = JSON.parse(
    JSON.stringify(forecasts[forecastsTicker.toUpperCase()] || {})
  );

  // Ensure only existing metrics are structured
  Object.keys(copied).forEach((key) => ensureMetricStructure(copied, key));

  // Precompute growth for ONLY backend metrics that have growth pairs
  for (const base of Object.keys(copied)) {
    const growth = growthPairs[base];
    if (growth && copied[growth]) {
      const prev = safeNumber(copied[base]?.["one_year_before"]);
      const curr = safeNumber(copied[base]?.["current_year"]);
      const next = safeNumber(copied[base]?.["one_year_later"]);

      copied[growth]["current_year"] =
        computeGrowthPct(prev, curr) ?? copied[growth]["current_year"];
      copied[growth]["one_year_later"] =
        computeGrowthPct(curr, next) ?? copied[growth]["one_year_later"];
    }
  }

  // Precompute margins for ONLY backend metrics that have margin pairs
  for (const [base, margin] of Object.entries(marginPairs)) {
    if (copied[base] && copied[margin]) {
      for (const ky of forecastYearKeys) {
        const b = safeNumber(copied[base][ky]);
        const s = safeNumber(copied["Sales"]?.[ky]);
        copied[margin][ky] = s ? (b / s) * 100 : copied[margin][ky];
      }
    }
  }

  setEditedData({ [forecastsTicker.toUpperCase()]: copied });
};


  const handleCancelEdit = () => {
    setEditing(false);
    setEditedData({});
  };

  // ---------------------- Cell Edit Change ----------------------
  const handleEditChange = (metricName: string, yearKey: string, value: string) => {
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

      // Growth recalculation
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
          data[baseMetric]["current_year"] = computeValueFromGrowth(prevVal, Number(growthCurr));
        }
        if (yearKey === "one_year_later" && currBase && growthNext != null) {
          data[baseMetric]["one_year_later"] = computeValueFromGrowth(currBase, Number(growthNext));
        }
      };

      // Margin recalculation
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
          if (growthPairs[baseMetric]) recalcGrowthFor(baseMetric);
        }
      };

      // Apply rules
      if (metricName in growthPairs) {
        recalcGrowthFor(metricName);
      } else {
        const baseForThisGrowth = Object.keys(growthPairs).find(
          (b) => growthPairs[b] === metricName
        );
        if (baseForThisGrowth) recalcBaseFromGrowth(baseForThisGrowth, metricName);
      }

      if (metricName in marginPairs) {
        recalcMarginFor(metricName, yearKey);
      } else {
        const baseForThisMargin = Object.keys(marginPairs).find(
          (b) => marginPairs[b] === metricName
        );
        if (baseForThisMargin) applyMarginEdit(metricName, yearKey);
      }

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

  // ---------------------- Save ----------------------
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
        if (!originalRow || row["current_year"] !== originalRow["current_year"]) {
          fieldsToUpdate["current_year"] = row["current_year"];
        }
        if (!originalRow || row["one_year_later"] !== originalRow["one_year_later"]) {
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

  // ---------------------- Render ----------------------
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
          <FinancialTableData
            data={editing ? editedData[forecastsTicker.toUpperCase()] : forecasts[forecastsTicker.toUpperCase()]}
            editing={editing}
            onEdit={handleEdit}
            onSave={handleSave}
            onCancel={handleCancelEdit}
            onChange={handleEditChange}
            ticker={forecastsTicker}
          />
        )}
    </Container>
  );
};

export default IPOFinancialForecastTableMain;
