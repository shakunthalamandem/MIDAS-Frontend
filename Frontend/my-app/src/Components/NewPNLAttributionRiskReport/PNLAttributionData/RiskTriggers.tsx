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
  const headers: Record<string, string> = {
    Authorization: `Bearer ${token}`,
  };
  if (contentType) headers["Content-Type"] = contentType;
  return headers;
};

/* ── Types ── */

interface LimitRow {
  top_10_issuers: string;
  delta_adjusted_net_exposure: string;
}

interface LimitSectionData {
  title: string;
  data: LimitRow[];
}

interface SectionData {
  title: string;
  guideline?: number;
  data: Record<string, any>[];
}

interface TriggersResponse {
  limits: Record<string, LimitSectionData>;
  current_levels: Record<string, SectionData>;
}

/* ── Guideline config ── */

interface GuidelineField {
  key: string;
  label: string;
  defaultValue: number;
}

const GUIDELINE_FIELDS: GuidelineField[] = [
  { key: "delta_gross_exposure", label: "Delta Gross Exposure (%)", defaultValue: 175 },
  { key: "equity_delta_net_exposure", label: "Equity Delta Net Exposure (%)", defaultValue: 50 },
  { key: "equity_beta_net_exposure", label: "Equity Beta Adj Net Exposure (%)", defaultValue: 20 },
  { key: "drawdown", label: "Drawdown (%)", defaultValue: 8 },
  { key: "var_99", label: "VaR 99% (%)", defaultValue: 2 },
  { key: "top_10_issuer_threshold", label: "Top 10 Issuer Threshold (%)", defaultValue: 25 },
  { key: "top_10_issuer_guideline", label: "Top 10 Issuer Guideline (%)", defaultValue: 35 },
  { key: "issuer_delta_net_exposure", label: "Issuer Delta Net Exposure (%)", defaultValue: 10 },
  { key: "liquidity_days", label: "Liquidity Days (%)", defaultValue: 95 },
];

/** Build a storage key for persisting guidelines per fund combo */
const getStorageKey = (funds: string[]) =>
  `risk_guidelines_${[...funds].sort().join("_")}`;

