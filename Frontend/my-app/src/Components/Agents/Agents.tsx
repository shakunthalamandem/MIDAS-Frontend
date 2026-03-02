import React from "react";
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
import RadarIcon from "@mui/icons-material/Radar";

const activeAgents = [
  {
    title: "AI Daily Briefing",
    description:
      "AI-generated executive briefing tailored to your sectors and risk profile.",
    schedule: "Run daily at 8:00 AM UTC",
    email: true,
    status: "Paused",
  },
  {
    title: "Portfolio Signals",
    description:
      "Buy/Sell/Hold signals generated for your watchlist stocks every trading day.",
    schedule: "Run every day at 8:00 AM UTC",
    email: true,
    status: "Active",
  },
];

const comingSoonAgents = [
  {
    title: "IPO Calendar Alerts",
    description: "Get notified when IPOs matching your interests are scheduled.",
    icon: CalendarTodayIcon,
  },
  {
    title: "Sector Rotation Agent",
    description: "Track momentum shifts and rotation opportunities.",
    icon: TrendingUpIcon,
  },
  {
    title: "Earnings Whisper Agent",
    description: "Pre-earnings analysis and whisper numbers for your watchlist.",
    icon: RocketLaunchIcon,
  },
  {
    title: "Market Pulse Monitor",
    description: "Real-time sentiment and macro trend monitoring.",
    icon: RadarIcon,
  },
];

const Agents: React.FC = () => {
  return (
    <Box
      sx={{
        backgroundColor: "#f5f6fb",
        minHeight: "100vh",
        px: { xs: 2, md: 6 },
        py: { xs: 4, md: 6 },
      }}
    >
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
              boxShadow: "0px 10px 30px rgba(0, 0, 0, 0.12)",
            }}
          >
            <AutoAwesomeIcon fontSize="large" sx={{ color: "#5b2fff" }} />
          </Avatar>

          <Box flex="1" minWidth={240}>
            <Typography
              variant="h4"
              sx={{ fontWeight: 700, color: "#0b1e4c", mb: 1 }}
            >
              Your AI Workforce
            </Typography>
            <Typography variant="body1" color="#4f5973">
              Autonomous AI agents that monitor markets, generate insights, and
              deliver personalized intelligence — working around the clock for
              you.
            </Typography>
          </Box>
        </Stack>

        <Stack direction="row" spacing={1} mt={3} flexWrap="wrap">
          <Chip label="2 Agents" color="default" />
          <Chip label="0 Active" color="success" variant="outlined" />
          <Chip label="Email Not Verified" color="warning" variant="outlined" />
          <Chip label="3 Coming Soon" color="info" />
        </Stack>
      </Paper>

      <Typography
        variant="h6"
        sx={{ color: "#0b1e4c", fontWeight: 700, mb: 2 }}
      >
        Active Agents
      </Typography>

      <Stack
        direction={{ xs: "column", md: "row" }}
        spacing={3}
        mb={5}
        alignItems="stretch"
      >
        {activeAgents.map((agent) => (
          <Paper
            key={agent.title}
            elevation={2}
            sx={{
              borderRadius: 4,
              p: { xs: 3, md: 4 },
              flex: 1,
              backgroundColor: "#ffffff",
              display: "flex",
              flexDirection: "column",
              gap: 2,
            }}
          >
            <Stack direction="row" alignItems="center" justifyContent="space-between">
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                {agent.title}
              </Typography>
              <Switch checked={agent.status === "Active"} onChange={() => {}} />
            </Stack>

            <Typography variant="body2" color="#555f77">
              {agent.description}
            </Typography>

            <Divider />

            <Stack
              direction="row"
              alignItems="center"
              flexWrap="wrap"
              spacing={2}
            >
              <Chip
                icon={<CalendarTodayIcon />}
                label={agent.schedule}
                color="primary"
                variant="outlined"
              />
              <Chip
                icon={<EmailOutlinedIcon />}
                label={agent.email ? "Email results after run" : "Email disabled"}
                variant="outlined"
                color={agent.email ? "success" : "default"}
              />
            </Stack>

            <Box
              sx={{
                width: "fit-content",
                px: 2,
                py: 0.5,
                borderRadius: 2,
                border: "1px solid",
                borderColor:
                  agent.status === "Active" ? "#2cae5c" : "rgba(0, 0, 0, 0.1)",
              }}
            >
              <Typography
                variant="caption"
                sx={{
                  fontWeight: 600,
                  textTransform: "uppercase",
                  color: agent.status === "Active" ? "#2cae5c" : "#999",
                }}
              >
                {agent.status}
              </Typography>
            </Box>

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
              <Switch checked={agent.email} onChange={() => {}} />
            </Paper>
          </Paper>
        ))}
      </Stack>

      <Typography
        variant="h6"
        sx={{ color: "#0b1e4c", fontWeight: 700, mb: 2 }}
      >
        Coming Soon
      </Typography>

      <Stack
        direction={{ xs: "column", md: "row" }}
        spacing={3}
        flexWrap="wrap"
      >
        {comingSoonAgents.map((agent) => {
          const Icon = agent.icon;
          return (
            <Paper
              key={agent.title}
              elevation={0}
              sx={{
                flex: "1",
                minWidth: 250,
                borderRadius: 4,
                p: 3,
                background:
                  "linear-gradient(180deg, rgba(255,255,255,0.9), rgba(237,236,255,0.9))",
                border: "1px solid rgba(94, 112, 148, 0.15)",
              }}
            >
              <Stack direction="row" alignItems="center" spacing={2} mb={2}>
                <Avatar sx={{ bgcolor: "#eef3ff", color: "#5b2fff" }}>
                  <Icon />
                </Avatar>
                <Chip label="Soon" color="warning" size="small" />
              </Stack>
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                {agent.title}
              </Typography>
              <Typography variant="body2" color="#555f77" mt={1}>
                {agent.description}
              </Typography>
            </Paper>
          );
        })}
      </Stack>
    </Box>
  );
};

export default Agents;
