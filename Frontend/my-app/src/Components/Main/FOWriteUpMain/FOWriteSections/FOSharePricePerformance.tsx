import React, { useState } from "react";
import {
  Box,
  Typography,
  Container,
  IconButton,
  TextField,
} from "@mui/material";
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

interface Props {
  selectedData: SharePricePerformance;
  ticker: string;
}

const perfFields: { label: string; key: keyof SharePricePerformance }[] = [
  { label: "3-Year Total Return (%)", key: "_3_year_total_return" },
  { label: "1-Year Total Return (%)", key: "_1_year_total_return" },
  { label: "YTD Return (%)", key: "ytd_return" },
  { label: "6-Month Return (%)", key: "_6_month_return" },
  { label: "3-Month Return (%)", key: "_3_month_return" },
  { label: "1-Month Return (%)", key: "_1_month_return" },
];

const formatValue = (value: any) => {
  if (value === undefined || value === null) return "N/A";
  if (typeof value === "number") return `${value.toLocaleString()}%`;
  return value;
};

const FOSharePricePerformance: React.FC<Props> = ({ selectedData, ticker }) => {
  const [editMode, setEditMode] = useState(false);
  const [localData, setLocalData] = useState<SharePricePerformance>(selectedData);

  const handleChange = (key: keyof SharePricePerformance, value: string) => {
    const parsed = parseFloat(value);
    setLocalData({
      ...localData,
      [key]: isNaN(parsed) ? undefined : parsed,
    });
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
        console.error("Save failed");
      } else {
        setEditMode(false);
      }
    } catch (error) {
      console.error("Save error:", error);
    }
  };

  if (!localData || Object.keys(localData).length === 0) return null;

  const leftFields = perfFields.slice(0, 3);
  const rightFields = perfFields.slice(3);

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
        {/* Edit/Save button */}
        <IconButton
          onClick={() => (editMode ? handleSave() : setEditMode(true))}
          sx={{ position: "absolute", top: 8, right: 8 ,color: "#002060"}}
        >
          {editMode ? <SaveIcon /> : <EditIcon />}
        </IconButton>

        <Typography
          variant="h6"
          align="center"
          sx={{ color: "#026269", fontWeight: "bold", mb: 3 }}
        >
          Share Price Performance
        </Typography>

        {/* Two Columns Layout */}
        <Box display="flex" gap={4} flexWrap="wrap">
          {/* Left Column */}
          <Box flex="1">
            {leftFields.map((field, idx) => (
              <motion.div
                key={field.key}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                style={{ marginBottom: "16px" }}
              >
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5, color: "#124180" }}>
                  {field.label}
                </Typography>
                {editMode ? (
                  <TextField
                    type="number"
                    fullWidth
                    size="small"
                    variant="outlined"
                    value={localData[field.key] ?? ""}
                    onChange={(e) => handleChange(field.key, e.target.value)}
                  />
                ) : (
                  <Typography variant="h6" sx={{ color: "#333" }}>
                    {formatValue(localData[field.key])}
                  </Typography>
                )}
              </motion.div>
            ))}
          </Box>

          {/* Right Column */}
          <Box flex="1">
            {rightFields.map((field, idx) => (
              <motion.div
                key={field.key}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: (idx + leftFields.length) * 0.05 }}
                style={{ marginBottom: "16px" }}
              >
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5, color: "#124180" }}>
                  {field.label}
                </Typography>
                {editMode ? (
                  <TextField
                    type="number"
                    fullWidth
                    size="small"
                    variant="outlined"
                    value={localData[field.key] ?? ""}
                    onChange={(e) => handleChange(field.key, e.target.value)}
                  />
                ) : (
                  <Typography variant="h6" sx={{ color: "#333" }}>
                    {formatValue(localData[field.key])}
                  </Typography>
                )}
              </motion.div>
            ))}
          </Box>
        </Box>
      </motion.div>
    </Container>
  );
};

export default FOSharePricePerformance;
