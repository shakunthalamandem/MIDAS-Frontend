import React, { useState, useRef, useEffect, useMemo } from "react";
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
import { useExportContext } from "../../../../contexts/ExportContext";

interface FOBusinessHighlightsProps {
  selectedData: {
    business_highlights?: string;
  };
  ticker: string;
}

const toBulletItems = (text?: string): string[] => {
  if (!text) return [];
  return text
    .split(/[\n;]|[•]/g)
    .map((s) => s.replace(/^\s*[-–—•\d\)\.]+\s*/g, "").trim())
    .filter(Boolean);
};

const FOBusinessHighlights: React.FC<FOBusinessHighlightsProps> = ({
  selectedData,
  ticker,
}) => {
  const raw = selectedData?.business_highlights || "";

  const [editMode, setEditMode] = useState(false);
  const [value, setValue] = useState(raw);
  const [loading, setLoading] = useState(false);

  // keep local value in sync when NOT editing
  useEffect(() => {
    if (!editMode) setValue(raw);
  }, [raw, editMode]);

  const bullets = useMemo(() => toBulletItems(raw), [raw]);

  // Accordion expansion
  const [expanded, setExpanded] = useState(false);
  const { forceExpand } = useExportContext();
  const isExpanded = forceExpand || expanded || editMode;

  // Focus ref (multiline -> textarea)
  const inputRef = useRef<HTMLTextAreaElement | null>(null);
  useEffect(() => {
    if (editMode && inputRef.current) inputRef.current.focus();
  }, [editMode]);

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

      if (response.ok) {
        setEditMode(false);
      } else {
        console.error("Failed to update business highlights");
      }
    } catch (error) {
      console.error("Error updating business highlights:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAccordionChange = (event: React.SyntheticEvent) => {
    const fromExpander = (event.target as HTMLElement)?.closest('[data-expander="true"]');
    if (!fromExpander) return;
    setExpanded((prev) => !prev);
  };

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (editMode) {
      handleSave();
    } else {
      setExpanded(true);
      setEditMode(true);
    }
  };

  // 🚨 Move hooks before return
  if (!selectedData || selectedData.business_highlights == null) {
    return null;
  }

  return (
    <motion.div initial={false} animate={{ opacity: 1, scale: 1, y: 0 }}>
      <Accordion
        expanded={isExpanded}
        onChange={handleAccordionChange as any}
        TransitionProps={{ unmountOnExit: false, timeout: editMode ? 0 : 200 }}
        sx={{
          borderRadius: 3,
          background: "linear-gradient(#f0f5ff)",
          boxShadow: "0 8px 20px rgba(0,0,0,0.08)",
          "&:before": { display: "none" },
        }}
      >
        <AccordionSummary
          expandIcon={
            <IconButton data-expander="true" size="small" sx={{ color: "#002060" }}>
              <ExpandMoreIcon />
            </IconButton>
          }
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
            sx={{ color: "#026269", fontWeight: "bold", flex: 1, textAlign: "center" }}
          >
            Business Highlights
          </Typography>

          <IconButton
            size="small"
            onClick={handleEditClick}
            disabled={loading}
            sx={{ color: "#002060" }}
          >
            {editMode ? <SaveIcon /> : <EditIcon />}
          </IconButton>
        </AccordionSummary>

        <AccordionDetails>
          {editMode ? (
            <TextField
              inputRef={inputRef}
              multiline
              fullWidth
              minRows={6}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              disabled={loading}
              variant="outlined"
              placeholder={"Enter one point per line, or separate with ';' or '•'."}
            />
          ) : bullets.length ? (
            <Box component="ul" sx={{ pl: 3, m: 0 }}>
              {bullets.map((item, i) => (
                <li key={i}>
                  <Typography variant="body1" sx={{ color: "#333", lineHeight: 1.7 }}>
                    {item}
                  </Typography>
                </li>
              ))}
            </Box>
          ) : (
            <Typography variant="body2" sx={{ color: "#000000", fontStyle: "italic" }}>
              No highlights available.
            </Typography>
          )}
        </AccordionDetails>
      </Accordion>
    </motion.div>
  );
};

export default FOBusinessHighlights;
