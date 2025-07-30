// HeatMapMain.tsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ReactApexChart from "react-apexcharts";
import { Box, Typography, CircularProgress, Alert, Container } from "@mui/material";

type StockHeatValue = {
  stock_name: string;
  sector: string;
  region: string;
  country: string;
  news_positivity: number;
  confidence: number;
};

const getColorBySentiment = (score: number) => {
  if (score > 60) return "#006b17ff";
  if (score > 30) return "#4bc06bff";
  if (score > 0) return "#bae6b2ff";
  if (score > -30) return "#e27d7dff";
  if (score > -60) return "#ce2b2bff";
  return "#fa1818ff";
};

const HeatMapMain: React.FC = () => {
  const navigate = useNavigate();
  const [data, setData] = useState<StockHeatValue[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const apiUrl = process.env.REACT_APP_API_URL;
  const token = localStorage.getItem("access_token");

  useEffect(() => {
  const fetchData = async () => {
    try {
      const response = await fetch(`${apiUrl}/api/portfolio_heatmap_ai/`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
      });

      const result = await response.json();
      console.log("Heatmap API Response:", result);

      const stocks = Array.isArray(result.heat_value) ? result.heat_value : null;

      if (!stocks) throw new Error("Unexpected response format");

      setData(stocks);
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  fetchData();
}, [apiUrl, token]);



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
      events: {
        dataPointSelection: (event, chartContext, config) => {
          const stockName = series[config.seriesIndex].data[config.dataPointIndex].x;
          const fullStock = data.find((d) => d.stock_name === stockName);
          if (fullStock) {
            navigate("/gen_ai_tool", { state: { stock: fullStock } });
          }
        },
      },
    },

    plotOptions: {
      treemap: {
        distributed: false,
        enableShades: false,
        colorScale: { ranges: [] },
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
      style: { fontSize: "12px", fontWeight: 500 },
    },
    colors: data.map((d) => getColorBySentiment(d.news_positivity)),
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
    <Box p={2} sx={{ background: "#ebe9d4ff" ,borderRadius:2}}>
      <Typography variant="h5" mb={2} color="#002060">
        Stock Heatmap by Sector (Confidence & News Sentiment)
      </Typography>

      {loading ? (
        <CircularProgress sx={{ color: "white" }} />
      ) : error ? (
        <Alert severity="error">{error}</Alert>
      ) : (
        <ReactApexChart options={options} series={series} type="treemap" height={600} />
      )}
    </Box>
    </Container>
  );
};

export default HeatMapMain;