/** Load saved guidelines from localStorage */
const loadSavedGuidelines = (funds: string[]): Record<string, number> | null => {
  try {
    const raw = localStorage.getItem(getStorageKey(funds));
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

/** Save guidelines to localStorage */
const saveGuidelinesToStorage = (funds: string[], guidelines: Record<string, number>) => {
  localStorage.setItem(getStorageKey(funds), JSON.stringify(guidelines));
};

/* ── Section config ── */

interface SectionConfig {
  firstColKey: string;
  firstColLabel: string;
  valueKey: string;
  valueLabel: string;
  summaryLabel?: string;
}

const SECTION_CONFIG: Record<string, SectionConfig> = {
  delta_gross_exposure: {
    firstColKey: "fund", firstColLabel: "Fund",
    valueKey: "delta_adjusted_gross_exposure", valueLabel: "Delta Adjusted Gross Exposure",
    summaryLabel: "Delta Gross Exposure",
  },
  equity_delta_net_exposure: {
    firstColKey: "fund", firstColLabel: "Fund",
    valueKey: "delta_adjusted_net_exposure", valueLabel: "Delta Adjusted Net Exposure",
    summaryLabel: "Delta Net Exposure",
  },
  equity_beta_net_exposure: {
    firstColKey: "fund", firstColLabel: "Fund",
    valueKey: "beta_net_exposure", valueLabel: "Beta Net Exposure",
    summaryLabel: "Beta Adj Net Exposure",
  },
  drawdown: {
    firstColKey: "fund", firstColLabel: "Fund",
    valueKey: "drawdown", valueLabel: "Drawdown",
    summaryLabel: "Drawdown",
  },
  var_99: {
    firstColKey: "fund", firstColLabel: "Fund",
    valueKey: "var", valueLabel: "VaR",
    summaryLabel: "VaR (99%)",
  },
  top_10_issuer_delta_net_exposure: {
    firstColKey: "issuer", firstColLabel: "Issuer",
    valueKey: "delta_adjusted_net_exposure", valueLabel: "Delta Adjusted Net Exposure",
  },
  issuer_delta_net_exposure: {
    firstColKey: "issuer", firstColLabel: "Issuer",
    valueKey: "delta_adjusted_net_exposure", valueLabel: "Delta Adjusted Net Exposure",
  },
  liquidity: {
    firstColKey: "fund", firstColLabel: "Fund",
    valueKey: "liquidity_waterfall", valueLabel: "Liquidity (Waterfall)",
  },
};

const SECTION_CARD_THEME: Record<string, { accent: string; soft: string; icon: string }> = {
  delta_gross_exposure: { accent: "#b91c1c", soft: "#fff5f5", icon: "DG" },
  equity_delta_net_exposure: { accent: "#0f766e", soft: "#f0fdfa", icon: "EN" },
  equity_beta_net_exposure: { accent: "#1d4ed8", soft: "#eff6ff", icon: "BN" },
  drawdown: { accent: "#b45309", soft: "#fff7ed", icon: "DD" },
  var_99: { accent: "#14532d", soft: "#f0fdf4", icon: "VR" },
};

const DEFAULT_CARD_THEME = { accent: "#475569", soft: "#f8fafc", icon: "??" };

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

const STATUS_COLORS: Record<Status, string> = {
  breach: "#dc2626",
  warning: "#f39c12",
  safe: "#14532d",
};

const shiftDate = (dateStr: string, days: number): string => {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + days);
  return d.toISOString().split("T")[0];
};

const SUMMARY_ELIGIBLE_KEYS = [
  "delta_gross_exposure",
  "equity_delta_net_exposure",
  "equity_beta_net_exposure",
  "drawdown",
  "var_99",
];

const EXPOSURE_BAR_KEYS = new Set([
  "top_10_issuer_delta_net_exposure",
  "issuer_delta_net_exposure",
]);

/* ── Merge helpers ── */

const mergeResponses = (responses: TriggersResponse[]): TriggersResponse => {
  const merged: TriggersResponse = { limits: {}, current_levels: {} };

  for (const resp of responses) {
    for (const [key, section] of Object.entries(resp.limits || {})) {
      if (!merged.limits[key]) {
        merged.limits[key] = { title: section.title, data: [...(section.data || [])] };
      } else {
        merged.limits[key].data = [...merged.limits[key].data, ...(section.data || [])];
      }
    }

    for (const [key, section] of Object.entries(resp.current_levels || {})) {
      if (!merged.current_levels[key]) {
        merged.current_levels[key] = {
          title: section.title,
          guideline: section.guideline,
          data: [...(section.data || [])],
        };
      } else {
        if (section.guideline != null) {
          merged.current_levels[key].guideline = Math.max(
            merged.current_levels[key].guideline ?? 0,
            section.guideline
          );
        }
        merged.current_levels[key].data = [
          ...merged.current_levels[key].data,
          ...(section.data || []),
        ];
      }
    }
  }

  return merged;
};

/* ── Component ── */

const RiskTriggers: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const initialFund = searchParams.get("fund") || "";
  const initialDate = searchParams.get("date") || "";

  const [portfolios, setPortfolios] = useState<string[]>([]);
  const [selectedFunds, setSelectedFunds] = useState<string[]>(
    initialFund ? [initialFund] : ["BHM"]
  );
  const [selectedDate, setSelectedDate] = useState(initialDate);
  const [data, setData] = useState<TriggersResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Guidelines state
  const [guidelinesExpanded, setGuidelinesExpanded] = useState(false);
  const [editGuidelines, setEditGuidelines] = useState<Record<string, string>>({});
  const [savedGuidelines, setSavedGuidelines] = useState<Record<string, number>>({});
  const [savingGuidelines, setSavingGuidelines] = useState(false);

  // Build the default guidelines map
  const defaultGuidelines = GUIDELINE_FIELDS.reduce<Record<string, number>>((acc, f) => {
    acc[f.key] = f.defaultValue;
    return acc;
  }, {});

  // Load saved guidelines when funds change
  useEffect(() => {
    if (selectedFunds.length === 0) return;
    const saved = loadSavedGuidelines(selectedFunds);
    if (saved) {
      setSavedGuidelines(saved);
      // Convert saved numbers to string map for edit fields
      const asStrings: Record<string, string> = {};
      for (const [k, v] of Object.entries(saved)) asStrings[k] = String(v);
      setEditGuidelines(asStrings);
    } else {
      setSavedGuidelines({});
      setEditGuidelines({});
    }
  }, [selectedFunds.join(",")]);

  /** Get the active guidelines (saved overrides merged with defaults) */
  const getActiveGuidelines = useCallback((): Record<string, number> => {
    return { ...defaultGuidelines, ...savedGuidelines };
  }, [savedGuidelines]);

  useEffect(() => {
    const fetchPortfolios = async () => {
      try {
        const res = await fetch(`${apiUrl}/api/distinct_portfolio_positions/`, {
          headers: getAuthHeaders(),
        });
        if (!res.ok) throw new Error("Failed to fetch portfolios");
        const result = await res.json();
        setPortfolios(result.portfolios || []);
        if (!selectedDate && result.max_position_date) setSelectedDate(result.max_position_date);
        if (selectedFunds.length === 0 && result.portfolios?.length > 0) {
          const hasBHM = result.portfolios.includes("BHM");
          setSelectedFunds(hasBHM ? ["BHM"] : [result.portfolios[0]]);
        }
      } catch (err: any) {
        setError(err.message || "Failed to load portfolios");
      }
    };
    fetchPortfolios();
  }, []);

  const fetchTriggers = useCallback(async () => {
    if (selectedFunds.length === 0 || !selectedDate) return;
    setLoading(true);
    setError("");
    try {
      const activeGuidelines = getActiveGuidelines();
      const responses = await Promise.all(
        selectedFunds.map(async (fund) => {
          const res = await fetch(`${apiUrl}/api/portfolio_risk_triggers_by_fund/`, {
            method: "POST",
            headers: getAuthHeaders("application/json"),
            body: JSON.stringify({
              date: selectedDate,
              fund: [fund],
              guidelines: activeGuidelines,
            }),
          });
          if (!res.ok) {
            const errData = await res.json().catch(() => ({}));
            throw new Error(errData.error || `Failed to fetch triggers for ${fund}`);
          }
          return (await res.json()) as TriggersResponse;
        })
      );
      const merged = mergeResponses(responses);
      setData(merged);
    } catch (err: any) {
      setError(err.message || "Failed to load triggers");
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [selectedFunds, selectedDate, getActiveGuidelines]);

  useEffect(() => { fetchTriggers(); }, [fetchTriggers]);

  /** Get the effective guideline for a section from API data */
  const getGuideline = (sectionKey: string): number | undefined => {
    return data?.current_levels?.[sectionKey]?.guideline;
  };

  /** Handle editing a guideline field */
  const handleEditGuidelineChange = (key: string, value: string) => {
    setEditGuidelines((prev) => ({ ...prev, [key]: value }));
  };

  /** Save guidelines — persist to localStorage and re-fetch with new values */
  const handleSaveGuidelines = async () => {
    // Convert string values to numbers, skipping empty fields (use defaults)
    const toSave: Record<string, number> = {};
    for (const [k, v] of Object.entries(editGuidelines)) {
      const num = parseFloat(v);
      if (Number.isFinite(num)) toSave[k] = num;
    }
    setSavingGuidelines(true);
    try {
      saveGuidelinesToStorage(selectedFunds, toSave);
      setSavedGuidelines(toSave);
      setGuidelinesExpanded(false);
    } finally {
      setSavingGuidelines(false);
    }
  };

  /** Reset guidelines to defaults */
  const handleResetGuidelines = () => {
    // Reset edit fields to show default values
    const defaults: Record<string, string> = {};
    for (const f of GUIDELINE_FIELDS) defaults[f.key] = String(f.defaultValue);
    setEditGuidelines(defaults);
    setSavedGuidelines({});
    localStorage.removeItem(getStorageKey(selectedFunds));
  };

  /* ── Summary cards ── */
  const getSummaryCards = () => {
    if (!data?.current_levels) return [];
    return SUMMARY_ELIGIBLE_KEYS
      .filter((key) => data.current_levels[key])
      .map((key) => {
        const section = data.current_levels[key];
        const cfg = SECTION_CONFIG[key];
        if (!cfg) return null;
        const allRows = section.data || [];
        if (allRows.length === 0) return null;
        const numVals = allRows.map((r) => parseNumericValue(r[cfg.valueKey]));
        const maxAbsVal = Math.max(...numVals.map(Math.abs));
        const maxRow = allRows[numVals.indexOf(maxAbsVal)] || allRows[0];
        const rawVal = maxRow[cfg.valueKey];
        const guideline = getGuideline(key);
        const status = getStatus(maxAbsVal, guideline);
        return {
          key,
          label: cfg.summaryLabel || key,
          value: typeof rawVal === "string" ? rawVal : `${rawVal}%`,
          limit: guideline ? `${guideline.toFixed(1)}%` : undefined,
          status,
          ratio: guideline ? Math.min(maxAbsVal / guideline, 1) : 0,
        };
      })
      .filter(Boolean) as { key: string; label: string; value: string; limit?: string; status: Status; ratio: number; }[];
  };

  const renderTrendIcon = (status: Status) => {
    if (status === "breach" || status === "warning")
      return <span className="trig-trend trig-trend--up">&#8599;</span>;
    return <span className="trig-trend trig-trend--flat">&#8212;</span>;
  };

  const renderValuePill = (rawVal: any, guideline: number | undefined, isLiquidity: boolean) => {
    const numVal = parseNumericValue(rawVal);
    const status = isLiquidity ? "safe" as Status : getStatus(numVal, guideline);
    const displayVal = isLiquidity ? (typeof rawVal === "number" ? rawVal.toFixed(2) : rawVal) : rawVal;
    return (
      <Box className="trig-val-cell">
        {renderTrendIcon(status)}
        <span className={`trig-pill trig-pill--${status}`}>{displayVal}</span>
      </Box>
    );
  };

  const renderCurrentLevelTable = (sectionKey: string, section: SectionData) => {
    const cfg = SECTION_CONFIG[sectionKey];
    const firstColKey = cfg?.firstColKey || "fund";
    const firstColLabel = cfg?.firstColLabel || "Fund";
    const valueKey = cfg?.valueKey || sectionKey;
    const valueLabel = cfg?.valueLabel || sectionKey;
    const isLiquidity = sectionKey === "liquidity";
    const titleParts = section.title.split(": Guideline ");
    const titleName = titleParts[0];
    const guidelineDisplay = titleParts[1] || (section.guideline ? `${section.guideline}%` : null);
    const guideline = getGuideline(sectionKey);

    if (isLiquidity) {
      return (
        <Box key={sectionKey} className="trig-metric">
          <Box className="trig-metric-head">
            <Typography className="trig-metric-name">{titleName}</Typography>
            {guidelineDisplay && <span className="trig-guideline-tag">Guideline {guidelineDisplay}</span>}
          </Box>
          <Box className="trig-liq-scroll">
            <Box className="trig-liq-grid">
              {!section.data || section.data.length === 0 ? (
                <Typography className="trig-empty">No data</Typography>
              ) : (
                section.data.map((row: any, i: number) => {
                  const rawVal = row[valueKey];
                  const isTotalRow = row[firstColKey] === "Total";
                  return (
                    <Box
                      key={i}
                      className={`trig-liq-card ${isTotalRow ? "trig-liq-card--total" : ""}`}
                    >
                      <Typography className="trig-liq-fund">{row[firstColKey]}</Typography>
                      <Box className="trig-liq-value-wrap">
                        <span className="trig-liq-value">{rawVal}</span>
                      </Box>
                    </Box>
                  );
                })
              )}
            </Box>
          </Box>
        </Box>
      );
    }

    return (
      <Box key={sectionKey} className="trig-metric">
        <Box className="trig-metric-head">
          <Typography className="trig-metric-name">{titleName}</Typography>
          {guidelineDisplay && <span className="trig-guideline-tag">Guideline {guidelineDisplay}</span>}
        </Box>
        <table className="trig-table">
          <thead>
            <tr>
              <th className="trig-th-l">{firstColLabel.toUpperCase()}</th>
              <th className="trig-th-r">{valueLabel.toUpperCase()}</th>
            </tr>
          </thead>
          <tbody>
            {!section.data || section.data.length === 0 ? (
              <tr><td colSpan={2} className="trig-empty">No data</td></tr>
            ) : (
              section.data.map((row: any, i: number) => {
                const rawVal = row[valueKey];
                const isTotalRow = row[firstColKey] === "Total";
                return (
                  <tr key={i} className={isTotalRow ? "trig-total-row" : ""}>
                    <td className={`trig-td-l ${isTotalRow ? "trig-total-cell" : ""}`}>{row[firstColKey]}</td>
                    <td className={`trig-td-r ${isTotalRow ? "trig-total-cell" : ""}`}>
                      {isTotalRow
                        ? <span className="trig-total-val">{rawVal}</span>
                        : renderValuePill(rawVal, guideline, isLiquidity)}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </Box>
    );
  };

  const renderCurrentLevelCard = (sectionKey: string, section: SectionData) => {
    const cfg = SECTION_CONFIG[sectionKey];
    if (!cfg || !section.data?.length) return null;
    const guideline = getGuideline(sectionKey);
    const theme = SECTION_CARD_THEME[sectionKey] || DEFAULT_CARD_THEME;
    const titleParts = section.title.split(": Guideline ");
    const titleName = titleParts[0];
    const subtitle = cfg.valueLabel;

    return (
      <Box
        key={sectionKey}
        className="trig-mini-card"
        style={
          {
            "--card-accent": theme.accent,
            "--card-soft": theme.soft,
          } as React.CSSProperties
        }
      >
        <Box className="trig-mini-card-head">
          <Box className="trig-mini-card-title-wrap">
            <span className="trig-mini-card-icon">{theme.icon}</span>
            <Typography className="trig-mini-card-title">{titleName}</Typography>
          </Box>
          {guideline != null && (
            <span className="trig-mini-guideline">{guideline.toFixed(1)}%</span>
          )}
        </Box>
        <Typography className="trig-mini-card-subtitle">{subtitle}</Typography>

        {section.data.map((row, idx) => {
          const rawVal = row[cfg.valueKey];
          const numVal = parseNumericValue(rawVal);
          const status = getStatus(numVal, guideline);
          const displayValue = typeof rawVal === "string" ? rawVal : `${rawVal}`;
          const fundName = row[cfg.firstColKey] || "Fund";

          return (
            <Box key={idx} sx={{ mt: idx === 0 ? 0.5 : 0.3 }}>
              <Typography className="trig-mini-card-fund">{fundName}</Typography>
              <Box className="trig-mini-card-value-row">
                <Typography className={`trig-mini-card-value trig-mini-card-value--${status}`}>
                  {displayValue}
                </Typography>
                {renderTrendIcon(status)}
              </Box>
            </Box>
          );
        })}
      </Box>
    );
  };

  const renderExposureBars = (sectionKey: string, section: SectionData) => {
    const cfg = SECTION_CONFIG[sectionKey];
    if (!cfg) return null;
    const titleParts = section.title.split(": Guideline ");
    const rawTitle = titleParts[0];
    const titleName = sectionKey === "issuer_delta_net_exposure" ? `All ${rawTitle}` : rawTitle;
    const guidelineDisplay = titleParts[1] || (section.guideline ? `${section.guideline}%` : null);
    const dataRows = section.data || [];
    const nonTotalRows = dataRows.filter((row) => row[cfg.firstColKey] !== "Total");
    const totalRow = dataRows.find((row) => row[cfg.firstColKey] === "Total");

    return (
      <Box key={sectionKey} className={`trig-bar-section trig-bar-section--${sectionKey}`}>
        <Box className="trig-bar-section-head">
          <Box className="trig-bar-section-title-wrap">
            <span className="trig-bar-section-dot" />
            <Typography className="trig-bar-section-title">{titleName}</Typography>
          </Box>
          {guidelineDisplay && (
            <span className="trig-guideline-tag">Guideline {guidelineDisplay}</span>
          )}
        </Box>

        <Box className="trig-exp-card-scroll">
          <Box className="trig-exp-card-grid">
            {nonTotalRows.length === 0 ? (
              <Typography className="trig-empty">No data</Typography>
            ) : (
              nonTotalRows.map((row, idx) => {
                const rawVal = row[cfg.valueKey];
                const numVal = parseSignedNumericValue(rawVal);
                const isNegative = numVal < 0;
                const label = row[cfg.firstColKey];
                const isBreach = breachedIssuers.has((label || "").trim().toLowerCase());
                return (
                  <Box
                    key={`${sectionKey}-${idx}-${label}`}
                    className={`trig-exp-card ${isNegative ? "trig-exp-card--neg" : ""}`}
                    sx={isBreach ? {
                      borderColor: "#dc2626 !important",
                      borderWidth: "2px !important",
                      backgroundColor: "#fef2f2",
                      position: "relative",
                    } : {}}
                  >
                    {isBreach && (
                      <Box sx={{
                        position: "absolute",
                        top: -8,
                        right: 8,
                        fontSize: 9,
                        fontWeight: 700,
                        color: "#fff",
                        backgroundColor: "#dc2626",
                        borderRadius: "4px",
                        px: 0.6,
                        py: 0.1,
                        lineHeight: 1.4,
                        letterSpacing: 0.3,
                      }}>
                        BREACH
                      </Box>
                    )}
                    <Typography className="trig-exp-card-label">{label}</Typography>
                    <Box className="trig-exp-card-value-wrap">
                      <span className={`trig-exp-card-value ${isBreach ? "trig-exp-card-value--neg" : isNegative ? "trig-exp-card-value--neg" : "trig-exp-card-value--pos"}`}>
                        {rawVal}
                      </span>
                    </Box>
                  </Box>
                );
              })
            )}
          </Box>
        </Box>

        {totalRow && (
          <Box className="trig-bar-total">
            <Typography className="trig-bar-total-label">Total</Typography>
            <Typography className="trig-bar-total-value">{totalRow[cfg.valueKey]}</Typography>
          </Box>
        )}
      </Box>
    );
  };

  /* ── Derive display groups ── */
  const summaryCards = data ? getSummaryCards() : [];
  const currentLevelEntries = data?.current_levels ? Object.entries(data.current_levels) : [];
  const liquidityEntry = currentLevelEntries.find(([k]) => k === "liquidity");
  const exposureEntries = currentLevelEntries.filter(([k]) => EXPOSURE_BAR_KEYS.has(k));
  const cardEntries = currentLevelEntries.filter(([k]) =>
    k !== "liquidity" && !EXPOSURE_BAR_KEYS.has(k)
  );
  const metricsCount = cardEntries.length;

  // Build set of breached issuer names from limits data
  const breachedIssuers = new Set<string>();
  if (data?.limits) {
    for (const limitSection of Object.values(data.limits)) {
      for (const row of limitSection.data || []) {
        if (row.top_10_issuers) {
          breachedIssuers.add(row.top_10_issuers.trim().toLowerCase());
        }
      }
    }
  }

  const fundsLabel =
    selectedFunds.length === 0
      ? "Fund"
      : selectedFunds.length === 1
        ? selectedFunds[0]
        : selectedFunds.length === portfolios.length
          ? "All Funds"
          : `${selectedFunds[0]} +${selectedFunds.length - 1}`;

  // Compare edit values (as numbers) to saved values
  const hasGuidelineChanges = (() => {
    const editAsNumbers: Record<string, number> = {};
    for (const [k, v] of Object.entries(editGuidelines)) {
      const num = parseFloat(v);
      if (Number.isFinite(num)) editAsNumbers[k] = num;
    }
    return JSON.stringify(editAsNumbers) !== JSON.stringify(savedGuidelines);
  })();

  return (
    <Container maxWidth="lg" sx={{ mt: 2, mb: 4 }}>
      {/* ════ HEADER BAR ════ */}
      <Box className="trig-header">
        <Box className="trig-header-left">
          <IconButton onClick={() => navigate(-1)} sx={{ color: "#fff" }}>
            <ArrowBackIcon />
          </IconButton>
          <Typography className="trig-header-title">
            {fundsLabel} Limits and Alerts
          </Typography>
        </Box>
        <Box className="trig-header-right">
          <FormControl size="small" sx={{ minWidth: 140 }}>
            <Select
              value={
                selectedFunds.length === portfolios.length && portfolios.length > 0
                  ? "__ALL__"
                  : selectedFunds.length === 1
                    ? selectedFunds[0]
                    : "__ALL__"
              }
              onChange={(e) => {
                const val = e.target.value;
                if (val === "__ALL__") {
                  setSelectedFunds([...portfolios]);
                } else {
                  setSelectedFunds([val]);
                }
              }}
              sx={{
                color: "#fff",
                ".MuiOutlinedInput-notchedOutline": { borderColor: "rgba(255,255,255,0.3)" },
                "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "rgba(255,255,255,0.5)" },
                ".MuiSvgIcon-root": { color: "#fff" },
                fontSize: 13,
                borderRadius: "8px",
                backgroundColor: "rgba(255,255,255,0.1)",
              }}
              renderValue={(selected) =>
                selected === "__ALL__" ? "All Funds" : selected
              }
            >
              <MenuItem value="__ALL__">All Funds</MenuItem>
              {portfolios.map((p) => (
                <MenuItem key={p} value={p}>{p}</MenuItem>
              ))}
            </Select>
          </FormControl>

          <Box className="trig-header-date-nav">
            <IconButton
              size="small"
              onClick={() => setSelectedDate(shiftDate(selectedDate, -1))}
              sx={{ color: "rgba(255,255,255,0.6)", "&:hover": { color: "#fff" } }}
            >
              <ChevronLeftIcon fontSize="small" />
            </IconButton>
            <TextField
              type="date"
              size="small"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="trig-header-date"
            />
            <IconButton
              size="small"
              onClick={() => setSelectedDate(shiftDate(selectedDate, 1))}
              sx={{ color: "rgba(255,255,255,0.6)", "&:hover": { color: "#fff" } }}
            >
              <ChevronRightIcon fontSize="small" />
            </IconButton>
          </Box>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>{error}</Alert>
      )}

      {/* ════ EDIT GUIDELINES PANEL ════ */}
      <Box
        sx={{
          mt: 2,
          borderRadius: 2,
          border: "1px solid #e2e8f0",
          backgroundColor: "#fff",
          overflow: "hidden",
        }}
      >
        <Box
          onClick={() => setGuidelinesExpanded((prev) => !prev)}
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            px: 2.5,
            py: 1.5,
            cursor: "pointer",
            backgroundColor: guidelinesExpanded ? "#f8fafc" : "#fff",
            "&:hover": { backgroundColor: "#f8fafc" },
            transition: "background-color 0.2s",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <EditIcon sx={{ fontSize: 18, color: "#002060" }} />
            <Typography sx={{ fontWeight: 700, fontSize: 14, color: "#002060" }}>
              Edit Guidelines
            </Typography>
            {Object.keys(savedGuidelines).length > 0 && (
              <Box
                sx={{
                  ml: 1,
                  px: 1,
                  py: 0.2,
                  borderRadius: "10px",
                  backgroundColor: "#dbeafe",
                  fontSize: 11,
                  fontWeight: 600,
                  color: "#1d4ed8",
                }}
              >
                Custom
              </Box>
            )}
          </Box>
          {guidelinesExpanded ? (
            <ExpandLessIcon sx={{ color: "#64748b" }} />
          ) : (
            <ExpandMoreIcon sx={{ color: "#64748b" }} />
          )}
        </Box>

        <Collapse in={guidelinesExpanded}>
          <Box
            sx={{
              px: 2.5,
              py: 2,
              borderTop: "1px solid #e2e8f0",
              backgroundColor: "#f8fafc",
            }}
          >
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
                gap: 2,
              }}
            >
              {GUIDELINE_FIELDS.map((field) => {
                const currentVal = field.key in editGuidelines
                  ? editGuidelines[field.key]
                  : String(defaultGuidelines[field.key]);
                return (
                  <Box key={field.key} sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
                    <Typography sx={{ fontSize: 12, fontWeight: 600, color: "#475569" }}>
                      {field.label}
                    </Typography>
                    <TextField
                      size="small"
                      type="number"
                      value={currentVal}
                      onChange={(e) => handleEditGuidelineChange(field.key, e.target.value)}
                      inputProps={{
                        style: { fontSize: 13, padding: "8px 12px" },
                        step: "0.1",
                      }}
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          borderRadius: "8px",
                          backgroundColor: "#fff",
                          "& fieldset": { borderColor: "#cbd5e1" },
                          "&:hover fieldset": { borderColor: "#94a3b8" },
                          "&.Mui-focused fieldset": { borderColor: "#002060" },
                        },
                      }}
                    />
                  </Box>
                );
              })}
            </Box>

            <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1.5, mt: 2.5, pt: 2, borderTop: "1px solid #e2e8f0" }}>
              <Button
                variant="outlined"
                size="small"
                onClick={handleResetGuidelines}
                sx={{
                  textTransform: "none",
                  borderRadius: "8px",
                  color: "#64748b",
                  borderColor: "#cbd5e1",
                  fontSize: 13,
                  px: 2.5,
                  "&:hover": { borderColor: "#94a3b8", backgroundColor: "#f1f5f9" },
                }}
              >
                Reset to Defaults
              </Button>
              <Button
                variant="contained"
                size="small"
                onClick={handleSaveGuidelines}
                disabled={savingGuidelines || !hasGuidelineChanges}
                startIcon={savingGuidelines ? <CircularProgress size={14} color="inherit" /> : <SaveIcon sx={{ fontSize: 16 }} />}
                sx={{
                  textTransform: "none",
                  borderRadius: "8px",
                  backgroundColor: "#002060",
                  fontSize: 13,
                  px: 2.5,
                  "&:hover": { backgroundColor: "#001540" },
                  "&.Mui-disabled": { backgroundColor: "#94a3b8", color: "#fff" },
                }}
              >
                Save & Apply
              </Button>
            </Box>
          </Box>
        </Collapse>
      </Box>

      {loading && (
        <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
          <CircularProgress sx={{ color: "#002060" }} />
        </Box>
      )}

      {!loading && data && (
        <>
          {/* ════ METRIC CARDS ════ */}
          {cardEntries.length > 0 && (
            <Box className="trig-mini-grid" sx={{ mt: 2 }}>
              {cardEntries.map(([k, s]) => renderCurrentLevelCard(k, s))}
            </Box>
          )}

          {exposureEntries.map(([k, s]) => renderExposureBars(k, s))}

          {liquidityEntry && (
            <Box className="trig-section">
              {renderCurrentLevelTable(liquidityEntry[0], liquidityEntry[1])}
            </Box>
          )}
        </>
      )}
    </Container>
  );
};

export default RiskTriggers;
