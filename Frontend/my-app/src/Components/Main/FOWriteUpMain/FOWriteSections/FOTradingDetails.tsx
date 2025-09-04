import React, { useState } from "react";
import {
  Box,
  Typography,
  Container,
  TextField,
  IconButton,
} from "@mui/material";
import { motion } from "framer-motion";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";

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

interface FOTradingDetailsProps {
  data: TradingDetails;
  ticker: string;
}

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

const FOTradingDetails: React.FC<FOTradingDetailsProps> = ({ data, ticker }) => {
  const [localData, setLocalData] = useState<TradingDetails>(data);
  const [editMode, setEditMode] = useState(false);

  const handleChange = (key: keyof TradingDetails, value: string) => {
    const parsed = parseFloat(value);
    setLocalData({ ...localData, [key]: isNaN(parsed) ? undefined : parsed });
  };

  const handleSave = async () => {
    try {
      const apiUrl = process.env.REACT_APP_API_URL;
      const token = localStorage.getItem("access_token");

      const payload = {
        ticker,
        ...localData,
      };

      const response = await fetch(`${apiUrl}/api/fo_writeup_data/`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        console.error("Failed to save");
      } else {
        setEditMode(false);
      }
    } catch (error) {
      console.error("Error during save:", error);
    }
  };

  return (
    <Container maxWidth="xl">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        style={{
          borderRadius: 16,
          background: "linear-gradient(#f0f5ff)",
          boxShadow: "0 8px 20px rgba(0,0,0,0.08)",
          padding: "20px",
          position: "relative",
        }}
      >
        {/* Edit/Save Icon */}
        <IconButton
          onClick={() => (editMode ? handleSave() : setEditMode(true))}
          sx={{ position: "absolute", top: 12, right: 12 , color: "#002060"}}

        >
          {editMode ? <SaveIcon /> : <EditIcon />}
        </IconButton>

        <Typography
          variant="h6"
          align="center"
          sx={{ color: "#026269", fontWeight: "bold", mb: 3 }}
        >
          Trading Details
        </Typography>

        <Box display="flex" flexWrap="wrap" gap={3} justifyContent="space-between">
          {tradingFields.map((field, idx) => (
            <motion.div
              key={field.key}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              style={{ flex: "1 1 calc(50% - 12px)", minWidth: "250px" }}
            >
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5, color: "#124180" }}>
                  {field.label}
                </Typography>
                {editMode ? (
                  <TextField
                    fullWidth
                    size="small"
                    type="number"
                    variant="outlined"
                    value={localData[field.key] ?? ""}
                    onChange={(e) => handleChange(field.key, e.target.value)}
                  />
                ) : (
                  <Typography variant="h6" sx={{ color: "#333" }}>
                    {formatValue(localData[field.key], field.suffix)}
                  </Typography>
                )}
              </Box>
            </motion.div>
          ))}
        </Box>
      </motion.div>
    </Container>
  );
};

export default FOTradingDetails;
