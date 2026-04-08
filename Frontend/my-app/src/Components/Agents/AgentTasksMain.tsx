import React, { useState, useCallback } from "react";
import { Box, Typography, Chip, Tooltip, LinearProgress } from "@mui/material";
import { motion, AnimatePresence as FramerAnimatePresence } from "framer-motion";
import PlayArrowRoundedIcon from "@mui/icons-material/PlayArrowRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import ErrorRoundedIcon from "@mui/icons-material/ErrorRounded";
import HourglassTopRoundedIcon from "@mui/icons-material/HourglassTopRounded";
import BarChartRoundedIcon from "@mui/icons-material/BarChartRounded";
import CloudUploadRoundedIcon from "@mui/icons-material/CloudUploadRounded";
import BoltRoundedIcon from "@mui/icons-material/BoltRounded";

// Framer Motion v11 + React 18 type workaround
const AnimatePresence = FramerAnimatePresence as React.FC<{
  children?: React.ReactNode;
  mode?: "wait" | "sync" | "popLayout";
  initial?: boolean;
}>;

const apiUrl = process.env.REACT_APP_API_URL;

function authHeaders(): Record<string, string> {
  const token = localStorage.getItem("access_token");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

type TaskStatus = "idle" | "running" | "completed" | "failed";

interface AgentTask {
  id: string;
  label: string;
  description: string;
  endpoint: string;
  icon: React.ReactNode;
  gradient: string;
  accentColor: string;
  glowColor: string;
}

const AGENT_TASKS: AgentTask[] = [
  {
    id: "daily_risk_report",
    label: "Daily Risk Report",
    description:
      "Triggers the full portfolio risk analysis pipeline — computes VaR, drawdown metrics, and generates the daily risk report PDF.",
    endpoint: "/api/trigger_daily_risk_report/",
    icon: <BarChartRoundedIcon sx={{ fontSize: 36 }} />,
    gradient: "linear-gradient(135deg, #1a1a3e 0%, #0d2b4e 100%)",
    accentColor: "#4fc3f7",
    glowColor: "rgba(79, 195, 247, 0.35)",
  },
  {
    id: "market_data_upload",
    label: "Market Data Upload",
    description:
      "Fetches and uploads the latest market data feeds — equities, FX rates, and index constituents — into the data warehouse.",
    endpoint: "/api/trigger_market_data_upload/",
    icon: <CloudUploadRoundedIcon sx={{ fontSize: 36 }} />,
    gradient: "linear-gradient(135deg, #1a2e1a 0%, #0d3b2b 100%)",
    accentColor: "#69f0ae",
    glowColor: "rgba(105, 240, 174, 0.35)",
  },
];

interface TaskState {
  status: TaskStatus;
  message: string;
  lastRun: string | null;
}

const statusConfig: Record<
  TaskStatus,
  { label: string; color: string; icon: React.ReactNode }
> = {
  idle: {
    label: "Ready",
    color: "#90a4ae",
    icon: <BoltRoundedIcon sx={{ fontSize: 14 }} />,
  },
  running: {
    label: "Running",
    color: "#ffb74d",
    icon: <HourglassTopRoundedIcon sx={{ fontSize: 14 }} />,
  },
  completed: {
    label: "Completed",
    color: "#69f0ae",
    icon: <CheckCircleRoundedIcon sx={{ fontSize: 14 }} />,
  },
  failed: {
    label: "Failed",
    color: "#ef5350",
    icon: <ErrorRoundedIcon sx={{ fontSize: 14 }} />,
  },
};

const MotionDiv = motion.div;
const MotionButton = motion.button;

const PulsingRing: React.FC<{ color: string }> = ({ color }) => (
  <Box
    sx={{
      position: "absolute",
      inset: 0,
      borderRadius: "50%",
      border: `2px solid ${color}`,
      animation: "pulseRing 1.5s ease-out infinite",
      "@keyframes pulseRing": {
        "0%": { transform: "scale(0.9)", opacity: 0.8 },
        "100%": { transform: "scale(1.6)", opacity: 0 },
      },
    }}
  />
);

const TaskCard: React.FC<{
  task: AgentTask;
  state: TaskState;
  onRun: (id: string) => void;
  index: number;
}> = ({ task, state, onRun, index }) => {
  const { status, message, lastRun } = state;
  const sc = statusConfig[status];
  const isRunning = status === "running";

  return (
    <MotionDiv
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.15, ease: "easeOut" }}
      whileHover={{ y: -6, transition: { duration: 0.2 } }}
      style={{
        position: "relative",
        borderRadius: "20px",
        background: task.gradient,
        border: `1.5px solid ${task.accentColor}22`,
        boxShadow: isRunning
          ? `0 0 40px ${task.glowColor}, 0 8px 32px rgba(0,0,0,0.5)`
          : `0 8px 32px rgba(0,0,0,0.45)`,
        overflow: "hidden",
        transition: "box-shadow 0.4s ease",
        minHeight: 260,
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Top accent bar */}
      <Box
        sx={{
          height: 4,
          background: `linear-gradient(90deg, ${task.accentColor}00, ${task.accentColor}, ${task.accentColor}00)`,
          animation: isRunning ? "shimmer 1.5s linear infinite" : "none",
          "@keyframes shimmer": {
            "0%": { backgroundPosition: "-200% 0" },
            "100%": { backgroundPosition: "200% 0" },
          },
          backgroundSize: "200% 100%",
        }}
      />

      {/* Running progress bar */}
      <AnimatePresence>
        {isRunning && (
          <MotionDiv
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <LinearProgress
              sx={{
                height: 2,
                background: "rgba(255,255,255,0.05)",
                "& .MuiLinearProgress-bar": {
                  background: `linear-gradient(90deg, ${task.accentColor}88, ${task.accentColor})`,
                },
              }}
            />
          </MotionDiv>
        )}
      </AnimatePresence>

      <Box sx={{ p: 3, flex: 1, display: "flex", flexDirection: "column" }}>
        {/* Header */}
        <Box sx={{ display: "flex", alignItems: "flex-start", gap: 2, mb: 2 }}>
          {/* Icon container */}
          <Box
            sx={{
              width: 64,
              height: 64,
              borderRadius: "16px",
              background: `${task.accentColor}18`,
              border: `1.5px solid ${task.accentColor}44`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: task.accentColor,
              flexShrink: 0,
              boxShadow: `0 0 20px ${task.glowColor}`,
            }}
          >
            {task.icon}
          </Box>

          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography
              variant="h6"
              sx={{
                color: "#fff",
                fontWeight: 700,
                fontSize: "1.1rem",
                lineHeight: 1.3,
                letterSpacing: "-0.01em",
              }}
            >
              {task.label}
            </Typography>
            <Chip
              size="small"
              label={sc.label}
              icon={
                <Box sx={{ color: `${sc.color} !important`, display: "flex" }}>
                  {sc.icon}
                </Box>
              }
              sx={{
                mt: 0.5,
                height: 22,
                background: `${sc.color}18`,
                border: `1px solid ${sc.color}44`,
                color: sc.color,
                fontSize: "0.7rem",
                fontWeight: 600,
                "& .MuiChip-icon": { ml: "6px" },
              }}
            />
          </Box>
        </Box>

        {/* Description */}
        <Typography
          variant="body2"
          sx={{
            color: "rgba(255,255,255,0.55)",
            fontSize: "0.82rem",
            lineHeight: 1.6,
            mb: 2,
            flex: 1,
          }}
        >
          {task.description}
        </Typography>

        {/* Status message */}
        <AnimatePresence mode="wait">
          {message && (
            <MotionDiv
              key={message}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25 }}
            >
              <Box
                sx={{
                  mb: 2,
                  p: "8px 12px",
                  borderRadius: "10px",
                  background:
                    status === "failed"
                      ? "rgba(239,83,80,0.12)"
                      : status === "completed"
                      ? "rgba(105,240,174,0.1)"
                      : "rgba(255,183,77,0.1)",
                  border: `1px solid ${sc.color}33`,
                }}
              >
                <Typography
                  variant="body2"
                  sx={{ color: sc.color, fontSize: "0.78rem", fontWeight: 500 }}
                >
                  {message}
                </Typography>
              </Box>
            </MotionDiv>
          )}
        </AnimatePresence>

        {/* Footer: last run + button */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 1,
          }}
        >
          <Typography
            variant="caption"
            sx={{ color: "rgba(255,255,255,0.3)", fontSize: "0.72rem" }}
          >
            {lastRun ? `Last run: ${lastRun}` : "Never run"}
          </Typography>

          <Tooltip
            title={
              isRunning
                ? "Agent is currently running…"
                : `Run ${task.label}`
            }
          >
            <span>
              <MotionButton
                onClick={() => {
                  if (!isRunning) onRun(task.id);
                }}
                whileTap={!isRunning ? { scale: 0.93 } : undefined}
                whileHover={!isRunning ? { scale: 1.05 } : undefined}
                style={{
                  position: "relative",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "9px 18px",
                  borderRadius: "12px",
                  border: "none",
                  cursor: isRunning ? "not-allowed" : "pointer",
                  background: isRunning
                    ? "rgba(255,255,255,0.06)"
                    : `linear-gradient(135deg, ${task.accentColor}dd, ${task.accentColor})`,
                  color: isRunning ? "rgba(255,255,255,0.4)" : "#000",
                  fontWeight: 700,
                  fontSize: "0.82rem",
                  letterSpacing: "0.02em",
                  boxShadow: isRunning
                    ? "none"
                    : `0 4px 20px ${task.glowColor}`,
                  transition: "all 0.3s ease",
                  overflow: "hidden",
                  fontFamily: "inherit",
                }}
              >
                {/* Ripple background on running */}
                {isRunning && (
                  <Box
                    sx={{
                      position: "absolute",
                      inset: 0,
                      background: `radial-gradient(circle, ${task.accentColor}18 0%, transparent 70%)`,
                      animation: "rippleBg 1.5s ease-in-out infinite",
                      "@keyframes rippleBg": {
                        "0%, 100%": { opacity: 0.4 },
                        "50%": { opacity: 1 },
                      },
                    }}
                  />
                )}

                {isRunning ? (
                  <Box
                    sx={{
                      width: 14,
                      height: 14,
                      borderRadius: "50%",
                      border: `2px solid ${task.accentColor}44`,
                      borderTop: `2px solid ${task.accentColor}`,
                      animation: "spin 0.8s linear infinite",
                      "@keyframes spin": {
                        "100%": { transform: "rotate(360deg)" },
                      },
                    }}
                  />
                ) : (
                  <PlayArrowRoundedIcon sx={{ fontSize: 16 }} />
                )}
                <span style={{ position: "relative", zIndex: 1 }}>
                  {isRunning ? "Running…" : "Run Now"}
                </span>
              </MotionButton>
            </span>
          </Tooltip>
        </Box>
      </Box>
    </MotionDiv>
  );
};

