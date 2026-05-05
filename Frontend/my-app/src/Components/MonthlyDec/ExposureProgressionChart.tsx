import React, { useEffect, useMemo, useState } from "react";
import {
  Box,
  Paper,
  Typography,
  CircularProgress,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
} from "@mui/material";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { fetchExposureProgression, ExposurePoint } from "./monthlyDecApi";
import { formatDollarsCompact } from "./monthlyDecFormat";

export type ExposureSeries = "gross" | "delta_net" | "beta_net";
type Mode = "dollars" | "pct_aum";

const TITLE_BY_SERIES: Record<ExposureSeries, { title: string; sub: string; legend: string }> = {
  gross: {
    title: "YTD Gross Market Value Progression",
    sub: "HISTORICAL: YTD GROSS MARKET VALUE",
    legend: "Gross Market Value",
  },
  delta_net: {
    title: "YTD Delta Adj. Net Exposure Progression",
    sub: "HISTORICAL: YTD DELTA ADJ. NET EXPOSURE",
    legend: "Delta Adj. Net Exposure",
  },
  beta_net: {
    title: "YTD Beta Adj. Net Exposure Progression",
    sub: "HISTORICAL: YTD BETA ADJ. NET EXPOSURE",
    legend: "Beta Adj. Net Exposure",
  },
};

interface Props {
  series: ExposureSeries;
  fund?: string;
  /** Optional pre-fetched data to avoid duplicate calls when stacking charts */
  cachedData?: ExposurePoint[] | null;
}

const ExposureProgressionChart: React.FC<Props> = ({ series, fund, cachedData }) => {
  const [data, setData] = useState<ExposurePoint[]>(cachedData || []);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<Mode>("pct_aum");

  useEffect(() => {
    if (cachedData) {
      setData(cachedData);
      return;
    }
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const resp = await fetchExposureProgression(fund);
        if (!cancelled) setData(resp.data || []);
      } catch (e: any) {
        if (!cancelled) setError(e?.message || "Failed to load");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [fund, cachedData]);

  const dataKey = useMemo(() => {
    const base = series === "gross" ? "gross_mv" : series === "delta_net" ? "delta_net" : "beta_net";
    return mode === "pct_aum" ? `${base}_pct` : base;
  }, [series, mode]);

  const meta = TITLE_BY_SERIES[series];

  return (
    <Paper elevation={1} sx={{ p: 3, borderRadius: 2 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={2}>
        <Box>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, color: "#1f3a8a" }}>
            {meta.title}
          </Typography>
          <Typography variant="caption" sx={{ color: "#6b7280", letterSpacing: 0.5 }}>
            {meta.sub}
          </Typography>
        </Box>
        <Stack direction="row" spacing={1} alignItems="center">
          <ToggleButtonGroup
            size="small"
            value={mode}
            exclusive
            onChange={(_, v) => v && setMode(v)}
          >
            <ToggleButton value="dollars" sx={{ textTransform: "none", px: 1.5 }}>
              $
            </ToggleButton>
            <ToggleButton value="pct_aum" sx={{ textTransform: "none", px: 1.5 }}>
              % AUM
            </ToggleButton>
          </ToggleButtonGroup>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 0.5,
              fontSize: 12,
              color: "#1f3a8a",
            }}
          >
            <Box
              sx={{
                width: 10,
                height: 10,
                borderRadius: "50%",
                backgroundColor: "#3b6cb6",
              }}
            />
            {meta.legend}
          </Box>
        </Stack>
      </Stack>

      <Box sx={{ height: 300 }}>
        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" height="100%">
            <CircularProgress size={32} />
          </Box>
        ) : error ? (
          <Typography color="error" align="center" mt={4}>{error}</Typography>
        ) : data.length === 0 ? (
          <Typography align="center" mt={4} color="text.secondary">
            No data available
          </Typography>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id={`grad-${series}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3b6cb6" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="#3b6cb6" stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} minTickGap={30} />
              <YAxis
                tick={{ fontSize: 11 }}
                tickFormatter={(v: number) =>
                  mode === "pct_aum" ? `${v.toFixed(0)}%` : formatDollarsCompact(v)
                }
              />
              <Tooltip
                formatter={(val: number) =>
                  mode === "pct_aum"
                    ? `${val.toFixed(2)}%`
                    : formatDollarsCompact(val)
                }
              />
              <Area
                type="monotone"
                dataKey={dataKey}
                name={meta.legend}
                stroke="#3b6cb6"
                strokeWidth={2}
                fill={`url(#grad-${series})`}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </Box>
    </Paper>
  );
};

export default ExposureProgressionChart;
