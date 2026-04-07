import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import {
  Autocomplete,
  Box,
  Typography,
  CircularProgress,
  IconButton,
  Chip,
  Container,
  TextField,
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
import AutoGraphOutlinedIcon from "@mui/icons-material/AutoGraphOutlined";
import ShieldOutlinedIcon from "@mui/icons-material/ShieldOutlined";
import TrendingUpOutlinedIcon from "@mui/icons-material/TrendingUpOutlined";

import ExecutiveDashboard from "./sections/ExecutiveDashboard";
import CIODecisionBrief from "./sections/CIODecisionBrief";
import { extractImmediateDecisionItems } from "./sections/ImmediateDecisions";
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
import MacroRegimeSectorRotation from "./sections/MacroRegimeSectorRotation";
import AIPortfolioReviewPDFExporter from "./AIPortfolioReviewPDFExporter";

const apiUrl = process.env.REACT_APP_API_URL;

// ═══════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════

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

export type ActiveTab = "portfolio" | "risk";

// ═══════════════════════════════════════════════════════
// Tab section definitions (CIO-optimized order)
// ═══════════════════════════════════════════════════════

interface TabSectionDef {
  key: string;
  label: string;
}

const PORTFOLIO_SECTIONS: TabSectionDef[] = [
  { key: "executive_risk_dashboard", label: "Portfolio Overview" },
  { key: "final_prioritized_action_matrix", label: "Action Matrix" },
  { key: "base_model_discipline_scorecard", label: "Discipline Scorecard" },
  // { key: "cio_decision_brief", label: "CIO Decision Brief" },
  // { key: "immediate_decisions", label: "Immediate Decisions" },
  { key: "technical_risk_overlay", label: "Technical Risk Overlay" },
  // { key: "opportunity_engine", label: "Opportunity Engine" },
  { key: "sector_peer_news_map", label: "Sector & Peer News" },
];

const RISK_SECTIONS: TabSectionDef[] = [
  { key: "executive_portfolio_overview", label: "Portfolio Overview" },
  { key: "executive_risk_dashboard", label: "Risk Dashboard" },
  { key: "base_model_discipline_scorecard", label: "Discipline Scorecard" },
  { key: "sector_peer_news_map", label: "Sector & Peer News" },
  { key: "macro_event_risk_calendar", label: "Macro & Event Risk Calendar" },
  // { key: "macro_regime_sector_rotation_model", label: "Macro Regime & Sector Rotation" },
  // { key: "upcoming_week_focus", label: "Upcoming Week Focus" },
  // { key: "upcoming_month_strategic_outlook", label: "Monthly Strategic Outlook" },
];

// ═══════════════════════════════════════════════════════
// Icons & colors per section
// ═══════════════════════════════════════════════════════

const sectionIconMap: Record<string, React.ReactNode> = {
  executive_portfolio_overview: <TrendingUpOutlinedIcon fontSize="small" />,
  executive_risk_dashboard: <BarChartOutlinedIcon fontSize="small" />,
  cio_decision_brief: <CampaignOutlinedIcon fontSize="small" />,
  immediate_decisions: <BoltOutlinedIcon fontSize="small" />,
  base_model_discipline_scorecard: <FactCheckOutlinedIcon fontSize="small" />,
  sector_peer_news_map: <PublicOutlinedIcon fontSize="small" />,
  macro_event_risk_calendar: <CalendarMonthOutlinedIcon fontSize="small" />,
  technical_risk_overlay: <ShowChartOutlinedIcon fontSize="small" />,
  macro_regime_sector_rotation_model: <AutoGraphOutlinedIcon fontSize="small" />,
  opportunity_engine: <TrackChangesOutlinedIcon fontSize="small" />,
  upcoming_week_focus: <ScheduleOutlinedIcon fontSize="small" />,
  upcoming_month_strategic_outlook: <EventNoteOutlinedIcon fontSize="small" />,
  role_specific_action_checklists: <GroupsOutlinedIcon fontSize="small" />,
  final_prioritized_action_matrix: <ViewListOutlinedIcon fontSize="small" />,
};

const sectionColors: Record<string, { bg: string; border: string; iconColor: string; textColor: string }> = {
  executive_portfolio_overview: { bg: "#eff6ff", border: "#bfdbfe", iconColor: "#2563eb", textColor: "#1e40af" },
  executive_risk_dashboard: { bg: "#eff6ff", border: "#bfdbfe", iconColor: "#2563eb", textColor: "#1e40af" },
  cio_decision_brief: { bg: "#fffbeb", border: "#fde68a", iconColor: "#d97706", textColor: "#92400e" },
  immediate_decisions: { bg: "#fef2f2", border: "#fecaca", iconColor: "#dc2626", textColor: "#991b1b" },
  base_model_discipline_scorecard: { bg: "#faf5ff", border: "#e9d5ff", iconColor: "#7c3aed", textColor: "#5b21b6" },
  sector_peer_news_map: { bg: "#eff6ff", border: "#bfdbfe", iconColor: "#0284c7", textColor: "#075985" },
  macro_event_risk_calendar: { bg: "#eff6ff", border: "#bfdbfe", iconColor: "#2563eb", textColor: "#1e40af" },
  technical_risk_overlay: { bg: "#ecfeff", border: "#a5f3fc", iconColor: "#0891b2", textColor: "#155e75" },
  macro_regime_sector_rotation_model: { bg: "#fdf2f8", border: "#fecdd3", iconColor: "#be185d", textColor: "#831843" },
  opportunity_engine: { bg: "#ecfdf5", border: "#a7f3d0", iconColor: "#059669", textColor: "#065f46" },
  upcoming_week_focus: { bg: "#fff7ed", border: "#fed7aa", iconColor: "#ea580c", textColor: "#9a3412" },
  upcoming_month_strategic_outlook: { bg: "#faf5ff", border: "#e9d5ff", iconColor: "#7c3aed", textColor: "#5b21b6" },
  role_specific_action_checklists: { bg: "#ecfdf5", border: "#a7f3d0", iconColor: "#059669", textColor: "#065f46" },
  final_prioritized_action_matrix: { bg: "#eef2ff", border: "#c7d2fe", iconColor: "#4f46e5", textColor: "#3730a3" },
};

// Risk-tab overrides for executive_risk_dashboard (red tint instead of blue)
const riskDashboardColors = { bg: "#fef2f2", border: "#fecaca", iconColor: "#dc2626", textColor: "#991b1b" };

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const sectionComponents: Partial<Record<string, React.FC<any>>> = {
  executive_risk_dashboard: ExecutiveDashboard,
  final_prioritized_action_matrix: ActionMatrix,
  cio_decision_brief: CIODecisionBrief,
  immediate_decisions: ImmediateDecisions,
  base_model_discipline_scorecard: DisciplineScorecard,
  sector_peer_news_map: SectorNewsMap,
  macro_event_risk_calendar: MacroEvents,
  technical_risk_overlay: TechnicalOverlay,
  macro_regime_sector_rotation_model: MacroRegimeSectorRotation,
  opportunity_engine: OpportunityEngine,
  upcoming_week_focus: WeeklyFocus,
  upcoming_month_strategic_outlook: MonthlyOutlook,
  role_specific_action_checklists: ActionChecklists,
};

// ═══════════════════════════════════════════════════════
// Layout constants
// ═══════════════════════════════════════════════════════

const SIDEBAR_WIDTH = 240;
const SIDEBAR_COLLAPSED = 60;
const LAYOUT_CHROME_HEIGHT = 160;

// ═══════════════════════════════════════════════════════
// KPI extraction helpers
// ═══════════════════════════════════════════════════════

interface KpiItem {
  label: string;
  value: string;
  color: string;
}

const extractKpis = (sections: Record<string, any>): KpiItem[] => {
  const dashboard = sections?.executive_risk_dashboard;
  if (!dashboard) return [];

  const metrics: any[] = dashboard.metric_cards || dashboard.metrics || [];
  const kpis: KpiItem[] = [];

  const findMetric = (keywords: string[]): any | undefined =>
    metrics.find((m: any) => {
      const label = (m.label || m.title || m.name || "").toLowerCase();
      return keywords.some((kw) => label.includes(kw));
    });

  const dtd = findMetric(["dtd"]);
  if (dtd) kpis.push({ label: "DTD P&L", value: dtd.value, color: String(dtd.value || "").includes("-") ? "#dc2626" : "#059669" });

  // Cumulative P&L removed from header KPIs

  const exp = findMetric(["total long exposure", "total exposure"]);
  if (exp) kpis.push({ label: "Exposure", value: exp.value, color: "#2563eb" });

  // const risk = findMetric(["capital at risk"]);
  // if (risk) kpis.push({ label: "Cap Risk", value: risk.value, color: "#dc2626" });

  return kpis;
};

// ═══════════════════════════════════════════════════════
// Component
// ═══════════════════════════════════════════════════════

interface PortfolioReportDocumentMainProps {
  selectedReport?: ReportListItem | null;
  reportList?: ReportListItem[];
  reportListLoading?: boolean;
  onSelectReport?: (report: ReportListItem | null) => void;
  reviewMode?: ActiveTab;
}

const PortfolioReportDocumentMain: React.FC<PortfolioReportDocumentMainProps> = ({
  selectedReport: externalReport,
  reportList = [],
  reportListLoading = false,
  onSelectReport,
  reviewMode = "portfolio",
}) => {
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const activeTab: ActiveTab = reviewMode;
  const [activeSection, setActiveSection] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const contentRef = useRef<HTMLDivElement | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Current tab sections
  const tabSections = useMemo(
    () => (activeTab === "portfolio" ? PORTFOLIO_SECTIONS : RISK_SECTIONS),
    [activeTab]
  );

  // React to external report selection
  useEffect(() => {
    if (externalReport) {
      fetchReportData(externalReport);
    } else {
      setReportData(null);
    }
  }, [externalReport]);

  // IntersectionObserver — re-init when tab or data changes
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

    // Only observe sections in the active tab
    tabSections.forEach(({ key }) => {
      const el = sectionRefs.current[key];
      if (el) observerRef.current!.observe(el);
    });

    return () => observerRef.current?.disconnect();
  }, [reportData, activeTab, tabSections]);

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
      const sections = reviewMode === "portfolio" ? PORTFOLIO_SECTIONS : RISK_SECTIONS;
      setActiveSection(sections[0].key);
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

  const formatDateShort = (dateStr: string) => {
    try {
      const d = new Date(dateStr + "T00:00:00");
      return d.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
    } catch {
      return dateStr;
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr + "T00:00:00");
      return d.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
    } catch {
      return dateStr;
    }
  };

  // ─── Reusable report search dropdown ───
  const reportSearchDropdown = onSelectReport && reportList.length > 0 ? (
    <Autocomplete
      options={reportList}
      getOptionLabel={(opt) => `${opt.report_title} — ${opt.date}`}
      value={externalReport ?? null}
      onChange={(_, val) => onSelectReport(val)}
      loading={reportListLoading}
      size="small"
      sx={{
        width: 300,
        "& .MuiOutlinedInput-root": { borderRadius: 2, backgroundColor: "#fff", fontSize: 12, py: "2px" },
      }}
      renderOption={(props, option) => (
        <Box component="li" {...props} key={option.id}>
          <Box>
            <Typography sx={{ fontSize: 13, fontWeight: 700, color: "#002060" }}>
              {option.report_title}
            </Typography>
            <Typography sx={{ fontSize: 11, color: "#64748b" }}>
              {formatDateShort(option.date)}
            </Typography>
          </Box>
        </Box>
      )}
      renderInput={(params) => (
        <TextField
          {...params}
          placeholder="Search reports..."
          size="small"
          InputProps={{
            ...params.InputProps,
            endAdornment: (
              <>
                {reportListLoading && <CircularProgress size={16} />}
                {params.InputProps.endAdornment}
              </>
            ),
          }}
        />
      )}
    />
  ) : null;

  // ─── No report selected ───
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
          US Equity Portfolio AI Review
        </Typography>
        <Typography sx={{ color: "#64748b", fontSize: 14, mb: 2 }}>
          Select a report to begin
        </Typography>
        {reportSearchDropdown}
        {error && (
          <Typography sx={{ color: "#ef4444", fontSize: 13, mt: 2 }}>{error}</Typography>
        )}
      </Box>
    );
  }

  // ─── Loading ───
  if (loading) {
    return (
      <Box sx={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Box sx={{ textAlign: "center" }}>
          <CircularProgress sx={{ color: "#2563eb", mb: 2 }} />
          <Typography sx={{ color: "#64748b" }}>Loading report...</Typography>
        </Box>
      </Box>
    );
  }

  // ─── Report loaded: 2-tab viewer ───
  const header = reportData!.header;
  const sections = reportData!.sections;
  const immediateDecisionItems = extractImmediateDecisionItems(sections.immediate_decisions);
  const kpis = extractKpis(sections);
  const sw = sidebarOpen ? SIDEBAR_WIDTH : SIDEBAR_COLLAPSED;
  const tabLabel = activeTab === "portfolio" ? "Portfolio Review" : "Risk Review";

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
        {/* ═══════ Sidebar ═══════ */}
        <Box
          sx={{
            width: 100,
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
                background: activeTab === "portfolio"
                  ? "linear-gradient(135deg, #2563eb, #3b82f6)"
                  : "linear-gradient(135deg, #dc2626, #ef4444)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "background 0.3s ease",
              }}
            >
              {activeTab === "portfolio" ? (
                <TrendingUpOutlinedIcon sx={{ color: "#fff", fontSize: 18 }} />
              ) : (
                <ShieldOutlinedIcon sx={{ color: "#fff", fontSize: 18 }} />
              )}
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
                {activeTab === "portfolio" ? "PORTFOLIO" : "RISK"}
              </Typography>
            )}
            <IconButton
              size="small"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              sx={{ ml: sidebarOpen ? 0 : "auto", mr: sidebarOpen ? 0 : "auto", color: "#94a3b8", "&:hover": { color: "#475569" } }}
            >
              {sidebarOpen ? <ChevronLeftIcon fontSize="small" /> : <ChevronRightIcon fontSize="small" />}
            </IconButton>
          </Box>

          {/* Nav Items — filtered by active tab */}
          <Box sx={{ flex: 1, overflowY: "auto", py: 0.5 }}>
            {tabSections.map((item) => {
              const isActive = activeSection === item.key;
              const accentColor = activeTab === "portfolio" ? "#2563eb" : "#dc2626";
              const activeBg = activeTab === "portfolio" ? "#dbeafe" : "#fee2e2";
              return (
                <Box
                  key={`${activeTab}-${item.key}`}
                  onClick={() => scrollToSection(item.key)}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1.5,
                    px: sidebarOpen ? 2 : 0,
                    py: 1.1,
                    cursor: "pointer",
                    borderLeft: isActive ? `3px solid ${accentColor}` : "3px solid transparent",
                    backgroundColor: isActive ? activeBg : "transparent",
                    color: "#002060",
                    transition: "all 0.2s",
                    justifyContent: sidebarOpen ? "flex-start" : "center",
                    "&:hover": {
                      backgroundColor: isActive ? activeBg : "#e0e7ff",
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

        {/* ═══════ Main Content ═══════ */}
        <Box sx={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>

          {/* ─── Sticky Header with KPIs ─── */}
          <Box
            sx={{
              px: 3,
              py: 1.5,
              borderBottom: "1px solid #c7d2fe",
              backgroundColor: "#eef2ff",
            }}
          >
            {/* Title Row: Export left | Title center | Search right */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
              {/* Left — export PDF */}
              <AIPortfolioReviewPDFExporter
                exportContainerId="ai-portfolio-review-content"
                fileName={`AI_${tabLabel.replace(/ /g, "_")}_${header.date || "report"}.pdf`}
                reportTitle={`US Equity Portfolio AI Review — ${tabLabel}`}
                reportDate={formatDate(header.date)}
                aum={header.aum_formatted || ""}
              />

              {/* Center — title + meta */}
              <Box sx={{ flex: 1, textAlign: "center", minWidth: 0 }}>
                <Typography sx={{ fontWeight: 800, fontSize: 16, color: "#7236a9", whiteSpace: "nowrap" }}>
                  US Equity Portfolio AI Review
                </Typography>
                <Typography
                  sx={{
                    color: "#94a3b8",
                    fontSize: 11.5,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 0.5,
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

              {/* Right — report search */}
              {reportSearchDropdown}
            </Box>

            {/* KPI Chips Row */}
            {kpis.length > 0 && (
              <Box sx={{ display: "flex", justifyContent: "center", gap: 1.5, mt: 1.5 }}>
                {kpis.map((kpi, i) => (
                  <Box
                    key={i}
                    sx={{
                      px: 2,
                      py: 0.8,
                      borderRadius: 2,
                      border: "1px solid #e2e8f0",
                      backgroundColor: "#fff",
                      textAlign: "center",
                      minWidth: 110,
                    }}
                  >
                    <Typography sx={{ fontSize: 10, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: 0.8 }}>
                      {kpi.label}
                    </Typography>
                    <Typography sx={{ fontSize: 16, fontWeight: 700, color: kpi.color, fontFamily: "monospace" }}>
                      {kpi.value}
                    </Typography>
                  </Box>
                ))}
              </Box>
            )}

            {/* Tab switcher moved to top-level AIPortfolioReview */}
          </Box>

          {/* ─── Scrollable Section Content ─── */}
          <Box
            ref={contentRef}
            id="ai-portfolio-review-content"
            sx={{ flex: 1, overflowY: "auto", px: 3, py: 3 }}
          >
            {error && (
              <Typography sx={{ color: "#ef4444", mb: 2 }}>{error}</Typography>
            )}

            {tabSections.map((item) => {
              const SectionComponent = sectionComponents[item.key];
              const sectionData = sections[item.key];
              // Use risk-tinted colors for executive_risk_dashboard on risk tab
              const isRiskDashboard = item.key === "executive_risk_dashboard" && activeTab === "risk";
              const colors = isRiskDashboard
                ? riskDashboardColors
                : (sectionColors[item.key] || { bg: "#f8fafc", border: "#e2e8f0", iconColor: "#64748b", textColor: "#475569" });
              const isActionMatrixSection = item.key === "final_prioritized_action_matrix";
              const isExecutiveDashboard = item.key === "executive_risk_dashboard";
              const isPortfolioOverview = item.key === "executive_portfolio_overview";
              const effectiveSectionData = isPortfolioOverview ? sections["executive_risk_dashboard"] : sectionData;

              return (
                <Box
                  key={`${activeTab}-${item.key}`}
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
                      {isRiskDashboard
                        ? <ShieldOutlinedIcon fontSize="small" />
                        : (sectionIconMap[item.key] || <ViewListOutlinedIcon fontSize="small" />)}
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
                      if (effectiveSectionData == null) {
                        return (
                          <Typography sx={{ fontSize: 13, color: "#94a3b8", fontStyle: "italic" }}>
                            No data available for this section.
                          </Typography>
                        );
                      }
                      if (isPortfolioOverview) {
                        return <ExecutiveDashboard data={effectiveSectionData} variant="portfolio" />;
                      }
                      if (isActionMatrixSection) {
                        return <ActionMatrix data={effectiveSectionData} detailItems={immediateDecisionItems} />;
                      }
                      if (isExecutiveDashboard) {
                        return <ExecutiveDashboard data={effectiveSectionData} variant={activeTab} />;
                      }
                      if (SectionComponent) {
                        return <SectionComponent data={effectiveSectionData} />;
                      }
                      return <GenericDataRenderer data={effectiveSectionData} />;
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
