import React from "react";
import {
  Box,
  Button,
  Chip,
  FormControl,
  MenuItem,
  Select,
  Stack,
  Switch,
  Typography,
} from "@mui/material";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import SmartToyOutlinedIcon from "@mui/icons-material/SmartToyOutlined";
import dayjs from "dayjs";

export interface AgentConfig {
  title: string;
  description: string;
  schedule: string;
  route?: string;
}

export interface ActiveAgentState {
  enabled: boolean;
  email: boolean;
}

export interface ActiveAgentCardProps {
  agent: AgentConfig;
  state: ActiveAgentState;
  onToggle: (
    agent: AgentConfig,
    key: "enabled" | "email",
    currentValue: boolean
  ) => void;
  agentIndex?: number;
  onRunSentimentClick?: () => void;
  children?: React.ReactNode;
  footerAction?: React.ReactNode;
  lastUpdatedAt?: string | null;

  runSchedule?: string;
  onRunScheduleChange?: (agent: AgentConfig, value: string) => void;
}

const runOptions = [
  "Mon - Fri",
  "Every Monday",
  "Every Tuesday",
  "Every Wednesday",
  "Every Thursday",
  "Every Friday",
];

const dropdownAgents = new Set([
  "Portfolio CIO Agent",
  "Risk Agent",
  "Recent IPOs Agent",
]);

const normalizeScheduleValue = (schedule: string) => schedule;

