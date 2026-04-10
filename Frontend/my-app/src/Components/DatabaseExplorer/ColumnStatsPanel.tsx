import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
  IconButton,
  CircularProgress,
  LinearProgress,
  Chip,
  Divider,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import BarChartIcon from "@mui/icons-material/BarChart";
import KeyIcon from "@mui/icons-material/Key";

const API_URL = process.env.REACT_APP_API_URL;

const getHeaders = () => {
  const token = localStorage.getItem("access_token");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

interface ColumnStatsPanelProps {
  table: string;
  column: string;
  onClose: () => void;
}

interface StatsData {
  column: string;
  type: string;
  total_rows: number;
  distinct_count: number;
  null_count: number;
  min?: number | string;
  max?: number | string;
  avg?: number;
  top_values: { value: any; count: number }[];
}

const ColumnStatsPanel: React.FC<ColumnStatsPanelProps> = ({ table, column, onClose }) => {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `${API_URL}/api/db_explorer_stats/?table=${table}&column=${column}`,
          { headers: getHeaders() }
        );
        if (res.ok) {
          setStats(await res.json());
        }
      } catch (err) {
        console.error("Failed to fetch stats:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [table, column]);

  const nullPct = stats ? ((stats.null_count / Math.max(stats.total_rows, 1)) * 100) : 0;
  const maxTopCount = stats?.top_values?.[0]?.count || 1;

  return (
    <Paper
      elevation={0}
      sx={{
        width: 320,
        borderRadius: 3,
        border: "1px solid #e2e8f0",
        overflow: "hidden",
        height: "fit-content",
        maxHeight: 650,
        overflowY: "auto",
      }}
    >
      {/* Header */}
      <Box
        sx={{
          px: 2,
          py: 1.5,
          background: "linear-gradient(135deg, #1e293b, #334155)",
          color: "#fff",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <BarChartIcon sx={{ fontSize: 18 }} />
          <Box>
            <Typography sx={{ fontSize: "0.8rem", fontWeight: 800 }}>{column}</Typography>
            <Typography sx={{ fontSize: "0.6rem", color: "#94a3b8" }}>{stats?.type || "..."}</Typography>
          </Box>
        </Box>
        <IconButton size="small" onClick={onClose} sx={{ color: "#94a3b8" }}>
          <CloseIcon sx={{ fontSize: 16 }} />
        </IconButton>
      </Box>

      {loading ? (
        <Box sx={{ p: 4, textAlign: "center" }}>
          <CircularProgress size={28} />
        </Box>
      ) : stats ? (
        <Box sx={{ p: 2 }}>
          {/* Summary Stats */}
          <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1.5, mb: 2 }}>
            {[
              { label: "Total Rows", value: stats.total_rows.toLocaleString(), color: "#3b82f6" },
              { label: "Distinct", value: stats.distinct_count.toLocaleString(), color: "#8b5cf6" },
              { label: "Null Count", value: stats.null_count.toLocaleString(), color: "#f59e0b" },
              { label: "Fill Rate", value: `${(100 - nullPct).toFixed(1)}%`, color: "#059669" },
            ].map((s, i) => (
              <Box
                key={i}
                sx={{
                  p: 1.5,
                  borderRadius: 2,
                  bgcolor: "#f8fafc",
                  border: "1px solid #f1f5f9",
                }}
              >
                <Typography sx={{ fontSize: "0.58rem", color: "#94a3b8", textTransform: "uppercase", letterSpacing: 0.8, mb: 0.3 }}>
                  {s.label}
                </Typography>
                <Typography sx={{ fontSize: "0.95rem", fontWeight: 800, color: s.color }}>
                  {s.value}
                </Typography>
              </Box>
            ))}
          </Box>

          {/* Null bar */}
          <Box sx={{ mb: 2 }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
              <Typography sx={{ fontSize: "0.65rem", color: "#64748b", fontWeight: 600 }}>Null Distribution</Typography>
              <Typography sx={{ fontSize: "0.65rem", color: "#94a3b8" }}>{nullPct.toFixed(1)}% null</Typography>
            </Box>
            <Box sx={{ height: 8, borderRadius: 4, bgcolor: "#f1f5f9", overflow: "hidden", display: "flex" }}>
              <Box sx={{ width: `${100 - nullPct}%`, bgcolor: "#3b82f6", borderRadius: 4, transition: "width 0.5s" }} />
              <Box sx={{ width: `${nullPct}%`, bgcolor: "#fbbf24", borderRadius: 4, transition: "width 0.5s" }} />
            </Box>
            <Box sx={{ display: "flex", justifyContent: "space-between", mt: 0.3 }}>
              <Typography sx={{ fontSize: "0.55rem", color: "#3b82f6" }}>Filled</Typography>
              <Typography sx={{ fontSize: "0.55rem", color: "#f59e0b" }}>Null</Typography>
            </Box>
          </Box>

          {/* Min / Max / Avg */}
          {(stats.min !== undefined || stats.max !== undefined || stats.avg !== undefined) && (
            <Box sx={{ mb: 2, p: 1.5, bgcolor: "#f0fdf4", borderRadius: 2, border: "1px solid #bbf7d0" }}>
              <Typography sx={{ fontSize: "0.65rem", fontWeight: 700, color: "#065f46", mb: 1, textTransform: "uppercase", letterSpacing: 0.5 }}>
                Range & Average
              </Typography>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
                {stats.min !== undefined && (
                  <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                    <Typography sx={{ fontSize: "0.7rem", color: "#475569" }}>Min</Typography>
                    <Typography sx={{ fontSize: "0.7rem", fontWeight: 700, color: "#059669" }}>{String(stats.min)}</Typography>
                  </Box>
                )}
                {stats.max !== undefined && (
                  <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                    <Typography sx={{ fontSize: "0.7rem", color: "#475569" }}>Max</Typography>
                    <Typography sx={{ fontSize: "0.7rem", fontWeight: 700, color: "#059669" }}>{String(stats.max)}</Typography>
                  </Box>
                )}
                {stats.avg !== undefined && (
                  <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                    <Typography sx={{ fontSize: "0.7rem", color: "#475569" }}>Average</Typography>
                    <Typography sx={{ fontSize: "0.7rem", fontWeight: 700, color: "#059669" }}>{String(stats.avg)}</Typography>
                  </Box>
                )}
              </Box>
            </Box>
          )}

          {/* Top Values */}
          {stats.top_values && stats.top_values.length > 0 && (
            <Box>
              <Typography sx={{ fontSize: "0.65rem", fontWeight: 700, color: "#475569", mb: 1, textTransform: "uppercase", letterSpacing: 0.5 }}>
                Top Values (by frequency)
              </Typography>
              {stats.top_values.map((tv, i) => {
                const pct = (tv.count / maxTopCount) * 100;
                return (
                  <Box key={i} sx={{ mb: 0.8 }}>
                    <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.2 }}>
                      <Typography
                        sx={{
                          fontSize: "0.68rem",
                          color: "#1e293b",
                          fontWeight: 600,
                          maxWidth: "70%",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                        title={String(tv.value)}
                      >
                        {String(tv.value).length > 35 ? String(tv.value).slice(0, 35) + "..." : String(tv.value)}
                      </Typography>
                      <Typography sx={{ fontSize: "0.65rem", color: "#64748b", fontWeight: 600 }}>
                        {tv.count.toLocaleString()}
                      </Typography>
                    </Box>
                    <Box sx={{ height: 4, borderRadius: 2, bgcolor: "#f1f5f9", overflow: "hidden" }}>
                      <Box
                        sx={{
                          width: `${pct}%`,
                          height: "100%",
                          borderRadius: 2,
                          bgcolor: i === 0 ? "#3b82f6" : i === 1 ? "#8b5cf6" : "#94a3b8",
                          transition: "width 0.4s",
                        }}
                      />
                    </Box>
                  </Box>
                );
              })}
            </Box>
          )}
        </Box>
      ) : (
        <Box sx={{ p: 3, textAlign: "center" }}>
          <Typography sx={{ fontSize: "0.78rem", color: "#94a3b8" }}>No stats available</Typography>
        </Box>
      )}
    </Paper>
  );
};

export default ColumnStatsPanel;
