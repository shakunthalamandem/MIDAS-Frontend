import React, { useCallback, useState } from "react";
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
  blockCount?: number;
  blockTypes?: Record<string, number>;
}

/** Accept either a bare array of blocks or an object `{ blocks: [...] }` / `{ analysis: [...] }`. */
const extractBlocksArray = (parsed: any): any[] | null => {
  if (Array.isArray(parsed)) return parsed;
  if (parsed && typeof parsed === "object") {
    if (Array.isArray(parsed.blocks)) return parsed.blocks;
    if (Array.isArray(parsed.analysis)) return parsed.analysis;
    if (Array.isArray(parsed.data)) return parsed.data;
  }
  return null;
};

const parseHeadlineMeta = (headline: string): { ticker?: string; company?: string } => {
  if (!headline) return {};
  const head = headline.split("|", 1)[0].trim();
  const parts = head.split(/\s+[—\-–]\s+/);
  const ticker = parts[0]?.trim().toUpperCase();
  let company = parts[1]?.trim();
  if (company) company = company.replace(/\s*\([^)]*\)\s*$/, "").trim();
  return { ticker, company };
};

const validateGatorJson = (text: string): ValidationResult => {
  if (!text.trim()) return { valid: false, message: "" };
  let parsed: any;
  try {
    parsed = JSON.parse(text);
  } catch (e: any) {
    return { valid: false, message: `JSON parse error: ${e.message}` };
  }

  const blocks = extractBlocksArray(parsed);
  if (!blocks) {
    return {
      valid: false,
      message: "JSON must be an array of blocks (or { blocks: [...] }).",
    };
  }
  if (blocks.length === 0) {
    return { valid: false, message: "JSON array is empty." };
  }

  const validTypes = new Set(["text", "card", "table", "chart"]);
  const typeCounts: Record<string, number> = {};
  for (let i = 0; i < blocks.length; i++) {
    const b = blocks[i];
    if (!b || typeof b !== "object" || typeof b.type !== "string") {
      return { valid: false, message: `Block #${i + 1} is missing a valid 'type' field` };
    }
    if (!validTypes.has(b.type)) {
      return {
        valid: false,
        message: `Block #${i + 1} has unknown type '${b.type}' (allowed: text, card, table, chart)`,
      };
    }
    typeCounts[b.type] = (typeCounts[b.type] || 0) + 1;
    if (b.type === "table") {
      if (!Array.isArray(b.headers) || !Array.isArray(b.rows))
        return { valid: false, message: `Table block #${i + 1} missing 'headers' or 'rows'` };
    }
    if (b.type === "chart") {
      if (!b.chartType || !b.data || !Array.isArray(b.data.labels) || !Array.isArray(b.data.datasets))
        return { valid: false, message: `Chart block #${i + 1} missing 'chartType' or 'data.labels/datasets'` };
    }
  }

  const firstText = blocks.find((b: any) => b.type === "text");
  const meta = firstText ? parseHeadlineMeta(firstText.content || "") : {};

  return {
    valid: true,
    message: "Valid Gator Post-IPO JSON",
    ticker: meta.ticker,
    company: meta.company,
    blockCount: blocks.length,
    blockTypes: typeCounts,
  };
};

