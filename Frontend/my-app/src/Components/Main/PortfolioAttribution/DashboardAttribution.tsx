import React, { useState, useEffect } from 'react';
import { Container, Grid, Paper, Typography } from '@mui/material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import axios from 'axios';

interface PnlData {
  fund: string;
  date: string;
  cumulative_pnl: number;
}

interface SummaryData {
  total_pnl: number;
  max_pnl: number;
  min_pnl: number;
}

interface ApiResponse {
  values: {
    wtd: PnlData[];
    mtd: PnlData[];
    qtd: PnlData[];
    ytd: PnlData[];
  };
  summary: {
    wtd: SummaryData;
    mtd: SummaryData;
    qtd: SummaryData;
    ytd: SummaryData;
  };
}

type Period = 'wtd' | 'mtd' | 'qtd' | 'ytd';

interface DashboardAttributionProps {
  selectedFilters: {
    funds: string[];
    broad_region: string[];
    deal_type: string[];
    as_of_date: string;
  };
}

// 🎨 Fund color mappings (11 colors)
const fundColors: { [key: string]: string } = {
  'Fund A': '#82ca9d', // Green
  'Fund B': '#8884d8', // Purple
  'Fund C': '#FFBB28', // Yellow
  'Fund D': '#0088FE', // Blue
  'Fund E': '#FF8042', // Orange
  'Fund F': '#A28FD0', // Light Purple
  'Fund G': '#00C49F', // Teal
  'Fund H': '#FF6666', // Red
  'Fund I': '#FF33CC', // Pink
  'Fund J': '#9966CC', // Lavender
  'Fund K': '#4DC0B5', // Light Teal
};

