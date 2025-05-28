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
import { Card, CardContent, Grid, IconButton, Typography } from "@mui/material";
import SwitchAccessShortcutIcon from '@mui/icons-material/SwitchAccessShortcut';


const metricNames: Record<string, string> = {
  count: "Deal Count",
  deal_value: "Deal Volume",
  opportunity_value_ex: "Opportunity Value (T + 1M Excess)",
};

const NumerSummary: React.FC = () => {
  const [data, setData] = useState<Record<string, any> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const selectedFilters = {
    start_year: [2023],
    year_period: ["Quarterly"],
  };

const handleCardClick = () => {
  window.open("/equity/capital-markets/deal-stats", "_blank");
};

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        const apiUrl = process.env.REACT_APP_API_URL;
        const token = localStorage.getItem("access_token");

        if (!apiUrl) {
          throw new Error("API URL is not defined in environment variables");
        }

        const response = await fetch(`${apiUrl}/api/dealogic_graph/`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : "",
          },
          body: JSON.stringify(selectedFilters),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const jsonData = await response.json();
        if (jsonData.deal_type) {
          setData(jsonData.deal_type);
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

    fetchData();
  }, []);

  const formatNumber = (value: number, metric: string): string => {
    if (metric === "count") return value.toString();
    const abs = Math.abs(value);
    let formatted = value.toString();
    if (abs >= 1e9) formatted = `$${(abs / 1e9).toFixed(1)}B`;
    else if (abs >= 1e6) formatted = `$${(abs / 1e6).toFixed(1)}M`;
    else if (abs >= 1e3) formatted = `$${(abs / 1e3).toFixed(1)}K`;
    return value < 0 ? `-$${formatted}` : formatted;
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
        <div
          style={{ background: "#fff", border: "1px solid #ccc", padding: 10 }}
        >
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
  if (!data || Object.keys(data).length === 0)
    return <div>No data available.</div>;

  const metrics = Object.keys(metricNames);

  return (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <Typography
          variant="h6"
          sx={{ fontWeight: "bold", color: "#002060", textAlign: "center" }}
        >
          Deal Flow – IPO and FO (2023 to 2025) by Quarter
        </Typography>
        
      </Grid>

      {metrics.map((metric) => (
        <Grid item xs={12} md={4} key={metric}>
          <Card elevation={4}  
      sx={{ cursor: 'pointer' }}>
            <CardContent>
                  <IconButton onClick={handleCardClick} aria-label="View Details">
      <SwitchAccessShortcutIcon sx={{color:"#491daf"}} />
    </IconButton>
              <Typography
                align="center"
                gutterBottom
                sx={{ p: 2, color: "#bd3600" }}
              >
                {metricNames[metric]}
              </Typography>
           
              <ResponsiveContainer width="100%" height={300} style={{ cursor: "pointer" }}>
                <BarChart data={generateChartData(metric)} >
                  <XAxis dataKey="year" />
                  <YAxis tickFormatter={(val) => formatNumber(val, metric)} />
                  <Tooltip content={<CustomTooltip metric={metric} />} />
                  <Legend />
                  <Bar dataKey="IPO" stackId="a" fill="#8884d8" barSize={10} cursor="pointer" />
                  <Bar dataKey="FO" stackId="a" fill="#82ca9d" barSize={10} cursor="pointer" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
};

export default NumerSummary;
