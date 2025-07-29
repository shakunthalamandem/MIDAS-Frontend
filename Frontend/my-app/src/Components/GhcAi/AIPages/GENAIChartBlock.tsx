import React from "react";
import { Paper, Typography } from "@mui/material";
import {
  Pie, Bar, Line, Scatter, Bubble
} from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Tooltip,
  Legend
} from "chart.js";
import { getRandomBgColor } from "../Utils/colorUtils";
import ReactMarkdown from "react-markdown";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Tooltip,
  Legend
);

const GENAIChartBlock: React.FC<{
  chartType: string;
  data: any;
  title: string;
}> = ({ chartType, data, title }) => {
  const chartMap: Record<string, any> = {
    pie: Pie,
    bar: Bar,
    line: Line,
    scatter: Scatter,
    bubble: Bubble
  };

  const type = chartType.toLowerCase();
  const ChartComponent = chartMap[type];

  if (!ChartComponent) {
    return (
      <Paper sx={{ p: 2, m: 2, bgcolor: getRandomBgColor() }}>
        <Typography variant="body2">
          Unsupported chart type: <strong>{chartType}</strong>
        </Typography>
      </Paper>
    );
  }

  // Format scatter/bubble data
  let formattedData = data;
  if (["scatter", "bubble"].includes(type)) {
    formattedData = {
      datasets: [
        {
          label: title,
          data,
          backgroundColor: "#60a5fa"
        }
      ]
    };
  }

  // Handle custom chart types not supported by Chart.js
  if (["heatmap", "tree", "calendar"].includes(type)) {
    return (
      <Paper sx={{ p: 2, bgcolor: getRandomBgColor(), m: 2 }}>
        <Typography>
          Custom chart type <strong>{chartType}</strong> is not supported in this renderer.
        </Typography>
      </Paper>
    );
  }

  return (
    <Paper elevation={3} sx={{ p: 2, m: 2, bgcolor: getRandomBgColor() }}>
      <Typography variant="h6" gutterBottom component="div">
        <ReactMarkdown>{title}</ReactMarkdown>
      </Typography>
      <ChartComponent data={formattedData} />
    </Paper>
  );
};

export default GENAIChartBlock;
