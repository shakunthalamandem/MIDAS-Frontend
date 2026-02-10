import React, { useState, useEffect } from "react";
import { Box, Typography, TextField, IconButton, CircularProgress } from "@mui/material";
import { motion } from "framer-motion";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";

interface FOWriteUpMetaDataInvestmentHighlightsProps {
  ticker: string;
  data?: string;
  onUpdate?: () => void;
}

const FOWriteUpMetaDataInvestmentHighlights: React.FC<FOWriteUpMetaDataInvestmentHighlightsProps> = ({
  ticker,
  data: initialData,
  onUpdate,
}) => {
  const [investmentHighlights, setInvestmentHighlights] = useState<string>(initialData ?? "");
  const [editMode, setEditMode] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setInvestmentHighlights(initialData ?? "");
  }, [initialData]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const apiUrl = process.env.REACT_APP_API_URL;
      const token = localStorage.getItem("access_token");

      const payload: Record<string, any> = {
        ticker,
        investment_highlights: investmentHighlights,
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
        Investment Highlights
      </Typography>

      <Box>
        {editMode ? (
          <TextField
            fullWidth
            multiline
            rows={6}
            value={investmentHighlights}
            onChange={(e) => setInvestmentHighlights(e.target.value)}
            placeholder="Enter investment highlights..."
          />
        ) : (
          <Typography sx={{ color: "#333333", fontSize: "14px", whiteSpace: "pre-wrap" }}>
            {investmentHighlights || "N/A"}
          </Typography>
        )}
      </Box>
    </motion.div>
  );
};

export default FOWriteUpMetaDataInvestmentHighlights;
