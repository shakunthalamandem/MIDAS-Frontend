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

interface TotalsData {
  exposure: number;
  dtd_pnl: number;
  mtd_pnl: number;
  ytd_pnl: number;
}

const REGION_ORDER = ["US", "EMEA", "APAC", "Non-US America"];

const COLORS_BY_REGION: Record<string, string> = {
  "US": "#00acc1",
  "EMEA": "#fddc48ff",
  "APAC": "#43a047",
  "Non-US America": "#fb8c00",
};

const formatNumber = (value: number): string => {
  const abs = Math.abs(value);
  let result =
    abs >= 1e9
      ? `${(abs / 1e9).toFixed(1)}B`
      : abs >= 1e6
        ? `${(abs / 1e6).toFixed(1)}M`
        : abs >= 1e3
          ? `${(abs / 1e3).toFixed(1)}K`
          : abs.toFixed(1);
  return value < 0 ? `-$${result}` : `$${result}`;
};

const formatTotalNumber = (value: number): string => {
  const abs = Math.abs(value);
  let result =
    abs >= 1e9
      ? `${(abs / 1e9).toFixed(1)}B`
      : abs >= 1e6
        ? `${(abs / 1e6).toFixed(1)}M`
        : abs >= 1e3
          ? `${(abs / 1e3).toFixed(1)}K`
          : abs.toFixed(1);
  return value < 0 ? `$(${result})` : `$${result}`;
};

const formatHoverValue = (value: number): string => {
  const abs = Math.abs(value);
  if (abs >= 1e6) return `${(value / 1e6).toFixed(1)}M`;
  if (abs >= 1e3) return `${(value / 1e3).toFixed(1)}K`;
  return value.toFixed(1);
};

const ExposureDtdMtdChartMain: React.FC<ChartProps> = ({ fund }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [exposureData, setExposureData] = useState<RegionData[]>([]);
  const [dtdData, setDtdData] = useState<RegionData[]>([]);
  const [mtdData, setMtdData] = useState<RegionData[]>([]);
  const [ytdData, setYtdData] = useState<RegionData[]>([]);
  const [totals, setTotals] = useState<TotalsData | null>(null);

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

        if (result?.exposure && result?.dtd_pnl && result?.mtd_pnl && result?.totals) {
          const formatRegionData = (raw: Record<string, number>): RegionData[] =>
            REGION_ORDER.map((region) => ({
              region,
              value: raw[region] ?? 0,
            }));

          setExposureData(formatRegionData(result.exposure));
          setDtdData(formatRegionData(result.dtd_pnl));
          setMtdData(formatRegionData(result.mtd_pnl));
          setYtdData(formatRegionData(result.ytd_pnl));
          setTotals(result.totals);
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

  const getSymmetricMax = (data: RegionData[]) => {
    const maxAbs = Math.max(...data.map((d) => Math.abs(d.value)), 1);
    return Math.ceil(maxAbs / 1e6) * 1e6;
  };

  const dtdMax = getSymmetricMax(dtdData);
  const mtdMax = getSymmetricMax(mtdData);
  const ytdMax = getSymmetricMax(ytdData);

  const renderChart = (
    title: string,
    data: RegionData[],
    showYAxis: boolean,
    symmetricMax?: number,
    total?: number
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
            domain={title === "Exposure" ? undefined : [-symmetricMax!, symmetricMax!]}
            tickFormatter={(value) =>
              title === "Exposure" ? formatNumber(value) : `${(value / 1e6).toFixed(0)}M`
            }
            tick={{ fill: "#002060", fontWeight: 400 }}
          />
          {showYAxis ? (
            <YAxis
              type="category"
              dataKey="region"
              tick={{ fill: "#99000c", fontWeight: 400 }}
              width={140}
            />
          ) : (
            <YAxis type="category" dataKey="region" hide />
          )}
          <Tooltip
            formatter={(val: number) =>
              title === "Exposure" ? formatNumber(val) : formatHoverValue(val)
            }
          />
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

      {/* Show total below each chart */}
      {total !== undefined && (
        <Typography
          variant="body2"
          align="center"
          fontStyle="italic"
          fontWeight="bold"
          color="#000000"
          sx={{
            mt: 1,
            ...(title === "Exposure" && { ml: 20 }), 
          }}
        >
          Total {title}: {formatTotalNumber(total)}
        </Typography>
      )}
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
              Region-wise Exposure, DTD and MTD P&L for {fund}
            </Typography>

            <Box display="flex" gap={3}>
              {renderChart("Exposure", exposureData, true, undefined, totals?.exposure)}
              {renderChart("DTD P&L", dtdData, false, dtdMax, totals?.dtd_pnl)}
              {renderChart("MTD P&L", mtdData, false, mtdMax, totals?.mtd_pnl)}
              {renderChart("YTD P&L", ytdData, false, ytdMax, totals?.ytd_pnl)}
            </Box>
          </CardContent>
        </Card>
      </motion.div>
    </Container>
  );
};

export default ExposureDtdMtdChartMain;
