import React, { useEffect, useState } from "react";
import {
  Box,
  Container,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  CircularProgress,
  Card,
  CardContent,
  Grid,
  Divider,
} from "@mui/material";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import ErrorIcon from "@mui/icons-material/Error";
import axios from "axios";

interface MarketEnvironment {
  market_temperature?: string;
  rolling_90d_avg_first_day_return?: number;
  ipo_volume_vs_3yr_median?: number;
  price_revision_above_high_pct?: number;
  market_commentary?: string;
}

interface TierClassification {
  tier?: number;
  weighted_score?: number;
  book_assignment?: string;
  reasoning?: string;
}

interface AMOpportunity {
  am_score?: number;
  current_time_window?: string;
  strategy_signal?: string;
}

interface TechnicalSignals {
  overall_technical_signal?: string;
  technical_reasoning?: string;
}

interface TickerAnalysis {
  id: number;
  ticker: string;
  issuer_name: string;
  pricing_date: string;
  days_since_ipo: number;
  sector: string;
  deal_size?: number;
  overall_signal: string;
  confidence_score: number;
  action_summary: string;
  tier_classification?: TierClassification;
  am_opportunity?: AMOpportunity;
  technical_signals?: TechnicalSignals;
}

interface PortfolioSummary {
  long_book_count?: number;
  short_book_count?: number;
  avoid_count?: number;
}

interface Report {
  id: number;
  report_date: string;
  report_title?: string;
  generated_at?: string;
  lookback_days?: number;
  total_eligible_ipos?: number;
  total_analyzed: number;
  market_environment: MarketEnvironment;
  operational_mandate?: Record<string, unknown>;
  portfolio_summary?: PortfolioSummary;
  processing_time_seconds?: number;
  created_at?: string;
}

interface APIResponse {
  report: Report;
  ticker_analyses: TickerAnalysis[];
}

