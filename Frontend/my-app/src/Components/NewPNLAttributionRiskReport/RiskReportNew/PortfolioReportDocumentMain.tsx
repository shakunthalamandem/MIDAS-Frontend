import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Box,
  Typography,
  Autocomplete,
  TextField,
  CircularProgress,
  IconButton,
  Chip,
  Container,
} from "@mui/material";
import BarChartOutlinedIcon from "@mui/icons-material/BarChartOutlined";
import CampaignOutlinedIcon from "@mui/icons-material/CampaignOutlined";
import BoltOutlinedIcon from "@mui/icons-material/BoltOutlined";
import FactCheckOutlinedIcon from "@mui/icons-material/FactCheckOutlined";
import PublicOutlinedIcon from "@mui/icons-material/PublicOutlined";
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import ShowChartOutlinedIcon from "@mui/icons-material/ShowChartOutlined";
import TrackChangesOutlinedIcon from "@mui/icons-material/TrackChangesOutlined";
import ScheduleOutlinedIcon from "@mui/icons-material/ScheduleOutlined";
import EventNoteOutlinedIcon from "@mui/icons-material/EventNoteOutlined";
import GroupsOutlinedIcon from "@mui/icons-material/GroupsOutlined";
import ViewListOutlinedIcon from "@mui/icons-material/ViewListOutlined";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

import ExecutiveDashboard from "./sections/ExecutiveDashboard";
import CIODecisionBrief from "./sections/CIODecisionBrief";
import ImmediateDecisions from "./sections/ImmediateDecisions";
import DisciplineScorecard from "./sections/DisciplineScorecard";
import SectorNewsMap from "./sections/SectorNewsMap";
import MacroEvents from "./sections/MacroEvents";
import TechnicalOverlay from "./sections/TechnicalOverlay";
import OpportunityEngine from "./sections/OpportunityEngine";
import WeeklyFocus from "./sections/WeeklyFocus";
import MonthlyOutlook from "./sections/MonthlyOutlook";
import ActionChecklists from "./sections/ActionChecklists";
import ActionMatrix from "./sections/ActionMatrix";
import GenericDataRenderer from "./sections/GenericDataRenderer";

const apiUrl = process.env.REACT_APP_API_URL;

interface ReportListItem {
  id: number;
  date: string;
  report_title: string;
}

interface SidebarItem {
  key: string;
  label: string;
  section_number: string;
}

interface ReportHeader {
  report_title: string;
  subtitle?: string;
  date: string;
  aum?: number;
  aum_formatted?: string;
  total_positions?: number;
  classification?: string;
  generated_at?: string;
  pnl?: string;
  pnl_pct?: string;
  dtd?: string;
}

interface ReportData {
  header: ReportHeader;
  sidebar: SidebarItem[];
  sections: Record<string, any>;
}

const sectionIconMap: Record<string, React.ReactNode> = {
  executive_risk_dashboard: <BarChartOutlinedIcon fontSize="small" />,
  cio_decision_brief: <CampaignOutlinedIcon fontSize="small" />,
  immediate_decisions: <BoltOutlinedIcon fontSize="small" />,
  base_model_discipline_scorecard: <FactCheckOutlinedIcon fontSize="small" />,
  sector_peer_news_map: <PublicOutlinedIcon fontSize="small" />,
  macro_event_risk_calendar: <CalendarMonthOutlinedIcon fontSize="small" />,
  technical_risk_overlay: <ShowChartOutlinedIcon fontSize="small" />,
  opportunity_engine: <TrackChangesOutlinedIcon fontSize="small" />,
  upcoming_week_focus: <ScheduleOutlinedIcon fontSize="small" />,
  upcoming_month_strategic_outlook: <EventNoteOutlinedIcon fontSize="small" />,
  role_specific_action_checklists: <GroupsOutlinedIcon fontSize="small" />,
  final_prioritized_action_matrix: <ViewListOutlinedIcon fontSize="small" />,
};

const sectionGradients: Record<string, string> = {
  executive_risk_dashboard: "linear-gradient(90deg, #ec4899, #a855f7)",
  cio_decision_brief: "linear-gradient(90deg, #f97316, #ec4899)",
  immediate_decisions: "linear-gradient(90deg, #ec4899, #a855f7)",
  base_model_discipline_scorecard: "linear-gradient(90deg, #ec4899, #a855f7)",
  sector_peer_news_map: "linear-gradient(90deg, #3b82f6, #a855f7)",
  macro_event_risk_calendar: "linear-gradient(90deg, #3b82f6, #06b6d4)",
  technical_risk_overlay: "linear-gradient(90deg, #06b6d4, #3b82f6)",
  opportunity_engine: "linear-gradient(90deg, #10b981, #06b6d4)",
  upcoming_week_focus: "linear-gradient(90deg, #f97316, #eab308)",
  upcoming_month_strategic_outlook: "linear-gradient(90deg, #f97316, #ec4899)",
  role_specific_action_checklists: "linear-gradient(90deg, #10b981, #06b6d4)",
  final_prioritized_action_matrix: "linear-gradient(90deg, #a855f7, #3b82f6)",
};

