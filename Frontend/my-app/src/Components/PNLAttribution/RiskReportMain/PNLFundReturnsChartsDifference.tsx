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

interface PNLFundReturnsChartsDifferenceProps {
  fund: string;
}

const PNLFundReturnsChartsDifference: React.FC<PNLFundReturnsChartsDifferenceProps> = ({ fund }) => {
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState<any>(null);

  useEffect(() => {
    setLoading(true);

    const timeout = setTimeout(() => {
      const labels = Array.from({ length: 12 }, (_, i) => `Month ${i + 1}`);
      const fundReturns = labels.map(() => Math.floor(Math.random() * 20) - 10);
      const benchmarkReturns = labels.map(() => Math.floor(Math.random() * 20) - 10);

      setChartData({
        labels,
        datasets: [
          {
            label: `${fund} Fund Returns`,
            data: fundReturns,
            borderColor: "#002060",
            backgroundColor: "rgba(0, 32, 96, 0.2)",
            tension: 0.4,
          },
          {
            label: "Benchmark Returns",
            data: benchmarkReturns,
            borderColor: "#FF5733",
            backgroundColor: "rgba(255, 87, 51, 0.2)",
            tension: 0.4,
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
    <Paper elevation={3} sx={{ p: 2, borderRadius: 2, backgroundColor: "#f9f9f9", minHeight: 300 }}>
      <Typography variant="h6" gutterBottom color="#002060">
        Fund vs Benchmark Returns Difference
      </Typography>
      <Line
        data={chartData}
        options={{
          responsive: true,
          plugins: { legend: { position: "top" }, tooltip: { mode: "index", intersect: false } },
          scales: {
            x: { title: { display: true, text: "Month" } },
            y: { title: { display: true, text: "Return (%)" } },
          },
        }}
      />
    </Paper>
  );
};

export default PNLFundReturnsChartsDifference;
