import React, { useEffect, useMemo, useState } from "react";
import {
  Autocomplete,
  Box,
  CircularProgress,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { ExecutiveSummary } from "./ExecutiveSummary";
import { RankingTable, RankingRow } from "./RankingTable";
import { StockDetail, StockData } from "./StockDetail";

const API_URL = process.env.REACT_APP_API_URL;

interface ReportOption {
  id: number;
  date: string;
  report_name: string;
  report_type: string;
  created_at: string;
  updated_at: string;
}

interface ExecutiveSummaryData {
  main_risks: string[];
  market_view: string;
  portfolio_bias: string;
  key_opportunities: string[];
  forward_sentiment_outlook: string;
}

interface PortfolioMetadata {
  executive_summary: ExecutiveSummaryData;
  portfolio_action_summary: { buy_more: number; hold: number; reduce: number; sell_down: number };
  report_metadata: { fund_style: string; report_date: string; analysis_focus: string; investment_horizon: string };
  stocks: StockData[];
  ranking_table: RankingRow[];
}

const emptyPortfolioData: PortfolioMetadata = {
  executive_summary: {
    main_risks: [],
    market_view: "",
    portfolio_bias: "",
    key_opportunities: [],
    forward_sentiment_outlook: "",
  },
  portfolio_action_summary: { buy_more: 0, hold: 0, reduce: 0, sell_down: 0 },
  report_metadata: { fund_style: "", report_date: "", analysis_focus: "", investment_horizon: "" },
  stocks: [],
  ranking_table: [],
};

const AIRankingMain: React.FC = () => {
  const [selectedTicker, setSelectedTicker] = useState<string | null>(null);
  const [reports, setReports] = useState<ReportOption[]>([]);
  const [selectedReport, setSelectedReport] = useState<ReportOption | undefined>(undefined);
  const [portfolioData, setPortfolioData] = useState<PortfolioMetadata>(emptyPortfolioData);
  const [loadingReports, setLoadingReports] = useState(false);
  const [loadingMetadata, setLoadingMetadata] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [metadataLoaded, setMetadataLoaded] = useState(false);

  const selectedStock = useMemo(
    () =>
      selectedTicker
        ? portfolioData.stocks.find((s) => s.ticker === selectedTicker) || null
        : null,
    [selectedTicker, portfolioData]
  );

  const fetchMetadata = async (report: ReportOption) => {
    if (!report) return;
    setLoadingMetadata(true);
    setError(null);
    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch(`${API_URL}/api/ai_agents_dataset/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify({
          date: report.date,
          report_name: report.report_name,
          report_type: report.report_type,
        }),
      });
      if (!response.ok) throw new Error("Failed to load report metadata");
      const data = await response.json();
      const metadata = data.results?.[0]?.metadata as Partial<PortfolioMetadata> | undefined;
      if (metadata) {
        setPortfolioData((prev) => ({
          executive_summary: {
            ...prev.executive_summary,
            ...metadata.executive_summary,
          },
          portfolio_action_summary: {
            ...prev.portfolio_action_summary,
            ...(metadata.portfolio_action_summary ?? {}),
          },
          report_metadata: {
            ...prev.report_metadata,
            ...(metadata.report_metadata ?? {}),
          },
          stocks: (metadata.stocks as StockData[]) ?? prev.stocks,
          ranking_table: (metadata.ranking_table as RankingRow[]) ?? prev.ranking_table,
        }));
        setMetadataLoaded(true);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoadingMetadata(false);
    }
  };

  const handleReportChange = (report?: ReportOption) => {
    setSelectedReport(report);
    setMetadataLoaded(false);
    setSelectedTicker(null);
    if (report) {
      fetchMetadata(report);
    }
  };

  const fetchReports = async () => {
    setLoadingReports(true);
    setError(null);
    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch(`${API_URL}/api/ai_agents_dataset/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ report_type: "Portfolio AI Stock Ranking" }),
      });
      if (!response.ok) throw new Error("Failed to load report list");
      const data = await response.json();
      const results = data.results || [];
      setReports(results);
      setMetadataLoaded(false);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoadingReports(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const dropdownCard = (
    <Paper
      elevation={0}
      sx={{
        borderRadius: 3,
        p: 4,
        mb: 3,
        backgroundColor: "#fff",
        border: "1px solid #e2e8f0",
        boxShadow: "0 2px 12px rgba(0, 0, 0, 0.06)",
        textAlign: "center",
      }}
    >
      <Box
        sx={{
          width: 56,
          height: 56,
          borderRadius: "50%",
          background: "linear-gradient(135deg, #2563eb, #3b82f6)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          mx: "auto",
          mb: 2,
        }}
      >
        <Box
          component="span"
          sx={{
            width: 20,
            height: 20,
            background:
              "radial-gradient(circle at center, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.4) 70%)",
            borderRadius: "50%",
          }}
        />
      </Box>
      <Typography variant="h5" fontWeight={700} mb={1} color="#1e293b">
        US Portfolio Review
      </Typography>
      <Typography variant="body2" color="#64748b" mb={2}>
        Select a report to view the AI-driven portfolio risk analysis
      </Typography>
        <Autocomplete
          options={reports}
          getOptionLabel={(option) => option.report_name}
          value={selectedReport ?? undefined}
          onChange={(_event, value) => handleReportChange(value)}
          loading={loadingReports}
          disableClearable
          sx={{
            bgcolor: "#fff",
            borderRadius: 2,
          }}
          renderInput={(params) => (
            <TextField
              {...params}
              placeholder="Search Reports"
              size="small"
              InputProps={{
                ...params.InputProps,
                endAdornment: (
                  <>
                    {(loadingReports || loadingMetadata) && (
                      <CircularProgress size={20} />
                    )}
                    {params.InputProps.endAdornment}
                  </>
                ),
              }}
            />
          )}
        />
      </Paper>
  );

  return (
    <Box sx={{ width: "100%" }}>
    {dropdownCard}

    {error && (
      <Typography color="error" variant="body2" mb={2}>
        {error}
      </Typography>
    )}

    {metadataLoaded && (
      <Stack spacing={3}>
        <ExecutiveSummary
          summary={portfolioData.executive_summary}
          actionSummary={portfolioData.portfolio_action_summary}
          metadata={portfolioData.report_metadata}
        />

        <RankingTable
          rows={portfolioData.ranking_table}
          selectedTicker={selectedTicker}
          onSelectTicker={(ticker) =>
            setSelectedTicker(selectedTicker === ticker ? null : ticker)
          }
        />

        {selectedStock && (
          <StockDetail
            stock={selectedStock}
            onClose={() => setSelectedTicker(null)}
          />
        )}
      </Stack>
    )}
    </Box>
  );
};

export default AIRankingMain;
