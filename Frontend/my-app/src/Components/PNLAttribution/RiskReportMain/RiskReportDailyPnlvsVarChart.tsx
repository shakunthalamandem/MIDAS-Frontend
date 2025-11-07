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
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface RiskReportDailyPnlvsVarChartProps {
  fund: string;
}

interface RiskReportDailyPnlVsVarPoint {
  date: string;
  pnl_percent: number;
  pnl_percent_neg: number;
  one_year_var_percent_lmv: number;
  one_year_var_percent_lmv_neg: number;
}

const parseNumber = (value: unknown): number => {
  if (typeof value === "number") return value;
  if (typeof value === "string") {
    const parsed = Number.parseFloat(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
};

const ensureNegative = (value: number): number => (value > 0 ? -value : value);
const formatTickLabel = (value: string): string => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-US", {
    month: "short",
    year: "2-digit",
  });
};

const RiskReportDailyPnlvsVarChart: React.FC<RiskReportDailyPnlvsVarChartProps> = ({ fund }) => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<RiskReportDailyPnlVsVarPoint[]>([]);
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
        const chartData: RiskReportDailyPnlVsVarPoint[] = Array.isArray(json.data)
          ? json.data.map((item:any) => {
              const pnlPercent = parseNumber(item.pnl_percent);
              const pnlPercentNeg = ensureNegative(parseNumber(item.pnl_percent_neg));
              const varPercent = parseNumber(item.one_year_var_percent_lmv);
              const varPercentNeg = ensureNegative(parseNumber(item.one_year_var_percent_lmv_neg));
              return {
                date: String(item.date ?? ""),
                pnl_percent: pnlPercent,
                pnl_percent_neg: pnlPercentNeg,
                one_year_var_percent_lmv: varPercent,
                one_year_var_percent_lmv_neg: varPercentNeg,
              };
            })
          : [];
        setData(chartData);
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
        {reportDate ? new Date(reportDate).toLocaleDateString() : "-"}
      </Typography>

      <ResponsiveContainer width="100%" height={400}>
        <AreaChart
          data={[...data].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())}
          margin={{ top: 20, right: 30, left: 0, bottom: 0 }}
        >
          <defs>
            <linearGradient id="colorPnLPos" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#247e00ff" stopOpacity={0.6} />
              <stop offset="95%" stopColor="#247e00ff" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="colorPnLNeg" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#247e00ff" stopOpacity={0.6} />
              <stop offset="95%" stopColor="#247e00ff" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="colorVaRPos" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#999999ff" stopOpacity={0.6} />
              <stop offset="95%" stopColor="#999999ff" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="colorVaRNeg" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#999999ff" stopOpacity={0.6} />
              <stop offset="95%" stopColor="#999999ff" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis dataKey="date" tickFormatter={formatTickLabel} tick={{ fontSize: 11 }} />
          <YAxis tickFormatter={(val) => `${val.toFixed(2)}%`} tick={{ fontSize: 11 }} />
          <Tooltip
            formatter={(val: number) => `${val.toFixed(2)}%`}
            labelFormatter={(label) => new Date(label).toLocaleDateString()}
          />
          <Legend />
          <Area
            type="monotone"
            dataKey="pnl_percent"
            stroke="#247e00ff"
            fillOpacity={1}
            fill="url(#colorPnLPos)"
            name="Daily Net of Hedge P&L (%)"
          />
          <Area
            type="monotone"
            dataKey="pnl_percent_neg"
            stroke="#247e00ff"
            fillOpacity={1}
            fill="url(#colorPnLNeg)"
            name="Daily Net of Hedge P&L Neg (%)"
          />
          <Area
            type="monotone"
            dataKey="one_year_var_percent_lmv"
            stroke="#999999ff"
            fillOpacity={1}
            fill="url(#colorVaRPos)"
            name="1Yr 1% VaR (% of LMV)"
          />
          <Area
            type="monotone"
            dataKey="one_year_var_percent_lmv_neg"
            stroke="#999999ff"
            fillOpacity={1}
            fill="url(#colorVaRNeg)"
            name="1Yr 1% VaR Neg (% of LMV)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </Paper>
  );
};

export default RiskReportDailyPnlvsVarChart;
