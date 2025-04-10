import React, { useState, useEffect } from 'react';
import { Container, Grid, Paper, Typography } from '@mui/material';
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
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

const colors = [
  '#82ca9d', // Green
  '#8884d8', // Blue
  '#FFBB28', // Yellow
  '#0088FE', // Dark Blue
  '#FF8042', // Orange
];

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
    let formattedValue = absValue >= 1_000 ? (absValue / 1_000).toFixed(0) + "K" : absValue.toFixed(2);
    return isNegative ? `-$${formattedValue}` : `$${formattedValue}`;
  };

  const createChartData = (period: Period): Array<{ date: string } & { [fund: string]: number }> => {
    if (!data?.values[period]) return [];

    const allDates = new Set<string>();
    const chartData: { [date: string]: { [fund: string]: number } } = {};

    // Collect all unique dates
    data.values[period].forEach((entry: PnlData) => {
      allDates.add(entry.date);
    });

    const sortedDates = Array.from(allDates).sort(); // Sort dates

    // Structure data by date
    sortedDates.forEach((date) => {
      chartData[date] = {};
    });

    // Fill in the chart data with cumulative PNL values for each fund
    data.values[period].forEach((entry: PnlData) => {
      if (!chartData[entry.date]) chartData[entry.date] = {};
      chartData[entry.date][entry.fund] = entry.cumulative_pnl;
    });

    // Convert chart data to an array with sorted dates
    return sortedDates.map((date) => {
      const funds = data.values[period].reduce((acc, entry) => {
        acc[entry.fund] = chartData[date]?.[entry.fund] || 0;
        return acc;
      }, {} as { [fund: string]: number });

      return {
        date,
        ...funds,
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

  return (
    <Container>
      <Grid container spacing={2}>
        {(['wtd', 'mtd', 'qtd', 'ytd'] as Period[]).map((period) => {
          const chartData = createChartData(period);  // Calculate the chart data once for the period
          return (
            <Grid item xs={12} sm={6} key={period}>
              <Paper sx={{ padding: 2 }}>
                <Typography variant="h6" sx={{ textAlign: 'center', marginBottom: 2  ,color: '#002060'}}>
                  {period.toUpperCase()}
                </Typography>
                {renderSummary(period)}
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={chartData}>
                    <XAxis dataKey="date" />
                    <YAxis tickFormatter={(value) => formatNumber(value as number)} />
                    <Tooltip formatter={(value) => formatNumber(value as number)} />
                    <Legend />
                    {Object.keys(data.values[period].reduce((acc, { fund }) => ({ ...acc, [fund]: true }), {})).map((fund, index) => (
                      <Line
                        key={fund}
                        dataKey={fund}
                        stroke={colors[index % colors.length]}
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