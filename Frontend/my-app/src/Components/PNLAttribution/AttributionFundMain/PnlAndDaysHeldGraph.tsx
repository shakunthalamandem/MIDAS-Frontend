import React, { useEffect, useState } from "react";
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  Box,
  Button,
  Card,
  CircularProgress,
  Container,
  Typography,
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

const formatNumber = (value: number): string => {
  const absValue = Math.abs(value);
  const sign = value < 0 ? "-" : "";
  if (absValue >= 1_000_000_000) return `${sign}$${(absValue / 1_000_000_000).toFixed(2)}B`;
  if (absValue >= 1_000_000) return `${sign}$${(absValue / 1_000_000).toFixed(2)}M`;
  if (absValue >= 1_000) return `${sign}$${(absValue / 1_000).toFixed(2)}K`;
  return `${sign}$${absValue.toFixed(0)}`;
};

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const trade: PnlItem = payload[0].payload;

    return (
      <Paper sx={{ p: 2, border: "1px solid #ccc" }}>
        <Typography variant="subtitle2" color="#002060" gutterBottom>
          <b>{trade.client_symbol}</b>
        </Typography>
        <Typography variant="body2" color="#00695c">
          Days Held: <b>{trade.days_held}</b>
        </Typography>
        <Typography variant="body2" color={trade.pnl >= 0 ? "#2e7d32" : "#c62828"}>
          P&L: <b>{formatNumber(trade.pnl)}</b>
        </Typography>
      </Paper>
    );
  }

  return null;
};

const PnlAndDaysHeldGraph: React.FC<Props> = ({ fund }) => {
  const [data, setData] = useState<PnlApiResponse | null>(null);
  const [selectedOption, setSelectedOption] = useState("us_ipo");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const apiUrl = process.env.REACT_APP_API_URL;
  const token = localStorage.getItem("access_token");

  useEffect(() => {
    if (!fund || !apiUrl) return;

    setLoading(true);
    setError("");

    fetch(`${apiUrl}/api/cummulative_pnl/`, {
      method: "POST",
      headers: {
        Authorization: token ? `Bearer ${token}` : "",
        "Content-Type": "application/json",
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

  const getChartData = (): PnlItem[] => {
    if (!data || !data[selectedOption]) return [];
    const raw = data[selectedOption];

    if (typeof raw !== "object") return [];

    return Object.values(raw)
      .flat()
      .filter((item): item is PnlItem => item && "client_symbol" in item && "days_held" in item);
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 3, mb: 4 }}>
      <Card elevation={4} sx={{ p: 4, background: "linear-gradient(to bottom right, #e0f7fa, #fce4ec)" }}>
        <Typography
          variant="h5"
          align="center"
          sx={{
            mb: 2,
            fontWeight: 700,
            background: "linear-gradient(to right, #006060ff, #024e61ff)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
           Days Held vs P&L — {fund}
        </Typography>

        <Box display="flex" gap={2} mb={3} >
          {OPTIONS.map((opt) => (
            <Button
              key={opt.key}
              variant={selectedOption === opt.key ? "contained" : "outlined"}
              onClick={() => setSelectedOption(opt.key)}
              sx={{
                flex: 1,
                textTransform: "none",
                borderColor: "#002060",
                backgroundColor: selectedOption === opt.key ? "#002060" : "transparent",
                color: selectedOption === opt.key ? "#fff" : "#002060",
              }}
            >
              {opt.label}
            </Button>
          ))}
        </Box>

        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" height={300}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Typography color="error">{error}</Typography>
        ) : (
          <ResponsiveContainer width="100%" height={420}>
            <ScatterChart>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                type="number"
                dataKey="days_held"
                domain={[0, 70]}
                tickCount={8}
                tick={{ fill: "#002060", fontSize: 12 }}
                label={{ value: "Days Held", fill: "#002060", offset: -1, position: "insideBottom" }}
              />
              <YAxis
                type="number"
                dataKey="pnl"
                tickFormatter={formatNumber}
                tick={{ fill: "#002060", fontSize: 12 }}
                label={{
                  value: "P&L",
                  angle: -90,
                  position: "insideLeft",
                  fill: "#002060",
                }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Scatter
                name="Tickers"
                data={getChartData()}
                fill="#2979ff"
                shape="circle"
              />
            </ScatterChart>
          </ResponsiveContainer>
        )}
      </Card>
    </Container>
  );
};

export default PnlAndDaysHeldGraph;
