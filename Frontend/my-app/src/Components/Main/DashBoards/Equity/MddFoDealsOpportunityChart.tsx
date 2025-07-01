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
  Legend,
  ReferenceLine,
} from "recharts";
import FODashboardTable from "./FODashboardTable";

interface RegionwiseMonthwise {
  [region: string]: {
    [year: string]: {
      [month: string]: {
        Long_Opportunity_Value: number;
        Total_Deal_Count: number;
        Total_Deal_Volume: number;
        Positively_Performing_Deals_Percentage: number;
        Expected_Returns_Excess: number;
      };
    };
  };
}

interface RegionMonthwiseMetric {
  Total_Deal_Count_Sum: number;
  Total_Deal_Volume_Sum: number;
  Total_Postively_Performing_Deals: number;
  Total_Expected_returns_excess: number;
  Total_Long_Opportunity_Value: number;
}

interface MddApiResponse {
  RegionwiseMonthwise: RegionwiseMonthwise;
  RegionwiseMonthwiseTotal: {
    [year: string]: {
      [month: string]: RegionMonthwiseMetric;
    };
  };
}

interface MddFoOpportunityChartProps {
  selectedYears: number[];
  selectedTab: "IPO" | "FO";
}

const monthOrder = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
];

const regionColors: { [region: string]: string } = {
  "US": "#1f77b4",
  "EMEA": "#ff7f0e",
  "APAC": "#2ca02c",
  "Non-US America": "#d62728"
};

const formatValue = (value: number): string => {
  if (Math.abs(value) >= 1_000_000_000) return `${(value / 1_000_000_000).toFixed(2)}B`;
  if (Math.abs(value) >= 1_000_000) return `${(value / 1_000_000).toFixed(2)}M`;
  return value.toFixed(2);
};

const MddFoOpportunityChart: React.FC<MddFoOpportunityChartProps> = ({
  selectedYears,
  selectedTab,
}) => {
  const [chartData, setChartData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [regionwiseMonthwise, setRegionwiseMonthwise] = useState<RegionwiseMonthwise>({});
  const [regionwiseMonthwiseTotal, setRegionwiseMonthwiseTotal] = useState<MddApiResponse["RegionwiseMonthwiseTotal"]>({});

  const apiUrl = process.env.REACT_APP_API_URL;
  const token = localStorage.getItem("access_token");

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const year_range =
          selectedYears.length === 1
            ? [selectedYears[0], selectedYears[0]]
            : [Math.min(...selectedYears), Math.max(...selectedYears)];

        const response = await axios.post<MddApiResponse>(
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

        const regionData = response.data.RegionwiseMonthwise || {};
        const totalData = response.data.RegionwiseMonthwiseTotal || {};
        setRegionwiseMonthwise(regionData);
        setRegionwiseMonthwiseTotal(totalData);

        const chartMap: { [monthYear: string]: any } = {};
        const allMonthsSet = new Set<string>();

        Object.entries(regionData).forEach(([region, yearData]) => {
          Object.entries(yearData).forEach(([year, monthData]) => {
            Object.entries(monthData).forEach(([month, values]) => {
              const monthYear = `${month} ${year}`;
              allMonthsSet.add(monthYear);
              if (!chartMap[monthYear]) chartMap[monthYear] = { month: monthYear };
              chartMap[monthYear][region] = values.Long_Opportunity_Value;
            });
          });
        });

        const orderedMonths = Array.from(allMonthsSet).sort((a, b) => {
          const [monthA, yearA] = a.split(" ");
          const [monthB, yearB] = b.split(" ");
          const yDiff = parseInt(yearA) - parseInt(yearB);
          return yDiff !== 0
            ? yDiff
            : monthOrder.indexOf(monthA) - monthOrder.indexOf(monthB);
        });

        const finalData = orderedMonths.map((month) => chartMap[month]);
        setChartData(finalData);
        setError(null);
      } catch (err) {
        console.error(err);
        setError("Failed to fetch chart data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedYears, selectedTab]);

  const yearLabel =
    selectedYears.length === 1
      ? selectedYears[0].toString()
      : `${Math.min(...selectedYears)} - ${Math.max(...selectedYears)}`;

  return (
    <>
      <FODashboardTable
        payload={regionwiseMonthwiseTotal}
        regionwiseMonthwise={regionwiseMonthwise}
      />

      <Typography variant="h6" gutterBottom align="center" color="#002060" mt={3}>
        Region-wise Opportunity Value in {selectedTab}s ({yearLabel})
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
            <Legend />
            <ReferenceLine y={0} stroke="#aaa" />
            {Object.keys(regionColors).map((region) => (
              <Bar
                key={region}
                dataKey={region}
                fill={regionColors[region]}
                barSize={20}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      )}
    </>
  );
};

export default MddFoOpportunityChart;
