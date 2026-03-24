import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Box, CircularProgress, Alert, Container, Typography, Button } from "@mui/material";
import type { DashboardData, ChartDataPoint, IndexComparisonChartPoint, PortfolioResponse, TopBottomPnlTicker, DashboardCategory, MetricChartDataPoint, TopBottomMetricTicker, HeadlineMetricValues } from "./types";
import DashboardHeader from "./DashboardHeader";
import HeadlineRisks from "./HeadlineRisks";
import HeadlinePnL from "./HeadlinePnL";
import IndexesComparison from "./IndexesComparison";
import CumulativePnLChart from "./CumulativePnLChart";
import TopBottomPnLTable from "./TopBottomPnLTable";
import IndexComparisonChart from "./IndexComparisonChart";
import Attribution from "./Attribution";
import AttributionAllTabs from "./AttributionAllTabs";
import RiskDashboardPDFExporter from "./RiskDashboardPDFExporter";
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
  const navigate = useNavigate();
  const [portfolios, setPortfolios] = useState<string[]>([]);
  const [selectedFunds, setSelectedFunds] = useState<string[]>([]);
  const [selectedDate, setSelectedDate] = useState("");
  const [data, setData] = useState<DashboardData | null>(null);
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [chartLoading, setChartLoading] = useState(false);
  const [selectedMetric, setSelectedMetric] = useState("ytd_pnl");
  const [selectedCategory, setSelectedCategory] = useState<DashboardCategory>("pnl");
  const [selectedIndexMetric, setSelectedIndexMetric] = useState<string | null>("one_month_beta_sp");
  const [indexChartData, setIndexChartData] = useState<IndexComparisonChartPoint[]>([]);
  const [indexChartLoading, setIndexChartLoading] = useState(false);
  const [topBottomTop, setTopBottomTop] = useState<TopBottomPnlTicker[]>([]);
  const [topBottomBottom, setTopBottomBottom] = useState<TopBottomPnlTicker[]>([]);
  const [topBottomLoading, setTopBottomLoading] = useState(false);
  const [metricChartData, setMetricChartData] = useState<MetricChartDataPoint[]>([]);
  const [metricChartLoading, setMetricChartLoading] = useState(false);
  const [metricTop10, setMetricTop10] = useState<TopBottomMetricTicker[]>([]);
  const [metricBottom10, setMetricBottom10] = useState<TopBottomMetricTicker[]>([]);
  const [metricTopBottomLoading, setMetricTopBottomLoading] = useState(false);
  const [metricHeadlineData, setMetricHeadlineData] = useState<HeadlineMetricValues | null>(null);
  const [metricHeadlineLoading, setMetricHeadlineLoading] = useState(false);
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

  // Fetch top/bottom PNL tickers
  const fetchTopBottomPnl = useCallback(async () => {
    if (selectedFunds.length === 0 || !selectedDate) return;
    setTopBottomLoading(true);
    try {
      const res = await fetch(`${apiUrl}/api/top_bottom_pnl_tickers/`, {
        method: "POST",
        headers: getAuthHeaders("application/json"),
        body: JSON.stringify({ date: selectedDate, fund: selectedFunds }),
      });
      if (!res.ok) throw new Error("Failed to fetch top/bottom PNL");
      const result = await res.json();
      setTopBottomTop(result.top_10 || []);
      setTopBottomBottom(result.bottom_10 || []);
    } catch {
      setTopBottomTop([]);
      setTopBottomBottom([]);
    } finally {
      setTopBottomLoading(false);
    }
  }, [selectedFunds, selectedDate]);

  useEffect(() => {
    fetchTopBottomPnl();
  }, [fetchTopBottomPnl]);

  // Fetch metric chart data (for Gross MV, Delta Adj, Beta Adj)
  const fetchMetricChartData = useCallback(async () => {
    if (selectedFunds.length === 0 || !selectedDate || selectedCategory === "pnl") return;
    setMetricChartLoading(true);
    try {
      const res = await fetch(`${apiUrl}/api/portfolio_metric_chart/`, {
        method: "POST",
        headers: getAuthHeaders("application/json"),
        body: JSON.stringify({
          date: selectedDate,
          fund: selectedFunds,
          metric: selectedCategory,
          period: selectedMetric, // dtd, wtd, mtd, ytd
        }),
      });
      if (!res.ok) throw new Error("Failed to fetch metric chart data");
      const result = await res.json();
      setMetricChartData(result.chart_data || []);
    } catch {
      setMetricChartData([]);
    } finally {
      setMetricChartLoading(false);
    }
  }, [selectedFunds, selectedDate, selectedCategory, selectedMetric]);

  useEffect(() => {
    if (selectedCategory !== "pnl") fetchMetricChartData();
  }, [fetchMetricChartData, selectedCategory]);

  // Fetch top/bottom tickers for selected metric (Gross MV, Delta Adj, Beta Adj)
  const fetchMetricTopBottom = useCallback(async () => {
    if (selectedFunds.length === 0 || !selectedDate || selectedCategory === "pnl") return;
    setMetricTopBottomLoading(true);
    try {
      const res = await fetch(`${apiUrl}/api/portfolio_metric_top_bottom/`, {
        method: "POST",
        headers: getAuthHeaders("application/json"),
        body: JSON.stringify({
          date: selectedDate,
          fund: selectedFunds,
          metric: selectedCategory,
        }),
      });
      if (!res.ok) throw new Error("Failed to fetch metric top/bottom");
      const result = await res.json();
      setMetricTop10(result.top_10 || []);
      setMetricBottom10(result.bottom_10 || []);
    } catch {
      setMetricTop10([]);
      setMetricBottom10([]);
    } finally {
      setMetricTopBottomLoading(false);
    }
  }, [selectedFunds, selectedDate, selectedCategory]);

  useEffect(() => {
    if (selectedCategory !== "pnl") fetchMetricTopBottom();
  }, [fetchMetricTopBottom, selectedCategory]);

  // Fetch metric headline values (DTD/WTD/MTD/YTD for Gross MV, Delta Adj, Beta Adj)
  const fetchMetricHeadline = useCallback(async () => {
    if (selectedFunds.length === 0 || !selectedDate || selectedCategory === "pnl") return;
    setMetricHeadlineLoading(true);
    try {
      const res = await fetch(`${apiUrl}/api/portfolio_metric_headline/`, {
        method: "POST",
        headers: getAuthHeaders("application/json"),
        body: JSON.stringify({
          date: selectedDate,
          fund: selectedFunds,
          metric: selectedCategory,
        }),
      });
      if (!res.ok) throw new Error("Failed to fetch metric headline");
      const result = await res.json();
      setMetricHeadlineData(result.headline_data || null);
    } catch {
      setMetricHeadlineData(null);
    } finally {
      setMetricHeadlineLoading(false);
    }
  }, [selectedFunds, selectedDate, selectedCategory]);

  useEffect(() => {
    if (selectedCategory !== "pnl") {
      fetchMetricHeadline();
    } else {
      setMetricHeadlineData(null);
    }
  }, [fetchMetricHeadline, selectedCategory]);

  const handleCategorySelect = (category: DashboardCategory) => {
    setSelectedCategory(category);
    // Reset selected metric to YTD equivalent when switching categories
    if (category === "pnl") {
      setSelectedMetric("ytd_pnl");
    } else {
      setSelectedMetric("ytd");
    }
  };

  // Fetch index comparison chart data
  const fetchIndexChartData = useCallback(async () => {
    if (selectedFunds.length === 0 || !selectedDate || !selectedIndexMetric) return;
    setIndexChartLoading(true);
    try {
      const res = await fetch(`${apiUrl}/api/portfolio_index_comparison_chart/`, {
        method: "POST",
        headers: getAuthHeaders("application/json"),
        body: JSON.stringify({
          date: selectedDate,
          fund: selectedFunds,
        }),
      });
      if (!res.ok) throw new Error("Failed to fetch index chart data");
      const result = await res.json();
      setIndexChartData(result.chart_data || []);
    } catch {
      setIndexChartData([]);
    } finally {
      setIndexChartLoading(false);
    }
  }, [selectedFunds, selectedDate, selectedIndexMetric]);

  useEffect(() => {
    if (selectedIndexMetric) fetchIndexChartData();
  }, [fetchIndexChartData, selectedIndexMetric]);

  const handleIndexMetricSelect = (metricKey: string) => {
    setSelectedIndexMetric((prev) => (prev === metricKey ? null : metricKey));
  };

  const allSelected = portfolios.length > 0 && selectedFunds.length === portfolios.length;
  const fundLabel = allSelected
    ? "All Funds"
    : selectedFunds.length === 1
      ? selectedFunds[0]
      : `${selectedFunds.length} Funds`;

  const allDataReady = !loading && !chartLoading && !indexChartLoading && !topBottomLoading && !!data;
  const isDataAvailable = data?.data_available !== false;

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
    <Box id="risk-dashboard-pdf-root" className="risk-dashboard">
      <Box className="pdf-section" data-pdf-page="1">
        <DashboardHeader
          selectedFunds={selectedFunds}
          portfolios={portfolios}
          onFundsChange={setSelectedFunds}
          selectedDate={selectedDate}
          onDateChange={setSelectedDate}
          aum={data?.headline_risks?.aum}
          // triggersButton={
          //   <Button
          //     variant="contained"
          //     size="small"
          //     onClick={() => {
          //       const fund = selectedFunds.length === 1 ? selectedFunds[0] : selectedFunds[0] || "";
          //       navigate(`/risk_triggers?fund=${encodeURIComponent(fund)}&date=${encodeURIComponent(selectedDate)}`);
          //     }}
          //     sx={{
          //       borderRadius: "20px",
          //       background: "linear-gradient(135deg, #e74c3c 0%, #c0392b 100%)",
          //       color: "#fff",
          //       fontWeight: 700,
          //       fontSize: "12px",
          //       textTransform: "none",
          //       px: 2.5,
          //       py: 0.8,
          //       "&:hover": {
          //         background: "linear-gradient(135deg, #c0392b 0%, #96281b 100%)",
          //       },
          //     }}
          //   >
          //     Triggers
          //   </Button>
          // }
          exportButton={
            allDataReady ? (
              <RiskDashboardPDFExporter
                exportContainerId="risk-dashboard-pdf-root"
                fileName={`Risk_PNL_Report_${fundLabel.replace(/\s+/g, "_")}_${selectedDate}.pdf`}
                headerTitle="Risk & PNL Attribution Dashboard"
                fundName={fundLabel}
                reportDate={selectedDate}
              />
            ) : undefined
          }
        />
      </Box>

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

      {!loading && data && !isDataAvailable && (
        <Alert severity="info" className="risk-dashboard-error">
          {data.message || "Data is not available for selected date."}
        </Alert>
      )}

      {!loading && data && isDataAvailable && (
        <>
          {/* Category Toggle Buttons */}
          <Box className="category-toggle-bar">
            {([
              { key: "pnl" as DashboardCategory, label: "P&L", icon: "💰" },
              { key: "gross_market_value" as DashboardCategory, label: "Gross Market Value", icon: "📊" },
              { key: "delta_adj_net_mv" as DashboardCategory, label: "Delta Adj. Net MV", icon: "📈" },
              { key: "beta_adj_net_mv" as DashboardCategory, label: "Beta Adj. Net MV", icon: "📉" },
            ]).map((btn) => (
              <Box
                key={btn.key}
                className={`category-toggle-btn${selectedCategory === btn.key ? " category-toggle-btn--active" : ""}`}
                onClick={() => handleCategorySelect(btn.key)}
              >
                <span className="category-toggle-icon">{btn.icon}</span>
                <span className="category-toggle-label">{btn.label}</span>
              </Box>
            ))}
          </Box>

          {data.headline_risks && (
            <Box className="pdf-section" data-pdf-page="1">
              <HeadlineRisks
                data={data.headline_risks}
                selectedCategory={selectedCategory}
                onCategorySelect={handleCategorySelect}
              />
            </Box>
          )}

          {(data.headline_pnl || selectedCategory !== "pnl") && (
            <Box className="pdf-section" data-pdf-page="1">
              <HeadlinePnL
                data={data.headline_pnl}
                selectedMetric={selectedMetric}
                onMetricSelect={setSelectedMetric}
                selectedCategory={selectedCategory}
                onCategorySelect={handleCategorySelect}
                metricHeadlineData={metricHeadlineData}
                metricHeadlineLoading={metricHeadlineLoading}
              />
            </Box>
          )}

          <Box className="pdf-section" data-pdf-page="1">
            <CumulativePnLChart
              chartData={chartData}
              loading={chartLoading}
              period={metricToPeriod(selectedMetric)}
              category={selectedCategory}
              metricChartData={metricChartData}
              metricChartLoading={metricChartLoading}
            />
          </Box>

          {data.indexes_comparison && (
            <Box className="pdf-section" data-pdf-page="1">
              <IndexesComparison
                data={data.indexes_comparison}
                selectedMetric={selectedIndexMetric ?? undefined}
                onMetricSelect={handleIndexMetricSelect}
              />
            </Box>
          )}

          {selectedIndexMetric && (
            <Box className="pdf-section" data-pdf-page="1">
              <IndexComparisonChart
                chartData={indexChartData}
                loading={indexChartLoading}
                selectedMetric={selectedIndexMetric}
              />
            </Box>
          )}

          <Box className="pdf-section" data-pdf-page="1">
            <TopBottomPnLTable
              top10={topBottomTop}
              bottom10={topBottomBottom}
              loading={topBottomLoading}
              category={selectedCategory}
              metricTop10={metricTop10}
              metricBottom10={metricBottom10}
              metricLoading={metricTopBottomLoading}
            />
          </Box>

          <Box className="pdf-section attribution-interactive">
            <Attribution
              selectedFunds={selectedFunds}
              selectedDate={selectedDate}
            />
          </Box>

          {/* All 5 attribution tabs for PDF export (hidden on screen) */}
          <Box className="attribution-all-tabs-pdf">
            <AttributionAllTabs
              selectedFunds={selectedFunds}
              selectedDate={selectedDate}
            />
          </Box>
        </>
      )}
    </Box>
    </Container>
  );
};

export default RiskDashboard;
