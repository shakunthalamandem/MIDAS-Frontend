import React from "react";
import { Box, CircularProgress } from "@mui/material";
import type { HeadlinePnl, DashboardCategory, HeadlineMetricValues } from "./types";
import { formatCurrencyAsK, formatFullCurrency } from "./utils";

interface HeadlinePnLProps {
  data: HeadlinePnl;
  selectedMetric: string;
  onMetricSelect: (metric: string) => void;
  selectedCategory: DashboardCategory;
  onCategorySelect: (category: DashboardCategory) => void;
  metricHeadlineData: HeadlineMetricValues | null;
  metricHeadlineLoading: boolean;
}

const CATEGORY_LABELS: Record<DashboardCategory, string> = {
  pnl: "P&L",
  gross_market_value: "GROSS MARKET VALUE",
  delta_adj_net_mv: "DELTA ADJ. NET MV",
  beta_adj_net_mv: "BETA ADJ. NET MV",
};

const PNL_CARDS = [
  { title: "DTD P&L", valueKey: "dtd_pnl", pctKey: "dtd_pnl_pct", metricKey: "dtd_pnl" },
  { title: "WTD P&L", valueKey: "wtd_pnl", pctKey: "wtd_pnl_pct", metricKey: "wtd_pnl" },
  { title: "MTD P&L", valueKey: "mtd_pnl", pctKey: "mtd_pnl_pct", metricKey: "mtd_pnl" },
  { title: "YTD P&L", valueKey: "ytd_pnl", pctKey: "ytd_pnl_pct", metricKey: "ytd_pnl" },
] as const;

const buildMetricCards = (label: string) => [
  { title: `DTD ${label}`, valueKey: "dtd_value", pctKey: "dtd_pct", metricKey: "dtd" },
  { title: `WTD ${label}`, valueKey: "wtd_value", pctKey: "wtd_pct", metricKey: "wtd" },
  { title: `MTD ${label}`, valueKey: "mtd_value", pctKey: "mtd_pct", metricKey: "mtd" },
  { title: `YTD ${label}`, valueKey: "ytd_value", pctKey: "ytd_pct", metricKey: "ytd" },
];

const CATEGORY_COLORS: Record<DashboardCategory, { positive: string; negative: string }> = {
  pnl: { positive: "#059669", negative: "#dc2626" },
  gross_market_value: { positive: "#2563eb", negative: "#2563eb" },
  delta_adj_net_mv: { positive: "#0891b2", negative: "#0891b2" },
  beta_adj_net_mv: { positive: "#ea580c", negative: "#ea580c" },
};

const toNumber = (value: unknown): number | null => {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }
  return null;
};

const HeadlinePnL: React.FC<HeadlinePnLProps> = ({
  data,
  selectedMetric,
  onMetricSelect,
  selectedCategory,
  onCategorySelect,
  metricHeadlineData,
  metricHeadlineLoading,
}) => {
  const isPnl = selectedCategory === "pnl";
  const sectionTitle = `HEADLINE ${CATEGORY_LABELS[selectedCategory] || "P&L"}`;

  const shortLabel: Record<DashboardCategory, string> = {
    pnl: "P&L",
    gross_market_value: "Gross",
    delta_adj_net_mv: "Delta Adj",
    beta_adj_net_mv: "Beta Adj",
  };

  const cards = isPnl
    ? PNL_CARDS
    : buildMetricCards(shortLabel[selectedCategory]);

  const dataSource: Record<string, any> = isPnl ? data : (metricHeadlineData || {});
  const colors = CATEGORY_COLORS[selectedCategory];

  const handleCardClick = (metricKey: string) => {
    if (isPnl) {
      onCategorySelect("pnl");
    }
    onMetricSelect(metricKey);
  };

  return (
    <Box className="risk-dashboard-section">
      <Box className="risk-dashboard-section-title">{sectionTitle}</Box>

      {!isPnl && metricHeadlineLoading ? (
        <Box className="risk-dashboard-loading" sx={{ minHeight: 100 }}>
          <CircularProgress size={28} />
        </Box>
      ) : (
        <Box className="pnl-cards-grid">
          {cards.map((cfg) => {
            const value = toNumber(dataSource[cfg.valueKey]);
            const pct = toNumber(dataSource[cfg.pctKey]);
            const isPositive = (value ?? 0) >= 0;
            const modifier = isPnl
              ? (isPositive ? "positive" : "negative")
              : "positive"; // non-pnl always uses positive style but with category color
            const isSelected = selectedMetric === cfg.metricKey;
            const selectedBg = isPnl
              ? (isPositive ? colors.positive : colors.negative)
              : colors.positive;
            const textColor = isPnl
              ? (isPositive ? "#10b981" : "#ef4444")
              : selectedBg;

            return (
              <Box
                key={cfg.metricKey}
                className={`pnl-card${isSelected ? "" : ` pnl-card--${modifier}`}${isSelected ? " pnl-card--selected" : ""}`}
                onClick={() => handleCardClick(cfg.metricKey)}
                sx={{
                  cursor: "pointer",
                  ...(!isPnl && !isSelected && {
                    borderLeft: `4px solid ${selectedBg}`,
                  }),
                  ...(isSelected && {
                    background: `${selectedBg} !important`,
                    border: `1px solid ${selectedBg} !important`,
                    borderLeft: `4px solid ${selectedBg} !important`,
                  }),
                }}
              >
                <Box className="pnl-card-header">
                  <Box
                    className={isSelected ? "" : "pnl-card-title"}
                    sx={isSelected ? { fontSize: 14, fontWeight: 700, color: "rgba(255,255,255,0.9)" } : {}}
                  >
                    {cfg.title}
                  </Box>
                </Box>
                <Box>
                  <Box
                    component="span"
                    className={isSelected ? "" : undefined}
                    sx={isSelected
                      ? { fontSize: 20, fontWeight: 700, color: "#fff" }
                      : { fontSize: 20, fontWeight: 700, color: textColor }
                    }
                  >
                    {value === null ? "--" : formatCurrencyAsK(value)}
                  </Box>
                  <Box
                    component="span"
                    className={isSelected ? "" : undefined}
                    sx={isSelected
                      ? { fontSize: 13, fontWeight: 500, color: "rgba(255,255,255,0.8)", ml: 0.75 }
                      : { fontSize: 13, fontWeight: 500, color: textColor, ml: 0.75 }
                    }
                  >
                    {pct === null ? "(--)" : `(${pct.toFixed(2)}%)`}
                  </Box>
                </Box>

                {/* Hover overlay (hidden when selected) */}
                {!isSelected && (
                  <Box
                    className={isPnl
                      ? `pnl-card-hover-overlay pnl-card-hover-overlay--${modifier}`
                      : "pnl-card-hover-overlay"
                    }
                    sx={!isPnl ? {
                      background: `linear-gradient(135deg, ${selectedBg}ee, ${selectedBg}dd) !important`,
                    } : undefined}
                  >
                    <Box className="pnl-card-hover-label">{cfg.title}</Box>
                    <Box className="pnl-card-hover-value">{value === null ? "--" : formatFullCurrency(value)}</Box>
                    <Box className="pnl-card-hover-pct">{pct === null ? "(--)" : `(${pct.toFixed(2)}%)`}</Box>
                  </Box>
                )}
              </Box>
            );
          })}
        </Box>
      )}
    </Box>
  );
};

export default HeadlinePnL;
