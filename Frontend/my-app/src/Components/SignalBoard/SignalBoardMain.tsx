import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Chip,
  CircularProgress,
  Alert,
  IconButton,
  Collapse,
  Tooltip,
} from "@mui/material";
import { motion } from "framer-motion";
import {
  InputAdornment,
  TextField,
} from "@mui/material";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import ShowChartIcon from "@mui/icons-material/ShowChart";
import RemoveIcon from "@mui/icons-material/Remove";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import BookmarkBorderIcon from "@mui/icons-material/BookmarkBorder";
import BookmarkIcon from "@mui/icons-material/Bookmark";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import FiberManualRecordIcon from "@mui/icons-material/FiberManualRecord";
import SearchIcon from "@mui/icons-material/Search";

import type { SignalBoardItem, SignalBoardResponse } from "./SignalBoardTypes";

const MotionBox = motion(Box);

/* ═══════════════════════════════════════════
   Constants & Helpers
   ═══════════════════════════════════════════ */

const TRADING_STATUSES = new Set(["Issued"]);

function isUpcoming(status: string | null): boolean {
  const s = (status || "").trim();
  // Only "Issued" deals go to Trading; everything else (including empty) is Upcoming
  return !TRADING_STATUSES.has(s);
}

/** Signal colors for badges */
function getSignalStyle(signal: string) {
  switch (signal) {
    case "BUY":
      return {
        bg: "#ECFDF5",
        text: "#065F46",
        border: "#10B981",
        badgeBg: "#059669",
        dotColor: "#10B981",
      };
    case "SELL":
      return {
        bg: "#FEF2F2",
        text: "#991B1B",
        border: "#EF4444",
        badgeBg: "#DC2626",
        dotColor: "#EF4444",
      };
    case "HOLD":
    default:
      return {
        bg: "#FFFBEB",
        text: "#92400E",
        border: "#F59E0B",
        badgeBg: "#D97706",
        dotColor: "#F59E0B",
      };
  }
}

function getSignalIcon(signal: string, size = 16) {
  switch (signal) {
    case "BUY":
      return <TrendingUpIcon sx={{ fontSize: size, color: "#FFFFFF" }} />;
    case "SELL":
      return <TrendingDownIcon sx={{ fontSize: size, color: "#FFFFFF" }} />;
    default:
      return <RemoveIcon sx={{ fontSize: size, color: "#FFFFFF" }} />;
  }
}

/** Map signal to display label based on upcoming vs trading */
function getSignalLabel(signal: string, upcoming: boolean): string {
  if (upcoming) {
    switch (signal) {
      case "BUY":
        return "Subscribe";
      case "SELL":
        return "Avoid";
      case "HOLD":
      default:
        return "Caution";
    }
  }
  return signal; // Trading: show raw BUY / SELL / HOLD
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "-";
  try {
    const d = new Date(dateStr);
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
    }).format(d);
  } catch {
    return dateStr;
  }
}

function formatTimestamp(isoStr: string | null): string {
  if (!isoStr) return "-";
  try {
    const d = new Date(isoStr);
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    }).format(d);
  } catch {
    return isoStr;
  }
}

/* ═══════════════════════════════════════════
   Sub-components
   ═══════════════════════════════════════════ */

/** Stat card at the top */
function StatCard({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  color: string;
}) {
  return (
    <Box
      sx={{
        flex: "1 1 200px",
        bgcolor: "#FFFFFF",
        borderRadius: 3,
        border: "1px solid #E2E8F0",
        p: 2.5,
        display: "flex",
        flexDirection: "column",
        gap: 1,
      }}
    >
      <Box
        sx={{
          width: 40,
          height: 40,
          borderRadius: 2,
          bgcolor: `${color}15`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: color,
        }}
      >
        {icon}
      </Box>
      <Typography
        sx={{ fontWeight: 600, fontSize: 12, color: "#64748B", textTransform: "uppercase", letterSpacing: 0.5 }}
      >
        {label}
      </Typography>
      <Typography sx={{ fontWeight: 900, fontSize: 28, color: "#0F172A", lineHeight: 1 }}>
        {value}
      </Typography>
    </Box>
  );
}

