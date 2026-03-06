import React, { useState, useEffect } from "react";
import {
  Autocomplete,
  Box,
  CircularProgress,
  Container,
  TextField,
  Typography,
} from "@mui/material";
import PortfolioReportDocumentMain from "./PortfolioReportDocumentMain";
import AIRankingMain from "./AIRanking/AIRankingMain";

const apiUrl = process.env.REACT_APP_API_URL;

interface CIOReportItem {
  id: number;
  date: string;
  report_title: string;
}

interface RankingReportItem {
  id: number;
  date: string;
  report_name: string;
  report_type: string;
  created_at: string;
  updated_at: string;
}

interface AIPortfolioReviewProps {
  mode: "portfolioReview" | "stockRanking";
}

const AIPortfolioReview: React.FC<AIPortfolioReviewProps> = ({ mode }) => {
  // Tab 1 (CIO Review) search state
  const [cioReports, setCioReports] = useState<CIOReportItem[]>([]);
  const [selectedCioReport, setSelectedCioReport] = useState<CIOReportItem | null>(null);
  const [cioListLoading, setCioListLoading] = useState(false);

  // Tab 2 (AI Ranking) search state
  const [rankingReports, setRankingReports] = useState<RankingReportItem[]>([]);
  const [selectedRankingReport, setSelectedRankingReport] = useState<RankingReportItem | null>(null);
  const [rankingListLoading, setRankingListLoading] = useState(false);

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr + "T00:00:00");
      return d.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
    } catch {
      return dateStr;
    }
  };

  // Fetch CIO report list
  useEffect(() => {
    if (mode !== "portfolioReview") return;
    const fetchCioReports = async () => {
      setCioListLoading(true);
      try {
        const token = localStorage.getItem("access_token");
        const res = await fetch(`${apiUrl}/api/cio_report_list/`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data: CIOReportItem[] = await res.json();
          const sorted = [...data].sort((a, b) => b.date.localeCompare(a.date));
          setCioReports(sorted);
          if (sorted.length > 0) {
            setSelectedCioReport(sorted[0]);
          }
        }
      } catch {
        // silent
      } finally {
        setCioListLoading(false);
      }
    };
    fetchCioReports();
  }, [mode]);

  // Fetch Ranking report list
  useEffect(() => {
    if (mode !== "stockRanking") return;
    const fetchRankingReports = async () => {
      setRankingListLoading(true);
      try {
        const token = localStorage.getItem("access_token");
        const res = await fetch(`${apiUrl}/api/ai_agents_dataset/`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({ report_type: "Last 30 Days IPO AI Ranking" }),
        });
        if (res.ok) {
          const data = await res.json();
          const results: RankingReportItem[] = data.results || [];
          const sorted = [...results].sort((a, b) => b.date.localeCompare(a.date));
          setRankingReports(sorted);
          if (sorted.length > 0) {
            setSelectedRankingReport(sorted[0]);
          }
        }
      } catch {
        // silent
      } finally {
        setRankingListLoading(false);
      }
    };
    fetchRankingReports();
  }, [mode]);

  // ── Portfolio Review mode: no blue bar, search is inside the report viewer ──
  if (mode === "portfolioReview") {
    return (
      <Container maxWidth="xl" sx={{ mt: 1, mb: 4 }}>
        <PortfolioReportDocumentMain
          selectedReport={selectedCioReport}
          reportList={cioReports}
          reportListLoading={cioListLoading}
          onSelectReport={setSelectedCioReport}
        />
      </Container>
    );
  }

  // ── Stock Ranking mode: keep the header bar ──
  return (
    <Container maxWidth="xl" sx={{ mt: 2, mb: 4 }}>
      <Box
        sx={{
          mx: "auto",
          borderRadius: 2,
          backgroundColor: "#071852",
          border: "1px solid #1e3a6e",
          px: 2,
          py: 1.2,
          display: "flex",
          alignItems: "center",
          gap: 1.5,
          flexWrap: "wrap",
        }}
      >
        <Typography sx={{ color: "#fff", fontWeight: 600, fontSize: 14, whiteSpace: "nowrap" }}>
          Last 30 Days IPO AI Ranking
        </Typography>
        <Box sx={{ flex: 1 }} />
        <Autocomplete
          options={rankingReports}
          getOptionLabel={(opt) => `${opt.report_name} — ${opt.date}`}
          value={selectedRankingReport}
          onChange={(_, val) => setSelectedRankingReport(val)}
          loading={rankingListLoading}
          size="small"
          sx={{
            width: { xs: "100%", sm: 380 },
            "& .MuiOutlinedInput-root": { borderRadius: 2, backgroundColor: "#f8fafc", fontSize: 12, py: "2px" },
          }}
          renderOption={(props, option) => (
            <Box component="li" {...props} key={option.id}>
              <Box>
                <Typography sx={{ fontSize: 13, fontWeight: 700, color: "#002060" }}>
                  {option.report_name}
                </Typography>
                <Typography sx={{ fontSize: 11, color: "#64748b" }}>
                  {formatDate(option.date)}
                </Typography>
              </Box>
            </Box>
          )}
          renderInput={(params) => (
            <TextField
              {...params}
              placeholder="Search stock ranking reports..."
              size="small"
              InputProps={{
                ...params.InputProps,
                endAdornment: (
                  <>
                    {rankingListLoading && <CircularProgress size={18} />}
                    {params.InputProps.endAdornment}
                  </>
                ),
              }}
            />
          )}
        />
      </Box>
      <Box sx={{ mt: 2, mx: "auto" }}>
        <AIRankingMain selectedReport={selectedRankingReport} />
      </Box>
    </Container>
  );
};

export default AIPortfolioReview;
