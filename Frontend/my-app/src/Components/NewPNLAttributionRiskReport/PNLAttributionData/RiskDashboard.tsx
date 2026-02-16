import React, { useState, useEffect, useCallback } from "react";
import { Box, CircularProgress, Alert } from "@mui/material";
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
  const [selectedFund, setSelectedFund] = useState("");
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
        if (result.portfolios?.length > 0) setSelectedFund(result.portfolios[0]);
      } catch (err: any) {
        setError(err.message || "Failed to load portfolios");
      }
    };
    fetchPortfolios();
  }, []);

  // Fetch dashboard data
  const fetchDashboard = useCallback(async () => {
    if (!selectedFund || !selectedDate) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${apiUrl}/api/portfolio_risk_dashboard/`, {
        method: "POST",
        headers: getAuthHeaders("application/json"),
        body: JSON.stringify({ date: selectedDate, fund: selectedFund }),
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
  }, [selectedFund, selectedDate]);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  // Fetch chart data
  const fetchChartData = useCallback(async () => {
    if (!selectedFund || !selectedDate) return;
    setChartLoading(true);
    try {
      const res = await fetch(`${apiUrl}/api/portfolio_cumulative_pnl_chart/`, {
        method: "POST",
        headers: getAuthHeaders("application/json"),
        body: JSON.stringify({ date: selectedDate, fund: selectedFund }),
      });
      if (!res.ok) throw new Error("Failed to fetch chart data");
      const result = await res.json();
      setChartData(result.chart_data || []);
    } catch {
      setChartData([]);
    } finally {
      setChartLoading(false);
    }
  }, [selectedFund, selectedDate]);

  useEffect(() => {
    fetchChartData();
  }, [fetchChartData]);

  return (
    <Box className="risk-dashboard">
      <DashboardHeader
        selectedFund={selectedFund}
        portfolios={portfolios}
        onFundChange={setSelectedFund}
        aum={data?.headline_risks.aum}
        asOfDate={data?.date}
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
          <HeadlineRisks data={data.headline_risks} />

          <HeadlinePnL
            data={data.headline_pnl}
            selectedMetric={selectedMetric}
            onMetricSelect={setSelectedMetric}
          />

          <IndexesComparison data={data.indexes_comparison} />

          <CumulativePnLChart
            chartData={chartData}
            loading={chartLoading}
          />

          <Attribution
            selectedFund={selectedFund}
            selectedDate={selectedDate}
          />
        </>
      )}
    </Box>
  );
};

export default RiskDashboard;
