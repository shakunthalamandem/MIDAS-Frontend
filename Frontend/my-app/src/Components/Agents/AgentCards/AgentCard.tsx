import React from "react";
import {
  Box,
  Button,
  CircularProgress,
  IconButton,
  Stack,
  Switch,
  Tooltip,
  Typography,
} from "@mui/material";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import ShieldOutlinedIcon from "@mui/icons-material/ShieldOutlined";
import ShowChartIcon from "@mui/icons-material/ShowChart";
import InsightsIcon from "@mui/icons-material/Insights";
import SentimentSatisfiedAltIcon from "@mui/icons-material/SentimentSatisfiedAlt";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import AssessmentOutlinedIcon from "@mui/icons-material/AssessmentOutlined";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import { useNavigate } from "react-router-dom";
import { AIAgent, SYSTEM_AGENT_ROUTES, formatSchedule } from "../types";

export interface AgentCardProps {
  agent: AIAgent;
  index: number;
  onEmailToggle: (agent: AIAgent, enabled: boolean) => void;
  onDelete?: (agent: AIAgent) => void;
  onEdit?: (agent: AIAgent) => void;
}

/* ── Unique theme per agent by name, with fallback by index ── */
const AGENT_THEMES: Record<string, { accent: string; bg: string; light: string; icon: React.ReactNode }> = {
  "Portfolio Risk Agent": {
    accent: "#4f46e5",
    bg: "#eef2ff",
    light: "#c7d2fe",
    icon: <AccountBalanceIcon sx={{ fontSize: 22, color: "#fff" }} />,
  },
  "Portfolio CIO Agent": {
    accent: "#4f46e5",
    bg: "#eef2ff",
    light: "#c7d2fe",
    icon: <AccountBalanceIcon sx={{ fontSize: 22, color: "#fff" }} />,
  },
  "Risk Agent": {
    accent: "#dc2626",
    bg: "#fef2f2",
    light: "#fecaca",
    icon: <ShieldOutlinedIcon sx={{ fontSize: 22, color: "#fff" }} />,
  },
  "IPO Ranking Agent": {
    accent: "#059669",
    bg: "#ecfdf5",
    light: "#a7f3d0",
    icon: <TrendingUpIcon sx={{ fontSize: 22, color: "#fff" }} />,
  },
  "Deal(IPO) Agent": {
    accent: "#d97706",
    bg: "#fffbeb",
    light: "#fde68a",
    icon: <ShowChartIcon sx={{ fontSize: 22, color: "#fff" }} />,
  },
  "Sentiment Agent": {
    accent: "#7c3aed",
    bg: "#f5f3ff",
    light: "#ddd6fe",
    icon: <SentimentSatisfiedAltIcon sx={{ fontSize: 22, color: "#fff" }} />,
  },
  "Jay Ritter IPO Agent": {
    accent: "#0891b2",
    bg: "#ecfeff",
    light: "#a5f3fc",
    icon: <InsightsIcon sx={{ fontSize: 22, color: "#fff" }} />,
  },
  "JRitter IPO Agent": {
    accent: "#0e7490",
    bg: "#ecfeff",
    light: "#a5f3fc",
    icon: <AssessmentOutlinedIcon sx={{ fontSize: 22, color: "#fff" }} />,
  },
};

/* Override display names/descriptions without changing backend keys */
const AGENT_DISPLAY_NAMES: Record<string, string> = {
  "JRitter IPO Agent": "Gator IPO Agent-2",
};

const AGENT_DISPLAY_DESCRIPTIONS: Record<string, string> = {
  "JRitter IPO Agent": "Academic IPO analysis applying Jay Ritter's research framework. Analyzes pricing, underpricing, and long-term performance of US IPOs.",
};

const FALLBACK_THEMES = [
  { accent: "#6366f1", bg: "#eef2ff", light: "#c7d2fe" },
  { accent: "#ec4899", bg: "#fdf2f8", light: "#fbcfe8" },
  { accent: "#14b8a6", bg: "#f0fdfa", light: "#99f6e4" },
  { accent: "#f97316", bg: "#fff7ed", light: "#fed7aa" },
  { accent: "#8b5cf6", bg: "#f5f3ff", light: "#ddd6fe" },
  { accent: "#06b6d4", bg: "#ecfeff", light: "#a5f3fc" },
];

