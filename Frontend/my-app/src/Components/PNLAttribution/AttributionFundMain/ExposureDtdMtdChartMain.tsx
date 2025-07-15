import React, { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  ReferenceLine,
  Cell,
} from "recharts";
import {
  Box,
  Typography,
  CircularProgress,
  Container,
  Card,
  CardContent,
} from "@mui/material";
import { motion } from "framer-motion";

interface ChartProps {
  fund: string;
}

interface RegionData {
  region: string;
  value: number;
}

const REGIONS_ORDER = ["us", "emea", "apac", "non-us america"];
const REGION_LABELS: Record<string, string> = {
  us: "US",
  emea: "EMEA",
  apac: "APAC",
  "non-us america": "Non-US America",
};

// Each region gets a fixed color
const COLORS_BY_REGION: Record<string, string> = {
  US: "#00acc1",
  EMEA: "#e91e63",
  APAC: "#43a047",
  "Non-US America": "#fb8c00",
};

const formatNumber = (value: number): string => {
  const abs = Math.abs(value);
  let result =
    abs >= 1e9
      ? `${(abs / 1e9).toFixed(2)}B`
      : abs >= 1e6
      ? `${(abs / 1e6).toFixed(2)}M`
      : abs >= 1e3
      ? `${(abs / 1e3).toFixed(2)}K`
      : abs.toFixed(2);
  return value < 0 ? `-$${result}` : `$${result}`;
};

const ExposureDtdMtdChartMain: React.FC<ChartProps> = ({ fund }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [exposureData, setExposureData] = useState<RegionData[]>([]);
  const [dtdData, setDtdData] = useState<RegionData[]>([]);
  const [mtdData, setMtdData] = useState<RegionData[]>([]);

  const apiUrl = process.env.REACT_APP_API_URL;
  const token = localStorage.getItem("access_token");

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        const res = await fetch(`${apiUrl}/api/exposurepnl_byregion/`, {
          method: "POST",
          headers: {
            Authorization: token ? `Bearer ${token}` : "",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ fund }),
        });

        const result = await res.json();

        if (result?.exposure && result?.dtd_pnl && result?.mtd_pnl) {
          const exposure = REGIONS_ORDER.map((key) => ({
            region: REGION_LABELS[key],
            value: result.exposure[key] ?? 0,
          }));
          const dtd = REGIONS_ORDER.map((key) => ({
            region: REGION_LABELS[key],
            value: result.dtd_pnl[key] ?? 0,
          }));
          const mtd = REGIONS_ORDER.map((key) => ({
            region: REGION_LABELS[key],
            value: result.mtd_pnl[key] ?? 0,
          }));

          setExposureData(exposure);
          setDtdData(dtd);
          setMtdData(mtd);
        } else {
          setError("Invalid response format.");
        }
      } catch (err) {
        console.error("Fetch error:", err);
        setError("Failed to fetch data.");
      } finally {
        setLoading(false);
      }
    };

    if (fund) {
      fetchData();
    }
  }, [fund, apiUrl, token]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" p={2}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={2}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  const renderChart = (
    title: string,
    data: RegionData[],
    showYAxis: boolean
  ) => (
    <Box flex={1}>
      <Typography variant="subtitle2" align="center" sx={{ mb: 1, fontWeight: 600 }}>
        {title}
      </Typography>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 10, right: 20, left: showYAxis ? 70 : 0, bottom: 10 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            type="number"
            tickFormatter={formatNumber}
            tick={{ fill: "#002060", fontWeight: 400 }}
          />
          {showYAxis && (
            <YAxis
              type="category"
              dataKey="region"
              tick={{ fill: "#e30000", fontWeight: 400 }}
              width={140}
            />
          )}
          {!showYAxis && <YAxis type="category" dataKey="region" hide />}
          <Tooltip formatter={(val: number) => formatNumber(val)} />
          <ReferenceLine x={0} stroke="#888" />
          <Bar dataKey="value" barSize={18}>
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS_BY_REGION[entry.region] || "#8884d8"}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </Box>
  );

  return (
    <Container maxWidth="xl" sx={{ mt: 2, mb: 4 }}>
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Card
          sx={{
            background: "linear-gradient(135deg, rgb(201, 214, 248), #e3f2fd)",
            boxShadow: 4,
            borderRadius: 4,
            p: 2,
          }}
        >
          <CardContent>
            <Typography
              variant="h6"
              sx={{ color: "#002060", fontWeight: 600, mb: 3 }}
              align="center"
            >
              Region-wise Exposure, DTD and MTD PnL for {fund}
            </Typography>

            <Box display="flex" gap={3}>
              {renderChart("Exposure", exposureData, true)}
              {renderChart("DTD PnL", dtdData, false)}
              {renderChart("MTD PnL", mtdData, false)}
            </Box>
          </CardContent>
        </Card>
      </motion.div>
    </Container>
  );
};

export default ExposureDtdMtdChartMain;
