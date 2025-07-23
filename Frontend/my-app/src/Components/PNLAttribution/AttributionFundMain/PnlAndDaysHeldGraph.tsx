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

interface PnlItem {
  client_symbol: string;
  pnl: number;
  days_held: number;
}

interface PnlApiResponse {
  trade_date: string;
  [key: string]: string | { [daysHeld: string]: PnlItem[] };
}

type Props = {
  fund: string;
};

const OPTIONS = [
  { key: "us_ipo", label: "US IPO" },
  { key: "us_fo", label: "US FO" },
  { key: "non_us", label: "Non US" },
];

const BUCKET_LABELS = [
  "<5", "5-10", "10-15", "15-20", "20-25", "25-30",
  "30-35", "35-40", "40-45", "45-50", "50-55", "55-60", ">60"
];

const getBucketLabel = (daysHeld: number): string => {
  if (daysHeld < 5) return "<5";
  if (daysHeld > 60) return ">60";

  for (let i = 5; i < 60; i += 5) {
    if (daysHeld >= i && daysHeld < i + 5) {
      return `${i}-${i + 5}`;
    }
  }

  return ">60";
};

const formatNumber = (value: number): string => {
  const absValue = Math.abs(value);
  const sign = value < 0 ? "-" : "";

  if (absValue >= 1_000_000_000) return `${sign}$${(absValue / 1_000_000_000).toFixed(2)}B`;
  if (absValue >= 1_000_000) return `${sign}$${(absValue / 1_000_000).toFixed(2)}M`;
  if (absValue >= 1_000) return `${sign}$${(absValue / 1_000).toFixed(2)}K`;
  return `${sign}$${absValue.toFixed(0)}`;
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length && payload[0].payload.trades) {
    const trades = payload[0].payload.trades;

    return (
      <Paper sx={{ p: 2, border: "1px solid #ccc" }}>
        <Typography fontWeight="bold" gutterBottom>
          Days Held Bucket: {label}
        </Typography>
        {trades.map((trade: PnlItem, idx: number) => (
          <Box key={idx} mb={1}>
            <Typography variant="body2">
              <strong>{trade.client_symbol}</strong>
            </Typography>
            <Typography variant="body2">
              PnL: {formatNumber(trade.pnl)} | Days Held: {trade.days_held}
            </Typography>
          </Box>
        ))}
      </Paper>
    );
  }

  return null;
};

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

    const selectedData = data[selectedOption];

    if (typeof selectedData !== "object" || selectedData === null) {
      return [];
    }

    const allTrades: PnlItem[] = Object.values(selectedData)
      .flat()
      .filter((item): item is PnlItem => item && typeof item === "object" && "pnl" in item);

    const buckets: { [label: string]: { pnl: number; trades: PnlItem[] } } = {};

    for (const label of BUCKET_LABELS) {
      buckets[label] = { pnl: 0, trades: [] };
    }

    for (const trade of allTrades) {
      const label = getBucketLabel(trade.days_held);
      buckets[label].pnl += trade.pnl;
      buckets[label].trades.push(trade);
    }

    return BUCKET_LABELS.map((label) => ({
      daysHeld: label,
      pnl: buckets[label].pnl,
      trades: buckets[label].trades,
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
                backgroundColor: selectedOption === opt.key ? "#002060" : "transparent",
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
            <YAxis tickFormatter={formatNumber} domain={["auto", "auto"]} />
            <Tooltip content={<CustomTooltip />} />
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
