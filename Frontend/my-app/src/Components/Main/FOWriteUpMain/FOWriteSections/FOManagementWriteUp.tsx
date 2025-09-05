import React, { useState, useRef, useEffect } from "react";
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

const FOManagementWriteup: React.FC<FOManagementWriteupProps> = ({
  selectedData,
  ticker,
}) => {
  const [editMode, setEditMode] = useState(false);
  const [value, setValue] = useState(selectedData.management_writeup || "");
  const [loading, setLoading] = useState(false);

  // Accordion controlled expansion
  const [expanded, setExpanded] = useState(false);
  const { forceExpand } = useExportContext();

  // Ref to focus textarea
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (editMode && inputRef.current) {
      inputRef.current.focus();
    }
  }, [editMode]);

  if (!selectedData || !selectedData.management_writeup) return null;

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
          management_writeup: value,
        }),
      });

      if (response.ok) {
        setEditMode(false); // go back to showing Edit button
        setExpanded(true); // keep accordion open after saving
      } else {
        console.error("Failed to update management writeup");
      }
    } catch (error) {
      console.error("Error updating management writeup:", error);
    } finally {
      setLoading(false);
    }
  };

  // Toggle accordion only if chevron is clicked
  const handleAccordionChange = (event: React.SyntheticEvent) => {
    const fromExpander = (event.target as HTMLElement)?.closest(
      '[data-expander="true"]'
    );
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

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 30 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <Accordion
        expanded={forceExpand || expanded}
        onChange={handleAccordionChange as any}
        sx={{
          borderRadius: 3,
          background: "linear-gradient(#f0f5ff)",
          boxShadow: "0 8px 20px rgba(0,0,0,0.08)",
          "&:before": { display: "none" },
        }}
      >
        <AccordionSummary
          expandIcon={
            <IconButton
              data-expander="true"
              size="small"
              sx={{ color: "#002060" }}
            >
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
            sx={{
              color: "#026269",
              fontWeight: "bold",
              flex: 1,
              textAlign: "center",
            }}
          >
            Management
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

export default FOManagementWriteup;
