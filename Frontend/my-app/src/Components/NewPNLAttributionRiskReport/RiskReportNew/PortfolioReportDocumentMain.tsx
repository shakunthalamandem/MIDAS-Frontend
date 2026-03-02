import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Box,
  Typography,
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
import { extractImmediateDecisionItems } from "./sections/ImmediateDecisions";
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
import AIPortfolioReviewPDFExporter from "./AIPortfolioReviewPDFExporter";

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

const sectionColors: Record<string, { bg: string; border: string; iconColor: string; textColor: string }> = {
  executive_risk_dashboard: { bg: "#eff6ff", border: "#bfdbfe", iconColor: "#2563eb", textColor: "#1e40af" },
  cio_decision_brief: { bg: "#fffbeb", border: "#fde68a", iconColor: "#d97706", textColor: "#92400e" },
  immediate_decisions: { bg: "#fef2f2", border: "#fecaca", iconColor: "#dc2626", textColor: "#991b1b" },
  base_model_discipline_scorecard: { bg: "#faf5ff", border: "#e9d5ff", iconColor: "#7c3aed", textColor: "#5b21b6" },
  sector_peer_news_map: { bg: "#eff6ff", border: "#bfdbfe", iconColor: "#0284c7", textColor: "#075985" },
  macro_event_risk_calendar: { bg: "#eff6ff", border: "#bfdbfe", iconColor: "#2563eb", textColor: "#1e40af" },
  technical_risk_overlay: { bg: "#ecfeff", border: "#a5f3fc", iconColor: "#0891b2", textColor: "#155e75" },
  opportunity_engine: { bg: "#ecfdf5", border: "#a7f3d0", iconColor: "#059669", textColor: "#065f46" },
  upcoming_week_focus: { bg: "#fff7ed", border: "#fed7aa", iconColor: "#ea580c", textColor: "#9a3412" },
  upcoming_month_strategic_outlook: { bg: "#faf5ff", border: "#e9d5ff", iconColor: "#7c3aed", textColor: "#5b21b6" },
  role_specific_action_checklists: { bg: "#ecfdf5", border: "#a7f3d0", iconColor: "#059669", textColor: "#065f46" },
  final_prioritized_action_matrix: { bg: "#eef2ff", border: "#c7d2fe", iconColor: "#4f46e5", textColor: "#3730a3" },
};

const sectionComponents: Partial<Record<string, React.FC<{ data: any }>>> = {
  executive_risk_dashboard: ExecutiveDashboard,
  final_prioritized_action_matrix: ActionMatrix,
  cio_decision_brief: CIODecisionBrief,
  base_model_discipline_scorecard: DisciplineScorecard,
  sector_peer_news_map: SectorNewsMap,
  macro_event_risk_calendar: MacroEvents,
  technical_risk_overlay: TechnicalOverlay,
  opportunity_engine: OpportunityEngine,
  upcoming_week_focus: WeeklyFocus,
  upcoming_month_strategic_outlook: MonthlyOutlook,
  role_specific_action_checklists: ActionChecklists,
};

const SIDEBAR_WIDTH = 240;
const SIDEBAR_COLLAPSED = 60;
const LAYOUT_CHROME_HEIGHT = 160; // navbar + footer space (adjust if those heights change)

interface PortfolioReportDocumentMainProps {
  selectedReport?: ReportListItem | null;
}

