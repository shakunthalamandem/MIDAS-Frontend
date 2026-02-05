import React, { useState, useRef, useEffect, useMemo, useCallback } from "react";
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

interface FOManagementWriteupProps {
  selectedData: {
    management_writeup?: string;
  };
  ticker: string;
}

// Split into points, strip leading markers like "-", "•", "1)", etc.
const toBulletItems = (text?: string): string[] => {
  if (!text) return [];
  return text
    .split(/[\n;]|[•]/g)
    .map((s) => s.replace(/^\s*[-–—•\d]+\s*\)?\.?\s*/g, "").trim())
    .map((s) => s.replace(/\s+/g, " ")) // collapse extra spaces
    .filter(Boolean);
};

const FOManagementWriteup: React.FC<FOManagementWriteupProps> = ({
  selectedData,
  ticker,
}) => {
  const raw = selectedData?.management_writeup || "";

  const [editMode, setEditMode] = useState(false);
  const [value, setValue] = useState(raw);
  const [loading, setLoading] = useState(false);

  // Keep local editable value in sync when NOT editing (prevents caret jumps)
  useEffect(() => {
    if (!editMode) setValue(raw);
  }, [raw, editMode]);

  const bullets = useMemo(() => toBulletItems(raw), [raw]);

  // Accordion controlled expansion
  const [expanded, setExpanded] = useState(false);
  const { forceExpand } = useExportContext();
  const isExpanded = forceExpand || expanded || editMode; // keep open while editing

  // Textarea ref & focus
  const inputRef = useRef<HTMLTextAreaElement | null>(null);
  useEffect(() => {
    if (editMode && inputRef.current) inputRef.current.focus();
  }, [editMode]);

  const handleSave = useCallback(async () => {
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
          management_writeup: value,
        }),
      });

      if (response.ok) {
        setEditMode(false);
        setExpanded(true);
      } else {
        console.error("Failed to update management writeup");
      }
    } catch (error) {
      console.error("Error updating management writeup:", error);
    } finally {
      setLoading(false);
    }
  }, [ticker, value]);

  // Toggle accordion only if chevron is clicked
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

  // Caret-preserving change handler (avoids cursor jump)
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const el = e.target as HTMLTextAreaElement;
    const pos = el.selectionStart ?? e.target.value.length;
    setValue(e.target.value);
    queueMicrotask(() => {
      try { el.setSelectionRange(pos, pos); } catch {}
    });
  };

  // If API didn't send this field, don't render the section at all
  if (!selectedData || selectedData.management_writeup == null) return null;

  return (
    <motion.div initial={false} animate={{ opacity: 1, scale: 1, y: 0 }}>
      <Accordion
        expanded={isExpanded}
        onChange={handleAccordionChange as any}
        TransitionProps={{ unmountOnExit: false, timeout: editMode ? 0 : 200 }} // no animation while editing
        sx={{
          borderRadius: 3,
          background: "linear-gradient(#f0f5ff)",
          boxShadow: "0 8px 20px rgba(0,0,0,0.08)",
          "&:before": { display: "none" },
          "& .MuiAccordionSummary-root": { minHeight: 56 },
          "& .MuiAccordionSummary-content": { my: 0 },
        }}
      >
        <AccordionSummary
          expandIcon={
            <IconButton data-expander="true" size="small" sx={{ color: "#002060" }}>
              <ExpandMoreIcon />
            </IconButton>
          }
          id="management-writeup-header"
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
            Management
          </Typography>

          <IconButton
            size="small"
            onClick={handleEditClick}
            disabled={loading}
            sx={{ color: "#002060" }}
            aria-label={editMode ? "save management writeup" : "edit management writeup"}
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
              onChange={handleChange}
              disabled={loading}
              variant="outlined"
              placeholder={"Enter one leader per line, or separate with ';' or '•'."}
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
              No management details available.
            </Typography>
          )}
        </AccordionDetails>
      </Accordion>
    </motion.div>
  );
};

export default FOManagementWriteup;
