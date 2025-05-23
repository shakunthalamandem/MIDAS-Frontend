import React, { useEffect, useState } from "react";
import { Card, CardContent, Typography, useTheme } from "@mui/material";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";

const formatYAxis = (value: any) => {
  const absValue = Math.abs(value);
  let formatted = "";

  if (absValue >= 1_000_000) {
    formatted = `${(absValue / 1_000_000).toFixed(1)}M`;
  } else if (absValue >= 1_000) {
    formatted = `${(absValue / 1_000).toFixed(1)}K`;
  } else {
    formatted = absValue.toString();
  }

  return value < 0 ? `-${formatted}` : formatted;
};

const SummaryGapGraph = () => {
  const [foData, setFoData] = useState([]);
  const [ipoData, setIpoData] = useState([]);
  const theme = useTheme();

  useEffect(() => {
    const fetchData = async () => {
      const payload = {
        years: [2025],
      };

      try {
        const apiUrl = process.env.REACT_APP_API_URL;
        const token = localStorage.getItem("access_token");

        const response = await fetch(`${apiUrl}/api/gap_analysis/`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : "",
          },
          body: JSON.stringify(payload),
        });

        const result = await response.json();
        const yearData = result?.["2025"];

        // FO Summary Data
        const foSummary = yearData?.["FO"]?.["Summary"];
        if (foSummary) {
          const barData: any = [
            {
              name: "Model Allocation Gap",
              value: foSummary["Model Allocation Gap"],
            },
            { name: "Model AM Gap", value: foSummary["AM Gap"] },
            {
              name: "Exit Gap Sum",
              value:
                (foSummary["Monashee Exit Gap"] || 0) +
                (foSummary["AM Exit Gap"] || 0),
            },
            {
              name: "Total Gap",
              value:
                (foSummary["Allocation Return"] || 0) +
                (foSummary["AM Return"] || 0) -
                (foSummary["Model Return 1% Allocation"] || 0) -
                (foSummary["Model AM Return"] || 0),
            },
          ];
          setFoData(barData);
        }

        // IPO Summary Data
        const ipoSummary = yearData?.["IPO"]?.["Summary"];
        if (ipoSummary) {
          const barData: any = [
            {
              name: "Model Allocation Gap",
              value: ipoSummary["Model Allocation Gap"],
            },
            { name: "Model AM Gap", value: ipoSummary["AM Gap"] },
            {
              name: "Exit Gap Sum",
              value:
                (ipoSummary["Monashee Exit Gap"] || 0) +
                (ipoSummary["AM Exit Gap"] || 0),
            },
            {
              name: "Total Gap",
              value:
                (ipoSummary["Allocation Return"] || 0) +
                (ipoSummary["AM Return"] || 0) -
                (ipoSummary["Model Return 1% Allocation"] || 0) -
                (ipoSummary["Model AM Return"] || 0),
            },
          ];
          setIpoData(barData);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  const renderChart = (title: string, data: any[]) => (
    <Card elevation={3} sx={{ width: "48%", height: 350, p: 2 }}>
      <CardContent>
        <Typography
          variant="h6"
          component="div"
          color="#002060"
          align="center"
          fontWeight="bold"
          mb={2}
        >
          {title}
        </Typography>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={data} margin={{ left: 20 }}>
            <XAxis dataKey="name" />
            <YAxis tickFormatter={formatYAxis} />
            <Tooltip formatter={(value) => formatYAxis(value)} />
            <ReferenceLine y={0} stroke="#0f0f0f" strokeWidth={1} />
            <Bar dataKey="value" fill="#e26d3e" barSize={20} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        gap: 16,
        width: "100%",
      }}
    >
      {renderChart("FO Summary Gap Metrics - 2025", foData)}
      {renderChart("IPO Summary Gap Metrics - 2025", ipoData)}
    </div>
  );
};

export default SummaryGapGraph;
