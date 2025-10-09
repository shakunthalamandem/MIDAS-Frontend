import React, { useEffect, useState } from "react";
import { Paper, Typography, CircularProgress, Box } from "@mui/material";
import { Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

interface PNLAttributionMarketCapProps {
  fund: string;
}

const PNLAttributionMarketCap: React.FC<PNLAttributionMarketCapProps> = ({ fund }) => {
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState<any>(null);

  useEffect(() => {
    setLoading(true);

    const timeout = setTimeout(() => {
      const labels = ["Large Cap", "Mid Cap", "Small Cap"];
      const dataValues = labels.map(() => Math.floor(Math.random() * 1000));

      setChartData({
        labels,
        datasets: [
          {
            label: `${fund} PNL Attribution by Market Cap`,
            data: dataValues,
            backgroundColor: ["#002060", "#0070C0", "#00B0F0"],
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
        PNL Attribution by Market Cap
      </Typography>
      <Pie data={chartData} />
    </Paper>
  );
};

export default PNLAttributionMarketCap;
