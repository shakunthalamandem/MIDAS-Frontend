import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Avatar,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
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

const apiUrl = process.env.REACT_APP_API_URL;
const EMAIL_VERIFIED_KEY = "email_verified";

const activeAgents: AgentConfig[] = [
  {
    title: "AI Unsupervised (IPO)",
    description:
      "AI-generated insights on market trends and opportunities without explicit supervision.",
    schedule: "Daily · 8:00 AM EST",
    route: "/ai_fewshot_analysis",
  },
  {
    title: "AI Sentiment Analysis",
    description:
      "Runs daily on selected stocks. Enable email to receive the latest updated sentiment report.",
    schedule: "Daily · 8:00 AM EST",
    route: "/ai_sentiment_view",
  },
  {
    title: "Individual Stock Analysis",
    description:
      "AI-generated portfolio analysis reports delivered through email with actionable insights.",
    schedule: "Daily · 8:00 AM EST",
  },
  {
    title: "AI Portfolio Review",
    description:
      "Comprehensive review of your portfolio performance and recommendations.",
    schedule: "Daily · 8:00 AM EST",
    route: "/ai_portfolio_review",
  },
  {
    title: "Last 30 Days IPO AI Ranking",
    description:
      "AI-generated ranking of the most promising IPOs from the last 30 days.",
    schedule: "Daily · 8:00 AM EST",
    route: "/last_30_days_ai_ranking",
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
    description:
      "Pre-earnings analysis and whisper numbers for your watchlist.",
    icon: RocketLaunchIcon,
  },
];

const agentComponentMap: Record<
  string,
  React.ComponentType<ActiveAgentCardProps>
> = {
  "AI Portfolio Review": AIPortfolioReviewAgent,
  "Last 30 Days IPO AI Ranking": Last30DaysIPORankingAgent,
  "AI Unsupervised Market Insights": AIUnsupervisedMarketInsightsAgent,
  "Portfolio Analysis": PortfolioAnalysisAgent,
  "AI Sentiment Analysis": AISentimentAnalysisAgent,
};

