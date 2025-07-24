import React, { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Cell,
} from "recharts";
import {
  Box,
  Typography,
  CircularProgress,
  Container,
  Card,
  CardContent,
} from "@mui/material";
import { motion } from "framer-motion";

interface Top10ExposureChartProps {
  fund: string;
}

interface ExposureData {
  ticker: string;
  value: number;
}

const formatNumber = (value: number): string => {
  const absValue = Math.abs(value);
  let formattedValue: string;

  if (absValue >= 1e9) {
    formattedValue = `${(absValue / 1e9).toFixed(2)}B`;
  } else if (absValue >= 1e6) {
    formattedValue = `${(absValue / 1e6).toFixed(2)}M`;
  } else if (absValue >= 1e3) {
    formattedValue = `${(absValue / 1e3).toFixed(2)}K`;
  } else {
    formattedValue = absValue.toString();
  }

  return value < 0 ? `-$${formattedValue}` : `$${formattedValue}`;
};

// Add more colors for variety
const COLORS = ["#015368ff"];

const Top10ExposureChart: React.FC<Top10ExposureChartProps> = ({ fund }) => {
  const [data, setData] = useState<ExposureData[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const apiUrl = process.env.REACT_APP_API_URL;
  const token = localStorage.getItem("access_token");

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        const res = await fetch(`${apiUrl}/api/top10_exposures/`, {
          method: "POST",
          headers: {
            Authorization: token ? `Bearer ${token}` : "",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ fund }),
        });

        const result = await res.json();

        if (result?.Top10Exposure) {
          const formattedData = Object.entries(result.Top10Exposure).map(
            ([ticker, value]) => ({
              ticker,
              value: Number(value),
            })
          );
          setData(formattedData);
        } else {
          setError("Invalid response format.");
        }
      } catch (err) {
        console.error("Fetch error:", err);
        setError("Failed to fetch data.");
      } finally {
        setLoading(false);
      }
    };

    if (fund) {
      fetchData();
    }
  }, [fund, apiUrl, token]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" p={2}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={2}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ mt: 2, mb: 4 }}>
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Card
          sx={{
             background: "linear-gradient(to bottom, #e3f2fd, #fce4ec)",

            boxShadow: 4,
            borderRadius: 4,
            p: 2,
          }}
        >
          <CardContent>
            <Typography
              variant="h6"
              sx={{
                color: "#002060",
                fontWeight: 600,
                mb: 2,
              }}
              align="center"
            >
              Equities Top 10 Stocks by Exposure for {fund}
            </Typography>

            <Box display="flex" justifyContent="flex-start">
              <ResponsiveContainer width="100%" height={400}>
                <BarChart
                  data={data}
                  layout="vertical"
                  margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                >
                  <XAxis
                    type="number"
                    tickFormatter={formatNumber}
                    tick={{ fill: "#002060", fontWeight: 400 }} // Set X-axis tick color
                  />
                  <YAxis
                    type="category"
                    dataKey="ticker"
                    tickMargin={15}
                    interval={0}
                    width={120}
                    tick={{ fill: "#ff7300ff", fontWeight: 400 }} // Set Y-axis tick color
                    style={{ whiteSpace: "nowrap" }}
                  />
                  <Tooltip
                    formatter={(value: number) => formatNumber(value)}
                    labelStyle={{ color: "#003674ff", fontWeight: 400 }} // Tooltip label color
                    itemStyle={{ color: "#4c93afff", fontWeight: 400 }} // Tooltip value color
                  />

                  <Bar dataKey="value" barSize={20} isAnimationActive>
                    {data.map((_, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </CardContent>
        </Card>
      </motion.div>
    </Container>
  );
};

export default Top10ExposureChart;
