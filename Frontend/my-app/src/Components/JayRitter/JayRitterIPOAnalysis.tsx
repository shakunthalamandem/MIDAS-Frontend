import React, { useEffect, useState, useMemo } from "react";
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Collapse,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
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
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import SearchIcon from "@mui/icons-material/Search";
import SmartToyOutlinedIcon from "@mui/icons-material/SmartToyOutlined";
import SwapHorizIcon from "@mui/icons-material/SwapHoriz";
import axios from "axios";
import JayRitterChat from "./JayRitterChat";
import PriceChartsSection from "../TradingSignals/PriceChartsSection";

// ─── Types ───────────────────────────────────────────────────────────
interface ReportSummary {
  id: number;
  report_date: string;
  total_analyzed: number;
  market_temperature?: string;
  long_count?: number;
  short_count?: number;
  neutral_count?: number;
}

interface MarketEnvironment {
  market_temperature?: string;
  rolling_180d_avg_first_day_return?: number;
  ipo_volume_vs_3yr_median?: number;
  price_revision_above_high_pct?: number;
  post_ipo_first_week_breadth?: number;
  market_commentary?: string;
}

interface PortfolioSummary {
  long_book_count?: number;
  short_book_count?: number;
  neutral_count?: number;
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
  trade_date?: string;
  days_since_ipo: number;
  sector: string;
  deal_size?: number;
  market_cap?: number;
  overall_signal: "LONG" | "SHORT" | "NEUTRAL" | "TRIM";
  confidence_score: number;
  action_summary: string;
  time_window_tag?: string;
  tier_classification?: {
    tier?: number;
    weighted_score?: number;
    book_assignment?: string;
    reasoning?: string;
    scoring_breakdown?: Record<string, number>;
    sector_allocation_bucket?: string;
    tier1_criteria_met?: boolean;
  };
  am_opportunity?: {
    am_score?: number;
    current_time_window?: string;
    strategy_signal?: string;
    strategy_reasoning?: string;
    first_day_pop_pct?: number;
    volume_ratio_ex_day1?: number;
    analyst_coverage_count?: number;
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
    short_interest_trend?: string;
  };
}

interface APIResponse {
  report: Report;
  ticker_analyses: TickerAnalysis[];
}

interface SignalChange {
  ticker: string;
  issuer_name: string;
  previous_signal: string;
  current_signal: string;
}

interface SignalChangesResponse {
  current_date: string;
  previous_date: string | null;
  changes: SignalChange[];
}

// ─── Constants ───────────────────────────────────────────────────────
const SIGNAL_CONFIG: Record<string, { bg: string; color: string; glow: string }> = {
  LONG:  { bg: "#e8f5e9", color: "#1b5e20", glow: "rgba(27,94,32,0.15)"  },
  SHORT: { bg: "#fce4ec", color: "#b71c1c", glow: "rgba(183,28,28,0.15)" },
  NEUTRAL: { bg: "#fff8e1", color: "#e65100", glow: "rgba(230,81,0,0.15)"  },
};

const TEMP_META: Record<string, { gradient: string; badge: string; textColor: string; icon: string; label: string }> = {
  hot:  { gradient: "linear-gradient(135deg,#b71c1c,#e53935,#ff7043)", badge: "#fce4ec", textColor: "#b71c1c", icon: "🔥", label: "HOT"  },
  warm: { gradient: "linear-gradient(135deg,#e65100,#f57c00,#ffb74d)", badge: "#fff8e1", textColor: "#e65100", icon: "☀️", label: "WARM" },
  cold: { gradient: "linear-gradient(135deg,#0d47a1,#1565c0,#42a5f5)", badge: "#e3f2fd", textColor: "#0d47a1", icon: "🥶", label: "COLD" },
};

const METRIC_CARDS = [
  {
    key: "market_temperature" as keyof MarketEnvironment,
    label: "Market Temperature",
    tooltip: "Overall IPO market heat classification based on Jay Ritter's framework. HOT (>25% avg first-day return, apply strict quality screens), WARM (10-25%), COLD (<10%, relaxed entry, lean long).",
    fmt: (v: any) => v,
    gradient: "linear-gradient(135deg,#f57c00,#ff9800)",
    icon: "🌡️",
    isTemperature: true,
  },
  {
    key: "rolling_180d_avg_first_day_return" as keyof MarketEnvironment,
    label: "180-Day Avg First-Day Return",
    tooltip: "Average first-day return across all eligible US IPOs in the last 180 days. This rolling metric reflects current market appetite for new issues. >25% = HOT, 10-25% = WARM, <10% = COLD.",
    fmt: (v: number) => `${v.toFixed(1)}%`,
    gradient: "linear-gradient(135deg,#5e35b1,#9575cd)",
    icon: "📈",
  },
  {
    key: "ipo_volume_vs_3yr_median" as keyof MarketEnvironment,
    label: "Volume vs 3yr Median",
    tooltip: "Current annualized IPO volume compared to the actual 3-year rolling median of US IPOs (computed from Dealogic data). >2x median = HOT signal (high supply, increased selectivity needed). <1x = below average issuance.",
    fmt: (v: number) => `${v.toFixed(2)}×`,
    gradient: "linear-gradient(135deg,#00897b,#4db8a8)",
    icon: "📊",
  },
  {
    key: "price_revision_above_high_pct" as keyof MarketEnvironment,
    label: "Priced Above Range",
    tooltip: "Percentage of recent IPOs that priced above the high end of their initial filing range. >60% = EUPHORIC (per Ritter's partial adjustment research, these periods precede the largest underperformance). 0% means no IPOs priced above their range — a cautious pricing environment.",
    fmt: (v: number) => `${v.toFixed(0)}%`,
    gradient: "linear-gradient(135deg,#c62828,#e57373)",
    icon: "💹",
  },
];

const TECH_CONFIG: Record<string, { color: string }> = {
  bullish: { color: "#1b5e20" },
  bearish: { color: "#b71c1c" },
  neutral: { color: "#757575" },
};

type SortField    = "ticker" | "days_since_ipo" | "confidence_score" | "overall_signal";
type FilterSignal = "ALL" | "LONG" | "SHORT" | "NEUTRAL";

// ─── Metric Row Helper ────────────────────────────────────────────────
const MetricRow: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", py: 0.6 }}>
    <Typography sx={{ fontSize: "0.76rem", color: "#555", fontWeight: 500 }}>{label}</Typography>
    <Typography sx={{ fontSize: "0.82rem", fontWeight: 700, color: "#111", textAlign: "right" }}>{value}</Typography>
  </Box>
);

// ─── Score Bar (visual progress for scoring breakdown) ───────────────
const SCORE_MAX: Record<string, number> = {
  upward_price_revision: 25,
  profitability_at_ipo: 20,
  pre_ipo_revenue_above_100m: 15,
  tier1_underwriter: 15,
  vc_backing: 10,
  firm_age_above_10yr: 10,
  dual_class_penalty: 5,
};

const SCORE_LABELS: Record<string, string> = {
  upward_price_revision: "Price Revision (above range)",
  profitability_at_ipo: "Profitability at IPO",
  pre_ipo_revenue_above_100m: "Revenue > $100M",
  tier1_underwriter: "Tier-1 Underwriter",
  vc_backing: "VC Backing",
  firm_age_above_10yr: "Firm Age > 10yr",
  dual_class_penalty: "Dual-class Penalty",
};

