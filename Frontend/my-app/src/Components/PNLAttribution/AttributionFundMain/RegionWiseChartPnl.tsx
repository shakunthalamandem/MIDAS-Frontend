import React, { useEffect, useState } from "react";
import {
  Box,
  Card,
  Container,
  Typography,
  CircularProgress,
} from "@mui/material";

import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  LinearScale,
  Title,
  Tooltip,
  Legend,
  CategoryScale,
  TimeScale,
  ChartOptions,
  ChartData,
} from "chart.js";

import zoomPlugin from "chartjs-plugin-zoom";
import "chartjs-adapter-date-fns";
import { Line } from "react-chartjs-2";
import { motion } from "framer-motion";

ChartJS.register(
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  TimeScale,
  Title,
  Tooltip,
  Legend,
  zoomPlugin
);

type RegionPnlResponse = {
  [region: string]: {
    date: string;
    pnl: number;
  }[];
};

interface Props {
  fund: string;
}

const REGION_COLORS: Record<string, string> = {
  US: "#da7c12",
  APAC: "#b3ca18",
  EMEA: "#1ab1e6",
  "Non-US America": "#000000",
};

// ✅ Format currency with sign (for Y-axis labels)
const formatShortCurrency = (value: number): string => {
  const abs = Math.abs(value);
  const sign = value < 0 ? "-" : "";
  if (abs >= 1_000_000_000) return `${sign}${(abs / 1_000_000_000).toFixed(0)}B`;
  if (abs >= 1_000_000) return `${sign}${(abs / 1_000_000).toFixed(0)}M`;
  if (abs >= 1_000) return `${sign}${(abs / 1_000).toFixed(0)}K`;
  return `${sign}${abs.toFixed(0)}`;
};

const formatCurrency = (value: number): string => {
  const abs = Math.abs(value);
  const sign = value < 0 ? "-" : "";
  if (abs >= 1_000_000_000) return `${sign}$${(abs / 1_000_000_000).toFixed(2)}B`;
  if (abs >= 1_000_000) return `${sign}$${(abs / 1_000_000).toFixed(2)}M`;
  if (abs >= 1_000) return `${sign}$${(abs / 1_000).toFixed(2)}K`;
  return `${sign}$${abs.toFixed(0)}`;
};

const RegionWiseChartPnl: React.FC<Props> = ({ fund }) => {
  const [chartData, setChartData] = useState<ChartData<"line"> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [xMin, setXMin] = useState<number | null>(null);

  const apiUrl = process.env.REACT_APP_API_URL;
  const token = localStorage.getItem("access_token");

  useEffect(() => {
    if (!fund || !apiUrl) return;

    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        const res = await fetch(`${apiUrl}/api/region_pnl_graph/`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : "",
          },
          body: JSON.stringify({ fund }),
        });

        if (!res.ok) throw new Error("Network response was not ok");

        const responseData: RegionPnlResponse = await res.json();
        const regionNames = Object.keys(responseData);
        if (regionNames.length === 0) {
          setChartData(null);
          setLoading(false);
          return;
        }

        const dates = responseData[regionNames[0]].map((entry) =>
          new Date(entry.date).getTime()
        );
        const minDate = Math.min(...dates);
        setXMin(minDate);

        const datasets = regionNames.map((region) => ({
          label: region,
          data: responseData[region].map((entry) => ({
            x: new Date(entry.date).getTime(),
            y: entry.pnl,
          })),
          borderColor: REGION_COLORS[region] || "#888888",
          backgroundColor: REGION_COLORS[region] || "#888888",
          fill: false,
          tension: 0.1,
          pointRadius: 0,
          borderWidth: 2.5,
        }));

        setChartData({ datasets });
      } catch (err) {
        console.error("Failed to fetch region PnL data:", err);
        setError("Failed to fetch data.");
        setChartData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [fund, apiUrl, token]);

  const options: ChartOptions<"line"> = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: "nearest",
      axis: "x",
      intersect: false,
    },
    scales: {
      x: {
        type: "time",
        time: {
          tooltipFormat: "MMM dd yyyy",
          unit: "day",
          displayFormats: {
            day: "MMM dd",
          },
        },
        min: xMin ?? undefined,
        ticks: {
          color: "#002060",
          maxRotation: 0,
          autoSkip: true,
          maxTicksLimit: 10,
        },
        grid: {
          display: false, // ✅ remove vertical grid lines
        },
        title: {
          display: true,
          text: "Date",
          color: "#002060",
          font: {
            weight: "bold",
          },
        },
      },
      y: {
        ticks: {
          callback: (val) => formatShortCurrency(Number(val)),
          color: "#002060",
        },
        grid: {
          display: false, // ✅ remove horizontal grid lines
        },
        title: {
          display: true,
          text: "P&L",
          color: "#002060",
          font: {
            weight: "bold",
          },
        },
      },
    },
    plugins: {
      legend: {
        position: "top",
        labels: {
          font: {
            weight: "bold",
          },
        },
      },
      tooltip: {
        callbacks: {
          label: (context) =>
            `${context.dataset.label}: ${formatCurrency(Number(context.parsed.y))}`,
          title: (context) => {
            if (context.length > 0) {
              const date = context[0].parsed.x;
              return new Date(date).toLocaleDateString(undefined, {
                month: "short",
                day: "numeric",
                year: "numeric",
              });
            }
            return "";
          },
        },
      },
      zoom: {
        limits: {
          x: { min: xMin ?? undefined },
        },
        zoom: {
          wheel: { enabled: true },
          pinch: { enabled: true },
          mode: "x",
        },
        pan: {
          enabled: true,
          mode: "x",
        },
      },
    },
  };

  return (
    <Container maxWidth="xl" sx={{ height: 450 }}>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        style={{ height: "100%" }}
      >
        <Card
          elevation={6}
          sx={{
            p: 3,
            borderRadius: 4,
            background: "linear-gradient(to bottom, #ffffff, #f1f8e9)",
            boxShadow: "0 6px 20px rgba(0,0,0,0.1)",
            height: "100%",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <Typography
            variant="h5"
            gutterBottom
            textAlign="center"
            sx={{
              fontWeight: "bold",
              background: "linear-gradient(to right, #0d47a1, #1976d2)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              mb: 2,
            }}
          >
            2025 {fund} Region-wise Cumulative P&L
          </Typography>

          {loading ? (
            <Box display="flex" justifyContent="center" py={4} flexGrow={1}>
              <CircularProgress />
            </Box>
          ) : error ? (
            <Typography color="error" align="center" flexGrow={1}>
              {error}
            </Typography>
          ) : !chartData ? (
            <Typography align="center" flexGrow={1}>
              No data available
            </Typography>
          ) : (
            <Box sx={{ flexGrow: 1 }}>
              <Line options={options} data={chartData} />
            </Box>
          )}
        </Card>
      </motion.div>
    </Container>
  );
};

export default RegionWiseChartPnl;
