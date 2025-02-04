import React, { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  FormControlLabel,
  Box,
  Typography,
  CircularProgress,
  Card,
  CardContent,
  FormControl,
  FormLabel,
  Radio,
  RadioGroup,
} from "@mui/material";
import axios from "axios";

// Define the DealData interface
interface DealData {
  [week: string]: {
    count: {
      [key: string]: number;
    };
    size: {
      [key: string]: number;
    };
  };
}
const formatNumber = (value: number) => {
  if (value >= 1_000_000_000) {
    return (value / 1_000_000_000).toFixed(0) + "B"; // Billions
  }
  if (value >= 1_000_000) {
    return (value / 1_000_000).toFixed(0) + "M"; // Millions
  }
  if (value >= 1_000) {
    return (value / 1_000).toFixed(0) + "K"; // Thousands
  }
  return value.toString(); // No formatting for numbers less than 1,000
};

const CumulativeyearlyChart: React.FC = () => {
  const [data, setData] = useState<DealData | null>(null);
  const [showCount, setShowCount] = useState(true);
  const [showSize, setShowSize] = useState(false);

  // Fetch data from the API
  useEffect(() => {
    const fetchData = async () => {
      try {
        const apiUrl = process.env.REACT_APP_API_URL;
        const token = localStorage.getItem("access_token");
        if (!apiUrl)
          throw new Error("API URL is not defined in environment variables");

        const response = await axios.get<DealData>(
          `${apiUrl}/api/cummulatives_monashee/`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: token ? `Bearer ${token}` : "",
            },
          }
        );

        setData(response.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  if (!data) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <CircularProgress />
      </div>
    );
  }

  // Prepare data for the chart
  let cumulativeSize2022 = 0;
  let cumulativeSize2023 = 0;
  let cumulativeSize2024 = 0;

  let cumulativeCount2022 = 0;
  let cumulativeCount2023 = 0;
  let cumulativeCount2024 = 0;

  const chartData = Object.keys(data).map((week, index) => {
    const count2022 =
      data[week]?.count[
        `2022_w${String(index + 1).padStart(2, "0")}_deal_count`
      ] || 0;
    const count2023 =
      data[week]?.count[
        `2023_w${String(index + 1).padStart(2, "0")}_deal_count`
      ] || 0;
    const count2024 =
      data[week]?.count[
        `2024_w${String(index + 1).padStart(2, "0")}_deal_count`
      ] || 0;
    const cumulative_avg_count =
      data[week]?.count[
        `cumulativeavg_w${String(index + 1).padStart(2, "0")}_deal_count`
      ] || 0;

    const size2022 =
      data[week]?.size[
        `2022_w${String(index + 1).padStart(2, "0")}_deal_size`
      ] || 0;
    const size2023 =
      data[week]?.size[
        `2023_w${String(index + 1).padStart(2, "0")}_deal_size`
      ] || 0;
    const size2024 =
      data[week]?.size[
        `2024_w${String(index + 1).padStart(2, "0")}_deal_size`
      ] || 0;
    const cumulative_avg_size =
      data[week]?.size[
        `cumulativeavg_w${String(index + 1).padStart(2, "0")}_deal_size`
      ] || 0;

    cumulativeCount2022 += count2022;
    cumulativeCount2023 += count2023;
    cumulativeCount2024 += count2024;

    // Update cumulative deal sizes
    cumulativeSize2022 += size2022;
    cumulativeSize2023 += size2023;
    cumulativeSize2024 += size2024;

    return {
      name: week,
      "2022": cumulativeCount2022,
      "2023": cumulativeCount2023,
      "2024": cumulativeCount2024,
      CumulativeCount: cumulative_avg_count,
      cumulative_avg_2022: cumulativeSize2022,
      cumulative_avg_2023: cumulativeSize2023,
      cumulative_avg_2024: cumulativeSize2024,
      cumulativedata_avg_size: cumulative_avg_size,
    };
  });

  return (
    <Box sx={{ padding: 3 }}>
      <Card sx={{ boxShadow: 3 }}>
        <CardContent>
          <Typography
            variant="h5"
            gutterBottom
            align="center"
            style={{ color: "#002060" }}
          >
            Cumulative Deals Data
          </Typography>

          {/* Radio Buttons for toggling */}

          {/* LineChart */}
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={chartData}>
              <XAxis dataKey="name" />
              <YAxis
                tickFormatter={(tick: any) => formatNumber(Number(tick))}
              />
              <Tooltip
                formatter={(value: any) => formatNumber(Number(value))}
              />
              <Legend />

              {showCount && (
                <>
                  <Line
                    type="monotone"
                    dataKey="2022"
                    stroke="#8884d8"
                    name="2022 Deal Count"
                  />
                  <Line
                    type="monotone"
                    dataKey="2023"
                    stroke="#214100"
                    name="2023 Deal Count"
                  />
                  <Line
                    type="monotone"
                    dataKey="2024"
                    stroke="#ff7300"
                    name="2024 Deal Count"
                  />
                  <Line
                    type="monotone"
                    dataKey="CumulativeCount"
                    stroke="#002060"
                    name="Avg Deal Count"
                    strokeWidth={2} 
                  />
                </>
              )}

              {showSize && (
                <>
                  <Line
                    type="monotone"
                    dataKey="cumulative_avg_2022"
                    stroke="#ff6347"
                    name="2022  Deal Size"
                  />
                  <Line
                    type="monotone"
                    dataKey="cumulative_avg_2023"
                    stroke="#214100"
                    name="2023  Deal Size"
                  />
                  <Line
                    type="monotone"
                    dataKey="cumulative_avg_2024"
                    stroke="#cc0300"
                    name="2024  Deal Size"
                  />
                  <Line
                    type="monotone"
                    dataKey="cumulativedata_avg_size"
                    stroke="#002060"
                    name="Avg  Deal Size"
                    strokeWidth={2} 

                  />
                </>
              )}
            </LineChart>
          </ResponsiveContainer>
          <FormControl
  component="fieldset"
  style={{
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 5
  }}
>
  <RadioGroup row>
    <FormControlLabel
      control={
        <Radio
          checked={showCount}
          onChange={() => {
            setShowCount(true);
            setShowSize(false);
          }}
          sx={{
            color: "#490400", // color when unchecked
            '&.Mui-checked': {
              color: "#002060", // color when checked
            }
          }}
        />
      }
      label="Deal Count"
      style={{ color: "#490400", fontWeight: 'bold' }}
    />
    <FormControlLabel
      control={
        <Radio
          checked={showSize}
          onChange={() => {
            setShowCount(false);
            setShowSize(true);
          }}
          sx={{
            color: "#490400", // color when unchecked
            '&.Mui-checked': {
              color: "#002060", // color when checked
            }
          }}
        />
      }
      label="Deal Size"
      style={{ color: "#490400", fontWeight: 'bold' }}
    />
  </RadioGroup>
</FormControl>

        </CardContent>
      </Card>
    </Box>
  );
};

export default CumulativeyearlyChart;
