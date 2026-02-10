import React, { useState, useEffect } from "react";
import { Box, Typography, TextField, IconButton, CircularProgress } from "@mui/material";
import { motion } from "framer-motion";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import {
  DealInformation,
  TradingDetails,
  SharePricePerformance,
} from "../types/FOWriteUpData";

interface FOWriteUpMetaDataDealInfoProps {
  ticker: string;
  data?: DealInformation;
  tradingDetails?: TradingDetails;
  sharePricePerformance?: SharePricePerformance;
  onUpdate?: () => void;
}

const dealFields: { label: string; key: keyof DealInformation; type?: string; suffix?: string }[] = [
  { label: "Ticker", key: "ticker", type: "text" },
  { label: "Pricing Date", key: "pricing_date", type: "text" },
  { label: "Issue Price", key: "issue_price", type: "number", suffix: "$" },
  { label: "Deal Size (M)", key: "deal_size", type: "number", suffix: "$" },
  { label: "Industry", key: "industry", type: "text" },
  { label: "Shares Offered", key: "shares_offered", type: "number" },
  { label: "Shares Outstanding", key: "number_of_shares_outstanding", type: "number" },
  { label: "Greenshoe", key: "greenshoe", type: "number" },
  { label: "Bookrunners", key: "bookrunners", type: "text" },
];

const tradingFields: { label: string; key: keyof TradingDetails; type?: string; suffix?: string }[] = [
  { label: "Current Share Price", key: "current_share_price", type: "number", suffix: "$" },
  { label: "Current Market Cap", key: "current_market_cap", type: "number", suffix: "$" },
  { label: "Float %", key: "float_as_percent_shares_outstanding", type: "number", suffix: "%" },
  { label: "Short Interest %", key: "short_interest_as_percent_float", type: "number", suffix: "%" },
  { label: "30-Day Avg Volume", key: "volume_30day_average", type: "number" },
  { label: "Mean Target Price", key: "mean_target_price", type: "number", suffix: "$" },
  { label: "Consensus Recommendation", key: "concensus_recomendations", type: "text" },
  { label: "% of 52-Week High", key: "percentage_of_52_week_high", type: "number", suffix: "%" },
];

const performanceFields: { label: string; key: keyof SharePricePerformance; suffix?: string }[] = [
  { label: "1 Year Return", key: "_1_year_total_return", suffix: "%" },
  { label: "3 Year Return", key: "_3_year_total_return", suffix: "%" },
  { label: "YTD Return", key: "ytd_return", suffix: "%" },
  { label: "6 Month Return", key: "_6_month_return", suffix: "%" },
  { label: "3 Month Return", key: "_3_month_return", suffix: "%" },
  { label: "1 Month Return", key: "_1_month_return", suffix: "%" },
];

const formatValue = (value: any, suffix?: string) => {
  if (value === undefined || value === null) return "N/A";
  if (typeof value === "number") {
    const formatted = Number(value).toLocaleString(undefined, { maximumFractionDigits: 2 });
    if (suffix === "$") return `$${formatted}`;
    if (suffix === "%") return `${formatted}%`;
    return formatted;
  }
  return value;
};

