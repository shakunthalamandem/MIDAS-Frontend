import React from "react";
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  IconButton,
  Paper,
  Stack,
  Switch,
  Tooltip,
  Typography,
} from "@mui/material";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import FiberManualRecordIcon from "@mui/icons-material/FiberManualRecord";
import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty";
import { useNavigate } from "react-router-dom";
import { AIAgent, SYSTEM_AGENT_ROUTES, formatSchedule } from "../types";

export interface AgentCardProps {
  agent: AIAgent;
  index: number;
  onEmailToggle: (agent: AIAgent, enabled: boolean) => void;
  onDelete?: (agent: AIAgent) => void;
  onEdit?: (agent: AIAgent) => void;
}

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

  // Determine status badge for user-created agents
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
      // System agents go to their dedicated pages
      window.open(`${window.location.origin}${systemRoute}`, "_blank");
    } else if (isUserCreated) {
      // User-created agents go to the generic output view
      navigate(`/agents/${agent.id}/output`);
    }
  };

  // Status badge config
  const getStatusBadge = () => {
    if (!isUserCreated) {
      // System agents always show "Active"
      return {
        bg: "#e8f5e9",
        color: "#2e7d32",
        dotColor: "#4caf50",
        label: "Active",
        pulse: true,
      };
    }

    if (isWorking) {
      return {
        bg: "#fef3c7",
        color: "#92400e",
        dotColor: "#f59e0b",
        label: "Work in Progress",
        pulse: true,
      };
    }

    if (isReady) {
      return {
        bg: "#e8f5e9",
        color: "#2e7d32",
        dotColor: "#4caf50",
        label: "Ready",
        pulse: false,
      };
    }

    if (isFailed) {
      return {
        bg: "#fee2e2",
        color: "#991b1b",
        dotColor: "#ef4444",
        label: "Failed",
        pulse: false,
      };
    }

    // No output yet — yellow badge
    return {
      bg: "#fef3c7",
      color: "#92400e",
      dotColor: "#f59e0b",
      label: "Awaiting First Run",
      pulse: true,
    };
  };

  const statusBadge = getStatusBadge();

  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: 4,
        p: { xs: 3, md: 4 },
        border: `2px solid ${
          isUserCreated && (isWorking || hasNoOutput)
            ? "rgba(245, 158, 11, 0.35)"
            : "rgba(88, 82, 243, 0.25)"
        }`,
        minHeight: 220,
        display: "flex",
        flexDirection: "column",
        gap: 2,
        transition: "box-shadow 0.2s, border-color 0.2s",
        "&:hover": {
          boxShadow: "0 4px 20px rgba(88, 82, 243, 0.12)",
        },
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
              bgcolor: isUserCreated ? "#e67e22" : "primary.main",
              color: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 700,
              fontSize: 18,
            }}
          >
            {index}
          </Box>

          <Typography variant="h6" sx={{ color: "#481f93", fontWeight: 700 }}>
            {agent.name}
          </Typography>
        </Stack>

        <Stack direction="row" alignItems="center" spacing={1}>
          {/* Status badge */}
          <Stack
            direction="row"
            alignItems="center"
            spacing={0.5}
            sx={{
              bgcolor: statusBadge.bg,
              px: 1.2,
              py: 0.4,
              borderRadius: 5,
            }}
          >
            {isWorking ? (
              <CircularProgress size={10} sx={{ color: statusBadge.dotColor }} />
            ) : (
              <FiberManualRecordIcon
                sx={{
                  fontSize: 10,
                  color: statusBadge.dotColor,
                  ...(statusBadge.pulse
                    ? {
                        animation: "pulse 2s infinite",
                        "@keyframes pulse": {
                          "0%": { opacity: 1 },
                          "50%": { opacity: 0.4 },
                          "100%": { opacity: 1 },
                        },
                      }
                    : {}),
                }}
              />
            )}
            <Typography
              variant="caption"
              sx={{ color: statusBadge.color, fontWeight: 600, fontSize: "0.75rem" }}
            >
              {statusBadge.label}
            </Typography>
          </Stack>

          {isUserCreated && (
            <>
              <Tooltip title="Edit Agent">
                <IconButton size="small" onClick={() => onEdit?.(agent)}>
                  <EditOutlinedIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Delete Agent">
                <IconButton
                  size="small"
                  color="error"
                  onClick={() => onDelete?.(agent)}
                >
                  <DeleteOutlineIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </>
          )}
        </Stack>
      </Stack>

      {/* Description - fixed height so cards align evenly */}
      <Typography
        variant="body2"
        color="text.secondary"
        sx={{
          minHeight: 60,
          display: "-webkit-box",
          WebkitLineClamp: 3,
          WebkitBoxOrient: "vertical",
          overflow: "hidden",
        }}
      >
        {agent.description}
      </Typography>

      {/* Working message for user-created agents with no output */}
      {isUserCreated && (isWorking || hasNoOutput) && (
        <Stack
          direction="row"
          alignItems="center"
          spacing={1}
          sx={{
            bgcolor: "#fef3c7",
            px: 2,
            py: 1,
            borderRadius: 2,
            border: "1px solid #fcd34d",
          }}
        >
          <HourglassEmptyIcon sx={{ fontSize: 18, color: "#f59e0b" }} />
          <Typography variant="caption" sx={{ color: "#92400e", fontWeight: 500 }}>
            {isWorking
              ? "Agent is working and will show you the result soon..."
              : "Agent is scheduled. Results will appear after the first run."}
          </Typography>
        </Stack>
      )}

      <Divider />

      {/* Info section - pushed to bottom */}
      <Stack spacing={1.2} sx={{ mt: "auto" }}>
        {/* Schedule */}
        <Stack direction="row" alignItems="center" spacing={1}>
          <Typography sx={{ fontWeight: 600, minWidth: 100, fontSize: "0.875rem" }}>
            Schedule:
          </Typography>
          <Chip
            icon={<CalendarTodayIcon />}
            label={scheduleLabel}
            size="small"
            sx={{ bgcolor: "#f0f0ff" }}
          />
        </Stack>

        {/* Email toggle */}
        <Stack direction="row" alignItems="center" spacing={1}>
          <Typography sx={{ fontWeight: 600, minWidth: 100, fontSize: "0.875rem" }}>
            Email Me:
          </Typography>
          <Stack direction="row" alignItems="center" spacing={0.5}>
            <EmailOutlinedIcon
              fontSize="small"
              sx={{ color: agent.email_enabled ? "#4caf50" : "#999" }}
            />
            <Switch
              size="small"
              checked={agent.email_enabled ?? false}
              onChange={(e) => onEmailToggle(agent, e.target.checked)}
            />
            <Typography variant="caption" color="text.secondary">
              {agent.email_enabled ? "Enabled" : "Disabled"}
            </Typography>
          </Stack>
        </Stack>

        {/* Last run */}
        <Stack direction="row" alignItems="center" spacing={1}>
          <Typography sx={{ fontWeight: 600, minWidth: 100, fontSize: "0.875rem" }}>
            Last Run:
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {formattedLastRun}
          </Typography>
        </Stack>
      </Stack>

      {/* Footer — View Details button */}
      {(systemRoute || isUserCreated) && (
        <Box display="flex" justifyContent="flex-end" mt="auto">
          <Button
            variant="contained"
            size="small"
            onClick={handleViewDetails}
            sx={{
              textTransform: "none",
              bgcolor: isUserCreated && !isReady ? "#f59e0b" : "#5b2fff",
              "&:hover": {
                bgcolor: isUserCreated && !isReady ? "#d97706" : "#481f93",
              },
            }}
          >
            {isUserCreated && !isReady ? "View Status" : "View Details"}
          </Button>
        </Box>
      )}
    </Paper>
  );
};

export default AgentCard;
