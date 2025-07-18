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

interface SectorData {
  sector: string;
  value: number;
}

interface TotalsData {
  exposure: number;
  dtd_pnl: number;
  mtd_pnl: number;
}

const SECTOR_ORDER = [
  "Consumer Discretionary",
  "Consumer Staples",
  "Communication Services",
  "Energy",
  "Financials",
  "Health Care",
  "Industrials",
  "Information Technology",
  "Materials",
  "Real Estate",
  "Utilities",
  "Other",
];

const COLORS_BY_SECTOR: Record<string, string> = {
  "Consumer Discretionary": "#8e24aa",
  "Consumer Staples": "#6a1b9a",
  "Communication Services": "#3949ab",
  "Energy": "#1e88e5",
  "Financials": "#039be5",
  "Health Care": "#00acc1",
  "Industrials": "#00897b",
  "Information Technology": "#43a047",
  "Materials": "#7cb342",
  "Real Estate": "#c0ca33",
  "Utilities": "#fbc02d",
  "Other": "#fb8c00",
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

const ExposureDtdMtdBySectorChart: React.FC<ChartProps> = ({ fund }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [exposureData, setExposureData] = useState<SectorData[]>([]);
  const [dtdData, setDtdData] = useState<SectorData[]>([]);
  const [mtdData, setMtdData] = useState<SectorData[]>([]);
  const [totals, setTotals] = useState<TotalsData | null>(null);

  const apiUrl = process.env.REACT_APP_API_URL;
  const token = localStorage.getItem("access_token");

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        const res = await fetch(`${apiUrl}/api/exposurepnl_bysector/`, {
          method: "POST",
          headers: {
            Authorization: token ? `Bearer ${token}` : "",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ fund }),
        });

        const result = await res.json();

        if (result?.exposure && result?.dtd_pnl && result?.mtd_pnl && result?.totals) {
          const formatData = (raw: Record<string, number>): SectorData[] => {
            return SECTOR_ORDER.map((sector) => ({
              sector,
              value: raw[sector] ?? 0,
            }));
          };

          setExposureData(formatData(result.exposure));
          setDtdData(formatData(result.dtd_pnl));
          setMtdData(formatData(result.mtd_pnl));
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

  const getSymmetricMax = (data: SectorData[]) => {
    const maxAbs = Math.max(...data.map((d) => Math.abs(d.value)), 1);
    return Math.ceil(maxAbs / 1e6) * 1e6;
  };

  const dtdMax = getSymmetricMax(dtdData);
  const mtdMax = getSymmetricMax(mtdData);

  const renderChart = (
    title: string,
    data: SectorData[],
    showYAxis: boolean,
    symmetricMax?: number,
    totalValue?: number
  ) => (
    <Box flex={1}>
      <Typography variant="subtitle2" align="center" sx={{ mb: 1, fontWeight: 600 }}>
        {title}
      </Typography>

      <ResponsiveContainer width="100%" height={600}>
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 10, right: 20, left: showYAxis ? 100 : 0, bottom: 10 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            type="number"
            domain={
              title === "Exposure" ? undefined : [-symmetricMax!, symmetricMax!]
            }
            tickFormatter={(value) =>
              title === "Exposure" ? formatNumber(value) : `${(value / 1e6).toFixed(0)}M`
            }
            tick={{ fill: "#002060", fontWeight: 400 }}
          />
          {showYAxis ? (
            <YAxis
              type="category"
              dataKey="sector"
              tick={{ fill: "#e30000", fontWeight: 400 }}
              width={160}
            />
          ) : (
            <YAxis type="category" dataKey="sector" hide />
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
                fill={COLORS_BY_SECTOR[entry.sector] || "#8884d8"}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      {totalValue !== undefined && (
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

          Total {title}: {formatTotalNumber(totalValue)}
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
              Sector-wise Exposure, DTD and MTD PnL for {fund}
            </Typography>

            <Box display="flex" gap={3}>
              {renderChart("Exposure", exposureData, true, undefined, totals?.exposure)}
              {renderChart("DTD PnL", dtdData, false, dtdMax, totals?.dtd_pnl)}
              {renderChart("MTD PnL", mtdData, false, mtdMax, totals?.mtd_pnl)}
            </Box>
          </CardContent>
        </Card>
      </motion.div>
    </Container>
  );
};

export default ExposureDtdMtdBySectorChart;
