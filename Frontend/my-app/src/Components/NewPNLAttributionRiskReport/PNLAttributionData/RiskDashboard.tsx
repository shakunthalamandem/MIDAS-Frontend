import React, { useState, useEffect, useRef } from "react";
import { Box, CircularProgress, Alert, Container, Collapse, IconButton, Tooltip } from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
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
  const [portfolios, setPortfolios] = useState<string[]>([]);
  const [selectedFunds, setSelectedFunds] = useState<string[]>([]);
  const [selectedDate, setSelectedDate] = useState("");
  const [data, setData] = useState<DashboardData | null>(null);
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [exchrateLatestPnl, setExchrateLatestPnl] = useState<number | null>(null);
  const [chartLoading, setChartLoading] = useState(false);
  const [selectedMetric, setSelectedMetric] = useState("ytd_pnl");
  const [selectedCategory, setSelectedCategory] = useState<DashboardCategory>("pnl");
  const [selectedIndexMetric, setSelectedIndexMetric] = useState<string | null>("one_month_beta_sp");
  const [indexChartData, setIndexChartData] = useState<IndexComparisonChartPoint[]>([]);
  const [topBottomTop, setTopBottomTop] = useState<TopBottomPnlTicker[]>([]);
  const [topBottomBottom, setTopBottomBottom] = useState<TopBottomPnlTicker[]>([]);
  const [metricChartData, setMetricChartData] = useState<MetricChartDataPoint[]>([]);
  const [metricChartLoading, setMetricChartLoading] = useState(false);
  const [metricTop10, setMetricTop10] = useState<TopBottomMetricTicker[]>([]);
  const [metricBottom10, setMetricBottom10] = useState<TopBottomMetricTicker[]>([]);
  const [metricTopBottomLoading, setMetricTopBottomLoading] = useState(false);
  const [metricHeadlineData, setMetricHeadlineData] = useState<HeadlineMetricValues | null>(null);
  const [metricHeadlineLoading, setMetricHeadlineLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // AbortController refs to cancel stale requests
  const abortRefs = useRef<Record<string, AbortController>>({});

  const getSignal = (key: string) => {
    if (abortRefs.current[key]) abortRefs.current[key].abort();
    const controller = new AbortController();
    abortRefs.current[key] = controller;
    return controller.signal;
  };

  // Fetch portfolio list on mount, then trigger all data fetches in one batch
  useEffect(() => {
    const fetchPortfolios = async () => {
      try {
        const res = await fetch(
          `${apiUrl}/api/distinct_portfolio_positions/`,
          { headers: getAuthHeaders() }
        );
        if (!res.ok) throw new Error("Failed to fetch portfolios");
        const result: PortfolioResponse = await res.json();
        const portfolioList = result.portfolios || [];
        const date = result.max_position_date || "";
        setPortfolios(portfolioList);
        if (date) setSelectedDate(date);
        if (portfolioList.length > 0) {
          setSelectedFunds([...portfolioList]);
        }
      } catch (err: any) {
        setError(err.message || "Failed to load portfolios");
      }
    };
    fetchPortfolios();
  }, []);

  // Map metric key to API period param
  const metricToPeriod = (metric: string) => metric.replace("_pnl", "");

  // Single effect that fetches all PNL-category data when funds/date/metric change
  useEffect(() => {
    if (selectedFunds.length === 0 || !selectedDate) return;

    const signal = getSignal("pnlData");

    const fetchAllPnlData = async () => {
      setLoading(true);
      setError("");

      try {
        const [dashboardRes, chartRes, topBottomRes, indexChartRes] = await Promise.all([
          fetch(`${apiUrl}/api/portfolio_risk_dashboard/`, {
            method: "POST",
            headers: getAuthHeaders("application/json"),
            body: JSON.stringify({ date: selectedDate, fund: selectedFunds }),
            signal,
          }),
          fetch(`${apiUrl}/api/portfolio_cumulative_pnl_chart/`, {
            method: "POST",
            headers: getAuthHeaders("application/json"),
            body: JSON.stringify({
              date: selectedDate,
              fund: selectedFunds,
              period: metricToPeriod(selectedMetric),
            }),
            signal,
          }),
          fetch(`${apiUrl}/api/top_bottom_pnl_tickers/`, {
            method: "POST",
            headers: getAuthHeaders("application/json"),
            body: JSON.stringify({ date: selectedDate, fund: selectedFunds }),
            signal,
          }),
          fetch(`${apiUrl}/api/portfolio_index_comparison_chart/`, {
            method: "POST",
            headers: getAuthHeaders("application/json"),
            body: JSON.stringify({ date: selectedDate, fund: selectedFunds }),
            signal,
          }),
        ]);

        if (signal.aborted) return;

        // Process dashboard
        if (dashboardRes.ok) {
          setData(await dashboardRes.json());
        } else {
          const errData = await dashboardRes.json().catch(() => ({}));
          setError(errData.error || "Failed to fetch dashboard data");
          setData(null);
        }

        // Process chart
        if (chartRes.ok) {
          const chartResult = await chartRes.json();
          setChartData(chartResult.chart_data || []);
          const exchrateData: { cumulative_pnl: number }[] = chartResult.exchrate_chart_data || [];
          setExchrateLatestPnl(exchrateData.length > 0 ? exchrateData[exchrateData.length - 1].cumulative_pnl : null);
        } else {
          setChartData([]);
          setExchrateLatestPnl(null);
        }

        // Process top/bottom
        if (topBottomRes.ok) {
          const tbResult = await topBottomRes.json();
          setTopBottomTop(tbResult.top_10 || []);
          setTopBottomBottom(tbResult.bottom_10 || []);
        } else {
          setTopBottomTop([]);
          setTopBottomBottom([]);
        }

        // Process index chart
        if (indexChartRes.ok) {
          const indexResult = await indexChartRes.json();
          setIndexChartData(indexResult.chart_data || []);
        } else {
          setIndexChartData([]);
        }
      } catch (err: any) {
        if (err.name === "AbortError") return;
        setError(err.message || "Failed to load dashboard data");
        setData(null);
      } finally {
        if (!signal.aborted) setLoading(false);
      }
    };

    fetchAllPnlData();

    return () => { if (abortRefs.current["pnlData"]) abortRefs.current["pnlData"].abort(); };
  }, [selectedFunds, selectedDate]);

  // Separate effect for chart data when only metric changes (not funds/date)
  useEffect(() => {
    if (selectedFunds.length === 0 || !selectedDate) return;

    const signal = getSignal("chartMetric");
    setChartLoading(true);

    const fetchChart = async () => {
      try {
        const res = await fetch(`${apiUrl}/api/portfolio_cumulative_pnl_chart/`, {
          method: "POST",
          headers: getAuthHeaders("application/json"),
          body: JSON.stringify({
            date: selectedDate,
            fund: selectedFunds,
            period: metricToPeriod(selectedMetric),
          }),
          signal,
        });
        if (signal.aborted) return;
        if (res.ok) {
          const result = await res.json();
          setChartData(result.chart_data || []);
          const exchrateData: { cumulative_pnl: number }[] = result.exchrate_chart_data || [];
          setExchrateLatestPnl(exchrateData.length > 0 ? exchrateData[exchrateData.length - 1].cumulative_pnl : null);
        } else {
          setChartData([]);
          setExchrateLatestPnl(null);
        }
      } catch (err: any) {
        if (err.name === "AbortError") return;
        setChartData([]);
      } finally {
        if (!signal.aborted) setChartLoading(false);
      }
    };

    fetchChart();

    return () => { if (abortRefs.current["chartMetric"]) abortRefs.current["chartMetric"].abort(); };
  }, [selectedMetric]);

  // Fetch metric-specific data (Gross MV, Delta Adj, Beta Adj) - only when category is not "pnl"
  useEffect(() => {
    if (selectedFunds.length === 0 || !selectedDate || selectedCategory === "pnl") {
      if (selectedCategory === "pnl") setMetricHeadlineData(null);
      return;
    }

    const signal = getSignal("metricData");
    setMetricChartLoading(true);
    setMetricTopBottomLoading(true);
    setMetricHeadlineLoading(true);

    const fetchAllMetricData = async () => {
      try {
        const [chartRes, topBottomRes, headlineRes] = await Promise.all([
          fetch(`${apiUrl}/api/portfolio_metric_chart/`, {
            method: "POST",
            headers: getAuthHeaders("application/json"),
            body: JSON.stringify({
              date: selectedDate,
              fund: selectedFunds,
              metric: selectedCategory,
              period: selectedMetric,
            }),
            signal,
          }),
          fetch(`${apiUrl}/api/portfolio_metric_top_bottom/`, {
            method: "POST",
            headers: getAuthHeaders("application/json"),
            body: JSON.stringify({
              date: selectedDate,
              fund: selectedFunds,
              metric: selectedCategory,
            }),
            signal,
          }),
          fetch(`${apiUrl}/api/portfolio_metric_headline/`, {
            method: "POST",
            headers: getAuthHeaders("application/json"),
            body: JSON.stringify({
              date: selectedDate,
              fund: selectedFunds,
              metric: selectedCategory,
            }),
            signal,
          }),
        ]);

        if (signal.aborted) return;

        if (chartRes.ok) {
          const result = await chartRes.json();
          setMetricChartData(result.chart_data || []);
        } else {
          setMetricChartData([]);
        }

        if (topBottomRes.ok) {
          const result = await topBottomRes.json();
          setMetricTop10(result.top_10 || []);
          setMetricBottom10(result.bottom_10 || []);
        } else {
          setMetricTop10([]);
          setMetricBottom10([]);
        }

        if (headlineRes.ok) {
          const result = await headlineRes.json();
          setMetricHeadlineData(result.headline_data || null);
        } else {
          setMetricHeadlineData(null);
        }
      } catch (err: any) {
        if (err.name === "AbortError") return;
        setMetricChartData([]);
        setMetricTop10([]);
        setMetricBottom10([]);
        setMetricHeadlineData(null);
      } finally {
        if (!signal.aborted) {
          setMetricChartLoading(false);
          setMetricTopBottomLoading(false);
          setMetricHeadlineLoading(false);
        }
      }
    };

    fetchAllMetricData();

    return () => { if (abortRefs.current["metricData"]) abortRefs.current["metricData"].abort(); };
  }, [selectedFunds, selectedDate, selectedCategory, selectedMetric]);

  const handleCategorySelect = (category: DashboardCategory) => {
    setSelectedCategory(category);
    // Reset selected metric to YTD equivalent when switching categories
    if (category === "pnl") {
      setSelectedMetric("ytd_pnl");
    } else {
      setSelectedMetric("ytd");
    }
  };

  const handleIndexMetricSelect = (metricKey: string) => {
    setSelectedIndexMetric((prev) => (prev === metricKey ? null : metricKey));
  };

  const allSelected = portfolios.length > 0 && selectedFunds.length === portfolios.length;
  const fundLabel = allSelected
    ? "All Funds"
    : selectedFunds.length === 1
      ? selectedFunds[0]
      : `${selectedFunds.length} Funds`;

  const [legendOpen, setLegendOpen] = useState(false);
  const [showPdfTabs, setShowPdfTabs] = useState(false);
  const attributionAllTabsRef = useRef<{ fetchAllData: () => Promise<void> } | null>(null);

  const handleBeforePdfExport = async () => {
    setShowPdfTabs(true);
    // Wait a tick for the component to mount, then trigger data fetch
    await new Promise<void>((resolve) => setTimeout(resolve, 100));
    if (attributionAllTabsRef.current) {
      await attributionAllTabsRef.current.fetchAllData();
    }
  };

  const handleAfterPdfExport = () => {
    setShowPdfTabs(false);
  };

  const allDataReady = !loading && !chartLoading && !!data;
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
                onBeforeExport={handleBeforePdfExport}
                onAfterExport={handleAfterPdfExport}
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
          {data.headline_risks && (
            <Box className="pdf-section" data-pdf-page="1">
              <HeadlineRisks
                data={data.headline_risks}
                pnlData={data.headline_pnl}
                selectedCategory={selectedCategory}
                onCategorySelect={handleCategorySelect}
              />
              {/* Category Toggles + Headline PNL in one row */}
              <Box className="category-pnl-row">
                <Box className="category-toggle-bar">
                  {([
                    { key: "pnl" as DashboardCategory, label: "P&L", icon: "💰" },
                    { key: "gross_market_value" as DashboardCategory, label: "Gross Market Value", icon: "📊" },
                    { key: "delta_adj_net_mv" as DashboardCategory, label: "Delta Adj. Net Exposure", icon: "📈" },
                    { key: "beta_adj_net_mv" as DashboardCategory, label: "Beta Adj. Net Exposure", icon: "📉" },
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
                {/* {(data.headline_pnl || selectedCategory !== "pnl") && (
                  <HeadlinePnL
                    data={data.headline_pnl}
                    selectedMetric={selectedMetric}
                    onMetricSelect={setSelectedMetric}
                    selectedCategory={selectedCategory}
                    onCategorySelect={handleCategorySelect}
                    metricHeadlineData={metricHeadlineData}
                    metricHeadlineLoading={metricHeadlineLoading}
                  />
                )} */}
              </Box>
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
              exchrateLatestPnl={exchrateLatestPnl}
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
                loading={loading}
                selectedMetric={selectedIndexMetric}
              />
            </Box>
          )}

          <Box className="pdf-section" data-pdf-page="1">
            <TopBottomPnLTable
              top10={topBottomTop}
              bottom10={topBottomBottom}
              loading={loading}
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

          {/* All 5 attribution tabs for PDF export (only mounted during export) */}
          {showPdfTabs && (
            <Box className="attribution-all-tabs-pdf">
              <AttributionAllTabs
                ref={attributionAllTabsRef}
                selectedFunds={selectedFunds}
                selectedDate={selectedDate}
              />
            </Box>
          )}
        </>
      )}

      {/* ── Legend / Reference Panel ── */}
      <Box className="legend-panel">
        <Box className="legend-panel-header" onClick={() => setLegendOpen((o) => !o)}>
          <Box className="legend-panel-header-left">
            <InfoOutlinedIcon className="legend-panel-icon" />
            <span className="legend-panel-title">Risk &amp; PNL Report — Definitions, Formulas &amp; Proxy Values</span>
          </Box>
          <Tooltip title={legendOpen ? "Collapse" : "Expand"}>
            <IconButton size="small" className="legend-panel-toggle">
              {legendOpen ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
            </IconButton>
          </Tooltip>
        </Box>

        <Collapse in={legendOpen}>
          <Box className="legend-panel-body">

            {/* ── Definitions ── */}
            <Box className="legend-section">
              <div className="legend-section-title">Definitions</div>
              <Box className="legend-definitions-grid">
                {[
                  { term: "AUM", def: "Assets Under Management — total net asset value of all positions in the portfolio." },
                  { term: "Gross Market Value (GMV)", def: "Sum of absolute market values of all long and short positions: Σ |MV|." },
                  { term: "Net Market Value (NMV)", def: "Long market value minus short market value: Σ MV (longs) − Σ MV (shorts)." },
                  { term: "Delta", def: "Rate of change of a derivative's price with respect to a $1 move in the underlying. Equities and futures have delta = 1; options carry a fractional delta (see Proxy Values table)." },
                  { term: "Beta", def: "Sensitivity of a security's returns relative to the benchmark (S&P 500). A beta of 1 moves in line with the market; <1 is less volatile; >1 is more volatile." },
                  { term: "Delta Adj. Net Exposure", def: "Net market value weighted by each position's delta , capturing the effective directional exposure of the book including derivatives." },
                  { term: "Beta Adj. Net Exposure", def: "Delta-adjusted net exposure further scaled by each position's beta , normalising the portfolio's market-equivalent exposure to the benchmark." },
                  { term: "YTD P&L", def: "Year-to-date realised and unrealised profit & loss, from 1 Jan of the current year to the selected report date." },
                  { term: "MTD P&L", def: "Month-to-date profit & loss, from the first calendar day of the current month to the selected report date." },
                  { term: "1D P&L", def: "One-day (overnight) profit & loss — the change in portfolio value between the prior trading day and the selected report date." },
                  { term: "Exchrate P&L", def: "The P&L component attributable to FX / exchange-rate movements on non-base-currency positions." },
                  { term: "Top / Bottom Contributors", def: "The 10 securities with the largest positive (Top) and largest negative (Bottom) P&L contribution over the selected period." },
                ].map(({ term, def }) => (
                  <Box key={term} className="legend-def-row">
                    <span className="legend-def-term">{term}</span>
                    <span className="legend-def-desc">{def}</span>
                  </Box>
                ))}
              </Box>
            </Box>

            {/* ── Formulas ── */}
            <Box className="legend-section">
              <div className="legend-section-title">Formulas</div>
              <Box className="legend-definitions-grid">
                {[
                  { term: "Gross MV", def: "Σ | Position MV |" },
                  { term: "Net MV", def: "Σ (Long MV) − Σ (Short MV)" },
                  { term: "Delta Adj. Net MV", def: "Σ ( Position MV × Delta  )" },
                  { term: "Beta Adj. Net MV", def: "Σ ( Position MV × Delta  × Beta  )" },
                  { term: "% of AUM", def: "Metric Value ÷ AUM × 100" },
                  { term: "Cumulative P&L", def: "Σ Daily P&L from period start date to report date" },
                ].map(({ term, def }) => (
                  <Box key={term} className="legend-def-row">
                    <span className="legend-def-term">{term}</span>
                    <code className="legend-formula">{def}</code>
                  </Box>
                ))}
              </Box>
            </Box>

            {/* ── Proxy Values Table ── */}
            <Box className="legend-section">
              <div className="legend-section-title">Proxy Values by Security Type</div>
              <p className="legend-proxy-note">
                When a position does not carry an explicit delta or beta value, the following proxy values are applied in exposure calculations.
              </p>
              <Box className="legend-proxy-table-wrap">
                <table className="legend-proxy-table">
                  <thead>
                    <tr>
                      <th>Security Type</th>
                      <th>Delta Proxy</th>
                      <th>Beta Proxy</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      ["Convertible Bond",       "0.5",   "0.4"],
                      ["Exchrate",               "1.0",   "1.0"],
                      ["Equity Call",            "0.25",  "1.0"],
                      ["Equity Put",             "−0.25", "1.0"],
                      ["Equity",                 "1.0",   "1.0"],
                      ["Equity Future",          "1.0",   "1.0"],
                      ["Equity Investment Trust","1.0",   "1.0"],
                      ["Corporate Bond",         "1.0",   "0.25"],
                      ["Equity CFD",             "1.0",   "1.0"],
                      ["Warrant",                "1.0",   "1.0"],
                      ["Index OTC Future Put",   "1.0",   "−0.5"],
                      ["Index OTC Future Call",  "1.0",   "0.5"],
                      ["Equity GDR",             "1.0",   "1.0"],
                    ].map(([sec, delta, beta]) => (
                      <tr key={sec}>
                        <td>{sec}</td>
                        <td className="legend-proxy-num">{delta}</td>
                        <td className="legend-proxy-num">{beta}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Box>
            </Box>

          </Box>
        </Collapse>
      </Box>

    </Box>
    </Container>
  );
};

export default RiskDashboard;
