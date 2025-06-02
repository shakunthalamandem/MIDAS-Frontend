import React, { useEffect, useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Grid,
  Typography,
} from "@mui/material";
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

type ChartDataPoint = {
  name: string;
  value: number;
};

const formatYAxis = (value: number) => {
  const absValue = Math.abs(value);
  if (absValue >= 1_000_000) return `${(absValue / 1_000_000).toFixed(1)}M`;
  if (absValue >= 1_000) return `${(absValue / 1_000).toFixed(1)}K`;
  return value.toString();
};

  const handleCardClick = () => {
  window.open("/equity/monashee-deals/gap-analysis", "_blank");
};
const SummaryGapGraph: React.FC = () => {
  const [foDataUS, setFoDataUS] = useState<ChartDataPoint[]>([]);
  const [ipoDataUS, setIpoDataUS] = useState<ChartDataPoint[]>([]);
  const [foDataEMEA, setFoDataEMEA] = useState<ChartDataPoint[]>([]);
  const [ipoDataEMEA, setIpoDataEMEA] = useState<ChartDataPoint[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async (region: "US" | "EMEA") => {
      const payload = {
        fo_type: ["Marketed", "Overnight", "Block"],
        years: [2025],
        broad_region: [region],
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

        const foSummary = yearData?.["FO"]?.["Summary"];
        const foBarData: ChartDataPoint[] = foSummary
          ? [
              { name: "Allocation", value: foSummary["Model Allocation Gap"] },
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
            ]
          : [];

        const ipoSummary = yearData?.["IPO"]?.["Summary"];
        const ipoBarData: ChartDataPoint[] = ipoSummary
          ? [
              { name: "Allocation", value: ipoSummary["Model Allocation Gap"] },
              { name: "AM", value: ipoSummary["AM Gap"] },
              {
                name: "Exit",
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
            ]
          : [];

        if (region === "US") {
          setFoDataUS(foBarData);
          setIpoDataUS(ipoBarData);
        } else {
          setFoDataEMEA(foBarData);
          setIpoDataEMEA(ipoBarData);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData("US");
    fetchData("EMEA");
  }, []);

  const getSymmetricDomain = (data: ChartDataPoint[]): [number, number] => {
  const maxAbs = Math.max(...data.map(d => Math.abs(d.value)), 1); // avoid zero
  const rounded = Math.ceil(maxAbs / 1_000_000) * 1_000_000; // round to nearest million
  return [-rounded, rounded];
};

const renderChart = (title: string, data: ChartDataPoint[]) => {
  const [yMin, yMax] = getSymmetricDomain(data);

  return (
    <Card sx={{ width: "100%", height: 300, cursor: "pointer" }}>
      <CardContent sx={{ p: 2 }}>
        <Typography
          variant="subtitle1"
          align="center"
          fontWeight="bold"
          color="#004d2a"
          mb={2}
        >
          {title}
        </Typography>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart
            data={data}
            margin={{ top: 10, right: 10, bottom: 10, left: 10 }}
          >
            <XAxis
              dataKey="name"
              style={{ fontSize: "12px" }}
              axisLine={true}
              tickLine={false}
            />
            <YAxis
              domain={[yMin, yMax]} 
              tickFormatter={formatYAxis}
              style={{ fontSize: "12px" }}
              axisLine
              tickLine
            />
            <Tooltip formatter={(value: number) => formatYAxis(value)} />
            <ReferenceLine y={0} stroke="#0f0f0f" strokeWidth={1} />
            <Bar dataKey="value" barSize={15}>
              {data.map((entry, index) => {
                const isLast = index === data.length - 1;
                const fill = isLast
                  ? entry.value < 0
                    ? "#f44336"
                    : "#4caf50"
                  : "#7a4bb9";
                return <Cell key={`cell-${index}`} fill={fill} cursor="pointer" />;
              })}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};


  return (
    <Box width="100%" px={2} py={4}>
      <Typography
      onClick={handleCardClick}
        variant="h5"
        align="center"
        color="#004d2a"
        fontWeight="bold"
        mb={4}
      >
        Summary Gap Metrics
      </Typography>

      <Grid container spacing={4} alignItems="stretch">
        {/* US Block */}
        <Grid item xs={12} md={6}>
          <Box
            sx={{
              backgroundColor: "#002060",
              p: 2,
              borderRadius: 1,
              height: "100%",
              display: "flex",
              flexDirection: "column",
              gap: 2,
              color: "white",
            }}
          >
            <Typography variant="h6" fontWeight="bold" align="center">
              US 2025
            </Typography>
            <Box sx={{ display: "flex", gap: 2 }}>
              <Box sx={{ flex: 1, bgcolor: "white", borderRadius: 1 }}>
                {renderChart("FO", foDataUS)}
              </Box>
              <Box sx={{ flex: 1, bgcolor: "white", borderRadius: 1 }}>
                {renderChart("IPO", ipoDataUS)}
              </Box>
            </Box>
          </Box>
        </Grid>

        {/* EMEA Block */}
        <Grid item xs={12} md={6}>
          <Box
            sx={{
              backgroundColor: "#002060",
              p: 2,
              borderRadius: 1,
              height: "100%",
              display: "flex",
              flexDirection: "column",
              gap: 2,
              color: "white",
            }}
          >
            <Typography variant="h6" fontWeight="bold" align="center">
              EMEA 2025
            </Typography>
            <Box sx={{ display: "flex", gap: 2}}>
              <Box sx={{ flex: 1, bgcolor: "white", borderRadius: 1 }}>
                {renderChart("FO", foDataEMEA)}
              </Box>
              <Box sx={{ flex: 1, bgcolor: "white", borderRadius: 1 }}>
                {renderChart("IPO", ipoDataEMEA)}
              </Box>
            </Box>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default SummaryGapGraph;
