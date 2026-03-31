import React from "react";
import { Box, Typography, Divider, Table, TableBody, TableCell, TableContainer, TableRow } from "@mui/material";
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

// Custom Heatmap Component
const HeatmapChart: React.FC<{ data: number[][]; fixedHeight: number }> = ({ data, fixedHeight }) => {
  if (!Array.isArray(data) || data.length === 0) return null;

  const flatData = data.flat().filter((v) => typeof v === "number");
  const minVal = Math.min(...flatData);
  const maxVal = Math.max(...flatData);
  const range = maxVal - minVal || 1;

  const getColor = (value: number) => {
    const normalized = (value - minVal) / range;
    const hue = (1 - normalized) * 240; // Blue (240) to Red (0)
    return `hsl(${hue}, 70%, 50%)`;
  };

  const getLegendLabel = (value: number): string => {
    const normalized = (value - minVal) / range;
    if (normalized <= 0.25) return "Low Risk";
    if (normalized <= 0.5) return "Medium Risk";
    if (normalized <= 0.75) return "High Risk";
    return "Critical Risk";
  };

  // Generate legend steps
  const legendSteps = [
    { value: minVal, label: "Low Risk" },
    { value: minVal + range * 0.33, label: "Medium Risk" },
    { value: minVal + range * 0.66, label: "High Risk" },
    { value: maxVal, label: "Critical Risk" },
  ];

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3, p: 2, height: fixedHeight, overflow: "auto" }}>
      {/* Legend */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 1 }}>
        <Typography sx={{ fontSize: "0.8rem", fontWeight: 500, color: "#374151", minWidth: 50, fontFamily: "'Inter', sans-serif" }}>
          Risk Level:
        </Typography>
        <Box sx={{ display: "flex", gap: 1.5, alignItems: "center", flexWrap: "wrap" }}>
          {legendSteps.map((step, idx) => (
            <Box key={idx} sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
              <Box
                sx={{
                  width: 20,
                  height: 20,
                  backgroundColor: getColor(step.value),
                  borderRadius: 0.5,
                  border: "1px solid #e2e8f0",
                }}
              />
              <Typography sx={{ fontSize: "0.75rem", color: "#374151", fontWeight: 400, fontFamily: "'Inter', sans-serif" }}>
                {step.label}
              </Typography>
            </Box>
          ))}
        </Box>
      </Box>

      {/* Heatmap Grid */}
      <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", justifyContent: "center" }}>
        {data.map((row, rowIdx) => (
          <Box key={rowIdx} sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
            {Array.isArray(row) ? (
              row.map((cell, colIdx) => (
                <Box
                  key={`${rowIdx}-${colIdx}`}
                  sx={{
                    width: 50,
                    height: 50,
                    backgroundColor: getColor(cell),
                    borderRadius: 1,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#fff",
                    fontSize: "0.9rem",
                    fontWeight: 700,
                    cursor: "pointer",
                    transition: "transform 0.2s, box-shadow 0.2s",
                    border: "2px solid rgba(255,255,255,0.3)",
                    "&:hover": {
                      transform: "scale(1.1)",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
                    },
                  }}
                  title={`Value: ${cell} - ${getLegendLabel(cell)}`}
                >
                  {cell}
                </Box>
              ))
            ) : (
              <Box
                sx={{
                  width: 50,
                  height: 50,
                  backgroundColor: getColor(row),
                  borderRadius: 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#fff",
                  fontSize: "0.9rem",
                  fontWeight: 700,
                  border: "2px solid rgba(255,255,255,0.3)",
                }}
              />
            )}
          </Box>
        ))}
      </Box>
    </Box>
  );
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
    heatmap: HeatmapChart,
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

  // Heatmap uses custom rendering, not Chart.js
  if (type === "heatmap") {
    return (
      <Box
        sx={{
          p: 2.5,
          width: "100%",
          minHeight: fixedHeight,
          borderRadius: 2.5,
          background: "#ffffff",
          border: "1px solid #e2e8f0",
          display: "flex",
          flexDirection: "column",
          transition: "border-color 0.2s ease",
          fontFamily: "'Inter', sans-serif",
          "&:hover": { borderColor: "#cbd5e1" },
        }}
      >
        <Box
          sx={{
            mb: 1.5,
            "& p": {
              margin: 0,
              fontSize: "1rem",
              fontWeight: 500,
              color: "#0f172a",
              letterSpacing: "-0.01em",
              fontFamily: "'Inter', sans-serif",
            },
          }}
        >
          <ReactMarkdown>{normalizedTitle}</ReactMarkdown>
        </Box>

        <Divider sx={{ borderColor: "#f1f5f9", mb: 1.5 }} />

        <Box sx={{ width: "100%", flex: 1, position: "relative", minHeight: 0 }}>
          <HeatmapChart data={data} fixedHeight={fixedHeight - 100} />
        </Box>
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
          font: { size: 12, weight: "400", family: "'Inter', sans-serif" },
          color: "#374151",
        },
      },
      tooltip: {
        backgroundColor: "#0f172a",
        titleFont: { size: 12, weight: "500", family: "'Inter', sans-serif" },
        bodyFont: { size: 12, family: "'Inter', sans-serif", weight: "300" },
        cornerRadius: 8,
        padding: 10,
      },
    },
    scales: ["pie"].includes(type)
      ? undefined
      : {
        x: {
          grid: { color: "#f1f5f9", drawBorder: false },
          ticks: { color: "#374151", font: { size: 11, weight: 400, family: "'Inter', sans-serif" } },
        },
        y: {
          grid: { color: "#f1f5f9", drawBorder: false },
          ticks: { color: "#374151", font: { size: 11, weight: 400, family: "'Inter', sans-serif" } },
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
        ticks: { color: "#374151", font: { size: 11, weight: 400, family: "'Inter', sans-serif" } },
      },
      y: {
        stacked: true,
        grid: { color: "#f1f5f9", drawBorder: false },
        ticks: { color: "#374151", font: { size: 11, weight: 400, family: "'Inter', sans-serif" } },
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
        fontFamily: "'Inter', sans-serif",
        "&:hover": { borderColor: "#cbd5e1" },
      }}
    >
      <Box
        sx={{
          mb: 1.5,
          "& p": {
            margin: 0,
            fontSize: "1rem",
            fontWeight: 500,
            color: "#0f172a",
            letterSpacing: "-0.01em",
            fontFamily: "'Inter', sans-serif",
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
