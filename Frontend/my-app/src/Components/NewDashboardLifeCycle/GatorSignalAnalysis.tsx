import React, { useEffect, useState } from "react";
import {
  Box,
  Chip,
  Typography,
  CircularProgress,
  Paper,
  Card,
  CardContent,
  Grid,
} from "@mui/material";
import DashboardStateCard from "./DashboardStateCard";
import BarChartIcon from "@mui/icons-material/BarChart";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import EventNoteIcon from "@mui/icons-material/EventNote";

type GatorSignalAnalysisProps = {
  ticker: string;
};

interface GatorSignalResponse {
  overall_signal: string;
  days_held: number;
  confidence_score: number;
  recommendation: string;
  last_run: string;
}

const GatorSignalAnalysis: React.FC<GatorSignalAnalysisProps> = ({ ticker }) => {
  const [signal, setSignal] = useState<GatorSignalResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const fetchGatorSignal = async () => {
      setLoading(true);
      setError(null);

      try {
        const token = localStorage.getItem("access_token");
        const apiUrl = process.env.REACT_APP_API_URL || "http://localhost:8000";

        const response = await fetch(`${apiUrl}/api/summary_signal_board/`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : "",
          },
          body: JSON.stringify({ ticker }),
        });

        if (!response.ok) {
          throw new Error(`API error: ${response.statusText}`);
        }

        const data: GatorSignalResponse = await response.json();

        if (!cancelled) {
          setSignal(data);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "Failed to fetch Gator Signal"
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchGatorSignal();

    return () => {
      cancelled = true;
    };
  }, [ticker]);

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "400px",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <DashboardStateCard
        variant="missing-field"
        title="Error Loading Gator Signal"
        message={error}
        context={[{ label: "Ticker", value: ticker }]}
      />
    );
  }

  if (!signal) {
    return (
      <DashboardStateCard
        variant="no-data"
        title="No Data Available"
        message="Gator Signal data is not available for this ticker."
        context={[{ label: "Ticker", value: ticker }]}
      />
    );
  }

  const getSignalColor = (
    signalValue: string
  ): "success" | "error" | "warning" => {
    const normalized = signalValue.toLowerCase();
    if (normalized === "long") return "success";
    if (normalized === "short") return "error";
    return "warning";
  };

  const formatLastRun = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString();
    } catch {
      return dateString;
    }
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      {/* Metrics Cards Row */}
      <Grid container spacing={2}>
        {/* Signal Card */}
        <Grid item xs={12} sm={6} md={4}>
          <Card
            sx={{
              borderRadius: 2,
              boxShadow: "0 2px 8px rgba(0, 0, 0, 0.06)",
              transition: "transform 0.2s, boxShadow 0.2s",
              backgroundColor: "#fffbeb",
              borderLeft: "4px solid #f59e0b",
              "&:hover": {
                transform: "translateY(-4px)",
                boxShadow: "0 8px 16px rgba(0, 0, 0, 0.12)",
              },
            }}
          >
            <CardContent sx={{ p: 2 }}>
              <Typography
                variant="caption"
                sx={{
                  fontWeight: 600,
                  color: "#000",
                  fontSize: "0.75rem",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                }}
              >
                Signal
              </Typography>
              <Box sx={{ mt: 1 }}>
                <Chip
                  label={signal.overall_signal}
                  color={getSignalColor(signal.overall_signal)}
                  sx={{
                    fontWeight: 700,
                    fontSize: "0.9rem",
                  }}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

      </Grid>

      {/* Recommendation and Last Run Section */}
      <Paper
        sx={{
          p: 3,
          borderRadius: 2,
          backgroundColor: "#ffffff",
          border: "1px solid #e5e7eb",
          borderLeft: "4px solid #3b82f6",
        }}
      >
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {/* Recommendation */}
          <Box>
            <Typography
              variant="caption"
              sx={{
                fontWeight: 600,
                color: "#000",
                fontSize: "0.75rem",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
                display: "block",
                mb: 1,
              }}
            >
              Recommendation
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: "#374151",
                lineHeight: 1.7,
                fontSize: "0.9rem",
              }}
            >
              {signal.recommendation}
            </Typography>
          </Box>

          {/* Last Run */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 0.8,
              pt: 1,
              borderTop: "1px solid #e5e7eb",
            }}
          >
            <EventNoteIcon sx={{ fontSize: 18, color: "#999" }} />
            <Typography
              variant="caption"
              sx={{
                fontWeight: 500,
                color: "#666",
                fontSize: "0.8rem",
              }}
            >
              Last run {formatLastRun(signal.last_run)}
            </Typography>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};

export default GatorSignalAnalysis;
