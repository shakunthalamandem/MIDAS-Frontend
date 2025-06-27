import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Box,
  Typography,
  CircularProgress,
  Alert,
} from "@mui/material";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import IPODashboardTable from "./IPODashboardTable";

interface RegionMonthwiseMetric {
  Total_Deal_Count_Sum: number;
  Total_Deal_Volume_Sum: number;
  Total_Postively_Performing_Deals: number;
  Total_Expected_returns_excess: number;
  Total_Long_Opportunity_Value: number;
}

interface RegionwiseMonthwiseResponse {
  RegionwiseMonthwiseTotal: Record<string, Record<string, RegionMonthwiseMetric>>;
}

interface MddIpoOpportunityChartProps {
  selectedYears: number[];
  selectedTab: "IPO" | "FO";
}

const formatValue = (value: number): string => {
  if (Math.abs(value) >= 1_000_000_000) return `${(value / 1_000_000_000).toFixed(2)}B`;
  if (Math.abs(value) >= 1_000_000) return `${(value / 1_000_000).toFixed(2)}M`;
  return value.toFixed(2);
};

const MddIpoOpportunityChart: React.FC<MddIpoOpportunityChartProps> = ({
  selectedYears,
  selectedTab,
}) => {
  const [chartData, setChartData] = useState<{ month: string; opportunity_value_ex: number }[]>([]);
  const [fullPayload, setFullPayload] = useState<Record<string, Record<string, RegionMonthwiseMetric>>>({});
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const apiUrl = process.env.REACT_APP_API_URL;
  const token = localStorage.getItem("access_token");

  useEffect(() => {
    const fetchGraphData = async () => {
      setLoading(true);
      try {
        const year_range = selectedYears.length === 1
          ? [selectedYears[0], selectedYears[0]]
          : [Math.min(...selectedYears), Math.max(...selectedYears)];

        const response = await axios.post<RegionwiseMonthwiseResponse>(
          `${apiUrl}/api/skewtable/calculations/`,
          {
            filters: {
              year_range,
              deal_type: [selectedTab],
            },
          },
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: token ? `Bearer ${token}` : "",
            },
          }
        );

        const regionData = response.data.RegionwiseMonthwiseTotal || {};
        setFullPayload(regionData);

        const chartArray: { month: string; opportunity_value_ex: number }[] = [];
        selectedYears.forEach((year) => {
          const yearData = regionData[year];
          if (yearData) {
            Object.entries(yearData).forEach(([month, metrics]) => {
              chartArray.push({
                month: `${month} ${year}`,
                opportunity_value_ex: metrics.Total_Long_Opportunity_Value,
              });
            });
          }
        });

        setChartData(chartArray);
        setError(null);
      } catch (err) {
        console.error(err);
        setError("Failed to load data");
      } finally {
        setLoading(false);
      }
    };

    fetchGraphData();
  }, [selectedYears, selectedTab]);

  const yearLabel = selectedYears.length === 1
    ? selectedYears[0].toString()
    : `${Math.min(...selectedYears)} - ${Math.max(...selectedYears)}`;

  return (
    <>
      {fullPayload && <IPODashboardTable payload={fullPayload} />}

      <Typography variant="h6" gutterBottom align="center" color="#002060" mt={2}>
        Opportunity Value Trends in {selectedTab}'s in {yearLabel}
      </Typography>

      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" height={300}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error">{error}</Alert>
      ) : (
        <ResponsiveContainer width="100%" height={400}>
          <BarChart
            data={chartData}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            style={{ backgroundColor: "#f9fafb", borderRadius: 8 }}
          >
            <XAxis dataKey="month" />
            <YAxis tickFormatter={formatValue} />
            <Tooltip
              formatter={(value: number) => formatValue(value)}
              labelFormatter={(label) => `Month: ${label}`}
            />
            <ReferenceLine y={0} stroke="#999" strokeWidth={2} />
            <Bar
              dataKey="opportunity_value_ex"
              fill="#F97316"
              barSize={24}
              animationDuration={800}
            />
          </BarChart>
        </ResponsiveContainer>
      )}
    </>
  );
};

export default MddIpoOpportunityChart;
