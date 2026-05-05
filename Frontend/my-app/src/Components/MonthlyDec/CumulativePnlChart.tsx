import React, { useEffect, useMemo, useState } from "react";
import {
  Box,
  Paper,
  Typography,
  ToggleButton,
  ToggleButtonGroup,
  CircularProgress,
  Stack,
} from "@mui/material";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  fetchCumulativePnl,
  RangeKey,
  PnlMode,
  CumulativePnlPoint,
} from "./monthlyDecApi";

const RANGES: RangeKey[] = ["YTD", "1M", "3M", "6M", "1Y"];

interface Props {
  fund?: string;
}

const CumulativePnlChart: React.FC<Props> = ({ fund }) => {
  const [range, setRange] = useState<RangeKey>("YTD");
  const [mode, setMode] = useState<PnlMode>("pct_aum");
  const [data, setData] = useState<CumulativePnlPoint[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const resp = await fetchCumulativePnl(range, fund, mode);
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
  }, [range, fund, mode]);

  const yLabel = mode === "pct_aum" ? "Cumulative P&L (% AUM)" : "Cumulative P&L ($)";
  const valueFormatter = useMemo(
    () => (val: number) =>
      mode === "pct_aum" ? `${val.toFixed(2)}%` : `$${val.toLocaleString()}`,
    [mode]
  );

  return (
    <Paper elevation={1} sx={{ p: 3, borderRadius: 2 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={2}>
        <Box>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, color: "#1f3a8a" }}>
            Cumulative P&L (% AUM) vs S&P 500 Return - YTD
          </Typography>
          <Typography variant="caption" sx={{ color: "#6b7280" }}>
            S&P 500 Returns vs MPAM Fund Cumulative P&L (excl. Exchrate)
          </Typography>
        </Box>
        <Stack direction="row" spacing={1}>
          <ToggleButtonGroup
            size="small"
            value={range}
            exclusive
            onChange={(_, v) => v && setRange(v)}
          >
            {RANGES.map((r) => (
              <ToggleButton key={r} value={r} sx={{ textTransform: "none", px: 1.5 }}>
                {r}
              </ToggleButton>
            ))}
          </ToggleButtonGroup>
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
        </Stack>
      </Stack>

      <Box sx={{ height: 360 }}>
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
            <LineChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 11 }}
                minTickGap={20}
              />
              <YAxis
                tick={{ fontSize: 11 }}
                tickFormatter={(v: number) =>
                  mode === "pct_aum" ? `${v.toFixed(1)}%` : `$${v}`
                }
                label={{
                  value: yLabel,
                  angle: -90,
                  position: "insideLeft",
                  style: { fontSize: 11, fill: "#6b7280" },
                }}
              />
              <Tooltip
                formatter={(val: number, name: string) => [valueFormatter(val), name]}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="fund"
                name="Cumulative P&L"
                stroke="#1f3a8a"
                dot={false}
                strokeWidth={2}
              />
              <Line
                type="monotone"
                dataKey="snp_500"
                name="S&P 500 Return"
                stroke="#a78bfa"
                dot={false}
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </Box>
    </Paper>
  );
};

export default CumulativePnlChart;