const AgentTasksMain: React.FC = () => {
  const [taskStates, setTaskStates] = useState<Record<string, TaskState>>(
    Object.fromEntries(
      AGENT_TASKS.map((t) => [
        t.id,
        { status: "idle" as TaskStatus, message: "", lastRun: null },
      ])
    )
  );

  const updateTask = useCallback(
    (id: string, patch: Partial<TaskState>) =>
      setTaskStates((prev) => ({
        ...prev,
        [id]: { ...prev[id], ...patch },
      })),
    []
  );

  const handleRun = useCallback(
    async (taskId: string) => {
      const task = AGENT_TASKS.find((t) => t.id === taskId);
      if (!task) return;

      updateTask(taskId, { status: "running", message: "Triggering agent…" });

      try {
        const res = await fetch(`${apiUrl}${task.endpoint}`, {
          method: "POST",
          headers: authHeaders(),
        });

        const data = await res.json().catch(() => ({})) as Record<string, string>;

        if (res.ok) {
          updateTask(taskId, {
            status: "completed",
            message: data.message || "Agent triggered successfully.",
            lastRun: new Date().toLocaleString(),
          });
        } else {
          updateTask(taskId, {
            status: "failed",
            message:
              data.error || data.detail || `Error ${res.status}: request failed.`,
            lastRun: new Date().toLocaleString(),
          });
        }
      } catch (err: unknown) {
        const msg =
          err instanceof Error ? err.message : "Network error. Check your connection.";
        updateTask(taskId, {
          status: "failed",
          message: msg,
          lastRun: new Date().toLocaleString(),
        });
      }
    },
    [updateTask]
  );

  const runningCount = Object.values(taskStates).filter(
    (s) => s.status === "running"
  ).length;

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background:
          "linear-gradient(160deg, #0a0a1a 0%, #0d1117 50%, #0a0f0d 100%)",
        p: { xs: 2, md: 4 },
      }}
    >
      {/* Header */}
      <MotionDiv
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{ marginBottom: 40 }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 1 }}>
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: "12px",
              background: "linear-gradient(135deg, #7c4dff, #448aff)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 0 24px rgba(124,77,255,0.5)",
            }}
          >
            <BoltRoundedIcon sx={{ color: "#fff", fontSize: 22 }} />
          </Box>
          <Box>
            <Typography
              variant="h4"
              sx={{
                color: "#fff",
                fontWeight: 800,
                fontSize: { xs: "1.4rem", md: "1.8rem" },
                letterSpacing: "-0.02em",
              }}
            >
              Agent Tasks
            </Typography>
            <Typography
              variant="body2"
              sx={{ color: "rgba(255,255,255,0.4)", fontSize: "0.82rem" }}
            >
              Trigger agents on-demand — no schedule required
            </Typography>
          </Box>
        </Box>

        {/* Active indicator */}
        <AnimatePresence>
          {runningCount > 0 && (
            <MotionDiv
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              <Box
                sx={{
                  mt: 2,
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 1,
                  px: "14px",
                  py: "6px",
                  borderRadius: "30px",
                  background: "rgba(255,183,77,0.1)",
                  border: "1px solid rgba(255,183,77,0.3)",
                }}
              >
                <Box
                  sx={{
                    position: "relative",
                    width: 8,
                    height: 8,
                    flexShrink: 0,
                  }}
                >
                  <Box
                    sx={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      background: "#ffb74d",
                      position: "relative",
                      zIndex: 1,
                    }}
                  />
                  <PulsingRing color="#ffb74d" />
                </Box>
                <Typography
                  sx={{
                    color: "#ffb74d",
                    fontSize: "0.78rem",
                    fontWeight: 600,
                  }}
                >
                  {runningCount} agent{runningCount > 1 ? "s" : ""} running
                </Typography>
              </Box>
            </MotionDiv>
          )}
        </AnimatePresence>
      </MotionDiv>

      {/* Task Grid */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            sm: "repeat(2, 1fr)",
            lg: "repeat(3, 1fr)",
          },
          gap: 3,
        }}
      >
        {AGENT_TASKS.map((task, i) => (
          <TaskCard
            key={task.id}
            task={task}
            state={taskStates[task.id]}
            onRun={handleRun}
            index={i}
          />
        ))}
      </Box>

      {/* Footer note */}
      <MotionDiv
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        style={{ marginTop: 40, textAlign: "center" }}
      >
        <Typography
          variant="caption"
          sx={{ color: "rgba(255,255,255,0.2)", fontSize: "0.75rem" }}
        >
          New agent tasks will appear here automatically as they are added to
          the system.
        </Typography>
      </MotionDiv>
    </Box>
  );
};

export default AgentTasksMain;
