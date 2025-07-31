import React from "react";
import { Paper, Typography, Box, Divider } from "@mui/material";
import {
  Pie,
  Bar,
  Line,
  Scatter,
  Bubble,
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
  Legend,
  Filler, // Needed for Area Chart
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
  Legend,
  Filler
);

type GENAIChartBlockProps = {
  chartType: string;
  data: any;
  title: string;
  fixedHeight?: number; // height in pixels
};

const GENAIChartBlock: React.FC<GENAIChartBlockProps> = ({
  chartType,
  data,
  title,
  fixedHeight = 380,
}) => {
  const type = chartType.toLowerCase();

  const chartMap: Record<string, any> = {
    pie: Pie,
    bar: Bar,
    line: Line,
    area: Line,         // Area is a Line chart with `fill: true`
    scatter: Scatter,
    bubble: Bubble,
    stackedbar: Bar,    // Stacked bar uses Bar with special options
  };

  const ChartComponent = chartMap[type];

  if (!ChartComponent) {
    return (
      <Paper
        sx={{
          p: 2,
          m: 2,
          bgcolor: "#fff",
          width: "100%",
          borderRadius: 2,
          boxShadow: 2,
        }}
      >
        <Typography variant="body2" sx={{ color: "#d32f2f" }}>
          Unsupported chart type: <strong>{chartType}</strong>
        </Typography>
      </Paper>
    );
  }

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

  // Set custom options
  const chartOptions: any = {
    maintainAspectRatio: false,
    responsive: true,
    plugins: {
      legend: { display: true, position: "bottom" },
    },
  };

  if (type === "area") {
    // Ensure all datasets in area chart have fill: true
    formattedData = {
      ...data,
      datasets: data.datasets.map((ds: any) => ({
        ...ds,
        fill: true,
        backgroundColor: ds.backgroundColor || "rgba(96,165,250,0.4)",
        borderColor: ds.borderColor || "#60a5fa",
        tension: 0.3,
      })),
    };
  }

  if (type === "stackedbar") {
    chartOptions.scales = {
      x: {
        stacked: true,
      },
      y: {
        stacked: true,
      },
    };
  }

  return (
    <Paper
      elevation={2}
      sx={{
        p: 2,
        width: "100%",
        height: fixedHeight,
        borderRadius: 3,
        background: "linear-gradient(135deg, #f5f7fa, #e4ecf7)",
        boxShadow: 3,
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
      }}
    >
      <Typography
        variant="subtitle1"
        fontWeight={600}
        sx={{ color: "#2c387e", mb: 1 }}
      >
        <ReactMarkdown>{title}</ReactMarkdown>
      </Typography>

      <Divider sx={{ mb: 1 }} />

      <Box
        sx={{
          width: "100%",
          height: `calc(${fixedHeight}px - 64px)`, // leave room for title & divider
          position: "relative",
        }}
      >
        <ChartComponent data={formattedData} options={chartOptions} />
      </Box>
    </Paper>
  );
};

export default GENAIChartBlock;
