import React, { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Box, Grid, Typography } from "@mui/material";

const metrics = ["count", "deal_value", "opportunity_value_ex"];

const NumerSummary: React.FC = () => {
  const [data, setData] = useState<Record<string, any> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDeals = async () => {
      const apiUrl = process.env.REACT_APP_API_URL;
      const token = localStorage.getItem("access_token");

      if (!apiUrl) {
        setError("API URL is not defined in environment variables");
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`${apiUrl}/api/dealogic_summary/`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": token ? `Bearer ${token}` : "",
          }
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const json = await response.json();
        console.log(json,"data might be in json")
        if (json.deal_type) {
          setData(json.deal_type); // this sets the actual data used in charts
        } else {
          setError("Invalid response format: missing 'deal_type'");
        }
      } catch (err) {
        console.error("Failed to fetch deal data", err);
        setError("Failed to fetch data");
      } finally {
        setLoading(false);
      }
    };

    fetchDeals(); // ← actually call the function
  }, []);

  const formatNumber = (value: number, metric: string): string => {
    if (metric === "count") return value.toString();
    const abs = Math.abs(value);
    let formatted = value.toString();
    if (abs >= 1e9) formatted = `${(abs / 1e9).toFixed(1)}B`;
    else if (abs >= 1e6) formatted = `${(abs / 1e6).toFixed(1)}M`;
    else if (abs >= 1e3) formatted = `${(abs / 1e3).toFixed(1)}K`;
    return value < 0 ? `-${formatted}` : formatted;
  };

  const CustomTooltip = ({
    active,
    payload,
    label,
    metric,
  }: {
    active?: boolean;
    payload?: any[];
    label?: string;
    metric: string;
  }) => {
    if (active && payload && payload.length) {
      const total = payload.reduce((sum, item) => sum + (item.value || 0), 0);
      return (
        <div style={{ background: "#fff", border: "1px solid #ccc", padding: 10 }}>
          <p>{`Period: ${label}`}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color, margin: 0 }}>
              {`${entry.name}: ${metric === "count" ? entry.value : formatNumber(entry.value, metric)}`}
            </p>
          ))}
          <p style={{ fontWeight: "bold", color: "#002060", margin: 0 }}>
            Total: {metric === "count" ? total : formatNumber(total, metric)}
          </p>
        </div>
      );
    }
    return null;
  };

  const generateChartData = (metric: string) => {
    if (!data) return [];
    return Object.entries(data).map(([period, stats]) => ({
      year: period,
      IPO: stats["IPO"]?.[metric] || 0,
      FO: stats["FO"]?.[metric] || 0,
    }));
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div style={{ color: "red" }}>{error}</div>;
  if (!data || Object.keys(data).length === 0) return <div>No data available.</div>;

  return (
    <Grid container spacing={2}>
      {metrics.map((metric) => (
        <Grid item xs={12} md={4} key={metric}>
          <Box>
            <Typography variant="h6" align="center" gutterBottom>
              {metric.toUpperCase()}
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={generateChartData(metric)}>
                <XAxis dataKey="year" />
                <YAxis tickFormatter={(val) => formatNumber(val, metric)} />
                <Tooltip content={<CustomTooltip metric={metric} />} />
                <Legend />
                <Bar dataKey="IPO" stackId="a" fill="#8884d8" />
                <Bar dataKey="FO" stackId="a" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </Box>
        </Grid>
      ))}
    </Grid>
  );
};

export default NumerSummary;
