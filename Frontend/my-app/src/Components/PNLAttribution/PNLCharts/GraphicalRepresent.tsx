import React, { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import {
  Box,
  Typography,
  CircularProgress,
  Grid,
  Paper,
  Container,
} from "@mui/material";

// Types
type ChartPoint = {
  date: string;
  cumulative_pnl: number;
};

type Totals = {
  WTD?: number;
  MTD?: number;
  QTD?: number;
  YTD?: number;
  DTD?: number;
};

type PnLData = {
  wtd: ChartPoint[];
  mtd: ChartPoint[];
  qtd: ChartPoint[];
  ytd: ChartPoint[];
  dtd: ChartPoint[];
  totals: Totals;
};

type GraphicalRepresentProps = {
  appliedFilters: Record<string, any>; // update this type based on your filter shape
};

const GraphicalRepresent: React.FC<GraphicalRepresentProps> = ({
  appliedFilters,
}) => {
  const [data, setData] = useState<PnLData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const token = localStorage.getItem("access_token");
  const apiUrl = process.env.REACT_APP_API_URL;

  const formatValue = (value?: number | null): string => {
    if (value === null || value === undefined) return "-";
    const absValue = Math.abs(value);
    const suffix = absValue >= 1_000_000 ? "M" : absValue >= 1_000 ? "K" : "";
    const divisor = suffix === "M" ? 1_000_000 : suffix === "K" ? 1_000 : 1;
    const formatted = (absValue / divisor).toFixed(2);
    return `${value < 0 ? "-" : ""}$${formatted}${suffix}`;
  };

  const getMaxDate = (points?: ChartPoint[]) => {
    if (!points || points.length === 0) return "-";
    return points.reduce(
      (max, point) => (point.date > max ? point.date : max),
      points[0].date
    );
  };
  const getOrdinalSuffix = (day: number): string => {
    if (day > 3 && day < 21) return "th";
    switch (day % 10) {
      case 1:
        return "st";
      case 2:
        return "nd";
      case 3:
        return "rd";
      default:
        return "th";
    }
  };

  const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    const day = date.getDate();
    const suffix = getOrdinalSuffix(day);
    const month = date.toLocaleString("default", { month: "short" });
    const year = date.getFullYear();
    return `${day}${suffix} ${month} ${year}`;
  };
  useEffect(() => {
    const fetchPnLData = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`${apiUrl}/api/pnls_graphs/`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(appliedFilters),
        });

        if (!response.ok) {
          throw new Error(`Error: ${response.status}`);
        }

        const result = await response.json();
        setData(result);
      } catch (err: any) {
        setError(err.message || "Failed to load data");
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchPnLData();
    } else {
      setError("No access token found.");
      setLoading(false);
    }
  }, [token, apiUrl, appliedFilters]);



  const chartKeys = ["wtd", "mtd", "qtd", "ytd"] as const;

  const renderLineChart = (
    key: (typeof chartKeys)[number],
    chartData: ChartPoint[]
  ) => {
    const total = data?.totals?.[key.toUpperCase() as keyof Totals] || 0;

    return (
      <Grid item xs={12} md={6} key={key} sx={{ boxSizing: "border-box" }}>
        <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
          <Typography
            variant="h6"
            color="#002060"
            sx={{ mb: 1, textAlign: "center", fontWeight: "bold" }}
          >
            Cumulative <span style={{ textTransform: "uppercase" }}>{key}</span>{" "}
            - P&L
          </Typography>

          <Typography
            variant="subtitle2"
            sx={{
              mb: 2,
              color: "text.secondary",
              fontWeight: "bold",
              fontSize: "1.1rem",
            }}
          >
            Total: {formatValue(total)}
          </Typography>

          <ResponsiveContainer width="100%" height={300}>
            <LineChart
              data={chartData}
              margin={{ top: 20, right: 30, left: 30, bottom: 30 }}
            >
              <XAxis
                dataKey="date"
                type="category"
                interval="preserveStartEnd"
                padding={{ left: 0, right: 0 }}
                tickFormatter={(value, index) => (index === 0 ? "" : value)}
              />

              <YAxis
                tickFormatter={formatValue}
                padding={{ top: 10, bottom: 10 }}
              />
              <Tooltip
                formatter={(value: any) => formatValue(value)}
                labelFormatter={(label) => `Date: ${label}`}
              />
              <Legend />
              <Line
                dataKey="cumulative_pnl"
                stroke="#1976d2"
                strokeWidth={2}
                name="Cumulative PNL"
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </Paper>
      </Grid>
    );
  };

  return (
    <Container maxWidth="xl" sx={{ borderRadius: 2 }}>
      <Box
        sx={{
          width: "100%",
          px: { xs: 2, sm: 4, md: 6 },
          boxSizing: "border-box",
          overflowX: "hidden",
        }}
      >
        <Typography
          variant="subtitle1"
          align="right"
          color="#6f1178"
          fontWeight="bold"
          sx={{ mb: 3, mt: 2 }}
        >
          Data As of: {formatDate(getMaxDate(data?.wtd))}
        </Typography>

        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Typography color="error" align="center">
            {error}
          </Typography>
        ) : (
          <Grid container spacing={4}>
            {chartKeys.map(
              (key) =>
                data?.[key] &&
                data[key].length > 0 &&
                renderLineChart(key, data[key])
            )}
          </Grid>
        )}
      </Box>
    </Container>
  );
};

export default GraphicalRepresent;
