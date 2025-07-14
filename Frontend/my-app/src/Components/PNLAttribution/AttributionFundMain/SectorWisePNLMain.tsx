import React, { useEffect, useState } from 'react';
import {
  Typography,
  CircularProgress,
  Box,
  Paper,
} from '@mui/material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';

interface PnLData {
  [sector: string]: number;
}

interface ApiResponse {
  trade_date: string;
  dtd: PnLData;
  mtd: PnLData;
}

interface SectorWisePNLMainProps {
  fund: string;
}

const formatNumber = (value: number): string => {
  const absValue = Math.abs(value);
  const sign = value < 0 ? "-" : "";
  
  if (absValue >= 1_000_000_000) return `${sign}$${(absValue / 1_000_000_000).toFixed(2)}B`;
  if (absValue >= 1_000_000) return `${sign}$${(absValue / 1_000_000).toFixed(2)}M`;
  if (absValue >= 1_000) return `${sign}$${(absValue / 1_000).toFixed(2)}K`;
  return `${sign}$${absValue.toFixed(0)}`;
};

const SectorWisePNLMain: React.FC<SectorWisePNLMainProps> = ({ fund }) => {
  const [data, setData] = useState<ApiResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const apiUrl = process.env.REACT_APP_API_URL;
        const token = localStorage.getItem('access_token');
        if (!apiUrl) throw new Error('API URL is not defined');

        const response = await fetch(`${apiUrl}/api/sectorwise_pnl/`, {
          method: 'POST',
          headers: {
            Authorization: token ? `Bearer ${token}` : '',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ fund }),
        });

        if (!response.ok) throw new Error('Failed to fetch sector-wise PnL data');

        const result: ApiResponse = await response.json();
        setData(result);
      } catch (err: any) {
        setError(err.message || 'Something went wrong');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [fund]);

  if (loading)
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height={300}>
        <CircularProgress />
      </Box>
    );

  if (error)
    return (
      <Typography color="error" align="center" mt={3}>
        {error}
      </Typography>
    );

  if (!data)
    return (
      <Typography align="center" mt={3}>
        No data found.
      </Typography>
    );

  const sectors = Array.from(new Set([...Object.keys(data.dtd), ...Object.keys(data.mtd)]));

  const chartData = sectors.map((sector) => ({
    sector,
    DTD: data.dtd[sector] || 0,
    MTD: data.mtd[sector] || 0,
  }));

  return (
      <Paper
        elevation={4}
        sx={{
          borderRadius: 4,
          p: 3,
          background: "linear-gradient(to right,rgb(250, 247, 229),rgb(250, 225, 225))",
          boxShadow: "0 8px 20px rgba(0,0,0,0.08)",
        }}
      >
        <Typography
          variant="h6"
          sx={{
            color: '#002060',
            textAlign: 'center',
            fontWeight: 700,
            mb: 3,
            fontSize: '1.25rem',
          }}
        >
          Sector-wise DTD & MTD PnL ({data.trade_date}) for {fund}
        </Typography>

        <Box height={500}>
          <ResponsiveContainer>
            <BarChart
              data={chartData}
              margin={{ top: 20, right: 30, left: 20, bottom: 100 }}
              barCategoryGap="25%"
              barGap={6}
            >
              <XAxis
                dataKey="sector"
                interval={0}
                angle={-30}
                textAnchor="end"
                height={80}
                tick={{ fill: '#0f3460', fontSize: 12, fontWeight: 600 }}
                label={{
                  value: "Sectors",
                  position: "insideBottom",
                  dy: 60,
                  fill: "#002060",
                  fontWeight: 700,
                }}
              />
              <YAxis
                tick={{ fill: '#34495e', fontSize: 12 }}
                tickFormatter={formatNumber}
                label={{
                  value: "P&L",
                  angle: -90,
                  position: "insideLeft",
                  dx: -10,
                  fill: "#002060",
                  fontWeight: 700,
                }}
              />
              <Tooltip
                formatter={(value) => formatNumber(Number(value))}
                labelStyle={{ fontWeight: 600,color: "#2c3e50" }}
                contentStyle={{ backgroundColor: "#f9fbff", borderRadius: 4 }}
              />
              <Legend
                wrapperStyle={{
                  paddingTop: 12,
                  fontWeight: 600,
                  color: "#2c3e50",
                }}
              />
              <ReferenceLine y={0} stroke="#888" strokeWidth={1} />

              <Bar
                dataKey="DTD"
                fill="url(#colorDtd)"
                radius={[6, 6, 0, 0]}
              />
              <Bar
                dataKey="MTD"
                fill="url(#colorMtd)"
                radius={[6, 6, 0, 0]}
              />

              <defs>
                <linearGradient id="colorDtd" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3f51b5" stopOpacity={0.9} />
                  <stop offset="100%" stopColor="#3f51b5" stopOpacity={0.4} />
                </linearGradient>
                <linearGradient id="colorMtd" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#4caf50" stopOpacity={0.9} />
                  <stop offset="100%" stopColor="#4caf50" stopOpacity={0.4} />
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        </Box>
      </Paper>
  );
};

export default SectorWisePNLMain;
