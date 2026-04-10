import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  TextField,
  InputAdornment,
  Chip,
  Tooltip,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import SmartToyIcon from "@mui/icons-material/SmartToy";
import CompareArrowsIcon from "@mui/icons-material/CompareArrows";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import StorageIcon from "@mui/icons-material/Storage";
import SaveAltIcon from "@mui/icons-material/SaveAlt";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import ManageSearchIcon from "@mui/icons-material/ManageSearch";
import AssessmentIcon from "@mui/icons-material/Assessment";
import SecurityIcon from "@mui/icons-material/Security";
import PsychologyIcon from "@mui/icons-material/Psychology";
import EventNoteIcon from "@mui/icons-material/EventNote";
import AddchartIcon from "@mui/icons-material/Addchart";
import TimelineIcon from "@mui/icons-material/Timeline";
import HistoryIcon from "@mui/icons-material/History";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import FactCheckIcon from "@mui/icons-material/FactCheck";
import MonetizationOnIcon from "@mui/icons-material/MonetizationOn";
import CategoryIcon from "@mui/icons-material/Category";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";

interface DashboardItem {
  title: string;
  description: string;
  path: string;
  icon: React.ReactNode;
  category: string;
  accent: string;
  bg: string;
  iconBg: string;
}

const CATEGORIES = ["All", "Agent Ops", "Data Transfer", "Uploads", "Portfolio & Review"];

