import React, { useState, useEffect } from "react";
import { Box, Typography, TextField, IconButton, CircularProgress } from "@mui/material";
import { motion } from "framer-motion";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import { BusinessDetails } from "../types/FOWriteUpData";

interface FOWriteUpMetaDataBusinessOverviewProps {
  ticker: string;
  pricing_date?: string;
  unique_deal_id?: string;
  data?: BusinessDetails;
  onUpdate?: () => void;
}

const FOWriteUpMetaDataBusinessOverview: React.FC<FOWriteUpMetaDataBusinessOverviewProps> = ({
  ticker,
  pricing_date,
  unique_deal_id,
  data: initialData,
  onUpdate,
}) => {
  const [formData, setFormData] = useState<BusinessDetails>(initialData ?? {});
  const [editMode, setEditMode] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setFormData(initialData ?? {});
  }, [initialData]);

  const handleChange = (key: keyof BusinessDetails, value: string) => {
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
        Business Overview
      </Typography>

      <Box display="flex" flexDirection="column" gap={3}>
        <Box>
          <Typography sx={{ fontWeight: 600, color: "#124180", fontSize: "16px", mb: 1 }}>
            Business Highlights
          </Typography>
          {editMode ? (
            <TextField
              fullWidth
              multiline
              rows={4}
              value={formData.business_highlights ?? ""}
              onChange={(e) => handleChange("business_highlights", e.target.value)}
            />
          ) : (
            <Typography sx={{ color: "#333333", fontSize: "14px", whiteSpace: "pre-wrap" }}>
              {formData.business_highlights || "N/A"}
            </Typography>
          )}
        </Box>

        <Box>
          <Typography sx={{ fontWeight: 600, color: "#124180", fontSize: "16px", mb: 1 }}>
            Strengths
          </Typography>
          {editMode ? (
            <TextField
              fullWidth
              multiline
              rows={4}
              value={formData.strengths ?? ""}
              onChange={(e) => handleChange("strengths", e.target.value)}
            />
          ) : (
            <Typography sx={{ color: "#333333", fontSize: "14px", whiteSpace: "pre-wrap" }}>
              {formData.strengths || "N/A"}
            </Typography>
          )}
        </Box>

        <Box>
          <Typography sx={{ fontWeight: 600, color: "#124180", fontSize: "16px", mb: 1 }}>
            Weaknesses
          </Typography>
          {editMode ? (
            <TextField
              fullWidth
              multiline
              rows={4}
              value={formData.weakness ?? ""}
              onChange={(e) => handleChange("weakness", e.target.value)}
            />
          ) : (
            <Typography sx={{ color: "#333333", fontSize: "14px", whiteSpace: "pre-wrap" }}>
              {formData.weakness || "N/A"}
            </Typography>
          )}
        </Box>

        <Box>
          <Typography sx={{ fontWeight: 600, color: "#124180", fontSize: "16px", mb: 1 }}>
            Management
          </Typography>
          {editMode ? (
            <TextField
              fullWidth
              multiline
              rows={4}
              value={formData.management ?? ""}
              onChange={(e) => handleChange("management", e.target.value)}
            />
          ) : (
            <Typography sx={{ color: "#333333", fontSize: "14px", whiteSpace: "pre-wrap" }}>
              {formData.management || "N/A"}
            </Typography>
          )}
        </Box>
      </Box>
    </motion.div>
  );
};

export default FOWriteUpMetaDataBusinessOverview;
