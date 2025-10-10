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

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface DailyNetOfHedgeChartProps {
  fund: string;
  date?: string;
}

interface ChartDataType {
  labels: string[];
  daily_net_of_hedge: number[];
  mtd_net_of_hedge: number[];
  daily_long_exposure: number[];
}

const DailyNetOfHedgeChart: React.FC<DailyNetOfHedgeChartProps> = ({
  fund,
  date,
}) => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);

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
            Authorization: token ? `Bearer ${token}` : "",
          },
          body: JSON.stringify({ fund, date }),
        });

        if (!res.ok) {
          throw new Error("Failed to fetch chart data");
        }

        const result = await res.json();
        setData(result);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [fund, date]);

  if (loading || !data) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight={200}
      >
        <CircularProgress />
      </Box>
    );
  }

  const renderBarChart = (chartData: ChartDataType, title: string) => (
    <Paper sx={{ p: 2, mb: 3, borderRadius: 2, backgroundColor: "#f9f9f9" }}>
      <Typography
        variant="body1"
        gutterBottom
        color="#002060"
        align="center"
        fontWeight={600}
      >
        {title}
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={12} md={4}>
          <Typography variant="subtitle1" align="center" bgcolor={"#e6f0ff"}>Daily Net of Hedge $P&L</Typography>
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
              scales: {
                x: { grid: { display: false } },
                y: { grid: { display: false }, beginAtZero: true, max: 100 },
              },
            }}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <Typography variant="subtitle1" align="center" bgcolor={"#e6f0ff"}>MTD Net of Hedge $P&L</Typography>
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
              scales: {
                x: { grid: { display: false } },
                y: { grid: { display: false }, beginAtZero: true, max: 100 },
              },
            }}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <Typography variant="subtitle1" align="center" bgcolor={"#e6f0ff"}>
            Daily Long Exposure / LMV (%)
          </Typography>
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
              scales: {
                x: { grid: { display: false } },
                y: { grid: { display: false }, beginAtZero: true, max: 100 },
              },
            }}
          />
        </Grid>
      </Grid>
    </Paper>
  );

  return (
    <Paper sx={{ p: 2, mb: 3, borderRadius: 2, backgroundColor: "#f9f9f9" }}>
            <Typography variant="h6" gutterBottom color="#002060" sx={{ fontWeight: "bold" }} align="center">
              {fund}: Attribution as of {date} 
            </Typography>
      {renderBarChart(data.sector, "GICS Sector")}
      {renderBarChart(data.region, "Region")}
      {renderBarChart(data.strategy, "Strategy")}
        </Paper>

  );
};

export default DailyNetOfHedgeChart;
