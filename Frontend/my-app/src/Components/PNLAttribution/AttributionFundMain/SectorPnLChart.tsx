import React, { useEffect, useState } from 'react';
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

interface SectorPnLChartProps {
  fund: string; // fund name or similar
}

const formatNumber = (value: number): string => {
  const absValue = Math.abs(value);
  if (absValue >= 1_000_000_000) return (value / 1_000_000_000).toFixed(2) + 'B';
  if (absValue >= 1_000_000) return (value / 1_000_000).toFixed(2) + 'M';
  if (absValue >= 1_000) return (value / 1_000).toFixed(2) + 'K';
  return value.toFixed(2);
};

const SectorPnLChart: React.FC<SectorPnLChartProps> = ({ fund }) => {
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
          body: JSON.stringify({ fund: fund }),
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

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;
  if (!data) return <p>No data found.</p>;

  const sectors = Array.from(new Set([...Object.keys(data.dtd), ...Object.keys(data.mtd)]));

  const chartData = sectors.map((sector) => ({
    sector,
    DTD: data.dtd[sector] || 0,
    MTD: data.mtd[sector] || 0,
  }));

  return (
    <div style={{ width: '85%', height: 500, alignContent: 'center', margin: 'auto' }}>
      <h2 className="text-xl font-bold mb-4" style={{ textAlign: 'center' }}>
        Sector-wise DTD & MTD PnL ({data.trade_date})
      </h2>
      <ResponsiveContainer>
        <BarChart
          data={chartData}
          margin={{ top: 20, right: 30, left: 20, bottom: 50 }}
          barCategoryGap="20%"
          barGap={2}
        >
          <XAxis
            dataKey="sector"
            interval={0}
            height={80}
            tick={{ fontSize: 11, fontWeight: 500 }}
          />
          <YAxis tickFormatter={(value) => formatNumber(Number(value))} />
          <Tooltip formatter={(value) => formatNumber(Number(value))} />
          <Legend />
          <ReferenceLine y={0} stroke="#808080" strokeWidth={0.5} />
          <Bar dataKey="DTD" fill="#8884d8" barSize={20} />
          <Bar dataKey="MTD" fill="#82ca9d" barSize={20} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default SectorPnLChart;
