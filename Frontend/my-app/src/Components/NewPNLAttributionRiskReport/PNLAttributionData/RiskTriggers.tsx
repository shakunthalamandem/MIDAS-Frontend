import React, { useState, useEffect, useCallback } from "react";
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
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import "./RiskTriggers.css";

const apiUrl = process.env.REACT_APP_API_URL;

const getAuthHeaders = (contentType?: string) => {
  const token = localStorage.getItem("access_token");
  const headers: Record<string, string> = { Authorization: `Bearer ${token}` };
  if (contentType) headers["Content-Type"] = contentType;
  return headers;
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
  { key: "top_10_issuer_guideline", label: "Top 10 Issuer Guideline (%)", defaultValue: 35 },
  { key: "issuer_delta_net_exposure", label: "Single Issuer Limit (%)", defaultValue: 10 },
  { key: "liquidity_days", label: "Liquidity Days (%)", defaultValue: 95 },
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
  top_10_issuer_delta_net_exposure: { firstColKey: "issuer", firstColLabel: "Issuer", valueKey: "delta_adjusted_net_exposure", valueLabel: "Delta Adjusted Net Exposure" },
  issuer_delta_net_exposure: { firstColKey: "issuer", firstColLabel: "Issuer", valueKey: "delta_adjusted_net_exposure", valueLabel: "Delta Adjusted Net Exposure" },
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

const SUMMARY_KEYS = ["delta_gross_exposure", "equity_delta_net_exposure", "equity_beta_net_exposure", "drawdown", "var_99"];
const EXPOSURE_KEYS = new Set(["top_10_issuer_delta_net_exposure", "issuer_delta_net_exposure"]);

/* ── Merge helpers ── */
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
  return merged;
};

