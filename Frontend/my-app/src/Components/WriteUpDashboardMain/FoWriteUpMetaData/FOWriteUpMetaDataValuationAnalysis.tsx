import React, { useState, useEffect } from "react";
import { Box, Typography, TextField, IconButton, CircularProgress } from "@mui/material";
import { motion } from "framer-motion";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import { ValuationWriteup } from "../types/FOWriteUpData";

interface FOWriteUpMetaDataValuationAnalysisProps {
  ticker: string;
  pricing_date?: string;
  unique_deal_id?: string;
  data?: ValuationWriteup;
  onUpdate?: () => void;
}

const FOWriteUpMetaDataValuationAnalysis: React.FC<FOWriteUpMetaDataValuationAnalysisProps> = ({
  ticker,
  pricing_date,
  unique_deal_id,
  data: initialData,
  onUpdate,
}) => {
  const [formData, setFormData] = useState<ValuationWriteup>(initialData ?? {});
  const [editMode, setEditMode] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setFormData(initialData ?? {});
  }, [initialData]);

  const handleChange = (key: keyof ValuationWriteup, value: string) => {
    setFormData({ ...formData, [key]: value });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const apiUrl = process.env.REACT_APP_API_URL;
      const token = localStorage.getItem("access_token");

      const payload: Record<string, any> = {
        ticker,
        unique_deal_id,
        pricing_date,
        ...formData,
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
        Valuation Analysis
      </Typography>

      <Box display="flex" flexDirection="column" gap={3}>
        <Box>
          <Typography sx={{ fontWeight: 600, color: "#124180", fontSize: "16px", mb: 1 }}>
            Company Overview
          </Typography>
          {editMode ? (
            <TextField
              fullWidth
              multiline
              rows={4}
              value={formData.company_overview ?? ""}
              onChange={(e) => handleChange("company_overview", e.target.value)}
            />
          ) : (
            <Typography sx={{ color: "#333333", fontSize: "14px", whiteSpace: "pre-wrap" }}>
              {formData.company_overview || "N/A"}
            </Typography>
          )}
        </Box>

        <Box>
          <Typography sx={{ fontWeight: 600, color: "#124180", fontSize: "16px", mb: 1 }}>
            Future Outlook
          </Typography>
          {editMode ? (
            <TextField
              fullWidth
              multiline
              rows={4}
              value={formData.future_outlook ?? ""}
              onChange={(e) => handleChange("future_outlook", e.target.value)}
            />
          ) : (
            <Typography sx={{ color: "#333333", fontSize: "14px", whiteSpace: "pre-wrap" }}>
              {formData.future_outlook || "N/A"}
            </Typography>
          )}
        </Box>

        <Box>
          <Typography sx={{ fontWeight: 600, color: "#124180", fontSize: "16px", mb: 1 }}>
            Recent Developments
          </Typography>
          {editMode ? (
            <TextField
              fullWidth
              multiline
              rows={4}
              value={formData.recent_developments ?? ""}
              onChange={(e) => handleChange("recent_developments", e.target.value)}
            />
          ) : (
            <Typography sx={{ color: "#333333", fontSize: "14px", whiteSpace: "pre-wrap" }}>
              {formData.recent_developments || "N/A"}
            </Typography>
          )}
        </Box>
      </Box>
    </motion.div>
  );
};

export default FOWriteUpMetaDataValuationAnalysis;
