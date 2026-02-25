import React, { useState, useEffect } from "react";
import {
  Autocomplete,
  Box,
  Button,
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

const tabConfig = [
  { key: "portfolioReview", label: "US  Equity Portfolio AI Review" },
  { key: "stockRanking", label: "Portfolio AI Stock Ranking" },
];

const AIPortfolioReview: React.FC = () => {
  const [activeTab, setActiveTab] = useState(tabConfig[0].key);

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
  }, []);

  // Fetch Ranking report list
  useEffect(() => {
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
          body: JSON.stringify({ report_type: "Portfolio AI Stock Ranking" }),
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
  }, []);

  const handleTabChange = (newValue: string) => {
    setActiveTab(newValue);
  };

  const renderContent = () => {
    if (activeTab === "portfolioReview") {
      return <PortfolioReportDocumentMain selectedReport={selectedCioReport} />;
    }

    if (activeTab === "stockRanking") {
      return (
        <Box sx={{ mt: 1 }}>
          <AIRankingMain selectedReport={selectedRankingReport} />
        </Box>
      );
    }

    return null;
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 2, mb: 4 }}>

      {/* Tab bar with inline search */}
      <Box
        sx={{
          // maxWidth: 1280,
          mx: "auto",
          borderRadius: 2,
          backgroundColor: "#071852",
          border: "1px solid #c7d2fe",
          px: 2,
          py: 1.2,
          display: "flex",
          alignItems: "center",
          gap: 1.5,
          flexWrap: "wrap",
        }}
      >
        {/* Tabs - left side */}
        <Box sx={{ display: "flex", gap: 1 }}>
          {tabConfig.map((tab) => {
            const isActive = tab.key === activeTab;
            return (
              <Button
                key={tab.key}
                onClick={() => handleTabChange(tab.key)}
                sx={{
                  borderRadius: "999px",
                  textTransform: "none",
                  fontWeight: 600,
                  fontSize: 13,
                  px: 3,
                  py: 0.8,
                  color: isActive ? "#fff" : "#475569",
                  background: isActive
                    ? "#002060"
                    : "transparent",
                  border: isActive ? "1px solid #002060" : "1px solid #e2e8f0",
                  boxShadow: isActive
                    ? "0 2px 8px rgba(0, 32, 96, 0.3)"
                    : "none",
                  whiteSpace: "nowrap",
                  "&:hover": {
                    background: isActive
                      ? "#001a50"
                      : "#f1f5f9",
                  },
                }}
              >
                {tab.label}
              </Button>
            );
          })}
        </Box>

        {/* Spacer */}
        <Box sx={{ flex: 1 }} />

        {/* Search - right side (shows respective search per tab) */}
        {activeTab === "portfolioReview" && (
          <Autocomplete
            options={cioReports}
            getOptionLabel={(opt) => `${opt.report_title} — ${opt.date}`}
            value={selectedCioReport}
            onChange={(_, val) => setSelectedCioReport(val)}
            loading={cioListLoading}
            size="small"
            sx={{
              width: { xs: "100%", sm: 380 },
              "& .MuiOutlinedInput-root": { borderRadius: 2, backgroundColor: "#f8fafc", fontSize: 12, py: "2px" },
            }}
            renderOption={(props, option) => (
              <Box component="li" {...props} key={option.id}>
                <Box>
                  <Typography sx={{ fontSize: 13, fontWeight: 700, color: "#002060" }}>
                    {option.report_title}
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
                placeholder="Search CIO reports..."
                size="small"
                InputProps={{
                  ...params.InputProps,
                  endAdornment: (
                    <>
                      {cioListLoading && <CircularProgress size={18} />}
                      {params.InputProps.endAdornment}
                    </>
                  ),
                }}
              />
            )}
          />
        )}

        {activeTab === "stockRanking" && (
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
        )}
      </Box>

      {/* Content area */}
      <Box
        sx={{
          mt: 2,
          mx: "auto",
        }}
      >
        {renderContent()}
      </Box>
    </Container> 
  );
};

export default AIPortfolioReview;
