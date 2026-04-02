import React, { useState, useEffect, useRef } from "react";
import { Box, CircularProgress } from "@mui/material";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { AttributionGroupBy, AttributionAreaSeries } from "./types";
import { formatCurrency, formatDate, formatChartXAxis } from "./utils";

const apiUrl = process.env.REACT_APP_API_URL;

type MetricKey = "ytd_pnl" | "net_exp" | "beta_adj_net";

interface AttributionAreaChartsProps {
  selectedFunds: string[];
  selectedDate: string;
  groupBy: AttributionGroupBy;
  accentColor: string;
}

const METRIC_CONFIG: { key: MetricKey; label: string }[] = [
  { key: "ytd_pnl", label: "YTD P&L" },
  { key: "net_exp", label: "Net Exposure" },
  { key: "beta_adj_net", label: "Beta Adj. Net Exposure" },
];

// Distinct colors for stacked areas
const SERIES_COLORS = [
  "#7c3aed", "#2563eb", "#0891b2", "#059669", "#ea580c",
  "#d946ef", "#f59e0b", "#6366f1", "#14b8a6", "#e11d48",
  "#8b5cf6", "#0ea5e9", "#22c55e", "#f97316", "#a855f7",
];

const getAuthHeaders = () => {
  const token = localStorage.getItem("access_token");
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
};

