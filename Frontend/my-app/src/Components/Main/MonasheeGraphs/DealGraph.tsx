import React, { useState, useEffect } from "react";
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
  Container,
  Grid,
  Box,
  Typography,
} from "@mui/material";
import axios from "axios";
import DealPieChart from "./MonasheePieCharts/DealPieChart";
import AreaChartComponent from "./SectorDotGraphs/AreaChartComponent";
import DealTypeSector from "./SectorDotGraphs/DealTypeSector";
import DealsDataFilter from "../MonasheeDeals/DeoLogicData/DealsDataFilter";

interface ApiResponse {
  [key: string]: {
    FO: {
      US: { [sector: string]: { count: number } };
      International: { [sector: string]: { count: number } };
    };
    IPO: {
      US: { [sector: string]: { count: number } };
      International: { [sector: string]: { count: number } };
    };
  };
}

interface ChartData {
  name: string;
  IPO?: number;
  FO?: number;
  total?: number;
}

interface DealPieChartData {
  sectorData: { name: string; value: number }[];
  regionData: { name: string; value: number }[];
}

const DealGraph: React.FC = () => {
  const [data, setData] = useState<ChartData[]>([]);
  const [filters, setFilters] = useState({
    years: [] as string[],
    regions: [] as string[],
    sectors: [] as string[],
    deal_types: [] as string[],
    period: [] as string[],
  });

  const fetchData = async () => {
    try {
      const apiUrl = process.env.REACT_APP_API_URL;

      if (!apiUrl) {
        throw new Error("API URL is not defined in environment variables");
      }

      const response = await axios.post<ApiResponse>(`${apiUrl}/api/deals_graph/`, filters);
      setData(transformData(response.data));
    } catch (error) {
      console.error("Error fetching data from API:", error);
    }
  };

  const transformData = (apiData: ApiResponse): ChartData[] => {
    return Object.keys(apiData).map((key) => {
      const ipoData = apiData[key].IPO;
      const foData = apiData[key].FO;

      const ipoTotal = Object.values(ipoData.US || {}).reduce((sum, { count }) => sum + count, 0) +
                       Object.values(ipoData.International || {}).reduce((sum, { count }) => sum + count, 0);
      const foTotal = Object.values(foData.US || {}).reduce((sum, { count }) => sum + count, 0) +
                      Object.values(foData.International || {}).reduce((sum, { count }) => sum + count, 0);

      return {
        name: key,
        IPO: ipoTotal,
        FO: foTotal,
        total: ipoTotal + foTotal,
      };
    });
  };

  useEffect(() => {
    fetchData();
  }, [filters]);

  const handleFilterChange = (newFilters: typeof filters) => {
    setFilters(newFilters);
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const { name, IPO, FO, total } = payload[0].payload;
      return (
        <div style={{ backgroundColor: "white", border: "1px solid #ccc", padding: "10px" }}>
          <h4>{name}</h4>
          {IPO !== undefined && <p>IPO: {IPO}</p>}
          {FO !== undefined && <p>FO: {FO}</p>}
          <p>Total Deals: {total}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <Container maxWidth="lg" sx={{ paddingY: 4, display: "flex" }}>
      {/* Filters on the left */}
      <Box width="300px" sx={{ marginRight: 4 }}>
        <DealsDataFilter appliedFilters={{
          years: [],
          regions: [],
          sectors: [],
          deal_types: [],
          period: []
        }} onFiltersChange={function (newFilters: { years: string[]; regions: string[]; sectors: string[]; deal_types: string[]; period: string[]; }): void {
          throw new Error("Function not implemented.");
        } } />
      </Box>

      {/* Graphs on the right */}
      <Box flex={1}>
        <Typography
          variant="h6"
          sx={{
            maxWidth: "600px",
            fontSize: { xs: "1rem", sm: "1.2rem", md: "1.5rem" },
            lineHeight: "1.6",
            marginBottom: "10px",
            color: "#002060",
            fontWeight: "bold",
          }}
        >
          Number Of Deals
        </Typography>

        <Box sx={{ width: "100%", height: 400 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{
                top: 20,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar dataKey="IPO" stackId="a" fill="#8884d8" name="IPO" />
              <Bar dataKey="FO" stackId="a" fill="#82ca9d" name="FO" />
            </BarChart>
          </ResponsiveContainer>
        </Box>
      </Box>
    </Container>
  );
};

export default DealGraph;
