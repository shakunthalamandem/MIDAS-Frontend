import React from "react";
import { Chip, Divider, Paper, Stack, Switch, Typography } from "@mui/material";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";

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
  onCardClick?: (agent: AgentConfig) => void;
  children?: React.ReactNode;
}

const ActiveAgentCard: React.FC<ActiveAgentCardProps> = ({
  agent,
  state,
  onToggle,
  onCardClick,
  children,
}) => (
  <Paper
    elevation={2}
    onClick={() => onCardClick?.(agent)}
    onKeyDown={(event) => {
      if (!onCardClick) return;
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        onCardClick(agent);
      }
    }}
    role={onCardClick ? "button" : undefined}
    tabIndex={onCardClick ? 0 : -1}
    sx={{
      borderRadius: 4,
      p: 4,
      display: "flex",
      flexDirection: "column",
      gap: 2,
      cursor: onCardClick ? "pointer" : "default",
    }}
  >
    <Stack direction="row" alignItems="center" justifyContent="space-between">
      <Typography variant="h6" sx={{ fontWeight: 700 }}>
        {agent.title}
      </Typography>
      <Switch
        checked={state.enabled}
        onClick={(event) => event.stopPropagation()}
        onChange={(event) => {
          event.stopPropagation();
          onToggle(agent.title, "enabled");
        }}
      />
    </Stack>

    <Typography variant="body2" color="#555f77">
      {agent.description}
    </Typography>

    <Divider />

    <Stack direction="row" flexWrap="wrap" spacing={2}>
      <Chip
        icon={<CalendarTodayIcon />}
        label={agent.schedule}
        variant="outlined"
      />

      <Chip
        label={state.enabled ? "Active" : "Paused"}
        color={state.enabled ? "success" : "default"}
        variant="outlined"
        size="small"
      />

      <Chip
        icon={<EmailOutlinedIcon />}
        label={state.email ? "Email results after run" : "Email disabled"}
        color={state.email ? "success" : "default"}
        variant="outlined"
      />
    </Stack>

    {children}
  </Paper>
);

export default ActiveAgentCard;
