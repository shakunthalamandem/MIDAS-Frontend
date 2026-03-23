import React, { useEffect, useState, useMemo } from "react";
import {
  Box,
  Chip,
  CircularProgress,
  Collapse,
  FormControl,
  IconButton,
  InputAdornment,
  MenuItem,
  Paper,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import SearchIcon from "@mui/icons-material/Search";
import axios from "axios";

// ─── Types ───────────────────────────────────────────────────────────
interface ReportSummary {
  id: number;
  report_date: string;
  total_analyzed: number;
  market_temperature?: string;
  long_count?: number;
  short_count?: number;
  avoid_count?: number;
}

interface MarketEnvironment {
  market_temperature?: string;
  rolling_90d_avg_first_day_return?: number;
  ipo_volume_vs_3yr_median?: number;
  price_revision_above_high_pct?: number;
  post_ipo_first_week_breadth?: number;
  market_commentary?: string;
}

interface PortfolioSummary {
  long_book_count?: number;
  short_book_count?: number;
  avoid_count?: number;
  sector_allocation?: Record<string, { count: number; target_pct: number }>;
}

interface Report {
  id: number;
  report_date: string;
  report_title?: string;
  total_eligible_ipos?: number;
  total_analyzed: number;
  market_environment: MarketEnvironment;
  portfolio_summary?: PortfolioSummary;
  processing_time_seconds?: number;
}

interface TickerAnalysis {
  id: number;
  ticker: string;
  issuer_name: string;
  pricing_date: string;
  days_since_ipo: number;
  sector: string;
  deal_size?: number;
  overall_signal: "LONG" | "SHORT" | "AVOID";
  confidence_score: number;
  action_summary: string;
  tier_classification?: {
    tier?: number;
    weighted_score?: number;
    book_assignment?: string;
    reasoning?: string;
  };
  am_opportunity?: {
    am_score?: number;
    current_time_window?: string;
    strategy_signal?: string;
    strategy_reasoning?: string;
    first_day_pop_pct?: number;
    short_interest_pct_float?: number;
    days_above_ipo_price?: number;
  };
  technical_signals?: {
    overall_technical_signal?: string;
    technical_reasoning?: string;
    ma_crossover_10_40?: string;
    rsi_14d?: number;
    relative_strength_vs_ipo_etf?: number;
    break_above_day1_high?: boolean;
    volume_breakout_ratio?: number;
  };
}

interface APIResponse {
  report: Report;
  ticker_analyses: TickerAnalysis[];
}

// ─── Constants ───────────────────────────────────────────────────────
const SIGNAL_CONFIG: Record<string, { bg: string; color: string; glow: string }> = {
  LONG:  { bg: "#e8f5e9", color: "#1b5e20", glow: "rgba(27,94,32,0.15)"  },
  SHORT: { bg: "#fce4ec", color: "#b71c1c", glow: "rgba(183,28,28,0.15)" },
  AVOID: { bg: "#fff8e1", color: "#e65100", glow: "rgba(230,81,0,0.15)"  },
};

const TEMP_META: Record<string, { gradient: string; badge: string; textColor: string; icon: string; label: string }> = {
  hot:  { gradient: "linear-gradient(135deg,#b71c1c,#e53935,#ff7043)", badge: "#fce4ec", textColor: "#b71c1c", icon: "🔥", label: "HOT"  },
  warm: { gradient: "linear-gradient(135deg,#e65100,#f57c00,#ffb74d)", badge: "#fff8e1", textColor: "#e65100", icon: "☀️", label: "WARM" },
  cold: { gradient: "linear-gradient(135deg,#0d47a1,#1565c0,#42a5f5)", badge: "#e3f2fd", textColor: "#0d47a1", icon: "🥶", label: "COLD" },
};

const METRIC_CARDS = [
  {
    key: "rolling_90d_avg_first_day_return" as keyof MarketEnvironment,
    label: "90d Avg First-Day Return",
    fmt: (v: number) => `${v.toFixed(1)}%`,
    gradient: "linear-gradient(135deg,#4527a0,#7c4dff)",
    icon: "📈",
  },
  {
    key: "ipo_volume_vs_3yr_median" as keyof MarketEnvironment,
    label: "Volume vs 3yr Median",
    fmt: (v: number) => `${v.toFixed(2)}×`,
    gradient: "linear-gradient(135deg,#00695c,#26a69a)",
    icon: "📊",
  },
  {
    key: "price_revision_above_high_pct" as keyof MarketEnvironment,
    label: "Priced Above Range",
    fmt: (v: number) => `${v.toFixed(0)}%`,
    gradient: "linear-gradient(135deg,#ad1457,#e91e63)",
    icon: "💹",
  },
  {
    key: "post_ipo_first_week_breadth" as keyof MarketEnvironment,
    label: "1-Week Breadth",
    fmt: (v: number) => `${v.toFixed(0)}%`,
    gradient: "linear-gradient(135deg,#e65100,#ff7043)",
    icon: "📉",
  },
];

const TECH_CONFIG: Record<string, { color: string }> = {
  bullish: { color: "#1b5e20" },
  bearish: { color: "#b71c1c" },
  neutral: { color: "#757575" },
};

type SortField    = "ticker" | "days_since_ipo" | "confidence_score" | "overall_signal";
type FilterSignal = "ALL" | "LONG" | "SHORT" | "AVOID";

// ─── Expanded Row ─────────────────────────────────────────────────────
const ExpandedRow: React.FC<{ ticker: TickerAnalysis }> = ({ ticker }) => {
  const tier = ticker.tier_classification || {};
  const am   = ticker.am_opportunity    || {};
  const tech = ticker.technical_signals || {};

  const cols = [
    {
      title: "Tier Classification",
      color: "#4527a0",
      rows: [
        { label: "Tier",          value: tier.tier != null ? `Tier ${tier.tier}` : "—" },
        { label: "Weighted Score", value: tier.weighted_score != null ? `${tier.weighted_score} / 100` : "—" },
        { label: "Book",           value: tier.book_assignment ?? "—" },
      ],
      note: tier.reasoning,
    },
    {
      title: "AM Opportunity",
      color: "#00695c",
      rows: [
        { label: "AM Score",      value: am.am_score != null ? `${am.am_score} / 5` : "—" },
        { label: "Time Window",   value: am.current_time_window ?? "—" },
        { label: "Day-1 Pop",     value: am.first_day_pop_pct != null ? `${am.first_day_pop_pct.toFixed(1)}%` : "—" },
        { label: "Short Interest", value: am.short_interest_pct_float != null ? `${am.short_interest_pct_float.toFixed(1)}%` : "—" },
      ],
      note: am.strategy_reasoning,
    },
    {
      title: "Technical Signals",
      color: "#ad1457",
      rows: [
        { label: "MA Crossover",    value: tech.ma_crossover_10_40 ?? "—" },
        { label: "RSI (14d)",       value: tech.rsi_14d != null ? tech.rsi_14d.toFixed(1) : "—" },
        { label: "vs FPX ETF",      value: tech.relative_strength_vs_ipo_etf != null ? `${tech.relative_strength_vs_ipo_etf.toFixed(1)}%` : "—" },
        { label: "Day-1 High Break", value: tech.break_above_day1_high != null ? (tech.break_above_day1_high ? "Yes ✓" : "No ✗") : "—" },
      ],
      note: tech.technical_reasoning,
    },
  ];

  return (
    <Box sx={{ px: 3, py: 2.5, bgcolor: "#f8f9ff", borderTop: "2px solid #e8e8f5" }}>
      <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 2, mb: 2 }}>
        {cols.map(col => (
          <Box key={col.title} sx={{ p: 2, bgcolor: "#fff", borderRadius: 2, border: `1px solid ${col.color}22`, boxShadow: `0 2px 8px ${col.color}11` }}>
            <Typography sx={{ fontSize: "0.68rem", fontWeight: 800, textTransform: "uppercase", color: col.color, letterSpacing: 1, mb: 1.2 }}>
              {col.title}
            </Typography>
            {col.rows.map(r => (
              <Box key={r.label} sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
                <Typography variant="caption" color="text.secondary">{r.label}</Typography>
                <Typography variant="caption" sx={{ fontWeight: 600, textTransform: "capitalize" }}>{r.value}</Typography>
              </Box>
            ))}
            {col.note && (
              <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 1, fontStyle: "italic", lineHeight: 1.5, borderTop: "1px solid #f0f0f0", pt: 1 }}>
                {col.note}
              </Typography>
            )}
          </Box>
        ))}
      </Box>
      <Box sx={{ p: 1.5, bgcolor: "#fff", borderRadius: 1.5, border: "1px solid #e0e0e0", display: "flex", gap: 1, alignItems: "flex-start" }}>
        <Typography sx={{ fontSize: "0.72rem", fontWeight: 800, color: "#481f93", whiteSpace: "nowrap" }}>ACTION:</Typography>
        <Typography sx={{ fontSize: "0.75rem", color: "#444", lineHeight: 1.6 }}>{ticker.action_summary}</Typography>
      </Box>
    </Box>
  );
};

