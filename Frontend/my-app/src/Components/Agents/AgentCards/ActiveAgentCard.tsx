import React from "react";
import {
  Box,
  Chip,
  Divider,
  Paper,
  Stack,
  Switch,
  Typography,
} from "@mui/material";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import BoltIcon from "@mui/icons-material/Bolt";

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
  onToggle: (title: string, key: "enabled" | "email") => void;
  agentIndex?: number;
  children?: React.ReactNode;
  footerAction?: React.ReactNode;
}

const ActiveAgentCard: React.FC<ActiveAgentCardProps> = ({
  agent,
  state,
  onToggle,
  agentIndex,
  children,
  footerAction,
}) => {
  const statusLabel = state.enabled ? "Active" : "Paused";
  const statusColor = state.enabled ? "success" : "warning";

  return (
    <Paper
      elevation={3}
      sx={{
        borderRadius: 4,
        p: { xs: 3, md: 4 },
        background: state.enabled
          ? "linear-gradient(135deg, #e8f4ff, #ffffff)"
          : "#ffffff",
        border: "1px solid rgba(15, 76, 129, 0.08)",
        minHeight: 220,
        display: "flex",
        flexDirection: "column",
        gap: 2.5,
        boxShadow: "0 20px 45px rgba(15, 76, 129, 0.08)",
      }}
    >
      <Stack direction="row" alignItems="center" justifyContent="space-between">
        <Stack direction="row" alignItems="center" spacing={1.25}>
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: "50%",
              bgcolor: "primary.light",
              color: "primary.main",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <BoltIcon />
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            {agentIndex && (
              <Box
                sx={{
                  width: 28,
                  height: 28,
                  borderRadius: "50%",
                  bgcolor: "primary.main",
                  color: "#fff",
                  fontSize: "0.8rem",
                  fontWeight: 700,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {agentIndex}
              </Box>
            )}
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              {agent.title}
            </Typography>
          </Box>
        </Stack>
        <Switch
          checked={state.enabled}
          onClick={(event) => event.stopPropagation()}
          onChange={(event) => {
            event.stopPropagation();
            onToggle(agent.title, "enabled");
          }}
        />
      </Stack>

      <Typography variant="body2" color="#555f77" sx={{ minHeight: 60 }}>
        {agent.description}
      </Typography>

      <Divider />

      <Stack direction="row" flexWrap="wrap" spacing={1}>
        <Chip
          icon={<CalendarTodayIcon />}
          label={agent.schedule}
          variant="outlined"
          sx={{ borderRadius: 3, textTransform: "none" }}
        />

        <Chip
          label={statusLabel}
          color={statusColor as "default" | "primary" | "info" | "success" | "error" | "warning"}
          variant="outlined"
          size="small"
          sx={{ borderRadius: 3, textTransform: "none" }}
        />

        <Chip
          icon={<EmailOutlinedIcon />}
          label={state.email ? "Email on run" : "Email disabled"}
          color={state.email ? "success" : "default"}
          variant="outlined"
          sx={{ borderRadius: 3, textTransform: "none" }}
        />
      </Stack>

      {children}

      {footerAction && (
        <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
          {footerAction}
        </Box>
      )}
    </Paper>
  );
};

export default ActiveAgentCard;