/** Signal badge chip */
function SignalBadge({
  signal,
  upcoming,
}: {
  signal: string;
  upcoming: boolean;
}) {
  const style = getSignalStyle(signal);
  const label = getSignalLabel(signal, upcoming);
  return (
    <Box
      sx={{
        display: "inline-flex",
        alignItems: "center",
        gap: 0.75,
        px: 1.5,
        py: 0.5,
        borderRadius: 5,
        bgcolor: style.badgeBg,
        color: "#FFFFFF",
        fontWeight: 700,
        fontSize: 12,
        whiteSpace: "nowrap",
      }}
    >
      {getSignalIcon(signal, 14)}
      {label}
      <FiberManualRecordIcon sx={{ fontSize: 8, color: "rgba(255,255,255,0.6)" }} />
    </Box>
  );
}

/** Individual deal row */
function DealRow({
  item,
  expanded,
  onToggle,
  onTickerClick,
}: {
  item: SignalBoardItem;
  expanded: boolean;
  onToggle: () => void;
  onTickerClick: () => void;
}) {
  const upcoming = isUpcoming(item.deal_status);
  const style = getSignalStyle(item.signal);

  return (
    <Box
      sx={{
        borderBottom: "1px solid #F1F5F9",
        "&:last-child": { borderBottom: "none" },
      }}
    >
      {/* Main row */}
      <Box
        onClick={onToggle}
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1.5,
          px: 2,
          py: 1.5,
          cursor: "pointer",
          transition: "background 0.15s",
          "&:hover": { bgcolor: "#F8FAFC" },
        }}
      >
        {/* Bookmark icon */}
        <BookmarkBorderIcon sx={{ fontSize: 18, color: "#CBD5E1", flexShrink: 0 }} />

        {/* Ticker + Company */}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Typography
              onClick={(e) => {
                e.stopPropagation();
                onTickerClick();
              }}
              sx={{
                fontWeight: 800,
                fontSize: 13.5,
                color: "#1E40AF",
                cursor: "pointer",
                "&:hover": { textDecoration: "underline" },
              }}
            >
              {item.ticker}
            </Typography>
            {item.deal_status && (
              <Chip
                label={item.deal_status}
                size="small"
                sx={{
                  height: 20,
                  fontSize: 10.5,
                  fontWeight: 700,
                  bgcolor: upcoming ? "#EDE9FE" : "#DBEAFE",
                  color: upcoming ? "#6D28D9" : "#1E40AF",
                  borderRadius: 1,
                }}
              />
            )}
          </Box>
          <Typography
            sx={{
              fontSize: 12,
              color: "#64748B",
              fontWeight: 500,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {item.issuer_name}
          </Typography>
        </Box>

        {/* Signal badge */}
        <SignalBadge signal={item.signal} upcoming={upcoming} />

        {/* Date */}
        <Typography
          sx={{
            fontSize: 12,
            color: "#94A3B8",
            fontWeight: 600,
            whiteSpace: "nowrap",
            minWidth: 50,
            textAlign: "right",
          }}
        >
          {formatDate(item.signal_date)}
        </Typography>

        {/* Expand icon */}
        <IconButton size="small" sx={{ p: 0.25 }}>
          {expanded ? (
            <ExpandLessIcon sx={{ fontSize: 18, color: "#94A3B8" }} />
          ) : (
            <ExpandMoreIcon sx={{ fontSize: 18, color: "#94A3B8" }} />
          )}
        </IconButton>
      </Box>

      {/* Expanded reasoning */}
      <Collapse in={expanded} timeout="auto" unmountOnExit>
        <Box
          sx={{
            px: 2,
            pb: 2,
            pt: 0.5,
            ml: 4.5,
          }}
        >
          {/* Insight */}
          {item.insight && (
            <Typography
              sx={{
                fontSize: 12.5,
                color: "#475569",
                fontWeight: 500,
                fontStyle: "italic",
                mb: 1.5,
                lineHeight: 1.6,
              }}
            >
              {item.insight}
            </Typography>
          )}

          {/* Signal Insights heading */}
          <Typography
            sx={{
              fontWeight: 800,
              fontSize: 12,
              color: style.border,
              textTransform: "uppercase",
              letterSpacing: 0.8,
              mb: 1,
            }}
          >
            Signal Insights
          </Typography>

          {/* Reasoning bullets */}
          {item.reasoning && item.reasoning.length > 0 ? (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 0.75 }}>
              {item.reasoning.map((bullet, idx) => (
                <Box
                  key={idx}
                  sx={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 0.75,
                  }}
                >
                  <FiberManualRecordIcon
                    sx={{
                      fontSize: 6,
                      mt: 0.7,
                      color: style.border,
                      flexShrink: 0,
                    }}
                  />
                  <Typography
                    sx={{
                      fontSize: 12,
                      color: "#475569",
                      fontWeight: 500,
                      lineHeight: 1.55,
                    }}
                  >
                    {bullet}
                  </Typography>
                </Box>
              ))}
            </Box>
          ) : (
            <Typography sx={{ fontSize: 12, color: "#94A3B8", fontWeight: 500 }}>
              No detailed reasoning available.
            </Typography>
          )}
        </Box>
      </Collapse>
    </Box>
  );
}

