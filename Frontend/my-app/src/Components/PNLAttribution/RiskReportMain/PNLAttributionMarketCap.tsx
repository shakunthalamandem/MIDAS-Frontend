import React, { useEffect, useState } from "react";
import {
  Paper,
  Typography,
  CircularProgress,
  Box,
  Grid,
  Alert,
} from "@mui/material";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from "recharts";

interface HistoricalExposureRegionData {
  date: string;
  us_data?: number;
  emea_data?: number;
  apac_data?: number;
  hedge_data?: number;
}

interface PNLAttributionMarketCapProps {
  fund: string;
}

const PNLAttributionMarketCap: React.FC<PNLAttributionMarketCapProps> = ({
  fund,
}) => {
  const [loading, setLoading] = useState(true);
  const [historicalExposureData, setHistoricalExposureData] = useState<
    HistoricalExposureRegionData[]
  >([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!fund) return;
    setLoading(true);
    setError(null);

    const fetchData = async () => {
      const apiUrl = process.env.REACT_APP_API_URL;
      const token = localStorage.getItem("access_token");

      try {
        const res = await fetch(
          `${apiUrl}/api/rr_hist_exposure_regionwise_chart/`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: token ? `Bearer ${token}` : "",
            },
            body: JSON.stringify({ fund }),
          }
        );

        const data = await res.json();

        if (res.ok && Array.isArray(data)) {
          setHistoricalExposureData(data);
        } else {
          setError(data?.error || "Unexpected response format from API.");
        }
      } catch (err) {
        setError("An error occurred while fetching data.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [fund]);

  const formatYAxis = (value: number) => {
    if (!value) return "$0";
    return `$${(value / 1_000_000).toFixed(0)}M`;
  };


const formatXAxis = (dateStr: string) => {
  const date = new Date(dateStr);
  const options: Intl.DateTimeFormatOptions = {
    month: "short",
    year: "2-digit",
  };
  return date.toLocaleDateString("en-US", options);
};


  const formatTooltip = (value: number) =>
    `$${(value / 1_000_000).toFixed(1)}M`;

  if (loading)
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight={200}
      >
        <CircularProgress />
      </Box>
    );

  if (error)
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight={200}
      >
        <Alert severity="error">{error}</Alert>
      </Box>
    );

  if (!historicalExposureData.length)
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight={200}
      >
        <Alert severity="warning">No data available for this fund.</Alert>
      </Box>
    );

  // Transform API response to Recharts-friendly format
  const historicalReturnChartData = historicalExposureData.map((item) => ({
    date: item.date,
    US: item.us_data ?? 0,
    EMEA: item.emea_data ?? 0,
    APAC: item.apac_data ?? 0,
    Hedge: item.hedge_data ?? 0,
  }));

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Paper
          elevation={3}
          sx={{ p: 2, borderRadius: 2, backgroundColor: "#f9f9f9" }}
        >
          <Typography
            variant="h6"
            gutterBottom
            color="#002060"
            align="center"
            bgcolor="#e6f0ff"
            fontWeight={600}
          >
            Historical $Exposure Breakdown (Including Hedge) by Region
          </Typography>

          <ResponsiveContainer width="100%" height={400}>
            <AreaChart
              data={historicalReturnChartData}
              margin={{ top: 20, right: 20, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorAPAC" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#e2863a" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#e2863a" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorUS" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0070C0" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#0070C0" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorEMEA" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#96a700" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#96a700" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorHedge" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#797979" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#797979" stopOpacity={0} />
                </linearGradient>
              </defs>

              <XAxis dataKey="date" tickFormatter={formatXAxis} />
              <YAxis tickFormatter={formatYAxis} />
              <Tooltip formatter={formatTooltip} />
              <Legend />
              <Area
                type="monotone"
                dataKey="APAC"
                stroke="#e2863a"
                fill="url(#colorAPAC)"
              />
              <Area
                type="monotone"
                dataKey="US"
                stroke="#0070C0"
                fill="url(#colorUS)"
              />
              <Area
                type="monotone"
                dataKey="EMEA"
                stroke="#96a700"
                fill="url(#colorEMEA)"
              />
              <Area
                type="monotone"
                dataKey="Hedge"
                stroke="#797979"
                fill="url(#colorHedge)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </Paper>
      </Grid>
    </Grid>
  );
};

export default PNLAttributionMarketCap;
