import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Chip,
  CircularProgress,
  Alert,
} from "@mui/material";
import {
  ArrowUpward,
  ArrowDownward,
  TrendingFlat,
} from "@mui/icons-material";

interface InsightCardProps {
  title: string;
  metric: string;
  change: string;
  status: "up" | "down" | "neutral";
  comment: string;
}

const statusIcon = {
  up: <ArrowUpward sx={{ color: "green" }} />,
  down: <ArrowDownward sx={{ color: "red" }} />,
  neutral: <TrendingFlat sx={{ color: "grey.600" }} />,
};

const InsightCard = ({
  title,
  metric,
  change,
  status,
  comment,
}: InsightCardProps) => (
  <Card
    sx={{
      borderRadius: 2,
      borderLeft: `6px solid ${
        status === "up"
          ? "#4caf50"
          : status === "down"
          ? "#f44336"
          : "#90a4ae"
      }`,
      p: 2,
    }}
  >
    <CardContent>
      <Box alignItems="center" justifyContent="space-between">
        <Typography variant="subtitle1" fontWeight="bold">
          {title}
        </Typography>
      </Box>
      <Chip
        icon={statusIcon[status]}
        label={change}
        variant="outlined"
        size="small"
        sx={(theme) => ({
          backgroundColor:
            status === "up"
              ? theme.palette.success.light
              : status === "down"
              ? theme.palette.error.light
              : theme.palette.grey[200],
        })}
      />
      <Typography variant="body1" color="#002060" sx={{ mt: 1 }}>
        {metric}
      </Typography>
      <Typography variant="body2" sx={{ mt: 1 }}>
        {comment}
      </Typography>
    </CardContent>
  </Card>
);

const InsightsMain = () => {
  const [insights, setInsights] = useState<InsightCardProps[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchInsights = async () => {
      setLoading(true);
      setError(null);

      try {
        const apiUrl = process.env.REACT_APP_API_URL;
        const token = localStorage.getItem("access_token");

        if (!apiUrl) {
          throw new Error("API URL is not defined");
        }

        const response = await fetch(`${apiUrl}/api/insights/`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : "",
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch insights");
        }

        const json = await response.json();
        setInsights(json.data || []);
      } catch (err) {
        console.error(err);
        setError("Unable to fetch insights.");
      } finally {
        setLoading(false);
      }
    };

    fetchInsights();
  }, []);

  return (
    <Box sx={{ px: 2, py: 2 }}>
      <Typography
        variant="h5"
        fontWeight="bold"
        align="center"
        gutterBottom
        sx={{ color: "#002060", mb: 3 }}
      >
        AI Market Insights Overview 2025
      </Typography>

      {loading ? (
        <Box display="flex" justifyContent="center" mt={4}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error" sx={{ textAlign: "center" }}>
          {error}
        </Alert>
      ) : insights.length === 0 ? (
        <Alert severity="info" sx={{ textAlign: "center" }}>
          No insights available.
        </Alert>
      ) : (
        <Grid container spacing={2}>
          {insights.map((insight, idx) => (
            <Grid item xs={12} md={6} key={idx}>
              <InsightCard {...insight} />
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
};

export default InsightsMain;
