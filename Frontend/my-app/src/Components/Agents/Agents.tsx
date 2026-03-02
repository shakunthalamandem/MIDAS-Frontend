import React, { useState } from "react";
import {
  Avatar,
  Box,
  Chip,
  Divider,
  Paper,
  Stack,
  Switch,
  Typography,
} from "@mui/material";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import RocketLaunchIcon from "@mui/icons-material/RocketLaunch";

interface AgentConfig {
  title: string;
  description: string;
  schedule: string;
}

const activeAgents: AgentConfig[] = [

  {
    title: "AI Portfolio Review",
    description:
      "Comprehensive review of your portfolio performance and recommendations.",
    schedule: "Run daily at 8:00 AM EST",
  },
    {
    title: "Last 30 Days IPO AI Ranking",
    description:
      "AI-generated ranking of the most promising IPOs from the last 30 days.",
    schedule: "Run daily at 8:00 AM EST",
  },
    {
    title: "AI Unsupervised Market Insights",
    description:
      "AI-generated insights on market trends and opportunities without explicit supervision.",
    schedule: "Run daily at 8:00 AM EST",
  },
    {
    title: "Portfolio Analysis",
    description:
      "AI-generated portfolio analysis reports through the email",
    schedule: "Run daily at 8:00 AM EST",
  },
    {
    title: "AI Sentiment Analysis",
    description:
      "AI-generated sentiment analysis for your watchlist stocks.",
    schedule: "Run daily at 8:00 AM EST",
  },

];

const comingSoonAgents = [
  {
    title: "IPO Calendar Alerts",
    description:
      "Get notified when IPOs matching your interests are scheduled.",
    icon: CalendarTodayIcon,
  },
  {
    title: "Sector Rotation Agent",
    description: "Track momentum shifts and rotation opportunities.",
    icon: TrendingUpIcon,
  },
  {
    title: "Earnings Whisper Agent",
    description:
      "Pre-earnings analysis and whisper numbers for your watchlist.",
    icon: RocketLaunchIcon,
  },
];

