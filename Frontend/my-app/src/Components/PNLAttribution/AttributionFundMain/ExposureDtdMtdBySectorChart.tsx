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
import InfoIcon from "@mui/icons-material/Info";

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
  ytd_pnl: number;
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
];

const COLORS_BY_SECTOR: Record<string, string> = {
  "Consumer Discretionary": "#5E35B1",
  "Consumer Staples": "#00897B",
  "Communication Services": "#3949AB",
  Energy: "#F4511E",
  Financials: "#1E88E5",
  "Health Care": "#43A047",
  Industrials: "#6D4C41",
  "Information Technology": "#3949AB",
  Materials: "#8D6E63",
  "Real Estate": "#8E24AA",
  Utilities: "#FBC02D",
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
  const [ytdData, setYtdData] = useState<SectorData[]>([]);
  const [totals, setTotals] = useState<TotalsData | null>(null);
  const [otherValues, setOtherValues] = useState<Record<string, number>>({});

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

        if (
          result?.exposure &&
          result?.dtd_pnl &&
          result?.mtd_pnl &&
          result?.totals
        ) {
          const formatData = (raw: Record<string, number>, key: string) => {
            const other = raw["Other"] ?? 0;
            setOtherValues((prev) => ({ ...prev, [key]: other }));
            return SECTOR_ORDER.map((sector) => ({
              sector,
              value: raw[sector] ?? 0,
            }));
          };

          setExposureData(formatData(result.exposure, "exposure"));
          setDtdData(formatData(result.dtd_pnl, "dtd"));
          setMtdData(formatData(result.mtd_pnl, "mtd"));
          setYtdData(formatData(result.ytd_pnl, "ytd"));
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
  const ytdMax = getSymmetricMax(ytdData);

  const renderChart = (
    title: string,
    data: SectorData[],
    showYAxis: boolean,
    symmetricMax?: number,
    totalValue?: number,
    otherKey?: string
  ) => (
    <Box flex={1}>
      <Typography
        variant="subtitle2"
        align="center"
        sx={{ mb: 1, fontWeight: 600 }}
      >
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
              title === "Exposure"
                ? formatNumber(value)
                : `${(value / 1e6).toFixed(0)}M`
            }
            tick={{ fill: "#002060", fontWeight: 400 }}
          />
          {showYAxis ? (
            <YAxis
              type="category"
              dataKey="sector"
              tick={{ fill: "#99000c", fontWeight: 400 }}
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
          Total {title} (including Hedging): {formatTotalNumber(totalValue)}
        </Typography>
      )}

      {otherKey && otherValues[otherKey] !== undefined && (
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          sx={{ mt: 0.5 }}
        >
          <InfoIcon sx={{ color: "gray", mr: 1, fontSize: "1rem" }} />
          <Typography
            variant="body2"
            sx={{ color: "gray", fontSize: "1rem" }}
          >
            Hedging: {formatNumber(otherValues[otherKey])}
          </Typography>
        </Box>
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
              Sector-wise Exposure, DTD, MTD, and YTD P&L for {fund}
            </Typography>

            <Box display="flex" gap={3}>
              {renderChart(
                "Exposure",
                exposureData,
                true,
                undefined,
                totals?.exposure,
                "exposure"
              )}
              {renderChart(
                "DTD P&L",
                dtdData,
                false,
                dtdMax,
                totals?.dtd_pnl,
                "dtd"
              )}
              {renderChart(
                "MTD P&L",
                mtdData,
                false,
                mtdMax,
                totals?.mtd_pnl,
                "mtd"
              )}
              {renderChart(
                "YTD P&L",
                ytdData,
                false,
                ytdMax,
                totals?.ytd_pnl,
                "ytd"
              )}
            </Box>

            <Box
              display="flex"
              justifyContent="center"
              alignItems="center"
              mt={2}
            >
            </Box>
          </CardContent>
        </Card>
      </motion.div>
    </Container>
  );
};

export default ExposureDtdMtdBySectorChart;
