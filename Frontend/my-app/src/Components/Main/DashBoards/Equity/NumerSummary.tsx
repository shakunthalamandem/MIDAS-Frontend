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
import OpenWithIcon from '@mui/icons-material/OpenWith';

const metricNames: Record<string, string> = {
  count: "Deal Count",
  deal_value: "Deal Volume",
  opportunity_value_ex: "Opportunity Value (T + 1M Excess)",
};

const NumerSummary: React.FC = () => {
  const [dealogicData, setDealogicData] = useState<Record<string, any> | null>(null);
  const [mddData, setMddData] = useState<Record<string, any> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const selectedFilters = {
    start_year: [2023],
    year_period: ["Yearly"],
  };

  const selectedMddFilters = {
    start_year: [2023],
    year_period: ["Yearly"],
    fo_type: ["Marketed","Overnight","Block"],
    deal_type: ["IPO", "FO"],
  };

  const handleCardClick = () => {
    window.open("/equity/capital-markets/deal-stats", "_blank");
  };

  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true);
      setError(null);
      try {
        const apiUrl = process.env.REACT_APP_API_URL;
        const token = localStorage.getItem("access_token");

        if (!apiUrl) {
          throw new Error("API URL is not defined in environment variables");
        }

        const headers = {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        };

        const [dealogicRes, mddRes] = await Promise.all([
          fetch(`${apiUrl}/api/dealogic_graph/`, {
            method: "POST",
            headers,
            body: JSON.stringify(selectedFilters),
          }),
          fetch(`${apiUrl}/api/mdd_deals_graph/`, {
            method: "POST",
            headers,
            body: JSON.stringify(selectedMddFilters),
          }),
        ]);

        if (!dealogicRes.ok || !mddRes.ok) {
          throw new Error("One or both API calls failed");
        }

        const dealogicJson = await dealogicRes.json();
        const mddJson = await mddRes.json();

        setDealogicData(dealogicJson.deal_type);
        setMddData(mddJson);
      } catch (err) {
        console.error(err);
        setError("Failed to fetch data");
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, []);

  const formatNumber = (value: number, metric: string): string => {
    if (metric === "count") return value.toString();
    const abs = Math.abs(value);
    let formatted = value.toString();
    if (abs >= 1e9) formatted = `$${(abs / 1e9).toFixed(1)}B`;
    else if (abs >= 1e6) formatted = `$${(abs / 1e6).toFixed(1)}M`;
    else if (abs >= 1e3) formatted = `$${(abs / 1e3).toFixed(1)}K`;
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
      return (
        <div style={{ background: "#fff", border: "1px solid #ccc", padding: 10 }}>
          <p>{`Year: ${label}`}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color, margin: 0 }}>
              {`${entry.name}: ${formatNumber(entry.value, metric)}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const generateChartData = (metric: string) => {
    const years = ["2023", "2024", "2025"];

    return years.map((year) => {
      const mddMetricKey = metric === "deal_value" ? "deal_size" : metric;

      return {
        year,
        dealogic_IPO: dealogicData?.[year]?.IPO?.[metric] || 0,
        dealogic_FO: dealogicData?.[year]?.FO?.[metric] || 0,
        mdd_IPO: mddData?.[year]?.IPO?.[mddMetricKey] || 0,
        mdd_FO: mddData?.[year]?.FO?.[mddMetricKey] || 0,
      };
    });
  };


  if (loading) return <div>Loading...</div>;
  if (error) return <div style={{ color: "red" }}>{error}</div>;

  const metrics = Object.keys(metricNames);

  return (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <Typography
          variant="h6"
          sx={{ fontWeight: "bold", color: "#002060", textAlign: "center" }}
        >
          Deal Flow – IPO and FO (2023 to 2025) by H1(Half Yearly)
        </Typography>

      </Grid>

      {metrics.map((metric) => (
        <Grid item xs={12} md={4} key={metric}>
          <Card elevation={4}
            sx={{ cursor: "pointer" }}>
            <CardContent>
              <IconButton onClick={handleCardClick}>
                <OpenWithIcon sx={{ color: "#491daf" }} />
              </IconButton>
              <Typography
                align="center"
                onClick={handleCardClick}
                gutterBottom
                sx={{ p: 2, color: "#bd3600" }}
              >
                {metricNames[metric]}
              </Typography>

              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={generateChartData(metric)}
                >
                  <XAxis dataKey="year" />
                  <YAxis tickFormatter={(val) => formatNumber(val, metric)} />
                  <Tooltip content={<CustomTooltip metric={metric} />} />
                  <Legend />
                  <Bar dataKey="dealogic_IPO" stackId="dealogic" barSize={17} fill="#8884d8" name="Dealogic IPO" />
                  <Bar dataKey="dealogic_FO" stackId="dealogic" barSize={17} fill="#82ca9d" name="Dealogic FO" />
                  <Bar dataKey="mdd_IPO" stackId="mdd" barSize={17} fill="#f97316" name="MDD IPO" />
                  <Bar dataKey="mdd_FO" stackId="mdd" barSize={17} fill="#60a5fa" name="MDD FO" />
                </BarChart>
              </ResponsiveContainer>
              <Typography
                variant="caption"
                align="center"
                display="block"
                sx={{ mt: 2, color: "#888" }}
              >
                Note: 1) Dealogic and MDD deals do not include Strategic deals.<br />
                2) MDD FO's are Marketed, Overnight and Block deals.
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
};

export default NumerSummary;
