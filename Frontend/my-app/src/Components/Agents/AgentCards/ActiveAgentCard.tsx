import React from "react";
import {
  Box,
  Button,
  Chip,
  Divider,
  Paper,
  Stack,
  Switch,
  Typography,
  Select,
  MenuItem,
  FormControl,
} from "@mui/material";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
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
  "Daily",
  "2 Days",
  "3 Days",
  "4 Days",
  "5 Days",
  "6 Days",
  "Once a Week",
];

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
  const statusColor = state.enabled ? "success" : "warning";
  const displayIndex = agentIndex ?? "-";

  const formattedUpdatedAt = lastUpdatedAt
    ? new Date(lastUpdatedAt).toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : dayjs().format("DD MMM YYYY");

  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: 4,
        p: { xs: 3, md: 4 },
        border: state.enabled
          ? "2px solid rgba(88, 82, 243, 0.35)"
          : "1px solid rgba(88, 79, 255, 0.15)",
        minHeight: 220,
        display: "flex",
        flexDirection: "column",
        gap: 2.5,
      }}
    >
      {/* Header */}
      <Stack direction="row" alignItems="center" justifyContent="space-between">
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: "50%",
              bgcolor: "primary.main",
              color: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 700,
              fontSize: 18,
            }}
          >
            {displayIndex}
          </Box>

          <Typography variant="h6" sx={{ color: "#481f93", fontWeight: 700 }}>
            {agent.title}
          </Typography>
        </Stack>

        <Switch
          checked={state.enabled}
          onClick={(e) => e.stopPropagation()}
          onChange={(e) => {
            e.stopPropagation();
            onToggle(agent, "enabled", state.enabled);
          }}
        />
      </Stack>

      {/* Description */}
      <Box>
        <Typography variant="body2">{agent.description}</Typography>

        {children && <Box mt={1}>{children}</Box>}

        <Divider sx={{ my: 1 }} />
      </Box>

      {/* Info section */}
      <Stack spacing={1}>
        {/* Active */}
        <Stack direction="row" alignItems="center" spacing={1}>
          <Typography sx={{ fontWeight: 600, minWidth: 70 }}>
            Active:
          </Typography>

          <Chip
            label={statusLabel}
            color={
              statusColor as
                | "default"
                | "primary"
                | "info"
                | "success"
                | "error"
                | "warning"
            }
            size="small"
          />
        </Stack>

        {/* Run */}
        <Stack direction="row" alignItems="center" spacing={1}>
          <Typography sx={{ fontWeight: 600, minWidth: 70 }}>
            Run:
          </Typography>

          {agent.title === "Recent IPOs Agent" ? (
            <FormControl size="small">
              <Select
                value={runSchedule || agent.schedule}
                onChange={(e) =>
                  onRunScheduleChange?.(agent, e.target.value)
                }
                sx={{
                  height: 30,
                  borderRadius: 3,
                  bgcolor: "#f6f6ff",
                  fontSize: "0.85rem",
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
            <Chip
              icon={<CalendarTodayIcon />}
              label={agent.schedule}
              size="small"
              sx={{
                bgcolor: "#f6f6ff",
              }}
            />
          )}

          {onRunSentimentClick && (
            <Button
              size="small"
              startIcon={<PlayArrowIcon />}
              onClick={(e) => {
                e.stopPropagation();
                onRunSentimentClick();
              }}
            >
              Run Sentiment
            </Button>
          )}
        </Stack>

        <Stack direction="row" alignItems="center" spacing={1} flexWrap="wrap">
          <Typography
            variant="body2"
            sx={{ fontWeight: 600, color: "#4f5973", minWidth: 60 }}
          >
            Output:
          </Typography>
          <Chip
            icon={<EmailOutlinedIcon />}
            label={state.email ? "Send Email" : "Email Disabled"}
            size="small"
            color={state.email ? "success" : "default"}
          />
        </Stack>

        {/* Last Updated */}
        <Stack direction="row" spacing={1}>
          <Typography sx={{ fontWeight: 600, minWidth: 70 }}>
            Last Updated:
          </Typography>

          <Typography variant="body2">{formattedUpdatedAt}</Typography>
        </Stack>
      </Stack>

      {footerAction && (
        <Box display="flex" justifyContent="flex-end">
          {footerAction}
        </Box>
      )}
    </Paper>
  );
};

export default ActiveAgentCard;