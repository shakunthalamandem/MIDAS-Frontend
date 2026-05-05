import React, { useEffect, useState } from "react";
import {
  Box,
  Paper,
  Typography,
  CircularProgress,
  Grid,
} from "@mui/material";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  fetchRegionSector,
  RegionPiePoint,
  RegionSectorResponse,
} from "./monthlyDecApi";

const REGION_COLORS: Record<string, string> = {
  APAC: "#1e3a8a",
  EMEA: "#10b981",
  US: "#f59e0b",
  "Non-US America": "#fbbf24",
};

const SECTOR_COLORS = [
  "#1e3a8a", "#22c55e", "#fb923c", "#06b6d4", "#ef4444",
  "#ec4899", "#84cc16", "#a855f7", "#f59e0b", "#0ea5e9",
  "#14b8a6",
];

const renderPie = (
  title: string,
  rows: RegionPiePoint[],
  colorMap: Record<string, string> | null
) => {
  if (!rows || rows.length === 0) {
    return (
      <Box>
        <Typography
          variant="subtitle2"
          align="center"
          sx={{ fontWeight: 700, color: "#1f3a8a", mb: 1 }}
        >
          {title}
        </Typography>
        <Typography align="center" color="text.secondary">
          No data
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Typography
        variant="subtitle2"
        align="center"
        sx={{ fontWeight: 700, color: "#1f3a8a", mb: 1 }}
      >
        {title}
      </Typography>
      <ResponsiveContainer width="100%" height={260}>
        <PieChart>
          <Pie
            data={rows}
            dataKey="value"
            nameKey="label"
            cx="50%"
            cy="50%"
            outerRadius={85}
            label={({ name, value }) => `${name}: ${value}`}
            labelLine={false}
          >
            {rows.map((entry, idx) => (
              <Cell
                key={entry.label}
                fill={
                  colorMap && colorMap[entry.label]
                    ? colorMap[entry.label]
                    : SECTOR_COLORS[idx % SECTOR_COLORS.length]
                }
              />
            ))}
          </Pie>
          <Tooltip />
          <Legend
            verticalAlign="bottom"
            iconSize={10}
            wrapperStyle={{ fontSize: 11 }}
          />
        </PieChart>
      </ResponsiveContainer>
    </Box>
  );
};

interface Props {
  year?: number;
  quarter?: number;
}

const RegionSectorPieCharts: React.FC<Props> = ({ year, quarter }) => {
  const [data, setData] = useState<RegionSectorResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const resp = await fetchRegionSector(year, quarter);
        if (!cancelled) setData(resp);
      } catch (e: any) {
        if (!cancelled) setError(e?.message || "Failed to load");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [year, quarter]);

  return (
    <Paper elevation={1} sx={{ p: 3, borderRadius: 2 }}>
      <Box mb={2}>
        <Typography variant="subtitle1" sx={{ fontWeight: 700, color: "#1f3a8a" }}>
          Equity Issuance Mix - Region & Sector
          {data ? ` (${data.year} Q${data.quarter})` : ""}
        </Typography>
      </Box>

      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" height={260}>
          <CircularProgress size={32} />
        </Box>
      ) : error ? (
        <Typography color="error" align="center" mt={4}>{error}</Typography>
      ) : !data ? (
        <Typography align="center" mt={4} color="text.secondary">
          No data available
        </Typography>
      ) : (
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            {renderPie("IPO Count by Region", data.ipo_by_region, REGION_COLORS)}
          </Grid>
          <Grid item xs={12} md={4}>
            {renderPie("FO Count by Region", data.fo_by_region, REGION_COLORS)}
          </Grid>
          <Grid item xs={12} md={4}>
            {renderPie("Sector-wise Segregation", data.by_sector, null)}
          </Grid>
        </Grid>
      )}
    </Paper>
  );
};

export default RegionSectorPieCharts;
