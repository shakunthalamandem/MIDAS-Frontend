import React, { useState, useCallback } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  TextField,
  Typography,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import SaveIcon from "@mui/icons-material/Save";
import ContentPasteIcon from "@mui/icons-material/ContentPaste";

interface PasteJsonDialogProps {
  open: boolean;
  onClose: () => void;
  onSaveSuccess: () => void;
}

interface ValidationResult {
  valid: boolean;
  message: string;
  ticker?: string;
  company?: string;
  composite?: number;
  dimensionCount?: number;
}

const validateRitterJson = (text: string): ValidationResult => {
  if (!text.trim()) return { valid: false, message: "" };
  let parsed: any;
  try {
    parsed = JSON.parse(text);
  } catch (e: any) {
    return { valid: false, message: `JSON parse error: ${e.message}` };
  }
  if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed))
    return { valid: false, message: "JSON must be an object" };
  if (!parsed.ticker)
    return { valid: false, message: "Missing required field: ticker" };
  if (!parsed.ritter_scores)
    return { valid: false, message: "Missing required field: ritter_scores" };
  if (!parsed.ritter_scores.dimensions || !Array.isArray(parsed.ritter_scores.dimensions))
    return { valid: false, message: "Missing or invalid: ritter_scores.dimensions" };
  if (parsed.ritter_scores.dimensions.length === 0)
    return { valid: false, message: "ritter_scores.dimensions is empty" };
  for (let i = 0; i < parsed.ritter_scores.dimensions.length; i++) {
    const d = parsed.ritter_scores.dimensions[i];
    if (!d.id || !d.label || d.score === undefined || d.max_score === undefined)
      return { valid: false, message: `Dimension #${i + 1} missing required fields` };
  }
  return {
    valid: true,
    message: "Valid Ritter IPO JSON",
    ticker: parsed.ticker,
    company: parsed.company_name || "",
    composite: parsed.ritter_scores.composite_score,
    dimensionCount: parsed.ritter_scores.dimensions.length,
  };
};

const PasteJsonDialog: React.FC<PasteJsonDialogProps> = ({ open, onClose, onSaveSuccess }) => {
  const [jsonText, setJsonText] = useState("");
  const [ticker, setTicker] = useState("");
  const [validation, setValidation] = useState<ValidationResult>({ valid: false, message: "" });
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  const handleJsonChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    setJsonText(text);
    setSaveError("");
    const result = validateRitterJson(text);
    setValidation(result);
    if (result.valid && result.ticker) setTicker(result.ticker);
  }, []);

  const handleSave = async () => {
    if (!validation.valid || !ticker.trim()) return;
    setSaving(true);
    setSaveError("");
    try {
      const apiUrl = process.env.REACT_APP_API_URL;
      const token = localStorage.getItem("access_token");
      const response = await fetch(`${apiUrl}/api/jritter_agent/save/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify({
          ticker: ticker.trim().toUpperCase(),
          json_data: JSON.parse(jsonText),
        }),
      });
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || "Failed to save");
      }
      setJsonText("");
      setTicker("");
      setValidation({ valid: false, message: "" });
      onSaveSuccess();
      onClose();
    } catch (err: any) {
      setSaveError(err.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    setJsonText("");
    setTicker("");
    setValidation({ valid: false, message: "" });
    setSaveError("");
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
      <DialogTitle
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          background: "linear-gradient(135deg, #0a1628 0%, #1a2d4a 100%)",
          color: "#fff",
          py: 2,
          px: 3,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <ContentPasteIcon />
          <Typography variant="h6" component="span" sx={{ fontWeight: 700 }}>
            Paste Ritter IPO JSON
          </Typography>
        </Box>
        <IconButton onClick={handleClose} sx={{ color: "rgba(255,255,255,0.7)" }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 3, mt: 1 }}>
        <Typography variant="body2" sx={{ color: "#666", mb: 2.5 }}>
          Run your Ritter prompt in Claude.ai, copy the JSON response, and paste it below.
        </Typography>

        <TextField
          label="Ticker Symbol"
          value={ticker}
          onChange={(e) => setTicker(e.target.value.toUpperCase())}
          size="small"
          sx={{ mb: 2, width: 200 }}
          placeholder="e.g. JAN"
        />

        <TextField
          multiline
          rows={14}
          fullWidth
          value={jsonText}
          onChange={handleJsonChange}
          placeholder="Paste your Ritter IPO JSON here..."
          sx={{
            mb: 2,
            "& .MuiOutlinedInput-root": {
              fontFamily: "monospace",
              fontSize: "0.8rem",
              backgroundColor: "#fafbfc",
            },
          }}
        />

        {jsonText.trim() && (
          <Box sx={{ mb: 2 }}>
            {validation.valid ? (
              <Alert severity="success" icon={<CheckCircleOutlineIcon />} sx={{ borderRadius: 2 }}>
                <Box>
                  <strong>{validation.message}</strong>
                  <Box sx={{ mt: 0.5, display: "flex", gap: 1, flexWrap: "wrap" }}>
                    <Chip label={`Ticker: ${validation.ticker}`} size="small" color="primary" variant="outlined" />
                    {validation.company && <Chip label={validation.company} size="small" variant="outlined" />}
                    {validation.composite !== undefined && (
                      <Chip label={`Score: ${validation.composite}/100`} size="small" color="success" variant="outlined" />
                    )}
                    <Chip label={`${validation.dimensionCount} dimensions`} size="small" variant="outlined" />
                  </Box>
                </Box>
              </Alert>
            ) : (
              validation.message && (
                <Alert severity="error" icon={<ErrorOutlineIcon />} sx={{ borderRadius: 2 }}>
                  {validation.message}
                </Alert>
              )
            )}
          </Box>
        )}

        {saveError && (
          <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
            {saveError}
          </Alert>
        )}

        <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1.5 }}>
          <Button onClick={handleClose} sx={{ textTransform: "none", color: "#666" }}>
            Cancel
          </Button>
          <Button
            variant="contained"
            startIcon={saving ? <CircularProgress size={18} color="inherit" /> : <SaveIcon />}
            onClick={handleSave}
            disabled={!validation.valid || saving || !ticker.trim()}
            sx={{
              backgroundColor: "#0e7490",
              fontWeight: 600,
              textTransform: "none",
              px: 3,
              borderRadius: 2,
              "&:hover": { backgroundColor: "#0c5f73" },
            }}
          >
            {saving ? "Saving..." : "Save to Database"}
          </Button>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default PasteJsonDialog;
