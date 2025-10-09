import React, { useEffect, useState } from "react";
import { Paper, Typography, CircularProgress, Box } from "@mui/material";
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

interface DtdTopBottomMainPNLProps {
  fund: string;
}

const DtdTopBottomMainPNL: React.FC<DtdTopBottomMainPNLProps> = ({ fund }) => {
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState<any>(null);

  useEffect(() => {
    setLoading(true);

    // Simulate fetching top/bottom P&L data
    const timeout = setTimeout(() => {
      const labels = ["Top 5", "Bottom 5"];
      const dataValues = labels.map(() => Array.from({ length: 5 }, () => Math.floor(Math.random() * 5000 - 2500)));

      setChartData({
        labels: ["1", "2", "3", "4", "5"],
        datasets: [
          {
            label: "Top 5 P&L",
            data: dataValues[0],
            backgroundColor: "rgba(0, 160, 0, 0.7)",
          },
          {
            label: "Bottom 5 P&L",
            data: dataValues[1],
            backgroundColor: "rgba(200, 0, 0, 0.7)",
          },
        ],
      });

      setLoading(false);
    }, 500);

    return () => clearTimeout(timeout);
  }, [fund]);

  if (loading || !chartData) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Paper
      elevation={3}
      sx={{ p: 2, borderRadius: 2, backgroundColor: "#f9f9f9", minHeight: 300 }}
    >
      <Typography variant="h6" gutterBottom color="#002060">
        DTD Top/Bottom P&L
      </Typography>
      <Bar
        data={chartData}
        options={{
          responsive: true,
          plugins: {
            legend: { display: true, position: "top" },
            tooltip: { mode: "index", intersect: false },
          },
          scales: {
            x: { title: { display: true, text: "Positions" } },
            y: { title: { display: true, text: "P&L" } },
          },
        }}
      />
    </Paper>
  );
};

export default DtdTopBottomMainPNL;
