// StockHeatmapTreemap.tsx
import React from "react";
import ReactApexChart from "react-apexcharts";
import { Box, Typography } from "@mui/material";

type StockHeatValue = {
  stock_name: string;
  sector: string;
  region: string;
  country: string;
  news_positivity: number;
  confidence: number;
};

type Props = {
  data: StockHeatValue[];
};

const getColorBySentiment = (score: number) => {
  if (score > 60) return "#006b17ff"; // strong green
  if (score > 30) return "#4bc06bff"; // mild green
  if (score > 0) return "#bae6b2ff"; // very light green
  if (score > -30) return "#e27d7dff"; // light red
  if (score > -60) return "#ce2b2bff"; // mild red
  return "#fa1818ff"; // deep red
};

const StockHeatmapTreemap: React.FC<Props> = ({ data }) => {
  const sectorMap: { [key: string]: { x: string; y: number; fillColor: string }[] } = {};

  data.forEach((stock) => {
    const { sector, stock_name, confidence, news_positivity } = stock;

    if (!sectorMap[sector]) sectorMap[sector] = [];

    sectorMap[sector].push({
      x: stock_name,
      y: confidence,
      fillColor: getColorBySentiment(news_positivity),
    });
  });

  const series = Object.entries(sectorMap).map(([sector, stocks]) => ({
    name: sector,
    data: stocks,
  }));

  const options: ApexCharts.ApexOptions = {
    chart: {
      type: "treemap",
      height: 500,
    },
    legend: { show: true },
    title: {
      text: "Stock News Sentiment Treemap",
      style: { fontSize: "18px", fontWeight: "bold" },
    },
    plotOptions: {
      treemap: {
        distributed: false,
        enableShades: false,
        colorScale: {
          ranges: [],
        },
      },
    },
    tooltip: {
      y: {
        formatter: (val: number) => `Confidence: ${val.toFixed(1)}%`,
      },
    },
    dataLabels: {
      enabled: true,
      formatter: (text: string, op: any) => {
        const { seriesIndex, dataPointIndex } = op;
        return series[seriesIndex].data[dataPointIndex].x;
      },
      style: {
        fontSize: "12px",
        fontWeight: 500,
      },
    },
    colors: data.map((d) => getColorBySentiment(d.news_positivity)),
  };

  return (
    <Box p={2} sx={{ background: "linear-gradient(135deg, #0a6952ff, #012533ff)" }}>
      <Typography variant="h5" mb={2} color="white">
        Stock Heatmap by Sector (Confidence & News Sentiment)
      </Typography>
      <ReactApexChart options={options} series={series} type="treemap" height={600} />
    </Box>
  );
};

export default StockHeatmapTreemap;