const DashboardAttribution: React.FC<DashboardAttributionProps> = ({ selectedFilters }) => {
  const [data, setData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const apiUrl = process.env.REACT_APP_API_URL;
      const token = localStorage.getItem('access_token');

      if (!apiUrl) {
        console.error('API URL is not defined.');
        setLoading(false);
        return;
      }

      try {
        const response = await axios.post<ApiResponse>(
          `${apiUrl}/api/pnl_attribution/`,
          selectedFilters,
          {
            headers: {
              'Content-Type': 'application/json',
              Authorization: token ? `Bearer ${token}` : '',
            },
          }
        );
        setData(response.data);
      } catch (error) {
        console.error('Error fetching attribution data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (selectedFilters && Object.keys(selectedFilters).length > 0) {
      fetchData();
    }
  }, [selectedFilters]);

  const formatNumber = (value: number) => {
    if (value === undefined || value === null) return "-";
    const isNegative = value < 0;
    const absValue = Math.abs(value);
    let formattedValue = absValue >= 1_000_000
      ? (absValue / 1_000_000).toFixed(2) + "M"
      : absValue >= 1_000
        ? (absValue / 1_000).toFixed(0) + "K"
        : absValue.toFixed(2);
    return isNegative ? `-$${formattedValue}` : `$${formattedValue}`;
  };

  const createChartData = (period: Period): Array<{ date: string } & { [fund: string]: number }> => {
    if (!data?.values[period]) return [];

    const chartDataMap: { [date: string]: { [fund: string]: number } } = {};

    data.values[period].forEach(({ date }) => {
      if (!chartDataMap[date]) {
        chartDataMap[date] = {};
      }
    });

    data.values[period].forEach(({ date, fund, cumulative_pnl }) => {
      chartDataMap[date][fund] = cumulative_pnl;
    });

    const sortedDates = Object.keys(chartDataMap).sort();

    return sortedDates.map((date) => {
      return {
        date,
        ...chartDataMap[date],
      } as { date: string } & { [fund: string]: number };
    });
  };

  const renderSummary = (period: Period) => {
    if (!data?.summary[period]) return null;

    const summary = data.summary[period];

    return (
      <Grid container justifyContent="space-between" sx={{ marginBottom: 2 }}>
        <Grid item>
          <Typography variant="body1">
            <strong>Total PNL: </strong>{formatNumber(summary.total_pnl)}
          </Typography>
        </Grid>
        <Grid item>
          <Typography variant="body1" sx={{ textAlign: 'right' }}>
            <strong>High: </strong>{formatNumber(summary.max_pnl)}
          </Typography>
          <Typography variant="body1" sx={{ textAlign: 'right' }}>
            <strong>Low: </strong>{formatNumber(summary.min_pnl)}
          </Typography>
        </Grid>
      </Grid>
    );
  };

  const renderTopSummary = () => {
    if (!data?.summary) return null;

    const summaryLabels: { label: string; key: Period }[] = [
      { label: 'WTD', key: 'wtd' },
      { label: 'MTD', key: 'mtd' },
      { label: 'QTD', key: 'qtd' },
      { label: 'YTD', key: 'ytd' },
    ];

    return (
      <Paper sx={{ padding: 2, marginBottom: 4 }}>
        <Typography variant="h6" sx={{ textAlign: 'center', marginBottom: 2, color: '#002060' }}>
          Portfolio Attribution Summary
        </Typography>
        <Grid container spacing={0} sx={{ border: '1px solid #ccc', borderRadius: 1, overflow: 'hidden' }}>
          {summaryLabels.map(({ label, key }, index) => (
            <Grid
              item
              xs={6}
              sm={3}
              key={key}
              sx={{
                borderRight: (index + 1) % 4 !== 0 ? '1px solid #ccc' : 'none',
                borderBottom: index < summaryLabels.length - 4 ? '1px solid #ccc' : 'none',
                padding: 2,
              }}
            >
              <Typography variant="subtitle2" sx={{ textAlign: 'center', color: 'gray' }}>
                {label}
              </Typography>
              <Typography variant="body1" sx={{ textAlign: 'center', fontWeight: 'bold' }}>
                {formatNumber(data.summary[key].total_pnl)}
              </Typography>
            </Grid>
          ))}
        </Grid>
      </Paper>
    );
  };

  if (loading) {
    return (
      <Container>
        <Typography variant="h6" color="textSecondary">
          Loading data...
        </Typography>
      </Container>
    );
  }

  if (!data) {
    return (
      <Container>
        <Typography variant="h6" color="textSecondary">
          No data available
        </Typography>
      </Container>
    );
  }

  // Fixed color assignment for each fund
  const getFundColor = (fund: string, index: number) => {
    return fundColors[fund] || fundColors[`Fund ${String.fromCharCode(65 + index)}`];
  };

  return (
    <Container>
      {renderTopSummary()}
      <Grid container spacing={2}>
        {(['wtd', 'mtd', 'qtd', 'ytd'] as Period[]).map((period) => {
          const chartData = createChartData(period);
          const fundSet = new Set(data.values[period].map(d => d.fund));
          const fundList = Array.from(fundSet);

          return (
            <Grid item xs={12} sm={6} key={period}>
              <Paper sx={{ padding: 2 }}>
                <Typography variant="h6" sx={{ textAlign: 'center', marginBottom: 2, color: '#002060' }}>
                  {period.toUpperCase()}
                </Typography>
                {renderSummary(period)}
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={chartData}>
                    <XAxis dataKey="date" />
                    <YAxis tickFormatter={(value) => formatNumber(value as number)} />
                    <Tooltip
                      formatter={(value) => formatNumber(value as number)}
                      contentStyle={{ fontSize: '12px', padding: '6px 10px' }}
                      itemStyle={{ marginBottom: 2 }}
                      labelStyle={{ fontSize: '12px', color: '#666' }}
                    />

                    <Legend />
                    {fundList.map((fund, index) => (
                      <Line
                        key={fund}
                        dataKey={fund}
                        stroke={getFundColor(fund, index)}
                        name={fund}
                        dot={false}
                      />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              </Paper>
            </Grid>
          );
        })}
      </Grid>
    </Container>
  );
};

export default DashboardAttribution;
