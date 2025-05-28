import React, { useEffect, useState } from "react";
import { Box, Card, CardContent, Stack, Typography, useTheme } from "@mui/material";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Cell,
} from "recharts";
import { useNavigate } from "react-router-dom";


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
  const navigate = useNavigate();


  
  const handleNavigationClick = () => {
    navigate("/equity/monashee-deals/gap-analysis");
  };

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
              name: " Allocation",
              value: foSummary["Model Allocation Gap"],
            },
            { name: "AM", value: foSummary["AM Gap"] },
            {
              name: "Exit",
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
              name: "Model Allocation Gap ",
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
 <Card
    elevation={3}
    sx={{ width: "90%", height: 400, p: 2, cursor: "pointer" }}
    onClick={handleNavigationClick}
  >
    <CardContent sx={{ cursor: "pointer" }}>
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
        <BarChart data={data} margin={{ left: 10 }}>
          <XAxis dataKey="name" style={{ fontSize: "12px" }} />
          <YAxis tickFormatter={formatYAxis} />
          <Tooltip formatter={(value) => formatYAxis(value)} />
          <ReferenceLine y={0} stroke="#0f0f0f" strokeWidth={1} />
          <Bar dataKey="value" barSize={20}>
            {data.map((entry, index) => {
              let fill = "#e26d3e";

              if (index === data.length - 1) {
                fill = entry.value < 0 ? "#f44336" : "#4caf50"; 
              }

              return <Cell key={`cell-${index}`} fill={fill} cursor="pointer" />;
            })}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </CardContent>
  </Card>
  );

  return (
 <Box width="100%">
      <Typography
        variant="h6"
        component="div"
        color="#002060"
        align="center"
        fontWeight="bold"
        mb={4}
        mt={4}
      >
        Summary Gap Metrics
      </Typography>

      <Stack direction="column" spacing={2} justifyContent="space-between">
        {renderChart("FO  2025", foData)}
        {renderChart("IPO 2025", ipoData)}
      </Stack>
    </Box>
  );
};

export default SummaryGapGraph;