/* ── Circular Gauge SVG ── */
const CircularGauge: React.FC<{ ratio: number; status: Status; label: string }> = ({ ratio, status, label }) => {
  const r = 18;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - Math.min(ratio, 1));
  return (
    <Box className="trig-gauge">
      <svg width="44" height="44" viewBox="0 0 44 44">
        <circle cx="22" cy="22" r={r} className="trig-gauge-bg" />
        <circle cx="22" cy="22" r={r} className={`trig-gauge-fill trig-gauge-fill--${status}`} strokeDasharray={circ} strokeDashoffset={offset} />
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
  const [selectedFunds, setSelectedFunds] = useState<string[]>(initialFund ? [initialFund] : ["BHM"]);
  const [selectedDate, setSelectedDate] = useState(initialDate);
  const [data, setData] = useState<TriggersResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [guidelinesExpanded, setGuidelinesExpanded] = useState(false);
  const [editGuidelines, setEditGuidelines] = useState<Record<string, string>>({});
  const [savedGuidelines, setSavedGuidelines] = useState<Record<string, number>>({});
  const [savingGuidelines, setSavingGuidelines] = useState(false);
  const [issuerSearch, setIssuerSearch] = useState("");
  const [liqSearch, setLiqSearch] = useState("");

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
        setPortfolios(result.portfolios || []);
        if (!selectedDate && result.max_position_date) setSelectedDate(result.max_position_date);
        if (selectedFunds.length === 0 && result.portfolios?.length > 0) {
          setSelectedFunds(result.portfolios.includes("BHM") ? ["BHM"] : [result.portfolios[0]]);
        }
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
          return (await res.json()) as TriggersResponse;
        })
      );
      setData(mergeResponses(responses));
    } catch (err: any) { setError(err.message || "Failed to load triggers"); setData(null); }
    finally { setLoading(false); }
  }, [selectedFunds, selectedDate]);

  useEffect(() => { fetchTriggers(); }, [fetchTriggers]);

  const getGuideline = (k: string): number | undefined => {
    const section = data?.current_levels?.[k];
    if (!section) return undefined;
    // Check section-level guideline first
    if (section.guideline != null) return section.guideline;
    // Fall back to row-level guideline (API returns guideline inside each data row)
    const rows = section.data || [];
    for (const row of rows) {
      if (row.guideline != null) return row.guideline;
    }
    return undefined;
  };

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

  const getSummaryCards = (): SummaryCard[] => {
    if (!data?.current_levels) return [];
    return SUMMARY_KEYS.filter((k) => data.current_levels[k]).map((key) => {
      const section = data.current_levels[key];
      const cfg = SECTION_CONFIG[key];
      if (!cfg) return null;
      const rows = section.data || [];
      if (!rows.length) return null;
      const guideline = getGuideline(key);

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

  const summaryCards = data ? getSummaryCards() : [];
  const entries = data?.current_levels ? Object.entries(data.current_levels) : [];
  const liquidityEntry = entries.find(([k]) => k === "liquidity");
  const exposureEntries = entries.filter(([k]) => EXPOSURE_KEYS.has(k));

  const breachedIssuers = new Set<string>();
  if (data?.limits) {
    for (const s of Object.values(data.limits)) for (const r of s.data || []) if (r.top_10_issuers) breachedIssuers.add(r.top_10_issuers.trim().toLowerCase());
  }

  // Alerts
  const alerts: { name: string; desc: string; status: Status }[] = [];
  if (data) {
    for (const c of summaryCards) {
      const topVal = c.funds[0]?.value || "N/A";
      if (c.status === "breach") alerts.push({ name: `${c.label} breach`, desc: `Current: ${topVal} | Limit: ${c.limit || "N/A"}`, status: "breach" });
      else if (c.status === "warning") alerts.push({ name: `${c.label} elevated`, desc: `Approaching: ${topVal} vs ${c.limit || "N/A"}`, status: "warning" });
    }
    if (breachedIssuers.size > 0) alerts.push({ name: "Concentration risk", desc: `Top issuers: ${Array.from(breachedIssuers).slice(0, 3).join(", ")}`, status: "warning" });
  }

  // Insights
  const insights: { icon: string; text: string }[] = [];
  if (data && summaryCards.length > 0) {
    const bc = summaryCards.filter((c) => c.status === "breach").length;
    const wc = summaryCards.filter((c) => c.status === "warning").length;
    if (bc === 0 && wc === 0) insights.push({ icon: "\u2713", text: "All metrics within tolerance levels." });
    if (bc > 0) insights.push({ icon: "\u26A0", text: `${bc} metric${bc > 1 ? "s" : ""} breaching guidelines.` });
    if (wc > 0) insights.push({ icon: "\u2191", text: `${wc} metric${wc > 1 ? "s" : ""} approaching limits.` });
    if (breachedIssuers.size > 0) insights.push({ icon: "\u25CF", text: `Issuer concentration: ${breachedIssuers.size} issuer${breachedIssuers.size > 1 ? "s" : ""} flagged.` });
  }

  const fundsLabel = selectedFunds.length === 0 ? "Fund" : selectedFunds.length === 1 ? selectedFunds[0] : selectedFunds.length === portfolios.length ? "All Funds" : `${selectedFunds[0]} +${selectedFunds.length - 1}`;

  const hasGuidelineChanges = (() => {
    const nums: Record<string, number> = {};
    for (const [k, v] of Object.entries(editGuidelines)) { const n = parseFloat(v); if (Number.isFinite(n)) nums[k] = n; }
    return JSON.stringify(nums) !== JSON.stringify(savedGuidelines);
  })();

  const inputSx = {
    "& .MuiOutlinedInput-root": { borderRadius: "8px", backgroundColor: "#f8fafc", "& fieldset": { borderColor: "#e2e8f0" }, "&:hover fieldset": { borderColor: "#94a3b8" }, "&.Mui-focused fieldset": { borderColor: "#002060" } },
    "& .MuiInputBase-input": { color: "#1e293b", fontSize: 13 },
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
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <Select
                value={selectedFunds.length === portfolios.length && portfolios.length > 0 ? "__ALL__" : selectedFunds.length === 1 ? selectedFunds[0] : "__ALL__"}
                onChange={(e) => { const v = e.target.value; setSelectedFunds(v === "__ALL__" ? [...portfolios] : [v]); }}
                sx={{ color: "#fff", ".MuiOutlinedInput-notchedOutline": { borderColor: "rgba(255,255,255,0.25)" }, "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "rgba(255,255,255,0.4)" }, ".MuiSvgIcon-root": { color: "rgba(255,255,255,0.6)" }, fontSize: 13, fontWeight: 600, borderRadius: "8px", backgroundColor: "rgba(255,255,255,0.1)" }}
                renderValue={(s) => s === "__ALL__" ? "All Funds" : s}
              >
                <MenuItem value="__ALL__">All Funds</MenuItem>
                {portfolios.map((p) => <MenuItem key={p} value={p}>{p}</MenuItem>)}
              </Select>
            </FormControl>

            <Box className="trig-header-date-nav">
              <IconButton size="small" onClick={() => setSelectedDate(shiftDate(selectedDate, -1))} sx={{ color: "rgba(255,255,255,0.5)", "&:hover": { color: "#fff" } }}><ChevronLeftIcon fontSize="small" /></IconButton>
              <TextField type="date" size="small" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className="trig-header-date" />
              <IconButton size="small" onClick={() => setSelectedDate(shiftDate(selectedDate, 1))} sx={{ color: "rgba(255,255,255,0.5)", "&:hover": { color: "#fff" } }}><ChevronRightIcon fontSize="small" /></IconButton>
            </Box>
          </Box>
        </Box>

        {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>{error}</Alert>}
        {loading && <Box className="trig-loading"><CircularProgress sx={{ color: "#002060" }} /></Box>}

        {!loading && data && (
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

            {/* ════ SUMMARY CARDS ════ */}
            {summaryCards.length > 0 && (
              <Box className="trig-summary-row">
                {summaryCards.map((c) => {
                  const topFund = c.funds[0];
                  return (
                    <Box key={c.key} className={`trig-scard trig-scard--${c.status}`}>
                      <Box className="trig-scard-top">
                        <Typography className="trig-scard-label">{c.label}</Typography>
                        <CircularGauge ratio={c.ratio} status={c.status} label={`${c.pct}%`} />
                      </Box>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 0.5 }}>
                        <Typography className={`trig-scard-value trig-scard-value--${topFund?.status || c.status}`}>
                          {topFund?.value || "N/A"}
                        </Typography>
                        {topFund && renderTrendIcon(topFund.status)}
                      </Box>
                      <Box sx={{ mt: 1.5, pt: 1, borderTop: "1px solid #e2e8f0", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
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
            {exposureEntries.filter(([k]) => k === "top_10_issuer_delta_net_exposure").map(([sectionKey, section]) => {
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

            {/* ════ ALL ISSUER — CARD GRID ════ */}
            {exposureEntries.filter(([k]) => k === "issuer_delta_net_exposure").map(([sectionKey, section]) => {
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

            {/* ════ LIQUIDITY — FULL WIDTH CARD GRID ════ */}
            {liquidityEntry && (() => {
              const [, section] = liquidityEntry;
              const cfg = SECTION_CONFIG["liquidity"];
              const titleParts = section.title.split(": Guideline ");
              const guidelineDisplay = titleParts[1] || (section.guideline ? `${section.guideline}%` : null);
              const rows = section.data || [];
              const needle = liqSearch.trim().toUpperCase();
              const filtered = needle ? rows.filter((r: any) => (r[cfg.firstColKey] || "").toUpperCase().includes(needle)) : rows;

              return (
                <Box className="trig-panel" sx={{ mb: 3 }}>
                  <Box className="trig-panel-head">
                    <Box className="trig-panel-head-left">
                      <Box className="trig-panel-icon trig-panel-icon--green">&#9900;</Box>
                      <Typography className="trig-panel-title">{titleParts[0]}</Typography>
                    </Box>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      {guidelineDisplay && <span className="trig-panel-badge trig-panel-badge--green">Guideline {guidelineDisplay}</span>}
                      <span className="trig-panel-badge trig-panel-badge--blue">{rows.length} Positions</span>
                    </Box>
                  </Box>
                  <TextField
                    size="small" placeholder="Search tickers..." value={liqSearch}
                    onChange={(e) => setLiqSearch(e.target.value)}
                    sx={{ mb: 2, width: 280, ...inputSx }}
                  />
                  <Box className="trig-card-grid-scroll">
                    <Box className="trig-card-grid">
                      {filtered.length === 0 ? (
                        <Typography className="trig-empty">No tickers found</Typography>
                      ) : (
                        filtered.map((row: any, i: number) => {
                          const val = parseNumericValue(row[cfg.valueKey]);
                          const pillClass = val > 5 ? "trig-pill--breach" : val > 1 ? "trig-pill--warning" : "trig-pill--safe";
                          return (
                            <Box key={i} className="trig-ticker-card">
                              <Typography className="trig-ticker-card-name">{row[cfg.firstColKey]}</Typography>
                              <span className={`trig-pill ${pillClass}`}>{row[cfg.valueKey]}</span>
                            </Box>
                          );
                        })
                      )}
                    </Box>
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
          </>
        )}
      </Container>
    </Box>
  );
};

export default RiskTriggers;
