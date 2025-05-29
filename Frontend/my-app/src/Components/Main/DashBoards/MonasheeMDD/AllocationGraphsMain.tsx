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
  Card,
  Typography,
  CircularProgress,
} from "@mui/material";
import { useNavigate } from "react-router-dom";

interface ChartData {
  year: string;
  [key: string]: number | string;
}

interface ApiResponse {
  [year: string]: {
    [category: string]: {
      count: number;
      weighted_allocation_deal_size_percentage: number;
      weighted_allocation_percentage: number;
    };
  };
}

interface AllocationGraphsMainProps {
  selectedFilters: { [key: string]: (string | number)[] };
}

const formatValue = (value: number): string => {
  const absValue = Math.abs(value);
  const sign = value < 0 ? "-" : "";
  return `${sign}${absValue.toFixed(2)}%`;
};

const formatValuesized = (value: number): string => {
  const absValue = Math.abs(value);
  const sign = value < 0 ? "-" : "";
  return `${sign}${absValue.toFixed(1)}%`;
};

const AllocationGraphsMain: React.FC<AllocationGraphsMainProps> = ({ selectedFilters }) => {
  const [dealSizeData, setDealSizeData] = useState<ChartData[]>([]);
  const [allocationData, setAllocationData] = useState<ChartData[]>([]);
  const [dealCountData, setDealCountData] = useState<ChartData[]>([]);
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

      const payload = Object.assign({}, defaultFilters, selectedFilters);

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
      setDealCountData([]);
    } finally {
      setLoading(false);
    }
  };
  const handleCardClick = () => {
    window.open("/equity/capital-markets/deal-stats", "_blank");
  };
  const formatChartData = (data: ApiResponse) => {
    const dealSize: ChartData[] = [];
    const allocation: ChartData[] = [];
    const dealCount: ChartData[] = [];

    Object.keys(data).forEach((year) => {
      const categories = data[year];
      let dealSizeRow: ChartData = { year };
      let allocationRow: ChartData = { year };
      let countRow: ChartData = { year };

      ["IPO", "FO"].forEach((category) => {
        const catData = categories[category];
        dealSizeRow[category] = catData?.weighted_allocation_deal_size_percentage ?? 0;
        allocationRow[category] = catData?.weighted_allocation_percentage ?? 0;
        countRow[category] = catData?.count ?? 0;
      });

      dealSize.push(dealSizeRow);
      allocation.push(allocationRow);
      dealCount.push(countRow);
    });

    setDealSizeData(dealSize);
    setAllocationData(allocation);
    setDealCountData(dealCount);
  };

  const lineColors = ["#60A5FA", "#F97316"];

  const renderLineChart = (
    title: string,
    data: ChartData[],
    yAxisFormatter: (val: number) => string,
    titleColor: string
  ) => (
    <Card
      elevation={3}
      sx={{
        flex: "1 1 32%",
        marginX: 1,
        padding: 1.5,
        minWidth: 0,
      }}
    >
      <Typography
        variant="subtitle1"
        sx={{
          color: titleColor,
          mb: 1.5,
          textAlign: "center",
          fontSize: "0.95rem",
        }}
      >
        {title}
      </Typography>
      <ResponsiveContainer width="100%" height={240}>
        <LineChart
          data={data}
          margin={{ top: 20, right: 10, left: 10, bottom: 30 }}
        >
          <XAxis
            dataKey="year"
            stroke="#b2b2b2"
            tick={{ fill: "#000", fontSize: 12 }}
            label={{
              align: "center",
              position: "insideBottom",
              dy: 20,
              fill: "#002060",
              fontSize: 12,
            }}
          />
          <YAxis
            stroke="#000"
            tickFormatter={(value) => yAxisFormatter(value as number)}
            tick={{ fontSize: 11 }}
          />
          <Tooltip formatter={(value) => yAxisFormatter(value as number)} />
          <Legend
            verticalAlign="bottom"
            align="center"
            wrapperStyle={{ paddingTop: 20, fontSize: 12 }}
          />
          {data.length > 0 &&
            Object.keys(data[0])
              .filter((key) => key !== "year")
              .map((key, index) => (
                <Line
                  key={key}
                  dataKey={key}
                  stroke={lineColors[index % lineColors.length]}
                  strokeWidth={2}
                  activeDot={{ r: 5 }}
                />
              ))}
        </LineChart>
      </ResponsiveContainer>
    </Card>
  );

  return (
    <Box sx={{ padding: 2 }}>
      {/* Clickable Title */}
      <Box
        onClick={handleCardClick}
        sx={{
          cursor: "pointer",
          textAlign: "center",
          mb: 2,
          color: "#004d2a",
        }}
      >
     <Typography
        variant="h6"
        color="#004d2a"
        fontWeight="bold"
        gutterBottom
        sx={{ mb: 2 }}
      >        Quarterly Weighted Allocation Trends (2024–2025)
      </Typography>

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
        <Box
          sx={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "stretch",
            flexWrap: "nowrap",
          }}
        >
          {renderLineChart(
            "Deal Count ",
            dealCountData,
            (val) => `${val}`,
            "#bd3600"
          )}
          {renderLineChart(
            "Weighted Allocation as % of Deal Size",
            dealSizeData,
            formatValue,
            "#bd3600"
          )}
          {renderLineChart(
            "Weighted Allocation as % of IOI",
            allocationData,
            formatValuesized,
            "#bd3600"
          )}
        </Box>
      )}
    </Box>
    </Box>
  );
};

export default AllocationGraphsMain;
