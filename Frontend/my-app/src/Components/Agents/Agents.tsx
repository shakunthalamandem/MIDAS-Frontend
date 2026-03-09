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
    title: "Portfolio CIO Agent",
    description:
      "AI-powered decision engine for portfolio oversight. Identifies emerging risks, prioritizes actions, and supports faster capital allocation and investment decisions.",
    schedule: "Once a Week on Monday",
    route: "/ai_portfolio_review",
  },
  {
    title: "Risk Agent",
    description:
      "Continuously analyzes portfolio exposures to detect potential risks early. Highlights vulnerabilities, volatility signals, and areas requiring immediate attention.",
    schedule: "Once a Week on Monday",
    route: "/ai_risk_review",
  },
  {
    title: "Recent IPOs Agent",
    description:
      "Ranking of the most promising IPOs from the last 30 days based on data and market signals using ai-tools.",
    schedule: "Weekly Once",
    route: "/last_30_days_ai_ranking",
  },
  {
    title: "Prediction Agent",
    description:
      "Analyzes a company’s pre-listing fundamentals by comparing them with around 30 similar past IPO deals.Highlights likely early trading patterns, including sentiment shifts, volatility, and short-term risks.",
    schedule: "One Time for each IPO",
    route: "/ai_fewshot_analysis",
  },
  {
    title: "Sentiment Agent",
    description:
      "Run sentiment analysis for selected stocks every day to generate updated market sentiment.Enable this agent to retrieve the latest sentiment analysis results after each run.",
    schedule: "Run Daily",
    route: "/ai_sentiment_view",
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
  "Sentiment Agent": AISentimentAnalysisAgent,
};

type AgentLatestUpdatedDates = Record<
  string,
  {
    id?: number;
    updated_at?: string;
    [key: string]: any;
  }
>;

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

  const [latestUpdatedDates, setLatestUpdatedDates] =
    useState<AgentLatestUpdatedDates>({});

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

  useEffect(() => {
    const loadLatestUpdatedDates = async () => {
      const token = localStorage.getItem("access_token");

      try {
        const res = await fetch(`${apiUrl}/api/agents_latest_updated_dates/`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : "",
          },
        });

        const data = await res.json();
        if (!res.ok) {
          throw new Error(
            data.error || "Failed to fetch latest updated dates"
          );
        }

        setLatestUpdatedDates(data || {});
      } catch (err) {
        console.error("Failed to load latest agent updated dates", err);
      }
    };

    loadLatestUpdatedDates();
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
              <Box display="flex" alignItems="center" gap={1} mb={1}>
                <Typography variant="h4" sx={{ fontWeight: 700 }}>
                  MIDAS AI Agents
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    color: "#ff1e00",
                    fontWeight: 600,
                    border: "1px solid #ff1e00",
                    px: 1,
                    py: 0.25,
                    borderRadius: 1,
                    textTransform: "uppercase",
                    letterSpacing: 0.5,
                  }}
                >
                  Beta
                </Typography>
              </Box>
              <Typography variant="body1" color="#113591">
                Autonomous financial AI agents that continuously analyze markets
                and deliver actionable insights for your investment decisions.
              </Typography>
              <Typography variant="body1" color="#8222af">
                Enable the agents for automated market analysis and insights.
              </Typography>
            </Box>
          </Stack>

          <Stack direction="row" spacing={1} mt={3} flexWrap="wrap">
            <Chip label={`${totalAgents} Agents`} color="info" />
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

            const agentNumber = `agent${String(index + 1).padStart(2, "0")}`;
            const lastUpdatedAt =
              latestUpdatedDates?.[agentNumber]?.updated_at ?? null;

            const viewDetailsAction = agent.route ? (
              <Button
                variant="contained"
                disableElevation
                onClick={(e) => {
                  e.stopPropagation();
                  window.open(
                    `${window.location.origin}${agent.route}`,
                    "_blank"
                  );
                }}
                sx={{
                  backgroundColor: "#481f93",
                  color: "#ffffff",
                  textTransform: "none",
                  fontWeight: 600,
                  borderRadius: 3,
                  px: 3,
                  py: 0.5,
                  "&:hover": { backgroundColor: "#4a24d9" },
                }}
              >
                Explore Insights
              </Button>
            ) : null;

            return (
              <Component
                key={agent.title}
                agent={agent}
                state={state}
                agentIndex={index + 1}
                lastUpdatedAt={lastUpdatedAt}
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