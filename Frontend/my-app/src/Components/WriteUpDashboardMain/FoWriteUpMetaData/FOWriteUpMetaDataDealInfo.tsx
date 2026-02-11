import React, { useState, useEffect } from "react";
import { Box, Typography, TextField, IconButton, CircularProgress } from "@mui/material";
import { motion } from "framer-motion";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import {
  TradingDetails,
  SharePricePerformance,
} from "../types/FOWriteUpData";

interface FOWriteUpMetaDataDealInfoProps {
  ticker: string;
  tradingDetails?: TradingDetails;
  sharePricePerformance?: SharePricePerformance;
  useOfProceeds?: string;
  trackRecord?: string;
  onUpdate?: () => void;
}

const tradingFields: { label: string; key: keyof TradingDetails; type?: string; prefix?: string; suffix?: string }[] = [
  { label: "Current Share Price", key: "current_share_price", type: "number", prefix: "$" },
  { label: "Market Cap (M)", key: "current_market_cap", type: "number", prefix: "$" },
  { label: "Float (% Shares Outstanding)", key: "float_as_percent_shares_outstanding", type: "number", suffix: "%" },
  { label: "Short Interest (% Float)", key: "short_interest_as_percent_float", type: "number", suffix: "%" },
  { label: "Volume (30-day Avg)", key: "volume_30day_average", type: "number" },
  { label: "Mean Target Price", key: "mean_target_price", type: "number", prefix: "$" },
  { label: "Consensus Recommendations", key: "concensus_recomendations", type: "text" },
  { label: "% of 52-Week High", key: "percentage_of_52_week_high", type: "number", suffix: "%" },
];

const performanceFields: { label: string; key: keyof SharePricePerformance; suffix?: string }[] = [
  { label: "3-Year Total Return (%)", key: "_3_year_total_return", suffix: "%" },
  { label: "1-Year Total Return (%)", key: "_1_year_total_return", suffix: "%" },
  { label: "YTD Return (%)", key: "ytd_return", suffix: "%" },
  { label: "6-Month Return (%)", key: "_6_month_return", suffix: "%" },
  { label: "3-Month Return (%)", key: "_3_month_return", suffix: "%" },
  { label: "1-Month Return (%)", key: "_1_month_return", suffix: "%" },
];

const formatValue = (value: any, prefix?: string, suffix?: string) => {
  if (value === undefined || value === null) return "N/A";
  if (typeof value === "number") {
    const formatted = Number(value).toLocaleString(undefined, { maximumFractionDigits: 2 });
    if (prefix) return `${prefix}${formatted}`;
    if (suffix) return `${formatted}${suffix}`;
    return formatted;
  }
  return value;
};

