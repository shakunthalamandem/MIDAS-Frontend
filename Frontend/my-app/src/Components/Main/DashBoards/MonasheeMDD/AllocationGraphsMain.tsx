import React, { useState, useEffect } from "react";
import {
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";
import {
  Box,
  Container,
  Card,
  Typography,
  CircularProgress,
  Divider,
} from "@mui/material";
import { useNavigate } from "react-router-dom";

interface ChartData {
  year: string;
  [key: string]: number | string;
}

interface ApiResponse {
  [year: string]: {
    [category: string]: {
      weighted_allocation_deal_size_percentage: number;
      weighted_allocation_percentage: number;
    };
  };
}

interface DealStatsGraphProps {
  selectedFilters: { [key: string]: (string | number)[] };
}

const formatValue = (value: number): string => {
  const absValue = Math.abs(value);
  const sign = value < 0 ? "-" : "";
  return `${sign}${absValue.toFixed(2)}%`;
};

const DealStatsGraph: React.FC<DealStatsGraphProps> = ({ selectedFilters }) => {
  const [dealSizeData, setDealSizeData] = useState<ChartData[]>([]);
  const [allocationData, setAllocationData] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const navigate = useNavigate();

  const apiUrl = process.env.REACT_APP_API_URL;
  const token = localStorage.getItem("access_token");

  useEffect(() => {
    fetchData();
  }, [selectedFilters]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const defaultFilters = {
        years: [2025, 2024],
        period: ["Quarterly"],
        fo_type: ["Marketed", "Overnight"],
      };

      const payload = {
        ...defaultFilters,
        ...selectedFilters,
      };

      const response = await fetch(`${apiUrl}/api/mdd_deals_graph/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify(payload),
      });

      const data: ApiResponse = await response.json();
      formatChartData(data);
    } catch (error) {
      console.error("Error fetching data", error);
      navigate("/error");
      setDealSizeData([]);
      setAllocationData([]);
    } finally {
      setLoading(false);
    }
  };

  const formatChartData = (data: ApiResponse) => {
    if (!data || typeof data !== "object") return;

    const dealSize: ChartData[] = [];
    const allocation: ChartData[] = [];

    Object.keys(data).forEach((year) => {
      const categories = data[year];
      let dealSizeRow: ChartData = { year };
      let allocationRow: ChartData = { year };

      Object.keys(categories).forEach((category) => {
        const catData = categories[category];
        dealSizeRow[category] = catData.weighted_allocation_deal_size_percentage ?? 0;
        allocationRow[category] = catData.weighted_allocation_percentage ?? 0;
      });

      dealSize.push(dealSizeRow);
      allocation.push(allocationRow);
    });

    setDealSizeData(dealSize);
    setAllocationData(allocation);
  };

  const lineColors = [
    "#60A5FA", "#F97316", "#14B8A6", "#FACC15", "#EF4444",
    "#64748B", "#0EA5E9", "#22C55E", "#D97706", "#8B5CF6",
  ];

  const renderLineChart = (
    title: string,
    data: ChartData[],
    yAxisFormatter: (val: number) => string
  ) => (
    <Box
      sx={{
        width: { xs: "100%", md: "48%" },
        marginBottom: 4,
        paddingX: 1,
      }}
    >
      <Typography
        variant="subtitle1"
        sx={{
          color: "#000",
          fontWeight: "bold",
          mb: 1,
          textAlign: "center",
          width: "100%",
        }}
      >
        {title}
      </Typography>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart
          data={data}
          margin={{ top: 20, right: 30, left: 10, bottom: 40 }}
        >
          <XAxis
            dataKey="year"
            stroke="#b2b2b2"
            tick={{ fill: "#000", fontSize: 12 }}
            label={{
              value: "Year",
              position: "insideBottom",
              dy: 10,
              fill: "#002060",
            }}
          />
          <YAxis
            stroke="#000"
            tickFormatter={(value) => yAxisFormatter(value as number)}
          />
          <Tooltip formatter={(value) => yAxisFormatter(value as number)} />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          {data.length > 0 &&
            Object.keys(data[0])
              .filter((key) => key !== "year")
              .map((key, index) => (
                <Line
                  key={key}
                  dataKey={key}
                  stroke={lineColors[index % lineColors.length]}
                  strokeWidth={2}
                  activeDot={{ r: 6 }}
                />
              ))}
        </LineChart>
      </ResponsiveContainer>
      <Divider sx={{ mt: 2 }} />
    </Box>
  );

  return (
    <Container>
      <Card elevation={5} sx={{ padding: 3, mt: 3 }}>
        {/* Removed Deal Statistics title */}

        {loading ? (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              flexDirection: "column",
              padding: 4,
            }}
          >
            <CircularProgress color="primary" />
            <Typography sx={{ mt: 2, color: "#555", fontSize: "1.2rem" }}>
              Loading... Please Wait
            </Typography>
          </Box>
        ) : (
          <Box sx={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between" }}>
            {renderLineChart(
              "Weighted Allocation as % of Deal Size",
              dealSizeData,
              formatValue
            )}
            {renderLineChart(
              "Weighted Allocation as % of IOI",
              allocationData,
              formatValue
            )}
          </Box>
        )}
      </Card>
    </Container>
  );
};

export default DealStatsGraph;