const JayRitterIPOAnalysis: React.FC = () => {
  const [report, setReport] = useState<Report | null>(null);
  const [tickers, setTickers] = useState<TickerAnalysis[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReport = async () => {
      try {
        setLoading(true);
        const apiBaseUrl = process.env.REACT_APP_API_BASE_URL || "http://localhost:9000";

        // Get access token from localStorage
        const token = localStorage.getItem("access_token");

        // Fetch latest report with ticker analyses
        const res = await axios.get<APIResponse>(
          `${apiBaseUrl}/api/jay_ritter_report/`,
          {
            headers: {
              Authorization: token ? `Bearer ${token}` : "",
            },
          }
        );
        setReport(res.data.report);
        setTickers(res.data.ticker_analyses || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch report");
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, []);

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4, display: "flex", justifyContent: "center" }}>
        <CircularProgress />
      </Container>
    );
  }

  if (error || !report) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Paper sx={{ p: 3, bgcolor: "#fff3cd" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <ErrorIcon sx={{ color: "#ff9800", fontSize: 32 }} />
            <Typography variant="h6">
              {error || "No report available yet. Run the Jay Ritter agent to generate analysis."}
            </Typography>
          </Box>
        </Paper>
      </Container>
    );
  }

  const getSignalColor = (signal: string) => {
    switch (signal?.toUpperCase()) {
      case "LONG":
        return "#4caf50";
      case "SHORT":
        return "#f44336";
      case "AVOID":
        return "#ff9800";
      case "TRIM":
        return "#2196f3";
      default:
        return "#757575";
    }
  };

  const getSignalIcon = (signal: string) => {
    switch (signal?.toUpperCase()) {
      case "LONG":
        return <TrendingUpIcon sx={{ color: "#4caf50" }} />;
      case "SHORT":
        return <TrendingDownIcon sx={{ color: "#f44336" }} />;
      default:
        return null;
    }
  };

  const marketEnv = report?.market_environment || {};
  const summary = report?.portfolio_summary || {};

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
          Jay Ritter IPO Analysis
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Report Date: {report && new Date(report.report_date).toLocaleDateString("en-IN")} | IPOs Analyzed: {report?.total_analyzed}
        </Typography>
      </Box>

      {/* Market Environment Cards */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Market Temperature
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 700, textTransform: "capitalize" }}>
                {marketEnv.market_temperature || "N/A"}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                90-Day Avg First-Day Return
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 700 }}>
                {typeof marketEnv.rolling_90d_avg_first_day_return === 'number'
                  ? marketEnv.rolling_90d_avg_first_day_return.toFixed(2)
                  : "N/A"}%
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                IPO Volume Ratio
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 700 }}>
                {typeof marketEnv.ipo_volume_vs_3yr_median === 'number'
                  ? marketEnv.ipo_volume_vs_3yr_median.toFixed(2)
                  : "N/A"}x
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Price Revision Mix
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 700 }}>
                {typeof marketEnv.price_revision_above_high_pct === 'number'
                  ? marketEnv.price_revision_above_high_pct.toFixed(1)
                  : "N/A"}%
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Market Commentary */}
      {marketEnv.market_commentary && (
        <Paper sx={{ p: 3, mb: 4, bgcolor: "#f5f5f5" }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
            Market Commentary
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {marketEnv.market_commentary}
          </Typography>
        </Paper>
      )}

      {/* Portfolio Summary */}
      <Paper sx={{ p: 3, mb: 4, bgcolor: "#fafafa" }}>
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
          Portfolio Summary
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={4}>
            <Box sx={{ textAlign: "center" }}>
              <Typography variant="h4" sx={{ fontWeight: 700, color: "#4caf50" }}>
                {summary.long_book_count ?? 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Long Book
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Box sx={{ textAlign: "center" }}>
              <Typography variant="h4" sx={{ fontWeight: 700, color: "#f44336" }}>
                {summary.short_book_count ?? 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Short Book
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Box sx={{ textAlign: "center" }}>
              <Typography variant="h4" sx={{ fontWeight: 700, color: "#ff9800" }}>
                {summary.avoid_count ?? 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Avoid
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Ticker Analysis Table */}
      <Paper sx={{ mb: 4 }}>
        <TableContainer>
          <Table>
            <TableHead sx={{ bgcolor: "#f5f5f5" }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>Ticker</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Issuer</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Days Since IPO</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Sector</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Tier</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Signal</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Confidence</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {tickers.map((ticker) => (
                <TableRow key={ticker.id} hover>
                  <TableCell sx={{ fontWeight: 600 }}>{ticker.ticker}</TableCell>
                  <TableCell sx={{ fontSize: "0.875rem" }}>{ticker.issuer_name}</TableCell>
                  <TableCell>{ticker.days_since_ipo}</TableCell>
                  <TableCell sx={{ fontSize: "0.875rem" }}>{ticker.sector}</TableCell>
                  <TableCell>
                    {ticker.tier_classification?.tier && (
                      <Chip
                        label={`Tier ${ticker.tier_classification.tier}`}
                        size="small"
                        variant="outlined"
                      />
                    )}
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      {getSignalIcon(ticker.overall_signal)}
                      <Chip
                        label={ticker.overall_signal}
                        size="small"
                        sx={{
                          bgcolor: getSignalColor(ticker.overall_signal),
                          color: "#fff",
                        }}
                      />
                    </Box>
                  </TableCell>
                  <TableCell>{ticker.confidence_score}%</TableCell>
                  <TableCell sx={{ fontSize: "0.875rem", maxWidth: 250 }}>
                    {ticker.action_summary}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Detailed Analysis */}
      <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
        Detailed Analysis
      </Typography>
      <Grid container spacing={2}>
        {tickers.map((ticker) => (
          <Grid item xs={12} key={ticker.id}>
            <Paper sx={{ p: 2 }}>
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                  {ticker.ticker} - {ticker.issuer_name}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Pricing Date: {new Date(ticker.pricing_date).toLocaleDateString("en-IN")} | Days Since IPO: {ticker.days_since_ipo}
                </Typography>
              </Box>
              <Divider sx={{ mb: 2 }} />
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                    Tier Classification
                  </Typography>
                  {ticker.tier_classification && (
                    <>
                      <Typography variant="caption">
                        Tier: <strong>{ticker.tier_classification.tier}</strong> (Score: {ticker.tier_classification.weighted_score}/100)
                      </Typography>
                      <Typography variant="caption" display="block" sx={{ mt: 0.5 }}>
                        Book: <strong>{ticker.tier_classification.book_assignment}</strong>
                      </Typography>
                    </>
                  )}
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                    AM Opportunity
                  </Typography>
                  {ticker.am_opportunity && (
                    <>
                      <Typography variant="caption">
                        Score: <strong>{ticker.am_opportunity.am_score}/5</strong>
                      </Typography>
                      <Typography variant="caption" display="block" sx={{ mt: 0.5 }}>
                        Window: <strong>{ticker.am_opportunity.current_time_window}</strong>
                      </Typography>
                    </>
                  )}
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                    Technical Signal
                  </Typography>
                  {ticker.technical_signals && (
                    <Typography variant="caption">
                      {ticker.technical_signals.overall_technical_signal}
                    </Typography>
                  )}
                </Grid>
              </Grid>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default JayRitterIPOAnalysis;
