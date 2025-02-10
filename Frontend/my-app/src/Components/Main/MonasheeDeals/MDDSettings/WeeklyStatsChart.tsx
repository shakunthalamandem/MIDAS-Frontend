import React, { useState, useEffect } from "react";
import {
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import {
  FormControlLabel,
  Box,
  Typography,
  CircularProgress,
  Card,
  CardContent,
  FormControl,
  Radio,
  RadioGroup,
  Container,
} from "@mui/material";
import axios from "axios";

interface WeeklyData {
  Count: number;
  deal_volume: number;
  cumulative_count?: number;
  cumulative_deal_volume?: number;
}

interface APIResponse {
  [year: string]: {
    [week: string]: WeeklyData;
  };
}

const formatNumber = (value: number) => {
  if (value >= 1_000_000_000) {
    return (value / 1_000_000_000).toFixed(0) + "B";
  }
  if (value >= 1_000_000) {
    return (value / 1_000_000).toFixed(0) + "M";
  }
  if (value >= 1_000) {
    return (value / 1_000).toFixed(0) + "K";
  }
  return value.toString();
};

const WeeklyStatsChart: React.FC = () => {
  const [data, setData] = useState<APIResponse | null>(null);
  const [showCount, setShowCount] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const apiUrl = process.env.REACT_APP_API_URL;
        const token = localStorage.getItem("access_token");
        if (!apiUrl) throw new Error("API URL is not defined in environment variables");

        const response = await axios.get<APIResponse>(`${apiUrl}/api/weekly_stats/`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : "",
          },
        });
        setData(response.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchData();
  }, []);

  if (!data) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <CircularProgress />
      </Box>
    );
  }

  const chartData = Object.keys(data["2022"] || {}).map((week) => {
    return {
      name: week,
      "2024": data["2024"]?.[week]?.cumulative_count,
      "2025": data["2025"]?.[week]?.cumulative_count,
      Average: data["average"]?.[week]?.cumulative_count,

      "2024 Size": data["2024"]?.[week]?.cumulative_deal_volume,
      "2025 Size": data["2025"]?.[week]?.cumulative_deal_volume,
      "Average Size": data["average"]?.[week]?.cumulative_deal_volume,
    };
  });

  return (
    <Container maxWidth="lg">
      <Card sx={{ boxShadow: 3, marginTop: 8, marginBottom: 10 }}>
        <CardContent>
          <Typography variant="h5" gutterBottom align="center" style={{ color: "#002060" }}>
            Cumulative Deals Data
          </Typography>

          <ResponsiveContainer width="100%" height={400}>
            <ComposedChart data={chartData}>
              <XAxis dataKey="name" />
              <YAxis tickFormatter={formatNumber} />
              <Tooltip formatter={(value: any) => formatNumber(Number(value))} />
              <Legend />
              <CartesianGrid stroke="#f5f5f5" />

              {showCount ? (
                <>
                  <Line type="monotone" dataKey="2024" stroke="#ff7300" name="2024" />
                  <Bar dataKey="2025" barSize={10} fill="#247B5B" name="2025" />

                  <Line type="monotone" dataKey="Average" stroke="#002060" name="Avg(2022, 2023, 2024)" strokeWidth={2} />
                  <Bar dataKey="2025" barSize={20} fill="#247B5B" name="2025" />
                </>
              ) : (
                <>
                  <Line type="monotone" dataKey="2024 Size" stroke="#8a009a" name="2024" />
                  <Bar dataKey="2025 Size" barSize={10} fill="#247B5B" name="2025" />
                  <Line type="monotone" dataKey="Average Size" stroke="#002060" name="Avg(2022, 2023, 2024)" strokeWidth={2} />
                  <Bar dataKey="2025 Size" barSize={20} fill="#247B5B" name="2025" />
                </>
              )}

              {/* Bar chart for 2025 */}
              <Bar dataKey="2025" barSize={20} fill="#247B5B" name="2025" />
            </ComposedChart>
          </ResponsiveContainer>

          <FormControl
            component="fieldset"
            style={{ display: "flex", justifyContent: "center", alignItems: "center", marginTop: 5 }}
          >
            <RadioGroup row>
              <FormControlLabel
                control={
                  <Radio
                    checked={showCount}
                    onChange={() => setShowCount(true)}
                    sx={{ color: "#490400", "&.Mui-checked": { color: "#002060" } }}
                  />
                }
                label="Deal Count"
              />
              <FormControlLabel
                control={
                  <Radio
                    checked={!showCount}
                    onChange={() => setShowCount(false)}
                    sx={{ color: "#490400", "&.Mui-checked": { color: "#002060" } }}
                  />
                }
                label="Deal Volume"
              />
            </RadioGroup>
          </FormControl>
        </CardContent>
      </Card>
    </Container>
  );
};

export default WeeklyStatsChart;