// ─── Table Row ────────────────────────────────────────────────────────
const TickerRow: React.FC<{ ticker: TickerAnalysis; index: number }> = ({ ticker, index }) => {
  const [open, setOpen] = useState(false);
  const sig    = SIGNAL_CONFIG[ticker.overall_signal] || SIGNAL_CONFIG["AVOID"];
  const techRaw = (ticker.technical_signals?.overall_technical_signal || "").toLowerCase();
  const techCfg = TECH_CONFIG[techRaw] || { color: "#757575" };

  return (
    <>
      <TableRow
        hover
        onClick={() => setOpen(!open)}
        sx={{
          cursor: "pointer",
          bgcolor: index % 2 === 0 ? "#fff" : "#fafafa",
          "&:hover": { bgcolor: "#f3f0ff" },
          borderLeft: `3px solid ${sig.color}`,
          transition: "background 0.12s",
        }}
      >
        <TableCell sx={{ py: 1, pl: 1.5, pr: 0, width: 36 }}>
          <IconButton size="small" sx={{ p: 0.3, color: "#aaa" }}>
            {open ? <KeyboardArrowUpIcon fontSize="small" /> : <KeyboardArrowDownIcon fontSize="small" />}
          </IconButton>
        </TableCell>
        <TableCell sx={{ py: 1, fontWeight: 800, fontSize: "0.82rem", color: "#481f93" }}>{ticker.ticker}</TableCell>
        <TableCell sx={{ py: 1, fontSize: "0.8rem", maxWidth: 160 }}>
          <Tooltip title={ticker.issuer_name} placement="top-start">
            <span style={{ display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {ticker.issuer_name}
            </span>
          </Tooltip>
        </TableCell>
        <TableCell sx={{ py: 1, fontSize: "0.78rem", color: "#666" }}>{ticker.sector}</TableCell>
        <TableCell sx={{ py: 1, fontSize: "0.8rem", textAlign: "center", color: "#555" }}>{ticker.days_since_ipo}d</TableCell>
        <TableCell sx={{ py: 1, textAlign: "center" }}>
          {ticker.tier_classification?.tier
            ? <Chip label={`T${ticker.tier_classification.tier}`} size="small" sx={{ fontSize: "0.7rem", height: 20, bgcolor: "#ede7f6", color: "#4527a0", fontWeight: 700 }} />
            : <Typography sx={{ color: "#ccc", fontSize: "0.8rem" }}>—</Typography>}
        </TableCell>
        <TableCell sx={{ py: 1, textAlign: "center" }}>
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 0.8 }}>
            <Box sx={{ width: 52, height: 5, bgcolor: "#eee", borderRadius: 3 }}>
              <Box sx={{ width: `${ticker.tier_classification?.weighted_score ?? 0}%`, height: "100%", bgcolor: sig.color, borderRadius: 3 }} />
            </Box>
            <Typography sx={{ fontSize: "0.74rem", fontWeight: 700, color: "#444", minWidth: 20 }}>
              {ticker.tier_classification?.weighted_score ?? "—"}
            </Typography>
          </Box>
        </TableCell>
        <TableCell sx={{ py: 1, textAlign: "center" }}>
          <Chip
            label={ticker.overall_signal}
            size="small"
            sx={{ fontSize: "0.7rem", height: 22, fontWeight: 800, bgcolor: sig.bg, color: sig.color, border: `1.5px solid ${sig.color}44`, boxShadow: `0 0 6px ${sig.glow}` }}
          />
        </TableCell>
        <TableCell sx={{ py: 1, textAlign: "center" }}>
          <Typography sx={{ fontSize: "0.75rem", fontWeight: 700, color: techCfg.color }}>
            ● {techRaw ? techRaw.charAt(0).toUpperCase() + techRaw.slice(1) : "—"}
          </Typography>
        </TableCell>
        <TableCell sx={{ py: 1, textAlign: "center" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.6 }}>
            <Box sx={{ width: 38, height: 4, bgcolor: "#eee", borderRadius: 2 }}>
              <Box sx={{ width: `${ticker.confidence_score}%`, height: "100%", bgcolor: sig.color, borderRadius: 2 }} />
            </Box>
            <Typography sx={{ fontSize: "0.74rem", fontWeight: 700, color: "#444" }}>{ticker.confidence_score}%</Typography>
          </Box>
        </TableCell>
        <TableCell sx={{ py: 1, fontSize: "0.75rem", color: "#555", maxWidth: 200 }}>
          <Tooltip title={ticker.action_summary} placement="top-start">
            <span style={{ display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {ticker.action_summary}
            </span>
          </Tooltip>
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell colSpan={11} sx={{ p: 0, border: 0 }}>
          <Collapse in={open} unmountOnExit>
            <ExpandedRow ticker={ticker} />
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
};

// ─── Main Component ───────────────────────────────────────────────────
const JayRitterIPOAnalysis: React.FC = () => {
  const [reports, setReports]             = useState<ReportSummary[]>([]);
  const [selectedId, setSelectedId]       = useState<number | "">("");
  const [report, setReport]               = useState<Report | null>(null);
  const [tickers, setTickers]             = useState<TickerAnalysis[]>([]);
  const [loadingList, setLoadingList]     = useState(true);
  const [loadingReport, setLoadingReport] = useState(false);
  const [error, setError]                 = useState<string | null>(null);
  const [filter, setFilter]               = useState<FilterSignal>("ALL");
  const [search, setSearch]               = useState("");
  const [sortField, setSortField]         = useState<SortField>("confidence_score");
  const [sortDir, setSortDir]             = useState<"asc" | "desc">("desc");

  const apiBaseUrl = process.env.REACT_APP_API_BASE_URL || "http://localhost:9000";
  const token      = localStorage.getItem("access_token");
  const headers    = { Authorization: token ? `Bearer ${token}` : "" };

  useEffect(() => {
    (async () => {
      try {
        setLoadingList(true);
        const res = await axios.get<ReportSummary[]>(`${apiBaseUrl}/api/jay_ritter_reports/`, { headers });
        setReports(res.data);
        if (res.data.length > 0) setSelectedId(res.data[0].id);
      } catch { setError("Failed to load reports."); }
      finally  { setLoadingList(false); }
    })();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!selectedId) return;
    const chosen = reports.find(r => r.id === selectedId);
    if (!chosen) return;
    (async () => {
      try {
        setLoadingReport(true);
        setError(null);
        const res = await axios.get<APIResponse>(
          `${apiBaseUrl}/api/jay_ritter_report/?report_date=${chosen.report_date}`,
          { headers }
        );
        setReport(res.data.report);
        // Filter out TRIM signals
        setTickers((res.data.ticker_analyses || []).filter(t => t.overall_signal !== "TRIM" as string));
        setFilter("ALL");
        setSearch("");
      } catch { setError("Failed to load report."); }
      finally  { setLoadingReport(false); }
    })();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId]);

  const counts = useMemo(() => {
    const c: Record<FilterSignal, number> = { ALL: tickers.length, LONG: 0, SHORT: 0, AVOID: 0 };
    tickers.forEach(t => { const k = t.overall_signal as FilterSignal; if (k in c) c[k]++; });
    return c;
  }, [tickers]);

  const visible = useMemo(() => {
    let list = filter === "ALL" ? tickers : tickers.filter(t => t.overall_signal === filter);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(t =>
        t.ticker.toLowerCase().includes(q) ||
        t.issuer_name.toLowerCase().includes(q) ||
        t.sector.toLowerCase().includes(q)
      );
    }
    return [...list].sort((a, b) => {
      let av: string | number = a[sortField] as string | number;
      let bv: string | number = b[sortField] as string | number;
      if (typeof av === "string") av = av.toLowerCase();
      if (typeof bv === "string") bv = bv.toLowerCase();
      if (av < bv) return sortDir === "asc" ? -1 : 1;
      if (av > bv) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
  }, [tickers, filter, search, sortField, sortDir]);

  const handleSort = (f: SortField) => {
    if (sortField === f) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortField(f); setSortDir("desc"); }
  };

  const marketEnv = report?.market_environment || {};
  const summary   = report?.portfolio_summary  || {};
  const tempKey   = (marketEnv.market_temperature || "cold").toLowerCase() as keyof typeof TEMP_META;
  const tempMeta  = TEMP_META[tempKey] || TEMP_META.cold;

  // ─── States ───────────────────────────────────────────────────────
  if (loadingList) return (
    <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "70vh" }}>
      <CircularProgress sx={{ color: "#481f93" }} />
    </Box>
  );

  if (error && !report) return (
    <Box sx={{ p: 4, textAlign: "center" }}>
      <Typography color="error" variant="h6">{error}</Typography>
      <Typography color="text.secondary" sx={{ mt: 1 }}>No reports found. Run the Jay Ritter agent first.</Typography>
    </Box>
  );

  // Shared horizontal padding applied everywhere
  const PX = { xs: 2, sm: 3, md: 5, lg: 8 };

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#f5f6fa" }}>

      {/* ── Header (full-width dark bg, content constrained) ─────── */}
      <Box sx={{ background: "linear-gradient(160deg,#0f0225 0%,#1a0533 55%,#0d1b4b 100%)", pb: 4 }}>
        <Box sx={{ maxWidth: 1400, mx: "auto", px: PX }}>

          {/* Top bar: subtitle left, dropdown right */}
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", pt: 2, pb: 1 }}>
            <Typography sx={{ color: "rgba(255,255,255,0.35)", fontSize: "0.68rem", letterSpacing: 1.5, textTransform: "uppercase" }}>
              Ritter Academic Framework · US IPOs · 180-Day Lookback
            </Typography>
            <FormControl size="small">
              <Select
                value={selectedId}
                onChange={e => setSelectedId(e.target.value as number)}
                displayEmpty
                sx={{
                  bgcolor: "rgba(255,255,255,0.07)",
                  color: "#fff",
                  fontSize: "0.78rem",
                  borderRadius: 2,
                  minWidth: 210,
                  "& .MuiOutlinedInput-notchedOutline": { borderColor: "rgba(255,255,255,0.15)" },
                  "& .MuiSvgIcon-root": { color: "rgba(255,255,255,0.5)" },
                  "& .MuiSelect-select": { py: 0.8, px: 1.5 },
                  "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "rgba(255,255,255,0.35)" },
                }}
              >
                {reports.map(r => (
                  <MenuItem key={r.id} value={r.id} sx={{ fontSize: "0.82rem" }}>
                    {new Date(r.report_date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                    <span style={{ marginLeft: 8, color: "#aaa", textTransform: "capitalize" }}>
                      · {r.market_temperature} · {r.total_analyzed} IPOs
                    </span>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          {/* Centered Title + Badge */}
          <Box sx={{ textAlign: "center", mt: 1.5, mb: 3 }}>
            <Box sx={{ display: "inline-flex", alignItems: "center", gap: 1.5, mb: 0.6 }}>
              <Typography sx={{ color: "#fff", fontWeight: 900, fontSize: { xs: "1.5rem", md: "2rem" }, letterSpacing: -0.5 }}>
                Jay Ritter IPO Analysis
              </Typography>
              {report && (
                <Box sx={{ px: 1.5, py: 0.35, borderRadius: 5, background: tempMeta.gradient, boxShadow: "0 2px 14px rgba(0,0,0,0.35)" }}>
                  <Typography sx={{ color: "#fff", fontSize: "0.75rem", fontWeight: 800, letterSpacing: 0.5 }}>
                    {tempMeta.icon} {tempMeta.label}
                  </Typography>
                </Box>
              )}
            </Box>
            {report && (
              <Typography sx={{ color: "rgba(255,255,255,0.3)", fontSize: "0.72rem" }}>
                {new Date(report.report_date).toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" })}
                {" · "}{report.total_eligible_ipos} eligible · {report.total_analyzed} analyzed
              </Typography>
            )}
          </Box>

          {/* Metric Cards — 4 equal columns */}
          {report && (
            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr 1fr", md: "1fr 1fr 1fr 1fr" }, gap: 2, mb: 3 }}>
              {METRIC_CARDS.map(card => {
                const raw = marketEnv[card.key];
                const val = typeof raw === "number" ? card.fmt(raw) : "—";
                return (
                  <Box
                    key={card.key}
                    sx={{
                      background: card.gradient,
                      borderRadius: 3,
                      px: 3, py: 2.2,
                      textAlign: "center",
                      boxShadow: "0 4px 24px rgba(0,0,0,0.28)",
                    }}
                  >
                    <Typography sx={{ fontSize: "1.6rem", lineHeight: 1 }}>{card.icon}</Typography>
                    <Typography sx={{ color: "#fff", fontWeight: 900, fontSize: "1.5rem", mt: 0.5, letterSpacing: -0.5 }}>
                      {val}
                    </Typography>
                    <Typography sx={{ color: "rgba(255,255,255,0.65)", fontSize: "0.63rem", textTransform: "uppercase", letterSpacing: 0.9, mt: 0.4 }}>
                      {card.label}
                    </Typography>
                  </Box>
                );
              })}
            </Box>
          )}

          {/* Market Commentary — full width of the content column */}
          {marketEnv.market_commentary && (
            <Box
              sx={{
                px: 2.5, py: 2,
                borderRadius: 2.5,
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.1)",
                backdropFilter: "blur(8px)",
                position: "relative",
                overflow: "hidden",
              }}
            >
              <Box sx={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 3, background: tempMeta.gradient }} />
              <Typography sx={{ fontSize: "0.62rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: 1.5, color: "rgba(255,255,255,0.4)", mb: 0.8 }}>
                Market Outlook
              </Typography>
              <Typography sx={{ color: "rgba(255,255,255,0.8)", fontSize: "0.82rem", lineHeight: 1.75 }}>
                {marketEnv.market_commentary}
              </Typography>
            </Box>
          )}

        </Box>
      </Box>

      {/* ── All content below shares the same container ──────────── */}
      <Box sx={{ maxWidth: 1400, mx: "auto", px: PX }}>

        {/* Portfolio strip */}
        {report && (
          <Box sx={{ bgcolor: "#fff", py: 1.2, borderBottom: "1px solid #ebebeb", display: "flex", alignItems: "center", gap: 3, flexWrap: "wrap", mx: -PX as any, px: PX }}>
            <Typography sx={{ fontSize: "0.68rem", fontWeight: 700, color: "#ccc", textTransform: "uppercase", letterSpacing: 1 }}>
              Book
            </Typography>
            {(["LONG", "SHORT", "AVOID"] as FilterSignal[]).map(sig => {
              const cfg = SIGNAL_CONFIG[sig];
              const count = sig === "LONG" ? (summary.long_book_count ?? counts.LONG)
                : sig === "SHORT" ? (summary.short_book_count ?? counts.SHORT)
                : (summary.avoid_count ?? counts.AVOID);
              return (
                <Box key={sig} sx={{ display: "flex", alignItems: "center", gap: 0.8 }}>
                  <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: cfg.color }} />
                  <Typography sx={{ fontSize: "0.78rem", fontWeight: 700, color: cfg.color }}>{sig}</Typography>
                  <Typography sx={{ fontSize: "0.8rem", color: "#555", fontWeight: 600 }}>{count}</Typography>
                </Box>
              );
            })}
            <Box sx={{ flex: 1 }} />
            {report.processing_time_seconds && (
              <Typography sx={{ fontSize: "0.67rem", color: "#ccc" }}>
                Generated in {report.processing_time_seconds.toFixed(0)}s · Claude Sonnet 4
              </Typography>
            )}
          </Box>
        )}

        {/* Filters + Search */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, py: 2, flexWrap: "wrap" }}>
          {(["ALL", "LONG", "SHORT", "AVOID"] as FilterSignal[]).map(sig => {
            const active = filter === sig;
            const cfg = SIGNAL_CONFIG[sig];
            return (
              <Box
                key={sig}
                onClick={() => setFilter(sig)}
                sx={{
                  px: 2, py: 0.55, borderRadius: 5, cursor: "pointer", userSelect: "none",
                  fontSize: "0.78rem", fontWeight: 700, transition: "all 0.15s",
                  bgcolor: active ? (cfg ? cfg.bg : "#ede7f6") : "#fff",
                  color: active ? (cfg ? cfg.color : "#481f93") : "#999",
                  border: `1.5px solid ${active ? (cfg ? cfg.color : "#481f93") : "#e0e0e0"}`,
                  boxShadow: active ? `0 0 8px ${cfg?.glow ?? "transparent"}` : "none",
                }}
              >
                {sig} <span style={{ opacity: 0.65 }}>({counts[sig]})</span>
              </Box>
            );
          })}
          <Box sx={{ flex: 1 }} />
          <TextField
            size="small"
            placeholder="Search ticker, issuer, sector…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ fontSize: 16, color: "#bbb" }} />
                </InputAdornment>
              ),
            }}
            sx={{
              minWidth: 240,
              "& .MuiOutlinedInput-root": { borderRadius: 3, fontSize: "0.8rem", bgcolor: "#fff" },
            }}
          />
        </Box>

        {/* Table */}
        <Paper elevation={0} sx={{ borderRadius: 2, border: "1px solid #e8e8e8", overflow: "hidden", mb: 3 }}>
          {loadingReport ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
              <CircularProgress size={32} sx={{ color: "#481f93" }} />
            </Box>
          ) : (
            <TableContainer>
              <Table size="small" stickyHeader>
                <TableHead>
                  <TableRow sx={{ "& th": { bgcolor: "#1a0533", color: "rgba(255,255,255,0.8)", fontWeight: 700, fontSize: "0.68rem", textTransform: "uppercase", letterSpacing: 0.8, py: 1.3, borderBottom: "none" } }}>
                    <TableCell sx={{ bgcolor: "#1a0533 !important", width: 36 }} />
                    <TableCell sx={{ bgcolor: "#1a0533 !important" }}>
                      <TableSortLabel active={sortField === "ticker"} direction={sortDir} onClick={() => handleSort("ticker")}
                        sx={{ color: "rgba(255,255,255,0.8) !important", "& .MuiTableSortLabel-icon": { color: "rgba(255,255,255,0.4) !important" } }}>
                        Ticker
                      </TableSortLabel>
                    </TableCell>
                    <TableCell sx={{ bgcolor: "#1a0533 !important" }}>Issuer</TableCell>
                    <TableCell sx={{ bgcolor: "#1a0533 !important" }}>Sector</TableCell>
                    <TableCell align="center" sx={{ bgcolor: "#1a0533 !important" }}>
                      <TableSortLabel active={sortField === "days_since_ipo"} direction={sortDir} onClick={() => handleSort("days_since_ipo")}
                        sx={{ color: "rgba(255,255,255,0.8) !important", "& .MuiTableSortLabel-icon": { color: "rgba(255,255,255,0.4) !important" } }}>
                        Days
                      </TableSortLabel>
                    </TableCell>
                    <TableCell align="center" sx={{ bgcolor: "#1a0533 !important" }}>Tier</TableCell>
                    <TableCell align="center" sx={{ bgcolor: "#1a0533 !important" }}>Score</TableCell>
                    <TableCell align="center" sx={{ bgcolor: "#1a0533 !important" }}>
                      <TableSortLabel active={sortField === "overall_signal"} direction={sortDir} onClick={() => handleSort("overall_signal")}
                        sx={{ color: "rgba(255,255,255,0.8) !important", "& .MuiTableSortLabel-icon": { color: "rgba(255,255,255,0.4) !important" } }}>
                        Signal
                      </TableSortLabel>
                    </TableCell>
                    <TableCell align="center" sx={{ bgcolor: "#1a0533 !important" }}>Technical</TableCell>
                    <TableCell align="center" sx={{ bgcolor: "#1a0533 !important" }}>
                      <TableSortLabel active={sortField === "confidence_score"} direction={sortDir} onClick={() => handleSort("confidence_score")}
                        sx={{ color: "rgba(255,255,255,0.8) !important", "& .MuiTableSortLabel-icon": { color: "rgba(255,255,255,0.4) !important" } }}>
                        Confidence
                      </TableSortLabel>
                    </TableCell>
                    <TableCell sx={{ bgcolor: "#1a0533 !important" }}>Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {visible.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={11} align="center" sx={{ py: 8, color: "#ccc", fontSize: "0.9rem" }}>
                        No IPOs match the current filter.
                      </TableCell>
                    </TableRow>
                  ) : (
                    visible.map((t, i) => <TickerRow key={t.id} ticker={t} index={i} />)
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Paper>

        <Typography sx={{ fontSize: "0.68rem", color: "#bbb", pb: 3 }}>
          Showing {visible.length} of {tickers.length} IPOs · Click any row to expand full analysis
        </Typography>

      </Box>
    </Box>
  );
};

export default JayRitterIPOAnalysis;
