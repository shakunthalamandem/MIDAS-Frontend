import React, { useEffect, useState } from "react";
import { Paper, Typography, CircularProgress, Box, Grid } from "@mui/material";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface DailyNetOfHedgeChartProps {
  fund: string;
}

interface ChartDataType {
  labels: string[];
  daily_net_of_hedge: number[];
  mtd_net_of_hedge: number[];
  daily_long_exposure: number[];
}

interface FundAttributionData {
  date: string;
  sector: Record<string, { daily_net_of_hedge: number; mtd_net_of_hedge: number; daily_long_exposure: number }>;
  region: Record<string, { daily_net_of_hedge: number; mtd_net_of_hedge: number; daily_long_exposure: number }>;
  strategy: Record<string, { daily_net_of_hedge: number; mtd_net_of_hedge: number; daily_long_exposure: number }>;
}

const getOrdinalSuffix = (day: number) => {
  if (day >= 11 && day <= 13) return "th";
  switch (day % 10) {
    case 1:
      return "st";
    case 2:
      return "nd";
    case 3:
      return "rd";
    default:
      return "th";
  }
};

const formatDateWithOrdinal = (value: string | undefined) => {
  if (!value) return "-";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  const day = parsed.getDate();
  const suffix = getOrdinalSuffix(day);
  const month = parsed.toLocaleString(undefined, { month: "short" });
  const year = parsed.getFullYear();
  return `${day}${suffix} ${month} ${year}`;
};

const DailyNetOfHedgeChart: React.FC<DailyNetOfHedgeChartProps> = ({ fund }) => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<FundAttributionData | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const apiUrl = process.env.REACT_APP_API_URL;
        const token = localStorage.getItem("access_token");

        const res = await fetch(`${apiUrl}/api/risk_report_daily_pnl/`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token && { Authorization: `Bearer ${token}` }),
          },
          body: JSON.stringify({ fund }),
        });

        if (!res.ok) throw new Error("Failed to fetch chart data");

        const result: FundAttributionData = await res.json();
        setData(result);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [fund]);

  if (loading || !data) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}>
        <CircularProgress />
      </Box>
    );
  }

  // Convert key-value object from backend into Chart.js-compatible arrays
  const mapChartData = (
    dataObj: Record<string, { daily_net_of_hedge: number; mtd_net_of_hedge: number; daily_long_exposure: number }>
  ): ChartDataType => {
    const labels = Object.keys(dataObj);
    return {
      labels,
      daily_net_of_hedge: labels.map((label) => dataObj[label].daily_net_of_hedge),
      mtd_net_of_hedge: labels.map((label) => dataObj[label].mtd_net_of_hedge),
      daily_long_exposure: labels.map((label) => dataObj[label].daily_long_exposure),
    };
  };

  const renderBarChart = (chartData: ChartDataType, title: string) => (
    <Paper sx={{ p: 2, mb: 3, borderRadius: 2, backgroundColor: "#f9f9f9" }}>
      <Typography variant="body1" gutterBottom color="#002060" align="center" fontWeight={600}>
        {title}
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={12} md={4}>
          <Box bgcolor="#e6f0ff" p={1} textAlign="center">
            <Typography variant="subtitle1">Daily Net of Hedge $P&L</Typography>
          </Box>
          <Bar
            data={{
              labels: chartData.labels,
              datasets: [
                {
                  label: "Daily P&L",
                  data: chartData.daily_net_of_hedge,
                  backgroundColor: "#002060",
                },
              ],
            }}
            options={{
              responsive: true,
              plugins: { legend: { display: false } },
              scales: { x: { grid: { display: false } }, y: { grid: { display: false }, beginAtZero: true } },
            }}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <Box bgcolor="#e6f0ff" p={1} textAlign="center">
            <Typography variant="subtitle1">MTD Net of Hedge $P&L</Typography>
          </Box>
          <Bar
            data={{
              labels: chartData.labels,
              datasets: [
                {
                  label: "MTD P&L",
                  data: chartData.mtd_net_of_hedge,
                  backgroundColor: "#0055a5",
                },
              ],
            }}
            options={{
              responsive: true,
              plugins: { legend: { display: false } },
              scales: { x: { grid: { display: false } }, y: { grid: { display: false }, beginAtZero: true } },
            }}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <Box bgcolor="#e6f0ff" p={1} textAlign="center">
            <Typography variant="subtitle1">Daily Long Exposure / LMV (%)</Typography>
          </Box>
          <Bar
            data={{
              labels: chartData.labels,
              datasets: [
                {
                  label: "Exposure %",
                  data: chartData.daily_long_exposure,
                  backgroundColor: "#9eb0ff",
                },
              ],
            }}
            options={{
              responsive: true,
              plugins: { legend: { display: false } },
              scales: { x: { grid: { display: false } }, y: { grid: { display: false }, beginAtZero: true, max: 100 } },
            }}
          />
        </Grid>
      </Grid>
    </Paper>
  );

  const formattedDate = formatDateWithOrdinal(data.date);

  return (
    <Paper sx={{ p: 2, mb: 3, borderRadius: 2, backgroundColor: "#f9f9f9" }}>
      <Typography variant="h6" gutterBottom color="#002060" sx={{ fontWeight: "bold" }} align="center">
        {fund}: Attribution | Data As of: {formattedDate}
      </Typography>
      {renderBarChart(mapChartData(data.sector), "GICS Sector")}
      {renderBarChart(mapChartData(data.region), "Region")}
      {renderBarChart(mapChartData(data.strategy), "Strategy")}
    </Paper>
  );
};

export default DailyNetOfHedgeChart;
