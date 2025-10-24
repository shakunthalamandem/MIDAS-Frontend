import React, { useEffect, useState } from "react";
import {
  Paper,
  Typography,
  CircularProgress,
  Box,
} from "@mui/material";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface RiskReportDailyPnlvsVarChartProps {
  fund: string;
}

interface PnLDiffData {
  date: string;
  daily_net_of_hedge_pnl: number;
  one_year_var_percent_lmv: number;
}

const RiskReportDailyPnlvsVarChart: React.FC<RiskReportDailyPnlvsVarChartProps> = ({ fund }) => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<PnLDiffData[]>([]);
  const [reportDate, setReportDate] = useState<string>("");

  useEffect(() => {
    const fetchPnLDiffData = async () => {
      setLoading(true);
      try {
        const apiUrl = process.env.REACT_APP_API_URL;
        const token = localStorage.getItem("access_token");

        const res = await fetch(`${apiUrl}/api/risk_report_pnl_diff_graph/`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : "",
          },
          body: JSON.stringify({ fund }),
        });

        if (!res.ok) {
          throw new Error("Failed to fetch P&L difference data");
        }

        const json = await res.json();
        setData(json.pnl_diff_data || []);
        setReportDate(json.report_date || "");
      } catch (error) {
        console.error("Error fetching P&L difference data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPnLDiffData();
  }, [fund]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight={300}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Paper elevation={3} sx={{ p: 2, borderRadius: 2, backgroundColor: "#f9f9f9", mt: 2 }}>
      <Typography variant="body1" gutterBottom color="#002060" sx={{ fontWeight: "bold" }} align="center">
        Daily Net of Hedge P&L (%) vs. 1Yr 1% VaR (% of LMV) as of{" "}
        {reportDate ? new Date(reportDate).toLocaleDateString() : "—"}
      </Typography>

      <ResponsiveContainer width="100%" height={400}>
        <AreaChart
          data={data.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())}
          margin={{ top: 20, right: 30, left: 0, bottom: 0 }}
        >
          <defs>
            <linearGradient id="colorPnL" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#002060" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#002060" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="colorVaR" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#FF0000" stopOpacity={0.6}/>
              <stop offset="95%" stopColor="#FF0000" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <XAxis dataKey="date" tickFormatter={(date) => new Date(date).toLocaleDateString()} />
          <YAxis tickFormatter={(val) => `${val.toFixed(2)}%`} />
          <Tooltip formatter={(val: number) => `${val.toFixed(2)}%`} labelFormatter={(label) => new Date(label).toLocaleDateString()} />
          <Legend />
          <Area
            type="monotone"
            dataKey="daily_net_of_hedge_pnl"
            stroke="#002060"
            fillOpacity={1}
            fill="url(#colorPnL)"
            name="Daily Net of Hedge P&L (%)"
          />
          <Area
            type="monotone"
            dataKey="one_year_var_percent_lmv"
            stroke="#FF0000"
            fillOpacity={1}
            fill="url(#colorVaR)"
            name="1Yr 1% VaR (% of LMV)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </Paper>
  );
};

export default RiskReportDailyPnlvsVarChart;