const AgentCard: React.FC<AgentCardProps> = ({
  agent,
  index,
  onEmailToggle,
  onDelete,
  onEdit,
}) => {
  const navigate = useNavigate();
  const scheduleLabel = formatSchedule(agent);
  const systemRoute = SYSTEM_AGENT_ROUTES[agent.name];
  const isUserCreated = agent.agent_type === "user_created";

  const outputStatus = agent.output_status;
  const isWorking = outputStatus === "pending" || outputStatus === "running";
  const isReady = outputStatus === "completed";
  const isFailed = outputStatus === "failed";
  const hasNoOutput = !outputStatus;

  const formattedLastRun = agent.latest_run
    ? new Date(agent.latest_run).toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "Not yet run";

  const handleViewDetails = () => {
    if (systemRoute) {
      window.open(`${window.location.origin}${systemRoute}`, "_blank");
    } else if (isUserCreated) {
      navigate(`/agents/${agent.id}/output`);
    }
  };

  // Get theme
  const namedTheme = AGENT_THEMES[agent.name];
  const fallback = FALLBACK_THEMES[(index - 1) % FALLBACK_THEMES.length];
  const theme = {
    accent: namedTheme?.accent ?? fallback.accent,
    bg: namedTheme?.bg ?? fallback.bg,
    light: namedTheme?.light ?? fallback.light,
    icon: namedTheme?.icon ?? (
      <PersonOutlineIcon sx={{ fontSize: 22, color: "#fff" }} />
    ),
  };

  /* ── Status ── */
  const getStatus = () => {
    if (!isUserCreated)
      return { color: "#059669", bg: "#ecfdf5", label: "Active" };
    if (isWorking)
      return { color: "#d97706", bg: "#fffbeb", label: "Working" };
    if (isReady)
      return { color: "#059669", bg: "#ecfdf5", label: "Ready" };
    if (isFailed)
      return { color: "#dc2626", bg: "#fef2f2", label: "Failed" };
    return { color: "#d97706", bg: "#fffbeb", label: "Awaiting" };
  };
  const status = getStatus();

  return (
    <Box
      sx={{
        bgcolor: "#fff",
        borderRadius: 4,
        border: "1px solid #c7d2fe",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        transition: "box-shadow 0.25s ease, transform 0.25s ease",
        "&:hover": {
          boxShadow: "0 8px 30px rgba(79,70,229,0.15)",
          transform: "translateY(-3px)",
        },
      }}
    >
      {/* ── Colored top accent bar ── */}
      <Box sx={{ height: 4, bgcolor: theme.accent }} />

      {/* ── Card body ── */}
      <Box sx={{ p: { xs: 2.5, md: 3 }, display: "flex", flexDirection: "column", gap: 2, flex: 1 }}>
        {/* Header */}
        <Stack direction="row" alignItems="flex-start" justifyContent="space-between">
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <Box
              sx={{
                width: 42,
                height: 42,
                borderRadius: 2.5,
                bgcolor: theme.accent,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              {theme.icon}
            </Box>
            <Box sx={{ minWidth: 0 }}>
              <Typography
                sx={{
                  fontWeight: 700,
                  fontSize: "0.95rem",
                  color: "#111827",
                  lineHeight: 1.3,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  maxWidth: 190,
                }}
              >
                {AGENT_DISPLAY_NAMES[agent.name] ?? agent.name}
              </Typography>
              <Typography
                sx={{
                  fontSize: "0.68rem",
                  color: "#4f46e5",
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                }}
              >
                {isUserCreated ? "Custom" : "System"}
              </Typography>
            </Box>
          </Stack>

          <Stack direction="row" alignItems="center" spacing={0.5}>
            {/* Status badge */}
            <Box
              sx={{
                display: "inline-flex",
                alignItems: "center",
                gap: 0.5,
                bgcolor: status.bg,
                px: 1.2,
                py: 0.3,
                borderRadius: 2,
              }}
            >
              {isWorking ? (
                <CircularProgress size={8} sx={{ color: status.color }} />
              ) : (
                <Box
                  sx={{
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    bgcolor: status.color,
                  }}
                />
              )}
              <Typography sx={{ fontSize: "0.68rem", fontWeight: 700, color: status.color }}>
                {status.label}
              </Typography>
            </Box>

            {isUserCreated && (
              <>
                <Tooltip title="Edit" arrow>
                  <IconButton
                    size="small"
                    onClick={() => onEdit?.(agent)}
                    sx={{ color: "#475569", "&:hover": { color: "#4f46e5" } }}
                  >
                    <EditOutlinedIcon sx={{ fontSize: 16 }} />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Delete" arrow>
                  <IconButton
                    size="small"
                    onClick={() => onDelete?.(agent)}
                    sx={{ color: "#475569", "&:hover": { color: "#dc2626" } }}
                  >
                    <DeleteOutlineIcon sx={{ fontSize: 16 }} />
                  </IconButton>
                </Tooltip>
              </>
            )}
          </Stack>
        </Stack>

        {/* Description */}
        <Typography
          sx={{
            fontSize: "0.82rem",
            color: "#1e293b",
            lineHeight: 1.6,
            display: "-webkit-box",
            WebkitLineClamp: 3,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
            minHeight: 52,
          }}
        >
          {AGENT_DISPLAY_DESCRIPTIONS[agent.name] ?? agent.description}
        </Typography>

        {/* Prompt preview for user-created agents */}
        {isUserCreated && (agent.final_prompt || agent.prompt) && (
          <Box
            sx={{
              bgcolor: "#f8fafc",
              borderRadius: 2,
              border: "1px solid #e2e8f0",
              px: 1.5,
              py: 1,
            }}
          >
            <Typography
              sx={{
                fontSize: "0.65rem",
                fontWeight: 700,
                color: "#4f46e5",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                mb: 0.3,
              }}
            >
              Prompt
            </Typography>
            <Typography
              sx={{
                fontSize: "0.75rem",
                color: "#475569",
                lineHeight: 1.5,
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
              }}
            >
              {agent.final_prompt || agent.prompt}
            </Typography>
          </Box>
        )}

        {/* Working notice */}
        {isUserCreated && (isWorking || hasNoOutput) && (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              bgcolor: "#fffbeb",
              px: 1.5,
              py: 0.8,
              borderRadius: 2,
              border: "1px solid #fde68a",
            }}
          >
            <HourglassEmptyIcon sx={{ fontSize: 14, color: "#d97706" }} />
            <Typography sx={{ fontSize: "0.72rem", color: "#92400e", fontWeight: 500 }}>
              {isWorking
                ? "Working — results coming soon..."
                : "Scheduled. Results after first run."}
            </Typography>
          </Box>
        )}

        {/* ── Details section ── */}
        <Box
          sx={{
            mt: "auto",
            bgcolor: theme.bg,
            borderRadius: 3,
            p: 2,
            display: "flex",
            flexDirection: "column",
            gap: 1.2,
          }}
        >
          {/* Schedule */}
          <Stack direction="row" alignItems="center" spacing={1}>
            <CalendarTodayIcon sx={{ fontSize: 14, color: theme.accent }} />
            <Typography sx={{ fontSize: "0.78rem", fontWeight: 600, color: "#111827" }}>
              Schedule
            </Typography>
            <Typography sx={{ fontSize: "0.78rem", color: "#1e293b", fontWeight: 500, ml: "auto !important" }}>
              {scheduleLabel}
            </Typography>
          </Stack>

          {/* Last Run */}
          <Stack direction="row" alignItems="center" spacing={1}>
            <AccessTimeIcon sx={{ fontSize: 14, color: theme.accent }} />
            <Typography sx={{ fontSize: "0.78rem", fontWeight: 600, color: "#111827" }}>
              Last Run
            </Typography>
            <Typography sx={{ fontSize: "0.78rem", color: "#1e293b", fontWeight: 500, ml: "auto !important" }}>
              {formattedLastRun}
            </Typography>
          </Stack>

          {/* Email */}
          <Stack direction="row" alignItems="center" spacing={1}>
            <EmailOutlinedIcon
              sx={{
                fontSize: 14,
                color: agent.email_enabled ? "#059669" : "#475569",
                transition: "color 0.2s",
              }}
            />
            <Typography sx={{ fontSize: "0.78rem", fontWeight: 600, color: "#111827" }}>
              Email Alerts
            </Typography>
            <Box sx={{ ml: "auto !important" }}>
              <Switch
                size="small"
                checked={agent.email_enabled ?? false}
                onChange={(e) => onEmailToggle(agent, e.target.checked)}
                sx={{
                  "& .MuiSwitch-switchBase.Mui-checked": { color: theme.accent },
                  "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
                    backgroundColor: theme.light,
                  },
                }}
              />
            </Box>
          </Stack>
        </Box>

        {/* ── CTA Button ── */}
        {(systemRoute || isUserCreated) && (
          <Button
            fullWidth
            onClick={handleViewDetails}
            endIcon={<OpenInNewIcon sx={{ fontSize: 15 }} />}
            sx={{
              textTransform: "none",
              fontWeight: 700,
              fontSize: "0.82rem",
              py: 1,
              borderRadius: 2.5,
              color: theme.accent,
              bgcolor: theme.bg,
              border: `1px solid ${theme.light}`,
              transition: "all 0.2s ease",
              "&:hover": {
                bgcolor: theme.accent,
                color: "#fff",
                borderColor: theme.accent,
              },
            }}
          >
            {isUserCreated && !isReady ? "View Status" : "View Details"}
          </Button>
        )}
      </Box>
    </Box>
  );
};

export default AgentCard;
