import React, { useState, useRef, useEffect } from "react";
import {
  Box,
  Typography,
  Container,
  Grid,
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

interface StrengthWriteupProps {
  selectedData: {
    strengths?: string;
    weakness?: string;
  };
  ticker: string;
}

const FOStrengthWriteUp: React.FC<StrengthWriteupProps> = ({
  selectedData,
  ticker,
}) => {
  const [editStrength, setEditStrength] = useState(false);
  const [editWeakness, setEditWeakness] = useState(false);
  const [strengthValue, setStrengthValue] = useState(
    selectedData.strengths || ""
  );
  const [weaknessValue, setWeaknessValue] = useState(
    selectedData.weakness || ""
  );

  // Controlled expansion state
  const [expandedStrength, setExpandedStrength] = useState(false);
  const [expandedWeakness, setExpandedWeakness] = useState(false);
  const { forceExpand } = useExportContext();

  // Refs to focus textarea when entering edit
  const strengthRef = useRef<HTMLInputElement | null>(null);
  const weaknessRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (editStrength && strengthRef.current) {
      strengthRef.current.focus();
    }
  }, [editStrength]);

  useEffect(() => {
    if (editWeakness && weaknessRef.current) {
      weaknessRef.current.focus();
    }
  }, [editWeakness]);

  const handleSave = async (field: "strengths" | "weakness") => {
    const apiUrl = process.env.REACT_APP_API_URL;
    const token = localStorage.getItem("access_token");

    const payload = {
      ticker,
      [field]: field === "strengths" ? strengthValue : weaknessValue,
    };

    try {
      const response = await fetch(`${apiUrl}/api/fo_writeup_data/`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        if (field === "strengths") setEditStrength(false);
        else setEditWeakness(false);
      } else {
        console.error("Error updating:", field);
      }
    } catch (error) {
      console.error("PATCH error:", error);
    }
  };

  // Only toggle expand when the click originates from the chevron IconButton
  const handleAccordionChange =
    (which: "strengths" | "weakness") =>
    (event: React.SyntheticEvent, _isExpanded: boolean) => {
      const fromExpander = (event.target as HTMLElement)?.closest(
        '[data-expander="true"]'
      );
      if (!fromExpander) return; // ignore clicks not from the expander

      if (which === "strengths") {
        setExpandedStrength((prev) => !prev);
      } else {
        setExpandedWeakness((prev) => !prev);
      }
    };

  // Edit buttons: expand + enter edit mode, then focus textarea
  const handleEditClick = (which: "strengths" | "weakness") => {
    if (which === "strengths") {
      setExpandedStrength(true);
      setEditStrength(true);
      // focus happens via useEffect
    } else {
      setExpandedWeakness(true);
      setEditWeakness(true);
    }
  };

  const MotionBox = motion(Box);

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Grid container spacing={4}>
        {/* Strengths Section */}
        {selectedData.strengths !== undefined && (
          <Grid item xs={12} md={6}>
            <MotionBox
              initial={{ opacity: 0, scale: 0.95, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            >
              <Accordion
                expanded={forceExpand || expandedStrength}
                onChange={handleAccordionChange("strengths")}
                sx={{
                  borderRadius: 3,
                  background: "linear-gradient(#f0f5ff)",
                  boxShadow: "0 8px 20px rgba(0,0,0,0.08)",
                }}
              >
                <AccordionSummary
                  // We prevent full-header toggling by gating in onChange (above).
                  expandIcon={
                    <IconButton
                      data-expander="true"
                      size="small"
                      sx={{ color: "#002060" }}
                    >
                      <ExpandMoreIcon />
                    </IconButton>
                  }
                  id="strengths-header"
                  sx={{
                    background: "linear-gradient(#f0f5ff)",
                    borderBottom: "1px solid rgba(0,0,0,0.05)",
                    position: "relative",
                  }}
                >
                  <Typography
                    variant="h6"
                    align="center"
                    sx={{
                      color: "#026269",
                      fontWeight: "bold",
                      flex: 1,
                    }}
                  >
                    Strengths
                  </Typography>
                  <IconButton
                    onClick={(e) => {
                      e.stopPropagation();
                      editStrength
                        ? handleSave("strengths")
                        : handleEditClick("strengths");
                    }}
                    sx={{ color: "#002060" }}
                  >
                    {editStrength ? <SaveIcon /> : <EditIcon />}
                  </IconButton>
                </AccordionSummary>
                <AccordionDetails>
                  {editStrength ? (
                    <TextField
                      inputRef={strengthRef}
                      multiline
                      fullWidth
                      minRows={6}
                      value={strengthValue}
                      onChange={(e) => setStrengthValue(e.target.value)}
                    />
                  ) : (
                    <Typography
                      variant="body1"
                      sx={{
                        color: "#333",
                        lineHeight: 1.7,
                        fontSize: "1.05rem",
                      }}
                    >
                      {selectedData.strengths}
                    </Typography>
                  )}
                </AccordionDetails>
              </Accordion>
            </MotionBox>
          </Grid>
        )}

        {/* Weaknesses Section */}
        {selectedData.weakness !== undefined && (
          <Grid item xs={12} md={6}>
            <MotionBox
              initial={{ opacity: 0, scale: 0.95, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            >
              <Accordion
                expanded={forceExpand || expandedWeakness}
                onChange={handleAccordionChange("weakness")}
                sx={{
                  borderRadius: 3,
                  background: "linear-gradient(#f0f5ff)",
                  boxShadow: "0 8px 20px rgba(0,0,0,0.08)",
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
                  id="weakness-header"
                  sx={{
                    background: "linear-gradient(#f0f5ff)",
                    borderBottom: "1px solid rgba(0,0,0,0.05)",
                    position: "relative",
                  }}
                >
                  <Typography
                    variant="h6"
                    align="center"
                    sx={{
                      color: "#026269",
                      fontWeight: "bold",
                      flex: 1,
                    }}
                  >
                    Concerns
                  </Typography>
                  <IconButton
                    onClick={(e) => {
                      e.stopPropagation();
                      editWeakness
                        ? handleSave("weakness")
                        : handleEditClick("weakness");
                    }}
                    sx={{ color: "#002060" }}
                  >
                    {editWeakness ? <SaveIcon /> : <EditIcon />}
                  </IconButton>
                </AccordionSummary>
                <AccordionDetails>
                  {editWeakness ? (
                    <TextField
                      inputRef={weaknessRef}
                      multiline
                      fullWidth
                      minRows={6}
                      value={weaknessValue}
                      onChange={(e) => setWeaknessValue(e.target.value)}
                    />
                  ) : (
                    <Typography
                      variant="body1"
                      sx={{
                        color: "#333",
                        lineHeight: 1.7,
                        fontSize: "1.05rem",
                      }}
                    >
                      {selectedData.weakness}
                    </Typography>
                  )}
                </AccordionDetails>
              </Accordion>
            </MotionBox>
          </Grid>
        )}
      </Grid>
    </Container>
  );
};

export default FOStrengthWriteUp;