const GatorPostIpoUpload: React.FC = () => {
  const [jsonText, setJsonText] = useState("");
  const [ticker, setTicker] = useState("");
  const [validation, setValidation] = useState<ValidationResult>({ valid: false, message: "" });
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [saved, setSaved] = useState(false);
  const navigate = useNavigate();

  const apiUrl = process.env.REACT_APP_API_URL;
  const token = localStorage.getItem("access_token");

  const handleJsonChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const text = e.target.value;
      setJsonText(text);
      setSaveError("");
      setSaved(false);
      const result = validateGatorJson(text);
      setValidation(result);
      if (result.valid && result.ticker && !ticker) setTicker(result.ticker);
    },
    [ticker],
  );

  const handleSave = async () => {
    if (!validation.valid) return;
    setSaving(true);
    setSaveError("");
    try {
      const parsed = JSON.parse(jsonText);
      const blocks = extractBlocksArray(parsed);
      const response = await fetch(`${apiUrl}/api/gator_post_ipo/save/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify({
          ticker: ticker.trim().toUpperCase(),
          json_data: blocks,
        }),
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
      <Box
        sx={{
          background: "linear-gradient(160deg,#0f2d4a 0%,#0e5a80 50%,#0891b2 100%)",
          pb: 5,
          pt: 0,
        }}
      >
        <Box sx={{ maxWidth: 920, mx: "auto", px: { xs: 2, sm: 4 } }}>
          <Box sx={{ pt: 2.5, pb: 1 }}>
            <Typography
              sx={{
                color: "rgba(255,255,255,0.55)",
                fontSize: "0.65rem",
                letterSpacing: 2,
                textTransform: "uppercase",
                fontWeight: 600,
              }}
            >
              Post-IPO Signal Report (Ritter Framework)
            </Typography>
          </Box>
          <Box sx={{ textAlign: "center", mt: 2, mb: 1 }}>
            <Box
              sx={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                width: 56,
                height: 56,
                borderRadius: 3,
                mb: 2,
                background: "rgba(255,255,255,0.12)",
                border: "1px solid rgba(255,255,255,0.25)",
                backdropFilter: "blur(8px)",
              }}
            >
              <CloudUploadOutlinedIcon sx={{ fontSize: 28, color: "#b2ebf2" }} />
            </Box>
            <Typography
              sx={{
                color: "#fff",
                fontWeight: 900,
                fontSize: { xs: "1.5rem", md: "2rem" },
                letterSpacing: -0.5,
                fontFamily: "'Inter', 'Roboto', sans-serif",
              }}
            >
              Upload Gator Post-IPO JSON
            </Typography>
            <Typography
              sx={{
                color: "rgba(255,255,255,0.65)",
                fontSize: "0.8rem",
                mt: 1,
                fontWeight: 400,
              }}
            >
              Paste the Claude-generated array of signal blocks — text, cards, tables, charts.
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Form */}
      <Box sx={{ maxWidth: 920, mx: "auto", px: { xs: 2, sm: 4 }, mt: -3 }}>
        <Box
          sx={{
            bgcolor: "#fff",
            borderRadius: 3,
            boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
            border: "1px solid #e2e8f0",
            p: { xs: 2.5, sm: 4 },
          }}
        >
          {saved && (
            <Alert
              severity="success"
              icon={<CheckCircleIcon />}
              sx={{ mb: 3, borderRadius: 2, fontWeight: 600 }}
              action={
                <Button
                  size="small"
                  onClick={() => navigate("/gator_post_ipo")}
                  sx={{ fontWeight: 700, textTransform: "none" }}
                >
                  View All
                </Button>
              }
            >
              Gator Post-IPO scorecard saved successfully!
            </Alert>
          )}

          <Box sx={{ display: "flex", gap: 2, alignItems: "flex-end", mb: 2.5, flexWrap: "wrap" }}>
            <TextField
              label="Ticker Symbol"
              value={ticker}
              onChange={(e) => setTicker(e.target.value.toUpperCase())}
              size="small"
              placeholder="e.g. MAIR"
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
            <Typography
              sx={{ fontSize: "0.75rem", color: "#94a3b8", mb: 0.5, fontStyle: "italic" }}
            >
              Auto-detected from first text block if present.
            </Typography>
          </Box>

          <TextField
            multiline
            rows={20}
            fullWidth
            value={jsonText}
            onChange={handleJsonChange}
            placeholder={'Paste the Gator Post-IPO JSON here (array of blocks: text, card, table, chart)...'}
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
                      {validation.ticker && (
                        <Chip
                          label={`Ticker: ${validation.ticker}`}
                          size="small"
                          color="primary"
                          variant="outlined"
                          sx={{ fontWeight: 700 }}
                        />
                      )}
                      {validation.company && (
                        <Chip label={validation.company} size="small" variant="outlined" />
                      )}
                      {validation.blockCount !== undefined && (
                        <Chip
                          label={`${validation.blockCount} blocks`}
                          size="small"
                          color="success"
                          variant="outlined"
                          sx={{ fontWeight: 700 }}
                        />
                      )}
                      {validation.blockTypes &&
                        Object.entries(validation.blockTypes).map(([t, c]) => (
                          <Chip
                            key={t}
                            label={`${t}: ${c}`}
                            size="small"
                            variant="outlined"
                            sx={{ textTransform: "capitalize" }}
                          />
                        ))}
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

          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: 1.5,
            }}
          >
            <Button
              onClick={() => navigate("/gator_post_ipo")}
              sx={{
                textTransform: "none",
                color: "#64748b",
                fontWeight: 600,
                borderRadius: 2,
                px: 3,
              }}
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

export default GatorPostIpoUpload;
