import React, { useEffect, useMemo, useState } from "react";
import {
  Box,
  CircularProgress,
  Stack,
  Typography,
} from "@mui/material";
import { ExecutiveSummary } from "./ExecutiveSummary";
import { RankingTable, RankingRow } from "./RankingTable";
import { StockDetail, StockData } from "./StockDetail";

const API_URL = process.env.REACT_APP_API_URL;

interface RankingReportItem {
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

interface AIRankingMainProps {
  selectedReport?: RankingReportItem | null;
}

const AIRankingMain: React.FC<AIRankingMainProps> = ({ selectedReport: externalReport }) => {
  const [selectedTicker, setSelectedTicker] = useState<string | null>(null);
  const [portfolioData, setPortfolioData] = useState<PortfolioMetadata>(emptyPortfolioData);
  const [loadingMetadata, setLoadingMetadata] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedStock = useMemo(
    () =>
      selectedTicker
        ? portfolioData.stocks.find((s) => s.ticker === selectedTicker) || null
        : null,
    [selectedTicker, portfolioData]
  );

  const fetchMetadata = async (report: RankingReportItem) => {
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
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoadingMetadata(false);
    }
  };

  useEffect(() => {
    if (externalReport) {
      setSelectedTicker(null);
      fetchMetadata(externalReport);
    } else {
      setPortfolioData(emptyPortfolioData);
    }
  }, [externalReport]);

  // ---------- No report selected ----------
  if (!externalReport && !loadingMetadata) {
    return (
      <Box sx={{ width: "100%" }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "45vh",
            px: 3,
          }}
        >
          <Box sx={{ textAlign: "center" }}>
            <Box
              sx={{
                width: 64,
                height: 64,
                borderRadius: "50%",
                background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                mx: "auto",
                mb: 2.5,
                boxShadow: "0 4px 14px rgba(99, 102, 241, 0.3)",
              }}
            >
              <Box
                component="span"
                sx={{
                  width: 22,
                  height: 22,
                  background:
                    "radial-gradient(circle at center, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.3) 70%)",
                  borderRadius: "50%",
                }}
              />
            </Box>
            <Typography variant="h5" fontWeight={700} mb={0.5} color="#1e293b">
              Portfolio AI Stock Ranking
            </Typography>
            <Typography variant="body2" color="#64748b">
              Select a report from the search bar above to view AI-driven stock analysis and rankings
            </Typography>
          </Box>
        </Box>
      </Box>
    );
  }

  // ---------- Loading ----------
  if (loadingMetadata) {
    return (
      <Box sx={{ width: "100%", display: "flex", justifyContent: "center", alignItems: "center", minHeight: "40vh" }}>
        <Box sx={{ textAlign: "center" }}>
          <CircularProgress sx={{ color: "#6366f1", mb: 2 }} />
          <Typography sx={{ color: "#64748b" }}>Loading report data...</Typography>
        </Box>
      </Box>
    );
  }

  // ---------- Report loaded ----------
  return (
    <Box sx={{ width: "100%" }}>
      {error && (
        <Typography color="error" variant="body2" mb={2}>
          {error}
        </Typography>
      )}

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
    </Box>
  );
};

export default AIRankingMain;