const ITEMS: DashboardItem[] = [
  {
    title: "Agent Tasks",
    description: "Monitor and manage AI agent task executions and pipelines",
    path: "/agents_tasks",
    icon: <SmartToyIcon sx={{ fontSize: 28 }} />,
    category: "Agent Ops",
    accent: "#6366f1",
    bg: "linear-gradient(135deg, #eef2ff 0%, #e0e7ff 100%)",
    iconBg: "#6366f1",
  },
  {
    title: "Beta Transfer",
    description: "Transfer and sync beta data across environments",
    path: "/beta_transfer",
    icon: <CompareArrowsIcon sx={{ fontSize: 28 }} />,
    category: "Agent Ops",
    accent: "#8b5cf6",
    bg: "linear-gradient(135deg, #f5f3ff 0%, #ede9fe 100%)",
    iconBg: "#8b5cf6",
  },
  {
    title: "S3 Data Transfer",
    description: "Upload and manage files directly with AWS S3 storage",
    path: "/s3",
    icon: <CloudUploadIcon sx={{ fontSize: 28 }} />,
    category: "Data Transfer",
    accent: "#0ea5e9",
    bg: "linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)",
    iconBg: "#0ea5e9",
  },
  {
    title: "Data Dump",
    description: "Export and dump structured datasets from the platform",
    path: "/data_dump",
    icon: <SaveAltIcon sx={{ fontSize: 28 }} />,
    category: "Data Transfer",
    accent: "#06b6d4",
    bg: "linear-gradient(135deg, #ecfeff 0%, #cffafe 100%)",
    iconBg: "#06b6d4",
  },
  {
    title: "Database Explorer",
    description: "Browse, query, and inspect database tables and schemas",
    path: "/database_explorer",
    icon: <ManageSearchIcon sx={{ fontSize: 28 }} />,
    category: "Data Transfer",
    accent: "#14b8a6",
    bg: "linear-gradient(135deg, #f0fdfa 0%, #ccfbf1 100%)",
    iconBg: "#14b8a6",
  },
  {
    title: "J Upload",
    description: "Upload Jay Ritter IPO analysis data files to the platform",
    path: "/j_upload",
    icon: <UploadFileIcon sx={{ fontSize: 28 }} />,
    category: "Uploads",
    accent: "#f59e0b",
    bg: "linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)",
    iconBg: "#f59e0b",
  },
  {
    title: "Risk Upload",
    description: "Upload new portfolio risk assessment and exposure data",
    path: "/risk_upload",
    icon: <SecurityIcon sx={{ fontSize: 28 }} />,
    category: "Uploads",
    accent: "#ef4444",
    bg: "linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)",
    iconBg: "#ef4444",
  },
  {
    title: "Claude Sentiment Upload",
    description: "Upload Claude AI-generated sentiment analysis datasets",
    path: "/upload_claude_sentiment",
    icon: <PsychologyIcon sx={{ fontSize: 28 }} />,
    category: "Uploads",
    accent: "#ec4899",
    bg: "linear-gradient(135deg, #fdf2f8 0%, #fce7f3 100%)",
    iconBg: "#ec4899",
  },
  {
    title: "Daily Note",
    description: "Manage and delete daily note ticker data entries",
    path: "/daily_note",
    icon: <EventNoteIcon sx={{ fontSize: 28 }} />,
    category: "Uploads",
    accent: "#f97316",
    bg: "linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%)",
    iconBg: "#f97316",
  },
  {
    title: "FS New Deal Data",
    description: "Upload FactSet unified deal data for new transactions",
    path: "/fs_new_deal_data",
    icon: <AddchartIcon sx={{ fontSize: 28 }} />,
    category: "Uploads",
    accent: "#10b981",
    bg: "linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)",
    iconBg: "#10b981",
  },
  {
    title: "FO Financial Forecasts",
    description: "Upload follow-on financial forecast models and projections",
    path: "/fo_financial_forecasts_upload",
    icon: <TimelineIcon sx={{ fontSize: 28 }} />,
    category: "Uploads",
    accent: "#059669",
    bg: "linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)",
    iconBg: "#059669",
  },
  {
    title: "Version Upload",
    description: "Upload and manage versioned data files and releases",
    path: "/version",
    icon: <HistoryIcon sx={{ fontSize: 28 }} />,
    category: "Uploads",
    accent: "#64748b",
    bg: "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)",
    iconBg: "#64748b",
  },
  {
    title: "AI Insights Upload",
    description: "Upload AI-generated market insights and intelligence data",
    path: "/ai_upload",
    icon: <AutoAwesomeIcon sx={{ fontSize: 28 }} />,
    category: "Uploads",
    accent: "#a855f7",
    bg: "linear-gradient(135deg, #faf5ff 0%, #f3e8ff 100%)",
    iconBg: "#a855f7",
  },
  {
    title: "FactSet Tickers Upload",
    description: "Upload and sync FactSet ticker reference data",
    path: "/fs_upload",
    icon: <FactCheckIcon sx={{ fontSize: 28 }} />,
    category: "Uploads",
    accent: "#3b82f6",
    bg: "linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)",
    iconBg: "#3b82f6",
  },
  {
    title: "IPO Uploads",
    description: "Upload IPO prospectus and deal-related documents",
    path: "/ipouploads",
    icon: <MonetizationOnIcon sx={{ fontSize: 28 }} />,
    category: "Uploads",
    accent: "#eab308",
    bg: "linear-gradient(135deg, #fefce8 0%, #fef9c3 100%)",
    iconBg: "#eab308",
  },
  {
    title: "Main Uploads",
    description: "Central hub for all general data and file uploads",
    path: "/uploads",
    icon: <StorageIcon sx={{ fontSize: 28 }} />,
    category: "Uploads",
    accent: "#002060",
    bg: "linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)",
    iconBg: "#002060",
  },
  {
    title: "CIO Portfolio Review",
    description: "Run CIO-level portfolio review wizard and analysis",
    path: "/cio_portfolio_review",
    icon: <AssessmentIcon sx={{ fontSize: 28 }} />,
    category: "Portfolio & Review",
    accent: "#0f766e",
    bg: "linear-gradient(135deg, #f0fdfa 0%, #ccfbf1 100%)",
    iconBg: "#0f766e",
  },
];

const OperationsDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  const filtered = ITEMS.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(search.toLowerCase()) ||
      item.description.toLowerCase().includes(search.toLowerCase());
    const matchesCategory =
      activeCategory === "All" || item.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const categoryCount = (cat: string) =>
    cat === "All" ? ITEMS.length : ITEMS.filter((i) => i.category === cat).length;

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "#f8fafc",
        px: { xs: 2, md: 5 },
        py: 4,
      }}
    >
      {/* Header */}
      <Box sx={{ mb: 5, textAlign: "center" }}>
        <Box
          sx={{
            display: "inline-flex",
            alignItems: "center",
            gap: 1.5,
            px: 3,
            py: 1,
            borderRadius: "999px",
            background: "#eef2ff",
            border: "1px solid #c7d2fe",
            mb: 2.5,
          }}
        >
          <CategoryIcon sx={{ fontSize: 16, color: "#6366f1" }} />
          <Typography sx={{ fontSize: 13, color: "#6366f1", fontWeight: 700, letterSpacing: 1 }}>
            OPERATIONS HUB
          </Typography>
        </Box>

        <Typography
          variant="h3"
          sx={{
            fontWeight: 800,
            color: "#0f172a",
            letterSpacing: "-0.5px",
            mb: 1.5,
            fontSize: { xs: "1.8rem", md: "2.5rem" },
          }}
        >
          Operations Dashboard
        </Typography>
        <Typography sx={{ color: "#64748b", fontSize: 15, maxWidth: 520, mx: "auto" }}>
          Your central control hub for uploads, data transfers, agent operations, and portfolio reviews
        </Typography>
      </Box>

      {/* Search + Filter Row */}
      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          gap: 2,
          alignItems: "center",
          justifyContent: "space-between",
          mb: 4,
        }}
      >
        <TextField
          placeholder="Search operations..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          size="small"
          sx={{
            width: { xs: "100%", sm: 300 },
            "& .MuiOutlinedInput-root": {
              backgroundColor: "#ffffff",
              borderRadius: "10px",
              color: "#0f172a",
              "& fieldset": { borderColor: "#e2e8f0" },
              "&:hover fieldset": { borderColor: "#a5b4fc" },
              "&.Mui-focused fieldset": { borderColor: "#6366f1" },
            },
            "& .MuiInputBase-input::placeholder": { color: "#94a3b8" },
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: "#94a3b8", fontSize: 18 }} />
              </InputAdornment>
            ),
          }}
        />

        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
          {CATEGORIES.map((cat) => (
            <Chip
              key={cat}
              label={`${cat} (${categoryCount(cat)})`}
              onClick={() => setActiveCategory(cat)}
              sx={{
                fontSize: 12,
                fontWeight: 600,
                cursor: "pointer",
                transition: "all 0.2s",
                backgroundColor: activeCategory === cat ? "#6366f1" : "#ffffff",
                color: activeCategory === cat ? "#fff" : "#475569",
                border: `1px solid ${activeCategory === cat ? "#6366f1" : "#e2e8f0"}`,
                boxShadow: activeCategory === cat ? "0 2px 8px rgba(99,102,241,0.3)" : "none",
                "&:hover": {
                  backgroundColor: activeCategory === cat ? "#4f46e5" : "#eef2ff",
                  color: activeCategory === cat ? "#fff" : "#6366f1",
                  borderColor: activeCategory === cat ? "#4f46e5" : "#a5b4fc",
                },
              }}
            />
          ))}
        </Box>
      </Box>

      {/* Results count */}
      {search && (
        <Typography sx={{ color: "#94a3b8", fontSize: 13, mb: 2 }}>
          {filtered.length} result{filtered.length !== 1 ? "s" : ""} for "{search}"
        </Typography>
      )}

      {/* Cards Grid */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            sm: "repeat(2, 1fr)",
            md: "repeat(3, 1fr)",
            lg: "repeat(4, 1fr)",
          },
          gap: 2.5,
        }}
      >
        {filtered.map((item) => (
          <Tooltip key={item.path} title={`Go to ${item.title}`} placement="top" arrow>
            <Box
              onClick={() => navigate(item.path)}
              onMouseEnter={() => setHoveredCard(item.path)}
              onMouseLeave={() => setHoveredCard(null)}
              sx={{
                borderRadius: "16px",
                overflow: "hidden",
                cursor: "pointer",
                border: `1px solid ${
                  hoveredCard === item.path ? `${item.accent}40` : "#e2e8f0"
                }`,
                background: hoveredCard === item.path ? item.bg : "#ffffff",
                transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
                transform: hoveredCard === item.path ? "translateY(-4px)" : "translateY(0)",
                boxShadow:
                  hoveredCard === item.path
                    ? `0 16px 32px rgba(0,0,0,0.1), 0 0 0 1px ${item.accent}22`
                    : "0 1px 4px rgba(0,0,0,0.06)",
                position: "relative",
              }}
            >
              {/* Top accent strip */}
              <Box
                sx={{
                  height: 3,
                  background: `linear-gradient(90deg, ${item.accent}, ${item.accent}66)`,
                  opacity: hoveredCard === item.path ? 1 : 0.25,
                  transition: "opacity 0.25s",
                }}
              />

              <Box sx={{ p: 2.5 }}>
                {/* Icon + Category row */}
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "flex-start",
                    justifyContent: "space-between",
                    mb: 2,
                  }}
                >
                  <Box
                    sx={{
                      width: 52,
                      height: 52,
                      borderRadius: "14px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      backgroundColor: `${item.iconBg}18`,
                      border: `1px solid ${item.iconBg}28`,
                      color: item.accent,
                      transition: "all 0.25s",
                      ...(hoveredCard === item.path && {
                        backgroundColor: `${item.iconBg}28`,
                        border: `1px solid ${item.iconBg}44`,
                        transform: "scale(1.08)",
                      }),
                    }}
                  >
                    {item.icon}
                  </Box>

                  <Chip
                    label={item.category}
                    size="small"
                    sx={{
                      fontSize: 10,
                      fontWeight: 700,
                      height: 20,
                      backgroundColor: `${item.accent}12`,
                      color: item.accent,
                      border: `1px solid ${item.accent}28`,
                      "& .MuiChip-label": { px: 1 },
                    }}
                  />
                </Box>

                {/* Title */}
                <Typography
                  sx={{
                    fontWeight: 700,
                    fontSize: 15,
                    color: "#0f172a",
                    mb: 0.75,
                    lineHeight: 1.3,
                  }}
                >
                  {item.title}
                </Typography>

                {/* Description */}
                <Typography
                  sx={{
                    fontSize: 12.5,
                    color: "#64748b",
                    lineHeight: 1.55,
                    mb: 2.5,
                    minHeight: 38,
                  }}
                >
                  {item.description}
                </Typography>

                {/* Footer */}
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    pt: 1.5,
                    borderTop: "1px solid #f1f5f9",
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: 11,
                      color: "#94a3b8",
                      fontFamily: "monospace",
                    }}
                  >
                    {item.path}
                  </Typography>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 0.5,
                      opacity: hoveredCard === item.path ? 1 : 0,
                      transform:
                        hoveredCard === item.path
                          ? "translateX(0)"
                          : "translateX(-6px)",
                      transition: "all 0.25s",
                    }}
                  >
                    <Typography sx={{ fontSize: 11, fontWeight: 700, color: item.accent }}>
                      Open
                    </Typography>
                    <ArrowForwardIcon sx={{ fontSize: 13, color: item.accent }} />
                  </Box>
                </Box>
              </Box>
            </Box>
          </Tooltip>
        ))}
      </Box>

      {/* Empty state */}
      {filtered.length === 0 && (
        <Box sx={{ textAlign: "center", py: 10 }}>
          <SearchIcon sx={{ fontSize: 48, mb: 2, color: "#cbd5e1" }} />
          <Typography sx={{ fontSize: 16, fontWeight: 600, color: "#475569" }}>No operations found</Typography>
          <Typography sx={{ fontSize: 13, mt: 0.5, color: "#94a3b8" }}>
            Try a different search term or category
          </Typography>
        </Box>
      )}

      {/* Footer stats */}
      <Box
        sx={{
          mt: 6,
          pt: 3,
          borderTop: "1px solid #e2e8f0",
          display: "flex",
          flexWrap: "wrap",
          gap: 4,
          justifyContent: "center",
        }}
      >
        {CATEGORIES.filter((c) => c !== "All").map((cat) => (
          <Box key={cat} sx={{ textAlign: "center" }}>
            <Typography sx={{ fontSize: 22, fontWeight: 800, color: "#0f172a" }}>
              {categoryCount(cat)}
            </Typography>
            <Typography sx={{ fontSize: 11, color: "#94a3b8", fontWeight: 600 }}>
              {cat}
            </Typography>
          </Box>
        ))}
      </Box>
    </Box>
  );
};

export default OperationsDashboard;
