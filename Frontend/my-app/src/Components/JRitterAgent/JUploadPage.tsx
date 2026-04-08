import React, { useState, useCallback } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  TextField,
  Typography,
} from "@mui/material";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import SaveIcon from "@mui/icons-material/Save";
import CloudUploadOutlinedIcon from "@mui/icons-material/CloudUploadOutlined";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { useNavigate } from "react-router-dom";

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
  try { parsed = JSON.parse(text); } catch (e: any) {
    return { valid: false, message: `JSON parse error: ${e.message}` };
  }
  if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed))
    return { valid: false, message: "JSON must be an object" };

  // Support both formats:
  // New: { analysis: { ticker, company, composite_score: { score, max }, key_criteria: [...] } }
  // Legacy: { ticker, ritter_scores: { composite_score, dimensions: [...] } }
  const analysis = parsed.analysis;

  if (analysis) {
    // New format
    if (!analysis.ticker) return { valid: false, message: "Missing: analysis.ticker" };
    if (!analysis.composite_score) return { valid: false, message: "Missing: analysis.composite_score" };
    if (!analysis.key_criteria || !Array.isArray(analysis.key_criteria))
      return { valid: false, message: "Missing or invalid: analysis.key_criteria (must be array)" };
    if (analysis.key_criteria.length === 0)
      return { valid: false, message: "analysis.key_criteria is empty" };
    for (let i = 0; i < analysis.key_criteria.length; i++) {
      const c = analysis.key_criteria[i];
      if (!c.name || c.score === undefined || c.max === undefined)
        return { valid: false, message: `key_criteria #${i + 1} missing required fields (name, score, max)` };
    }
    return {
      valid: true,
      message: "Valid Ritter IPO JSON",
      ticker: analysis.ticker,
      company: analysis.company || "",
      composite: analysis.composite_score.score,
      dimensionCount: analysis.key_criteria.length,
    };
  }

  // Legacy format
  if (!parsed.ticker) return { valid: false, message: "Missing required field: ticker" };
  if (!parsed.ritter_scores) return { valid: false, message: "Missing required field: ritter_scores" };
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
    message: "Valid Ritter IPO JSON (legacy)",
    ticker: parsed.ticker,
    company: parsed.company_name || "",
    composite: parsed.ritter_scores.composite_score,
    dimensionCount: parsed.ritter_scores.dimensions.length,
  };
};

