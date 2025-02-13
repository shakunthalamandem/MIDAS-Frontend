import React, { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ScatterChart,
  Scatter,
} from "recharts";
import {
  Box,
  Chip,
  Typography,
  CircularProgress,
  RadioGroup,
  FormControlLabel,
  Radio,
  Container,
  Card,

} from "@mui/material";

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

const formatValue = (value: number, selectedField: string): string => {
  const absValue = Math.abs(value);
  const sign = value < 0 ? "-" : "";

  const prefix = ["deal_size", "avg_deal_size"].includes(selectedField)
    ? "$"
    : "";
  const suffix = [
    "allocation_deal_size_percentage",
    "weighted_allocation_deal_size_percentage",
    "allocation_percentage",
    "weighted_allocation_percentage",
  ].includes(selectedField)
    ? "%"
    : "";

  let precision = 2; 

  if (["count", "deal_size", "avg_deal_size"].includes(selectedField)) {
    precision = 0; // Round to 0 decimal places for these fields
  }

  if (selectedField === "count") {
    return `${sign}${prefix}${absValue.toFixed(precision)}${suffix}`;
  }

  if (absValue >= 1_000_000_000) {
    return `${sign}${prefix}${(absValue / 1_000_000_000).toFixed(precision)}B${suffix}`;
  }
  if (absValue >= 1_000_000) {
    return `${sign}${prefix}${(absValue / 1_000_000).toFixed(precision)}M${suffix}`;
  }
  if (absValue >= 1_000) {
    return `${sign}${prefix}${(absValue / 1_000).toFixed(precision)}K${suffix}`;
  }

  return `${sign}${prefix}${absValue.toFixed(precision)}${suffix}`;
};

const filterOptions: FilterOption[] = [
  { label: "Deal Type", value: "deal_type", payload: null },
  {
    label: "Sector",
    value: "sector",
    payload: { filter_type: "gics_sector_from_bloomberg" },
  },
  {
    label: "Region",
    value: "region",
    payload: { filter_type: "broad_region" },
  },
  {
    label: "Deal Captain",
    value: "caption",
    payload: { filter_type: "deal_captain" },
  },
];

const dataFieldsWithLabels = [
  { label: "Deal Count", value: "count" },
  { label: "Deal Volume", value: "deal_size" },
  { label: "Average Deal Size", value: "avg_deal_size" },
  // {
  //   label: "Allocation as % of Deal Size",
  //   value: "allocation_deal_size_percentage",
  // },
  {
    label: "Weighted Allocation as % of Deal Size",
    value: "weighted_allocation_deal_size_percentage",
  },
  // { label: "Allocation as % of IOI", value: "allocation_percentage" },
  {
    label: "Weighted Allocation as % of IOI",
    value: "weighted_allocation_percentage",
  },
];

interface DealStatsGraphProps {
  selectedFilters: { [key: string]: (string | number)[] };
}

