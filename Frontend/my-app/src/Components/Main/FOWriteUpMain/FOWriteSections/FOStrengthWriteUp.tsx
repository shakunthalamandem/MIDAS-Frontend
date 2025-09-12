import React, { useState, useRef, useEffect, useMemo, useCallback } from "react";
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
  Snackbar,
  Alert,
  CircularProgress,
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

const toBulletItems = (text?: string): string[] => {
  if (!text) return [];
  return text
    .split(/[\n;]|[•]/g)
    .map((s) => s.replace(/^\s*[-–—•\d\)\.]+\s*/g, "").trim())
    .filter(Boolean);
};

const FOStrengthWriteUp: React.FC<StrengthWriteupProps> = ({ selectedData, ticker }) => {
  const [editStrength, setEditStrength] = useState(false);
  const [editWeakness, setEditWeakness] = useState(false);

  // Local editable copies
  const [strengthValue, setStrengthValue] = useState(selectedData.strengths || "");
  const [weaknessValue, setWeaknessValue] = useState(selectedData.weakness || "");

  // ONLY resync from props when NOT editing (prevents caret jump)
  useEffect(() => {
    if (!editStrength) setStrengthValue(selectedData.strengths || "");
  }, [selectedData.strengths, editStrength]);

  useEffect(() => {
    if (!editWeakness) setWeaknessValue(selectedData.weakness || "");
  }, [selectedData.weakness, editWeakness]);

  const [expandedStrength, setExpandedStrength] = useState(false);
  const [expandedWeakness, setExpandedWeakness] = useState(false);
  const { forceExpand } = useExportContext();

  // Lock panel open while editing; also avoids shake from expand/collapse changes
  const isStrengthExpanded = (forceExpand || expandedStrength || editStrength);
  const isWeaknessExpanded = (forceExpand || expandedWeakness || editWeakness);

  // Refs for focusing (multiline -> HTMLTextAreaElement)
  const strengthRef = useRef<HTMLTextAreaElement | null>(null);
  const weaknessRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    if (editStrength && strengthRef.current) strengthRef.current.focus();
  }, [editStrength]);

  useEffect(() => {
    if (editWeakness && weaknessRef.current) weaknessRef.current.focus();
  }, [editWeakness]);

  // Feedback + loading state
  const [savingField, setSavingField] = useState<null | "strengths" | "weakness">(null);
  const [snackOpen, setSnackOpen] = useState(false);
  const [snackMsg, setSnackMsg] = useState("");
  const [snackSeverity, setSnackSeverity] = useState<"success" | "error" | "info">("info");

  // Abort in-flight save if saving again
  const abortRef = useRef<AbortController | null>(null);

  const showSnack = useCallback((msg: string, severity: "success" | "error" | "info") => {
    setSnackMsg(msg);
    setSnackSeverity(severity);
    setSnackOpen(true);
  }, []);

  const handleSave = useCallback(
    async (field: "strengths" | "weakness") => {
      const apiUrl = process.env.REACT_APP_API_URL;
      const token = localStorage.getItem("access_token");

      if (!apiUrl) {
        showSnack("Missing REACT_APP_API_URL. Please configure your env.", "error");
        return;
      }
      if (!ticker) {
        showSnack("Ticker is required to save.", "error");
        return;
      }

      // Cancel any previous request
      if (abortRef.current) abortRef.current.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      const payload: Record<string, string> = {
        ticker,
        [field]: field === "strengths" ? strengthValue : weaknessValue,
      };

      try {
        setSavingField(field);
        const response = await fetch(`${apiUrl}/api/fo_writeup_data/`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify(payload),
          signal: controller.signal,
        });

        if (!response.ok) {
          let detail = "";
          try {
            detail = (await response.json())?.detail || (await response.text());
          } catch {}
          throw new Error(detail || `HTTP ${response.status}`);
        }

        if (field === "strengths") setEditStrength(false);
        else setEditWeakness(false);

        showSnack("Saved successfully.", "success");
      } catch (err: any) {
        if (err?.name === "AbortError") {
          showSnack("Previous save cancelled.", "info");
        } else {
          showSnack(`Save failed: ${err?.message || "Unknown error"}`, "error");
        }
      } finally {
        setSavingField(null);
        abortRef.current = null;
      }
    },
    [strengthValue, weaknessValue, ticker, showSnack]
  );

  const handleAccordionChange = useCallback(
    (which: "strengths" | "weakness") =>
      (event: React.SyntheticEvent) => {
        const fromExpander = (event.target as HTMLElement)?.closest('[data-expander="true"]');
        if (!fromExpander) return;
        if (which === "strengths") setExpandedStrength((p) => !p);
        else setExpandedWeakness((p) => !p);
      },
    []
  );

  const handleEditClick = useCallback((which: "strengths" | "weakness") => {
    if (which === "strengths") {
      setExpandedStrength(true);
      setEditStrength(true);
    } else {
      setExpandedWeakness(true);
      setEditWeakness(true);
    }
  }, []);

  // Caret-preserving change handlers (belt-and-suspenders fix)
  const handleStrengthChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const el = e.target as HTMLTextAreaElement;
      const pos = el.selectionStart ?? e.target.value.length;
      setStrengthValue(e.target.value);
      queueMicrotask(() => {
        try {
          el.setSelectionRange(pos, pos);
        } catch {}
      });
    },
    []
  );

  const handleWeaknessChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const el = e.target as HTMLTextAreaElement;
      const pos = el.selectionStart ?? e.target.value.length;
      setWeaknessValue(e.target.value);
      queueMicrotask(() => {
        try {
          el.setSelectionRange(pos, pos);
        } catch {}
      });
    },
    []
  );

  // Memoized bullets to avoid recomputing
  const strengthBullets = useMemo(() => toBulletItems(selectedData.strengths), [selectedData.strengths]);
  const weaknessBullets = useMemo(() => toBulletItems(selectedData.weakness), [selectedData.weakness]);

  // Stop layout re-animation while editing
  const MotionBox = motion(Box);
  const SaveOrSpinner = ({ active }: { active: boolean }) =>
    active ? <CircularProgress size={18} sx={{ ml: 0.5 }} /> : <SaveIcon />;

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Grid container spacing={4}>
        {/* Strengths */}
        {selectedData.strengths !== undefined && (
          <Grid item xs={12} md={6}>
            <MotionBox initial={false} animate={{ opacity: 1, scale: 1, y: 0 }}>
              <Accordion
                expanded={isStrengthExpanded}
                onChange={handleAccordionChange("strengths")}
                TransitionProps={{ unmountOnExit: false, timeout: editStrength ? 0 : 200 }}
                sx={{
                  borderRadius: 3,
                  background: "linear-gradient(#f0f5ff)",
                  boxShadow: "0 8px 20px rgba(0,0,0,0.08)",
                  "& .MuiAccordionSummary-root": { minHeight: 56 },
                  "& .MuiAccordionSummary-content": { my: 0 },
                }}
              >
                <AccordionSummary
                  expandIcon={
                    <IconButton data-expander="true" size="small" sx={{ color: "#002060" }} aria-label="expand strengths">
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
                  <Typography variant="h6" align="center" sx={{ color: "#026269", fontWeight: "bold", flex: 1 }}>
                    Strengths
                  </Typography>
                  <IconButton
                    onClick={(e) => {
                      e.stopPropagation();
                      if (editStrength) handleSave("strengths");
                      else handleEditClick("strengths");
                    }}
                    sx={{ color: "#002060" }}
                    disabled={savingField === "strengths"}
                    aria-busy={savingField === "strengths"}
                    aria-label={editStrength ? "save strengths" : "edit strengths"}
                  >
                    {editStrength ? <SaveOrSpinner active={savingField === "strengths"} /> : <EditIcon />}
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
                      onChange={handleStrengthChange}
                      placeholder={"Enter points on new lines, or separate with ';'."}
                    />
                  ) : (
                    <Box component="ul" sx={{ pl: 3, m: 0 }}>
                      {strengthBullets.map((item, i) => (
                        <li key={i}>
                          <Typography variant="body1" sx={{ color: "#333", lineHeight: 1.7 }}>
                            {item}
                          </Typography>
                        </li>
                      ))}
                    </Box>
                  )}
                </AccordionDetails>
              </Accordion>
            </MotionBox>
          </Grid>
        )}

        {/* Concerns / Weakness */}
        {selectedData.weakness !== undefined && (
          <Grid item xs={12} md={6}>
            <MotionBox initial={false} animate={{ opacity: 1, scale: 1, y: 0 }}>
              <Accordion
                expanded={isWeaknessExpanded}
                onChange={handleAccordionChange("weakness")}
                TransitionProps={{ unmountOnExit: false, timeout: editWeakness ? 0 : 200 }}
                sx={{
                  borderRadius: 3,
                  background: "linear-gradient(#f0f5ff)",
                  boxShadow: "0 8px 20px rgba(0,0,0,0.08)",
                  "& .MuiAccordionSummary-root": { minHeight: 56 },
                  "& .MuiAccordionSummary-content": { my: 0 },
                }}
              >
                <AccordionSummary
                  expandIcon={
                    <IconButton data-expander="true" size="small" sx={{ color: "#002060" }} aria-label="expand concerns">
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
                  <Typography variant="h6" align="center" sx={{ color: "#026269", fontWeight: "bold", flex: 1 }}>
                    Concerns
                  </Typography>
                  <IconButton
                    onClick={(e) => {
                      e.stopPropagation();
                      if (editWeakness) handleSave("weakness");
                      else handleEditClick("weakness");
                    }}
                    sx={{ color: "#002060" }}
                    disabled={savingField === "weakness"}
                    aria-busy={savingField === "weakness"}
                    aria-label={editWeakness ? "save concerns" : "edit concerns"}
                  >
                    {editWeakness ? <SaveOrSpinner active={savingField === "weakness"} /> : <EditIcon />}
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
                      onChange={handleWeaknessChange}
                      placeholder={"Enter points on new lines, or separate with ';'."}
                    />
                  ) : (
                    <Box component="ul" sx={{ pl: 3, m: 0 }}>
                      {weaknessBullets.map((item, i) => (
                        <li key={i}>
                          <Typography variant="body1" sx={{ color: "#333", lineHeight: 1.7 }}>
                            {item}
                          </Typography>
                        </li>
                      ))}
                    </Box>
                  )}
                </AccordionDetails>
              </Accordion>
            </MotionBox>
          </Grid>
        )}
      </Grid>

      <Snackbar
        open={snackOpen}
        autoHideDuration={3500}
        onClose={() => setSnackOpen(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert onClose={() => setSnackOpen(false)} severity={snackSeverity} sx={{ width: "100%" }}>
          {snackMsg}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default React.memo(FOStrengthWriteUp);
