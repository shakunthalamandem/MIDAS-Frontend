import React, { useState, useCallback } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  TextField,
  Typography,
  Alert,
} from "@mui/material";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import SaveIcon from "@mui/icons-material/Save";
import ContentPasteIcon from "@mui/icons-material/ContentPaste";

interface PasteJsonTabProps {
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

  if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
    return { valid: false, message: "JSON must be an object, not an array or primitive" };
  }

  if (!parsed.ticker) {
    return { valid: false, message: "Missing required field: ticker" };
  }

  if (!parsed.ritter_scores) {
    return { valid: false, message: "Missing required field: ritter_scores" };
  }

  if (!parsed.ritter_scores.dimensions || !Array.isArray(parsed.ritter_scores.dimensions)) {
    return { valid: false, message: "Missing or invalid: ritter_scores.dimensions (must be array)" };
  }

  if (parsed.ritter_scores.dimensions.length === 0) {
    return { valid: false, message: "ritter_scores.dimensions is empty" };
  }

  for (let i = 0; i < parsed.ritter_scores.dimensions.length; i++) {
    const d = parsed.ritter_scores.dimensions[i];
    if (!d.id || !d.label || d.score === undefined || d.max_score === undefined) {
      return {
        valid: false,
        message: `Dimension #${i + 1} missing required fields (id, label, score, max_score)`,
      };
    }
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

const PasteJsonTab: React.FC<PasteJsonTabProps> = ({ onSaveSuccess }) => {
  const [jsonText, setJsonText] = useState("");
  const [ticker, setTicker] = useState("");
  const [validation, setValidation] = useState<ValidationResult>({
    valid: false,
    message: "",
  });
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  const handleJsonChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    setJsonText(text);
    setSaveError("");

    const result = validateRitterJson(text);
    setValidation(result);

    if (result.valid && result.ticker) {
      setTicker(result.ticker);
    }
  }, []);

  const handleSave = async () => {
    if (!validation.valid) return;
    if (!ticker.trim()) {
      setSaveError("Ticker is required");
      return;
    }

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
    } catch (err: any) {
      setSaveError(err.message || "Failed to save to database");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 900, mx: "auto" }}>
      <Card
        sx={{
          borderRadius: 3,
          boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
          overflow: "visible",
        }}
      >
        <CardContent sx={{ p: 4 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 3 }}>
            <ContentPasteIcon sx={{ color: "#005166" }} />
            <Typography variant="h6" sx={{ fontWeight: 600, color: "#1a2d4a" }}>
              Paste Ritter IPO JSON
            </Typography>
          </Box>

          <Typography variant="body2" sx={{ color: "#666", mb: 3 }}>
            Run your Ritter prompt in Claude.ai, copy the JSON response, and paste it below.
            The ticker will be auto-detected from the JSON.
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
            rows={16}
            fullWidth
            value={jsonText}
            onChange={handleJsonChange}
            placeholder='Paste your Ritter IPO JSON here...'
            sx={{
              mb: 2,
              "& .MuiOutlinedInput-root": {
                fontFamily: "monospace",
                fontSize: "0.82rem",
                backgroundColor: "#fafbfc",
              },
            }}
          />

          {/* Validation indicator */}
          {jsonText.trim() && (
            <Box sx={{ mb: 2 }}>
              {validation.valid ? (
                <Alert
                  severity="success"
                  icon={<CheckCircleOutlineIcon />}
                  sx={{ borderRadius: 2 }}
                >
                  <Box>
                    <strong>{validation.message}</strong>
                    <Box sx={{ mt: 0.5, display: "flex", gap: 1, flexWrap: "wrap" }}>
                      <Chip
                        label={`Ticker: ${validation.ticker}`}
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                      {validation.company && (
                        <Chip
                          label={validation.company}
                          size="small"
                          variant="outlined"
                        />
                      )}
                      {validation.composite !== undefined && (
                        <Chip
                          label={`Score: ${validation.composite}/100`}
                          size="small"
                          color="success"
                          variant="outlined"
                        />
                      )}
                      <Chip
                        label={`${validation.dimensionCount} dimensions`}
                        size="small"
                        variant="outlined"
                      />
                    </Box>
                  </Box>
                </Alert>
              ) : (
                validation.message && (
                  <Alert
                    severity="error"
                    icon={<ErrorOutlineIcon />}
                    sx={{ borderRadius: 2 }}
                  >
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

          <Button
            variant="contained"
            startIcon={saving ? <CircularProgress size={18} color="inherit" /> : <SaveIcon />}
            onClick={handleSave}
            disabled={!validation.valid || saving || !ticker.trim()}
            sx={{
              backgroundColor: "#005166",
              fontWeight: 600,
              textTransform: "none",
              px: 4,
              py: 1.2,
              borderRadius: 2,
              "&:hover": { backgroundColor: "#003d4d" },
              "&.Mui-disabled": { backgroundColor: "#ccc" },
            }}
          >
            {saving ? "Saving..." : "Save to Database"}
          </Button>
        </CardContent>
      </Card>
    </Box>
  );
};

export default PasteJsonTab;
