import React, { useState, useEffect, useCallback } from "react";
import { Box, CircularProgress } from "@mui/material";
import type { AttributionItem, AttributionGroupBy } from "./types";
import { formatCurrency } from "./utils";
import AttributionTable from "./AttributionTable";
import "./Attribution.css";

interface AttributionProps {
  selectedFund: string;
  selectedDate: string;
}

const GROUP_BY_TABS: { key: AttributionGroupBy; label: string }[] = [
  { key: "analyst", label: "Analyst" },
  { key: "sector", label: "Sector" },
  { key: "industry", label: "Industry" },
  { key: "holding_period", label: "Holding Period" },
  { key: "issuer", label: "Issuer" },
];

const CARD_THEMES = [
  { border: "#7c3aed", bg: "#faf5ff", metric: "#7c3aed", exposure: "#7c3aed" },
  { border: "#10b981", bg: "#ecfdf5", metric: "#059669", exposure: "#059669" },
  { border: "#a78bfa", bg: "#f5f3ff", metric: "#6d28d9", exposure: "#6d28d9" },
  { border: "#f59e0b", bg: "#fffbeb", metric: "#d97706", exposure: "#d97706" },
  { border: "#ec4899", bg: "#fdf2f8", metric: "#db2777", exposure: "#db2777" },
  { border: "#f5d0a9", bg: "#fffaf0", metric: "#c2410c", exposure: "#c2410c" },
  { border: "#06b6d4", bg: "#ecfeff", metric: "#0891b2", exposure: "#0891b2" },
  { border: "#14b8a6", bg: "#f0fdfa", metric: "#0d9488", exposure: "#0d9488" },
  { border: "#3b82f6", bg: "#eff6ff", metric: "#2563eb", exposure: "#2563eb" },
  { border: "#f97316", bg: "#fff7ed", metric: "#ea580c", exposure: "#ea580c" },
];

const apiUrl = process.env.REACT_APP_API_URL;

const Attribution: React.FC<AttributionProps> = ({
  selectedFund,
  selectedDate,
}) => {
  const [groupBy, setGroupBy] = useState<AttributionGroupBy>("sector");
  const [data, setData] = useState<AttributionItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [showPct, setShowPct] = useState(false);

  const fetchAttribution = useCallback(async () => {
    if (!selectedFund || !selectedDate) return;
    const token = localStorage.getItem("access_token");
    setLoading(true);
    try {
      const res = await fetch(
        `${apiUrl}/api/portfolio_attribution_table_data/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            date: selectedDate,
            fund: selectedFund,
            group_by: groupBy,
          }),
        }
      );
      if (!res.ok) throw new Error("Failed to fetch attribution data");
      const result = await res.json();
      setData(result.attribution || []);
    } catch {
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [selectedFund, selectedDate, groupBy]);

  useEffect(() => {
    fetchAttribution();
  }, [fetchAttribution]);

  const formatValue = (value: number, pctValue: number) => {
    if (showPct) return `${pctValue.toFixed(2)}%`;
    return formatCurrency(value);
  };

  return (
    <Box className="risk-dashboard-section">
      <Box className="attribution-card">
        {/* Header */}
        <Box className="attribution-header">
          <Box className="attribution-title">ATTRIBUTION</Box>
          <Box className="attribution-toggle">
            <Box
              className={`attribution-toggle-btn${!showPct ? " attribution-toggle-btn--active" : ""}`}
              onClick={() => setShowPct(false)}
            >
              $
            </Box>
            <Box
              className={`attribution-toggle-btn${showPct ? " attribution-toggle-btn--active" : ""}`}
              onClick={() => setShowPct(true)}
            >
              % AUM
            </Box>
          </Box>
        </Box>

        {/* Tabs */}
        <Box className="attribution-tabs">
          {GROUP_BY_TABS.map((tab) => (
            <Box
              key={tab.key}
              className={`attribution-tab${groupBy === tab.key ? " attribution-tab--active" : ""}`}
              onClick={() => setGroupBy(tab.key)}
            >
              {tab.label}
            </Box>
          ))}
        </Box>

        {/* Content */}
        {loading ? (
          <Box className="attribution-loading">
            <CircularProgress size={32} />
          </Box>
        ) : data.length > 0 ? (
          groupBy === "issuer" ? (
            <AttributionTable data={data} showPct={showPct} />
          ) : (
            <Box className="attribution-grid">
              {data.map((item, idx) => {
                const theme = CARD_THEMES[idx % CARD_THEMES.length];
                return (
                  <Box
                    key={item.name}
                    className="attribution-item"
                    sx={{
                      borderLeftColor: theme.border,
                      background: theme.bg,
                    }}
                  >
                    <Box className="attribution-item-name">{item.name}</Box>

                    {/* P&L Row */}
                    <Box className="attribution-item-metrics">
                      <Box className="attribution-metric">
                        <Box className="attribution-metric-label">DTD</Box>
                        <Box className="attribution-metric-value" sx={{ color: theme.metric }}>
                          {formatValue(item.dtd_pnl, item.dtd_pnl_pct)}
                        </Box>
                      </Box>
                      <Box className="attribution-metric">
                        <Box className="attribution-metric-label">MTD</Box>
                        <Box className="attribution-metric-value" sx={{ color: theme.metric }}>
                          {formatValue(item.mtd_pnl, item.mtd_pnl_pct)}
                        </Box>
                      </Box>
                      <Box className="attribution-metric">
                        <Box className="attribution-metric-label">YTD</Box>
                        <Box className="attribution-metric-value" sx={{ color: theme.metric }}>
                          {formatValue(item.ytd_pnl, item.ytd_pnl_pct)}
                        </Box>
                      </Box>
                    </Box>

                    {/* Exposure Row */}
                    <Box className="attribution-item-exposures">
                      <Box className="attribution-exposure">
                        <Box className="attribution-exposure-label">Net Exp</Box>
                        <Box className="attribution-exposure-value" sx={{ color: theme.exposure }}>
                          {formatValue(item.net_exp, item.net_exp_pct)}
                        </Box>
                      </Box>
                      <Box className="attribution-exposure">
                        <Box className="attribution-exposure-label">
                          &beta; Adj Net
                        </Box>
                        <Box className="attribution-exposure-value" sx={{ color: theme.exposure }}>
                          {formatValue(item.beta_adj_net, item.beta_adj_net_pct)}
                        </Box>
                      </Box>
                    </Box>
                  </Box>
                );
              })}
            </Box>
          )
        ) : (
          <Box sx={{ textAlign: "center", py: 6, color: "#94a3b8", fontSize: 14 }}>
            No attribution data available
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default Attribution;
