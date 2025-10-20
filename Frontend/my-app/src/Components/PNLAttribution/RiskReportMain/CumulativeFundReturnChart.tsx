import React, { useEffect, useState } from "react";
import { Paper, Typography, CircularProgress, Box, Alert } from "@mui/material";
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from "recharts";

interface CumulativeDataItem {
  date: string;
  fund_return: number;
  msci_return: number;
  spx_return: number;
}

interface CumulativeFundReturnChartProps {
  fund: string;
}

const CumulativeFundReturnChart: React.FC<CumulativeFundReturnChartProps> = ({ fund }) => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<CumulativeDataItem[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        const apiUrl = process.env.REACT_APP_API_URL;
        const token = localStorage.getItem("access_token");

        const res = await fetch(`${apiUrl}/api/risk_report_cummulative_chart/`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : "",
          },
          body: JSON.stringify({ fund }),
        });

        if (!res.ok) {
          throw new Error(`API error: ${res.status}`);
        }

        const result = await res.json();
        if (Array.isArray(result)) {
          setData(result);
        } else {
          setError("Invalid data format from API.");
        }
      } catch (err: any) {
        console.error(err);
        setError(err.message || "Failed to fetch cumulative chart data.");
      } finally {
        setLoading(false);
      }
    };

    if (fund) fetchData();
  }, [fund]);

  if (loading)
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}>
        <CircularProgress />
      </Box>
    );

  if (error)
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );

  if (!data.length)
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}>
        <Alert severity="warning">No data available for the selected fund.</Alert>
      </Box>
    );

  return (
    <Paper elevation={3} sx={{ p: 2, borderRadius: 2, backgroundColor: "#f9f9f9" }}>
      <Typography
        variant="h6"
        gutterBottom
        color="#002060"
        align="center"
        bgcolor="#e6f0ff"
        fontWeight={600}
      >
        Cumulative Fund Return vs Market Return
      </Typography>
      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={data}>
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line type="linear" dataKey="fund_return" stroke="#002060" name="Fund Return" />
          <Line type="linear" dataKey="msci_return" stroke="#0070C0" name="MSCI Return" />
          <Line type="linear" dataKey="spx_return" stroke="#00B0F0" name="S&P 500 Return" />
        </LineChart>
      </ResponsiveContainer>
    </Paper>
  );
};

export default CumulativeFundReturnChart;
