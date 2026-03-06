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
  onToggle: (agent: AgentConfig, key: "enabled" | "email", currentValue: boolean) => void;
  agentIndex?: number;
  onRunSentimentClick?: () => void;
  children?: React.ReactNode;
  footerAction?: React.ReactNode;
  lastUpdatedAt?: string | null;
}

const ActiveAgentCard: React.FC<ActiveAgentCardProps> = ({
  agent,
  state,
  onToggle,
  agentIndex,
  onRunSentimentClick,
  children,
  footerAction,
  lastUpdatedAt,
}) => {
  const statusLabel = state.enabled ? "Active" : "Paused";
  const statusColor = state.enabled ? "success" : "warning";
  const displayIndex = agentIndex ?? "-";

  const formattedUpdatedAt = lastUpdatedAt
    ? new Date(lastUpdatedAt).toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        // hour: "2-digit",
        // minute: "2-digit",
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
        boxShadow: state.enabled
          ? "0 20px 40px rgba(79, 101, 182, 0.08)"
          : "0 20px 40px rgba(79, 101, 182, 0.03)",
      }}
    >
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
          onClick={(event) => event.stopPropagation()}
          onChange={(event) => {
            event.stopPropagation();
            onToggle(agent, "enabled", state.enabled);
          }}
        />
      </Stack>

      <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
        <Typography variant="body2" color="#2f323a">
          {agent.description}
        </Typography>

        {children && <Box sx={{ mt: 0, mb: 0 }}>{children}</Box>}

        <Divider sx={{ borderColor: "rgba(79, 101, 182, 0.2)", my: 0 }} />
      </Box>

      <Stack spacing={1} sx={{ mt: 1 }}>
        <Stack direction="row" alignItems="center" spacing={1} flexWrap="wrap">
          <Typography
            variant="body2"
            sx={{ fontWeight: 600, color: "#4f5973", minWidth: 60 }}
          >
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
            variant="outlined"
            size="small"
            sx={{ borderRadius: 3, textTransform: "none" }}
          />
        </Stack>

        <Stack direction="row" alignItems="center" spacing={1} flexWrap="wrap">
          <Typography
            variant="body2"
            sx={{ fontWeight: 600, color: "#715579", minWidth: 60 }}
          >
            Run:
          </Typography>
          <Chip
            icon={<CalendarTodayIcon />}
            label={agent.schedule}
            variant="filled"
            sx={{
              borderRadius: 3,
              textTransform: "none",
              bgcolor: "#f6f6ff",
              color: "#3f467a",
            }}
            size="small"
          />
          {onRunSentimentClick && (
            <Button
              variant="outlined"
              size="small"
              startIcon={<PlayArrowIcon />}
              sx={{
                borderRadius: 3,
                textTransform: "none",
                fontWeight: 600,
                letterSpacing: 0.5,
              }}
              onClick={(event) => {
                event.stopPropagation();
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
            label={state.email ? "Send Email" : "Email disabled"}
            color={state.email ? "success" : "default"}
            variant="outlined"
            sx={{ borderRadius: 3, textTransform: "none" }}
          />
        </Stack>

        <Stack direction="row" alignItems="flex-start" spacing={1} flexWrap="wrap">
          <Typography
            variant="body2"
            sx={{ fontWeight: 600, color: "#4f5973", minWidth: 60 }}
          >
            Last Updated:
          </Typography>
          <Typography variant="body2" sx={{ color: "#2e3035" }}>
            {formattedUpdatedAt}
          </Typography>
        </Stack>
      </Stack>

      {footerAction && (
        <Box sx={{ display: "flex", justifyContent: "flex-end"}}>
          {footerAction}
        </Box>
      )}
    </Paper>
  );
};

export default ActiveAgentCard;