const FOWriteUpMetaDataDealInfo: React.FC<FOWriteUpMetaDataDealInfoProps> = ({
  ticker,
  tradingDetails: initialTradingDetails,
  sharePricePerformance: initialPerformance,
  useOfProceeds: initialUseOfProceeds,
  trackRecord: initialTrackRecord,
  onUpdate,
}) => {
  const [tradingData, setTradingData] = useState<TradingDetails>(initialTradingDetails ?? {});
  const [performanceData, setPerformanceData] = useState<SharePricePerformance>(initialPerformance ?? {});
  const [useOfProceedsData, setUseOfProceedsData] = useState<string>(initialUseOfProceeds ?? "");
  const [trackRecordData, setTrackRecordData] = useState<string>(initialTrackRecord ?? "");
  const [editTradingMode, setEditTradingMode] = useState(false);
  const [editPerformanceMode, setEditPerformanceMode] = useState(false);
  const [editUseOfProceedsMode, setEditUseOfProceedsMode] = useState(false);
  const [editTrackRecordMode, setEditTrackRecordMode] = useState(false);
  const [savingTrading, setSavingTrading] = useState(false);
  const [savingPerformance, setSavingPerformance] = useState(false);
  const [savingUseOfProceeds, setSavingUseOfProceeds] = useState(false);
  const [savingTrackRecord, setSavingTrackRecord] = useState(false);

  useEffect(() => {
    setTradingData(initialTradingDetails ?? {});
    setPerformanceData(initialPerformance ?? {});
    setUseOfProceedsData(initialUseOfProceeds ?? "");
    setTrackRecordData(initialTrackRecord ?? "");
  }, [initialTradingDetails, initialPerformance, initialUseOfProceeds, initialTrackRecord]);

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

  const handleSaveTrading = async () => {
    setSavingTrading(true);
    try {
      const apiUrl = process.env.REACT_APP_API_URL;
      const token = localStorage.getItem("access_token");

      const response = await fetch(`${apiUrl}/api/fo_writeup_details/`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify({ ticker, ...tradingData }),
      });

      if (response.ok) {
        setEditTradingMode(false);
        onUpdate?.();
      }
    } catch (error) {
      console.error("Save error:", error);
    } finally {
      setSavingTrading(false);
    }
  };

  const handleSavePerformance = async () => {
    setSavingPerformance(true);
    try {
      const apiUrl = process.env.REACT_APP_API_URL;
      const token = localStorage.getItem("access_token");

      const response = await fetch(`${apiUrl}/api/fo_writeup_details/`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify({ ticker, ...performanceData }),
      });

      if (response.ok) {
        setEditPerformanceMode(false);
        onUpdate?.();
      }
    } catch (error) {
      console.error("Save error:", error);
    } finally {
      setSavingPerformance(false);
    }
  };

  const handleSaveUseOfProceeds = async () => {
    setSavingUseOfProceeds(true);
    try {
      const apiUrl = process.env.REACT_APP_API_URL;
      const token = localStorage.getItem("access_token");

      const response = await fetch(`${apiUrl}/api/fo_writeup_details/`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify({ ticker, use_of_proceeds: useOfProceedsData }),
      });

      if (response.ok) {
        setEditUseOfProceedsMode(false);
        onUpdate?.();
      }
    } catch (error) {
      console.error("Save error:", error);
    } finally {
      setSavingUseOfProceeds(false);
    }
  };

  const handleSaveTrackRecord = async () => {
    setSavingTrackRecord(true);
    try {
      const apiUrl = process.env.REACT_APP_API_URL;
      const token = localStorage.getItem("access_token");

      const response = await fetch(`${apiUrl}/api/fo_writeup_details/`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify({ ticker, track_record: trackRecordData }),
      });

      if (response.ok) {
        setEditTrackRecordMode(false);
        onUpdate?.();
      }
    } catch (error) {
      console.error("Save error:", error);
    } finally {
      setSavingTrackRecord(false);
    }
  };

  const cardStyle = {
    flex: 1,
    borderRadius: 3,
    background: "#f0f4ff",
    p: 3,
    position: "relative" as const,
  };

  const titleStyle = {
    fontWeight: 700,
    color: "#026269",
    fontSize: "18px",
    mb: 3,
    textAlign: "center" as const,
  };

  const labelStyle = {
    fontWeight: 600,
    color: "#1e3a5f",
    fontSize: "14px",
    mb: 0.5,
  };

  const valueStyle = {
    fontWeight: 400,
    fontSize: "14px",
    color: "#000000ff",
    mb: 2,
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Box display="flex" flexWrap="wrap" gap={2}>
        {/* Trading Details Card */}
        <Box sx={cardStyle}>
          <IconButton
            onClick={() => (editTradingMode ? handleSaveTrading() : setEditTradingMode(true))}
            disabled={savingTrading}
            size="small"
            sx={{ position: "absolute", top: 16, right: 16, color: "#1e3a5f" }}
          >
            {savingTrading ? <CircularProgress size={18} /> : editTradingMode ? <SaveIcon fontSize="small" /> : <EditIcon fontSize="small" />}
          </IconButton>

          <Typography sx={titleStyle}>Trading Details</Typography>

          <Box
            display="grid"
            gridTemplateColumns="repeat(3, 1fr)"
            gap={2}
          >
            {tradingFields.map((field) => (
              <Box key={field.key}>
                <Typography sx={labelStyle}>{field.label}</Typography>
                {editTradingMode ? (
                  <TextField
                    fullWidth
                    size="small"
                    type={field.type === "number" ? "number" : "text"}
                    value={tradingData[field.key] ?? ""}
                    onChange={(e) => handleTradingChange(field.key, e.target.value, field.type)}
                    sx={{
                      "& .MuiInputBase-input": { fontSize: "14px", py: 0.75 }
                    }}
                  />
                ) : (
                  <Typography sx={valueStyle}>
                    {formatValue(tradingData[field.key], field.prefix, field.suffix)}
                  </Typography>
                )}
              </Box>
            ))}
          </Box>
        </Box>

        {/* Share Price Performance Card */}
        <Box sx={cardStyle}>
          <IconButton
            onClick={() => (editPerformanceMode ? handleSavePerformance() : setEditPerformanceMode(true))}
            disabled={savingPerformance}
            size="small"
            sx={{ position: "absolute", top: 16, right: 16, color: "#1e3a5f" }}
          >
            {savingPerformance ? <CircularProgress size={18} /> : editPerformanceMode ? <SaveIcon fontSize="small" /> : <EditIcon fontSize="small" />}
          </IconButton>

          <Typography sx={titleStyle}>Share Price Performance</Typography>

          <Box
            display="grid"
            gridTemplateColumns="repeat(3, 1fr)"
            gap={2}
          >
            {performanceFields.map((field) => (
              <Box key={field.key}>
                <Typography sx={labelStyle}>{field.label}</Typography>
                {editPerformanceMode ? (
                  <TextField
                    fullWidth
                    size="small"
                    type="number"
                    value={performanceData[field.key] ?? ""}
                    onChange={(e) => handlePerformanceChange(field.key, e.target.value)}
                    sx={{
                      "& .MuiInputBase-input": { fontSize: "14px", py: 0.75 }
                    }}
                  />
                ) : (
                  <Typography sx={valueStyle}>
                    {formatValue(performanceData[field.key], undefined, field.suffix)}
                  </Typography>
                )}
              </Box>
            ))}
          </Box>
        </Box>
      </Box>

      {/* Use of Proceeds and Track Record Cards - Side by Side */}
      <Box display="flex" flexWrap="wrap" gap={2} mt={2}>
        {/* Use of Proceeds Card */}
        <Box sx={cardStyle}>
          <IconButton
            onClick={() => (editUseOfProceedsMode ? handleSaveUseOfProceeds() : setEditUseOfProceedsMode(true))}
            disabled={savingUseOfProceeds}
            size="small"
            sx={{ position: "absolute", top: 16, right: 16, color: "#1e3a5f" }}
          >
            {savingUseOfProceeds ? <CircularProgress size={18} /> : editUseOfProceedsMode ? <SaveIcon fontSize="small" /> : <EditIcon fontSize="small" />}
          </IconButton>

          <Typography sx={titleStyle}>Use of Proceeds</Typography>

          {editUseOfProceedsMode ? (
            <TextField
              fullWidth
              multiline
              minRows={4}
              value={useOfProceedsData}
              onChange={(e) => setUseOfProceedsData(e.target.value)}
              sx={{
                "& .MuiInputBase-input": { fontSize: "14px" }
              }}
            />
          ) : (
            <Typography sx={{ ...valueStyle, whiteSpace: "pre-wrap" }}>
              {useOfProceedsData || "N/A"}
            </Typography>
          )}
        </Box>

        {/* Track Record Card */}
        <Box sx={cardStyle}>
          <IconButton
            onClick={() => (editTrackRecordMode ? handleSaveTrackRecord() : setEditTrackRecordMode(true))}
            disabled={savingTrackRecord}
            size="small"
            sx={{ position: "absolute", top: 16, right: 16, color: "#1e3a5f" }}
          >
            {savingTrackRecord ? <CircularProgress size={18} /> : editTrackRecordMode ? <SaveIcon fontSize="small" /> : <EditIcon fontSize="small" />}
          </IconButton>

          <Typography sx={titleStyle}>Track Record</Typography>

          {editTrackRecordMode ? (
            <TextField
              fullWidth
              multiline
              minRows={4}
              value={trackRecordData}
              onChange={(e) => setTrackRecordData(e.target.value)}
              sx={{
                "& .MuiInputBase-input": { fontSize: "14px" }
              }}
            />
          ) : (
            <Typography sx={{ ...valueStyle, whiteSpace: "pre-wrap" }}>
              {trackRecordData || "N/A"}
            </Typography>
          )}
        </Box>
      </Box>
    </motion.div>
  );
};

export default FOWriteUpMetaDataDealInfo;
