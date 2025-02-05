import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  Box,
  RadioGroup,
  FormControlLabel,
  Radio,
  Container,
  Card,
  Stack,
  Chip,
  Typography,
  CircularProgress,
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

const formatValue = (value: number): string => {
  const absValue = Math.abs(value);
  const sign = value < 0 ? "-" : "";

  if (absValue >= 1_000_000_000)
    return `${sign}$${(absValue / 1_000_000_000).toFixed(1)}B`;
  if (absValue >= 1_000_000)
    return `${sign}$${(absValue / 1_000_000).toFixed(1)}M`;
  if (absValue >= 1_000) return `${sign}$${(absValue / 1_000).toFixed(1)}K`;

  return `${sign}$${absValue.toFixed(2)}`;
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
    label: "Deal Caption",
    value: "caption",
    payload: { filter_type: "deal_captain" },
  },
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
    "#FF6384",
    "#36A2EB",
    "#FFCE56",
    "#4BC0C0",
    "#9966FF",
    "#FF9F40",
  ];

  return (
    <Container>
      <Card>
        <Typography variant="h5" sx={{ color: "#002060", fontWeight: "bold" }}>
          {" "}
          Deal Statistics
        </Typography>
 {/* Data Field Selection - Using MUI Radio Buttons */}
 <Box
          sx={{
            // background: 'linear-gradient(to right, #190250, #6DD5ED)',           

            padding: 1,
            borderRadius: "8px",
            margin: 2,
          }}
        >
          <Stack direction="row" spacing={1}>
            {dataFields.map((field) => (
              <Chip
                key={field}
                label={field.replace(/_/g, " ")}
                clickable
                onClick={() => setSelectedField(field)}
                color={selectedField === field ? "primary" : "default"}
                sx={{
                  color: "#002060",
                  borderColor: "white",
                  "&.MuiChip-outlined": { borderWidth: 2 },
                }}
              />
            ))}
          </Stack>
        </Box>
      

        {loading ? (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <CircularProgress color="primary" />
            <Typography sx={{ mt: 2, color: "#555", fontSize: "1.2rem" }}>
              Loading... Please Wait
            </Typography>
          </Box>
        ) : (
          <ResponsiveContainer width="100%" height={450}>
            <BarChart
              data={chartData}
              margin={{ top: 20, right: 30, left: 20, bottom: 40 }}
            >
              {/* X-Axis */}
              <XAxis
                dataKey="year"
                stroke="#b2b2b2"
                tick={{ fill: "#000000", fontSize: 12 }}
                label={{
                  value: "Year",
                  position: "insideBottom",
                  dy: 10,
                  fill: "#002060",
                }}
              />

              <YAxis
                stroke="#b2b2b2"
                tick={{ fill: "#002060", fontSize: 12 }}
                tickFormatter={formatValue}
                label={{
                  value: `${selectedField}`,
                  angle: -90,
                  position: "outsideLeft",
                  fill: "#b2b2b2",
                  dx: -30,
                  dy: -10,
                }}
              />

              <Tooltip
                contentStyle={{
                  backgroundColor: "#333",
                  color: "#000000",
                  borderRadius: 8,
                  padding: 8,
                }}
                formatter={(value: number) => formatValue(value)}
              />

              <Legend
                wrapperStyle={{ color: "#000000", fontSize: 14, bottom: 10 }}
              />

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
                    barSize={40} // Adjust bar width
                  />
                ))}
            </BarChart>
          </ResponsiveContainer>
        )}
          <Box
          sx={{
            background: 'linear-gradient(to right, #190250, #6DD5ED)',           
            paddingX: 2,
            borderRadius: "8px",
            boxShadow: 3,
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center", // Centering items horizontally
            alignItems: "center", // Centering items vertically
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
            } // Update with the full option
            row // Arrange radio buttons in a row
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