const DealStatsGraph: React.FC<DealStatsGraphProps> = ({ selectedFilters }) => {
  const [selectedFilter, setSelectedFilter] = useState<FilterOption>(
    filterOptions[0]
  );
  const [selectedField, setSelectedField] = useState<string>("count");
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const apiUrl = process.env.REACT_APP_API_URL;
  const token = localStorage.getItem("access_token");

  useEffect(() => {
    fetchData();
  }, [selectedField, selectedFilter, selectedFilters]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const payload = {
        ...selectedFilters,
        ...(selectedFilter.payload || {}),
      };
      const response = await fetch(`${apiUrl}/api/mdd_deals_graph/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      setChartData(formatChartData(data));
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
        formatted[category] =
          categories[category][
            selectedField as keyof (typeof categories)[typeof category]
          ] || 0;
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

  const barColors = [
    "#60A5FA", // Sky Blue
    "#F97316", // Orange
    "#14B8A6", // Teal
    "#FACC15", // Gold
    "#EF4444", // Red
    "#64748B", // Slate Gray
    "#0EA5E9", // Light Cyan Blue
    "#22C55E", // Green
    "#D97706", // Deep Yellow
    "#8B5CF6", // Indigo
    "#9CA3AF", // Cool Gray
    "#1E3A8A", // Dark Blue
    "#2563EB", // Bright Blue
  ];

  return (
    <Container>
      <Card elevation={5}>
        <Typography variant="h5" sx={{ color: "#002060", fontWeight: "bold", marginTop: 3 }}>
          Deal Statistics
        </Typography>
        <Box sx={{ padding: 1, borderRadius: "8px", margin: 2 }}>
          <Box display="flex" justifyContent="center" mb={2} gap={1} flexWrap="wrap">
            {dataFieldsWithLabels.map(({ label, value }) => (
              <Chip
                key={value}
                label={label}
                clickable
                onClick={() => setSelectedField(value)}
                variant={selectedField === value ? "filled" : "outlined"}
                sx={{
                  color: selectedField === value ? "#FFFFFF" : "#3f51b5",
                  backgroundColor: selectedField === value ? "#9b0000" : "#dfdfdf",
                  border: selectedField === value ? "2px solid #9b0000" : "2px solid #dfdfdf",
                  fontWeight: selectedField === value ? "bold" : "normal",
                  transition: "all 0.3s ease",
                  "&:hover": {
                    backgroundColor: selectedField === value ? "#7b0000" : "rgba(63, 81, 181, 0.1)",
                  },
                }}
              />
            ))}
          </Box>
        </Box>

        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
            <CircularProgress color="primary" />
            <Typography sx={{ mt: 2, color: "#555", fontSize: "1.2rem" }}>
              Loading... Please Wait
            </Typography>
          </Box>
        ) : (
          <ResponsiveContainer width="100%" height={450}>
            {selectedField === "weighted_allocation_deal_size_percentage" ||
            selectedField === "weighted_allocation_percentage" ? (
              // ScatterChart for specific fields
              <ScatterChart                 data={chartData}
              margin={{ top: 20, right: 30, left: 20, bottom: 40 }}>
                <XAxis
                  dataKey="year"
                  stroke="#b2b2b2"
                  tick={{ fill: "#000000", fontSize: 12 }}
                  label={{ value: "Year", position: "insideBottom", dy: 10, fill: "#002060" }}
                />
                <YAxis
                  stroke="#000"
                  tickFormatter={(value) => formatValue(value, selectedField)}
                />
                <Tooltip formatter={(value) => formatValue(value as number, selectedField)} />
                <Legend wrapperStyle={{ color: "#000000", fontSize: 14, bottom: 10 }} />
                {chartData.length > 0 &&
                  Object.keys(
                    chartData.reduce(
                      (acc, item) => {
                        Object.keys(item).forEach((key) => {
                          if (key !== "year") acc[key] = true;
                        });
                        return acc;
                      },
                      {} as Record<string, boolean>
                    )
                  ).map((key, index) => (
                    <Scatter
                      key={index}
                      dataKey={key}
                      fill={barColors[index % barColors.length]}
                    />
                  ))}
              </ScatterChart>
            ) : (
              // BarChart for other fields
              <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 40 }}>
                <XAxis
                  dataKey="year"
                  stroke="#b2b2b2"
                  tick={{ fill: "#000000", fontSize: 12 }}
                  label={{ value: "Year", position: "insideBottom", dy: 10, fill: "#002060" }}
                />
                <YAxis stroke="#000" tickFormatter={(value) => formatValue(value, selectedField)} />
                <Tooltip formatter={(value) => formatValue(value as number, selectedField)} />
                <Legend wrapperStyle={{ color: "#000000", fontSize: 14, bottom: 10 }} />
                {chartData.length > 0 &&
                  Object.keys(
                    chartData.reduce(
                      (acc, item) => {
                        Object.keys(item).forEach((key) => {
                          if (key !== "year") acc[key] = true;
                        });
                        return acc;
                      },
                      {} as Record<string, boolean>
                    )
                  ).map((key, index) => (
                    <Bar
                      key={index}
                      dataKey={key}
                      stackId="a"
                      fill={barColors[index % barColors.length]}
                      radius={[4, 4, 0, 0]}
                      barSize={40}
                    />
                  ))}
              </BarChart>
            )}
          </ResponsiveContainer>
        )}

        <Box
          sx={{
            background: "linear-gradient(to right, #190250, #6DD5ED)",
            paddingX: 2,
            borderRadius: "8px",
            boxShadow: 3,
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
            alignItems: "center",
            marginBottom: 4,
            marginX: 2,
          }}
        >
          <RadioGroup
            value={selectedFilter.value}
            onChange={(e) =>
              setSelectedFilter(
                filterOptions.find((option) => option.value === e.target.value)!
              )
            }
            row
          >
            {filterOptions.map((option) => (
              <FormControlLabel
                key={option.value}
                value={option.value}
                control={<Radio sx={{ color: "white" }} />}
                label={option.label}
                sx={{
                  color: "white",
                  marginRight: 4,
                  "& .MuiRadio-root": {
                    color: "white",
                  },
                }}
              />
            ))}
          </RadioGroup>
        </Box>
      </Card>
    </Container>
  );
};

export default DealStatsGraph;
