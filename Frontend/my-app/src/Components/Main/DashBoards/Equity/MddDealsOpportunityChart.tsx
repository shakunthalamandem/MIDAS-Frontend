import React, { useEffect, useState } from "react";
import axios from "axios";
import { Box, Typography, Paper, CircularProgress, Alert } from "@mui/material";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

interface ApiResponse {
  [month: string]: {
    [dealType: string]: {
      opportunity_value_ex: number;
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

const MddDealsOpportunityChart: React.FC = () => {
  const [data, setData] = useState<OpportunityData[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const apiUrl = process.env.REACT_APP_API_URL;
  const token = localStorage.getItem("access_token");

  useEffect(() => {
    const fetchGraphData = async () => {
      setLoading(true);
      try {
        const response = await axios.post<ApiResponse>(
          `${apiUrl}/api/mdd_deals_graph/`,
          {
            fo_type: ["Marketed", "Overnight"],
            years: [2025],
            period: ["Monthly"],
            deal_type: ["IPO"],
          },
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: token ? `Bearer ${token}` : "",
            },
          }
        );

        const transformedData: OpportunityData[] = Object.entries(
          response.data
        ).map(([month, value]) => ({
          month,
          opportunity_value_ex: value["IPO"].opportunity_value_ex,
        }));

        setData(transformedData);
        setError(null);
      } catch (err) {
        console.error(err);
        setError("Failed to load data");
      } finally {
        setLoading(false);
      }
    };

    fetchGraphData();
  }, []);

  return (
    <Paper sx={{ p: 3, mt: 4, mb:2 }}>
      <Typography variant="h6" gutterBottom>
        Opportunity Value Trends in IPO's in 2025
      </Typography>

      {loading ? (
        <CircularProgress />
      ) : error ? (
        <Alert severity="error">{error}</Alert>
      ) : (
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis tickFormatter={formatValue} width={100} />
            <Tooltip
              formatter={(value: number) => formatValue(value)}
              labelFormatter={(label) => `Month: ${label}`}
            />
            <Bar dataKey="opportunity_value_ex" fill="#1976d2" />
          </BarChart>
        </ResponsiveContainer>
      )}
    </Paper>
  );
};

export default MddDealsOpportunityChart;
