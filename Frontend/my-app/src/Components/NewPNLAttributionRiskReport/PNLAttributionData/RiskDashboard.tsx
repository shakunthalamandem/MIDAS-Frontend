import React, { useState, useEffect, useCallback } from "react";
import {
  Box,
  CircularProgress,
  Alert,
  TextField,
  MenuItem,
} from "@mui/material";
import "./RiskDashboard.css";

interface HeadlineRisks {
  aum: number;
  gross_market_value: number;
  gross_market_value_pct: number;
  delta_adj_net_mv: number;
  delta_adj_net_mv_pct: number;
  beta_adj_net_mv: number;
  beta_adj_net_mv_pct: number;
  one_yr_1pct_var: number;
  one_yr_1pct_var_pct: number;
}

interface HeadlinePnl {
  dtd_pnl: number;
  dtd_pnl_pct: number;
  wtd_pnl: number;
  wtd_pnl_pct: number;
  mtd_pnl: number;
  mtd_pnl_pct: number;
  ytd_pnl: number;
  ytd_pnl_pct: number;
}

interface IndexesComparison {
  one_month_beta_sp: number;
  three_month_beta_sp: number;
  one_month_vol: number;
  one_month_sp_vol: number;
  three_month_vol: number;
  three_month_sp_vol: number;
  ytd_vol: number;
  ytd_sp_vol: number;
  drawdown: number;
  sp_drawdown: number;
}

interface DashboardData {
  date: string;
  fund: string;
  headline_risks: HeadlineRisks;
  headline_pnl: HeadlinePnl;
  indexes_comparison: IndexesComparison;
}

interface PortfolioResponse {
  max_position_date: string | null;
  portfolios: string[];
}

const formatCurrency = (value: number): string => {
  const abs = Math.abs(value);
  const sign = value < 0 ? "-" : "";
  if (abs >= 1_000_000_000) return `${sign}$${(abs / 1_000_000_000).toFixed(2)}b`;
  if (abs >= 1_000_000) return `${sign}$${(abs / 1_000_000).toFixed(2)}m`;
  if (abs >= 1_000) return `${sign}$${(abs / 1_000).toFixed(0)}k`;
  return `${sign}$${abs.toFixed(2)}`;
};

const formatPct = (value: number): string => {
  return `(${value.toFixed(2)}%)`;
};

