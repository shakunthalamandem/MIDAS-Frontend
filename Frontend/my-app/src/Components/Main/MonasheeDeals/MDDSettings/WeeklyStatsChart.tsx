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
  ReferenceLine,
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
import GapDealDeatilsTable from "./GapDealDeatilsTable";
import TwoWeekDealData from "./TwoweekDealData";
import { useNavigate } from "react-router-dom";

interface WeeklyData {
  Count: number;
  deal_volume: number;
  cumulative_count?: number;
  cumulative_deal_volume?: number;
  allocated_capital?: number;
  cumulative_allocated_capital?: number;
  opportunity_value_ex?: number;
  cumulative_opportunity_value_ex?: number;
  allocation_return?: number;
  cumulative_allocation_return?: number;
  monahsee_actual_total_PNL?: number;
  cumulative_monahsee_actual_total_PNL?: number;
  model_actual_total_PNL?: number;
  cumulative_model_actual_total_PNL?: number;
}

interface APIResponse {
  [year: string]: {
    [week: string]: WeeklyData;
  };
}

const formatNumber = (value: number) => {
  const isNegative = value < 0;
  const absValue = Math.abs(value); // Work with absolute value to handle negative numbers

  let formattedValue;

  if (absValue >= 1_000_000_000) {
    formattedValue = (absValue / 1_000_000_000).toFixed(1) + "B";
  } else if (absValue >= 1_000_000) {
    formattedValue = (absValue / 1_000_000).toFixed(1) + "M";
  } else if (absValue >= 1_000) {
    formattedValue = (absValue / 1_000).toFixed(0) + "K";
  } else {
    formattedValue = absValue.toString();
  }

  // Add negative sign if the original value was negative
  return isNegative ? `-${formattedValue}` : formattedValue;
};