/** Section panel (Upcoming or Trading) */
function SignalSection({
  title,
  subtitle,
  items,
  accentColor,
  expandedSet,
  onToggle,
  onTickerClick,
  buySellHoldCounts,
}: {
  title: string;
  subtitle: string;
  items: SignalBoardItem[];
  accentColor: string;
  expandedSet: Set<string>;
  onToggle: (key: string) => void;
  onTickerClick: (item: SignalBoardItem) => void;
  buySellHoldCounts: { buy: number; hold: number; sell: number };
}) {
  const upcoming = title.toLowerCase().includes("upcoming");
  const [activeFilter, setActiveFilter] = React.useState<string | null>(null);

  // Label mapping for summary chips
  const chipConfigs = upcoming
    ? [
        { label: "Subscribe", signal: "BUY", count: buySellHoldCounts.buy, color: "#059669" },
        { label: "Caution", signal: "HOLD", count: buySellHoldCounts.hold, color: "#D97706" },
        { label: "Avoid", signal: "SELL", count: buySellHoldCounts.sell, color: "#DC2626" },
      ]
    : [
        { label: "BUY", signal: "BUY", count: buySellHoldCounts.buy, color: "#059669" },
        { label: "HOLD", signal: "HOLD", count: buySellHoldCounts.hold, color: "#D97706" },
        { label: "SELL", signal: "SELL", count: buySellHoldCounts.sell, color: "#DC2626" },
      ];

  const handleChipClick = (signal: string) => {
    setActiveFilter((prev) => (prev === signal ? null : signal));
  };

  const filteredItems = activeFilter
    ? items.filter((item) => item.signal === activeFilter)
    : items;

  return (
    <Box
      sx={{
        bgcolor: "#FFFFFF",
        borderRadius: 3,
        border: "1px solid #E2E8F0",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        height: "100%",
      }}
    >
      {/* Top accent */}
      <Box sx={{ height: 4, bgcolor: accentColor }} />

      {/* Section header */}
      <Box
        sx={{
          px: 2,
          pt: 2,
          pb: 1.5,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 1,
        }}
      >
        <Box>
          <Typography sx={{ fontWeight: 800, fontSize: 15, color: "#0F172A" }}>
            {title}
          </Typography>
          <Typography sx={{ fontSize: 12, color: "#94A3B8", fontWeight: 500 }}>
            {subtitle}
          </Typography>
        </Box>
        <Box sx={{ display: "flex", gap: 0.75, alignItems: "center" }}>
          {chipConfigs.map((c) => {
            const isActive = activeFilter === c.signal;
            return (
              <Chip
                key={c.label}
                label={`${c.label} ${c.count}`}
                size="small"
                onClick={() => handleChipClick(c.signal)}
                sx={{
                  height: 24,
                  fontSize: 11,
                  fontWeight: 700,
                  cursor: "pointer",
                  color: isActive ? "#FFFFFF" : c.color,
                  bgcolor: isActive ? c.color : `${c.color}12`,
                  border: `1px solid ${isActive ? c.color : `${c.color}30`}`,
                  borderRadius: 1.5,
                  transition: "all 0.2s ease",
                  "&:hover": {
                    bgcolor: isActive ? c.color : `${c.color}20`,
                  },
                }}
              />
            );
          })}
          {activeFilter && (
            <Chip
              label="Clear"
              size="small"
              onClick={() => setActiveFilter(null)}
              onDelete={() => setActiveFilter(null)}
              sx={{
                height: 24,
                fontSize: 11,
                fontWeight: 700,
                color: "#64748B",
                bgcolor: "#F1F5F9",
                border: "1px solid #E2E8F0",
                borderRadius: 1.5,
                cursor: "pointer",
                "& .MuiChip-deleteIcon": {
                  fontSize: 16,
                  color: "#94A3B8",
                  "&:hover": { color: "#64748B" },
                },
              }}
            />
          )}
        </Box>
      </Box>

      {/* Deal rows */}
      <Box sx={{ flex: 1, overflowY: "auto", maxHeight: "calc(100vh - 320px)" }}>
        {filteredItems.length > 0 ? (
          filteredItems.map((item) => {
            const key = `${item.ticker}-${item.signal_date}`;
            return (
              <DealRow
                key={key}
                item={item}
                expanded={expandedSet.has(key)}
                onToggle={() => onToggle(key)}
                onTickerClick={() => onTickerClick(item)}
              />
            );
          })
        ) : (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              py: 6,
            }}
          >
            <Typography sx={{ color: "#94A3B8", fontWeight: 600, fontSize: 13 }}>
              {activeFilter ? "No signals matching this filter" : "No signals available"}
            </Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
}

/* ═══════════════════════════════════════════
   Main Component
   ═══════════════════════════════════════════ */

const SignalBoardMain: React.FC = () => {
  const navigate = useNavigate();
  const [data, setData] = useState<SignalBoardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState("");

  const apiUrl = process.env.REACT_APP_API_URL;
  const token = localStorage.getItem("access_token");

  const fetchSignals = useCallback(async () => {
    if (!apiUrl) return;
    try {
      setLoading(true);
      setError(null);

      const res = await fetch(`${apiUrl}/api/list_trading_signals/`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
      });

      if (!res.ok) {
        throw new Error(`Failed to fetch signals (status ${res.status})`);
      }

      const json: SignalBoardResponse = await res.json();
      setData(json);
    } catch (err: any) {
      setError(err.message || "Failed to load signals");
    } finally {
      setLoading(false);
    }
  }, [apiUrl, token]);

  useEffect(() => {
    fetchSignals();
  }, [fetchSignals]);

  const toggleRow = (key: string) => {
    setExpandedRows((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  const handleTickerClick = (item: SignalBoardItem) => {
    const dealType = (item.deal_type || "").toLowerCase();

    const targetPath = dealType.includes("ipo")
      ? "/deals/new_dashboard/details"
      : "/deals/new_dashboard/fo_details";

    navigate(targetPath, {
      state: {
        payload: item,
        targetTabLabel: "Trading Dynamics",
      },
    });
  };

  // Filter by search term
  const allSignals = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return data?.signals || [];
    return (data?.signals || []).filter(
      (s) =>
        s.ticker?.toLowerCase().includes(term) ||
        s.issuer_name?.toLowerCase().includes(term)
    );
  }, [data?.signals, searchTerm]);

  // Split signals into upcoming and trading
  const upcomingSignals = allSignals.filter((s) =>
    isUpcoming(s.deal_status)
  );
  const tradingSignals = allSignals.filter(
    (s) => !isUpcoming(s.deal_status)
  );

  // Counts per section
  const upcomingCounts = {
    buy: upcomingSignals.filter((s) => s.signal === "BUY").length,
    hold: upcomingSignals.filter((s) => s.signal === "HOLD").length,
    sell: upcomingSignals.filter((s) => s.signal === "SELL").length,
  };
  const tradingCounts = {
    buy: tradingSignals.filter((s) => s.signal === "BUY").length,
    hold: tradingSignals.filter((s) => s.signal === "HOLD").length,
    sell: tradingSignals.filter((s) => s.signal === "SELL").length,
  };

  // Last updated timestamp
  const lastUpdated =
    data?.signals?.[0]?.generated_at
      ? formatTimestamp(data.signals[0].generated_at)
      : "-";

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "80vh",
        }}
      >
        <CircularProgress size={36} sx={{ color: "#6366F1" }} />
      </Box>
    );
  }

  return (
    <Box sx={{ bgcolor: "#F8FAFC", minHeight: "100vh", py: 3, px: 2 }}>
    <Box sx={{ maxWidth: 1400, mx: "auto" }}>
      {/* ── Header ── */}
      <MotionBox
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          mb: 3,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Box
            sx={{
              width: 44,
              height: 44,
              borderRadius: "50%",
              bgcolor: "#EDE9FE",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <ShowChartIcon sx={{ fontSize: 24, color: "#7C3AED" }} />
          </Box>
          <Box>
            <Typography sx={{ fontWeight: 900, fontSize: 22, color: "#0F172A" }}>
              Signal Board
            </Typography>
            <Typography sx={{ fontSize: 13, color: "#64748B", fontWeight: 500 }}>
              AI-powered trading signals for every US IPO
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          {/* Search bar */}
          <TextField
            size="small"
            placeholder="Search by ticker or company..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ fontSize: 18, color: "#94A3B8" }} />
                </InputAdornment>
              ),
            }}
            sx={{
              width: 280,
              "& .MuiOutlinedInput-root": {
                borderRadius: 2,
                bgcolor: "#FFFFFF",
                fontSize: 13,
                fontWeight: 500,
                "& fieldset": { borderColor: "#E2E8F0" },
                "&:hover fieldset": { borderColor: "#CBD5E1" },
                "&.Mui-focused fieldset": { borderColor: "#6366F1" },
              },
            }}
          />
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
            <AccessTimeIcon sx={{ fontSize: 16, color: "#94A3B8" }} />
            <Typography sx={{ fontSize: 12, color: "#94A3B8", fontWeight: 600 }}>
              Updated: {lastUpdated}
            </Typography>
          </Box>
        </Box>
      </MotionBox>

      {/* ── Error ── */}
      {error && (
        <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
          {error}
        </Alert>
      )}

      {/* ── Stats Cards ── */}
      <MotionBox
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.05 }}
        sx={{
          display: "flex",
          gap: 2,
          mb: 3,
          flexWrap: "wrap",
        }}
      >
        <StatCard
          icon={<ShowChartIcon sx={{ fontSize: 22 }} />}
          label="Upcoming IPOs"
          value={data?.upcoming_count || 0}
          color="#7C3AED"
        />
        <StatCard
          icon={<TrendingUpIcon sx={{ fontSize: 22 }} />}
          label="Trading IPOs"
          value={data?.trading_count || 0}
          color="#2563EB"
        />
        <StatCard
          icon={<RemoveIcon sx={{ fontSize: 22 }} />}
          label="Signal Changes"
          value={data?.signal_changes || 0}
          color="#F59E0B"
        />
        <StatCard
          icon={<TrendingUpIcon sx={{ fontSize: 22 }} />}
          label="Active Signals"
          value={data?.active_signals || 0}
          color="#059669"
        />
      </MotionBox>

        {/* ── Two-column layout ── */}
        <MotionBox
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          sx={{
            display: "grid",
            gap: 2.5,
            gridTemplateColumns: { xs: "1fr", lg: "1fr 1fr" },
            alignItems: "start",
          }}
        >
          {/* Left: Upcoming */}
          <SignalSection
            title="Upcoming & Priced, Yet to Trade"
            subtitle="Signals represent 1st day (T+1D) performance"
            items={upcomingSignals}
            accentColor="#F97316"
            expandedSet={expandedRows}
            onToggle={toggleRow}
            onTickerClick={handleTickerClick}
            buySellHoldCounts={upcomingCounts}
          />

          {/* Right: Trading */}
          <SignalSection
            title="Trading"
            subtitle="Signals represent 1-month hold for exceptional returns"
            items={tradingSignals}
            accentColor="#2563EB"
            expandedSet={expandedRows}
            onToggle={toggleRow}
            onTickerClick={handleTickerClick}
            buySellHoldCounts={tradingCounts}
          />
        </MotionBox>
      </Box>
    </Box>
  );
};

export default SignalBoardMain;
