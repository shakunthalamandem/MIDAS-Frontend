import React, { useEffect, useState, useCallback } from "react";
import { Box, Typography, Container, TextField, IconButton, CircularProgress } from "@mui/material";
import { motion } from "framer-motion";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";

interface SharePricePerformance {
  _3_year_total_return?: number;
  _1_year_total_return?: number;
  ytd_return?: number;
  _6_month_return?: number;
  _3_month_return?: number;
  _1_month_return?: number;
}

interface TradingDetails {
  current_share_price?: number;
  current_market_cap?: number;
  float_as_percent_shares_outstanding?: number;
  short_interest_as_percent_float?: number;
  volume_30day_average?: number;
  mean_target_price?: number;
  concensus_recomendations?: number;
  percentage_of_52_week_high?: number;
}

interface FODealInformationMainTableProps {
  ticker: string;
}

const shareFields: { label: string; key: keyof SharePricePerformance }[] = [
  { label: "3-Year Total Return (%)", key: "_3_year_total_return" },
  { label: "1-Year Total Return (%)", key: "_1_year_total_return" },
  { label: "YTD Return (%)", key: "ytd_return" },
  { label: "6-Month Return (%)", key: "_6_month_return" },
  { label: "3-Month Return (%)", key: "_3_month_return" },
  { label: "1-Month Return (%)", key: "_1_month_return" },
];

const tradingFields: { label: string; key: keyof TradingDetails; suffix?: string }[] = [
  { label: "Current Share Price", key: "current_share_price", suffix: "$" },
  { label: "Market Cap (M)", key: "current_market_cap", suffix: "$" },
  { label: "Float (% Shares Outstanding)", key: "float_as_percent_shares_outstanding", suffix: "%" },
  { label: "Short Interest (% Float)", key: "short_interest_as_percent_float", suffix: "%" },
  { label: "Volume (30-day Avg)", key: "volume_30day_average" },
  { label: "Mean Target Price", key: "mean_target_price", suffix: "$" },
  { label: "Consensus Recommendations", key: "concensus_recomendations" },
  { label: "% of 52-Week High", key: "percentage_of_52_week_high", suffix: "%" },
];

const formatValue = (value: any, suffix?: string) => {
  if (value === undefined || value === null) return "N/A";
  const formatted = Number(value).toLocaleString(undefined, { maximumFractionDigits: 2 });
  return suffix ? `${suffix === "$" ? "$" : ""}${formatted}${suffix === "%" ? "%" : ""}` : formatted;
};