const JUploadPage: React.FC = () => {
  const [jsonText, setJsonText] = useState("");
  const [ticker, setTicker] = useState("");
  const [validation, setValidation] = useState<ValidationResult>({ valid: false, message: "" });
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [saved, setSaved] = useState(false);
  const navigate = useNavigate();

  const apiUrl = process.env.REACT_APP_API_URL;
  const token = localStorage.getItem("access_token");

  const handleJsonChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    setJsonText(text);
    setSaveError("");
    setSaved(false);
    const result = validateRitterJson(text);
    setValidation(result);
    if (result.valid && result.ticker) setTicker(result.ticker);
  }, []);

  const handleSave = async () => {
    if (!validation.valid || !ticker.trim()) return;
    setSaving(true);
    setSaveError("");
    try {
      const response = await fetch(`${apiUrl}/api/jritter_agent/save/`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: token ? `Bearer ${token}` : "" },
        body: JSON.stringify({ ticker: ticker.trim().toUpperCase(), json_data: JSON.parse(jsonText) }),
      });
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || "Failed to save");
      }
      setSaved(true);
      setJsonText("");
      setTicker("");
      setValidation({ valid: false, message: "" });
    } catch (err: any) {
      setSaveError(err.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#f0f4f8" }}>
      {/* Header */}
      <Box sx={{ background: "linear-gradient(160deg,#0f2d4a 0%,#0e5a80 50%,#0891b2 100%)", pb: 5, pt: 0 }}>
        <Box sx={{ maxWidth: 860, mx: "auto", px: { xs: 2, sm: 4 } }}>
          <Box sx={{ pt: 2.5, pb: 1 }}>
            <Typography sx={{ color: "rgba(255,255,255,0.55)", fontSize: "0.65rem", letterSpacing: 2, textTransform: "uppercase", fontWeight: 600 }}>
              Academic IPO analysis applying established research frameworks
            </Typography>
          </Box>
          <Box sx={{ textAlign: "center", mt: 2, mb: 1 }}>
            <Box sx={{
              display: "inline-flex", alignItems: "center", justifyContent: "center",
              width: 56, height: 56, borderRadius: 3, mb: 2,
              background: "rgba(255,255,255,0.12)",
              border: "1px solid rgba(255,255,255,0.25)",
              backdropFilter: "blur(8px)",
            }}>
              <CloudUploadOutlinedIcon sx={{ fontSize: 28, color: "#b2ebf2" }} />
            </Box>
            <Typography sx={{ color: "#fff", fontWeight: 900, fontSize: { xs: "1.5rem", md: "2rem" }, letterSpacing: -0.5, fontFamily: "'Inter', 'Roboto', sans-serif" }}>
              Upload Scorecard JSON
            </Typography>
            <Typography sx={{ color: "rgba(255,255,255,0.65)", fontSize: "0.8rem", mt: 1, fontWeight: 400 }}>
Academic IPO analysis applying Jay Ritter's research framework. Analyzes pricing, underpricing, and long-term performance of US IPOs.            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Form */}
      <Box sx={{ maxWidth: 860, mx: "auto", px: { xs: 2, sm: 4 }, mt: -3 }}>
        <Box sx={{
          bgcolor: "#fff", borderRadius: 3,
          boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
          border: "1px solid #e2e8f0",
          p: { xs: 2.5, sm: 4 },
        }}>
          {saved && (
            <Alert
              severity="success"
              icon={<CheckCircleIcon />}
              sx={{ mb: 3, borderRadius: 2, fontWeight: 600 }}
              action={
                <Button size="small" onClick={() => navigate("/jritter_agent")} sx={{ fontWeight: 700, textTransform: "none" }}>
                  View All
                </Button>
              }
            >
              Scorecard saved successfully!
            </Alert>
          )}

          <Box sx={{ display: "flex", gap: 2, alignItems: "flex-end", mb: 2.5, flexWrap: "wrap" }}>
            <TextField
              label="Ticker Symbol"
              value={ticker}
              onChange={(e) => setTicker(e.target.value.toUpperCase())}
              size="small"
              placeholder="e.g. JAN"
              sx={{
                width: 200,
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                  fontWeight: 700,
                  fontSize: "0.9rem",
                  letterSpacing: 1,
                },
              }}
            />
            <Typography sx={{ fontSize: "0.75rem", color: "#94a3b8", mb: 0.5, fontStyle: "italic" }}>
              Auto-detected from JSON when valid
            </Typography>
          </Box>

          <TextField
            multiline
            rows={18}
            fullWidth
            value={jsonText}
            onChange={handleJsonChange}
            placeholder="Paste your Gator IPO scorecard JSON here..."
            sx={{
              mb: 2.5,
              "& .MuiOutlinedInput-root": {
                fontFamily: "'JetBrains Mono', 'Fira Code', 'Courier New', monospace",
                fontSize: "0.8rem",
                backgroundColor: "#fafbfc",
                borderRadius: 2,
                "& fieldset": { borderColor: "#e2e8f0" },
                "&:hover fieldset": { borderColor: "#0891b2" },
                "&.Mui-focused fieldset": { borderColor: "#0891b2" },
              },
            }}
          />

          {jsonText.trim() && (
            <Box sx={{ mb: 2.5 }}>
              {validation.valid ? (
                <Alert severity="success" icon={<CheckCircleOutlineIcon />} sx={{ borderRadius: 2 }}>
                  <Box>
                    <strong>{validation.message}</strong>
                    <Box sx={{ mt: 0.8, display: "flex", gap: 1, flexWrap: "wrap" }}>
                      <Chip label={`Ticker: ${validation.ticker}`} size="small" color="primary" variant="outlined" sx={{ fontWeight: 700 }} />
                      {validation.company && <Chip label={validation.company} size="small" variant="outlined" />}
                      {validation.composite !== undefined && (
                        <Chip label={`Score: ${validation.composite}/100`} size="small" color="success" variant="outlined" sx={{ fontWeight: 700 }} />
                      )}
                      <Chip label={`${validation.dimensionCount} dimensions`} size="small" variant="outlined" />
                    </Box>
                  </Box>
                </Alert>
              ) : validation.message ? (
                <Alert severity="error" icon={<ErrorOutlineIcon />} sx={{ borderRadius: 2 }}>
                  {validation.message}
                </Alert>
              ) : null}
            </Box>
          )}

          {saveError && (
            <Alert severity="error" sx={{ mb: 2.5, borderRadius: 2 }}>
              {saveError}
            </Alert>
          )}

          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 1.5 }}>
            <Button
              onClick={() => navigate("/jritter_agent")}
              sx={{ textTransform: "none", color: "#64748b", fontWeight: 600, borderRadius: 2, px: 3 }}
            >
              Back to Dashboard
            </Button>
            <Button
              variant="contained"
              startIcon={saving ? <CircularProgress size={18} color="inherit" /> : <SaveIcon />}
              onClick={handleSave}
              disabled={!validation.valid || saving || !ticker.trim()}
              sx={{
                background: "linear-gradient(135deg,#0e5a80,#0891b2)",
                fontWeight: 700,
                textTransform: "none",
                px: 4,
                py: 1.2,
                borderRadius: 2.5,
                fontSize: "0.9rem",
                boxShadow: "0 4px 14px rgba(8,145,178,0.35)",
                "&:hover": { background: "linear-gradient(135deg,#0c4a6e,#0891b2)" },
                "&.Mui-disabled": { background: "#e2e8f0", color: "#94a3b8", boxShadow: "none" },
              }}
            >
              {saving ? "Saving..." : "Save to Database"}
            </Button>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default JUploadPage;
