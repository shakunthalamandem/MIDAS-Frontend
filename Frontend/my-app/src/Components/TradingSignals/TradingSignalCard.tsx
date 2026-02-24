import React, { useEffect, useState, useCallback } from "react";
import {
  Box,
  Typography,
  Chip,
  Divider,
  LinearProgress,
  IconButton,
  CircularProgress,
  Tooltip,
  Button,
  Grid,
} from "@mui/material";
import AutoGraphIcon from "@mui/icons-material/AutoGraph";
import RefreshIcon from "@mui/icons-material/Refresh";
import ScheduleIcon from "@mui/icons-material/Schedule";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import RemoveIcon from "@mui/icons-material/Remove";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import FiberManualRecordIcon from "@mui/icons-material/FiberManualRecord";

import type { TradingSignalData } from "./types";

/* ---------- color helpers ---------- */

function getSignalColors(signal: string) {
  switch (signal) {
    case "BUY":
      return {
        bg: "#DCFCE7",
        text: "#166534",
        border: "#22C55E",
        bar: "#22C55E",
        gradient: "linear-gradient(135deg, #22C55E, #16A34A, #15803D)",
        accent: "linear-gradient(90deg, #22C55E, #4ADE80, #86EFAC)",
      };
    case "SELL":
      return {
        bg: "#FEE2E2",
        text: "#991B1B",
        border: "#EF4444",
        bar: "#EF4444",
        gradient: "linear-gradient(135deg, #EF4444, #DC2626, #B91C1C)",
        accent: "linear-gradient(90deg, #EF4444, #F87171, #FCA5A5)",
      };
    case "HOLD":
    default:
      return {
        bg: "#FEF3C7",
        text: "#92400E",
        border: "#F59E0B",
        bar: "#F59E0B",
        gradient: "linear-gradient(135deg, #F59E0B, #D97706, #B45309)",
        accent: "linear-gradient(90deg, #F59E0B, #FBBF24, #FCD34D)",
      };
  }
}

function getSignalIcon(signal: string) {
  switch (signal) {
    case "BUY":
      return <TrendingUpIcon sx={{ fontSize: 32, color: "#FFFFFF" }} />;
    case "SELL":
      return <TrendingDownIcon sx={{ fontSize: 32, color: "#FFFFFF" }} />;
    default:
      return <RemoveIcon sx={{ fontSize: 32, color: "#FFFFFF" }} />;
  }
}

function formatDate(isoString: string | null): string {
  if (!isoString) return "-";
  try {
    const d = new Date(isoString);
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(d);
  } catch {
    return isoString;
  }
}

/* ---------- main component ---------- */

interface Props {
  ticker: string;
}

