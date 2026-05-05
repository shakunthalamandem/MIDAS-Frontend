import React, { useEffect, useState } from "react";
import {
  Box,
  Paper,
  Typography,
  CircularProgress,
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
import { fetchRealizedVolatility, VolPoint } from "./monthlyDecApi";

interface Props {
  fund?: string;
}

const RealizedVolatilityChart: React.FC<Props> = ({ fund }) => {
  const [data, setData] = useState<VolPoint[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const resp = await fetchRealizedVolatility(fund);
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
  }, [fund]);

  return (
    <Paper elevation={1} sx={{ p: 3, borderRadius: 2 }}>
      <Box mb={2}>
        <Typography variant="subtitle1" sx={{ fontWeight: 700, color: "#1f3a8a" }}>
          YTD Realized Volatility Comparison
        </Typography>
        <Typography variant="caption" sx={{ color: "#6b7280" }}>
          HISTORICAL: YTD VOLATILITY (PORTFOLIO VS S&P)
        </Typography>
      </Box>

      <Box sx={{ height: 320 }}>
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
              <XAxis dataKey="date" tick={{ fontSize: 11 }} minTickGap={20} />
              <YAxis
                tick={{ fontSize: 11 }}
                tickFormatter={(v: number) => `${v.toFixed(0)}%`}
              />
              <Tooltip formatter={(val: number) => `${val.toFixed(2)}%`} />
              <Legend />
              <Line
                type="monotone"
                dataKey="portfolio"
                name="Portfolio"
                stroke="#1f3a8a"
                dot={false}
                strokeWidth={2}
              />
              <Line
                type="monotone"
                dataKey="snp_500"
                name="S&P"
                stroke="#9ca3af"
                strokeDasharray="5 4"
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

export default RealizedVolatilityChart;