const FODealInformationMainTable: React.FC<FODealInformationMainTableProps> = ({
  ticker,
}) => {
  const [shareLocal, setShareLocal] = useState<SharePricePerformance>({});
  const [tradingLocal, setTradingLocal] = useState<TradingDetails>({});
  const [editShare, setEditShare] = useState(false);
  const [editTrading, setEditTrading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const fetchData = useCallback(async () => {
    if (!ticker) return;

    setLoading(true);
    try {
      const apiUrl = process.env.REACT_APP_API_URL;
      const token = localStorage.getItem("access_token");

      const params = new URLSearchParams({ ticker });

      const response = await fetch(`${apiUrl}/api/fo_writeup_details/?${params.toString()}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
      });

      if (response.ok) {
        const data = await response.json();
        setTradingLocal(data.trading_details ?? {});
        setShareLocal(data.share_price_performance ?? {});
      } else {
        console.error("Failed to fetch data");
      }
    } catch (error) {
      console.error("Fetch error:", error);
    } finally {
      setLoading(false);
    }
  }, [ticker]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleChange = (key: string, value: string, type: "share" | "trading") => {
    const parsed = parseFloat(value);
    if (type === "share") {
      setShareLocal({ ...shareLocal, [key]: isNaN(parsed) ? undefined : parsed });
    } else {
      setTradingLocal({ ...tradingLocal, [key]: isNaN(parsed) ? undefined : parsed });
    }
  };

  const handleSave = async (type: "share" | "trading") => {
    setSaving(true);
    try {
      const apiUrl = process.env.REACT_APP_API_URL;
      const token = localStorage.getItem("access_token");

      const payload: Record<string, any> = { ticker };

      if (type === "share") {
        Object.assign(payload, shareLocal);
      } else {
        Object.assign(payload, tradingLocal);
      }

      const response = await fetch(`${apiUrl}/api/fo_writeup_details/`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        console.error("Save failed");
      } else {
        type === "share" ? setEditShare(false) : setEditTrading(false);
      }
    } catch (error) {
      console.error("Save error:", error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Container maxWidth="xl">
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl">
      <Box display="flex" gap={3} flexWrap="wrap">
        {/* Trading Details Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          style={{
            flex: "1 1 400px",
            borderRadius: 16,
            background: "linear-gradient(#f0f5ff)",
            boxShadow: "0 8px 20px rgba(0,0,0,0.08)",
            padding: "20px",
            position: "relative",
            minHeight: "400px",
          }}
        >
          <IconButton
            onClick={() => (editTrading ? handleSave("trading") : setEditTrading(true))}
            disabled={saving}
            sx={{ position: "absolute", top: 12, right: 12, color: "#002060" }}
          >
            {saving && editTrading ? <CircularProgress size={20} /> : editTrading ? <SaveIcon /> : <EditIcon />}
          </IconButton>
          <Typography variant="h6" align="center" sx={{ color: "#026269", fontWeight: "bold", mb: 3 }}>
            Trading Details
          </Typography>
          <Box display="flex" flexWrap="wrap" gap={3} justifyContent="space-between">
            {tradingFields.map((field) => (
              <Box key={field.key} flex="1 1 calc(50% - 12px)" minWidth="250px" mb={2}>
                <Typography sx={{ fontWeight: 600, color: "#124180", fontSize: "18px" }}>{field.label}</Typography>
                {editTrading ? (
                  <TextField
                    fullWidth
                    size="small"
                    type="number"
                    value={tradingLocal[field.key] ?? ""}
                    onChange={(e) => handleChange(field.key, e.target.value, "trading")}
                  />
                ) : (
                  <Typography sx={{ fontWeight: 400, fontSize: "18px", color: "#333333" }}>
                    {formatValue(tradingLocal[field.key], field.suffix)}
                  </Typography>
                )}
              </Box>
            ))}
          </Box>
        </motion.div>

        {/* Share Price Performance Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          style={{
            flex: "1 1 400px",
            borderRadius: 16,
            background: "linear-gradient(#f0f5ff)",
            boxShadow: "0 8px 20px rgba(0,0,0,0.08)",
            padding: "20px",
            position: "relative",
            minHeight: "400px",
          }}
        >
          <IconButton
            onClick={() => (editShare ? handleSave("share") : setEditShare(true))}
            disabled={saving}
            sx={{ position: "absolute", top: 12, right: 12, color: "#002060" }}
          >
            {saving && editShare ? <CircularProgress size={20} /> : editShare ? <SaveIcon /> : <EditIcon />}
          </IconButton>
          <Typography variant="h6" align="center" sx={{ color: "#026269", fontWeight: "bold", mb: 3 }}>
            Share Price Performance
          </Typography>
          <Box display="flex" flexWrap="wrap" gap={3} justifyContent="space-between">
            {shareFields.map((field) => (
              <Box key={field.key} flex="1 1 calc(50% - 12px)" minWidth="250px" mb={2}>
                <Typography sx={{ fontWeight: 600, color: "#124180", fontSize: "18px" }}>{field.label}</Typography>
                {editShare ? (
                  <TextField
                    fullWidth
                    size="small"
                    type="number"
                    value={shareLocal[field.key] ?? ""}
                    onChange={(e) => handleChange(field.key, e.target.value, "share")}
                  />
                ) : (
                  <Typography sx={{ fontWeight: 400, fontSize: "18px", color: "#333333" }}>
                    {formatValue(shareLocal[field.key], "%")}
                  </Typography>
                )}
              </Box>
            ))}
          </Box>
        </motion.div>
      </Box>
    </Container>
  );
};

export default FODealInformationMainTable;
