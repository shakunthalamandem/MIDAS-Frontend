import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import {
  Box,
  Container,
  CircularProgress,
  Alert,
  Typography,
  IconButton,
  TextField,
  MenuItem,
  Select,
  FormControl,
  Button,
  Collapse,
  Tooltip,
  Checkbox,
  OutlinedInput,
  Divider,
  ListItemText,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import TuneIcon from "@mui/icons-material/Tune";
import "./RiskTriggers.css";

const apiUrl = process.env.REACT_APP_API_URL;

const getAuthHeaders = (contentType?: string) => {
  const token = localStorage.getItem("access_token");
  const headers: Record<string, string> = { Authorization: `Bearer ${token}` };
  if (contentType) headers["Content-Type"] = contentType;
  return headers;
};

/* ── All-Funds config (excludes retired funds) ── */
const RETIRED_FUNDS = new Set(["FMAP", "MMLS"]);
const ALL_FUNDS_CONFIG_KEY = "risk_all_funds_config";
const loadAllFundsConfig = (): string[] | null => {
  try { const raw = localStorage.getItem(ALL_FUNDS_CONFIG_KEY); return raw ? JSON.parse(raw) : null; } catch { return null; }
};

/* ── Types ── */
interface LimitRow { top_10_issuers: string; delta_adjusted_net_exposure: string; }
interface LimitSectionData { title: string; data: LimitRow[]; }
interface SectionData { title: string; guideline?: number; data: Record<string, any>[]; }
interface TriggersResponse { limits: Record<string, LimitSectionData>; current_levels: Record<string, SectionData>; }

/* ── Guideline config ── */
interface GuidelineField { key: string; label: string; defaultValue: number; }

const GUIDELINE_FIELDS: GuidelineField[] = [
  { key: "delta_gross_exposure", label: "Delta Gross Exposure (%)", defaultValue: 175 },
  { key: "equity_delta_net_exposure", label: "Delta Net Exposure (%)", defaultValue: 50 },
  { key: "equity_beta_net_exposure", label: "Beta Adj Net Exposure (%)", defaultValue: 20 },
  { key: "drawdown", label: "Drawdown (%)", defaultValue: 8 },
  { key: "var_99", label: "VaR 99% (%)", defaultValue: 2 },
  { key: "top_10_issuer_guideline", label: "Top 10 Issuer Guideline (%)", defaultValue: 80 },
  { key: "issuer_delta_net_exposure", label: "Single Issuer Limit (%)", defaultValue: 30 },
  { key: "sector_threshold", label: "Sector Limit (%)", defaultValue: 25 },
  { key: "country_threshold", label: "Country Limit (%)", defaultValue: 25 },
  { key: "liquidity_1d_pct", label: "Liquidity 1-Day Target (%)", defaultValue: 20 },
  { key: "liquidity_5d_pct", label: "Liquidity 5-Day Target (%)", defaultValue: 60 },
  { key: "liquidity_20d_pct", label: "Liquidity 20-Day Target (%)", defaultValue: 95 },
];

const getStorageKey = (funds: string[]) => `risk_guidelines_${[...funds].sort().join("_")}`;
const loadSavedGuidelines = (funds: string[]): Record<string, number> | null => {
  try { const raw = localStorage.getItem(getStorageKey(funds)); return raw ? JSON.parse(raw) : null; } catch { return null; }
};
const saveGuidelinesToStorage = (funds: string[], guidelines: Record<string, number>) => {
  localStorage.setItem(getStorageKey(funds), JSON.stringify(guidelines));
};

/* ── Section config ── */
interface SectionConfig { firstColKey: string; firstColLabel: string; valueKey: string; valueLabel: string; summaryLabel?: string; }

const SECTION_CONFIG: Record<string, SectionConfig> = {
  delta_gross_exposure: { firstColKey: "fund", firstColLabel: "Fund", valueKey: "delta_adjusted_gross_exposure", valueLabel: "Delta Adjusted Gross Exposure", summaryLabel: "Delta Gross Exposure" },
  equity_delta_net_exposure: { firstColKey: "fund", firstColLabel: "Fund", valueKey: "delta_adjusted_net_exposure", valueLabel: "Delta Adjusted Net Exposure", summaryLabel: "Delta Net Exposure" },
  equity_beta_net_exposure: { firstColKey: "fund", firstColLabel: "Fund", valueKey: "beta_net_exposure", valueLabel: "Beta Net Exposure", summaryLabel: "Beta Adj Net Exposure" },
  drawdown: { firstColKey: "fund", firstColLabel: "Fund", valueKey: "drawdown", valueLabel: "Drawdown", summaryLabel: "Drawdown" },
  var_99: { firstColKey: "fund", firstColLabel: "Fund", valueKey: "var", valueLabel: "VaR", summaryLabel: "VaR (99%)" },
  top_10_issuer_total: { firstColKey: "fund", firstColLabel: "Fund", valueKey: "top_10_total", valueLabel: "Top 10 Issuer Delta Net Exposure", summaryLabel: "Top 10 Issuer Delta Net Exposure" },
  issuer_max_exposure: { firstColKey: "issuer", firstColLabel: "Issuer", valueKey: "max_issuer_exposure", valueLabel: "Max Single Issuer Exposure", summaryLabel: "Individual Issuers" },
  top_10_issuer_delta_net_exposure: { firstColKey: "issuer", firstColLabel: "Issuer", valueKey: "delta_adjusted_net_exposure", valueLabel: "Delta Adjusted Net Exposure" },
  issuer_delta_net_exposure: { firstColKey: "issuer", firstColLabel: "Issuer", valueKey: "delta_adjusted_net_exposure", valueLabel: "Delta Adjusted Net Exposure" },
  sector_exposure: { firstColKey: "sector", firstColLabel: "Sector", valueKey: "delta_adjusted_net_exposure", valueLabel: "Delta Adjusted Net Exposure" },
  country_exposure: { firstColKey: "country", firstColLabel: "Country", valueKey: "delta_adjusted_net_exposure", valueLabel: "Delta Adjusted Net Exposure" },
  liquidity: { firstColKey: "fund", firstColLabel: "Fund", valueKey: "liquidity_waterfall", valueLabel: "Liquidity (Waterfall)" },
};

/* ── Helpers ── */
const parseNumericValue = (val: string | number | undefined): number => {
  if (val == null) return 0;
  if (typeof val === "number") return val;
  return parseFloat(val.replace("%", "")) || 0;
};
const parseSignedNumericValue = (val: string | number | undefined): number => {
  if (val == null) return 0;
  if (typeof val === "number") return val;
  return parseFloat(String(val).replace("%", "").replace(/,/g, "")) || 0;
};

type Status = "breach" | "warning" | "safe";

const getStatus = (value: number, guideline: number | undefined): Status => {
  if (!guideline) return "safe";
  const absVal = Math.abs(value);
  if (absVal >= guideline) return "breach";
  if (absVal >= guideline * 0.8) return "warning";
  return "safe";
};

const shiftDate = (dateStr: string, days: number): string => {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + days);
  return d.toISOString().split("T")[0];
};

const SUMMARY_KEYS = ["delta_gross_exposure", "equity_delta_net_exposure", "equity_beta_net_exposure", "drawdown", "var_99", "top_10_issuer_total", "issuer_max_exposure"];

