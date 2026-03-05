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
  Button,
  Collapse,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import EditIcon from "@mui/icons-material/Edit";
import CloseIcon from "@mui/icons-material/Close";
import CheckIcon from "@mui/icons-material/Check";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
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

/* ── Guidelines ── */

const DEFAULT_GUIDELINES: Record<string, number> = {
  delta_gross_exposure: 175,
  equity_delta_net_exposure: 50,
  equity_beta_net_exposure: 20,
  drawdown: 8,
  var_99: 2,
  liquidity_days: 95,
  top_10_issuer_threshold: 25,
  top_10_issuer_guideline: 35,
  issuer_delta_net_exposure: 10,
};

const GUIDELINE_LABELS: Record<string, string> = {
  delta_gross_exposure: "Delta Gross Exposure (%)",
  equity_delta_net_exposure: "Equity Delta Net Exposure (%)",
  equity_beta_net_exposure: "Equity Beta Net Exposure (%)",
  drawdown: "Drawdown (%)",
  var_99: "VaR 99% (%)",
  liquidity_days: "Liquidity Days (%)",
  top_10_issuer_threshold: "Top 10 Issuer Threshold (%)",
  top_10_issuer_guideline: "Top 10 Issuer Guideline (%)",
  issuer_delta_net_exposure: "Issuer Delta Net Exposure (%)",
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
    summaryLabel: "Gross Exposure",
  },
  equity_delta_net_exposure: {
    firstColKey: "fund", firstColLabel: "Fund",
    valueKey: "delta_adjusted_net_exposure", valueLabel: "Delta Adjusted Net Exposure",
    summaryLabel: "Net Exposure",
  },
  equity_beta_net_exposure: {
    firstColKey: "fund", firstColLabel: "Fund",
    valueKey: "beta_net_exp", valueLabel: "Beta Net Exposure",
    summaryLabel: "Beta Exposure",
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

const SUMMARY_KEYS = [
  "delta_gross_exposure",
  "equity_delta_net_exposure",
  "equity_beta_net_exposure",
  "var_99",
];

const SECTION_CARD_THEME: Record<string, { accent: string; soft: string; icon: string }> = {
  delta_gross_exposure: { accent: "#b91c1c", soft: "#fff5f5", icon: "DG" },
  equity_delta_net_exposure: { accent: "#0f766e", soft: "#f0fdfa", icon: "EN" },
  equity_beta_net_exposure: { accent: "#1d4ed8", soft: "#eff6ff", icon: "BN" },
  drawdown: { accent: "#b45309", soft: "#fff7ed", icon: "DD" },
  var_99: { accent: "#14532d", soft: "#f0fdf4", icon: "VR" },
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

/* ── Component ── */

const RiskTriggers: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const initialFund = searchParams.get("fund") || "";
  const initialDate = searchParams.get("date") || "";

  const [portfolios, setPortfolios] = useState<string[]>([]);
  const [selectedFund, setSelectedFund] = useState(initialFund);
  const [selectedDate, setSelectedDate] = useState(initialDate);
  const [data, setData] = useState<TriggersResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [guidelines, setGuidelines] = useState<Record<string, number>>({ ...DEFAULT_GUIDELINES });
  const [editGuidelines, setEditGuidelines] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {};
    for (const [k, v] of Object.entries(DEFAULT_GUIDELINES)) init[k] = String(v);
    return init;
  });
  const [editMode, setEditMode] = useState(false);

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
        if (!selectedFund && result.portfolios?.length > 0) setSelectedFund(result.portfolios[0]);
      } catch (err: any) {
        setError(err.message || "Failed to load portfolios");
      }
    };
    fetchPortfolios();
  }, []);

  const fetchTriggers = useCallback(async () => {
    if (!selectedFund || !selectedDate) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${apiUrl}/api/portfolio_risk_triggers_by_fund/`, {
        method: "POST",
        headers: getAuthHeaders("application/json"),
        body: JSON.stringify({ date: selectedDate, fund: [selectedFund], guidelines }),
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || "Failed to fetch triggers data");
      }
      setData(await res.json());
    } catch (err: any) {
      setError(err.message || "Failed to load triggers");
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [selectedFund, selectedDate, guidelines]);

  useEffect(() => { fetchTriggers(); }, [fetchTriggers]);

  const toStringMap = (obj: Record<string, number>): Record<string, string> => {
    const m: Record<string, string> = {};
    for (const [k, v] of Object.entries(obj)) m[k] = String(v);
    return m;
  };

  const handleOpenEdit = () => { setEditGuidelines(toStringMap(guidelines)); setEditMode(true); };
  const handleCancelEdit = () => { setEditMode(false); };
  const handleApplyEdit = () => {
    const nums: Record<string, number> = {};
    for (const [k, v] of Object.entries(editGuidelines)) {
      const n = parseFloat(v);
      nums[k] = isNaN(n) ? 0 : n;
    }
    setGuidelines(nums);
    setEditMode(false);
  };
  const handleResetDefaults = () => { setEditGuidelines(toStringMap(DEFAULT_GUIDELINES)); };
  const handleGuidelineChange = (key: string, value: string) => {
    setEditGuidelines((prev) => ({ ...prev, [key]: value }));
  };

  const formatDisplayDate = (dateStr: string): string => {
    if (!dateStr) return "";
    const d = new Date(dateStr + "T00:00:00");
    return d.toLocaleDateString("en-US", { month: "numeric", day: "numeric", year: "numeric" });
  };

  /* ── Summary cards ── */
  const getSummaryCards = () => {
    if (!data) return [];
    return SUMMARY_KEYS
      .filter((key) => data.current_levels[key])
      .map((key) => {
        const section = data.current_levels[key];
        const cfg = SECTION_CONFIG[key];
        const row = section.data[0];
        if (!row) return null;
        const rawVal = row[cfg.valueKey];
        const numVal = parseNumericValue(rawVal);
        const guideline = section.guideline;
        const status = getStatus(numVal, guideline);
        return {
          key,
          label: cfg.summaryLabel || key,
          value: typeof rawVal === "string" ? rawVal : `${rawVal}%`,
          limit: guideline ? `${guideline.toFixed(1)}%` : undefined,
          status,
          ratio: guideline ? Math.min(Math.abs(numVal) / guideline, 1) : 0,
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

    if (isLiquidity) {
      return (
        <Box key={sectionKey} className="trig-metric">
          <Box className="trig-metric-head">
            <Typography className="trig-metric-name">{titleName}</Typography>
            {guidelineDisplay && <span className="trig-guideline-tag">Guideline {guidelineDisplay}</span>}
          </Box>
          <Box className="trig-liq-scroll">
            <Box className="trig-liq-grid">
              {section.data.length === 0 ? (
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
      <Box key={sectionKey} className={`trig-metric ${isLiquidity ? "trig-metric--liquidity-sticky" : ""}`}>
        <Box className={`trig-metric-head ${isLiquidity ? "trig-metric-head--sticky" : ""}`}>
          <Typography className="trig-metric-name">{titleName}</Typography>
          {guidelineDisplay && <span className="trig-guideline-tag">Guideline {guidelineDisplay}</span>}
        </Box>
        <Box className={isLiquidity ? "trig-table-scroll-500" : ""}>
          <table className={`trig-table ${isLiquidity ? "trig-table--scroll-body" : ""}`}>
            <thead>
              <tr>
                <th className="trig-th-l">{firstColLabel.toUpperCase()}</th>
                <th className="trig-th-r">{valueLabel.toUpperCase()}</th>
              </tr>
            </thead>
            <tbody>
              {section.data.length === 0 ? (
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
                          : renderValuePill(rawVal, section.guideline, isLiquidity)}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </Box>
      </Box>
    );
  };

  const renderCurrentLevelCard = (sectionKey: string, section: SectionData) => {
    const cfg = SECTION_CONFIG[sectionKey];
    if (!cfg || !section.data?.length) return null;
    const row = section.data[0];
    const rawVal = row[cfg.valueKey];
    const numVal = parseNumericValue(rawVal);
    const status = getStatus(numVal, section.guideline);
    const titleParts = section.title.split(": Guideline ");
    const titleName = titleParts[0];
    const subtitle = cfg.valueLabel;
    const displayValue = typeof rawVal === "string" ? rawVal : `${rawVal}`;
    const fundName = row[cfg.firstColKey] || selectedFund || "Fund";
    const theme = SECTION_CARD_THEME[sectionKey] || SECTION_CARD_THEME.var_99;

    return (
      <Box
        key={sectionKey}
        className={`trig-mini-card trig-mini-card--${status}`}
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
          {section.guideline != null && (
            <span className="trig-mini-guideline">{section.guideline.toFixed(1)}%</span>
          )}
        </Box>
        <Typography className="trig-mini-card-subtitle">{subtitle}</Typography>
        <Typography className="trig-mini-card-fund">{fundName}</Typography>
        <Box className="trig-mini-card-value-row">
          <Typography className={`trig-mini-card-value trig-mini-card-value--${status}`}>
            {displayValue}
          </Typography>
          {renderTrendIcon(status)}
        </Box>
      </Box>
    );
  };

  const renderExposureBars = (sectionKey: string, section: SectionData) => {
    const cfg = SECTION_CONFIG[sectionKey];
    if (!cfg) return null;
    const titleParts = section.title.split(": Guideline ");
    const titleName = titleParts[0];
    const dataRows = section.data || [];
    const nonTotalRows = dataRows.filter((row) => row[cfg.firstColKey] !== "Total");
    const totalRow = dataRows.find((row) => row[cfg.firstColKey] === "Total");
    const maxAbs = Math.max(
      ...nonTotalRows.map((row) => Math.abs(parseSignedNumericValue(row[cfg.valueKey]))),
      1
    );

    return (
      <Box key={sectionKey} className={`trig-bar-section trig-bar-section--${sectionKey}`}>
        <Box className="trig-bar-section-head">
          <Box className="trig-bar-section-title-wrap">
            <span className="trig-bar-section-dot" />
            <Typography className="trig-bar-section-title">{titleName}</Typography>
          </Box>
          {section.guideline != null && (
            <span className="trig-guideline-tag">Guideline {section.guideline.toFixed(1)}%</span>
          )}
        </Box>

        <Box className="trig-bar-list">
          {nonTotalRows.length === 0 ? (
            <Typography className="trig-empty">No data</Typography>
          ) : (
            nonTotalRows.map((row, idx) => {
              const rawVal = row[cfg.valueKey];
              const numVal = parseSignedNumericValue(rawVal);
              const widthPct = Math.max((Math.abs(numVal) / maxAbs) * 100, 6);
              const isNegative = numVal < 0;
              const label = row[cfg.firstColKey];
              return (
                <Box
                  key={`${sectionKey}-${idx}-${label}`}
                  className={`trig-exp-item ${isNegative ? "trig-exp-item--neg" : "trig-exp-item--pos"}`}
                >
                  <Box
                    className={`trig-exp-item-fill ${isNegative ? "trig-exp-item-fill--neg" : "trig-exp-item-fill--pos"}`}
                    style={{ width: `${Math.min(widthPct, 100)}%` }}
                  />
                  <Box className="trig-exp-item-content">
                    <Box className="trig-exp-item-left">
                      <Typography className="trig-exp-label">{label}</Typography>
                    </Box>
                    <Typography className={`trig-exp-value ${isNegative ? "trig-exp-value--neg" : "trig-exp-value--pos"}`}>
                      {rawVal}
                    </Typography>
                  </Box>
                </Box>
              );
            })
          )}
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

  const summaryCards = data ? getSummaryCards() : [];
  const currentLevelEntries = data ? Object.entries(data.current_levels) : [];
  const liquidityEntry = currentLevelEntries.find(([k]) => k === "liquidity");
  const exposureEntries = currentLevelEntries.filter(([k]) =>
    k === "top_10_issuer_delta_net_exposure" || k === "issuer_delta_net_exposure"
  );
  const cardEntries = currentLevelEntries.filter(([k]) =>
    k !== "liquidity" &&
    k !== "top_10_issuer_delta_net_exposure" &&
    k !== "issuer_delta_net_exposure"
  );
  const metricsCount = cardEntries.length;

  return (
    <Container maxWidth="lg" sx={{ mt: 2, mb: 4 }}>
      {/* ════ HEADER BAR ════ */}
      <Box className="trig-header">
        <Box className="trig-header-left">
          <IconButton onClick={() => navigate(-1)} sx={{ color: "#fff" }}>
            <ArrowBackIcon />
          </IconButton>
          <Typography className="trig-header-title">
            {selectedFund || "Fund"} Limits and Alerts
          </Typography>
        </Box>
        <Box className="trig-header-right">
          <TextField
            select
            size="small"
            value={selectedFund}
            onChange={(e) => setSelectedFund(e.target.value)}
            className="trig-header-select"
          >
            {portfolios.map((p) => (
              <MenuItem key={p} value={p}>{p}</MenuItem>
            ))}
          </TextField>

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

          <Button
            variant={editMode ? "contained" : "outlined"}
            size="small"
            startIcon={editMode ? <CloseIcon /> : <EditIcon />}
            onClick={editMode ? handleCancelEdit : handleOpenEdit}
            className="trig-header-edit-btn"
          >
            {editMode ? "Cancel" : "Edit"}
          </Button>
        </Box>
      </Box>

      {/* ════ EDIT GUIDELINES PANEL ════ */}
      <Collapse in={editMode}>
        <Box className="trig-edit-panel">
          <Box className="trig-edit-head">
            <Typography className="trig-edit-title">Edit Guideline Thresholds</Typography>
            <Box className="trig-edit-actions">
              <Button size="small" onClick={handleResetDefaults} className="trig-edit-reset">
                Reset Defaults
              </Button>
              <Button
                variant="contained"
                size="small"
                startIcon={<CheckIcon />}
                onClick={handleApplyEdit}
                className="trig-edit-apply"
              >
                Apply
              </Button>
            </Box>
          </Box>
          <Box className="trig-edit-grid">
            {Object.entries(editGuidelines).map(([key, val]) => (
              <Box key={key} className="trig-edit-field">
                <Typography className="trig-edit-label">{GUIDELINE_LABELS[key] || key}</Typography>
                <TextField
                  size="small"
                  type="number"
                  value={val}
                  onChange={(e) => handleGuidelineChange(key, e.target.value)}
                  className="trig-edit-input"
                  inputProps={{ step: "0.1" }}
                />
              </Box>
            ))}
          </Box>
        </Box>
      </Collapse>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>{error}</Alert>
      )}

      {loading && (
        <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
          <CircularProgress sx={{ color: "#002060" }} />
        </Box>
      )}

      {!loading && data && (
        <>
          {/* ════ SUMMARY CARDS ════ */}
          {summaryCards.length > 0 && (
            <Box className="trig-cards">
              {summaryCards.map((card) => (
                <Box key={card.key} className={`trig-card trig-card--${card.status}`}>
                  <Box className="trig-card-top">
                    <Typography className="trig-card-label">{card.label.toUpperCase()}</Typography>
                    <Box
                      className="trig-card-gauge"
                      style={{
                        background: `conic-gradient(${STATUS_COLORS[card.status]} ${Math.round(
                          card.ratio * 100
                        )}%, #e2e8f0 0)`,
                      }}
                    >
                      <Box className="trig-card-gauge-inner">
                        {Math.round(card.ratio * 100)}%
                      </Box>
                    </Box>
                  </Box>
                  <Typography className="trig-card-value" style={{ color: STATUS_COLORS[card.status] }}>
                    {card.value}
                  </Typography>
                  {card.limit && (
                    <Typography className="trig-card-limit">Limit: {card.limit}</Typography>
                  )}
                </Box>
              ))}
            </Box>
          )}

          {/* ════ LIMITS SECTION ════ */}
          <Box className="trig-section">
            <Box className="trig-section-head">
              <Box className="trig-section-head-left">
                <Box className="trig-icon trig-icon--warn">&#9888;</Box>
                <Typography className="trig-section-title">Limits</Typography>
              </Box>
              <span className="trig-badge trig-badge--green">Monitoring</span>
            </Box>

            {Object.entries(data.limits).map(([key, limitSection]) => (
              <Box key={key} className="trig-metric">
                <Typography className="trig-metric-name-standalone">{limitSection.title}</Typography>
                <table className="trig-table">
                  <thead>
                    <tr>
                      <th className="trig-th-l">TOP 10 ISSUERS</th>
                      <th className="trig-th-r">DELTA ADJUSTED NET EXPOSURE</th>
                    </tr>
                  </thead>
                  <tbody>
                    {limitSection.data.length === 0 ? (
                      <tr><td colSpan={2} className="trig-empty">No issuers exceed threshold</td></tr>
                    ) : (
                      limitSection.data.map((row, i) => {
                        const numVal = parseNumericValue(row.delta_adjusted_net_exposure);
                        const status = getStatus(numVal, guidelines.top_10_issuer_threshold);
                        return (
                          <tr key={i}>
                            <td className="trig-td-l">{row.top_10_issuers}</td>
                            <td className="trig-td-r">
                              <Box className="trig-val-cell">
                                {renderTrendIcon(status)}
                                <span className={`trig-pill trig-pill--${status}`}>{row.delta_adjusted_net_exposure}</span>
                              </Box>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </Box>
            ))}
          </Box>

          {/* ════ CURRENT LEVELS ════ */}
          <Box className="trig-section">
            <Box className="trig-section-head">
              <Box className="trig-section-head-left">
                <Box className="trig-icon trig-icon--blue">&#9776;</Box>
                <Typography className="trig-section-title">Current Levels</Typography>
              </Box>
              <span className="trig-badge trig-badge--blue">{metricsCount} Metrics</span>
            </Box>
            <Box className="trig-mini-grid">
              {cardEntries.map(([k, s]) => renderCurrentLevelCard(k, s))}
            </Box>
          </Box>

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
