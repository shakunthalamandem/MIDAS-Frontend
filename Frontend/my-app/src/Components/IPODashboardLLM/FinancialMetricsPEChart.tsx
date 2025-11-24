// FinancialMetricsPEchart.tsx

import React from "react";
import { Line } from "react-chartjs-2";
import {
  Box,
  CircularProgress,
  Alert,
  Container,
  Card,
  CardContent,
  Typography,
} from "@mui/material";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  TooltipItem,
} from "chart.js";

// Register Chart.js modules
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend);

export interface TickerSeries {
  ticker: string;
  data: { date: string | null; value: number | null }[];
}

interface Props {
  data: TickerSeries[];
  loading: boolean;
  error: string | null;
}

const FinancialMetricsPEchart: React.FC<Props> = ({ data, loading, error }) => {
  // 1️⃣ Extract unique months (YYYY-MM)
  const monthKeys = React.useMemo(() => {
    const allDates = data.flatMap((series) =>
      series.data.map((d) => d.date).filter(Boolean) as string[]
    );
    const months = allDates.map((d) => d.slice(0, 7));
    return Array.from(new Set(months)).sort();
  }, [data]);

  // 2️⃣ Build datasets aligned to month keys
  const chartData = React.useMemo(() => {
    return {
      labels: monthKeys.map((m) => formatMonth(m)),
      datasets: data.map((series) => {
        const map = new Map(
          series.data
            .filter((d) => d.date && d.value !== null)
            .map((d) => [d.date!.slice(0, 7), d.value!])
        );

        return {
          label: series.ticker,
          data: monthKeys.map((m) => map.get(m) ?? null),
          borderColor: getRandomColor(),
          pointRadius: 2,
          tension: 0.2,
        };
      }),
    };
  }, [data, monthKeys]);

  return (
    <Container maxWidth="xl" sx={{ mt: 4, backgroundColor: "#293f7912", borderRadius: 2, p: 2 }}>
      <Card elevation={0} sx={{ backgroundColor: "transparent" }}>
        <CardContent>
          <Typography
            variant="h6"
            gutterBottom
            textAlign="center"
            sx={{ fontWeight: "bold", color: "#002060" }}
          >
            PE Monthly Trend
          </Typography>

          {/* Loading */}
          {loading && (
            <Box display="flex" justifyContent="center" mt={4}>
              <CircularProgress />
            </Box>
          )}

          {/* Error */}
          {error && (
            <Box mt={2}>
              <Alert severity="error">{error}</Alert>
            </Box>
          )}

          {/* No data */}
          {!loading && !error && !data.length && (
            <Box mt={2}>
              <Alert severity="info">No PE data available.</Alert>
            </Box>
          )}

          {/* Chart */}
          {!loading && !error && data.length > 0 && (
            <Box width="100%" height="500px" mt={2}>
              <Line data={chartData} options={chartOptions} />
            </Box>
          )}
        </CardContent>
      </Card>
    </Container>
  );
};

// Random color generator
const getRandomColor = () => {
  const letters = "0123456789ABCDEF";
  let color = "#";
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
};

// Format "YYYY-MM" → "Jan"
function formatMonth(monthStr: string) {
  const [year, month] = monthStr.split("-");
  const date = new Date(parseInt(year), parseInt(month) - 1);
  return date.toLocaleString("en-US", { month: "short" });
}

// Chart Options
const chartOptions: any = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: "top",
    },
    tooltip: {
      animation: false,
      intersect: false,
      mode: "nearest",
      callbacks: {
        title: (items: TooltipItem<"line">[]) => `Month: ${items[0].label}`,
        label: (item: TooltipItem<"line">) => `PE: ${item.formattedValue}`,
      },
    },
  },
  animation: false,
  scales: {
    x: {
      title: { display: true, text: "Month" },
      ticks: { maxRotation: 0, minRotation: 0 },
    },
    y: {
      title: { display: true, text: "PE Ratio" },
    },
  },
};

export default FinancialMetricsPEchart;
