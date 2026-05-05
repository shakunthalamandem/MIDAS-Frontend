import React, { useEffect, useState } from "react";
import {
  Box,
  Paper,
  Typography,
  CircularProgress,
} from "@mui/material";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  fetchQuarterlyDealVolume,
  QuarterlyVolumePoint,
} from "./monthlyDecApi";

const formatBn = (v: number) => {
  if (Math.abs(v) >= 1_000_000_000) return `${(v / 1_000_000_000).toFixed(1)}B`;
  if (Math.abs(v) >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`;
  if (Math.abs(v) >= 1_000) return `${(v / 1_000).toFixed(1)}K`;
  return `${v}`;
};

const QuarterlyDealVolumeChart: React.FC = () => {
  const [data, setData] = useState<QuarterlyVolumePoint[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const resp = await fetchQuarterlyDealVolume(2024);
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
  }, []);

  return (
    <Paper elevation={1} sx={{ p: 3, borderRadius: 2 }}>
      <Box mb={2}>
        <Typography variant="subtitle1" sx={{ fontWeight: 700, color: "#1f3a8a" }}>
          Quarterly Deal Volume ($Bn) - 2024 to Latest
        </Typography>
      </Box>

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
            <BarChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="quarter" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} tickFormatter={formatBn} />
              <Tooltip formatter={(v: number) => formatBn(v)} />
              <Legend />
              <Bar dataKey="ipo" name="IPO" stackId="a" fill="#1e3a8a" />
              <Bar dataKey="fo" name="FO" stackId="a" fill="#a5b4fc" />
            </BarChart>
          </ResponsiveContainer>
        )}
      </Box>
    </Paper>
  );
};

export default QuarterlyDealVolumeChart;
