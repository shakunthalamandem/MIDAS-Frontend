import React, { useState } from "react";
import {
  Box,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  IconButton,
  TextField,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import { motion } from "framer-motion";

interface FOBusinessHighlightsProps {
  selectedData: {
    business_highlights?: string;
  };
  ticker: string;
}

const FOBusinessHighlights: React.FC<FOBusinessHighlightsProps> = ({ selectedData, ticker }) => {
  const [editMode, setEditMode] = useState(false);
  const [value, setValue] = useState(selectedData.business_highlights || "");
  const [loading, setLoading] = useState(false);

  if (!selectedData || !selectedData.business_highlights) return null;

  const handleSave = async () => {
    setLoading(true);
    const apiUrl = process.env.REACT_APP_API_URL;
    const token = localStorage.getItem("access_token");

    try {
      const response = await fetch(`${apiUrl}/api/fo_writeup_data/`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify({
          ticker,
          business_highlights: value,
        }),
      });

      if (!response.ok) {
        console.error("Failed to update business highlights");
      } else {
        setEditMode(false);
      }
    } catch (error) {
      console.error("Error updating business highlights:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 30 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <Accordion
        sx={{
          borderRadius: 3,
          background: "linear-gradient(#f0f5ff)",
          boxShadow: "0 8px 20px rgba(0,0,0,0.08)",
          "&:before": { display: "none" },
        }}
      >
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          id="business-highlights-header"
          sx={{
            background: "linear-gradient(#f0f5ff)",
            borderBottom: "1px solid rgba(0,0,0,0.05)",
            display: "flex",
            alignItems: "center",
            gap: 1,
          }}
        >
          <Typography
            variant="h6"
            sx={{
              color: "#026269",
              fontWeight: "bold",
              flex: 1,
              textAlign: "center",
            }}
          >
            Business Highlights
          </Typography>

          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              if (editMode) {
                handleSave();
              } else {
                setEditMode(true);
              }
            }}
            disabled={loading}
          >
            {editMode ? <SaveIcon /> : <EditIcon />}
          </IconButton>
        </AccordionSummary>

        <AccordionDetails>
          {editMode ? (
            <TextField
              multiline
              fullWidth
              minRows={6}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              disabled={loading}
                          sx={{ color: "#002060" }}  // <-- Icon color updated here

              variant="outlined"
            />
          ) : (
            <Box>
              <Typography
                variant="body1"
                sx={{
                  color: "#333",
                  lineHeight: 1.7,
                  fontSize: "1.1rem",
                  whiteSpace: "pre-line",
                }}
              >
                {value}
              </Typography>
            </Box>
          )}
        </AccordionDetails>
      </Accordion>
    </motion.div>
  );
};

export default FOBusinessHighlights;