const SUMMARY_CARD_INFO: Record<string, { definition: string; formula: string; notes?: string }> = {
  delta_gross_exposure: {
    definition: "Gross Market Value = Sum of absolute position exposures (long + short), showing total portfolio size without netting.",
    formula: "Delta Gross Exposure = Σ | Position Exposure | / AUM",
  },
  equity_delta_net_exposure: {
    definition: "Measures the net exposure of the portfolio to equity movements after adjusting positions by their delta.",
    formula: "Delta Adjusted Net Exposure = Σ(Position Exposure × Δ) / AUM",
    notes: "Delta values are sourced on a weekly basis from B Source. Proxy assumptions: 0.5 for convertible bonds, 0.25 for equity calls, -0.25 for equity puts, and 1 for high yield instruments. For equities, delta is assumed to be 1.",
  },
  equity_beta_net_exposure: {
    definition: "Measures the portfolio's sensitivity to overall market movements after adjusting for both delta and beta.",
    formula: "Beta Adjusted Net Exposure = Σ(Position Exposure × Δ × β) / AUM",
    notes: "Beta values are sourced daily from B Source over a 1-month period using SPY Equity as benchmark. Beta is capped at ±2.5. Proxy beta of 0.4 for convertible bonds and 0.25 for high yield instruments.",
  },
  drawdown: {
    definition: "Represents the decline in portfolio value from its peak to the current level, indicating the magnitude of loss experienced.",
    formula: "Drawdown = (Peak Value — Current Value) / Peak Value",
  },
  var_99: {
    definition: "Estimates the maximum expected loss at a 99% confidence level, meaning there is only a 1% probability that losses will exceed this level over the specified time horizon.",
    formula: "VaR (99%) = | PERCENTILE.INC(Returns, 0.01) | × √T\n(Where T = time horizon, e.g., 252 for 1 year)",
  },
  top_10_issuer_total: {
    definition: "Aggregate absolute delta-adjusted net exposure of the top 10 issuers as a percentage of AUM.",
    formula: "Top 10 Issuer Total = Σ|Issuer Δ Net Exposure (top 10)| / AUM",
  },
  issuer_max_exposure: {
    definition: "Largest single-issuer delta-adjusted net exposure in the fund, shown against the per-issuer limit.",
    formula: "Max Single Issuer = MAX(|Issuer Δ Net Exposure|) / AUM",
  },
};
const EXPOSURE_KEYS = new Set(["top_10_issuer_delta_net_exposure", "issuer_delta_net_exposure"]);

/* ── Merge helpers ── */

/**
 * Aggregate issuer-keyed rows across funds: sum their numeric exposures
 * and keep only the top 10 by absolute value, plus a Total row.
 */
const aggregateIssuerRows = (rows: Record<string, any>[], valueKey: string, guideline: number | undefined): Record<string, any>[] => {
  const issuerMap: Record<string, { tickers: Set<string>; total: number }> = {};
  for (const row of rows) {
    const iss = (row.issuer || "").trim();
    if (!iss || iss === "Total") continue;
    const num = parseSignedNumericValue(row[valueKey]);
    if (!issuerMap[iss]) issuerMap[iss] = { tickers: new Set(), total: 0 };
    issuerMap[iss].total += num;
    if (row.ticker) for (const t of String(row.ticker).split(",")) { const trimmed = t.trim(); if (trimmed) issuerMap[iss].tickers.add(trimmed); }
  }
  const sorted = Object.entries(issuerMap)
    .sort(([, a], [, b]) => Math.abs(b.total) - Math.abs(a.total));
  const top10 = sorted.slice(0, 10);
  let grandTotal = 0;
  const result = top10.map(([iss, data]) => {
    grandTotal += data.total;
    return {
      issuer: iss,
      ticker: Array.from(data.tickers).join(", "),
      [valueKey]: `${Math.round(data.total * 100) / 100}%`,
      guideline: guideline,
    };
  });
  result.push({
    issuer: "Total",
    ticker: "",
    [valueKey]: `${Math.round(grandTotal * 100) / 100}%`,
    guideline: guideline,
  });
  return result;
};

const mergeResponses = (responses: TriggersResponse[]): TriggersResponse => {
  const merged: TriggersResponse = { limits: {}, current_levels: {} };
  for (const resp of responses) {
    for (const [key, section] of Object.entries(resp.limits || {})) {
      if (!merged.limits[key]) merged.limits[key] = { title: section.title, data: [...(section.data || [])] };
      else merged.limits[key].data = [...merged.limits[key].data, ...(section.data || [])];
    }
    for (const [key, section] of Object.entries(resp.current_levels || {})) {
      if (!merged.current_levels[key]) {
        merged.current_levels[key] = { title: section.title, guideline: section.guideline, data: [...(section.data || [])] };
      } else {
        if (section.guideline != null) merged.current_levels[key].guideline = Math.max(merged.current_levels[key].guideline ?? 0, section.guideline);
        merged.current_levels[key].data = [...merged.current_levels[key].data, ...(section.data || [])];
      }
    }
  }

  // For multi-fund merges, aggregate issuer exposure sections to avoid duplicates
  if (responses.length > 1) {
    for (const key of Array.from(EXPOSURE_KEYS)) {
      const section = merged.current_levels[key];
      if (section && section.data.length > 0) {
        const valueKey = SECTION_CONFIG[key]?.valueKey || "delta_adjusted_net_exposure";
        section.data = aggregateIssuerRows(section.data, valueKey, section.data[0]?.guideline);
      }
    }
  }

  return merged;
};

/* ── Circular Gauge SVG ── */
const CircularGauge: React.FC<{ ratio: number; status: Status; label: string }> = ({ ratio, status, label }) => {
  const r = 20;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - Math.min(ratio, 1));
  return (
    <Box className="trig-gauge">
      <svg width="48" height="48" viewBox="0 0 48 48">
        <circle cx="24" cy="24" r={r} className="trig-gauge-bg" />
        <circle cx="24" cy="24" r={r} className={`trig-gauge-fill trig-gauge-fill--${status}`} strokeDasharray={circ} strokeDashoffset={offset} />
      </svg>
      <span className="trig-gauge-text">{label}</span>
    </Box>
  );
};