const ScoreBar: React.FC<{ scoreKey: string; value: number }> = ({ scoreKey, value }) => {
  const maxVal = SCORE_MAX[scoreKey] || 25;
  const label = SCORE_LABELS[scoreKey] || scoreKey.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());
  const isPenalty = value < 0;
  const absVal = Math.abs(value);
  const pct = maxVal > 0 ? Math.min((absVal / maxVal) * 100, 100) : 0;

  // Color based on fill percentage
  const barColor = isPenalty ? "#EF4444" : pct >= 70 ? "#10B981" : pct >= 40 ? "#F59E0B" : "#94A3B8";

  return (
    <Box sx={{ mb: 1.2 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 0.4 }}>
        <Typography sx={{ fontSize: "0.72rem", color: "#444", fontWeight: 600 }}>
          {label}
        </Typography>
        <Typography sx={{ fontSize: "0.72rem", fontWeight: 800, color: isPenalty ? "#EF4444" : pct >= 70 ? "#059669" : "#333", minWidth: 36, textAlign: "right" }}>
          {value}
        </Typography>
      </Box>
      <Box sx={{ width: "100%", height: 7, bgcolor: "#E5E7EB", borderRadius: 4, overflow: "hidden" }}>
        <Box sx={{
          width: `${pct}%`,
          height: "100%",
          bgcolor: barColor,
          borderRadius: 4,
          transition: "width 0.6s ease-out",
          background: isPenalty
            ? "linear-gradient(90deg, #FCA5A5, #EF4444)"
            : `linear-gradient(90deg, ${barColor}88, ${barColor})`,
        }} />
      </Box>
    </Box>
  );
};

// ─── Stat Card (for key deal metrics) ────────────────────────────────
const StatCard: React.FC<{ label: string; value: React.ReactNode; color?: string; bgColor?: string }> = ({ label, value, color = "#1E293B", bgColor = "#F8FAFC" }) => (
  <Box sx={{ p: 1.5, bgcolor: bgColor, borderRadius: 2, border: "1px solid #E2E8F0", minWidth: 100, flex: 1 }}>
    <Typography sx={{ fontSize: "0.62rem", fontWeight: 600, color: "#94A3B8", textTransform: "uppercase", letterSpacing: 0.8, mb: 0.3 }}>
      {label}
    </Typography>
    <Typography sx={{ fontSize: "0.9rem", fontWeight: 800, color }}>
      {value}
    </Typography>
  </Box>
);

// ─── Color helpers ───────────────────────────────────────────────────
const getScoreColor = (score: number): string => {
  if (score >= 70) return "#059669";
  if (score >= 36) return "#D97706";
  return "#DC2626";
};

const getPopColor = (pop: number): string => {
  if (pop >= 5 && pop <= 40) return "#059669";
  if (pop > 40) return "#DC2626";
  return "#D97706";
};

const getRsiColor = (rsi: number): string => {
  if (rsi > 70) return "#DC2626";
  if (rsi < 30) return "#059669";
  return "#333";
};

const getStrategyColor = (signal: string): { bg: string; text: string } => {
  const s = (signal || "").toLowerCase();
  if (s === "long") return { bg: "#ECFDF5", text: "#065F46" };
  if (s === "short") return { bg: "#FEF2F2", text: "#991B1B" };
  if (s === "hold") return { bg: "#FFFBEB", text: "#92400E" };
  return { bg: "#F1F5F9", text: "#475569" };
};

