import React, { useState, useEffect } from "react";
import axios from "axios";
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid } from "recharts";

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
      <div className="bg-gray-900 bg-opacity-50 p-4 rounded-lg mb-4 flex flex-wrap">
        {filterOptions.map((option) => (
          <label key={option.value} className="mr-4 text-white">
            <input
              type="radio"
              name="filter"
              value={option.value}
              checked={selectedFilter.value === option.value}
              onChange={() => setSelectedFilter(option)}
              className="mr-2"
            />
            {option.label}
          </label>
        ))}
      </div>

      {loading ? (
        <p className="text-white">Loading...</p>
      ) : (
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 50 }}>
            {/* <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.2)" /> */}
            <XAxis dataKey="year" stroke="#ffffff" />
            <YAxis stroke="#ffffff" />
            <Tooltip contentStyle={{ backgroundColor: "#333", color: "#fff" }} />
            <Legend wrapperStyle={{ color: "#fff" }} />
            {chartData.length > 0 &&
              Object.keys(chartData[0])
                .filter((key) => key !== "year")
                .map((key, index) => (
                  <Bar
                    key={index}
                    dataKey={key}
                    stackId="a"
                    fill={barColors[index % barColors.length]}
                    radius={[4, 4, 0, 0]}
                  />
                ))}
          </BarChart>
        </ResponsiveContainer>
      )}

      {/* Data Field Selection */}
      <div className="bg-gray-900 bg-opacity-50 p-4 rounded-lg mt-4 flex flex-wrap">
        {dataFields.map((field) => (
          <label key={field} className="mr-4 text-white">
            <input
              type="radio"
              name="dataField"
              value={field}
              checked={selectedField === field}
              onChange={() => setSelectedField(field)}
              className="mr-2"
            />
            {field.replace(/_/g, " ")}
          </label>
        ))}
      </div>
    </div>
  );
};

export default DealStatsGraph;