const ActiveAgentCard: React.FC<ActiveAgentCardProps> = ({
  agent,
  state,
  onToggle,
  agentIndex,
  onRunSentimentClick,
  children,
  footerAction,
  lastUpdatedAt,
  runSchedule,
  onRunScheduleChange,
}) => {
  const statusLabel = state.enabled ? "Active" : "Paused";
  const displayIndex = agentIndex ?? "-";
  const showRunDropdown = dropdownAgents.has(agent.title);
  const selectedRunSchedule = normalizeScheduleValue(
    runSchedule || agent.schedule
  );

  const formattedUpdatedAt = lastUpdatedAt
    ? new Date(lastUpdatedAt).toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : dayjs().format("DD MMM YYYY");

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
          transform: "translateY(-2px)",
        },
      }}
    >
      {/* Top accent bar */}
      <Box sx={{ height: 4, bgcolor: state.enabled ? "#4f46e5" : "#64748b" }} />

      <Box sx={{ p: { xs: 2.5, md: 3 }, display: "flex", flexDirection: "column", gap: 2, flex: 1 }}>
        {/* Header */}
        <Stack direction="row" alignItems="flex-start" justifyContent="space-between">
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <Box
              sx={{
                width: 42,
                height: 42,
                borderRadius: 2.5,
                bgcolor: state.enabled ? "#4f46e5" : "#64748b",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                transition: "background-color 0.3s",
              }}
            >
              <SmartToyOutlinedIcon sx={{ color: "#fff", fontSize: 22 }} />
            </Box>
            <Box>
              <Typography sx={{ fontWeight: 700, fontSize: "0.95rem", color: "#111827", lineHeight: 1.3 }}>
                {agent.title}
              </Typography>
              <Typography sx={{ fontSize: "0.68rem", color: "#4f46e5", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                System Agent
              </Typography>
            </Box>
          </Stack>

          <Stack direction="row" alignItems="center" spacing={1}>
            <Chip
              label={statusLabel}
              size="small"
              sx={{
                fontWeight: 700,
                fontSize: "0.68rem",
                height: 22,
                bgcolor: state.enabled ? "#ecfdf5" : "#e2e8f0",
                color: state.enabled ? "#059669" : "#334155",
                border: "none",
              }}
            />
            <Switch
              checked={state.enabled}
              onClick={(e) => e.stopPropagation()}
              onChange={(e) => {
                e.stopPropagation();
                onToggle(agent, "enabled", e.target.checked);
              }}
              size="small"
              sx={{
                "& .MuiSwitch-switchBase.Mui-checked": { color: "#4f46e5" },
                "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
                  backgroundColor: "#c7d2fe",
                },
              }}
            />
          </Stack>
        </Stack>

        {/* Description */}
        <Typography sx={{ fontSize: "0.82rem", color: "#1e293b", lineHeight: 1.6 }}>
          {agent.description}
        </Typography>

        {children && <Box>{children}</Box>}

        {/* Details section */}
        <Box
          sx={{
            mt: "auto",
            bgcolor: "#eef2ff",
            borderRadius: 3,
            p: 2,
            display: "flex",
            flexDirection: "column",
            gap: 1.2,
          }}
        >
          {/* Schedule / Run dropdown */}
          <Stack direction="row" alignItems="center" spacing={1}>
            <CalendarTodayIcon sx={{ fontSize: 14, color: "#4f46e5" }} />
            <Typography sx={{ fontSize: "0.78rem", fontWeight: 600, color: "#111827" }}>
              Run
            </Typography>
            <Box sx={{ ml: "auto !important" }}>
              {showRunDropdown ? (
                <FormControl size="small">
                  <Select
                    value={selectedRunSchedule}
                    onChange={(e) =>
                      onRunScheduleChange?.(agent, e.target.value)
                    }
                    sx={{
                      height: 28,
                      borderRadius: 2,
                      bgcolor: "#fff",
                      fontSize: "0.78rem",
                      "& .MuiOutlinedInput-notchedOutline": {
                        borderColor: "#c7d2fe",
                      },
                    }}
                  >
                    {runOptions.map((opt) => (
                      <MenuItem key={opt} value={opt}>
                        {opt}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              ) : (
                <Typography sx={{ fontSize: "0.78rem", color: "#1e293b" }}>
                  {agent.schedule}
                </Typography>
              )}
            </Box>

            {onRunSentimentClick && (
              <Button
                size="small"
                startIcon={<PlayArrowIcon sx={{ fontSize: 14 }} />}
                onClick={(e) => {
                  e.stopPropagation();
                  onRunSentimentClick();
                }}
                sx={{
                  textTransform: "none",
                  fontWeight: 600,
                  fontSize: "0.75rem",
                  color: "#4f46e5",
                  borderRadius: 2,
                  ml: 1,
                  "&:hover": { bgcolor: "#eef2ff" },
                }}
              >
                Run
              </Button>
            )}
          </Stack>

          {/* Email output */}
          <Stack direction="row" alignItems="center" spacing={1}>
            <EmailOutlinedIcon
              sx={{
                fontSize: 14,
                color: state.email ? "#059669" : "#475569",
                transition: "color 0.2s",
              }}
            />
            <Typography sx={{ fontSize: "0.78rem", fontWeight: 600, color: "#111827" }}>
              Email Output
            </Typography>
            <Box sx={{ ml: "auto !important" }}>
              <Chip
                label={state.email ? "Enabled" : "Disabled"}
                size="small"
                sx={{
                  fontWeight: 600,
                  fontSize: "0.68rem",
                  height: 22,
                  bgcolor: state.email ? "#ecfdf5" : "#e2e8f0",
                  color: state.email ? "#059669" : "#334155",
                }}
              />
            </Box>
          </Stack>

          {/* Last Updated */}
          <Stack direction="row" alignItems="center" spacing={1}>
            <AccessTimeIcon sx={{ fontSize: 14, color: "#4f46e5" }} />
            <Typography sx={{ fontSize: "0.78rem", fontWeight: 600, color: "#111827" }}>
              Last Updated
            </Typography>
            <Typography sx={{ fontSize: "0.78rem", color: "#1e293b", ml: "auto !important" }}>
              {formattedUpdatedAt}
            </Typography>
          </Stack>
        </Box>

        {footerAction && (
          <Box display="flex" justifyContent="flex-end">
            {footerAction}
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default ActiveAgentCard;
