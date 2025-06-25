import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Box,
  Typography,
  Paper,
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
  CartesianGrid,
  ReferenceLine,
} from "recharts";
import FODashboardTable from "./FODashboardTable";

interface ApiResponse {
  [month: string]: {
    [dealType: string]: {
      opportunity_value_ex: number;
      deal_size?: number;
      count?: number;
    };
  };
}


interface OpportunityData {
  month: string;
  opportunity_value_ex: number;
}
const formatValue = (value: number): string => {
  if (Math.abs(value) >= 1_000_000_000) {
    return `${(value / 1_000_000_000).toFixed(2)}B`;
  } else if (Math.abs(value) >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(2)}M`;
  } else {
    return value.toFixed(2);
  }
};

const MddFoDealsOpportunityChart: React.FC = () => {
  const [data, setData] = useState<OpportunityData[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const apiUrl = process.env.REACT_APP_API_URL;
  const token = localStorage.getItem("access_token");
  const [fullPayload, setFullPayload] = useState<ApiResponse | null>(null);




  useEffect(() => {
    const fetchGraphData = async () => {
      setLoading(true);
      try {
        const response = await axios.post<ApiResponse>(
          `${apiUrl}/api/mdd_deals_graph/`,
          {
            fo_type: ["Marketed", "Overnight", "Block"],
            years: [2025],
            period: ["Monthly"],
            deal_type: ["FO"],
          },
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: token ? `Bearer ${token}` : "",
            },
          }
        );

      setFullPayload(response.data);

        // Prepare chart data
        const transformedData: OpportunityData[] = Object.entries(response.data).map(
          ([month, value]) => ({
            month,
            opportunity_value_ex: value["FO"].opportunity_value_ex,
          })
        );

        setData(transformedData);
        setError(null);
      } catch (err) {
        console.error(err);
        setError("Failed to load FO data");
      } finally {
        setLoading(false);
      }
    };

    fetchGraphData();
  }, []);



  return (
    <>
      {fullPayload && <FODashboardTable payload={fullPayload} />}


      <Typography variant="h6" gutterBottom align="center" color="#002060" mt={2}>
        Opportunity Value Trends in Follow-on's in 2025
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
            data={data}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            style={{ backgroundColor: "#f9fafb", borderRadius: 8 }}
          >
            <XAxis
              dataKey="month"
              tickFormatter={(month) => {
                const parts = month.split(" ");
                const monthNumber = parseInt(parts[1], 10);
                const monthNames = [
                  "January", "February", "March", "April", "May", "June",
                  "July", "August", "September", "October", "November", "December"
                ];
                return monthNames[monthNumber - 1] ?? month;
              }}
            />
            <YAxis tickFormatter={formatValue} width={100} />

            {/* ✅ Zero axis line */}
            <ReferenceLine y={0} stroke="#999" strokeWidth={2} />

            <Tooltip
              formatter={(value: number) => formatValue(value)}
              labelFormatter={(label) => `Month: ${label}`}
            />
            <Bar
              dataKey="opportunity_value_ex"
              fill="#60A5FA"
              barSize={24}
              animationDuration={800}
              isAnimationActive
            />
          </BarChart>
        </ResponsiveContainer>
      )}
    </>
  );
};

export default MddFoDealsOpportunityChart;
