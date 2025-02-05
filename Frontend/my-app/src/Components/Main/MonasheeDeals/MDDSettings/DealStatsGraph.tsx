import React, { useState, useEffect } from "react";
import axios from "axios";
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Box, RadioGroup, FormControlLabel, Radio } from "@mui/material";

const API_URL = "http://192.168.1.59:9000/api/mdd_deals_graph/";

interface ChartData {
  year: string;
  [key: string]: number | string;
}

interface ApiResponse {
  [year: string]: {
    [category: string]: {
      count: number;
      deal_size: number;
      avg_deal_size: number;
      allocation_deal_size_percentage: number;
      weighted_allocation_deal_size_percentage: number;
      allocation_percentage: number;
      weighted_allocation_percentage: number;
    };
  };
}

interface FilterOption {
  label: string;
  value: string;
  payload: { filter_type: string } | null;
}

const filterOptions: FilterOption[] = [
  { label: "Deal Type", value: "deal_type", payload: null },
  { label: "Sector", value: "sector", payload: { filter_type: "gics_sector_from_bloomberg" } },
  { label: "Region", value: "region", payload: { filter_type: "broad_region" } },
  { label: "Deal Caption", value: "caption", payload: { filter_type: "deal_captain" } },
];

const dataFields = [
  "count",
  "deal_size",
  "avg_deal_size",
  "allocation_deal_size_percentage",
  "weighted_allocation_deal_size_percentage",
  "allocation_percentage",
  "weighted_allocation_percentage",
];

const DealStatsGraph: React.FC = () => {
  const [selectedFilter, setSelectedFilter] = useState<FilterOption>(filterOptions[0]);
  const [selectedField, setSelectedField] = useState<string>("count");
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    // Re-fetch the data when selectedField changes
    fetchData(selectedFilter.payload);
  }, [selectedField, selectedFilter]);

  const fetchData = async (payload: any) => {
    setLoading(true);
    try {
      const response = await axios.post<ApiResponse>(API_URL, payload);
      setChartData(formatChartData(response.data));
    } catch (error) {
      console.error("Error fetching data", error);
      setChartData([]);
    } finally {
      setLoading(false);
    }
  };

  const formatChartData = (data: ApiResponse): ChartData[] => {
    if (!data || typeof data !== "object") return [];
    return Object.keys(data).map((year) => {
      const categories = data[year];
      let formatted: ChartData = { year };
      Object.keys(categories).forEach((category) => {
        formatted[category] = categories[category][selectedField as keyof typeof categories[typeof category]] || 0;
      });
      return formatted;
    });
  };

  useEffect(() => {
    setChartData((prevData) => {
      return prevData.map((item) => {
        let updatedItem: ChartData = { year: item.year };
        Object.keys(item).forEach((key) => {
          if (key !== "year") {
            updatedItem[key] = item[key] as number;
          }
        });
        return updatedItem;
      });
    });
  }, [selectedField]);

  // Colors for stacked bars
  const barColors = ["#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0", "#9966FF", "#FF9F40"];

  return (
    <div className="p-4 bg-transparent shadow-none">
      <h2 className="text-lg font-semibold mb-4 text-white">Deal Statistics</h2>

      {/* Primary Filter Box */}
      <Box
        sx={{
          background: 'linear-gradient(45deg, rgba(255, 0, 150, 0.5), rgba(0, 204, 255, 0.5))', // Multi-color transparent background
          padding: 4,
          borderRadius: '8px',
          boxShadow: 3,
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'center', // Centering items horizontally
          alignItems: 'center',     // Centering items vertically
          marginBottom: 4,
        }}
      >
        <RadioGroup
          value={selectedFilter.value}
          onChange={(e) => setSelectedFilter(filterOptions.find(option => option.value === e.target.value)!)} // Update with the full option
          row // Arrange radio buttons in a row
        >
          {filterOptions.map((option) => (
            <FormControlLabel
              key={option.value}
              value={option.value}
              control={<Radio sx={{ color: 'white' }} />}
              label={option.label}
              sx={{
                color: 'white',
                marginRight: 4,
                '& .MuiRadio-root': {
                  color: 'white',
                },
              }}
            />
          ))}
        </RadioGroup>
      </Box>

      {loading ? (
        <p className="text-white">Loading...</p>
      ) : (
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 50 }}>
            <XAxis dataKey="year" stroke="#000000" />
            <YAxis stroke="#000000" />
            <Tooltip contentStyle={{ backgroundColor: "#333", color: "#fff" }} />
            <Legend wrapperStyle={{ color: "#000" }} />
            {
              chartData.length > 0 &&
              // Collect all unique categories across all years
              Object.keys(
                chartData.reduce((acc, item) => {
                  Object.keys(item).forEach((key) => {
                    if (key !== "year") acc[key] = true;  // Mark all unique keys
                  });
                  return acc;
                }, {} as Record<string, boolean>)
              ).map((key, index) => (
                <Bar
                  key={index}
                  dataKey={key}
                  stackId="a"
                  fill={barColors[index % barColors.length]}
                  radius={[4, 4, 0, 0]}
                />
              ))
            }
          </BarChart>
        </ResponsiveContainer>
      )}

      {/* Data Field Selection - Using MUI Radio Buttons */}
      <Box
        sx={{
          background: 'rgba(0, 0, 0, 0.5)',
          padding: 4,
          borderRadius: '8px',
          marginTop: 4,
        }}
      >
        <RadioGroup
          value={selectedField}
          onChange={(e) => setSelectedField(e.target.value)}
          row
        >
          {dataFields.map((field) => (
            <FormControlLabel
              key={field}
              value={field}
              control={<Radio sx={{ color: 'white' }} />}
              label={field.replace(/_/g, " ")} // Replace underscores with spaces for display
              sx={{
                color: 'white',
                marginRight: 4,
                '& .MuiRadio-root': {
                  color: 'white',
                },
              }}
            />
          ))}
        </RadioGroup>
      </Box>
    </div>
  );
};

export default DealStatsGraph;
