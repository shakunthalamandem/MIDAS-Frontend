import React from "react";
import { Box, Typography, Divider } from "@mui/material";
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
  Filler,
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
  title: string | number;
  fixedHeight?: number;
};

const GENAIChartBlock: React.FC<GENAIChartBlockProps> = ({
  chartType,
  data,
  title,
  fixedHeight = 380,
}) => {
  const type = chartType.toLowerCase();
  const normalizedTitle = React.useMemo(() => String(title ?? ""), [title]);

  const chartMap: Record<string, any> = {
    pie: Pie,
    bar: Bar,
    line: Line,
    area: Line,
    scatter: Scatter,
    bubble: Bubble,
    stackedbar: Bar,
  };

  const ChartComponent = chartMap[type];

  if (!ChartComponent) {
    return (
      <Box
        sx={{
          p: 2.5,
          borderRadius: 2.5,
          border: "1px solid #fecaca",
          background: "#fef2f2",
        }}
      >
        <Typography sx={{ color: "#dc2626", fontSize: "0.85rem" }}>
          Unsupported chart type: <strong>{chartType}</strong>
        </Typography>
      </Box>
    );
  }

  let formattedData = data;

  if (["scatter", "bubble"].includes(type)) {
    formattedData = {
      datasets: [
        {
          label: normalizedTitle,
          data,
          backgroundColor: "#818cf8",
        },
      ],
    };
  }

  const chartOptions: any = {
    maintainAspectRatio: false,
    responsive: true,
    plugins: {
      legend: {
        display: true,
        position: "bottom",
        labels: {
          usePointStyle: true,
          pointStyle: "circle",
          padding: 16,
          font: { size: 12, weight: "500" },
          color: "#64748b",
        },
      },
      tooltip: {
        backgroundColor: "#0f172a",
        titleFont: { size: 12, weight: "600" },
        bodyFont: { size: 12 },
        cornerRadius: 8,
        padding: 10,
      },
    },
    scales: ["pie"].includes(type)
      ? undefined
      : {
        x: {
          grid: { color: "#f1f5f9", drawBorder: false },
          ticks: { color: "#94a3b8", font: { size: 11 } },
        },
        y: {
          grid: { color: "#f1f5f9", drawBorder: false },
          ticks: { color: "#94a3b8", font: { size: 11 } },
        },
      },
  };

  if (type === "area") {
    formattedData = {
      ...data,
      datasets: data.datasets.map((ds: any) => ({
        ...ds,
        fill: true,
        backgroundColor: ds.backgroundColor || "rgba(79,70,229,0.1)",
        borderColor: ds.borderColor || "#4f46e5",
        tension: 0.4,
        pointRadius: 3,
        pointBackgroundColor: ds.borderColor || "#4f46e5",
      })),
    };
  }

  if (type === "stackedbar") {
    chartOptions.scales = {
      x: {
        stacked: true,
        grid: { color: "#f1f5f9", drawBorder: false },
        ticks: { color: "#94a3b8", font: { size: 11 } },
      },
      y: {
        stacked: true,
        grid: { color: "#f1f5f9", drawBorder: false },
        ticks: { color: "#94a3b8", font: { size: 11 } },
      },
    };
  }

  return (
    <Box
      sx={{
        p: 2.5,
        width: "100%",
        height: fixedHeight,
        borderRadius: 2.5,
        background: "#ffffff",
        border: "1px solid #e2e8f0",
        display: "flex",
        flexDirection: "column",
        transition: "border-color 0.2s ease",
        "&:hover": { borderColor: "#cbd5e1" },
      }}
    >
      <Box
        sx={{
          mb: 1.5,
          "& p": {
            margin: 0,
            fontSize: "0.9rem",
            fontWeight: 700,
            color: "#0f172a",
            letterSpacing: "-0.01em",
          },
        }}
      >
        <ReactMarkdown>{normalizedTitle}</ReactMarkdown>
      </Box>

      <Divider sx={{ borderColor: "#f1f5f9", mb: 1.5 }} />

      <Box
        sx={{
          width: "100%",
          flex: 1,
          position: "relative",
          minHeight: 0,
        }}
      >
        <ChartComponent data={formattedData} options={chartOptions} />
      </Box>
    </Box>
  );
};

export default GENAIChartBlock;