/* ── Component ── */
const RiskTriggers: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const initialFund = searchParams.get("fund") || "";
  const initialDate = searchParams.get("date") || "";

  const [portfolios, setPortfolios] = useState<string[]>([]);
  // Multi-select: list of currently selected fund names
  const initialFundList = useMemo(
    () => (initialFund ? initialFund.split(",").map((s) => s.trim()).filter(Boolean) : []),
    [initialFund],
  );
  const [selectedFundList, setSelectedFundList] = useState<string[]>(initialFundList);
  const [allFundsConfig, setAllFundsConfig] = useState<string[]>([]);
  const [allFundsDraft, setAllFundsDraft] = useState<string[]>([]);
  const [configureAllOpen, setConfigureAllOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(initialDate);
  const [fundResponses, setFundResponses] = useState<Record<string, TriggersResponse>>({});
  const [mergedData, setMergedData] = useState<TriggersResponse | null>(null);
  const [expandedFunds, setExpandedFunds] = useState<Record<string, boolean>>({});
  const [totalExpanded, setTotalExpanded] = useState<boolean>(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [guidelinesExpanded, setGuidelinesExpanded] = useState(false);
  const [editGuidelines, setEditGuidelines] = useState<Record<string, string>>({});
  const [savedGuidelines, setSavedGuidelines] = useState<Record<string, number>>({});
  const [savingGuidelines, setSavingGuidelines] = useState(false);
  const [issuerSearch, setIssuerSearch] = useState("");
  const [sectorSearch, setSectorSearch] = useState("");
  const [countrySearch, setCountrySearch] = useState("");

  // Derived: the actual funds being queried (= the multi-select list)
  const selectedFunds = useMemo(() => selectedFundList, [selectedFundList]);

  const defaultGuidelines = GUIDELINE_FIELDS.reduce<Record<string, number>>((acc, f) => { acc[f.key] = f.defaultValue; return acc; }, {});

  useEffect(() => {
    if (selectedFunds.length === 0) return;
    const saved = loadSavedGuidelines(selectedFunds);
    if (saved) {
      setSavedGuidelines(saved);
      const s: Record<string, string> = {};
      for (const [k, v] of Object.entries(saved)) s[k] = String(v);
      setEditGuidelines(s);
    } else { setSavedGuidelines({}); setEditGuidelines({}); }
  }, [selectedFunds.join(",")]);

  const getActiveGuidelines = useCallback((): Record<string, number> => ({ ...defaultGuidelines, ...savedGuidelines }), [savedGuidelines]);

  useEffect(() => {
    const fetchPortfolios = async () => {
      try {
        const res = await fetch(`${apiUrl}/api/distinct_portfolio_positions/`, { headers: getAuthHeaders() });
        if (!res.ok) throw new Error("Failed to fetch portfolios");
        const result = await res.json();
        const allPortfolios: string[] = result.portfolios || [];
        setPortfolios(allPortfolios);
        if (!selectedDate && result.max_position_date) setSelectedDate(result.max_position_date);
        // Build the "All Funds" config: load saved or default to active (non-retired) funds
        const activeFunds = allPortfolios.filter((p) => !RETIRED_FUNDS.has(p));
        const saved = loadAllFundsConfig();
        const effective = saved ? saved.filter((f) => allPortfolios.includes(f)) : activeFunds;
        setAllFundsConfig(effective);
        setAllFundsDraft(effective);
        // Initial selection: use the URL param fund list if provided, otherwise "All Funds"
        setSelectedFundList((prev) => {
          if (prev.length > 0) return prev.filter((f) => allPortfolios.includes(f));
          return effective;
        });
      } catch (err: any) { setError(err.message || "Failed to load portfolios"); }
    };
    fetchPortfolios();
  }, []);

  const fetchTriggers = useCallback(async () => {
    if (selectedFunds.length === 0 || !selectedDate) return;
    setLoading(true); setError("");
    try {
      // Read guidelines directly from localStorage to avoid stale state after fund change
      const saved = loadSavedGuidelines(selectedFunds);
      const g = { ...defaultGuidelines, ...(saved || {}) };
      const responses = await Promise.all(
        selectedFunds.map(async (fund) => {
          const res = await fetch(`${apiUrl}/api/portfolio_risk_triggers_by_fund/`, {
            method: "POST", headers: getAuthHeaders("application/json"),
            body: JSON.stringify({ date: selectedDate, fund: [fund], guidelines: g }),
          });
          if (!res.ok) { const e = await res.json().catch(() => ({})); throw new Error(e.error || `Failed for ${fund}`); }
          return [fund, (await res.json()) as TriggersResponse] as [string, TriggersResponse];
        })
      );
      const byFund: Record<string, TriggersResponse> = {};
      for (const [fund, resp] of responses) byFund[fund] = resp;
      setFundResponses(byFund);
      setMergedData(mergeResponses(responses.map(([, r]) => r)));
      setExpandedFunds((prev) => {
        const next: Record<string, boolean> = {};
        for (const f of Object.keys(byFund)) next[f] = prev[f] ?? false;
        return next;
      });
    } catch (err: any) { setError(err.message || "Failed to load triggers"); setFundResponses({}); setMergedData(null); }
    finally { setLoading(false); }
  }, [selectedFunds, selectedDate]);

  useEffect(() => { fetchTriggers(); }, [fetchTriggers]);

  const handleSaveGuidelines = async () => {
    const toSave: Record<string, number> = {};
    for (const [k, v] of Object.entries(editGuidelines)) { const n = parseFloat(v); if (Number.isFinite(n)) toSave[k] = n; }
    setSavingGuidelines(true);
    try { saveGuidelinesToStorage(selectedFunds, toSave); setSavedGuidelines(toSave); setGuidelinesExpanded(false); await fetchTriggers(); }
    finally { setSavingGuidelines(false); }
  };

  const handleResetGuidelines = () => {
    const d: Record<string, string> = {};
    for (const f of GUIDELINE_FIELDS) d[f.key] = String(f.defaultValue);
    setEditGuidelines(d); setSavedGuidelines({}); localStorage.removeItem(getStorageKey(selectedFunds));
    fetchTriggers();
  };

  /* ── Derived data ── */
  interface SummaryCard {
    key: string; label: string; subtitle: string; status: Status; ratio: number; pct: number;
    limit?: string;
    funds: { name: string; value: string; status: Status }[];
  }

  const getGuidelineFrom = (resp: TriggersResponse | null, k: string): number | undefined => {
    const section = resp?.current_levels?.[k];
    if (!section) return undefined;
    if (section.guideline != null) return section.guideline;
    const rows = section.data || [];
    for (const row of rows) if (row.guideline != null) return row.guideline;
    return undefined;
  };

  const computeSummaryCards = (resp: TriggersResponse | null): SummaryCard[] => {
    if (!resp?.current_levels) return [];
    return SUMMARY_KEYS.filter((k) => resp.current_levels[k]).map((key) => {
      const section = resp.current_levels[key];
      const cfg = SECTION_CONFIG[key];
      if (!cfg) return null;
      const rows = section.data || [];
      if (!rows.length) return null;
      const guideline = getGuidelineFrom(resp, key);

      const funds = rows.map((row) => {
        const raw = row[cfg.valueKey];
        const num = parseNumericValue(raw);
        const st = getStatus(num, guideline);
        return { name: row[cfg.firstColKey] || "Fund", value: typeof raw === "string" ? raw : `${raw}%`, status: st };
      });

      const maxAbs = Math.max(...funds.map((f) => parseNumericValue(f.value)));
      const overallStatus = getStatus(maxAbs, guideline);
      const ratio = guideline ? maxAbs / guideline : 0;

      return {
        key, label: (section.title || cfg.summaryLabel || key).replace(/\s*\(def\.\s*\d+\)/gi, ""), subtitle: cfg.valueLabel,
        status: overallStatus, ratio, pct: Math.round(Math.min(ratio, 1) * 100),
        limit: guideline ? `${guideline.toFixed(1)}%` : undefined, funds,
      };
    }).filter(Boolean) as SummaryCard[];
  };

  const concernScore = (resp: TriggersResponse): number => {
    const cards = computeSummaryCards(resp);
    let score = 0;
    for (const c of cards) {
      if (c.status === "breach") score += 100 + (c.ratio || 0);
      else if (c.status === "warning") score += 10 + (c.ratio || 0);
    }
    return score;
  };

  const sortedFunds = Object.entries(fundResponses).sort(([, a], [, b]) => concernScore(b) - concernScore(a));

  const activeFundsInPortfolios = useMemo(
    () => portfolios.filter((p) => !RETIRED_FUNDS.has(p)),
    [portfolios],
  );
  const isAllSelected =
    activeFundsInPortfolios.length > 0 &&
    activeFundsInPortfolios.every((f) => selectedFundList.includes(f));
  const someSelected = selectedFundList.length > 0 && !isAllSelected;
  const fundsLabel =
    selectedFundList.length === 0
      ? "Fund"
      : selectedFundList.length === 1
      ? selectedFundList[0]
      : isAllSelected
      ? `All Funds (${selectedFundList.length})`
      : `${selectedFundList.length} Funds`;

  const hasGuidelineChanges = (() => {
    const nums: Record<string, number> = {};
    for (const [k, v] of Object.entries(editGuidelines)) { const n = parseFloat(v); if (Number.isFinite(n)) nums[k] = n; }
    return JSON.stringify(nums) !== JSON.stringify(savedGuidelines);
  })();

  const inputSx = {
    "& .MuiOutlinedInput-root": {
      borderRadius: "8px",
      backgroundColor: "#f8fafc",
      "& fieldset": { borderColor: "#e2e8f0" },
      "&:hover fieldset": { borderColor: "#818cf8" },
      "&.Mui-focused": { backgroundColor: "#f0f4ff" },
      "&.Mui-focused fieldset": { borderColor: "#6366f1", borderWidth: "2px" },
    },
    "& .MuiInputBase-input": { color: "#1e293b", fontSize: 13 },
    "& .MuiInputBase-input:focus": { color: "#3730a3" },
  };

  const renderTrendIcon = (status: Status) => (
    status === "breach" || status === "warning"
      ? <span className="trig-trend trig-trend--up">&#8599;</span>
      : <span className="trig-trend trig-trend--flat">&#8212;</span>
  );

  return (
    <Box className="trig-page">
      <Container maxWidth="lg" disableGutters sx={{ px: 3 }}>
        {/* ════ HEADER ════ */}
        <Box className="trig-header">
          <Box className="trig-header-left">
            <IconButton onClick={() => navigate(-1)} sx={{ color: "rgba(255,255,255,0.6)", "&:hover": { color: "#fff" } }}><ArrowBackIcon /></IconButton>
            <Typography className="trig-header-title">{fundsLabel} Limits and Alerts</Typography>
          </Box>
          <Box className="trig-header-right">
            {/* Fund multi-select dropdown with checkboxes */}
            <FormControl size="small" sx={{ minWidth: 220 }}>
              <Select
                multiple
                value={selectedFundList}
                onChange={(e) => {
                  const raw = e.target.value as string[];
                  if (raw.includes("__ALL__")) {
                    // Master "All" toggles only active funds; preserve any manually-added retired funds.
                    const retiredKept = selectedFundList.filter((f) => RETIRED_FUNDS.has(f));
                    setSelectedFundList(
                      isAllSelected ? retiredKept : [...activeFundsInPortfolios, ...retiredKept],
                    );
                    return;
                  }
                  setSelectedFundList(raw.filter((v) => v !== "__ALL__"));
                }}
                input={<OutlinedInput sx={{
                  color: "#fff",
                  borderRadius: "8px",
                  backgroundColor: "rgba(255,255,255,0.1)",
                  fontSize: 13,
                  fontWeight: 600,
                  "& .MuiOutlinedInput-notchedOutline": { borderColor: "rgba(255,255,255,0.25)" },
                  "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "rgba(255,255,255,0.4)" },
                  "& .MuiSvgIcon-root": { color: "rgba(255,255,255,0.6)" },
                }} />}
                renderValue={() => {
                  if (selectedFundList.length === 0) return "Select Funds";
                  if (isAllSelected) return `All Funds (${activeFundsInPortfolios.length})`;
                  if (selectedFundList.length === 1) return selectedFundList[0];
                  return `${selectedFundList.length} of ${activeFundsInPortfolios.length} selected`;
                }}
                MenuProps={{
                  PaperProps: {
                    sx: {
                      mt: 0.5,
                      bgcolor: "#1a2035",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: 2,
                      maxHeight: 360,
                      "& .MuiMenuItem-root": {
                        color: "#e2e8f0",
                        fontSize: 13,
                        py: 0.5,
                        "&:hover": { bgcolor: "rgba(255,255,255,0.06)" },
                        "&.Mui-selected": { bgcolor: "transparent" },
                        "&.Mui-selected:hover": { bgcolor: "rgba(255,255,255,0.06)" },
                      },
                      "& .MuiCheckbox-root": { p: 0.5, color: "#94a3b8" },
                      "& .MuiCheckbox-root.Mui-checked": { color: "#10b981" },
                      "& .MuiCheckbox-root.MuiCheckbox-indeterminate": { color: "#10b981" },
                    },
                  },
                  disableAutoFocusItem: true,
                }}
              >
                <MenuItem value="__ALL__" disableRipple>
                  <Checkbox
                    size="small"
                    checked={isAllSelected}
                    indeterminate={someSelected}
                  />
                  <ListItemText
                    primary="All Funds"
                    secondary={`${activeFundsInPortfolios.length} funds`}
                    primaryTypographyProps={{ fontWeight: 700, color: "#fff" }}
                    secondaryTypographyProps={{ fontSize: 11, color: "#94a3b8" }}
                  />
                </MenuItem>
                <Divider sx={{ my: 0.5, borderColor: "rgba(255,255,255,0.1)" }} />
                {portfolios.map((p) => {
                  const isRetired = RETIRED_FUNDS.has(p);
                  const checked = selectedFundList.includes(p);
                  return (
                    <MenuItem
                      key={p}
                      value={p}
                      sx={{ opacity: isRetired ? 0.7 : 1, fontStyle: isRetired ? "italic" : "normal" }}
                    >
                      <Checkbox size="small" checked={checked} />
                      <ListItemText primary={p} />
                      {isRetired && (
                        <span style={{ fontSize: 10, color: "#94a3b8", marginLeft: 8 }}>
                          retired
                        </span>
                      )}
                    </MenuItem>
                  );
                })}
              </Select>
            </FormControl>

            {/* Configure "All Funds" toggle */}
            <Tooltip title='Configure "All Funds"' placement="bottom">
              <IconButton
                size="small"
                onClick={() => { setAllFundsDraft(allFundsConfig); setConfigureAllOpen((v) => !v); }}
                sx={{
                  color: configureAllOpen ? "#fff" : "rgba(255,255,255,0.5)",
                  backgroundColor: configureAllOpen ? "rgba(255,255,255,0.15)" : "transparent",
                  border: "1px solid",
                  borderColor: configureAllOpen ? "rgba(255,255,255,0.4)" : "rgba(255,255,255,0.2)",
                  borderRadius: "8px",
                  p: 0.75,
                  "&:hover": { color: "#fff", borderColor: "rgba(255,255,255,0.5)" },
                }}
              >
                <TuneIcon fontSize="small" />
              </IconButton>
            </Tooltip>

            <Box className="trig-header-date-nav">
              <IconButton size="small" onClick={() => setSelectedDate(shiftDate(selectedDate, -1))} sx={{ color: "rgba(255,255,255,0.5)", "&:hover": { color: "#fff" } }}><ChevronLeftIcon fontSize="small" /></IconButton>
              <TextField type="date" size="small" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className="trig-header-date" />
              <IconButton size="small" onClick={() => setSelectedDate(shiftDate(selectedDate, 1))} sx={{ color: "rgba(255,255,255,0.5)", "&:hover": { color: "#fff" } }}><ChevronRightIcon fontSize="small" /></IconButton>
            </Box>
          </Box>
        </Box>

        {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>{error}</Alert>}
        {loading && <Box className="trig-loading"><CircularProgress sx={{ color: "#002060" }} /></Box>}

        {!loading && sortedFunds.length > 0 && (
          <>
            {/* ════ GUIDELINES PANEL (TOP) ════ */}
            <Box className="trig-guidelines-panel">
              <Box className="trig-guidelines-toggle" onClick={() => setGuidelinesExpanded((p) => !p)}>
                <Box className="trig-guidelines-toggle-left">
                  <EditIcon sx={{ fontSize: 18, color: "#002060" }} />
                  <Typography className="trig-guidelines-toggle-title">Edit Guidelines</Typography>
                  {Object.keys(savedGuidelines).length > 0 && <span className="trig-guidelines-custom-badge">Custom</span>}
                </Box>
                {guidelinesExpanded ? <ExpandLessIcon sx={{ color: "#64748b" }} /> : <ExpandMoreIcon sx={{ color: "#64748b" }} />}
              </Box>
              <Collapse in={guidelinesExpanded}>
                <Box className="trig-guidelines-content">
                  <Box className="trig-guidelines-grid">
                    {GUIDELINE_FIELDS.map((f) => (
                      <Box key={f.key} sx={{ display: "flex", flexDirection: "column" }}>
                        <Typography className="trig-guidelines-field-label">{f.label}</Typography>
                        <TextField size="small" type="number" value={f.key in editGuidelines ? editGuidelines[f.key] : String(defaultGuidelines[f.key])}
                          onChange={(e) => setEditGuidelines((p) => ({ ...p, [f.key]: e.target.value }))}
                          inputProps={{ style: { fontSize: 13, padding: "8px 12px" }, step: "0.1" }}
                          sx={inputSx} />
                      </Box>
                    ))}
                  </Box>
                  <Box className="trig-guidelines-actions">
                    <Button variant="outlined" size="small" onClick={handleResetGuidelines}
                      sx={{ textTransform: "none", borderRadius: "8px", color: "#64748b", borderColor: "#e2e8f0", fontSize: 13, px: 2.5, "&:hover": { borderColor: "#94a3b8", backgroundColor: "#f1f5f9" } }}>
                      Reset to Defaults
                    </Button>
                    <Button variant="contained" size="small" onClick={handleSaveGuidelines} disabled={savingGuidelines || !hasGuidelineChanges}
                      startIcon={savingGuidelines ? <CircularProgress size={14} color="inherit" /> : <SaveIcon sx={{ fontSize: 16 }} />}
                      sx={{ textTransform: "none", borderRadius: "8px", backgroundColor: "#002060", fontSize: 13, px: 2.5, "&:hover": { backgroundColor: "#001540" }, "&.Mui-disabled": { backgroundColor: "#94a3b8", color: "#fff" } }}>
                      Save & Apply
                    </Button>
                  </Box>
                </Box>
              </Collapse>
            </Box>

            {/* ════ CONFIGURE ALL FUNDS PANEL ════ */}
            <Collapse in={configureAllOpen}>
              <Box className="trig-guidelines-panel" sx={{ mb: 3 }}>
                <Box sx={{ p: "16px 28px", borderBottom: "1px solid #f1f5f9", display: "flex", alignItems: "center", gap: 1.5 }}>
                  <TuneIcon sx={{ fontSize: 18, color: "#002060" }} />
                  <Box>
                    <Typography sx={{ fontSize: 14, fontWeight: 700, color: "#0f172a" }}>Configure "All Funds"</Typography>
                    <Typography sx={{ fontSize: 12, color: "#64748b", mt: 0.25 }}>
                      Select which funds are included when viewing "All Funds". Retired funds (FMAP, MMLS) are excluded by default.
                    </Typography>
                  </Box>
                </Box>
                <Box sx={{ p: "20px 28px" }}>
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 3 }}>
                    {portfolios.map((p) => {
                      const isRetired = RETIRED_FUNDS.has(p);
                      const isChecked = allFundsDraft.includes(p);
                      return (
                        <Box
                          key={p}
                          onClick={() => {
                            if (isRetired) return;
                            setAllFundsDraft((prev) => prev.includes(p) ? prev.filter((f) => f !== p) : [...prev, p]);
                          }}
                          sx={{
                            display: "flex", alignItems: "center", gap: 0.75,
                            px: 1.5, py: 0.75,
                            border: `1.5px solid ${isChecked ? "#002060" : "#e2e8f0"}`,
                            borderRadius: "10px",
                            cursor: isRetired ? "not-allowed" : "pointer",
                            backgroundColor: isChecked ? "#eff6ff" : isRetired ? "#f8fafc" : "#fff",
                            opacity: isRetired ? 0.45 : 1,
                            transition: "border-color 0.15s, background 0.15s",
                            "&:hover": !isRetired ? { borderColor: "#002060", boxShadow: "0 2px 8px rgba(0,32,96,0.08)" } : {},
                          }}
                        >
                          <Checkbox
                            size="small"
                            checked={isChecked}
                            disabled={isRetired}
                            sx={{ p: 0, color: "#94a3b8", "&.Mui-checked": { color: "#002060" } }}
                          />
                          <Typography sx={{ fontSize: 13, fontWeight: 600, color: isChecked ? "#002060" : "#475569" }}>{p}</Typography>
                          {isRetired && <Typography sx={{ fontSize: 10, color: "#94a3b8", ml: 0.25, fontStyle: "italic" }}>retired</Typography>}
                        </Box>
                      );
                    })}
                  </Box>
                  <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <Typography sx={{ fontSize: 12, color: "#64748b" }}>
                      {allFundsDraft.length} fund{allFundsDraft.length !== 1 ? "s" : ""} selected
                    </Typography>
                    <Box sx={{ display: "flex", gap: 1.5 }}>
                      <Button
                        variant="outlined" size="small"
                        onClick={() => { setAllFundsDraft(allFundsConfig); setConfigureAllOpen(false); }}
                        sx={{ textTransform: "none", borderRadius: "8px", color: "#64748b", borderColor: "#e2e8f0", fontSize: 13, px: 2.5, "&:hover": { borderColor: "#94a3b8", backgroundColor: "#f1f5f9" } }}
                      >
                        Cancel
                      </Button>
                      <Button
                        variant="outlined" size="small"
                        onClick={() => {
                          const active = portfolios.filter((p) => !RETIRED_FUNDS.has(p));
                          setAllFundsDraft(active);
                        }}
                        sx={{ textTransform: "none", borderRadius: "8px", color: "#2563eb", borderColor: "#bfdbfe", fontSize: 13, px: 2.5, "&:hover": { backgroundColor: "#eff6ff" } }}
                      >
                        Reset to Active
                      </Button>
                      <Button
                        variant="contained" size="small"
                        disabled={allFundsDraft.length === 0}
                        onClick={() => {
                          setAllFundsConfig(allFundsDraft);
                          localStorage.setItem(ALL_FUNDS_CONFIG_KEY, JSON.stringify(allFundsDraft));
                          // If the dropdown was previously showing "All", update it to the new set
                          if (isAllSelected || selectedFundList.length === 0) {
                            setSelectedFundList(allFundsDraft);
                          }
                          setConfigureAllOpen(false);
                        }}
                        sx={{ textTransform: "none", borderRadius: "8px", backgroundColor: "#002060", fontSize: 13, px: 2.5, "&:hover": { backgroundColor: "#001540" }, "&.Mui-disabled": { backgroundColor: "#94a3b8", color: "#fff" } }}
                      >
                        Apply
                      </Button>
                    </Box>
                  </Box>
                </Box>
              </Box>
            </Collapse>

            {(() => {
              const blocks: Array<{ id: string; name: string; data: TriggersResponse; isTotal: boolean }> = [];
              const fundCount = Object.keys(fundResponses).length;
              if (fundCount === 1) {
                const [onlyFund, onlyResp] = sortedFunds[0] ?? Object.entries(fundResponses)[0];
                blocks.push({ id: onlyFund, name: onlyFund, data: onlyResp, isTotal: false });
              } else if (fundCount > 1) {
                if (mergedData) blocks.push({ id: "__TOTAL__", name: `Total (${fundCount} Funds)`, data: mergedData, isTotal: true });
                for (const [f, r] of sortedFunds) blocks.push({ id: f, name: f, data: r, isTotal: false });
              }
              return blocks;
            })().map(({ id: blockId, name: blockName, data: fundData, isTotal }, fundIdx) => {
              const summaryCards = computeSummaryCards(fundData);
              const entries = fundData?.current_levels ? Object.entries(fundData.current_levels) : [];
              const liquidityHorizonEntry = entries.find(([k]) => k === "liquidity_horizons");
              const top10Entry = entries.find(([k]) => k === "top_10_issuer_delta_net_exposure");
              const allIssuerEntry = entries.find(([k]) => k === "issuer_delta_net_exposure");
              const sectorEntry = entries.find(([k]) => k === "sector_exposure");
              const countryEntry = entries.find(([k]) => k === "country_exposure");

              const breachedIssuers = new Set<string>();
              if (fundData?.limits) {
                for (const s of Object.values(fundData.limits)) for (const r of s.data || []) if (r.top_10_issuers) breachedIssuers.add(r.top_10_issuers.trim().toLowerCase());
              }

              const alerts: { name: string; desc: string; status: Status }[] = [];
              for (const c of summaryCards) {
                const topVal = c.funds[0]?.value || "N/A";
                if (c.status === "breach") alerts.push({ name: `${c.label} breach`, desc: `Current: ${topVal} | Limit: ${c.limit || "N/A"}`, status: "breach" });
                else if (c.status === "warning") alerts.push({ name: `${c.label} elevated`, desc: `Approaching: ${topVal} vs ${c.limit || "N/A"}`, status: "warning" });
              }
              if (breachedIssuers.size > 0) alerts.push({ name: "Concentration risk", desc: `Top issuers: ${Array.from(breachedIssuers).slice(0, 3).join(", ")}`, status: "warning" });

              const insights: { icon: string; text: string }[] = [];
              const bc = summaryCards.filter((c) => c.status === "breach").length;
              const wc = summaryCards.filter((c) => c.status === "warning").length;
              if (bc === 0 && wc === 0) insights.push({ icon: "\u2713", text: "All metrics within tolerance levels." });
              if (bc > 0) insights.push({ icon: "\u26A0", text: `${bc} metric${bc > 1 ? "s" : ""} breaching guidelines.` });
              if (wc > 0) insights.push({ icon: "\u2191", text: `${wc} metric${wc > 1 ? "s" : ""} approaching limits.` });
              if (breachedIssuers.size > 0) insights.push({ icon: "\u25CF", text: `Issuer concentration: ${breachedIssuers.size} issuer${breachedIssuers.size > 1 ? "s" : ""} flagged.` });

              const overallStatus: Status = bc > 0 ? "breach" : wc > 0 ? "warning" : "safe";
              const expanded = isTotal ? totalExpanded : !!expandedFunds[blockId];
              const toggleBlock = () => {
                if (isTotal) setTotalExpanded((v) => !v);
                else setExpandedFunds((p) => ({ ...p, [blockId]: !p[blockId] }));
              };
              const isMulti = Object.keys(fundResponses).length > 1;
              const showHeader = isMulti;

              return (
                <Box key={blockId} sx={{ mb: 3 }}>
                  {showHeader && (
                    <Box
                      onClick={toggleBlock}
                      sx={{
                        display: "flex", alignItems: "center", gap: 2, mb: 2, mt: fundIdx === 0 ? 0 : 2,
                        p: 1.5, borderRadius: 2, cursor: "pointer",
                        background: isTotal ? "linear-gradient(135deg, #002060 0%, #001440 100%)" : "#fff",
                        color: isTotal ? "#fff" : "#0f172a",
                        border: isTotal ? "none" : "1px solid #e2e8f0",
                        boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
                        "&:hover": { boxShadow: "0 4px 12px rgba(0,0,0,0.08)" },
                      }}
                    >
                      {!isTotal && <Box sx={{ fontSize: 13, fontWeight: 700, color: "#94a3b8", letterSpacing: 1, minWidth: 30 }}>#{fundIdx}</Box>}
                      <Typography sx={{ fontSize: isTotal ? 20 : 18, fontWeight: 800, color: "inherit", flex: 1 }}>
                        {isTotal ? "\u03A3 " : ""}{blockName}
                      </Typography>
                      <Box className={`trig-scard-status trig-scard-status--${overallStatus}`}>
                        <span className="trig-scard-status-dot" />
                        {overallStatus === "breach" ? `${bc} breach${bc > 1 ? "es" : ""}` : overallStatus === "warning" ? `${wc} warning${wc > 1 ? "s" : ""}` : "All within limits"}
                      </Box>
                      <IconButton size="small" sx={{ color: "inherit" }} onClick={(e) => { e.stopPropagation(); toggleBlock(); }}>
                        {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                      </IconButton>
                    </Box>
                  )}

                  <Collapse in={expanded || !showHeader}>

                  {/* ════ SUMMARY CARDS ════ */}
            {summaryCards.length > 0 && (
              <Box className="trig-summary-row">
                {summaryCards.map((c) => {
                  const topFund = c.funds[0];
                  return (
                    <Box key={c.key} className={`trig-scard trig-scard--${c.status}`} sx={{ position: "relative" }}>
                      {/* Info icon */}
                      {SUMMARY_CARD_INFO[c.key] && (
                        <Tooltip
                          title={
                            <Box sx={{ p: 0.5 }}>
                              <Box sx={{ fontWeight: 700, mb: 0.5 }}>{c.label}</Box>
                              <Box sx={{ mb: 0.75 }}>{SUMMARY_CARD_INFO[c.key].definition}</Box>
                              <Box sx={{ fontWeight: 600, color: "#90caf9", mb: 0.25 }}>Formula:</Box>
                              <Box sx={{ fontFamily: "monospace", whiteSpace: "pre-line", color: "#e0f2fe", mb: SUMMARY_CARD_INFO[c.key].notes ? 0.75 : 0 }}>
                                {SUMMARY_CARD_INFO[c.key].formula}
                              </Box>
                              {SUMMARY_CARD_INFO[c.key].notes && (
                                <Box sx={{ color: "#cbd5e1", fontSize: "11px", lineHeight: 1.5, borderTop: "1px solid rgba(255,255,255,0.1)", pt: 0.75 }}>
                                  {SUMMARY_CARD_INFO[c.key].notes}
                                </Box>
                              )}
                            </Box>
                          }
                          placement="top"
                          arrow
                          slotProps={{
                            tooltip: { sx: { bgcolor: "#1e293b", maxWidth: 320, fontSize: "12px", lineHeight: 1.5 } },
                            arrow: { sx: { color: "#1e293b" } },
                          }}
                        >
                          <InfoOutlinedIcon
                            sx={{
                              position: "absolute",
                              top: 10,
                              right: 10,
                              fontSize: "14px",
                              cursor: "help",
                              opacity: 0.4,
                              color: "#64748b",
                              zIndex: 1,
                              "&:hover": { opacity: 1 },
                            }}
                          />
                        </Tooltip>
                      )}

                      {/* Label row */}
                      <Typography className="trig-scard-label" sx={{ pr: 2 }}>{c.label}</Typography>

                      {/* Value + gauge row */}
                      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 1 }}>
                        <Box>
                          <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                            <Typography className={`trig-scard-value trig-scard-value--${topFund?.status || c.status}`}>
                              {topFund?.value || "N/A"}
                            </Typography>
                            {topFund && renderTrendIcon(topFund.status)}
                          </Box>
                          {c.key === "issuer_max_exposure" && topFund?.name && (
                            <Typography sx={{ fontSize: 11, fontWeight: 600, color: "#64748b", mt: 0.25, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: 120 }} title={topFund.name}>
                              {topFund.name}
                            </Typography>
                          )}
                        </Box>
                        <CircularGauge ratio={c.ratio} status={c.status} label={`${c.pct}%`} />
                      </Box>

                      {/* Footer: limit + status */}
                      <Box sx={{ pt: 1, borderTop: "1px solid #f1f5f9", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 0.5 }}>
                        {c.limit && <Typography className="trig-scard-limit">Limit: {c.limit}</Typography>}
                        <Box className={`trig-scard-status trig-scard-status--${c.status}`}>
                          <span className="trig-scard-status-dot" />
                          {c.status === "breach" ? "Above limit" : c.status === "warning" ? "Elevated" : `Within ${c.limit || "limit"}`}
                        </Box>
                      </Box>
                    </Box>
                  );
                })}
              </Box>
            )}

            {/* ════ TOP 10 ISSUER TABLE (with exposure bars) ════ */}
            {top10Entry && [top10Entry].map(([sectionKey, section]) => {
              const cfg = SECTION_CONFIG[sectionKey];
              if (!cfg) return null;
              const rows = section.data || [];
              const nonTotal = rows.filter((r) => r[cfg.firstColKey] !== "Total");
              const totalRow = rows.find((r) => r[cfg.firstColKey] === "Total");
              const maxVal = Math.max(...nonTotal.map((r) => Math.abs(parseSignedNumericValue(r[cfg.valueKey]))), 1);

              const top10Guideline = getActiveGuidelines().top_10_issuer_guideline;

              return (
                <Box key={sectionKey} className="trig-panel" sx={{ mb: 3 }}>
                  <Box className="trig-panel-head">
                    <Box className="trig-panel-head-left">
                      <span className="trig-issuer-dot trig-issuer-dot--red" />
                      <Typography className="trig-panel-title">{section.title}</Typography>
                    </Box>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      {top10Guideline && <span className="trig-guideline-tag">Top 10 Guideline: {top10Guideline}%</span>}
                      {totalRow && (() => {
                        const totalVal = parseSignedNumericValue(totalRow[cfg.valueKey]);
                        const guidelineVal = top10Guideline ? parseFloat(String(top10Guideline)) : null;
                        const isAbove = guidelineVal !== null && totalVal > guidelineVal;
                        return (
                          <span className={`trig-panel-badge ${isAbove ? "trig-panel-badge--red" : "trig-panel-badge--green"}`}>
                            Total: {totalRow[cfg.valueKey]}
                            {isAbove && <span className="trig-warning-dot" />}
                          </span>
                        );
                      })()}
                    </Box>
                  </Box>
                  <Box className="trig-table-wrap">
                    <table className="trig-table">
                      <thead>
                        <tr>
                          <th className="trig-th-l" style={{ width: 40 }}>#</th>
                          <th className="trig-th-l">ISSUER</th>
                          <th className="trig-th-l" style={{ width: 220 }}>EXPOSURE</th>
                          <th className="trig-th-r" style={{ width: 130 }}>NET EXPOSURE</th>
                        </tr>
                      </thead>
                      <tbody>
                        {nonTotal.map((row, idx) => {
                          const raw = row[cfg.valueKey];
                          const num = parseSignedNumericValue(raw);
                          const absNum = Math.abs(num);
                          const isNeg = num < 0;
                          const barWidth = Math.min((absNum / maxVal) * 100, 100);
                          const barColor = absNum > 4 ? "#2563eb" : absNum > 2 ? "#0f766e" : "#16a34a";
                          return (
                            <tr key={idx}>
                              <td className="trig-td-rank">{idx + 1}</td>
                              <td className="trig-td-l">{row[cfg.firstColKey]}</td>
                              <td>
                                <Box className="trig-bar-cell">
                                  <Box className="trig-bar-track">
                                    <Box className="trig-bar-fill" style={{ width: `${barWidth}%`, background: barColor }} />
                                  </Box>
                                </Box>
                              </td>
                              <td className="trig-td-r">
                                <span className={`trig-pill ${isNeg ? "trig-pill--breach" : absNum > 3 ? "trig-pill--warning" : "trig-pill--safe"}`}>{raw}</span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </Box>
                </Box>
              );
            })}

            {/* ════ SECTOR EXPOSURE — CARD GRID ════ */}
            {sectorEntry && (() => {
              const [sectionKey, section] = sectorEntry;
              const cfg = SECTION_CONFIG[sectionKey];
              if (!cfg) return null;
              const rows = (section.data || []).filter((r: any) => (r[cfg.firstColKey] || "").trim() !== "");
              const guideline = getActiveGuidelines().sector_threshold ?? 25;
              const needle = sectorSearch.trim().toUpperCase();
              const filtered = needle ? rows.filter((r: any) => (r[cfg.firstColKey] || "").toUpperCase().includes(needle)) : rows;
              return (
                <Box key={sectionKey} className="trig-panel" sx={{ mb: 3 }}>
                  <Box className="trig-panel-head">
                    <Box className="trig-panel-head-left">
                      <Box className="trig-panel-icon trig-panel-icon--purple">&#9733;</Box>
                      <Typography className="trig-panel-title">{section.title}</Typography>
                    </Box>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <span className="trig-guideline-tag">Sector Limit: {guideline}%</span>
                      <span className="trig-panel-badge trig-panel-badge--blue">{rows.length} Sectors</span>
                    </Box>
                  </Box>
                  <TextField
                    size="small" placeholder="Search sectors..." value={sectorSearch}
                    onChange={(e) => setSectorSearch(e.target.value)}
                    sx={{ mb: 2, width: 280, ...inputSx }}
                  />
                  <Box className="trig-card-grid-scroll">
                    <Box className="trig-card-grid">
                      {filtered.length === 0 ? (
                        <Typography className="trig-empty">No sectors found</Typography>
                      ) : (
                        filtered.map((row: any, idx: number) => {
                          const raw = row[cfg.valueKey];
                          const num = parseSignedNumericValue(raw);
                          const absNum = Math.abs(num);
                          const overLimit = absNum >= guideline;
                          const pillClass = overLimit ? "trig-pill--breach" : absNum >= guideline * 0.8 ? "trig-pill--warning" : "trig-pill--safe";
                          return (
                            <Box key={`${sectionKey}-${idx}`} className={`trig-ticker-card ${overLimit ? "trig-ticker-card--breach" : ""}`}>
                              <Typography className="trig-ticker-card-name" title={row[cfg.firstColKey]}>{row[cfg.firstColKey]}</Typography>
                              <span className={`trig-pill ${pillClass}`}>{raw}</span>
                            </Box>
                          );
                        })
                      )}
                    </Box>
                  </Box>
                </Box>
              );
            })()}

            {/* ════ COUNTRY EXPOSURE — CARD GRID ════ */}
            {countryEntry && (() => {
              const [sectionKey, section] = countryEntry;
              const cfg = SECTION_CONFIG[sectionKey];
              if (!cfg) return null;
              const rows = (section.data || []).filter((r: any) => (r[cfg.firstColKey] || "").trim() !== "");
              const guideline = getActiveGuidelines().country_threshold ?? 25;
              const needle = countrySearch.trim().toUpperCase();
              const filtered = needle ? rows.filter((r: any) => (r[cfg.firstColKey] || "").toUpperCase().includes(needle)) : rows;
              return (
                <Box key={sectionKey} className="trig-panel" sx={{ mb: 3 }}>
                  <Box className="trig-panel-head">
                    <Box className="trig-panel-head-left">
                      <Box className="trig-panel-icon trig-panel-icon--blue">&#9673;</Box>
                      <Typography className="trig-panel-title">{section.title}</Typography>
                    </Box>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <span className="trig-guideline-tag">Country Limit: {guideline}%</span>
                      <span className="trig-panel-badge trig-panel-badge--blue">{rows.length} Countries</span>
                    </Box>
                  </Box>
                  <TextField
                    size="small" placeholder="Search countries..." value={countrySearch}
                    onChange={(e) => setCountrySearch(e.target.value)}
                    sx={{ mb: 2, width: 280, ...inputSx }}
                  />
                  <Box className="trig-card-grid-scroll">
                    <Box className="trig-card-grid">
                      {filtered.length === 0 ? (
                        <Typography className="trig-empty">No countries found</Typography>
                      ) : (
                        filtered.map((row: any, idx: number) => {
                          const raw = row[cfg.valueKey];
                          const num = parseSignedNumericValue(raw);
                          const absNum = Math.abs(num);
                          const overLimit = absNum >= guideline;
                          const pillClass = overLimit ? "trig-pill--breach" : absNum >= guideline * 0.8 ? "trig-pill--warning" : "trig-pill--safe";
                          return (
                            <Box key={`${sectionKey}-${idx}`} className={`trig-ticker-card ${overLimit ? "trig-ticker-card--breach" : ""}`}>
                              <Typography className="trig-ticker-card-name" title={row[cfg.firstColKey]}>{row[cfg.firstColKey]}</Typography>
                              <span className={`trig-pill ${pillClass}`}>{raw}</span>
                            </Box>
                          );
                        })
                      )}
                    </Box>
                  </Box>
                </Box>
              );
            })()}

            {/* ════ ALL ISSUER — CARD GRID ════ */}
            {allIssuerEntry && [allIssuerEntry].map(([sectionKey, section]) => {
              const cfg = SECTION_CONFIG[sectionKey];
              if (!cfg) return null;
              const rows = section.data || [];
              const nonTotal = rows.filter((r) => r[cfg.firstColKey] !== "Total");
              const totalRow = rows.find((r) => r[cfg.firstColKey] === "Total");
              const issuerGuideline = getActiveGuidelines().issuer_delta_net_exposure;
              const needle = issuerSearch.trim().toUpperCase();
              const filtered = needle ? nonTotal.filter((r) => (r[cfg.firstColKey] || "").toUpperCase().includes(needle)) : nonTotal;

              return (
                <Box key={sectionKey} className="trig-panel" sx={{ mb: 3 }}>
                  <Box className="trig-panel-head">
                    <Box className="trig-panel-head-left">
                      <span className="trig-issuer-dot trig-issuer-dot--green" />
                      <Typography className="trig-panel-title">All {section.title}</Typography>
                    </Box>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      {issuerGuideline && <span className="trig-guideline-tag">Single Issuer Limit: {issuerGuideline}%</span>}
                      {totalRow && <span className="trig-panel-badge trig-panel-badge--blue">Total: {totalRow[cfg.valueKey]}</span>}
                      <span className="trig-panel-badge trig-panel-badge--green">{nonTotal.length} Issuers</span>
                    </Box>
                  </Box>
                  <TextField
                    size="small" placeholder="Search issuers..." value={issuerSearch}
                    onChange={(e) => setIssuerSearch(e.target.value)}
                    sx={{ mb: 2, width: 280, ...inputSx }}
                  />
                  <Box className="trig-card-grid-scroll">
                    <Box className="trig-card-grid">
                      {filtered.length === 0 ? (
                        <Typography className="trig-empty">No issuers found</Typography>
                      ) : (
                        filtered.map((row, idx) => {
                          const raw = row[cfg.valueKey];
                          const num = parseSignedNumericValue(raw);
                          const absNum = Math.abs(num);
                          const isNeg = num < 0;
                          const isBreach = breachedIssuers.has((row[cfg.firstColKey] || "").trim().toLowerCase());
                          const overLimit = issuerGuideline ? absNum >= issuerGuideline : false;
                          const pillClass = isBreach || isNeg || overLimit ? "trig-pill--breach" : absNum > 3 ? "trig-pill--warning" : "trig-pill--safe";
                          return (
                            <Box key={`${sectionKey}-${idx}`} className={`trig-ticker-card ${isBreach || overLimit ? "trig-ticker-card--breach" : ""}`}>
                              <Typography className="trig-ticker-card-name" title={row[cfg.firstColKey]}>{row[cfg.firstColKey]}</Typography>
                              <span className={`trig-pill ${pillClass}`}>{raw}</span>
                            </Box>
                          );
                        })
                      )}
                    </Box>
                  </Box>
                </Box>
              );
            })}

            {/* ════ LIQUIDITY HORIZONS (portfolio % liquidatable at 20% of ADT) ════ */}
            {liquidityHorizonEntry && (() => {
              const [, section] = liquidityHorizonEntry;
              const row: any = (section.data || [])[0];
              if (!row) return null;
              const activeG = getActiveGuidelines();
              const bars = [
                { label: "1 Day", valueStr: row.liq_1d_pct, value: parseNumericValue(row.liq_1d_pct), guideline: activeG.liquidity_1d_pct ?? row.guideline_1d ?? 20 },
                { label: "5 Days", valueStr: row.liq_5d_pct, value: parseNumericValue(row.liq_5d_pct), guideline: activeG.liquidity_5d_pct ?? row.guideline_5d ?? 60 },
                { label: "20 Days", valueStr: row.liq_20d_pct, value: parseNumericValue(row.liq_20d_pct), guideline: activeG.liquidity_20d_pct ?? row.guideline_20d ?? 95 },
              ];
              return (
                <Box className="trig-panel" sx={{ mb: 3 }}>
                  <Box className="trig-panel-head">
                    <Box className="trig-panel-head-left">
                      <Box className="trig-panel-icon trig-panel-icon--green">&#9900;</Box>
                      <Typography className="trig-panel-title">Liquidation at 10% of Volume</Typography>
                    </Box>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <span className="trig-panel-badge trig-panel-badge--green">Portfolio % liquidatable</span>
                    </Box>
                  </Box>
                  <Box sx={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 2 }}>
                    {bars.map((b) => {
                      const meetsTarget = b.value >= b.guideline;
                      const pct = Math.min(100, Math.max(0, b.value));
                      return (
                        <Box key={b.label} sx={{ border: "1px solid #e5e7eb", borderRadius: 2, p: 2 }}>
                          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1 }}>
                            <Typography sx={{ fontSize: 13, fontWeight: 700, color: "#0f172a" }}>{b.label}</Typography>
                            <span className={`trig-pill ${meetsTarget ? "trig-pill--safe" : "trig-pill--warning"}`}>{b.valueStr}</span>
                          </Box>
                          <Box className="trig-bar-track" sx={{ height: "10px !important" }}>
                            <Box className="trig-bar-fill" style={{ width: `${pct}%`, background: meetsTarget ? "#16a34a" : "#f59e0b" }} />
                          </Box>
                          <Typography sx={{ fontSize: 11, color: "#64748b", mt: 0.75 }}>
                            Target: ≥ {b.guideline}%
                          </Typography>
                        </Box>
                      );
                    })}
                  </Box>
                </Box>
              );
            })()}

            {/* ════ ALERTS & INSIGHTS ROW (after tables) ════ */}
            {(alerts.length > 0 || insights.length > 0) && (
              <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 3, mb: 3 }}>
                <Box className="trig-side-card">
                  <Box className="trig-side-head">
                    <Typography className="trig-side-title">
                      <span style={{ color: "#d97706" }}>&#9888;</span> Alerts
                      {alerts.length > 0 && <span className="trig-side-badge trig-side-badge--red">{alerts.length}</span>}
                    </Typography>
                  </Box>
                  {alerts.length === 0 ? (
                    <Typography sx={{ fontSize: 13, color: "#94a3b8", textAlign: "center", py: 2, fontStyle: "italic" }}>No active alerts</Typography>
                  ) : (
                    alerts.map((a, i) => (
                      <Box key={i} className="trig-alert-item">
                        <Box className={`trig-alert-icon trig-alert-icon--${a.status}`}>{a.status === "breach" ? "\u26A0" : "\u25B2"}</Box>
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography className="trig-alert-name">{a.name}</Typography>
                          <Typography className="trig-alert-desc">{a.desc}</Typography>
                        </Box>
                        <span className="trig-alert-chevron">&#8250;</span>
                      </Box>
                    ))
                  )}
                </Box>
                <Box className="trig-side-card">
                  <Box className="trig-side-head">
                    <Typography className="trig-side-title">
                      <span style={{ color: "#7c3aed" }}>&#128161;</span> Insights
                    </Typography>
                  </Box>
                  {insights.length === 0 ? (
                    <Typography sx={{ fontSize: 13, color: "#94a3b8", textAlign: "center", py: 2, fontStyle: "italic" }}>No insights</Typography>
                  ) : (
                    insights.map((ins, i) => (
                      <Box key={i} className="trig-insight-item">
                        <span className="trig-insight-icon">{ins.icon}</span>
                        <Typography className="trig-insight-text">{ins.text}</Typography>
                      </Box>
                    ))
                  )}
                </Box>
              </Box>
            )}
                  </Collapse>
                </Box>
              );
            })}
          </>
        )}
      </Container>
    </Box>
  );
};

export default RiskTriggers;