const formatDate = (dateStr: string): string => {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const RiskDashboard: React.FC = () => {
  const [portfolios, setPortfolios] = useState<string[]>([]);
  const [selectedFund, setSelectedFund] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [maxDate, setMaxDate] = useState<string>("");
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");

  const apiUrl = process.env.REACT_APP_API_URL;

  // Fetch portfolios on mount
  useEffect(() => {
    const fetchPortfolios = async () => {
      const token = localStorage.getItem("access_token");
      try {
        const res = await fetch(`${apiUrl}/api/distinct_portfolio_positions/`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!res.ok) throw new Error("Failed to fetch portfolios");
        const result: PortfolioResponse = await res.json();
        setPortfolios(result.portfolios || []);
        if (result.max_position_date) {
          setMaxDate(result.max_position_date);
          setSelectedDate(result.max_position_date);
        }
        if (result.portfolios?.length > 0) {
          setSelectedFund(result.portfolios[0]);
        }
      } catch (err: any) {
        setError(err.message || "Failed to load portfolios");
      }
    };
    fetchPortfolios();
  }, [apiUrl]);

  // Fetch dashboard data when fund or date changes
  const fetchDashboard = useCallback(async () => {
    if (!selectedFund || !selectedDate) return;
    const token = localStorage.getItem("access_token");
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${apiUrl}/api/portfolio_risk_dashboard/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          date: selectedDate,
          fund: selectedFund,
        }),
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || "Failed to fetch dashboard data");
      }
      const result: DashboardData = await res.json();
      setData(result);
    } catch (err: any) {
      setError(err.message || "Failed to load dashboard data");
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [apiUrl, selectedFund, selectedDate]);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  const riskCards = data
    ? [
        {
          label: "AUM",
          value: formatCurrency(data.headline_risks.aum),
          pct: "",
          color: "green",
          icon: "$",
        },
        {
          label: "Gross Market Value",
          value: formatCurrency(data.headline_risks.gross_market_value),
          pct: formatPct(data.headline_risks.gross_market_value_pct),
          color: "blue",
          icon: "📊",
        },
        {
          label: "Delta Adj. Net MV",
          value: formatCurrency(data.headline_risks.delta_adj_net_mv),
          pct: formatPct(data.headline_risks.delta_adj_net_mv_pct),
          color: "cyan",
          icon: "📈",
        },
        {
          label: "Beta Adj. Net MV",
          value: formatCurrency(data.headline_risks.beta_adj_net_mv),
          pct: formatPct(data.headline_risks.beta_adj_net_mv_pct),
          color: "orange",
          icon: "📉",
        },
        {
          label: "1Y 1% VaR",
          value: formatCurrency(data.headline_risks.one_yr_1pct_var),
          pct: formatPct(data.headline_risks.one_yr_1pct_var_pct),
          color: "pink",
          icon: "⊘",
        },
      ]
    : [];

  const pnlCards = data
    ? [
        {
          title: "DTD P&L",
          value: data.headline_pnl.dtd_pnl,
          pct: data.headline_pnl.dtd_pnl_pct,
        },
        {
          title: "WTD P&L",
          value: data.headline_pnl.wtd_pnl,
          pct: data.headline_pnl.wtd_pnl_pct,
        },
        {
          title: "MTD P&L",
          value: data.headline_pnl.mtd_pnl,
          pct: data.headline_pnl.mtd_pnl_pct,
        },
        {
          title: "YTD P&L",
          value: data.headline_pnl.ytd_pnl,
          pct: data.headline_pnl.ytd_pnl_pct,
        },
      ]
    : [];

  const indexCards = data
    ? [
        {
          label: "1m β S&P",
          value: `${data.indexes_comparison.one_month_beta_sp.toFixed(2)}`,
          subValue: "",
          color: "blue",
        },
        {
          label: "3m β S&P",
          value: `${data.indexes_comparison.three_month_beta_sp.toFixed(2)}`,
          subValue: "",
          color: "blue",
        },
        {
          label: "1m Vol / S&P",
          value: `${data.indexes_comparison.one_month_vol.toFixed(2)}%`,
          subValue: `(${data.indexes_comparison.one_month_sp_vol.toFixed(2)}%)`,
          color: "cyan",
        },
        {
          label: "3m Vol / S&P",
          value: `${data.indexes_comparison.three_month_vol.toFixed(2)}%`,
          subValue: `(${data.indexes_comparison.three_month_sp_vol.toFixed(2)}%)`,
          color: "orange",
        },
        {
          label: "YTD Vol / S&P",
          value: `${data.indexes_comparison.ytd_vol.toFixed(2)}%`,
          subValue: `(${data.indexes_comparison.ytd_sp_vol.toFixed(2)}%)`,
          color: "pink",
        },
        {
          label: "Drawdown / S&P",
          value: `${data.indexes_comparison.drawdown.toFixed(2)}%`,
          subValue: `(${data.indexes_comparison.sp_drawdown.toFixed(2)}%)`,
          color: "red",
        },
      ]
    : [];

  return (
    <Box className="risk-dashboard">
      {/* Header Bar */}
      <Box className="risk-dashboard-header">
        <Box className="risk-dashboard-header-left">
          <Box className="risk-dashboard-logo">M</Box>
          <Box>
            <Box className="risk-dashboard-title">{selectedFund ? `${selectedFund} Risk Dashboard` : "Risk Dashboard"}</Box>
            <Box className="risk-dashboard-subtitle">
              Portfolio Analytics &amp; Monitoring
            </Box>
          </Box>
        </Box>

        <Box className="risk-dashboard-header-right">
          {/* Fund Dropdown */}
          <TextField
            select
            size="small"
            label="Fund"
            value={selectedFund}
            onChange={(e) => setSelectedFund(e.target.value)}
            className="risk-dashboard-fund-select"
            sx={{
              minWidth: 200,
              "& .MuiOutlinedInput-root": {
                borderRadius: "20px",
                backgroundColor: "rgba(255,255,255,0.08)",
                color: "#fff",
                "& fieldset": {
                  borderColor: "rgba(255,255,255,0.2)",
                },
                "&:hover fieldset": {
                  borderColor: "rgba(255,255,255,0.4)",
                },
                "&.Mui-focused fieldset": {
                  borderColor: "#10b981",
                },
              },
              "& .MuiInputLabel-root": {
                color: "#a0aec0",
                "&.Mui-focused": { color: "#10b981" },
              },
              "& .MuiSvgIcon-root": { color: "#a0aec0" },
            }}
          >
            {portfolios.map((p) => (
              <MenuItem key={p} value={p}>
                {p}
              </MenuItem>
            ))}
          </TextField>

          {/* AUM Badge */}
          {data && (
            <Box className="risk-dashboard-aum-badge">
              <Box className="risk-dashboard-aum-badge-label">AUM</Box>
              <Box className="risk-dashboard-aum-badge-value">
                {formatCurrency(data.headline_risks.aum)}
              </Box>
            </Box>
          )}

          {/* AS OF Date */}
          {data && (
            <Box className="risk-dashboard-date-badge">
              <Box className="risk-dashboard-date-label">AS OF</Box>
              <Box className="risk-dashboard-date-value">
                {formatDate(data.date)}
              </Box>
            </Box>
          )}

          {/* Live Indicator */}
          <Box className="risk-dashboard-live-indicator">
            <Box className="risk-dashboard-live-dot" />
            <Box className="risk-dashboard-live-text">LIVE</Box>
          </Box>
        </Box>
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" className="risk-dashboard-error" onClose={() => setError("")}>
          {error}
        </Alert>
      )}

      {/* Loading State */}
      {loading && (
        <Box className="risk-dashboard-loading">
          <CircularProgress />
        </Box>
      )}

      {/* Dashboard Content */}
      {!loading && data && (
        <>
          {/* Headline Risks Section */}
          <Box className="risk-dashboard-section">
            <Box className="risk-dashboard-section-title">HEADLINE RISKS</Box>
            <Box className="risk-cards-grid">
              {riskCards.map((card) => (
                <Box key={card.label} className={`risk-card risk-card--${card.color}`}>
                  <Box className={`risk-card-icon risk-card-icon--${card.color}`}>
                    {card.icon}
                  </Box>
                  <Box>
                    <Box className="risk-card-label">{card.label}</Box>
                    <Box className={`risk-card-value risk-card-value--${card.color}`}>
                      {card.value}
                    </Box>
                    {card.pct && <Box className="risk-card-pct">{card.pct}</Box>}
                  </Box>
                </Box>
              ))}
            </Box>
          </Box>

          {/* Headline P&L Section */}
          <Box className="risk-dashboard-section">
            <Box className="risk-dashboard-section-title">HEADLINE P&L</Box>
            <Box className="pnl-cards-grid">
              {pnlCards.map((card) => {
                const isPositive = card.value >= 0;
                const modifier = isPositive ? "positive" : "negative";
                return (
                  <Box
                    key={card.title}
                    className={`pnl-card pnl-card--${modifier}`}
                  >
                    <Box className="pnl-card-header">
                      <Box className="pnl-card-title">{card.title}</Box>
                      <Box className={`pnl-card-arrow pnl-card-arrow--${modifier}`}>
                        {isPositive ? "↗" : "↘"}
                      </Box>
                    </Box>
                    <Box>
                      <Box
                        component="span"
                        className={`pnl-card-value pnl-card-value--${modifier}`}
                      >
                        {formatCurrency(card.value)}
                      </Box>
                      <Box
                        component="span"
                        className={`pnl-card-pct pnl-card-pct--${modifier}`}
                      >
                        ({card.pct.toFixed(2)}%)
                      </Box>
                    </Box>
                  </Box>
                );
              })}
            </Box>
          </Box>

          {/* Indexes Comparison Section */}
          <Box className="risk-dashboard-section">
            <Box className="index-cards-grid">
              {indexCards.map((card) => (
                <Box
                  key={card.label}
                  className={`index-card index-card--${card.color}`}
                >
                  <Box className={`index-card-label index-card-label--${card.color}`}>
                    {card.label}
                  </Box>
                  <Box className="index-card-value">
                    {card.value}
                    {card.subValue && (
                      <Box component="span" className="index-card-sub">
                        {"  "}{card.subValue}
                      </Box>
                    )}
                  </Box>
                </Box>
              ))}
            </Box>
          </Box>
        </>
      )}
    </Box>
  );
};

export default RiskDashboard;
