import React, { useState, useEffect, useCallback } from "react";
import { Box, CircularProgress, Alert, Container, Typography } from "@mui/material";
import type { DashboardData, ChartDataPoint, PortfolioResponse } from "./types";
import DashboardHeader from "./DashboardHeader";
import HeadlineRisks from "./HeadlineRisks";
import HeadlinePnL from "./HeadlinePnL";
import IndexesComparison from "./IndexesComparison";
import CumulativePnLChart from "./CumulativePnLChart";
import Attribution from "./Attribution";
import "./RiskDashboard.css";

const apiUrl = process.env.REACT_APP_API_URL;

const getAuthHeaders = (contentType?: string) => {
  const token = localStorage.getItem("access_token");
  const headers: Record<string, string> = {
    Authorization: `Bearer ${token}`,
  };
  if (contentType) headers["Content-Type"] = contentType;
  return headers;
};

const RiskDashboard: React.FC = () => {
  const [portfolios, setPortfolios] = useState<string[]>([]);
  const [selectedFunds, setSelectedFunds] = useState<string[]>([]);
  const [selectedDate, setSelectedDate] = useState("");
  const [data, setData] = useState<DashboardData | null>(null);
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [chartLoading, setChartLoading] = useState(false);
  const [selectedMetric, setSelectedMetric] = useState("ytd_pnl");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Fetch portfolio list on mount
  useEffect(() => {
    const fetchPortfolios = async () => {
      try {
        const res = await fetch(
          `${apiUrl}/api/distinct_portfolio_positions/`,
          { headers: getAuthHeaders() }
        );
        if (!res.ok) throw new Error("Failed to fetch portfolios");
        const result: PortfolioResponse = await res.json();
        setPortfolios(result.portfolios || []);
        if (result.max_position_date) setSelectedDate(result.max_position_date);
        if (result.portfolios?.length > 0) setSelectedFunds(result.portfolios);
      } catch (err: any) {
        setError(err.message || "Failed to load portfolios");
      }
    };
    fetchPortfolios();
  }, []);

  // Fetch dashboard data
  const fetchDashboard = useCallback(async () => {
    if (selectedFunds.length === 0 || !selectedDate) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${apiUrl}/api/portfolio_risk_dashboard/`, {
        method: "POST",
        headers: getAuthHeaders("application/json"),
        body: JSON.stringify({ date: selectedDate, fund: selectedFunds }),
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || "Failed to fetch dashboard data");
      }
      setData(await res.json());
    } catch (err: any) {
      setError(err.message || "Failed to load dashboard data");
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [selectedFunds, selectedDate]);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  // Map metric key to API period param
  const metricToPeriod = (metric: string) => metric.replace("_pnl", "");

  // Fetch chart data
  const fetchChartData = useCallback(async () => {
    if (selectedFunds.length === 0 || !selectedDate) return;
    setChartLoading(true);
    try {
      const res = await fetch(`${apiUrl}/api/portfolio_cumulative_pnl_chart/`, {
        method: "POST",
        headers: getAuthHeaders("application/json"),
        body: JSON.stringify({
          date: selectedDate,
          fund: selectedFunds,
          period: metricToPeriod(selectedMetric),
        }),
      });
      if (!res.ok) throw new Error("Failed to fetch chart data");
      const result = await res.json();
      setChartData(result.chart_data || []);
    } catch {
      setChartData([]);
    } finally {
      setChartLoading(false);
    }
  }, [selectedFunds, selectedDate, selectedMetric]);

  useEffect(() => {
    fetchChartData();
  }, [fetchChartData]);

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" sx={{align:'center', color: "#002060", fontWeight: "600" }}>Risk & PNL Attribution Dashboard</Typography>
      </Box>
    <Box className="risk-dashboard">
      <DashboardHeader
        selectedFunds={selectedFunds}
        portfolios={portfolios}
        onFundsChange={setSelectedFunds}
        selectedDate={selectedDate}
        onDateChange={setSelectedDate}
        aum={data?.headline_risks?.aum}
      />

      {error && (
        <Alert severity="error" className="risk-dashboard-error" onClose={() => setError("")}>
          {error}
        </Alert>
      )}

      {loading && (
        <Box className="risk-dashboard-loading">
          <CircularProgress />
        </Box>
      )}

      {!loading && data && (
        <>
          {data.headline_risks && <HeadlineRisks data={data.headline_risks} />}

          {data.headline_pnl && (
            <HeadlinePnL
              data={data.headline_pnl}
              selectedMetric={selectedMetric}
              onMetricSelect={setSelectedMetric}
            />
          )}

          {data.indexes_comparison && <IndexesComparison data={data.indexes_comparison} />}

          <CumulativePnLChart
            chartData={chartData}
            loading={chartLoading}
            period={metricToPeriod(selectedMetric)}
          />

          <Attribution
            selectedFunds={selectedFunds}
            selectedDate={selectedDate}
          />
        </>
      )}
    </Box>
    </Container>

  );
};

export default RiskDashboard;
