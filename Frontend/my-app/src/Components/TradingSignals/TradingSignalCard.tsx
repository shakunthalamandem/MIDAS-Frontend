import React, { useEffect, useState, useCallback } from "react";
import {
  Box,
  Typography,
  Chip,
  Divider,
  IconButton,
  CircularProgress,
  Tooltip,
  Button,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import AutoGraphIcon from "@mui/icons-material/AutoGraph";
import RefreshIcon from "@mui/icons-material/Refresh";
import ScheduleIcon from "@mui/icons-material/Schedule";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import RemoveIcon from "@mui/icons-material/Remove";
import FiberManualRecordIcon from "@mui/icons-material/FiberManualRecord";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";

import type { TradingSignalData } from "./types";

/* ---------- color helpers ---------- */

function getSignalColors(signal: string) {
  switch (signal) {
    case "BUY":
      return {
        bg: "#ECFDF5", text: "#065F46", border: "#10B981",
        bar: "#10B981", chipBg: "#D1FAE5", badgeBg: "#059669",
      };
    case "SELL":
      return {
        bg: "#FEF2F2", text: "#991B1B", border: "#EF4444",
        bar: "#EF4444", chipBg: "#FEE2E2", badgeBg: "#DC2626",
      };
    case "HOLD":
    default:
      return {
        bg: "#FFFBEB", text: "#92400E", border: "#F59E0B",
        bar: "#F59E0B", chipBg: "#FEF3C7", badgeBg: "#D97706",
      };
  }
}

function getSignalIcon(signal: string) {
  switch (signal) {
    case "BUY":
      return <TrendingUpIcon sx={{ fontSize: 22, color: "#FFFFFF" }} />;
    case "SELL":
      return <TrendingDownIcon sx={{ fontSize: 22, color: "#FFFFFF" }} />;
    default:
      return <RemoveIcon sx={{ fontSize: 22, color: "#FFFFFF" }} />;
  }
}

function formatDate(isoString: string | null): string {
  if (!isoString) return "-";
  try {
    const d = new Date(isoString);
    return new Intl.DateTimeFormat("en-US", {
      month: "short", day: "2-digit", year: "numeric",
      hour: "2-digit", minute: "2-digit",
    }).format(d);
  } catch {
    return isoString;
  }
}

/* ---------- main component ---------- */

interface Props {
  ticker: string;
  onSignalLoaded?: (data: TradingSignalData | null) => void;
}

const TradingSignalCard: React.FC<Props> = ({ ticker, onSignalLoaded }) => {
  const [signal, setSignal] = useState<TradingSignalData | null>(null);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);

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
        setSignal(null);
        onSignalLoaded?.(null);
        return;
      }

      if (!res.ok) {
        throw new Error(`Failed to fetch signal (status ${res.status})`);
      }

      const data: TradingSignalData = await res.json();
      setSignal(data);
      onSignalLoaded?.(data);
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
      onSignalLoaded?.(data);
    } catch (err: any) {
      setError(err.message || "Failed to generate signal");
    } finally {
      setGenerating(false);
    }
  };

  const handleRefreshClick = () => setConfirmOpen(true);
  const handleConfirmRefresh = () => { setConfirmOpen(false); generateSignal(); };
  const handleCancelRefresh = () => setConfirmOpen(false);

  const colors = signal ? getSignalColors(signal.signal) : getSignalColors("HOLD");

  /* Card wrapper */
  const CardShell: React.FC<{ children: React.ReactNode; accentColor?: string }> = ({
    children, accentColor,
  }) => (
    <Box
      sx={{
        borderRadius: 2, bgcolor: "#FFFFFF",
        border: "1px solid #E2E8F0", position: "relative", overflow: "hidden",
      }}
    >
      {accentColor && (
        <Box
          sx={{
            position: "absolute", top: 0, left: 0,
            width: 3, height: "100%", bgcolor: accentColor,
          }}
        />
      )}
      {children}
    </Box>
  );

  // Loading state
  if (loading) {
    return (
      <CardShell>
        <Box sx={{ p: 4, display: "flex", justifyContent: "center", alignItems: "center", minHeight: 160 }}>
          <CircularProgress size={32} sx={{ color: "#64748B" }} />
        </Box>
      </CardShell>
    );
  }

  // No signal — show generate button
  if (!signal && !generating) {
    return (
      <CardShell accentColor="#6366F1">
        <Box sx={{ p: 2.5 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
            <AutoGraphIcon sx={{ fontSize: 20, color: "#6366F1" }} />
            <Typography sx={{ fontWeight: 800, fontSize: 14, color: "#0F172A" }}>
              AI Trading Signal
            </Typography>
          </Box>
          <Divider sx={{ mb: 2.5, borderColor: "#F1F5F9" }} />
          <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", py: 3, gap: 1.5 }}>
            <Typography sx={{ color: "#64748B", fontWeight: 600, fontSize: 13, textAlign: "center" }}>
              No trading signal generated for {ticker} yet.
            </Typography>
            <Button
              variant="contained"
              startIcon={<AutoGraphIcon sx={{ fontSize: 16 }} />}
              onClick={generateSignal}
              sx={{
                bgcolor: "#1E293B", fontWeight: 700, borderRadius: 1.5,
                px: 3, py: 0.8, fontSize: 13, textTransform: "none",
                boxShadow: "none", "&:hover": { bgcolor: "#334155", boxShadow: "none" },
              }}
            >
              Generate Signal
            </Button>
            {error && (
              <Typography sx={{ color: "#EF4444", fontWeight: 600, fontSize: 12, mt: 0.5 }}>
                {error}
              </Typography>
            )}
          </Box>
        </Box>
      </CardShell>
    );
  }

  // Generating state
  if (generating) {
    return (
      <CardShell accentColor="#6366F1">
        <Box sx={{ p: 2.5 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
            <AutoGraphIcon sx={{ fontSize: 20, color: "#6366F1" }} />
            <Typography sx={{ fontWeight: 800, fontSize: 14, color: "#0F172A" }}>
              AI Trading Signal
            </Typography>
          </Box>
          <Divider sx={{ mb: 2.5, borderColor: "#F1F5F9" }} />
          <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", py: 4, gap: 1.5 }}>
            <CircularProgress size={36} sx={{ color: "#1E293B" }} />
            <Typography sx={{ color: "#334155", fontWeight: 700, fontSize: 13 }}>
              Analyzing market data, searching live news, generating signal...
            </Typography>
            <Typography sx={{ color: "#94A3B8", fontWeight: 500, fontSize: 12 }}>
              This may take up to 2-3 minutes (web search + AI analysis)
            </Typography>
          </Box>
        </Box>
      </CardShell>
    );
  }

  // Signal display
  return (
    <>
      <CardShell accentColor={colors.border}>
        <Box sx={{ p: 2.5 }}>
          {/* Header row */}
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1.5 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <AutoGraphIcon sx={{ fontSize: 20, color: colors.border }} />
              <Typography sx={{ fontWeight: 800, fontSize: 14, color: "#0F172A" }}>
                AI Trading Signal
              </Typography>
              {/* Deal type badge */}
              {signal!.deal_type && (
                <Chip
                  label={signal!.deal_type}
                  size="small"
                  sx={{
                    bgcolor: signal!.deal_type === "IPO" ? "#EEF2FF" : "#FDF2F8",
                    color: signal!.deal_type === "IPO" ? "#4338CA" : "#BE185D",
                    fontWeight: 800, fontSize: 10, height: 20,
                    letterSpacing: 0.5,
                  }}
                />
              )}
              {/* Days since listing */}
              {signal!.days_since_listing > 0 && (
                <Chip
                  label={`Day ${signal!.days_since_listing}`}
                  size="small"
                  sx={{
                    bgcolor: "#F1F5F9", color: "#64748B",
                    fontWeight: 700, fontSize: 10, height: 20,
                  }}
                />
              )}
            </Box>

            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                <ScheduleIcon sx={{ fontSize: 13, color: "#94A3B8" }} />
                <Typography sx={{ color: "#034880", fontWeight: 600, fontSize: 11, whiteSpace: "nowrap" }}>
                  {formatDate(signal!.generated_at)}
                </Typography>
              </Box>
              <Tooltip title="Regenerate signal">
                <IconButton
                  onClick={handleRefreshClick}
                  disabled={generating}
                  size="small"
                  sx={{
                    width: 28, height: 28, bgcolor: "#F8FAFC",
                    border: "1px solid #E2E8F0",
                    "&:hover": { bgcolor: "#F1F5F9" },
                  }}
                >
                  <RefreshIcon sx={{ fontSize: 15, color: "#06326e" }} />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>

          <Divider sx={{ mb: 2, borderColor: "#F1F5F9" }} />

          {/* Signal badge + insight row */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 2.5, mb: 2 }}>
            <Box
              sx={{
                px: 3, py: 1.5, borderRadius: 2.5, bgcolor: colors.badgeBg,
                display: "flex", alignItems: "center", gap: 1.5, flexShrink: 0,
                boxShadow: `0 4px 14px ${colors.badgeBg}66`,
              }}
            >
              {getSignalIcon(signal!.signal)}
              <Typography
                sx={{ color: "#FFFFFF", fontWeight: 900, fontSize: 22, letterSpacing: 1.5 }}
              >
                {signal!.signal}
              </Typography>
            </Box>

            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography
                sx={{ color: "#062d64", fontWeight: 500, fontSize: 14, lineHeight: 1.5, fontStyle: "italic" }}
              >
                {signal!.insight}
              </Typography>
            </Box>
          </Box>

          {/* Reasoning bullets */}
          {signal!.reasoning && signal!.reasoning.length > 0 && (
            <Box
              sx={{
                bgcolor: "#F8FAFC", borderRadius: 1.5, p: 2, mb: 1.5,
                border: "1px solid #F1F5F9",
              }}
            >
              <Typography sx={{ fontWeight: 800, fontSize: 12, mb: 1.5, color: "#0F172A", letterSpacing: 0.3 }}>
                Key Reasoning
              </Typography>
              <Grid container spacing={1}>
                {signal!.reasoning.map((bullet, idx) => (
                  <Grid item xs={12} md={6} key={idx}>
                    <Box sx={{ display: "flex", alignItems: "flex-start", gap: 0.75 }}>
                      <FiberManualRecordIcon
                        sx={{ fontSize: 6, mt: 0.8, color: colors.border, flexShrink: 0 }}
                      />
                      <Typography
                        sx={{ color: "#000000", fontWeight: 500, fontSize: 14, lineHeight: 1.55 }}
                      >
                        {bullet}
                      </Typography>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}

          {error && (
            <Typography sx={{ color: "#EF4444", fontWeight: 600, fontSize: 12, mt: 1 }}>
              {error}
            </Typography>
          )}
        </Box>
      </CardShell>

      {/* Confirmation Dialog */}
      <Dialog
        open={confirmOpen}
        onClose={handleCancelRefresh}
        PaperProps={{
          sx: { borderRadius: 2, minWidth: 380, maxWidth: 440, boxShadow: "0 20px 60px rgba(0,0,0,0.15)" },
        }}
      >
        <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1.5, pb: 1, pt: 2.5, px: 3 }}>
          <WarningAmberIcon sx={{ fontSize: 22, color: "#F59E0B" }} />
          <Typography sx={{ fontWeight: 800, fontSize: 16, color: "#0F172A" }}>
            Regenerate Signal?
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ px: 3, pt: 0.5, pb: 1 }}>
          <Typography sx={{ color: "#000000", fontSize: 13, fontWeight: 500, lineHeight: 1.6 }}>
            This will generate a new AI trading signal for <strong>{ticker}</strong>, replacing the current one.
            This includes live web search and may take 2-3 minutes.
          </Typography>
          {signal?.generated_at && (
            <Box
              sx={{
                display: "flex", alignItems: "center", gap: 0.75,
                mt: 1.5, p: 1.25, bgcolor: "#F8FAFC",
                borderRadius: 1.5, border: "1px solid #E2E8F0",
              }}
            >
              <ScheduleIcon sx={{ fontSize: 15, color: "#000000" }} />
              <Typography sx={{ fontSize: 12, fontWeight: 600, color: "#000000" }}>
                Last generated: {formatDate(signal.generated_at)}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5, pt: 1, gap: 1 }}>
          <Button
            onClick={handleCancelRefresh}
            sx={{
              color: "#000000", fontWeight: 700, fontSize: 13,
              textTransform: "none", borderRadius: 1.5, px: 2.5,
              "&:hover": { bgcolor: "#F1F5F9" },
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirmRefresh}
            variant="contained"
            sx={{
              bgcolor: "#1E293B", fontWeight: 700, fontSize: 13,
              textTransform: "none", borderRadius: 1.5, px: 2.5,
              boxShadow: "none", "&:hover": { bgcolor: "#000000", boxShadow: "none" },
            }}
          >
            Regenerate
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default TradingSignalCard;
