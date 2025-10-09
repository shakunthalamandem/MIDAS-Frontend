import React, { useEffect, useState } from "react";
import { Paper, Typography, CircularProgress, Box } from "@mui/material";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

interface DailyNetOfHedgeChartProps {
  fund: string;
}

const DailyNetOfHedgeChart: React.FC<DailyNetOfHedgeChartProps> = ({ fund }) => {
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState<any>(null);

  useEffect(() => {
    setLoading(true);

    // Simulate fetching data for the selected fund
    const timeout = setTimeout(() => {
      const labels = Array.from({ length: 10 }, (_, i) => `Day ${i + 1}`);
      const dataValues = labels.map(() => Math.floor(Math.random() * 1000) - 500); // sample P&L

      setChartData({
        labels,
        datasets: [
          {
            label: `${fund} Daily Net of Hedge P&L`,
            data: dataValues,
            borderColor: "#002060",
            backgroundColor: "rgba(0, 32, 96, 0.2)",
            tension: 0.4,
          },
        ],
      });

      setLoading(false);
    }, 500); // simulate network delay

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
        Daily Net of Hedge P&L
      </Typography>
      <Line
        data={chartData}
        options={{
          responsive: true,
          plugins: {
            legend: { display: true, position: "top" },
            tooltip: { mode: "index", intersect: false },
          },
          scales: {
            x: { title: { display: true, text: "Days" } },
            y: { title: { display: true, text: "P&L" } },
          },
        }}
      />
    </Paper>
  );
};

export default DailyNetOfHedgeChart;