const Agents: React.FC = () => {
  const [activations, setActivations] = useState(
    activeAgents.reduce(
      (acc, agent) => ({
        ...acc,
        [agent.title]: {
          enabled: agent.title !== "AI Daily Briefing",
          email: true,
        },
      }),
      {} as Record<string, { enabled: boolean; email: boolean }>
    )
  );

  const handleToggle = (title: string, key: "enabled" | "email") => {
    setActivations((prev) => ({
      ...prev,
      [title]: {
        ...prev[title],
        [key]: !prev[title][key],
      },
    }));
  };

  return (
    <Box
      sx={{
        backgroundColor: "#f5f6fb",
        minHeight: "100vh",
        px: { xs: 2, md: 6 },
        py: { xs: 4, md: 6 },
      }}
    >
      <Box sx={{ maxWidth: 1200, width: "100%", mx: "auto" }}>
        {/* Header */}
        <Paper
          elevation={0}
          sx={{
            borderRadius: 4,
            px: { xs: 3, md: 5 },
            py: { xs: 3, md: 5 },
            background: "linear-gradient(135deg, #eef3ff, #ffffff)",
            mb: 4,
          }}
        >
          <Stack direction="row" alignItems="center" gap={2} flexWrap="wrap">
            <Avatar
              sx={{
                bgcolor: "#efd4ff",
                width: 64,
                height: 64,
              }}
            >
              <AutoAwesomeIcon
                fontSize="large"
                sx={{ color: "#5b2fff" }}
              />
            </Avatar>

            <Box flex="1" minWidth={240}>
              <Typography
                variant="h4"
                sx={{ fontWeight: 700, color: "#0b1e4c", mb: 1 }}
              >
                Your AI Workforce
              </Typography>
              <Typography variant="body1" color="#4f5973">
                Autonomous AI agents that monitor markets, generate insights,
                and deliver personalized intelligence — working around the
                clock for you.
              </Typography>
            </Box>
          </Stack>

          <Stack direction="row" spacing={1} mt={3} flexWrap="wrap">
            <Chip label="3 Agents" />
            <Chip label="0 Active" color="success" variant="outlined" />
            <Chip
              label="Email Not Verified"
              color="warning"
              variant="outlined"
            />
            <Chip label="3 Coming Soon" color="info" />
          </Stack>
        </Paper>

        {/* Active Agents */}
        <Typography
          variant="h6"
          sx={{ color: "#0b1e4c", fontWeight: 700, mb: 2 }}
        >
          Active Agents
        </Typography>

        <Box
          component="section"
          sx={{
            width: "100%",
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "repeat(2, minmax(0, 1fr))" },
            gap: 3,
            justifyContent: "center",
            mb: 5,
          }}
        >
          {activeAgents.map((agent) => {
            const state = activations[agent.title];
            const isActive = state?.enabled ?? false;
            const emailOn = state?.email ?? false;

            return (
              <Paper
                key={agent.title}
                elevation={2}
                sx={{
                  borderRadius: 4,
                  p: 4,
                  backgroundColor: "#ffffff",
                  display: "flex",
                  flexDirection: "column",
                  gap: 2,
                }}
              >
                <Stack
                  direction="row"
                  alignItems="center"
                  justifyContent="space-between"
                >
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    {agent.title}
                  </Typography>
                  <Switch
                    checked={isActive}
                    onChange={() =>
                      handleToggle(agent.title, "enabled")
                    }
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
                    label={isActive ? "Active" : "Paused"}
                    color={isActive ? "success" : "default"}
                    variant="outlined"
                    size="small"
                  />
                  <Chip
                    icon={<EmailOutlinedIcon />}
                    label={
                      emailOn
                        ? "Email results after run"
                        : "Email disabled"
                    }
                    color={emailOn ? "success" : "default"}
                    variant="outlined"
                  />
                </Stack>

                <Paper
                  elevation={0}
                  sx={{
                    mt: "auto",
                    px: 2,
                    py: 1,
                    borderRadius: 3,
                    backgroundColor: "#f8f8fb",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <Typography variant="caption" color="#7a8097">
                    Email results after run
                  </Typography>
                  <Switch
                    checked={emailOn}
                    onChange={() =>
                      handleToggle(agent.title, "email")
                    }
                  />
                </Paper>
              </Paper>
            );
          })}
        </Box>

        {/* Coming Soon */}
        <Typography
          variant="h6"
          sx={{ color: "#0b1e4c", fontWeight: 700, mb: 2 }}
        >
          Coming Soon
        </Typography>

        <Stack
          direction="row"
          spacing={3}
          sx={{
            overflowX: "auto",
            pb: 1,
          }}
        >
          {comingSoonAgents.map((agent) => {
            const Icon = agent.icon;

            return (
              <Paper
                key={agent.title}
                elevation={0}
                sx={{
                  flex: "0 0 300px",
                  borderRadius: 4,
                  p: 3,
                  background:
                    "linear-gradient(180deg, rgba(255,255,255,0.9), rgba(237,236,255,0.9))",
                  border: "1px solid rgba(94, 112, 148, 0.15)",
                }}
              >
                <Stack
                  direction="row"
                  alignItems="center"
                  spacing={2}
                  mb={2}
                >
                  <Avatar
                    sx={{ bgcolor: "#eef3ff", color: "#5b2fff" }}
                  >
                    <Icon />
                  </Avatar>
                  <Chip label="Soon" color="warning" size="small" />
                </Stack>

                <Typography
                  variant="subtitle1"
                  sx={{ fontWeight: 700 }}
                >
                  {agent.title}
                </Typography>
                <Typography
                  variant="body2"
                  color="#555f77"
                  mt={1}
                >
                  {agent.description}
                </Typography>
              </Paper>
            );
          })}
        </Stack>
      </Box>
    </Box>
  );
};

export default Agents;