const FOWriteUpMetaDataDealInfo: React.FC<FOWriteUpMetaDataDealInfoProps> = ({
  ticker,
  data: initialData,
  tradingDetails: initialTradingDetails,
  sharePricePerformance: initialPerformance,
  onUpdate,
}) => {
  const [dealData, setDealData] = useState<DealInformation>(initialData ?? {});
  const [tradingData, setTradingData] = useState<TradingDetails>(initialTradingDetails ?? {});
  const [performanceData, setPerformanceData] = useState<SharePricePerformance>(initialPerformance ?? {});
  const [editMode, setEditMode] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setDealData(initialData ?? {});
    setTradingData(initialTradingDetails ?? {});
    setPerformanceData(initialPerformance ?? {});
  }, [initialData, initialTradingDetails, initialPerformance]);

  const handleDealChange = (key: keyof DealInformation, value: string, type?: string) => {
    if (type === "number") {
      const parsed = parseFloat(value);
      setDealData({ ...dealData, [key]: isNaN(parsed) ? undefined : parsed });
    } else {
      setDealData({ ...dealData, [key]: value });
    }
  };

  const handleTradingChange = (key: keyof TradingDetails, value: string, type?: string) => {
    if (type === "number") {
      const parsed = parseFloat(value);
      setTradingData({ ...tradingData, [key]: isNaN(parsed) ? undefined : parsed });
    } else {
      setTradingData({ ...tradingData, [key]: value as any });
    }
  };

  const handlePerformanceChange = (key: keyof SharePricePerformance, value: string) => {
    const parsed = parseFloat(value);
    setPerformanceData({ ...performanceData, [key]: isNaN(parsed) ? undefined : parsed });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const apiUrl = process.env.REACT_APP_API_URL;
      const token = localStorage.getItem("access_token");

      const payload: Record<string, any> = {
        ticker,
        ...dealData,
        ...tradingData,
        ...performanceData,
      };

      const response = await fetch(`${apiUrl}/api/fo_writeup_details/`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        setEditMode(false);
        onUpdate?.();
      } else {
        console.error("Save failed");
      }
    } catch (error) {
      console.error("Save error:", error);
    } finally {
      setSaving(false);
    }
  };

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
        onClick={() => (editMode ? handleSave() : setEditMode(true))}
        disabled={saving}
        sx={{ position: "absolute", top: 12, right: 12, color: "#002060" }}
      >
        {saving ? <CircularProgress size={20} /> : editMode ? <SaveIcon /> : <EditIcon />}
      </IconButton>

      <Typography variant="h6" sx={{ fontWeight: 700, color: "#026269", mb: 3 }}>
        Deal Information
      </Typography>

      <Box display="flex" flexWrap="wrap" gap={3} justifyContent="space-between">
        {dealFields.map((field) => (
          <Box key={field.key} flex="1 1 calc(50% - 12px)" minWidth="250px" mb={2}>
            <Typography sx={{ fontWeight: 600, color: "#124180", fontSize: "16px" }}>
              {field.label}
            </Typography>
            {editMode ? (
              <TextField
                fullWidth
                size="small"
                type={field.type === "number" ? "number" : "text"}
                value={dealData[field.key] ?? ""}
                onChange={(e) => handleDealChange(field.key, e.target.value, field.type)}
              />
            ) : (
              <Typography sx={{ fontWeight: 400, fontSize: "16px", color: "#333333" }}>
                {formatValue(dealData[field.key], field.suffix)}
              </Typography>
            )}
          </Box>
        ))}
      </Box>

      <Typography variant="h6" sx={{ fontWeight: 700, color: "#026269", mb: 3, mt: 4 }}>
        Trading Details
      </Typography>

      <Box display="flex" flexWrap="wrap" gap={3} justifyContent="space-between">
        {tradingFields.map((field) => (
          <Box key={field.key} flex="1 1 calc(50% - 12px)" minWidth="250px" mb={2}>
            <Typography sx={{ fontWeight: 600, color: "#124180", fontSize: "16px" }}>
              {field.label}
            </Typography>
            {editMode ? (
              <TextField
                fullWidth
                size="small"
                type={field.type === "number" ? "number" : "text"}
                value={tradingData[field.key] ?? ""}
                onChange={(e) => handleTradingChange(field.key, e.target.value, field.type)}
              />
            ) : (
              <Typography sx={{ fontWeight: 400, fontSize: "16px", color: "#333333" }}>
                {formatValue(tradingData[field.key], field.suffix)}
              </Typography>
            )}
          </Box>
        ))}
      </Box>

      <Typography variant="h6" sx={{ fontWeight: 700, color: "#026269", mb: 3, mt: 4 }}>
        Share Price Performance
      </Typography>

      <Box display="flex" flexWrap="wrap" gap={3} justifyContent="space-between">
        {performanceFields.map((field) => (
          <Box key={field.key} flex="1 1 calc(33% - 12px)" minWidth="180px" mb={2}>
            <Typography sx={{ fontWeight: 600, color: "#124180", fontSize: "16px" }}>
              {field.label}
            </Typography>
            {editMode ? (
              <TextField
                fullWidth
                size="small"
                type="number"
                value={performanceData[field.key] ?? ""}
                onChange={(e) => handlePerformanceChange(field.key, e.target.value)}
              />
            ) : (
              <Typography sx={{ fontWeight: 400, fontSize: "16px", color: "#333333" }}>
                {formatValue(performanceData[field.key], field.suffix)}
              </Typography>
            )}
          </Box>
        ))}
      </Box>
    </motion.div>
  );
};

export default FOWriteUpMetaDataDealInfo;