// ─── Expanded Row (redesigned with visual richness) ──────────────────
const ExpandedRow: React.FC<{ ticker: TickerAnalysis }> = ({ ticker }) => {
  const tier = ticker.tier_classification || {};
  const am = ticker.am_opportunity || {};
  const tech = ticker.technical_signals || {};

  const signalConfig = SIGNAL_CONFIG[ticker.overall_signal] || SIGNAL_CONFIG["NEUTRAL"];
  const techConfig = TECH_CONFIG[(tech.overall_technical_signal || "").toLowerCase()] || { color: "#666" };
  const strategyColors = getStrategyColor(am.strategy_signal || "");

  const formatCurrency = (val?: number) => {
    if (val == null) return "—";
    if (val >= 1e9) return `$${(val / 1e9).toFixed(1)}B`;
    if (val >= 1e6) return `$${(val / 1e6).toFixed(0)}M`;
    return `$${val.toLocaleString()}`;
  };

  return (
    <Box sx={{ px: 3, py: 2.5, bgcolor: "#f5f7fb", borderTop: "3px solid #e0e5f0" }}>

      {/* ─── Header: Ticker + Key Stats Cards ─── */}
      <Box sx={{ mb: 2.5 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1.5 }}>
          <Typography sx={{ fontSize: "1rem", fontWeight: 900, color: "#1E293B" }}>
            {ticker.ticker}
          </Typography>
          <Typography sx={{ fontSize: "0.82rem", color: "#64748B", fontWeight: 500 }}>
            — {ticker.issuer_name}
          </Typography>
          <Typography sx={{ fontSize: "0.72rem", color: "#94A3B8" }}>
            {ticker.sector} · {ticker.days_since_ipo}d since IPO
          </Typography>
          <Box sx={{ ml: "auto" }}>
            <Chip
              label={ticker.overall_signal}
              size="small"
              sx={{
                fontSize: "0.72rem", fontWeight: 900, height: 26,
                bgcolor: signalConfig.bg, color: signalConfig.color,
                border: `2px solid ${signalConfig.color}`,
                boxShadow: `0 0 12px ${signalConfig.glow}`,
              }}
            />
          </Box>
        </Box>

        {/* Key metric cards */}
        <Box sx={{ display: "flex", gap: 1.5 }}>
          {ticker.deal_size != null && <StatCard label="Deal Size" value={formatCurrency(ticker.deal_size)} />}
          {ticker.market_cap != null && <StatCard label="Market Cap" value={formatCurrency(ticker.market_cap)} />}
          {am.first_day_pop_pct != null && (
            <StatCard
              label="First-Day Pop"
              value={`${am.first_day_pop_pct > 0 ? "+" : ""}${am.first_day_pop_pct.toFixed(1)}%`}
              color={getPopColor(am.first_day_pop_pct)}
              bgColor={am.first_day_pop_pct >= 5 && am.first_day_pop_pct <= 40 ? "#F0FDF4" : am.first_day_pop_pct > 40 ? "#FEF2F2" : "#FFFBEB"}
            />
          )}
          <StatCard label="Confidence" value={`${ticker.confidence_score}%`} color={getScoreColor(ticker.confidence_score)} />
          {tier.weighted_score != null && (
            <StatCard label="Weighted Score" value={`${tier.weighted_score}/100`} color={getScoreColor(tier.weighted_score)} />
          )}
          {am.current_time_window && <StatCard label="Time Window" value={am.current_time_window} color="#4527a0" bgColor="#F5F3FF" />}
        </Box>
      </Box>

      {/* ─── 3-Column Cards: Tier | AM Opportunity | Technicals ─── */}
      <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 2, mb: 2 }}>

        {/* Tier Classification Card */}
        <Box sx={{ p: 2, bgcolor: "#fff", borderRadius: 2.5, border: "2px solid #4527a0", boxShadow: "0 2px 12px rgba(69,39,160,0.06)" }}>
          <Typography sx={{ fontSize: "0.72rem", fontWeight: 900, textTransform: "uppercase", color: "#4527a0", letterSpacing: 1.2, mb: 1.5 }}>
            Tier Classification
          </Typography>
          <MetricRow label="Tier" value={tier.tier != null ? (
            <Chip label={`Tier ${tier.tier}`} size="small" sx={{ fontSize: "0.7rem", height: 20, bgcolor: "#EDE7F6", color: "#4527a0", fontWeight: 800 }} />
          ) : "—"} />
          <MetricRow label="Weighted Score" value={tier.weighted_score != null ? (
            <Typography component="span" sx={{ fontSize: "0.82rem", fontWeight: 800, color: getScoreColor(tier.weighted_score) }}>
              {tier.weighted_score} / 100
            </Typography>
          ) : "—"} />
          <MetricRow label="Book" value={tier.book_assignment != null ? (
            <Chip
              label={(tier.book_assignment || "").toUpperCase()}
              size="small"
              sx={{
                fontSize: "0.65rem", height: 20, fontWeight: 800,
                ...(tier.book_assignment?.toLowerCase() === "long" ? { bgcolor: "#ECFDF5", color: "#065F46" } :
                  tier.book_assignment?.toLowerCase() === "short" ? { bgcolor: "#FEF2F2", color: "#991B1B" } :
                  { bgcolor: "#FFF7ED", color: "#9A3412" }),
              }}
            />
          ) : "—"} />
          {tier.sector_allocation_bucket && (
            <MetricRow label="Sector Bucket" value={
              <Chip label={tier.sector_allocation_bucket} size="small" sx={{ fontSize: "0.65rem", height: 20, bgcolor: "#F1F5F9", color: "#475569", fontWeight: 600 }} />
            } />
          )}
          {tier.tier1_criteria_met != null && (
            <MetricRow
              label="Tier 1 Criteria"
              value={
                <Typography sx={{ fontSize: "0.82rem", fontWeight: 700, color: tier.tier1_criteria_met ? "#059669" : "#DC2626" }}>
                  {tier.tier1_criteria_met ? "Met ✓" : "Not Met ✗"}
                </Typography>
              }
            />
          )}

          {/* Scoring Breakdown with Progress Bars */}
          {tier.scoring_breakdown && (
            <Box sx={{ mt: 1.5, pt: 1.2, borderTop: "1px solid #E2E8F0" }}>
              <Typography sx={{ fontSize: "0.65rem", fontWeight: 700, color: "#4527a0", textTransform: "uppercase", letterSpacing: 0.8, mb: 1 }}>
                Scoring Breakdown
              </Typography>
              {Object.entries(tier.scoring_breakdown).map(([key, val]) => (
                <ScoreBar key={key} scoreKey={key} value={typeof val === "number" ? val : 0} />
              ))}
            </Box>
          )}
          {tier.reasoning && (
            <Box sx={{ mt: 1.2, pt: 1, borderTop: "1px solid #E2E8F0" }}>
              <Typography sx={{ fontSize: "0.72rem", color: "#334155", lineHeight: 1.7, fontWeight: 500, fontStyle: "italic" }}>
                {tier.reasoning}
              </Typography>
            </Box>
          )}
        </Box>

        {/* AM Opportunity Card */}
        <Box sx={{ p: 2, bgcolor: "#fff", borderRadius: 2.5, border: "2px solid #00695c", boxShadow: "0 2px 12px rgba(0,105,92,0.06)" }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1.5 }}>
            <Typography sx={{ fontSize: "0.72rem", fontWeight: 900, textTransform: "uppercase", color: "#00695c", letterSpacing: 1.2 }}>
              AM Opportunity
            </Typography>
            {am.strategy_signal && (
              <Chip
                label={(am.strategy_signal || "").toUpperCase()}
                size="small"
                sx={{ fontSize: "0.62rem", height: 20, fontWeight: 800, bgcolor: strategyColors.bg, color: strategyColors.text }}
              />
            )}
          </Box>
          <MetricRow label="AM Score" value={am.am_score != null ? (
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
              <Typography sx={{ fontSize: "0.82rem", fontWeight: 800, color: am.am_score >= 3 ? "#059669" : am.am_score >= 2 ? "#D97706" : "#DC2626" }}>
                {am.am_score} / 5
              </Typography>
            </Box>
          ) : "—"} />
          <MetricRow label="Time Window" value={am.current_time_window ?? "—"} />
          <MetricRow label="Day-1 Pop" value={am.first_day_pop_pct != null ? (
            <Typography component="span" sx={{ fontSize: "0.82rem", fontWeight: 700, color: getPopColor(am.first_day_pop_pct) }}>
              {am.first_day_pop_pct > 40 ? "🚀 " : ""}{am.first_day_pop_pct > 0 ? "+" : ""}{am.first_day_pop_pct.toFixed(1)}%
            </Typography>
          ) : "—"} />
          <MetricRow label="Short Interest" value={am.short_interest_pct_float != null ? (
            <Typography component="span" sx={{ fontSize: "0.82rem", fontWeight: 700, color: am.short_interest_pct_float > 15 ? "#DC2626" : "#333" }}>
              {am.short_interest_pct_float.toFixed(1)}%
            </Typography>
          ) : "—"} />
          <MetricRow label="Days Above IPO" value={am.days_above_ipo_price ?? "—"} />
          <MetricRow label="Volume Ratio (ex-Day1)" value={am.volume_ratio_ex_day1 != null ? am.volume_ratio_ex_day1.toFixed(2) : "—"} />
          <MetricRow label="Analyst Coverage" value={am.analyst_coverage_count ?? "—"} />
          {am.strategy_reasoning && (
            <Box sx={{ mt: 1.2, pt: 1, borderTop: "1px solid #E2E8F0" }}>
              <Typography sx={{ fontSize: "0.72rem", color: "#334155", lineHeight: 1.7, fontWeight: 500, fontStyle: "italic" }}>
                {am.strategy_reasoning}
              </Typography>
            </Box>
          )}
        </Box>

        {/* Technical Signals Card */}
        <Box sx={{ p: 2, bgcolor: "#fff", borderRadius: 2.5, border: `2px solid ${techConfig.color}`, boxShadow: `0 2px 12px ${techConfig.color}10` }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1.5 }}>
            <Typography sx={{ fontSize: "0.72rem", fontWeight: 900, textTransform: "uppercase", color: techConfig.color, letterSpacing: 1.2 }}>
              Technical Signals
            </Typography>
            {tech.overall_technical_signal && (
              <Chip
                label={(tech.overall_technical_signal || "").charAt(0).toUpperCase() + (tech.overall_technical_signal || "").slice(1)}
                size="small"
                sx={{ fontSize: "0.62rem", height: 20, fontWeight: 800, bgcolor: techConfig.color + "15", color: techConfig.color }}
              />
            )}
          </Box>
          <MetricRow label="MA Crossover (10/40)" value={tech.ma_crossover_10_40 ? (
            <Typography component="span" sx={{
              fontSize: "0.82rem", fontWeight: 700,
              color: tech.ma_crossover_10_40 === "bullish" ? "#059669" : tech.ma_crossover_10_40 === "bearish" ? "#DC2626" : "#666",
            }}>
              {tech.ma_crossover_10_40.charAt(0).toUpperCase() + tech.ma_crossover_10_40.slice(1)}
            </Typography>
          ) : "—"} />
          <MetricRow label="RSI (14d)" value={tech.rsi_14d != null ? (
            <Typography component="span" sx={{ fontSize: "0.82rem", fontWeight: 700, color: getRsiColor(tech.rsi_14d) }}>
              {tech.rsi_14d.toFixed(1)} {tech.rsi_14d > 70 ? "⚠️" : tech.rsi_14d < 30 ? "📉" : ""}
            </Typography>
          ) : "—"} />
          <MetricRow label="vs FPX ETF" value={tech.relative_strength_vs_ipo_etf != null ? (
            <Typography component="span" sx={{
              fontSize: "0.82rem", fontWeight: 700,
              color: tech.relative_strength_vs_ipo_etf > 0 ? "#059669" : tech.relative_strength_vs_ipo_etf < 0 ? "#DC2626" : "#333",
            }}>
              {tech.relative_strength_vs_ipo_etf > 0 ? "+" : ""}{tech.relative_strength_vs_ipo_etf.toFixed(1)}%
            </Typography>
          ) : "—"} />
          <MetricRow
            label="Day-1 High Break"
            value={
              tech.break_above_day1_high != null ? (
                <Typography component="span" sx={{ fontSize: "0.82rem", fontWeight: 700, color: tech.break_above_day1_high ? "#059669" : "#DC2626" }}>
                  {tech.break_above_day1_high ? "Yes ✓" : "No ✗"}
                </Typography>
              ) : "—"
            }
          />
          <MetricRow label="Volume Breakout" value={tech.volume_breakout_ratio != null ? (
            <Typography component="span" sx={{
              fontSize: "0.82rem", fontWeight: 700,
              color: tech.volume_breakout_ratio >= 1.5 ? "#059669" : "#333",
            }}>
              {tech.volume_breakout_ratio.toFixed(2)}x
            </Typography>
          ) : "—"} />
          <MetricRow label="Short Interest Trend" value={tech.short_interest_trend ? (
            <Typography component="span" sx={{
              fontSize: "0.82rem", fontWeight: 700,
              color: tech.short_interest_trend === "rising" ? "#DC2626" : tech.short_interest_trend === "declining" ? "#059669" : "#666",
            }}>
              {tech.short_interest_trend.charAt(0).toUpperCase() + tech.short_interest_trend.slice(1)}
              {tech.short_interest_trend === "rising" ? " ↑" : tech.short_interest_trend === "declining" ? " ↓" : ""}
            </Typography>
          ) : "—"} />
          {tech.technical_reasoning && (
            <Box sx={{ mt: 1.2, pt: 1, borderTop: "1px solid #E2E8F0" }}>
              <Typography sx={{ fontSize: "0.72rem", color: "#334155", lineHeight: 1.7, fontWeight: 500, fontStyle: "italic" }}>
                {tech.technical_reasoning}
              </Typography>
            </Box>
          )}
        </Box>
      </Box>

      {/* ─── Recommendation Bar (enhanced) ─── */}
      <Box sx={{
        p: 2, borderRadius: 2.5, border: `2px solid ${signalConfig.color}`,
        bgcolor: signalConfig.bg,
        background: `linear-gradient(135deg, ${signalConfig.bg}, #fff)`,
      }}>
        <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.5 }}>
          <Chip
            label="RECOMMENDATION"
            size="small"
            sx={{ fontSize: "0.62rem", fontWeight: 900, height: 22, bgcolor: signalConfig.color, color: "#fff", letterSpacing: 0.8, mt: 0.2 }}
          />
          <Typography sx={{ fontSize: "0.82rem", color: "#1E293B", lineHeight: 1.8, fontWeight: 500, flex: 1 }}>
            {ticker.action_summary}
          </Typography>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, ml: 1, flexShrink: 0 }}>
            <Chip
              label={ticker.overall_signal}
              size="small"
              sx={{ fontSize: "0.7rem", fontWeight: 900, height: 24, bgcolor: signalConfig.color, color: "#fff" }}
            />
            <Typography sx={{ fontSize: "0.72rem", fontWeight: 700, color: "#64748B" }}>
              {ticker.confidence_score}%
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* ─── FactSet Time Series Chart ─── */}
      {ticker.ticker && ticker.trade_date && (
        <Box sx={{ mt: 2 }}>
          <PriceChartsSection
            ticker={ticker.ticker}
            trade_date={ticker.trade_date}
          />
        </Box>
      )}
    </Box>
  );
};

