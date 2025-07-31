import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ReactApexChart from "react-apexcharts";
import {
  Box,
  Typography,
  CircularProgress,
  Alert,
  Container,
} from "@mui/material";
import HeatmapMetadata from "./HeatmapMetadata";

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
  const [meta, setMeta] = useState<any | null>(null);

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

        const stocks = Array.isArray(result.heat_value)
          ? result.heat_value
          : null;
        if (!stocks) throw new Error("Unexpected response format");

        setData(stocks);

        setMeta({
          updated_ist_time: result.updated_ist_time,
          updated_us_time: result.updated_us_time,
          news_from_date: result.news_from_date,
          news_to_date: result.news_to_date,
          us_news_from_date: result.us_news_from_date,
          us_news_to_date: result.us_news_to_date,
        });
      } catch (err: any) {
        setError(err.message || "Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [apiUrl, token]);

  const sectorMap: {
    [key: string]: { x: string; y: number; fillColor: string }[];
  } = {};
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
          const stockName =
            series[config.seriesIndex].data[config.dataPointIndex].x;
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
    <Box sx={{ background: "#e0eeecff", borderRadius: 2 }}>
        <Typography
              variant="body2"
              sx={{
                fontWeight: 500,
                color: "#FFFFFF",
                fontSize: { xs: "1rem", sm: "1.2rem" },
                backgroundColor: "#002060",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                height: "4vh",
                padding: "8px 16px",
                borderRadius: "8px",
                textAlign: "center",
                marginBottom: "20px",
                boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
                animation: "fadeIn 1.5s ease-in-out",
                "@keyframes fadeIn": {
                  "0%": { opacity: 0 },
                  "100%": { opacity: 1 },
                },
              }}
            >
Welcome to Your Portfolio’s Social Media Sentiment Heatmap            </Typography>
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
       

        {meta && (
          <HeatmapMetadata
            updated_ist_time={meta.updated_ist_time}
            updated_us_time={meta.updated_us_time}
            news_from_date={meta.news_from_date}
            news_to_date={meta.news_to_date}
            us_news_from_date={meta.us_news_from_date}
            us_news_to_date={meta.us_news_to_date}
          />
        )}

        {loading ? (
          <Box mt={3}>
            <CircularProgress sx={{ color: "#002060" }} />
          </Box>
        ) : error ? (
          <Alert severity="error">{error}</Alert>
        ) : (
          <Box mt={3}>
            <ReactApexChart
              options={options}
              series={series}
              type="treemap"
              height={600}
            />
          </Box>
        )}
    </Container>
    </Box>
  );
};

export default HeatMapMain;