const TradingSignalCard: React.FC<Props> = ({ ticker }) => {
  const [signal, setSignal] = useState<TradingSignalData | null>(null);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const apiUrl = process.env.REACT_APP_API_URL;
  const token = localStorage.getItem("access_token");

  const headers = {
    "Content-Type": "application/json",
    Authorization: token ? `Bearer ${token}` : "",
  };

  // Fetch existing signal on mount
  const fetchSignal = useCallback(async () => {
    if (!ticker || !apiUrl) return;
    try {
      setLoading(true);
      setError(null);

      const res = await fetch(`${apiUrl}/api/get_trading_signal/`, {
        method: "POST",
        headers,
        body: JSON.stringify({ ticker }),
      });

      if (res.status === 404) {
        // No signal yet — that's fine
        setSignal(null);
        return;
      }

      if (!res.ok) {
        throw new Error(`Failed to fetch signal (status ${res.status})`);
      }

      const data: TradingSignalData = await res.json();
      setSignal(data);
    } catch (err: any) {
      setError(err.message || "Failed to fetch signal");
    } finally {
      setLoading(false);
    }
  }, [ticker, apiUrl]);

  useEffect(() => {
    fetchSignal();
  }, [fetchSignal]);

  // Generate (or regenerate) signal
  const generateSignal = async () => {
    if (!ticker || !apiUrl) return;
    try {
      setGenerating(true);
      setError(null);

      const res = await fetch(`${apiUrl}/api/generate_trading_signal/`, {
        method: "POST",
        headers,
        body: JSON.stringify({ ticker }),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => null);
        throw new Error(errJson?.error || `Generation failed (status ${res.status})`);
      }

      const data: TradingSignalData = await res.json();
      setSignal(data);
    } catch (err: any) {
      setError(err.message || "Failed to generate signal");
    } finally {
      setGenerating(false);
    }
  };

  const colors = signal ? getSignalColors(signal.signal) : getSignalColors("HOLD");

  // ── Loading state ──
  if (loading) {
    return (
      <Box
        sx={{
          borderRadius: 4,
          bgcolor: "#FFFFFF",
          border: "1px solid #EEF2F7",
          boxShadow: "0 10px 24px rgba(16, 24, 40, 0.08)",
          p: 4,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: 200,
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  // ── No signal yet — show generate button ──
  if (!signal && !generating) {
    return (
      <Box
        sx={{
          borderRadius: 4,
          bgcolor: "#FFFFFF",
          border: "1px solid #EEF2F7",
          backgroundImage:
            "linear-gradient(180deg, rgba(99,102,241,0.06), rgba(255,255,255,0))",
          boxShadow: "0 10px 24px rgba(16, 24, 40, 0.08)",
          p: 3,
          position: "relative",
          overflow: "hidden",
        }}
      >
        <Box
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 4,
            background: "linear-gradient(90deg, #6366F1, #8B5CF6, #A78BFA)",
          }}
        />

        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2 }}>
          <AutoGraphIcon sx={{ fontSize: 28, color: "#6366F1" }} />
          <Typography variant="h6" sx={{ fontWeight: 900, color: "#1E1B4B" }}>
            AI Trading Signal
          </Typography>
        </Box>

        <Divider sx={{ mb: 3, borderColor: "#EEF2F7" }} />

        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            py: 3,
            gap: 2,
          }}
        >
          <Typography
            variant="body1"
            sx={{ color: "#6B7280", fontWeight: 600, textAlign: "center" }}
          >
            No trading signal has been generated for {ticker} yet.
          </Typography>
          <Button
            variant="contained"
            startIcon={<AutoGraphIcon />}
            onClick={generateSignal}
            sx={{
              bgcolor: "#6366F1",
              fontWeight: 800,
              borderRadius: 999,
              px: 4,
              py: 1.2,
              textTransform: "none",
              "&:hover": { bgcolor: "#4F46E5" },
            }}
          >
            Generate Trading Signal
          </Button>
          {error && (
            <Typography variant="caption" sx={{ color: "#EF4444", fontWeight: 600 }}>
              {error}
            </Typography>
          )}
        </Box>
      </Box>
    );
  }

  // ── Generating state ──
  if (generating) {
    return (
      <Box
        sx={{
          borderRadius: 4,
          bgcolor: "#FFFFFF",
          border: "1px solid #EEF2F7",
          backgroundImage:
            "linear-gradient(180deg, rgba(99,102,241,0.06), rgba(255,255,255,0))",
          boxShadow: "0 10px 24px rgba(16, 24, 40, 0.08)",
          p: 3,
          position: "relative",
          overflow: "hidden",
        }}
      >
        <Box
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 4,
            background: "linear-gradient(90deg, #6366F1, #8B5CF6, #A78BFA)",
          }}
        />

        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            py: 5,
            gap: 2,
          }}
        >
          <CircularProgress size={48} sx={{ color: "#6366F1" }} />
          <Typography
            variant="body1"
            sx={{ color: "#374151", fontWeight: 700, textAlign: "center" }}
          >
            Analyzing market signals, sentiment, news & price action...
          </Typography>
          <Typography
            variant="caption"
            sx={{ color: "#9CA3AF", fontWeight: 500 }}
          >
            Claude is generating your trading signal
          </Typography>
        </Box>
      </Box>
    );
  }

  // ── Signal display ──
  return (
    <Box
      sx={{
        borderRadius: 4,
        bgcolor: "#FFFFFF",
        border: "1px solid #EEF2F7",
        boxShadow: "0 10px 24px rgba(16, 24, 40, 0.08)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Top accent bar */}
      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 4,
          background: colors.accent,
        }}
      />

      <Box sx={{ p: 3 }}>
        {/* Header row */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            mb: 2,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <AutoGraphIcon sx={{ fontSize: 28, color: colors.border }} />
            <Typography variant="h6" sx={{ fontWeight: 900, color: "#1E1B4B" }}>
              AI Trading Signal
            </Typography>
          </Box>

          {/* Date + Refresh together on the right */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
              <ScheduleIcon sx={{ fontSize: 15, color: "#9CA3AF" }} />
              <Typography
                variant="caption"
                sx={{ color: "#9CA3AF", fontWeight: 600, whiteSpace: "nowrap" }}
              >
                {formatDate(signal!.generated_at)}
              </Typography>
            </Box>
            <Tooltip title="Regenerate signal">
              <IconButton
                onClick={generateSignal}
                disabled={generating}
                size="small"
                sx={{
                  bgcolor: "#F3F4F6",
                  "&:hover": { bgcolor: "#E5E7EB" },
                }}
              >
                <RefreshIcon sx={{ fontSize: 18 }} />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        <Divider sx={{ mb: 2.5, borderColor: "#EEF2F7" }} />

        {/* Signal badge + confidence */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 3,
            mb: 2.5,
            flexWrap: "wrap",
          }}
        >
          {/* Large signal badge */}
          <Box
            sx={{
              width: 80,
              height: 80,
              borderRadius: "50%",
              background: colors.gradient,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: `0 8px 20px ${colors.border}40`,
              flexShrink: 0,
            }}
          >
            {getSignalIcon(signal!.signal)}
            <Typography
              sx={{
                color: "#FFFFFF",
                fontWeight: 900,
                fontSize: 13,
                letterSpacing: 1,
                mt: -0.25,
              }}
            >
              {signal!.signal}
            </Typography>
          </Box>

          {/* Confidence + insight */}
          <Box sx={{ flex: 1, minWidth: 200 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1 }}>
              <Typography
                variant="body2"
                sx={{ fontWeight: 800, color: "#374151" }}
              >
                Confidence
              </Typography>
              <Typography
                sx={{
                  fontWeight: 900,
                  fontSize: 20,
                  color: colors.text,
                }}
              >
                {signal!.confidence}%
              </Typography>
            </Box>

            <LinearProgress
              variant="determinate"
              value={signal!.confidence}
              sx={{
                height: 10,
                borderRadius: 999,
                bgcolor: "#E5E7EB",
                mb: 1.5,
                "& .MuiLinearProgress-bar": {
                  borderRadius: 999,
                  backgroundColor: colors.bar,
                },
              }}
            />

            <Typography
              variant="body2"
              sx={{
                color: "#374151",
                fontWeight: 600,
                lineHeight: 1.5,
                fontStyle: "italic",
              }}
            >
              {signal!.insight}
            </Typography>
          </Box>
        </Box>

        {/* Reasoning bullets — 2 per row */}
        {signal!.reasoning && signal!.reasoning.length > 0 && (
          <Box
            sx={{
              bgcolor: "#F9FAFB",
              borderRadius: 3,
              p: 2,
              mb: 2,
              border: "1px solid #F3F4F6",
            }}
          >
            <Typography
              variant="subtitle2"
              sx={{ fontWeight: 900, mb: 1.5, color: "#111827" }}
            >
              Key Reasoning
            </Typography>
            <Grid container spacing={1.5}>
              {signal!.reasoning.map((bullet, idx) => (
                <Grid item xs={12} md={6} key={idx}>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 1,
                    }}
                  >
                    <FiberManualRecordIcon
                      sx={{
                        fontSize: 8,
                        mt: 0.75,
                        color: colors.border,
                        flexShrink: 0,
                      }}
                    />
                    <Typography
                      variant="body2"
                      sx={{ color: "#374151", fontWeight: 500, lineHeight: 1.55 }}
                    >
                      {bullet}
                    </Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Box>
        )}

        {/* Footer: signal date chip */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-end",
          }}
        >
          <Chip
            icon={<CheckCircleOutlineIcon sx={{ fontSize: 14 }} />}
            label={`Signal for ${signal!.signal_date}`}
            size="small"
            sx={{
              bgcolor: colors.bg,
              color: colors.text,
              fontWeight: 700,
              fontSize: 11,
              height: 24,
            }}
          />
        </Box>

        {/* Error display */}
        {error && (
          <Typography
            variant="caption"
            sx={{ color: "#EF4444", fontWeight: 600, mt: 1, display: "block" }}
          >
            {error}
          </Typography>
        )}
      </Box>
    </Box>
  );
};

export default TradingSignalCard;
