import React from "react";
import { Paper, Typography } from "@mui/material";
import {
  Pie, Bar, Line, Scatter, Bubble
} from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, PointElement, LineElement, ArcElement, Tooltip, Legend } from "chart.js";
import { getRandomBgColor } from "../Utils/colorUtils";
ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, ArcElement, Tooltip, Legend);

const GENAIChartBlock: React.FC<{ chartType: string; data: any; title: string }> = ({ chartType, data, title }) => {
  const chartMap: any = {
    pie: Pie,
    bar: Bar,
    line: Line,
    scatter: Scatter,
    bubble: Bubble
  };

  const ChartComponent = chartMap[chartType.toLowerCase()];
  if (!ChartComponent) return <p>Unsupported chart type: {chartType}</p>;

  return (
    <Paper elevation={3} sx={{ p: 2, m: 2, bgcolor: getRandomBgColor() }}>
      <Typography variant="h6" gutterBottom>{title}</Typography>
      <ChartComponent data={data} />
    </Paper>
  );
};

export default GENAIChartBlock;
