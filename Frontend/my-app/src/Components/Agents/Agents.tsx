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

const activeAgents: AgentConfig[] = [
  {
    title: "Portfolio CIO Agent",
    description:
      "AI-powered decision engine for portfolio oversight. Identifies emerging risks, prioritizes actions, and supports faster capital allocation and investment decisions.",
    schedule: "Every Monday",
    route: "/ai_portfolio_review",
  },
  {
    title: "Risk Agent",
    description:
      "Continuously analyzes portfolio exposures to detect potential risks early.",
    schedule: "Every Monday",
    route: "/ai_risk_review",
  },
  {
    title: "IPO Ranking Agent",
    description:
      "Ranking of the most promising IPOs from the last 30 days based on data and market signals using AI-tools.",
    schedule: "Every Monday",
    route: "/last_30_days_ai_ranking",
  },
  {
    title: "Deal(IPO) Agent",
    description:
      "Analyzes a company’s pre-listing fundamentals by comparing them with similar past IPO deals.Deal agent runs using AI Unsupervised.",
    schedule: "One Time for each IPO",
    route: "/ai_fewshot_analysis",
  },
  {
    title: "Sentiment Agent",
    description:
      "Run sentiment analysis for selected stocks every day to generate updated market sentiment.",
    schedule: "Run Daily",
    route: "/ai_sentiment_summary",
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

const scheduleMap: Record<string, number> = {
  "Mon - Fri": 0,
  "Every Monday": 1,
  "Every Tuesday": 2,
  "Every Wednesday": 3,
  "Every Thursday": 4,
  "Every Friday": 5,
};


const reverseScheduleMap: Record<number, string> = {
  0: "Mon - Fri",
  1: "Every Monday",
  2: "Every Tuesday",
  3: "Every Wednesday",
  4: "Every Thursday",
  5: "Every Friday",
};

type AgentLatestUpdatedDates = Record<
  string,
  {
    updated_at?: string;
  }
>;

const Agents: React.FC = () => {
  const [activations, setActivations] = useState(
    activeAgents.reduce(
      (acc, agent) => ({
        ...acc,
        [agent.title]: { enabled: false, email: true },
      }),
      {} as Record<string, { enabled: boolean; email: boolean }>
    )
  );

  const [runSchedules, setRunSchedules] = useState<Record<string, string>>({});
  const [latestUpdatedDates, setLatestUpdatedDates] =
    useState<AgentLatestUpdatedDates>({});

  const [dialogOpen, setDialogOpen] = useState(false);
  const [pendingAgent, setPendingAgent] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const totalAgents = activeAgents.length;

  const activeCount = useMemo(
    () => Object.values(activations).filter((a) => a.enabled).length,
    [activations]
  );

  const handleRunScheduleChange = async (
    agent: AgentConfig,
    agentIndex: number,
    value: string
  ) => {
    setRunSchedules((prev) => ({
      ...prev,
      [agent.title]: value,
    }));

    try {
      const token = localStorage.getItem("access_token");

      await fetch(`${apiUrl}/api/update_agent_schedule/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify({
          agent_number: `agent${String(agentIndex + 1).padStart(2, "0")}`,
          schedule: scheduleMap[value],
        }),
      });
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    const loadMembership = async () => {
      const token = localStorage.getItem("access_token");

      try {
        const res = await fetch(`${apiUrl}/api/agent_membership/`, {
          headers: {
            Authorization: token ? `Bearer ${token}` : "",
          },
        });

        const data = await res.json();

        const agentSet = new Set<string>(data?.agentnumbers ?? []);
        const schedulesFromApi = data?.schedules ?? {};

        const newSchedules: Record<string, string> = {};

        setActivations((prev) => {
          const next = { ...prev };

          activeAgents.forEach((agent, index) => {
            const agentNumber = `agent${String(index + 1).padStart(2, "0")}`;

            if (agentSet.has(agentNumber)) {
              next[agent.title] = { ...next[agent.title], enabled: true };
            }

            const scheduleValue = schedulesFromApi[agentNumber];
            if (scheduleValue) {
              newSchedules[agent.title] =
                reverseScheduleMap[Number(scheduleValue)];
            }
          });

          return next;
        });

        setRunSchedules(newSchedules);
      } catch (err) {
        console.error(err);
      }
    };

    loadMembership();
  }, []);

  useEffect(() => {
    const loadLatestUpdatedDates = async () => {
      const token = localStorage.getItem("access_token");

      try {
        const res = await fetch(`${apiUrl}/api/agents_latest_updated_dates/`, {
          headers: {
            Authorization: token ? `Bearer ${token}` : "",
          },
        });

        const data = await res.json();
        setLatestUpdatedDates(data || {});
      } catch (err) {
        console.error(err);
      }
    };

    loadLatestUpdatedDates();
  }, []);

  const handleAgentRequest = (
    agent: AgentConfig,
    index: number,
    action: "add" | "remove"
  ) => {
    setSaveError(null);

    setPendingAgent({
      agent,
      index,
      action,
    });

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

      if (!res.ok) throw new Error(data.error);

      setActivations((prev) => ({
        ...prev,
        [pendingAgent.agent.title]: {
          ...prev[pendingAgent.agent.title],
          enabled: pendingAgent.action === "add",
        },
      }));

      setDialogOpen(false);
    } catch (err: any) {
      setSaveError(err.message || "Failed to update agent.");
    } finally {
      setSaving(false);
    }
  };
  const handleDialogClose = () => {
    if (saving) return;
    setDialogOpen(false);
    setPendingAgent(null);
  };
  return (
    <Box sx={{ backgroundColor: "#edf0f7", minHeight: "100vh", p: 4 }}>
      <Box sx={{ maxWidth: 1200, mx: "auto" }}>
        <Paper sx={{ p: 4, mb: 4 }}>
          <Stack direction="row" spacing={2} alignItems="center">
            <Avatar sx={{ bgcolor: "#efd4ff" }}>
              <AutoAwesomeIcon sx={{ color: "#5b2fff" }} />
            </Avatar>

            <Box flex={1}>
              <Typography variant="h4" fontWeight={700}>
                MIDAS AI Agents
              </Typography>

              <Typography>
                Autonomous financial AI agents that continuously analyze markets
                and deliver actionable insights.
              </Typography>
            </Box>
          </Stack>

          <Stack direction="row" spacing={1} mt={2}>
            <Chip label={`${totalAgents} Agents`} color="info" />
            <Chip label={`${activeCount} Active`} color="success" />
          </Stack>
        </Paper>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "repeat(2,1fr)" },
            gap: 3,
          }}
        >
          {activeAgents.map((agent, index) => {
            const state = activations[agent.title];

            const Component =
              agentComponentMap[agent.title] ?? ActiveAgentCard;

            const agentNumber = `agent${String(index + 1).padStart(2, "0")}`;

            const lastUpdatedAt =
              latestUpdatedDates?.[agentNumber]?.updated_at ?? null;

            return (
              <Component
                key={agent.title}
                agent={agent}
                state={state}
                agentIndex={index + 1}
                lastUpdatedAt={lastUpdatedAt}
                runSchedule={runSchedules[agent.title]}
                onRunScheduleChange={(ag, value) =>
                  handleRunScheduleChange(ag, index, value)
                }
                onToggle={(ag, key, checked) => {
                  if (key === "enabled") {
                    handleAgentRequest(
                      ag,
                      index + 1,
                      checked ? "add" : "remove"
                    );
                  }
                }}
                footerAction={
                  agent.route && (
                    <Button
                      variant="contained"
                      onClick={() =>
                        window.open(
                          `${window.location.origin}${agent.route}`,
                          "_blank"
                        )
                      }
                    >
                      Output
                    </Button>
                  )
                }
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