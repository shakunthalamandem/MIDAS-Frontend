import React from "react";
import { Paper, Typography } from "@mui/material";
import {
  Pie,
  Bar,
  Line,
  Scatter,
  Bubble
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

type GENAIChartBlockProps = {
  chartType: string;
  data: any;
  title: string;
  width?: string | number; // Accept width prop, e.g. "50%", "300px", or number (interpreted as px)
};

const GENAIChartBlock: React.FC<GENAIChartBlockProps> = ({
  chartType,
  data,
  title,
  width = "100%",
}) => {
  const chartMap: Record<string, any> = {
    pie: Pie,
    bar: Bar,
    line: Line,
    scatter: Scatter,
    bubble: Bubble,
  };

  const type = chartType.toLowerCase();
  const ChartComponent = chartMap[type];

  if (!ChartComponent) {
    return (
      <Paper
        sx={{
          p: 2,
          m: 2,
          bgcolor: "#ffffff",
          width,
          borderRadius: 2,
          boxShadow: 3,
        }}
      >
        <Typography variant="body2" sx={{ color: "#002060" }}>
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
          backgroundColor: "#60a5fa",
        },
      ],
    };
  }

  if (["heatmap", "tree", "calendar"].includes(type)) {
    return (
      <Paper
        sx={{
          p: 2,
          m: 2,
          bgcolor: "#ffffff",
          width,
          borderRadius: 2,
          boxShadow: 3,
        }}
      >
        <Typography sx={{ color: "#002060" }}>
          Custom chart type <strong>{chartType}</strong> is not supported in this
          renderer.
        </Typography>
      </Paper>
    );
  }

  return (
    <Paper
      elevation={3}
      sx={{
        p: 2,
        m: 2,
        bgcolor: "#ffffff",
        width,
        borderRadius: 2, // default theme spacing, can also be '8px' or numeric
        boxShadow: 3, // material-ui shadow
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Typography variant="h6" gutterBottom sx={{ color: "#002060" }} component="div">
        <ReactMarkdown>{title}</ReactMarkdown>
      </Typography>
      <ChartComponent data={formattedData} />
    </Paper>
  );
};

export default GENAIChartBlock;