const AttributionAreaCharts: React.FC<AttributionAreaChartsProps> = ({
  selectedFunds,
  selectedDate,
  groupBy,
  accentColor,
}) => {
  const [data, setData] = useState<Record<MetricKey, AttributionAreaSeries[]>>({
    ytd_pnl: [],
    net_exp: [],
    beta_adj_net: [],
  });
  const [loading, setLoading] = useState(false);
  const [showPct, setShowPct] = useState(false);
  const [selectedMetric, setSelectedMetric] = useState<MetricKey>("ytd_pnl");
  const [hiddenSeries, setHiddenSeries] = useState<Set<string>>(new Set());
  const abortRef = useRef<AbortController | null>(null);

  const toggleSeries = (name: string) => {
    setHiddenSeries((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  };

  useEffect(() => {
    if (selectedFunds.length === 0 || !selectedDate) return;

    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);

    const fetchData = async () => {
      try {
        const res = await fetch(
          `${apiUrl}/api/portfolio_attribution_area_chart/`,
          {
            method: "POST",
            headers: getAuthHeaders(),
            body: JSON.stringify({
              date: selectedDate,
              fund: selectedFunds,
              group_by: groupBy,
            }),
            signal: controller.signal,
          }
        );
        if (!res.ok) throw new Error("Failed to fetch area chart data");
        const result = await res.json();
        if (!controller.signal.aborted) {
          setData({
            ytd_pnl: result.ytd_pnl || [],
            net_exp: result.net_exp || [],
            beta_adj_net: result.beta_adj_net || [],
          });
        }
      } catch (err: any) {
        if (err.name === "AbortError") return;
        setData({ ytd_pnl: [], net_exp: [], beta_adj_net: [] });
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };

    fetchData();

    return () => controller.abort();
  }, [selectedFunds, selectedDate, groupBy]);

  const activeSeries = data[selectedMetric];

  // Reset hidden series when metric or groupBy changes
  React.useEffect(() => {
    setHiddenSeries(new Set());
  }, [selectedMetric, groupBy]);

  // Transform series data into recharts-friendly format: array of { date, [name1]: value, [name2]: value, ... }
  const chartData = React.useMemo(() => {
    if (activeSeries.length === 0) return [];

    const dateMap: Record<string, Record<string, number>> = {};
    const valueField = showPct ? "value_pct" : "value";

    for (const series of activeSeries) {
      for (const point of series.data) {
        if (!dateMap[point.date]) dateMap[point.date] = { };
        dateMap[point.date][series.name] = point[valueField];
      }
    }

    return Object.entries(dateMap)
      .map(([date, values]) => ({ date, ...values }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [activeSeries, showPct]);

  const seriesNames = activeSeries.map((s) => s.name);
  const activeLabel = METRIC_CONFIG.find((m) => m.key === selectedMetric)?.label || selectedMetric;

  const formatValue = (value: number) => {
    if (showPct) return `${value.toFixed(2)}%`;
    return formatCurrency(value);
  };

  return (
    <Box className="attr-area-charts-section">
      {/* Header row */}
      <Box className="attr-area-charts-header">
        <Box className="attr-area-charts-title">
          ATTRIBUTION TRENDS BY {groupBy.toUpperCase().replace("_", " ")}
        </Box>
        <Box sx={{ display: "flex", gap: "8px", alignItems: "center" }}>
          {/* $ / % toggle */}
          <Box className="attribution-toggle">
            <Box
              className={`attribution-toggle-btn${!showPct ? " attribution-toggle-btn--active" : ""}`}
              sx={!showPct ? { background: `${accentColor} !important`, color: "#fff !important" } : {}}
              onClick={() => setShowPct(false)}
            >
              $
            </Box>
            <Box
              className={`attribution-toggle-btn${showPct ? " attribution-toggle-btn--active" : ""}`}
              sx={showPct ? { background: `${accentColor} !important`, color: "#fff !important" } : {}}
              onClick={() => setShowPct(true)}
            >
              % AUM
            </Box>
          </Box>
        </Box>
      </Box>

      {/* Metric selector tabs */}
      <Box className="attr-area-metric-tabs">
        {METRIC_CONFIG.map((m) => (
          <Box
            key={m.key}
            className={`attr-area-metric-tab${selectedMetric === m.key ? " attr-area-metric-tab--active" : ""}`}
            sx={
              selectedMetric === m.key
                ? { background: `${accentColor} !important`, color: "#fff !important", borderColor: `${accentColor} !important` }
                : {}
            }
            onClick={() => setSelectedMetric(m.key)}
          >
            {m.label}
          </Box>
        ))}
      </Box>

      {/* Chart */}
      {loading ? (
        <Box className="attr-chart-loading">
          <CircularProgress size={32} />
        </Box>
      ) : chartData.length > 0 ? (
        <Box sx={{ mt: 2 }}>
          <ResponsiveContainer width="100%" height={400}>
            <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 20, bottom: 10 }}>
              <defs>
                {seriesNames.map((name, i) => (
                  <linearGradient
                    key={name}
                    id={`areaGrad-${groupBy}-${i}`}
                    x1="0" y1="0" x2="0" y2="1"
                  >
                    <stop offset="5%" stopColor={SERIES_COLORS[i % SERIES_COLORS.length]} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={SERIES_COLORS[i % SERIES_COLORS.length]} stopOpacity={0.02} />
                  </linearGradient>
                ))}
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis
                dataKey="date"
                tickFormatter={formatChartXAxis}
                tick={{ fontSize: 11, fill: "#64748b" }}
                axisLine={{ stroke: "#e2e8f0" }}
                tickLine={false}
                interval="preserveStartEnd"
              />
              <YAxis
                tickFormatter={formatValue}
                tick={{ fontSize: 11, fill: "#64748b" }}
                axisLine={{ stroke: "#e2e8f0" }}
                tickLine={false}
                width={80}
              />
              <Tooltip
                formatter={(value: number, name: string) => [formatValue(value), name]}
                labelFormatter={(label: string) => formatDate(label)}
                contentStyle={{
                  borderRadius: "10px",
                  border: "1px solid #e2e8f0",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                  fontSize: "12px",
                  fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif",
                }}
              />
              {seriesNames.map((name, i) => {
                const hidden = hiddenSeries.has(name);
                return (
                  <Area
                    key={name}
                    type="monotone"
                    dataKey={name}
                    stackId="1"
                    stroke={hidden ? "transparent" : SERIES_COLORS[i % SERIES_COLORS.length]}
                    strokeWidth={1.5}
                    fill={hidden ? "transparent" : `url(#areaGrad-${groupBy}-${i})`}
                    dot={false}
                    activeDot={hidden ? false : { r: 4, strokeWidth: 1.5 }}
                    hide={hidden}
                  />
                );
              })}
            </AreaChart>
          </ResponsiveContainer>

          {/* Custom clickable legend */}
          <Box
            sx={{
              display: "flex",
              flexWrap: "wrap",
              justifyContent: "center",
              gap: "8px 14px",
              mt: 1.5,
              pb: 0.5,
            }}
          >
            {seriesNames.map((name, i) => {
              const hidden = hiddenSeries.has(name);
              const color = SERIES_COLORS[i % SERIES_COLORS.length];
              return (
                <Box
                  key={name}
                  onClick={() => toggleSeries(name)}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: "5px",
                    cursor: "pointer",
                    opacity: hidden ? 0.35 : 1,
                    transition: "opacity 0.2s",
                    userSelect: "none",
                    px: 1,
                    py: 0.4,
                    borderRadius: "12px",
                    border: `1.5px solid ${hidden ? "#e2e8f0" : color + "55"}`,
                    background: hidden ? "#f8fafc" : color + "12",
                    "&:hover": { opacity: hidden ? 0.55 : 0.8 },
                  }}
                >
                  <Box
                    sx={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      background: hidden ? "#cbd5e1" : color,
                      flexShrink: 0,
                    }}
                  />
                  <Box
                    sx={{
                      fontSize: 11,
                      fontWeight: 600,
                      color: hidden ? "#94a3b8" : color,
                      fontFamily: "Inter, sans-serif",
                      textTransform: "uppercase",
                      letterSpacing: "0.4px",
                    }}
                  >
                    {name}
                  </Box>
                  {hidden && (
                    <Box sx={{ fontSize: 10, color: "#94a3b8", ml: 0.3 }}>●</Box>
                  )}
                </Box>
              );
            })}
          </Box>
        </Box>
      ) : (
        <Box sx={{ textAlign: "center", py: 6, color: "#94a3b8", fontSize: 14 }}>
          No area chart data available
        </Box>
      )}
    </Box>
  );
};

export default AttributionAreaCharts;
