import React from "react";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  IconButton,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import SendRoundedIcon from "@mui/icons-material/SendRounded";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import AutoFixHighIcon from "@mui/icons-material/AutoFixHigh";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import GENAIRenderer from "../GhcAi/AIPages/GENAIRenderer";
import { Block } from "../GhcAi/Utils/ComponentsUtils";

type S1QueryBotProps = {
  ticker?: string;
};

type S1Phase = "loading" | "not_uploaded" | "no_vectors" | "ready";

const S1QueryBot: React.FC<S1QueryBotProps> = ({ ticker }) => {
  const [phase, setPhase] = React.useState<S1Phase>("loading");
  const [question, setQuestion] = React.useState("");
  const [blocks, setBlocks] = React.useState<Block[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [s1Link, setS1Link] = React.useState<string | null>(null);
  const [generating, setGenerating] = React.useState(false);
  const [genError, setGenError] = React.useState<string | null>(null);

  const apiUrl = React.useMemo(() => process.env.REACT_APP_API_URL, []);

  const getAuthHeaders = React.useCallback(() => {
    const token = localStorage.getItem("access_token");
    return {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  }, []);

  // Reset on ticker change
  React.useEffect(() => {
    setPhase("loading");
    setBlocks([]);
    setError(null);
    setQuestion("");
    setS1Link(null);
    setGenError(null);
  }, [ticker]);

  // Fetch S1 status on mount / ticker change
  React.useEffect(() => {
    const fetchStatus = async () => {
      if (!ticker || !apiUrl) {
        setPhase("not_uploaded");
        return;
      }
      try {
        const res = await fetch(`${apiUrl}/api/s1_status/`, {
          method: "POST",
          headers: getAuthHeaders(),
          body: JSON.stringify({ ticker }),
        });
        if (!res.ok) {
          setPhase("not_uploaded");
          return;
        }
        const data = await res.json();
        setS1Link(data?.s1_document_link || null);

        if (!data.s1_uploaded) {
          setPhase("not_uploaded");
        } else if (!data.vectors_generated) {
          setPhase("no_vectors");
        } else {
          setPhase("ready");
        }
      } catch {
        setPhase("not_uploaded");
      }
    };

    fetchStatus();
  }, [apiUrl, ticker, getAuthHeaders]);

  const handleGenerate = async () => {
    if (!ticker || !apiUrl || generating) return;
    setGenerating(true);
    setGenError(null);
    try {
      const res = await fetch(`${apiUrl}/api/s1_generate_vectors/`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({ ticker }),
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData?.error || `Failed with status ${res.status}`);
      }
      setPhase("ready");
    } catch (e: any) {
      setGenError(e?.message || "Failed to generate vectors.");
    } finally {
      setGenerating(false);
    }
  };

  const toBlocks = (data: any): Block[] => {
    if (Array.isArray(data)) {
      return data as Block[];
    }
    let content = "Received response.";
    if (typeof data === "string") {
      content = data;
    } else {
      try {
        content = JSON.stringify(data, null, 2);
      } catch {
        // fallback to default
      }
    }
    return [
      {
        type: "text",
        row: 1,
        column: 1,
        total_columns: 1,
        content,
      },
    ];
  };

  const ask = async () => {
    if (!question.trim() || loading) return;
    if (!ticker) {
      setError("Ticker is missing.");
      return;
    }
    if (!apiUrl) {
      setError("API URL is not defined in environment variables.");
      return;
    }

    setLoading(true);
    setError(null);
    setBlocks([]);

    try {
      const res = await fetch(`${apiUrl}/api/s1_bot/`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          ticker,
          question: question.trim(),
        }),
      });

      if (!res.ok) {
        let detail = "";
        try {
          const errJson = await res.json();
          detail = errJson?.detail ? ` - ${errJson.detail}` : "";
        } catch {
          // ignore
        }
        throw new Error(`Request failed: ${res.status}${detail}`);
      }

      const data = await res.json();
      setBlocks(toBlocks(data));
    } catch (e: any) {
      setError(e?.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  // ── Status cards for "not_uploaded" and "no_vectors" ──
  const renderStatusCard = () => {
    if (phase === "not_uploaded") {
      return (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            py: 6,
            px: 3,
            gap: 2,
          }}
        >
          <InfoOutlinedIcon sx={{ fontSize: 56, color: "#e67e22" }} />
          <Typography variant="h6" sx={{ fontWeight: 700, textAlign: "center" }}>
            S1 Document Not Uploaded
          </Typography>
          <Typography
            variant="body1"
            color="text.secondary"
            sx={{ textAlign: "center", maxWidth: 500 }}
          >
            The S1 document has not been uploaded for{" "}
            <strong>{ticker}</strong>. Please contact the team to upload the S1
            document.
          </Typography>
        </Box>
      );
    }

    if (phase === "no_vectors") {
      return (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            py: 6,
            px: 3,
            gap: 2,
          }}
        >
          <AutoFixHighIcon sx={{ fontSize: 56, color: "#2f81c0" }} />
          <Typography variant="h6" sx={{ fontWeight: 700, textAlign: "center" }}>
            Vector Index Not Generated
          </Typography>
          <Typography
            variant="body1"
            color="text.secondary"
            sx={{ textAlign: "center", maxWidth: 500 }}
          >
            The S1 document is uploaded for <strong>{ticker}</strong>, but the
            vector index has not been generated yet. Click below to generate it.
          </Typography>

          {genError && (
            <Alert severity="error" sx={{ maxWidth: 500, width: "100%" }}>
              {genError}
            </Alert>
          )}

          <Button
            variant="contained"
            onClick={handleGenerate}
            disabled={generating}
            startIcon={
              generating ? (
                <CircularProgress size={18} color="inherit" />
              ) : (
                <AutoFixHighIcon />
              )
            }
            sx={{
              textTransform: "none",
              fontWeight: 700,
              borderRadius: 999,
              px: 4,
              py: 1.2,
              backgroundColor: "#2f81c0",
              "&:hover": { backgroundColor: "#256aa0" },
            }}
          >
            {generating ? "Generating Vectors..." : "Generate Vectors"}
          </Button>
        </Box>
      );
    }

    return null;
  };

  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        borderRadius: 3,
        border: "1px solid",
        borderColor: "divider",
        backgroundColor: "rgba(255,255,255,0.8)",
      }}
    >
      <Stack spacing={2}>
        {/* Header */}
        <Box sx={{ position: "relative", minHeight: 52 }}>
          <Box sx={{ textAlign: "center" }}>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              S1 AI Query
            </Typography>
            <Typography variant="body2" color="#000000">
              {phase === "ready"
                ? `Ask a question for ${ticker || "the selected ticker"}.`
                : `Status check for ${ticker || "the selected ticker"}.`}
            </Typography>
          </Box>
          {/* View S1 Document button */}
          {s1Link && (
            <Box
              sx={{
                position: { xs: "static", sm: "absolute" },
                right: 0,
                top: "50%",
                transform: { sm: "translateY(-50%)" },
                mt: { xs: 1, sm: 0 },
                display: "flex",
                justifyContent: { xs: "center", sm: "flex-end" },
                alignItems: "center",
                gap: 1,
              }}
            >
              <Button
                size="small"
                variant="outlined"
                href={s1Link}
                target="_blank"
                rel="noreferrer"
                sx={{
                  textTransform: "none",
                  fontWeight: 700,
                  borderRadius: 999,
                  borderColor: "rgba(47, 129, 192, 0.6)",
                  color: "#1f3b73",
                  px: 2,
                }}
              >
                View S1 Document
              </Button>
            </Box>
          )}
        </Box>

        {/* Loading state */}
        {phase === "loading" && (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              py: 6,
              gap: 1.5,
            }}
          >
            <CircularProgress size={24} />
            <Typography variant="body1" color="text.secondary">
              Checking S1 document status...
            </Typography>
          </Box>
        )}

        {/* Status cards */}
        {(phase === "not_uploaded" || phase === "no_vectors") &&
          renderStatusCard()}

        {/* Ready: show chat interface */}
        {phase === "ready" && (
          <>
            {/* Status indicator */}
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                gap: 0.5,
              }}
            >
              <CheckCircleOutlineIcon
                sx={{ fontSize: 16, color: "#27ae60" }}
              />
              <Typography variant="caption" color="#27ae60" fontWeight={600}>
                S1 Document & Vectors Ready
              </Typography>
            </Box>

            {/* Search bar */}
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                gap: 1.5,
              }}
            >
              <TextField
                fullWidth
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Search company policies, culture, benefits, careers..."
                disabled={loading}
                onKeyDown={(e) => {
                  if (e.key === "Enter") ask();
                }}
                size="medium"
                sx={{
                  maxWidth: 900,
                  bgcolor: "transparent",
                  "& .MuiOutlinedInput-root": {
                    height: 56,
                    borderRadius: 999,
                    bgcolor: "white",
                    transition:
                      "box-shadow 0.2s ease, border-color 0.2s ease",
                    boxShadow: "0 6px 20px rgba(110, 150, 220, 0.25)",
                    "& fieldset": {
                      borderColor: "rgba(120, 160, 220, 0.35)",
                    },
                    "&:hover fieldset": {
                      borderColor: "rgba(90, 140, 210, 0.6)",
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: "#4aa3ff",
                      borderWidth: 2,
                    },
                  },
                  "& .MuiOutlinedInput-input": {
                    px: 2.5,
                  },
                }}
              />
              <IconButton
                onClick={ask}
                aria-label="Send question"
                sx={{
                  bgcolor: "#8ed0ff",
                  color: "white",
                  width: 48,
                  height: 48,
                  backgroundColor: "#2f81c0ff",
                  boxShadow: "0 6px 20px rgba(110, 150, 220, 0.25)",
                  "&:hover": { bgcolor: "#2f81c0ff" },
                }}
              >
                {loading ? (
                  <CircularProgress size={18} color="inherit" />
                ) : (
                  <SendRoundedIcon fontSize="small" />
                )}
              </IconButton>
            </Box>

            {error && <Alert severity="error">{error}</Alert>}

            {blocks.length > 0 && (
              <GENAIRenderer
                blocks={blocks}
                setQuestion={setQuestion}
                handleSubmit={ask}
                renderAll
                disableMotion
              />
            )}
          </>
        )}
      </Stack>
    </Paper>
  );
};

export default S1QueryBot;
