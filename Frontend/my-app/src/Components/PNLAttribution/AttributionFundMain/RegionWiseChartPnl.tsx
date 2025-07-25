import React, { useEffect, useState } from "react";
import {
  Box,
  Card,
  Container,
  Typography,
  CircularProgress,
} from "@mui/material";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Label,
} from "recharts";
import { motion } from "framer-motion"; // ✅ Framer Motion

// Define the API response shape
type RegionPnlResponse = {
  [region: string]: {
    date: string;
    pnl: number;
  }[];
};

interface Props {
  fund: string;
}

// Custom colors for each region
const REGION_COLORS: Record<string, string> = {
  US: "#da7c12",
  APAC: "#b3ca18",
  EMEA: "#1ab1e6",
  "Non-US America": "#000000",
};

// Format PnL values as currency
const formatCurrency = (value: number): string => {
  const abs = Math.abs(value);
  const sign = value < 0 ? "-" : "";
  if (abs >= 1_000_000_000)
    return `${sign}$${(abs / 1_000_000_000).toFixed(2)}B`;
  if (abs >= 1_000_000) return `${sign}$${(abs / 1_000_000).toFixed(2)}M`;
  if (abs >= 1_000) return `${sign}$${(abs / 1_000).toFixed(2)}K`;
  return `${sign}$${abs.toFixed(0)}`;
};

// Custom tooltip renderer
const CustomTooltip = ({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: any[];
  label?: string;
}) => {
  if (active && payload && payload.length > 0) {
    return (
      <Box
        sx={{
          backgroundColor: "#ffffff",
          border: "1px solid #ccc",
          borderRadius: 2,
          padding: 1.5,
          boxShadow: 3,
        }}
      >
        <Typography variant="subtitle2" fontWeight="bold">
          📌 {label}
        </Typography>
        {payload.map((entry, index) => (
          <Box key={index} display="flex" justifyContent="space-between">
            <Typography
              variant="body2"
              sx={{ color: entry.color, fontWeight: 500 }}
            >
              {entry.name}
            </Typography>
            <Typography variant="body2">
              {formatCurrency(entry.value)}
            </Typography>
          </Box>
        ))}
      </Box>
    );
  }
  return null;
};

const RegionWiseChartPnl: React.FC<Props> = ({ fund }) => {
  const [chartData, setChartData] = useState<any[]>([]);
  const [regions, setRegions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

        const dates = responseData[regionNames[0]].map((entry) => entry.date);
        const normalizedData = dates.map((date, index) => {
          const point: any = { date };
          regionNames.forEach((region) => {
            point[region] = responseData[region][index]?.pnl ?? 0;
          });
          return point;
        });

        setChartData(normalizedData);
        setRegions(regionNames);
      } catch (err) {
        console.error("Failed to fetch region PnL data:", err);
        setError("Failed to fetch data.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [fund]);

  return (
    <Container
      maxWidth="xl"
    >
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Card
          elevation={6}
          sx={{
            p: 3,
            borderRadius: 4,
            background: "linear-gradient(to bottom, #ffffff, #f1f8e9)",
            boxShadow: "0 6px 20px rgba(0,0,0,0.1)",
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
            <Box display="flex" justifyContent="center" py={4}>
              <CircularProgress />
            </Box>
          ) : error ? (
            <Typography color="error" align="center">
              {error}
            </Typography>
          ) : chartData.length === 0 ? (
            <Typography align="center">No data available</Typography>
          ) : (
            <ResponsiveContainer width="100%" height={400}>
              <LineChart
                data={chartData}
                margin={{ top: 20, right: 40, bottom: 20, left: 60 }}
              >
                <XAxis
  dataKey="date"
  tick={{ fill: "#002060", fontWeight: 400 }}
  padding={{ left: 2 }}
/>

                <YAxis
                  tickFormatter={formatCurrency}
                  tick={{ fill: "#002060", fontWeight: 400 }}
                >
                  <Label
                    value="P&L"
                    angle={-90}
                    position="insideLeft"
                    offset={-20}
                    style={{
                      textAnchor: "middle",
                      fontWeight: "bold",
                      fill: "#002060",
                    }}
                  />
                </YAxis>
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                {regions.map((region) => (
                  <Line
                    key={region}
                    type="linear"
                    dataKey={region}
                    stroke={REGION_COLORS[region] || "#888888"}
                    strokeWidth={2.5}
                    dot={false}
                    isAnimationActive
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          )}
        </Card>
      </motion.div>
    </Container>
  );
};

export default RegionWiseChartPnl;
