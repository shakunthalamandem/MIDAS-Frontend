import React, { useMemo, useState } from "react";
import {
  Avatar,
  Box,
  Button,
  Chip,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import RocketLaunchIcon from "@mui/icons-material/RocketLaunch";
import ActiveAgentCard, {
  AgentConfig,
  ActiveAgentCardProps,
} from "./AgentCards/ActiveAgentCard";
import AIPortfolioReviewAgent from "./AgentCards/AIPortfolioReviewAgent";
import Last30DaysIPORankingAgent from "./AgentCards/Last30DaysIPORankingAgent";
import AIUnsupervisedMarketInsightsAgent from "./AgentCards/AIUnsupervisedMarketInsightsAgent";
import PortfolioAnalysisAgent from "./AgentCards/PortfolioAnalysisAgent";
import AISentimentAnalysisAgent from "./AgentCards/AISentimentAnalysisAgent";

const EMAIL_VERIFIED_KEY = "email_verified";

const activeAgents: AgentConfig[] = [
  {
    title: "AI Portfolio Review",
    description:
      "Comprehensive review of your portfolio performance and recommendations.",
    schedule: "Run daily at 8:00 AM EST",
    route: "/ai_portfolio_review",
  },
  {
    title: "Last 30 Days IPO AI Ranking",
    description:
      "AI-generated ranking of the most promising IPOs from the last 30 days.",
    schedule: "Run daily at 8:00 AM EST",
    route: "/last_30_days_ai_ranking",
  },
  {
    title: "AI Unsupervised Market Insights",
    description:
      "AI-generated insights on market trends and opportunities without explicit supervision.",
    schedule: "RunS After completing the WriteUp",
    route: "/ai_fewshot_analysis",
  },
  {
    title: "Individual Stock Analysis",
    description: "AI-generated portfolio analysis reports through the email",
    schedule: "Run daily at 8:00 AM EST",
  },
  {
    title: "AI Sentiment Analysis",
    description:
      "The sentiment analysis runs daily on selected stocks. To view the latest updated sentiment report and receive it via email, please enable the email option.",
    schedule: "Run daily",
    route: "/ai_sentiment_view",
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

const agentComponentMap: Record<string, React.ComponentType<ActiveAgentCardProps>> = {
  "AI Portfolio Review": AIPortfolioReviewAgent,
  "Last 30 Days IPO AI Ranking": Last30DaysIPORankingAgent,
  "AI Unsupervised Market Insights": AIUnsupervisedMarketInsightsAgent,
  "Portfolio Analysis": PortfolioAnalysisAgent,
  "AI Sentiment Analysis": AISentimentAnalysisAgent,
};

const Agents: React.FC = () => {
  const navigate = useNavigate();
  const [emailVerified] = useState(
    () => localStorage.getItem(EMAIL_VERIFIED_KEY) === "true"
  );
  const [activations, setActivations] = useState(
    activeAgents.reduce(
      (acc, agent) => ({
        ...acc,
        [agent.title]: {
          enabled: false,
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

  const totalAgents = activeAgents.length;
  const activeCount = useMemo(
    () => Object.values(activations).filter((agent) => agent.enabled).length,
    [activations]
  );
  const comingSoonCount = comingSoonAgents.length;

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
                Autonomous AI agents that monitor markets, generate insights,
                and deliver personalized intelligence — working around the clock
                for you.
              </Typography>
            </Box>
          </Stack>

          <Stack direction="row" spacing={1} mt={3} flexWrap="wrap">
            <Chip label={`${totalAgents} Agents`} />
            <Chip
              label={`${activeCount} Active`}
              color={activeCount > 0 ? "success" : "default"}
              variant="outlined"
            />
            <Chip label="Email Verified" color="success" variant="outlined" />
            <Chip label={`${comingSoonCount} Coming Soon`} color="info" />
          </Stack>
        </Paper>

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
            mb: 5,
          }}
        >
          {activeAgents.map((agent) => {
            const state = activations[agent.title];
            const Component = agentComponentMap[agent.title] ?? ActiveAgentCard;
            const viewDetailsAction = agent.route ? (
              <Button
                variant="text"
                onClick={(event) => {
                  event.stopPropagation();
                  const url = `${window.location.origin}${agent.route}`;
                  window.open(url, "_blank", "noopener");
                }}
              >
                View details
              </Button>
            ) : null;

            return (
              <Component
                key={agent.title}
                agent={agent}
                state={state}
                onToggle={handleToggle}
                footerAction={viewDetailsAction}
              />
            );
          })}
        </Box>

        <Typography
          variant="h6"
          sx={{ color: "#0b1e4c", fontWeight: 700, mb: 2 }}
        >
          Coming Soon
        </Typography>

        <Stack direction="row" spacing={3} sx={{ overflowX: "auto", pb: 1 }}>
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
    </Box>
  );
};

export default Agents;
