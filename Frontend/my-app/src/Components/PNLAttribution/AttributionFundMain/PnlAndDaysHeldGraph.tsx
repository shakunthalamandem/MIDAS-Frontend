import React, { useEffect, useState } from "react";
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
import {
  Box,
  CircularProgress,
  Typography,
  Button,
  Paper,
} from "@mui/material";

interface PnlApiResponse {
  [key: string]: {
    "<5": number;
    "5-10": number;
    "10-30": number;
    "30-60": number;
    ">60": number;
  };
}

type Props = {
  fund: string;
};

const OPTIONS = [
  { key: "us_ipo", label: "US IPO" },
  { key: "us_fo", label: "US FO" },
  { key: "non_us", label: "Non US" },
];

const formatNumber = (value: number): string => {
  const absValue = Math.abs(value);
  const sign = value < 0 ? "-" : "";

  if (absValue >= 1_000_000_000) return `${sign}$${(absValue / 1_000_000_000).toFixed(2)}B`;
  if (absValue >= 1_000_000) return `${sign}$${(absValue / 1_000_000).toFixed(2)}M`;
  if (absValue >= 1_000) return `${sign}$${(absValue / 1_000).toFixed(2)}K`;
  return `${sign}$${absValue.toFixed(0)}`;
};

const DAYS_HELD_LABELS = ["<5", "5-10", "10-30", "30-60", ">60"];

const PnlAndDaysHeldGraph: React.FC<Props> = ({ fund }) => {
  const [data, setData] = useState<PnlApiResponse | null>(null);
  const [selectedOption, setSelectedOption] = useState<string>("us_ipo");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const apiUrl = process.env.REACT_APP_API_URL;
  const token = localStorage.getItem("access_token");

  useEffect(() => {
    if (!fund || !apiUrl) return;

    setLoading(true);
    setError("");

    fetch(`${apiUrl}/api/cummulative_pnl/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: token ? `Bearer ${token}` : "",
      },
      body: JSON.stringify({ fund }),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Network response was not ok");
        return res.json();
      })
      .then((json) => {
        setData(json);
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to fetch data");
        setLoading(false);
      });
  }, [fund, apiUrl, token]);

  const getChartData = () => {
    if (!data || !data[selectedOption]) return [];

    const record = data[selectedOption] as Record<string, number>;

    return DAYS_HELD_LABELS.map((label) => ({
      daysHeld: label,
      pnl: record[label] ?? 0, // Keep as number for charting
    }));
  };

  return (
    <Paper elevation={4} sx={{ p: 3, mt: 4, borderRadius: 2 }}>
      <Typography variant="h6" color="#002060" mb={2} align="center">
        Cumulative PnL by Days Held
      </Typography>

      <Box display="flex" gap={2} mb={2} width="100%">
        {OPTIONS.map((opt) => (
          <Box key={opt.key} flex={1}>
            <Button
              fullWidth
              variant={selectedOption === opt.key ? "contained" : "outlined"}
              onClick={() => setSelectedOption(opt.key)}
              sx={{
                textTransform: "none",
                backgroundColor:
                  selectedOption === opt.key ? "#002060" : "transparent",
                color: selectedOption === opt.key ? "#fff" : "#002060",
                borderColor: "#002060",
              }}
            >
              {opt.label}
            </Button>
          </Box>
        ))}
      </Box>

      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" height={300}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Typography color="error">{error}</Typography>
      ) : (
        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={getChartData()}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="daysHeld" />
            <YAxis tickFormatter={formatNumber} />
            <Tooltip formatter={(value: number) => formatNumber(value)} />
            <Legend />
            <Line
              type="monotone"
              dataKey="pnl"
              stroke="#1976d2"
              activeDot={{ r: 6 }}
              name="Cumulative PnL"
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </Paper>
  );
};

export default PnlAndDaysHeldGraph;