// ─── Table Row ────────────────────────────────────────────────────────
const TickerRow: React.FC<{ ticker: TickerAnalysis; index: number }> = ({ ticker, index }) => {
  const [open, setOpen] = useState(false);
  const sig    = SIGNAL_CONFIG[ticker.overall_signal] || SIGNAL_CONFIG["NEUTRAL"];
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
          <IconButton size="small" sx={{ p: 0.3, color: "#666" }}>
            {open ? <KeyboardArrowUpIcon fontSize="small" /> : <KeyboardArrowDownIcon fontSize="small" />}
          </IconButton>
        </TableCell>
        <TableCell sx={{ py: 1, fontWeight: 800, fontSize: "0.82rem", color: "#481f93" }}>{ticker.ticker}</TableCell>
        <TableCell sx={{ py: 1, fontSize: "0.8rem", maxWidth: 160, color: "#333" }}>
          <Tooltip title={ticker.issuer_name} placement="top-start">
            <span style={{ display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {ticker.issuer_name}
            </span>
          </Tooltip>
        </TableCell>
        <TableCell sx={{ py: 1, fontSize: "0.78rem", color: "#444" }}>{ticker.sector}</TableCell>
        <TableCell sx={{ py: 1, fontSize: "0.8rem", textAlign: "center", color: "#333" }}>{ticker.days_since_ipo}d</TableCell>
        <TableCell sx={{ py: 1, textAlign: "center" }}>
          {ticker.tier_classification?.tier
            ? <Chip label={`T${ticker.tier_classification.tier}`} size="small" sx={{ fontSize: "0.7rem", height: 20, bgcolor: "#ede7f6", color: "#4527a0", fontWeight: 700 }} />
            : <Typography sx={{ color: "#ccc", fontSize: "0.8rem" }}>—</Typography>}
        </TableCell>
        <TableCell sx={{ py: 1, textAlign: "center" }}>
          <Chip
            label={ticker.overall_signal}
            size="small"
            sx={{ fontSize: "0.7rem", height: 22, fontWeight: 800, bgcolor: sig.bg, color: sig.color, border: `1.5px solid ${sig.color}44`, boxShadow: `0 0 6px ${sig.glow}` }}
          />
        </TableCell>
        <TableCell sx={{ py: 1, fontSize: "0.75rem", color: "#333", maxWidth: 200 }}>
          <Tooltip title={ticker.action_summary} placement="top-start">
            <span style={{ display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {ticker.action_summary}
            </span>
          </Tooltip>
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell colSpan={8} sx={{ p: 0, border: 0 }}>
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
  const [criteriaOpen, setCriteriaOpen]   = useState(false);
  const [chatOpen, setChatOpen]           = useState(false);
  const [signalChanges, setSignalChanges]           = useState<SignalChange[]>([]);
  const [signalChangeDates, setSignalChangeDates]   = useState<{ current_date: string; previous_date: string } | null>(null);
  const [signalChangeOpen, setSignalChangeOpen]     = useState(false);

  const apiBaseUrl = process.env.REACT_APP_API_URL;
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

        // Fetch signal changes vs previous report
        try {
          const scRes = await axios.get<SignalChangesResponse>(
            `${apiBaseUrl}/api/jay_ritter_signal_changes/?report_date=${chosen.report_date}`,
            { headers }
          );
          setSignalChanges(scRes.data.changes || []);
          if (scRes.data.previous_date) {
            setSignalChangeDates({ current_date: scRes.data.current_date, previous_date: scRes.data.previous_date });
          } else {
            setSignalChangeDates(null);
          }
        } catch {
          setSignalChanges([]);
          setSignalChangeDates(null);
        }
      } catch { setError("Failed to load report."); }
      finally  { setLoadingReport(false); }
    })();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId]);

  const counts = useMemo(() => {
    const c: Record<FilterSignal, number> = { ALL: tickers.length, LONG: 0, SHORT: 0, NEUTRAL: 0 };
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
    <Box sx={{ minHeight: "100vh", bgcolor: "#f8f9fc" }}>

      {/* ── Header (full-width dark bg, content constrained) ─────── */}
      <Box sx={{ background: "linear-gradient(160deg,#4527a0 0%,#6a4fb8 55%,#5835a8 100%)", pb: 4 }}>
        <Box sx={{ maxWidth: 1400, mx: "auto", px: PX }}>

          {/* Top bar: subtitle left, dropdown right */}
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", pt: 2, pb: 1 }}>
            <Typography sx={{ color: "rgba(255,255,255,0.75)", fontSize: "0.7rem", letterSpacing: 1.5, textTransform: "uppercase", fontWeight: 600 }}>
              Gator Academic Framework · US IPOs · 90-Day Lookback
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

          {/* Centered Title + Chat Button */}
          <Box sx={{ textAlign: "center", mt: 1.5, mb: 3 }}>
            <Box sx={{ display: "inline-flex", alignItems: "center", gap: 1.5, mb: 0.6 }}>
              <Typography sx={{ color: "#fff", fontWeight: 900, fontSize: { xs: "1.5rem", md: "2rem" }, letterSpacing: -0.5 }}>
                Gator IPO Analysis
              </Typography>
              <Box
                onClick={() => setChatOpen(true)}
                sx={{
                  display: "inline-flex", alignItems: "center", gap: 0.8,
                  px: 1.8, py: 0.55, borderRadius: 5,
                  background: "linear-gradient(135deg, rgba(124,77,255,0.35), rgba(255,255,255,0.15))",
                  border: "1px solid rgba(124,77,255,0.5)",
                  cursor: "pointer",
                  position: "relative",
                  overflow: "hidden",
                  boxShadow: "0 0 20px rgba(124,77,255,0.25), inset 0 1px 0 rgba(255,255,255,0.15)",
                  "&:hover": {
                    background: "linear-gradient(135deg, rgba(124,77,255,0.5), rgba(255,255,255,0.22))",
                    boxShadow: "0 0 30px rgba(124,77,255,0.4), inset 0 1px 0 rgba(255,255,255,0.2)",
                    transform: "translateY(-1px)",
                  },
                  transition: "all 0.25s ease",
                  // Shimmer animation
                  "&::before": {
                    content: '""',
                    position: "absolute",
                    top: 0, left: "-100%",
                    width: "200%", height: "100%",
                    background: "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.08) 45%, rgba(255,255,255,0.2) 50%, rgba(255,255,255,0.08) 55%, transparent 100%)",
                    animation: "shimmer 3s ease-in-out infinite",
                  },
                  "@keyframes shimmer": {
                    "0%": { left: "-100%" },
                    "100%": { left: "100%" },
                  },
                }}
              >
                <SmartToyOutlinedIcon sx={{ fontSize: 16, color: "#e0d0ff", filter: "drop-shadow(0 0 4px rgba(124,77,255,0.6))" }} />
                <Typography sx={{ fontSize: "0.74rem", fontWeight: 700, color: "#fff", whiteSpace: "nowrap", letterSpacing: 0.3 }}>
                  Gator Analyst
                </Typography>
                <Box sx={{
                  width: 6, height: 6, borderRadius: "50%",
                  bgcolor: "#69f0ae",
                  boxShadow: "0 0 6px #69f0ae, 0 0 12px rgba(105,240,174,0.4)",
                  animation: "pulse 2s ease-in-out infinite",
                  "@keyframes pulse": {
                    "0%, 100%": { opacity: 1, transform: "scale(1)" },
                    "50%": { opacity: 0.6, transform: "scale(0.8)" },
                  },
                }} />
              </Box>
            </Box>
            {report && (
              <Typography sx={{ color: "rgba(255,255,255,0.7)", fontSize: "0.73rem", fontWeight: 500 }}>
                {new Date(report.report_date).toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" })}
                {" · "}{report.total_eligible_ipos} eligible · {report.total_analyzed} analyzed
              </Typography>
            )}
          </Box>

          {/* Market Outlook (left 65%) + Metric Cards 2x2 (right 35%) */}
          {report && (
            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "65fr 35fr" }, gap: 1.5, alignItems: "start" }}>

              {/* Left: Market Outlook — compact, no overflow */}
              <Box sx={{
                position: "relative", px: 2.5, py: 1.8, borderRadius: 2,
                background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)",
                overflow: "hidden",
              }}>
                <Box sx={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 4, background: tempMeta.gradient }} />
                <Typography sx={{ fontSize: "0.65rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: 2, color: "rgba(255,255,255,0.75)", mb: 1 }}>
                  Market Outlook
                </Typography>
                <Typography sx={{ color: "#fff", fontSize: "0.9rem", lineHeight: 1.9, fontWeight: 400 }}>
                  {marketEnv.market_commentary || "No market commentary available."}
                </Typography>
              </Box>

              {/* Right: 4 Metric Cards in 2x2 grid — compact */}
              <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1 }}>
                {METRIC_CARDS.map(card => {
                  const infoBtn = (
                    <Tooltip
                      title={
                        <Box sx={{ p: 1 }}>
                          <Typography sx={{ fontSize: "0.8rem", fontWeight: 700, color: "#fff", mb: 0.8 }}>{card.label}</Typography>
                          <Typography sx={{ fontSize: "0.78rem", lineHeight: 1.7, color: "rgba(255,255,255,0.9)" }}>{card.tooltip}</Typography>
                        </Box>
                      }
                      arrow
                      placement="left"
                      componentsProps={{
                        tooltip: { sx: { bgcolor: "#1a1a2e", maxWidth: 340, borderRadius: 2.5, py: 1.5, px: 2, boxShadow: "0 8px 32px rgba(0,0,0,0.4)", border: "1px solid rgba(255,255,255,0.1)" } },
                        arrow: { sx: { color: "#1a1a2e" } },
                      }}
                    >
                      <InfoOutlinedIcon sx={{
                        position: "absolute", top: 5, right: 5,
                        fontSize: 13, color: "rgba(255,255,255,0.4)",
                        cursor: "pointer",
                        "&:hover": { color: "#fff" },
                        transition: "color 0.15s",
                      }} />
                    </Tooltip>
                  );

                  if (card.isTemperature) {
                    return (
                      <Box key={card.key} sx={{ position: "relative", background: tempMeta.gradient, borderRadius: 2, px: 1.5, py: 1, textAlign: "center", boxShadow: "0 2px 12px rgba(0,0,0,0.2)" }}>
                        {infoBtn}
                        <Typography sx={{ fontSize: "1rem", lineHeight: 1 }}>{tempMeta.icon}</Typography>
                        <Typography sx={{ color: "#fff", fontWeight: 900, fontSize: "1.15rem", mt: 0.2, letterSpacing: -0.5 }}>{tempMeta.label}</Typography>
                        <Typography sx={{ color: "rgba(255,255,255,0.6)", fontSize: "0.55rem", textTransform: "uppercase", letterSpacing: 0.7, mt: 0.2 }}>Market Conditions</Typography>
                      </Box>
                    );
                  }
                  const raw = marketEnv[card.key];
                  const val = typeof raw === "number" ? card.fmt(raw) : "—";
                  return (
                    <Box key={card.key} sx={{ position: "relative", background: card.gradient, borderRadius: 2, px: 1.5, py: 1, textAlign: "center", boxShadow: "0 2px 12px rgba(0,0,0,0.2)" }}>
                      {infoBtn}
                      <Typography sx={{ fontSize: "0.95rem", lineHeight: 1 }}>{card.icon}</Typography>
                      <Typography sx={{ color: "#fff", fontWeight: 900, fontSize: "1.15rem", mt: 0.2, letterSpacing: -0.5 }}>{val}</Typography>
                      <Typography sx={{ color: "rgba(255,255,255,0.6)", fontSize: "0.55rem", textTransform: "uppercase", letterSpacing: 0.7, mt: 0.2 }}>{card.label}</Typography>
                    </Box>
                  );
                })}
              </Box>

            </Box>
          )}

        </Box>
      </Box>

      {/* ── Bridge zone: pulls up into header with negative margin ── */}
      <Box sx={{ maxWidth: 1400, mx: "auto", px: PX, mt: -2, position: "relative", zIndex: 2 }}>

        {/* Unified control bar — criteria toggle + filters + search in one row */}
        <Paper
          elevation={0}
          sx={{
            borderRadius: 3,
            border: "1px solid #e8e8e8",
            boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
            bgcolor: "#fff",
            mb: 2,
            p: 0,
            overflow: "hidden",
          }}
        >
          {/* Criteria left | Filters centered | Search right */}
          <Box sx={{ display: "flex", alignItems: "center", px: 2, py: 1.2 }}>
            {/* Left: Criteria toggle */}
            <Tooltip title="View the analysis criteria and scoring methodology" placement="bottom" arrow>
              <Box
                onClick={() => setCriteriaOpen(!criteriaOpen)}
                sx={{
                  display: "flex", alignItems: "center", gap: 0.8, cursor: "pointer",
                  px: 1.5, py: 0.6, borderRadius: 1.5,
                  bgcolor: criteriaOpen ? "#4527a0" : "#f8f6ff",
                  border: criteriaOpen ? "1px solid #4527a0" : "1px solid #e0d6f5",
                  "&:hover": { bgcolor: criteriaOpen ? "#5e35b1" : "#ede7f6" },
                  transition: "all 0.2s",
                }}
              >
                <InfoOutlinedIcon sx={{ fontSize: 14, color: criteriaOpen ? "#fff" : "#7c4dff" }} />
                <Typography sx={{ fontSize: "0.7rem", fontWeight: 700, color: criteriaOpen ? "#fff" : "#4527a0", whiteSpace: "nowrap" }}>
                  Analysis Criteria & Methodology
                </Typography>
                <KeyboardArrowDownIcon sx={{
                  fontSize: 15, color: criteriaOpen ? "#fff" : "#7c4dff",
                  transition: "transform 0.25s", transform: criteriaOpen ? "rotate(180deg)" : "rotate(0deg)",
                }} />
              </Box>
            </Tooltip>

            {/* Center: Filter chips — pushed to center with flex spacers */}
            <Box sx={{ flex: 1, display: "flex", justifyContent: "center", gap: 1 }}>
              {(["ALL", "LONG", "SHORT", "NEUTRAL"] as FilterSignal[]).map(sig => {
                const active = filter === sig;
                const cfg = SIGNAL_CONFIG[sig];
                const count = counts[sig];
                return (
                  <Box
                    key={sig}
                    onClick={() => setFilter(sig)}
                    sx={{
                      display: "flex", alignItems: "center", gap: 0.5,
                      px: 1.6, py: 0.45, borderRadius: 5, cursor: "pointer", userSelect: "none",
                      transition: "all 0.15s",
                      bgcolor: active ? (cfg ? cfg.bg : "#ede7f6") : "transparent",
                      border: active ? `1.5px solid ${cfg ? cfg.color : "#481f93"}` : "1.5px solid transparent",
                      "&:hover": { bgcolor: active ? undefined : "#f5f5f5" },
                    }}
                  >
                    {sig !== "ALL" && <Box sx={{ width: 6, height: 6, borderRadius: "50%", bgcolor: cfg?.color ?? "#481f93" }} />}
                    <Typography sx={{ fontSize: "0.74rem", fontWeight: active ? 800 : 600, color: active ? (cfg?.color ?? "#481f93") : "#666" }}>
                      {sig}
                    </Typography>
                    <Typography sx={{ fontSize: "0.68rem", fontWeight: 700, color: active ? (cfg?.color ?? "#481f93") : "#bbb" }}>
                      {count}
                    </Typography>
                  </Box>
                );
              })}

              {/* Signal Change chip */}
              <Box sx={{ width: "1px", height: 18, bgcolor: "#ddd", mx: 0.5 }} />
              <Tooltip title={signalChangeDates ? "Tickers whose signal changed from the previous report" : "No previous report available to compare"} placement="bottom" arrow>
                <Box
                  onClick={() => signalChangeDates && setSignalChangeOpen(true)}
                  sx={{
                    display: "flex", alignItems: "center", gap: 0.5,
                    px: 1.6, py: 0.45, borderRadius: 5,
                    cursor: signalChangeDates ? "pointer" : "default",
                    userSelect: "none",
                    transition: "all 0.15s",
                    opacity: signalChangeDates ? 1 : 0.5,
                    bgcolor: signalChanges.length > 0 ? "#ede7f6" : "transparent",
                    border: signalChanges.length > 0 ? "1.5px solid #7c4dff" : "1.5px solid transparent",
                    "&:hover": signalChangeDates ? { bgcolor: "#f3e8ff" } : {},
                  }}
                >
                  <SwapHorizIcon sx={{ fontSize: 14, color: "#7c4dff" }} />
                  <Typography sx={{ fontSize: "0.74rem", fontWeight: 700, color: "#5e35b1" }}>
                    SIGNAL CHANGE
                  </Typography>
                  <Typography sx={{ fontSize: "0.68rem", fontWeight: 700, color: signalChanges.length > 0 ? "#7c4dff" : "#bbb" }}>
                    {signalChanges.length}
                  </Typography>
                </Box>
              </Tooltip>
            </Box>

            {/* Right: Search */}
            <TextField
              size="small"
              placeholder="Search ticker, issuer, sector..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ fontSize: 15, color: "#bbb" }} />
                  </InputAdornment>
                ),
              }}
              sx={{
                width: 240,
                "& .MuiOutlinedInput-root": {
                  borderRadius: 5, fontSize: "0.76rem", bgcolor: "#fafafa",
                  height: 32,
                  "& fieldset": { borderColor: "#eee" },
                  "&:hover fieldset": { borderColor: "#ccc" },
                  "&.Mui-focused fieldset": { borderColor: "#7c4dff" },
                },
              }}
            />
          </Box>

          {/* Expanded criteria content — slides down inside the same card */}
          <Collapse in={criteriaOpen} unmountOnExit>
            <Box sx={{ borderTop: "1px solid #f0f0f0", background: "linear-gradient(180deg, #faf8ff 0%, #fff 100%)" }}>
              <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr 1fr" }, gap: 0 }}>

                {/* Tier Classification */}
                <Box sx={{ p: 3, borderRight: { md: "1px solid #f0edf8" } }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                    <Box sx={{ width: 28, height: 28, borderRadius: 1.5, bgcolor: "#4527a0", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <Typography sx={{ color: "#fff", fontSize: "0.8rem", fontWeight: 900 }}>T</Typography>
                    </Box>
                    <Typography sx={{ fontSize: "0.92rem", fontWeight: 800, color: "#4527a0" }}>Tier Classification</Typography>
                  </Box>

                  <Box sx={{ bgcolor: "#f8f6ff", borderRadius: 2, p: 1.8, mb: 2, border: "1px solid #ede7f6" }}>
                    <Typography sx={{ fontSize: "0.78rem", fontWeight: 700, color: "#5e35b1", mb: 0.8, textTransform: "uppercase", letterSpacing: 0.5 }}>
                      Quality Gate (ALL 5 required for Tier 1)
                    </Typography>
                    {["Revenue Growth >25% YoY", "TAM >$5B, growing >10%", "Tier-1 VC/PE backing", "Profitability path within 24mo", ">20% public float"].map(c => (
                      <Typography key={c} sx={{ fontSize: "0.82rem", color: "#444", lineHeight: 1.9, pl: 0.5 }}>
                        <span style={{ color: "#7c4dff", marginRight: 8 }}>&#10003;</span>{c}
                      </Typography>
                    ))}
                  </Box>

                  <Typography sx={{ fontSize: "0.78rem", fontWeight: 700, color: "#555", mb: 0.8, textTransform: "uppercase", letterSpacing: 0.5 }}>
                    Weighted Scoring (0-100)
                  </Typography>
                  {[
                    ["Upward Price Revision", "+25"],
                    ["Profitability at IPO", "+20"],
                    ["Pre-IPO Revenue >$100M", "+15"],
                    ["Tier-1 Underwriter", "+15"],
                    ["VC/Growth Capital Backing", "+10"],
                    ["Firm Age >10 years", "+10"],
                    ["Dual Class Penalty", "-5"],
                  ].map(([label, pts]) => (
                    <Box key={label} sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", py: 0.3, px: 0.5 }}>
                      <Typography sx={{ fontSize: "0.82rem", color: "#555" }}>{label}</Typography>
                      <Typography sx={{ fontSize: "0.82rem", fontWeight: 800, color: (pts as string).startsWith("-") ? "#c62828" : "#4527a0", fontFamily: "monospace" }}>{pts}</Typography>
                    </Box>
                  ))}

                  <Box sx={{ display: "flex", gap: 0.8, mt: 1.8 }}>
                    {[
                      ["LONG", ">=70 or T1", "#1b5e20", "#e8f5e9"],
                      ["SHORT", "<=35", "#b71c1c", "#fce4ec"],
                      ["NEUTRAL", "36-69", "#e65100", "#fff8e1"],
                    ].map(([sig, rule, color, bg]) => (
                      <Box key={sig} sx={{ flex: 1, textAlign: "center", py: 0.7, borderRadius: 1.5, bgcolor: bg, border: `1px solid ${color}22` }}>
                        <Typography sx={{ fontSize: "0.76rem", fontWeight: 800, color: color }}>{sig}</Typography>
                        <Typography sx={{ fontSize: "0.68rem", color: color, opacity: 0.7 }}>{rule}</Typography>
                      </Box>
                    ))}
                  </Box>
                </Box>

                {/* AM Opportunity */}
                <Box sx={{ p: 3, borderRight: { md: "1px solid #f0edf8" } }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                    <Box sx={{ width: 28, height: 28, borderRadius: 1.5, bgcolor: "#00695c", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <Typography sx={{ color: "#fff", fontSize: "0.8rem", fontWeight: 900 }}>A</Typography>
                    </Box>
                    <Typography sx={{ fontSize: "0.92rem", fontWeight: 800, color: "#00695c" }}>AM Opportunity</Typography>
                    <Chip label="5pt" size="small" sx={{ height: 20, fontSize: "0.7rem", fontWeight: 800, bgcolor: "#e0f2f1", color: "#00695c" }} />
                  </Box>

                  {[
                    "First-day pop 5-40%",
                    "Volume >2x post-IPO (ex-Day 1)",
                    "5+ analyst initiations in 30 days",
                    "Short interest <15% of float",
                    "Above IPO price 10+ days",
                  ].map((c, i) => (
                    <Box key={c} sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.7 }}>
                      <Box sx={{ width: 22, height: 22, borderRadius: "50%", bgcolor: "#e0f2f1", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <Typography sx={{ fontSize: "0.72rem", fontWeight: 800, color: "#00695c" }}>{i + 1}</Typography>
                      </Box>
                      <Typography sx={{ fontSize: "0.82rem", color: "#333" }}>{c}</Typography>
                    </Box>
                  ))}

                  <Box sx={{ mt: 1.5, mb: 2, py: 0.5, px: 1.2, bgcolor: "#e0f2f1", borderRadius: 1, display: "inline-block" }}>
                    <Typography sx={{ fontSize: "0.76rem", fontWeight: 700, color: "#00695c" }}>
                      Score &gt;=3 = AM Opportunity Active
                    </Typography>
                  </Box>

                  <Typography sx={{ fontSize: "0.78rem", fontWeight: 700, color: "#555", mb: 0.8, textTransform: "uppercase", letterSpacing: 0.5 }}>Time Windows</Typography>
                  {[
                    ["D1-5", "Long moderate pop for large profitable issuers"],
                    ["D25-45", "Short low-quality on quiet period pop"],
                    ["D150-200", "Avoid pre-lockup; Buy post-expiry"],
                  ].map(([w, d]) => (
                    <Box key={w} sx={{ display: "flex", gap: 1, mb: 0.5, alignItems: "baseline" }}>
                      <Typography sx={{ fontSize: "0.72rem", fontWeight: 800, color: "#fff", bgcolor: "#00695c", px: 0.8, py: 0.15, borderRadius: 0.5, whiteSpace: "nowrap" }}>{w}</Typography>
                      <Typography sx={{ fontSize: "0.8rem", color: "#444" }}>{d}</Typography>
                    </Box>
                  ))}
                </Box>

                {/* Technical Signals */}
                <Box sx={{ p: 3 }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                    <Box sx={{ width: 28, height: 28, borderRadius: 1.5, bgcolor: "#2e7d32", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <Typography sx={{ color: "#fff", fontSize: "0.8rem", fontWeight: 900 }}>S</Typography>
                    </Box>
                    <Typography sx={{ fontSize: "0.92rem", fontWeight: 800, color: "#2e7d32" }}>Technical Signals</Typography>
                  </Box>

                  <Box sx={{ bgcolor: "#f1f8e9", borderRadius: 2, p: 1.8, mb: 2, border: "1px solid #dcedc8" }}>
                    <Typography sx={{ fontSize: "0.78rem", fontWeight: 700, color: "#33691e", mb: 0.6, textTransform: "uppercase", letterSpacing: 0.5 }}>
                      Short-term (Day 5-20)
                    </Typography>
                    {["Break above Day 1 high", "Volume 1.5x+ avg (ex-Day 1)", "Momentum after first-week volatility"].map(c => (
                      <Typography key={c} sx={{ fontSize: "0.82rem", color: "#444", lineHeight: 1.9, pl: 0.5 }}>
                        <span style={{ color: "#4caf50", marginRight: 8 }}>&#9679;</span>{c}
                      </Typography>
                    ))}
                  </Box>

                  <Typography sx={{ fontSize: "0.78rem", fontWeight: 700, color: "#555", mb: 0.8, textTransform: "uppercase", letterSpacing: 0.5 }}>
                    Longer-term
                  </Typography>
                  {[
                    ["Volume", "Confirming on breakout = accumulation"],
                    ["vs FPX ETF", "Relative strength vs IPO index"],
                    ["Short Int.", "Rising + high insider = risk flag"],
                    ["MA Cross", "10d > 40d for Long signal"],
                  ].map(([label, desc]) => (
                    <Box key={label} sx={{ display: "flex", gap: 0.8, mb: 0.5, alignItems: "baseline" }}>
                      <Typography sx={{ fontSize: "0.78rem", fontWeight: 800, color: "#2e7d32", minWidth: 60 }}>{label}</Typography>
                      <Typography sx={{ fontSize: "0.8rem", color: "#555" }}>{desc}</Typography>
                    </Box>
                  ))}

                  <Box sx={{ mt: 2, py: 0.8, px: 1.2, bgcolor: "#f5f5f5", borderRadius: 1.5, border: "1px solid #eee" }}>
                    <Typography sx={{ fontSize: "0.76rem", fontWeight: 700, color: "#444" }}>
                      NYSE/NASDAQ | Offer &gt;=$5 | Cap &gt;=$200M
                    </Typography>
                    <Typography sx={{ fontSize: "0.72rem", color: "#888", mt: 0.3 }}>
                      Excl. SPACs, ADRs, REITs, closed-end funds
                    </Typography>
                  </Box>
                </Box>

              </Box>
            </Box>
          </Collapse>
        </Paper>
      </Box>

      {/* ── Table area ──────────────────────────────────────────── */}
      <Box sx={{ maxWidth: 1400, mx: "auto", px: PX }}>

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
                  <TableRow sx={{ "& th": { bgcolor: "#5e35b1", color: "#fff", fontWeight: 800, fontSize: "0.68rem", textTransform: "uppercase", letterSpacing: 0.8, py: 1.3, borderBottom: "none" } }}>
                    <TableCell sx={{ bgcolor: "#5e35b1 !important", width: 36 }} />
                    <TableCell sx={{ bgcolor: "#5e35b1 !important" }}>
                      <TableSortLabel active={sortField === "ticker"} direction={sortDir} onClick={() => handleSort("ticker")}
                        sx={{ color: "#fff !important", "& .MuiTableSortLabel-icon": { color: "rgba(255,255,255,0.6) !important" } }}>
                        Ticker
                      </TableSortLabel>
                    </TableCell>
                    <TableCell sx={{ bgcolor: "#5e35b1 !important" }}>Issuer</TableCell>
                    <TableCell sx={{ bgcolor: "#5e35b1 !important" }}>Sector</TableCell>
                    <TableCell align="center" sx={{ bgcolor: "#5e35b1 !important" }}>
                      <TableSortLabel active={sortField === "days_since_ipo"} direction={sortDir} onClick={() => handleSort("days_since_ipo")}
                        sx={{ color: "#fff !important", "& .MuiTableSortLabel-icon": { color: "rgba(255,255,255,0.6) !important" } }}>
                        Days
                      </TableSortLabel>
                    </TableCell>
                    <TableCell align="center" sx={{ bgcolor: "#5e35b1 !important" }}>Tier</TableCell>
                    <TableCell align="center" sx={{ bgcolor: "#5e35b1 !important" }}>
                      <TableSortLabel active={sortField === "overall_signal"} direction={sortDir} onClick={() => handleSort("overall_signal")}
                        sx={{ color: "#fff !important", "& .MuiTableSortLabel-icon": { color: "rgba(255,255,255,0.6) !important" } }}>
                        Final Signal
                      </TableSortLabel>
                    </TableCell>
                    <TableCell sx={{ bgcolor: "#5e35b1 !important" }}>Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {visible.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} align="center" sx={{ py: 8, color: "#888", fontSize: "0.9rem", fontWeight: 500 }}>
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

        <Typography sx={{ fontSize: "0.68rem", color: "#888", pb: 3, fontWeight: 500 }}>
          Showing {visible.length} of {tickers.length} IPOs · Click any row to expand full analysis
        </Typography>

      </Box>

      {/* Signal Changes Dialog */}
      <Dialog
        open={signalChangeOpen}
        onClose={() => setSignalChangeOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3, overflow: "hidden" } }}
      >
        <DialogTitle sx={{
          background: "linear-gradient(135deg, #4527a0 0%, #7c4dff 100%)",
          color: "#fff",
          display: "flex",
          alignItems: "center",
          gap: 1,
          py: 1.8,
        }}>
          <SwapHorizIcon sx={{ fontSize: 22 }} />
          <Box>
            <Typography sx={{ fontSize: "1rem", fontWeight: 700 }}>Signal Changes</Typography>
            {signalChangeDates && (
              <Typography sx={{ fontSize: "0.72rem", opacity: 0.85, fontWeight: 500 }}>
                {signalChangeDates.previous_date} &rarr; {signalChangeDates.current_date}
              </Typography>
            )}
          </Box>
        </DialogTitle>
        <DialogContent sx={{ p: 0 }}>
          {signalChanges.length === 0 ? (
            <Box sx={{ py: 5, textAlign: "center" }}>
              <Typography sx={{ color: "#999", fontSize: "0.88rem" }}>
                No signal changes detected between reports.
              </Typography>
            </Box>
          ) : (
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ bgcolor: "#f8f6ff" }}>
                    <TableCell sx={{ fontWeight: 800, fontSize: "0.72rem", color: "#4527a0", textTransform: "uppercase", letterSpacing: 0.5 }}>Ticker</TableCell>
                    <TableCell sx={{ fontWeight: 800, fontSize: "0.72rem", color: "#4527a0", textTransform: "uppercase", letterSpacing: 0.5 }}>Issuer</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 800, fontSize: "0.72rem", color: "#4527a0", textTransform: "uppercase", letterSpacing: 0.5 }}>
                      Previous ({signalChangeDates?.previous_date})
                    </TableCell>
                    <TableCell align="center" sx={{ fontWeight: 800, fontSize: "0.72rem", color: "#4527a0", textTransform: "uppercase", letterSpacing: 0.5 }}>
                      Current ({signalChangeDates?.current_date})
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {signalChanges.map((sc) => {
                    const prevCfg = SIGNAL_CONFIG[sc.previous_signal];
                    const curCfg  = SIGNAL_CONFIG[sc.current_signal];
                    return (
                      <TableRow key={sc.ticker} sx={{ "&:hover": { bgcolor: "#faf8ff" } }}>
                        <TableCell sx={{ fontWeight: 700, fontSize: "0.82rem", color: "#4527a0" }}>{sc.ticker}</TableCell>
                        <TableCell sx={{ fontSize: "0.76rem", color: "#555", maxWidth: 180, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {sc.issuer_name}
                        </TableCell>
                        <TableCell align="center">
                          <Chip
                            label={sc.previous_signal}
                            size="small"
                            sx={{
                              fontWeight: 700, fontSize: "0.68rem",
                              bgcolor: prevCfg?.bg ?? "#f5f5f5",
                              color: prevCfg?.color ?? "#666",
                              height: 22,
                            }}
                          />
                        </TableCell>
                        <TableCell align="center">
                          <Chip
                            label={sc.current_signal}
                            size="small"
                            sx={{
                              fontWeight: 700, fontSize: "0.68rem",
                              bgcolor: curCfg?.bg ?? "#f5f5f5",
                              color: curCfg?.color ?? "#666",
                              height: 22,
                            }}
                          />
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 2.5, py: 1.5, borderTop: "1px solid #f0f0f0" }}>
          <Button onClick={() => setSignalChangeOpen(false)} sx={{ color: "#4527a0", fontWeight: 600, fontSize: "0.78rem", textTransform: "none" }}>
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Chat Drawer */}
      {report && (
        <JayRitterChat
          open={chatOpen}
          onClose={() => setChatOpen(false)}
          reportDate={report.report_date}
        />
      )}
    </Box>
  );
};

export default JayRitterIPOAnalysis;