const WeeklyStatsChart: React.FC = () => {
  const [data, setData] = useState<APIResponse | null>(null);
  const navigate = useNavigate(); 

  const [chartType, setChartType] = useState<
    | "count"
    | "volume"
    | "capital"
    | "opportunity_value_ex"
    | "allocation_return"
    | "monahsee_actual_total_PNL"
    | "model_actual_total_PNL"
  >("count"); // Track selected chart type

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
        navigate("/error");  

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

  const highestWeek2025 = Object.keys(data["2025"] || {}).reduce((highest, week) => {
    const cumulativeCount2025 = data["2025"]?.[week]?.cumulative_count || 0;
    return cumulativeCount2025 > (data["2025"]?.[highest]?.cumulative_count || 0) ? week : highest;
  }, "");

  const chartData = Object.keys(data["2022"] || {})
    .filter((week) => {
      // Only include weeks up to the highest week in 2025
      return week <= highestWeek2025;
    })
    .map((week) => {
      return {
        name: week,
        // Deal count data
        "2023": data["2023"]?.[week]?.cumulative_count,
        "2024": data["2024"]?.[week]?.cumulative_count,
        "2025": data["2025"]?.[week]?.cumulative_count,
        Average: data["average"]?.[week]?.cumulative_count,

        // Deal volume data
        "2023 Size": data["2023"]?.[week]?.cumulative_deal_volume,
        "2024 Size": data["2024"]?.[week]?.cumulative_deal_volume,
        "2025 Size": data["2025"]?.[week]?.cumulative_deal_volume,
        "Average Size": data["average"]?.[week]?.cumulative_deal_volume,

        // Allocated Capital data
        "2023 Capital": data["2023"]?.[week]?.cumulative_allocated_capital,
        "2024 Capital": data["2024"]?.[week]?.cumulative_allocated_capital,
        "2025 Capital": data["2025"]?.[week]?.cumulative_allocated_capital,
        "Average Capital": data["average"]?.[week]?.cumulative_allocated_capital,

        // Opportunity Value Ex
        "2023 Opportunity Value Ex": data["2023"]?.[week]?.cumulative_opportunity_value_ex,
        "2024 Opportunity Value Ex": data["2024"]?.[week]?.cumulative_opportunity_value_ex,
        "2025 Opportunity Value Ex": data["2025"]?.[week]?.cumulative_opportunity_value_ex,
        "Average Opportunity Value Ex": data["average"]?.[week]?.cumulative_opportunity_value_ex,

        // Allocation Return
        "2023 Allocation Return": data["2023"]?.[week]?.cumulative_allocation_return,
        "2024 Allocation Return": data["2024"]?.[week]?.cumulative_allocation_return,
        "2025 Allocation Return": data["2025"]?.[week]?.cumulative_allocation_return,
        "Average Allocation Return": data["average"]?.[week]?.cumulative_allocation_return,

        // Monahsee Actual Total PNL
        "2023 Monahsee Actual Total PNL": data["2023"]?.[week]?.cumulative_monahsee_actual_total_PNL,
        "2024 Monahsee Actual Total PNL": data["2024"]?.[week]?.cumulative_monahsee_actual_total_PNL,
        "2025 Monahsee Actual Total PNL": data["2025"]?.[week]?.cumulative_monahsee_actual_total_PNL,
        "Average Monahsee Actual Total PNL": data["average"]?.[week]?.cumulative_monahsee_actual_total_PNL,

        // Model Actual Total PNL
        "2023 Model Actual Total PNL": data["2023"]?.[week]?.cumulative_model_actual_total_PNL,
        "2024 Model Actual Total PNL": data["2024"]?.[week]?.cumulative_model_actual_total_PNL,
        "2025 Model Actual Total PNL": data["2025"]?.[week]?.cumulative_model_actual_total_PNL,
        "Average Model Actual Total PNL": data["average"]?.[week]?.cumulative_model_actual_total_PNL,
      };
    });

  return (
    <Container maxWidth="lg">
      <Card sx={{ boxShadow: 3, marginTop: 8, marginBottom: 10 }}>
        <CardContent>
          <Typography variant="h5" gutterBottom align="center" style={{ color: "#002060" }}>
            Cumulative Data
          </Typography>

          <ResponsiveContainer width="100%" height={400}>
            <ComposedChart data={chartData}>
              <XAxis dataKey="name" />
              <YAxis tickFormatter={formatNumber} />
              <Tooltip formatter={(value: any) => formatNumber(Number(value))} />
              <ReferenceLine y={0} stroke="#a4a4a4" strokeWidth={1} />

              <Legend />

              {chartType === "count" && (
                <>
                  <Line type="monotone" dataKey="2023" stroke="#ff7300" name="2023" />
                  <Line type="monotone" dataKey="2024" stroke="#770500" name="2024" />
                  <Bar dataKey="2025" barSize={10} fill="#247B5B" name="2025" />
                  <Line type="monotone" dataKey="Average" stroke="#002060" name="Avg(2022, 2023, 2024)" strokeWidth={2} />
                </>
              )}

              {chartType === "volume" && (
                <>
                  <Line type="monotone" dataKey="2023 Size" stroke="#8a009a" name="2023" />
                  <Line type="monotone" dataKey="2024 Size" stroke="#770500" name="2024" />
                  <Bar dataKey="2025 Size" barSize={10} fill="#247B5B" name="2025" />
                  <Line type="monotone" dataKey="Average Size" stroke="#002060" name="Avg(2022, 2023, 2024)" strokeWidth={2} />
                </>
              )}

              {chartType === "capital" && (
                <>
                  <Line type="monotone" dataKey="2023 Capital" stroke="#8a009a" name="2023" />
                  <Line type="monotone" dataKey="2024 Capital" stroke="#770500" name="2024" />
                  <Bar dataKey="2025 Capital" barSize={10} fill="#247B5B" name="2025" />
                  <Line type="monotone" dataKey="Average Capital" stroke="#002060" name="Avg(2022, 2023, 2024)" strokeWidth={2} />
                </>
              )}

              {chartType === "opportunity_value_ex" && (
                <>
                  <Line type="monotone" dataKey="2023 Opportunity Value Ex" stroke="#8a009a" name="2023" />
                  <Line type="monotone" dataKey="2024 Opportunity Value Ex" stroke="#770500" name="2024" />
                  <Bar dataKey="2025 Opportunity Value Ex" barSize={10} fill="#247B5B" name="2025" />
                  <Line type="monotone" dataKey="Average Opportunity Value Ex" stroke="#002060" name="Avg(2022, 2023, 2024)" strokeWidth={2} />
                </>
              )}

              {chartType === "allocation_return" && (
                <>
                  <Line type="monotone" dataKey="2023 Allocation Return" stroke="#8a009a" name="2023" />
                  <Line type="monotone" dataKey="2024 Allocation Return" stroke="#770500" name="2024" />
                  <Bar dataKey="2025 Allocation Return" barSize={10} fill="#247B5B" name="2025" />
                  <Line type="monotone" dataKey="Average Allocation Return" stroke="#002060" name="Avg(2022, 2023, 2024)" strokeWidth={2} />
                </>
              )}

              {chartType === "monahsee_actual_total_PNL" && (
                <>
                  <Line type="monotone" dataKey="2023 Monahsee Actual Total PNL" stroke="#8a009a" name="2023" />
                  <Line type="monotone" dataKey="2024 Monahsee Actual Total PNL" stroke="#770500" name="2024" />
                  <Bar dataKey="2025 Monahsee Actual Total PNL" barSize={10} fill="#247B5B" name="2025" />
                  <Line type="monotone" dataKey="Average Monahsee Actual Total PNL" stroke="#002060" name="Avg(2022, 2023, 2024)" strokeWidth={2} />
                </>
              )}

              {chartType === "model_actual_total_PNL" && (
                <>
                  <Line type="monotone" dataKey="2023 Model Actual Total PNL" stroke="#8a009a" name="2023" />
                  <Line type="monotone" dataKey="2024 Model Actual Total PNL" stroke="#770500" name="2024" />
                  <Bar dataKey="2025 Model Actual Total PNL" barSize={10} fill="#247B5B" name="2025" />
                  <Line type="monotone" dataKey="Average Model Actual Total PNL" stroke="#002060" name="Avg(2022, 2023, 2024)" strokeWidth={2} />
                </>
              )}
            </ComposedChart>
          </ResponsiveContainer>
          <Box sx={{
            paddingX: 15,

          }}>
            <FormControl
              component="fieldset"
              style={{ display: "flex", justifyContent: "center", borderRadius: '4px', alignItems: "center", marginTop: 5, paddingLeft: 10, paddingRight: 10, background: "linear-gradient(to right,rgb(194, 182, 226),rgb(216, 242, 247))", }}
            >
              <RadioGroup row>
                <FormControlLabel
                  control={
                    <Radio
                      checked={chartType === "count"}
                      onChange={() => setChartType("count")}
                      sx={{ color: "#490400", "&.Mui-checked": { color: "#002060" } }}
                    />
                  }
                  label="Deal Count"
                />
                <FormControlLabel
                  control={
                    <Radio
                      checked={chartType === "volume"}
                      onChange={() => setChartType("volume")}
                      sx={{ color: "#490400", "&.Mui-checked": { color: "#002060" } }}
                    />
                  }
                  label="Deal Volume"
                />
                <FormControlLabel
                  control={
                    <Radio
                      checked={chartType === "capital"}
                      onChange={() => setChartType("capital")}
                      sx={{ color: "#490400", "&.Mui-checked": { color: "#002060" } }}
                    />
                  }
                  label="Allocated Capital"
                />
                <FormControlLabel
                  control={
                    <Radio
                      checked={chartType === "opportunity_value_ex"}
                      onChange={() => setChartType("opportunity_value_ex")}
                      sx={{ color: "#490400", "&.Mui-checked": { color: "#002060" } }}
                    />
                  }
                  label="Opportunity Value"
                />
                <FormControlLabel
                  control={
                    <Radio
                      checked={chartType === "allocation_return"}
                      onChange={() => setChartType("allocation_return")}
                      sx={{ color: "#490400", "&.Mui-checked": { color: "#002060" } }}
                    />
                  }
                  label="Monashee Actual Allocation PNL"
                />
                <FormControlLabel
                  control={
                    <Radio
                      checked={chartType === "monahsee_actual_total_PNL"}
                      onChange={() => setChartType("monahsee_actual_total_PNL")}
                      sx={{ color: "#490400", "&.Mui-checked": { color: "#002060" } }}
                    />
                  }
                  label="Monahsee Actual Total PNL"
                />
                <FormControlLabel
                  control={
                    <Radio
                      checked={chartType === "model_actual_total_PNL"}
                      onChange={() => setChartType("model_actual_total_PNL")}
                      sx={{ color: "#490400", "&.Mui-checked": { color: "#002060" } }}
                    />
                  }
                  label="Model Actual Total PNL"
                />
              </RadioGroup>
            </FormControl>
          </Box>
        </CardContent>
      </Card>
      <TwoWeekDealData />
      <GapDealDeatilsTable />
    </Container>
  );
};

export default WeeklyStatsChart;