const sectionComponents: Partial<Record<string, React.FC<{ data: any }>>> = {
  executive_risk_dashboard: ExecutiveDashboard,
  cio_decision_brief: CIODecisionBrief,
  immediate_decisions: ImmediateDecisions,
  base_model_discipline_scorecard: DisciplineScorecard,
  sector_peer_news_map: SectorNewsMap,
  macro_event_risk_calendar: MacroEvents,
  technical_risk_overlay: TechnicalOverlay,
  opportunity_engine: OpportunityEngine,
  upcoming_week_focus: WeeklyFocus,
  upcoming_month_strategic_outlook: MonthlyOutlook,
  role_specific_action_checklists: ActionChecklists,
  final_prioritized_action_matrix: ActionMatrix,
};

const SIDEBAR_WIDTH = 240;
const SIDEBAR_COLLAPSED = 60;

const PortfolioReportDocumentMain: React.FC = () => {
  const [reportList, setReportList] = useState<ReportListItem[]>([]);
  const [selectedReport, setSelectedReport] = useState<ReportListItem | null>(null);
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [activeSection, setActiveSection] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [listLoading, setListLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const contentRef = useRef<HTMLDivElement | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    fetchReportList();
  }, []);

  useEffect(() => {
    if (selectedReport) {
      fetchReportData(selectedReport);
    }
  }, [selectedReport]);

  // Intersection observer for active section tracking
  useEffect(() => {
    if (!reportData) return;

    if (observerRef.current) observerRef.current.disconnect();

    observerRef.current = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible.length > 0) {
          const key = visible[0].target.getAttribute("data-section-key");
          if (key) setActiveSection(key);
        }
      },
      { root: contentRef.current, rootMargin: "-10% 0px -70% 0px", threshold: 0 }
    );

    Object.entries(sectionRefs.current).forEach(([, el]) => {
      if (el) observerRef.current!.observe(el);
    });

    return () => observerRef.current?.disconnect();
  }, [reportData]);

  const fetchReportList = async () => {
    setListLoading(true);
    try {
      const token = localStorage.getItem("access_token");
      const res = await fetch(`${apiUrl}/api/cio_report_list/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to load reports");
      const data = await res.json();
      setReportList(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setListLoading(false);
    }
  };

  const fetchReportData = async (report: ReportListItem) => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("access_token");
      const res = await fetch(`${apiUrl}/api/cio_report_data/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ date: report.date, title: report.report_title }),
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to load report data");
      }
      const data: ReportData = await res.json();
      setReportData(data);
      if (data.sidebar?.length) setActiveSection(data.sidebar[0].key);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const scrollToSection = useCallback((key: string) => {
    setActiveSection(key);
    sectionRefs.current[key]?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  const handleBack = () => {
    setReportData(null);
    setSelectedReport(null);
    setActiveSection("");
    setError(null);
  };

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr + "T00:00:00");
      return d.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
    } catch {
      return dateStr;
    }
  };

  // ---------- No report selected: show selector ----------
  if (!reportData && !loading) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          background: "linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          p: 3,
        }}
      >
        <Box
          sx={{
            maxWidth: 520,
            width: "100%",
            backgroundColor: "#fff",
            borderRadius: 3,
            boxShadow: "0 8px 32px rgba(0,0,0,0.08)",
            p: 4,
            textAlign: "center",
          }}
        >
          <Box
            sx={{
              width: 56,
              height: 56,
              borderRadius: "50%",
              background: "linear-gradient(135deg, #ec4899, #a855f7)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              mx: "auto",
              mb: 2,
            }}
          >
            <BarChartOutlinedIcon sx={{ color: "#fff", fontSize: 28 }} />
          </Box>
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
            CIO Report Viewer
          </Typography>
          <Typography sx={{ color: "#64748b", fontSize: 14, mb: 3 }}>
            Select a report to view the daily capital allocation analysis
          </Typography>

          {error && (
            <Typography sx={{ color: "#ef4444", fontSize: 13, mb: 2 }}>{error}</Typography>
          )}

          <Autocomplete
            options={reportList}
            getOptionLabel={(opt) => `${opt.report_title} — ${opt.date}`}
            onChange={(_, val) => setSelectedReport(val)}
            loading={listLoading}
            renderOption={(props, option) => (
              <Box component="li" {...props} key={option.id}>
                <Box>
                  <Typography sx={{ fontSize: 14, fontWeight: 600 }}>
                    {option.report_title}
                  </Typography>
                  <Typography sx={{ fontSize: 12, color: "#64748b" }}>
                    {formatDate(option.date)}
                  </Typography>
                </Box>
              </Box>
            )}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Search Reports"
                placeholder="Type to search..."
                size="small"
              />
            )}
            sx={{ width: "100%" }}
          />
        </Box>
      </Box>
    );
  }

  // ---------- Loading state ----------
  if (loading) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#f8fafc",
        }}
      >
        <Box sx={{ textAlign: "center" }}>
          <CircularProgress sx={{ color: "#a855f7", mb: 2 }} />
          <Typography sx={{ color: "#64748b" }}>Loading report...</Typography>
        </Box>
      </Box>
    );
  }

  // ---------- Report loaded: show viewer ----------
  const header = reportData!.header;
  const sidebar = reportData!.sidebar;
  const sections = reportData!.sections;
  const sw = sidebarOpen ? SIDEBAR_WIDTH : SIDEBAR_COLLAPSED;

  return (  
    <Container maxWidth='xl'>
    <Box sx={{ display: "flex", height: "100vh", backgroundColor: "#f8fafc" }}>
      {/* ===== Sidebar ===== */}
      <Box
        sx={{
          width: sw,
          minWidth: sw,
          transition: "width 0.3s ease, min-width 0.3s ease",
          borderRight: "1px solid #e2e8f0",
          display: "flex",
          flexDirection: "column",
          backgroundColor: "#fff",
          overflow: "hidden",
        }}
      >
        {/* Logo */}
        <Box
          sx={{
            px: sidebarOpen ? 2 : 1,
            py: 1.5,
            display: "flex",
            alignItems: "center",
            gap: 1.5,
            borderBottom: "1px solid #f1f5f9",
            minHeight: 52,
          }}
        >
          <Box
            sx={{
              width: 32,
              height: 32,
              minWidth: 32,
              borderRadius: "50%",
              background: "linear-gradient(135deg, #ec4899, #a855f7)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <BarChartOutlinedIcon sx={{ color: "#fff", fontSize: 18 }} />
          </Box>
          {sidebarOpen && (
            <Typography
              sx={{
                fontWeight: 700,
                fontSize: 13,
                letterSpacing: 1.5,
                whiteSpace: "nowrap",
                flex: 1,
              }}
            >
              CIO REPORT
            </Typography>
          )}
          <IconButton
            size="small"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            sx={{ ml: sidebarOpen ? 0 : "auto", mr: sidebarOpen ? 0 : "auto" }}
          >
            {sidebarOpen ? (
              <ChevronLeftIcon fontSize="small" />
            ) : (
              <ChevronRightIcon fontSize="small" />
            )}
          </IconButton>
        </Box>

        {/* Nav Items */}
        <Box sx={{ flex: 1, overflowY: "auto", py: 0.5 }}>
          {sidebar.map((item) => {
            const isActive = activeSection === item.key;
            return (
              <Box
                key={item.key}
                onClick={() => scrollToSection(item.key)}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1.5,
                  px: sidebarOpen ? 2 : 0,
                  py: 1.1,
                  cursor: "pointer",
                  borderLeft: isActive
                    ? "3px solid #a855f7"
                    : "3px solid transparent",
                  backgroundColor: isActive
                    ? "rgba(168, 85, 247, 0.08)"
                    : "transparent",
                  color: isActive ? "#7c3aed" : "#64748b",
                  transition: "all 0.2s",
                  justifyContent: sidebarOpen ? "flex-start" : "center",
                  "&:hover": {
                    backgroundColor: isActive
                      ? "rgba(168, 85, 247, 0.08)"
                      : "rgba(100, 116, 139, 0.06)",
                  },
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", minWidth: 24, justifyContent: "center" }}>
                  {sectionIconMap[item.key] || <ViewListOutlinedIcon fontSize="small" />}
                </Box>
                {sidebarOpen && (
                  <Typography
                    sx={{
                      fontSize: 13,
                      fontWeight: isActive ? 600 : 400,
                      color: "inherit",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {item.label}
                  </Typography>
                )}
              </Box>
            );
          })}
        </Box>

        {/* Footer */}
        {sidebarOpen && (
          <Typography
            sx={{
              px: 2,
              py: 1.5,
              fontSize: 10,
              color: "#94a3b8",
              letterSpacing: 0.5,
              borderTop: "1px solid #f1f5f9",
              textTransform: "uppercase",
            }}
          >
            Confidential · {formatDate(header.date)}
          </Typography>
        )}
      </Box>

      {/* ===== Main Content ===== */}
      <Box sx={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {/* Header */}
        <Box
          sx={{
            px: 3,
            py: 1.5,
            borderBottom: "1px solid #e2e8f0",
            background: "linear-gradient(135deg, #fff 0%, #f8fafc 100%)",
            display: "flex",
            alignItems: "center",
            gap: 2,
            minHeight: 68,
          }}
        >
          <IconButton
            size="small"
            onClick={handleBack}
            sx={{
              mr: 0.5,
              backgroundColor: "#f1f5f9",
              "&:hover": { backgroundColor: "#e2e8f0" },
            }}
          >
            <ArrowBackIcon fontSize="small" />
          </IconButton>
          <Box sx={{ flex: 1 }}>
            <Typography sx={{ fontWeight: 800, fontSize: 18, letterSpacing: -0.3 }}>
              {header.report_title}
            </Typography>
            <Typography sx={{ color: "#64748b", fontSize: 12.5 }}>
              {formatDate(header.date)}
              {header.aum_formatted && ` · AUM: ${header.aum_formatted}`}
              {header.classification && ` · ${header.classification}`}
            </Typography>
          </Box>

          {header.pnl && (
            <Chip
              label={`P&L: ${header.pnl}${header.pnl_pct ? ` (${header.pnl_pct})` : ""}`}
              size="small"
              sx={{
                background: "linear-gradient(135deg, #ec4899, #a855f7)",
                color: "#fff",
                fontWeight: 700,
                fontSize: 12,
                height: 30,
                boxShadow: "0 2px 8px rgba(168,85,247,0.3)",
              }}
            />
          )}
          {header.dtd && (
            <Chip
              label={`DTD: ${header.dtd}`}
              size="small"
              sx={{
                backgroundColor: "#1e293b",
                color: "#fff",
                fontWeight: 700,
                fontSize: 12,
                height: 30,
              }}
            />
          )}
        </Box>

        {/* Scrollable Content */}
        <Box
          ref={contentRef}
          sx={{
            flex: 1,
            overflowY: "auto",
            px: 3,
            py: 3,
          }}
        >
          {error && (
            <Typography sx={{ color: "#ef4444", mb: 2 }}>{error}</Typography>
          )}

          {sidebar.map((item) => {
            const SectionComponent = sectionComponents[item.key];
            const sectionData = sections[item.key];
            const isNumeric = /^\d+$/.test(item.section_number);
            const gradient = sectionGradients[item.key] || "linear-gradient(90deg, #94a3b8, #cbd5e1)";

            return (
              <Box
                key={item.key}
                data-section-key={item.key}
                ref={(el: HTMLDivElement | null) => {
                  sectionRefs.current[item.key] = el;
                }}
                sx={{ mb: 5 }}
              >
                {/* Section Header with Gradient */}
                <Box
                  sx={{
                    background: gradient,
                    borderRadius: "12px 12px 0 0",
                    px: 3,
                    py: 1.5,
                    display: "flex",
                    alignItems: "center",
                    gap: 1.5,
                    mb: 0,
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", minWidth: 28, justifyContent: "center", color: "#fff" }}>
                    {sectionIconMap[item.key] || <ViewListOutlinedIcon fontSize="small" />}
                  </Box>
                  <Typography variant="h6" sx={{ fontWeight: 700, fontSize: 18, color: "#fff", flex: 1 }}>
                    {isNumeric ? `${item.section_number}. ` : ""}
                    {item.label}
                  </Typography>
                  {sectionData?.badge && (
                    <Chip
                      label={sectionData.badge}
                      size="small"
                      sx={{
                        fontSize: 11,
                        height: 24,
                        backgroundColor: "rgba(255,255,255,0.25)",
                        color: "#fff",
                        fontWeight: 600,
                        backdropFilter: "blur(4px)",
                      }}
                    />
                  )}
                  {sectionData?.overall && (
                    <Chip
                      label={`Overall: ${sectionData.overall}`}
                      size="small"
                      sx={{
                        fontSize: 11,
                        height: 24,
                        backgroundColor: "rgba(255,255,255,0.25)",
                        color: "#fff",
                        fontWeight: 600,
                        backdropFilter: "blur(4px)",
                      }}
                    />
                  )}
                </Box>

                {/* Section Content */}
                <Box
                  sx={{
                    backgroundColor: "#fff",
                    border: "1px solid #e2e8f0",
                    borderTop: "none",
                    borderRadius: "0 0 12px 12px",
                    p: 3,
                  }}
                >
                  {SectionComponent && sectionData != null ? (
                    <SectionComponent data={sectionData} />
                  ) : sectionData ? (
                    <GenericDataRenderer data={sectionData} />
                  ) : (
                    <Typography sx={{ fontSize: 13, color: "#94a3b8", fontStyle: "italic" }}>
                      No data available for this section.
                    </Typography>
                  )}
                </Box>
              </Box>
            );
          })}
        </Box>
      </Box>
    </Box>
    </Container>
  );
};

export default PortfolioReportDocumentMain;