const Agents: React.FC = () => {
  const [emailVerified] = useState(
    () => localStorage.getItem(EMAIL_VERIFIED_KEY) === "true"
  );

  const [activations, setActivations] = useState(
    activeAgents.reduce(
      (acc, agent) => ({
        ...acc,
        [agent.title]: { enabled: false, email: true },
      }),
      {} as Record<string, { enabled: boolean; email: boolean }>
    )
  );

  const [dialogOpen, setDialogOpen] = useState(false);
  const [pendingAgent, setPendingAgent] = useState<{
    agent: AgentConfig;
    index: number;
    action: "add" | "remove";
  } | null>(null);

  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const totalAgents = activeAgents.length;

  const activeCount = useMemo(
    () => Object.values(activations).filter((a) => a.enabled).length,
    [activations]
  );

  const comingSoonCount = comingSoonAgents.length;

  const handleAgentRequest = (
    agent: AgentConfig,
    index: number,
    action: "add" | "remove"
  ) => {
    setPendingAgent({ agent, index, action });
    setSaveError(null);
    setDialogOpen(true);
  };

  const handleConfirmSave = async () => {
    if (!pendingAgent) return;

    setSaving(true);
    setSaveError(null);

    try {
      const token = localStorage.getItem("access_token");

      const res = await fetch(`${apiUrl}/api/update_agent_data/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify({
          agentnumber: `agent${String(pendingAgent.index).padStart(2, "0")}`,
          action: pendingAgent.action,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update agent");

      setActivations((prev) => ({
        ...prev,
        [pendingAgent.agent.title]: {
          ...prev[pendingAgent.agent.title],
          enabled: pendingAgent.action === "add",
        },
      }));

      setDialogOpen(false);
      setPendingAgent(null);
    } catch (err: any) {
      setSaveError(err.message || "Unable to update agent");
    } finally {
      setSaving(false);
    }
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setPendingAgent(null);
    setSaveError(null);
  };

  useEffect(() => {
    const loadMembership = async () => {
      const token = localStorage.getItem("access_token");

      try {
        const res = await fetch(`${apiUrl}/api/agent_membership/`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : "",
          },
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to fetch membership");

        const agentSet = new Set<string>(data?.agentnumbers ?? []);

        setActivations((prev) => {
          const next = { ...prev };

          activeAgents.forEach((agent, index) => {
            const agentNumber = `agent${String(index + 1).padStart(2, "0")}`;

            if (agentSet.has(agentNumber)) {
              next[agent.title] = {
                ...next[agent.title],
                enabled: true,
              };
            }
          });

          return next;
        });
      } catch (err) {
        console.error("Failed to load agent membership", err);
      }
    };

    loadMembership();
  }, []);

  return (
    <Box
      sx={{
        backgroundColor: "#edf0f7",
        minHeight: "100vh",
        px: { xs: 2, md: 8 },
        py: { xs: 4, md: 6 },
      }}
    >
      <Box sx={{ maxWidth: 1200, width: "100%", mx: "auto" }}>
        <Paper
          elevation={0}
          sx={{
            borderRadius: 4,
            px: { xs: 3, md: 4 },
            py: { xs: 3, md: 4 },
            mb: 4,
            border: "1px solid rgba(15, 76, 129, 0.08)",
            background: "#ffffff",
          }}
        >
          <Stack direction="row" alignItems="center" gap={2} flexWrap="wrap">
            <Avatar sx={{ bgcolor: "#efd4ff", width: 64, height: 64 }}>
              <AutoAwesomeIcon fontSize="large" sx={{ color: "#5b2fff" }} />
            </Avatar>

            <Box flex="1" minWidth={240}>
              <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                Your AI Workforce
              </Typography>
              <Typography variant="body1" color="#4f5973">
                Autonomous AI agents that monitor markets and generate insights
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
            <Chip
              label={emailVerified ? "Email Verified" : "Email Not Verified"}
              color={emailVerified ? "success" : "warning"}
              variant="outlined"
            />
            <Chip label={`${comingSoonCount} Coming Soon`} color="info" />
          </Stack>
        </Paper>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "repeat(2,1fr)" },
            gap: 3,
            mb: 4,
          }}
        >
          {activeAgents.map((agent, index) => {
            const state = activations[agent.title];
            const Component =
              agentComponentMap[agent.title] ?? ActiveAgentCard;

            const viewDetailsAction = agent.route ? (
              <Button
                variant="text"
                onClick={(e) => {
                  e.stopPropagation();
                  window.open(
                    `${window.location.origin}${agent.route}`,
                    "_blank"
                  );
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
                agentIndex={index + 1}
                onToggle={(ag, key, currentValue) => {
                  if (key === "enabled") {
                    handleAgentRequest(
                      ag,
                      index + 1,
                      currentValue ? "remove" : "add"
                    );
                  }
                }}
                footerAction={viewDetailsAction}
              />
            );
          })}
        </Box>

        <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
          Coming Soon
        </Typography>

        <Stack direction="row" spacing={3} sx={{ overflowX: "auto", pb: 1 }}>
          {comingSoonAgents.map((agent) => {
            const Icon = agent.icon;

            return (
              <Paper
                key={agent.title}
                sx={{
                  flex: "0 0 300px",
                  borderRadius: 3,
                  p: 3,
                  border: "1px solid rgba(94,112,148,0.15)",
                }}
              >
                <Stack direction="row" spacing={2} mb={2}>
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

      <Dialog open={dialogOpen} onClose={handleDialogClose}>
        <DialogTitle>
          {pendingAgent?.action === "add"
            ? "Enable this agent?"
            : "Disable this agent?"}
        </DialogTitle>

        <DialogContent>
          {saveError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {saveError}
            </Alert>
          )}

          <DialogContentText>
            {pendingAgent?.action === "add"
              ? `Enable ${pendingAgent?.agent.title} and get the latest updates.`
              : `Disable ${pendingAgent?.agent.title} and stop receiving updates.`}
          </DialogContentText>
        </DialogContent>

        <DialogActions>
          <Button onClick={handleDialogClose} disabled={saving}>
            Cancel
          </Button>

          <Button
            variant="contained"
            color={pendingAgent?.action === "remove" ? "error" : "primary"}
            onClick={handleConfirmSave}
            disabled={saving}
          >
            {saving ? "Saving…" : "Confirm"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Agents;