const PortfolioReportDocumentMain: React.FC<PortfolioReportDocumentMainProps> = ({ selectedReport: externalReport }) => {
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [activeSection, setActiveSection] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const contentRef = useRef<HTMLDivElement | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // React to external report selection from parent
  useEffect(() => {
    if (externalReport) {
      fetchReportData(externalReport);
    } else {
      setReportData(null);
    }
  }, [externalReport]);

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
      if (data.sidebar?.length) {
        setActiveSection(data.sidebar[0].key);
      }
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

  // ---------- No report selected: show prompt ----------
  if (!reportData && !loading) {
    return (
      <Box
        sx={{
          minHeight: "40vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          px: 3,
        }}
      >
        <Box
          sx={{
            width: 64,
            height: 64,
            borderRadius: "50%",
            background: "linear-gradient(135deg, #2563eb, #3b82f6)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            mb: 2.5,
            boxShadow: "0 4px 14px rgba(37, 99, 235, 0.25)",
          }}
        >
          <BarChartOutlinedIcon sx={{ color: "#fff", fontSize: 28 }} />
        </Box>
        <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5, color: "#1e293b" }}>
          US  Equity Portfolio AI Review
        </Typography>
        <Typography sx={{ color: "#64748b", fontSize: 14 }}>
          Select a report from the search bar above to begin
        </Typography>
        {error && (
          <Typography sx={{ color: "#ef4444", fontSize: 13, mt: 2 }}>{error}</Typography>
        )}
      </Box>
    );
  }

  // ---------- Loading state ----------
  if (loading) {
    return (
      <Box
        sx={{
          minHeight: "60vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Box sx={{ textAlign: "center" }}>
          <CircularProgress sx={{ color: "#2563eb", mb: 2 }} />
          <Typography sx={{ color: "#64748b" }}>Loading report...</Typography>
        </Box>
      </Box>
    );
  }

  // ---------- Report loaded: show viewer ----------
  const header = reportData!.header;
  const sidebar = reportData!.sidebar;
  const orderIndex = new Map(
    Object.keys(sectionComponents).map((key, idx) => [key, idx])
  );
  const orderedSidebar = [...sidebar]
    .filter((item) => item.key !== "cio_decision_brief" && item.key !== "immediate_decisions")
    .sort((a, b) => {
      const aIdx = orderIndex.has(a.key) ? orderIndex.get(a.key)! : 999;
      const bIdx = orderIndex.has(b.key) ? orderIndex.get(b.key)! : 999;
      if (aIdx !== bIdx) return aIdx - bIdx;
      return 0;
    });
  const sections = reportData!.sections;
  const immediateDecisionItems = extractImmediateDecisionItems(sections.immediate_decisions);
  const sw = sidebarOpen ? SIDEBAR_WIDTH : SIDEBAR_COLLAPSED;

  return (
    <Container maxWidth="xl" sx={{ mb: 4, height: `calc(100vh - ${LAYOUT_CHROME_HEIGHT}px)` }}>
      <Box
        sx={{
          display: "flex",
          height: "100%",
          minHeight: `calc(100vh - ${LAYOUT_CHROME_HEIGHT}px)`,
          backgroundColor: "#f8fafc",
          borderRadius: 2,
          overflow: "hidden",
          border: "1px solid #e2e8f0",
        }}
      >
        {/* ===== Sidebar ===== */}
        <Box
          sx={{
            width: sw,
            minWidth: sw,
            transition: "width 0.3s ease, min-width 0.3s ease",
            display: "flex",
            flexDirection: "column",
            backgroundColor: "#eef2ff",
            overflow: "hidden",
            borderRight: "1px solid #c7d2fe",
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
              borderBottom: "1px solid #c7d2fe",
              minHeight: 52,
            }}
          >
            <Box
              sx={{
                width: 32,
                height: 32,
                minWidth: 32,
                borderRadius: "50%",
                background: "linear-gradient(135deg, #2563eb, #3b82f6)",
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
                  color: "#002060",
                }}
              >
                AI REVIEW
              </Typography>
            )}
            <IconButton
              size="small"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              sx={{ ml: sidebarOpen ? 0 : "auto", mr: sidebarOpen ? 0 : "auto", color: "#94a3b8", "&:hover": { color: "#475569" } }}
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
            {orderedSidebar.map((item) => {
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
                      ? "3px solid #2563eb"
                      : "3px solid transparent",
                    backgroundColor: isActive
                      ? "#dbeafe"
                      : "transparent",
                    color: isActive ? "#002060" : "#002060",
                    transition: "all 0.2s",
                    justifyContent: sidebarOpen ? "flex-start" : "center",
                    "&:hover": {
                      backgroundColor: isActive
                        ? "#dbeafe"
                        : "#e0e7ff",
                      color: "#002060",
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
                borderTop: "1px solid #c7d2fe",
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
              py: 2,
              borderBottom: "1px solid #c7d2fe",
              backgroundColor: "#eef2ff",
              display: "flex",
              alignItems: "center",
              minHeight: 72,
            }}
          >
            {/* <IconButton
            size="small"
            onClick={handleBack}
            sx={{
              mr: 2,
              backgroundColor: "#f1f5f9",
              color: "#475569",
              "&:hover": { backgroundColor: "#e2e8f0" },
            }}
          >
            <ArrowBackIcon fontSize="small" />
          </IconButton> */}
            <Box sx={{ flex: 1, textAlign: "center" }}>
              <Typography sx={{ fontWeight: 800, fontSize: 18, letterSpacing: 0.1, color: "#1e293b" }}>
                <Box component="span" sx={{ color: "#2563eb" }}>
                  US Equity Portfolio AI Review              </Box>
                {" - "}
                {header.report_title}
              </Typography>
              <Typography
                sx={{
                  color: "#94a3b8",
                  fontSize: 12.5,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 0.5,
                  mt: 0.5,
                }}
              >
                <Box component="span" sx={{ color: "#2563eb", fontWeight: 600 }}>{formatDate(header.date)}</Box>
                {header.aum_formatted && (
                  <>
                    <Box component="span"> · </Box>
                    <Box component="span" sx={{ color: "#059669", fontWeight: 600 }}>AUM: {header.aum_formatted}</Box>
                  </>
                )}
                {header.classification && ` · ${header.classification}`}
              </Typography>
            </Box>

            <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
              {header.pnl && (
                <Chip
                  label={`P&L: ${header.pnl}${header.pnl_pct ? ` (${header.pnl_pct})` : ""}`}
                  size="small"
                  sx={{
                    backgroundColor: "#eff6ff",
                    color: "#2563eb",
                    fontWeight: 700,
                    fontSize: 12,
                    height: 30,
                    border: "1px solid #bfdbfe",
                  }}
                />
              )}
              {header.dtd && (
                <Chip
                  label={`DTD: ${header.dtd}`}
                  size="small"
                  sx={{
                    backgroundColor: "#f1f5f9",
                    color: "#475569",
                    fontWeight: 700,
                    fontSize: 12,
                    height: 30,
                    border: "1px solid #e2e8f0",
                  }}
                />
              )}
              <AIPortfolioReviewPDFExporter
                exportContainerId="ai-portfolio-review-content"
                fileName={`AI_Portfolio_Review_${header.date || "report"}.pdf`}
                reportTitle={`US Equity Portfolio AI Review - ${header.report_title || ""}`}
                reportDate={formatDate(header.date)}
                aum={header.aum_formatted || ""}
              />
            </Box>
          </Box>

          {/* Scrollable Content */}
          <Box
            ref={contentRef}
            id="ai-portfolio-review-content"
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

            {orderedSidebar.map((item) => {
              const SectionComponent = sectionComponents[item.key];
              const sectionData = sections[item.key];
              const colors = sectionColors[item.key] || { bg: "#f8fafc", border: "#e2e8f0", iconColor: "#64748b", textColor: "#475569" };
              const isActionMatrixSection = item.key === "final_prioritized_action_matrix";

              return (
                <Box
                  key={item.key}
                  data-section-key={item.key}
                  className="pdf-section"
                  ref={(el: HTMLDivElement | null) => {
                    sectionRefs.current[item.key] = el;
                  }}
                  sx={{ mb: 4 }}
                >
                  {/* Section Header */}
                  <Box
                    sx={{
                      backgroundColor: colors.bg,
                      borderRadius: "12px 12px 0 0",
                      border: `1px solid ${colors.border}`,
                      borderBottom: `2px solid ${colors.border}`,
                      px: 3,
                      py: 1.5,
                      display: "flex",
                      alignItems: "center",
                      gap: 1.5,
                      mb: 0,
                    }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center", minWidth: 28, justifyContent: "center", color: colors.iconColor }}>
                      {sectionIconMap[item.key] || <ViewListOutlinedIcon fontSize="small" />}
                    </Box>
                    <Typography variant="h6" sx={{ fontWeight: 700, fontSize: 16, color: colors.textColor, flex: 1 }}>
                      {item.label}
                    </Typography>
                    {sectionData?.badge && (
                      <Chip
                        label={sectionData.badge}
                        size="small"
                        sx={{
                          fontSize: 11,
                          height: 24,
                          backgroundColor: "#fff",
                          color: colors.textColor,
                          fontWeight: 600,
                          border: `1px solid ${colors.border}`,
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
                          backgroundColor: "#fff",
                          color: colors.textColor,
                          fontWeight: 600,
                          border: `1px solid ${colors.border}`,
                        }}
                      />
                    )}
                  </Box>

                  {/* Section Content */}
                  <Box
                    sx={{
                      backgroundColor: "#fff",
                      border: `1px solid ${colors.border}`,
                      borderTop: "none",
                      borderRadius: "0 0 12px 12px",
                      p: 3,
                    }}
                  >
                    {(() => {
                      if (sectionData == null) {
                        return (
                          <Typography sx={{ fontSize: 13, color: "#94a3b8", fontStyle: "italic" }}>
                            No data available for this section.
                          </Typography>
                        );
                      }
                      if (isActionMatrixSection) {
                        return <ActionMatrix data={sectionData} detailItems={immediateDecisionItems} />;
                      }
                      if (SectionComponent) {
                        return <SectionComponent data={sectionData} />;
                      }
                      return <GenericDataRenderer data={sectionData} />;
                    })()}
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

