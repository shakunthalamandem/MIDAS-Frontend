import React, { useCallback, useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  Checkbox,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControlLabel,
  IconButton,
  InputAdornment,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty";
import RefreshIcon from "@mui/icons-material/Refresh";
import SendIcon from "@mui/icons-material/Send";
import SmartToyOutlinedIcon from "@mui/icons-material/SmartToyOutlined";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import TravelExploreIcon from "@mui/icons-material/TravelExplore";
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";
import CheckIcon from "@mui/icons-material/Check";
import RocketLaunchIcon from "@mui/icons-material/RocketLaunch";
import ReactMarkdown from "react-markdown";
import { AgentOutput, AgentOutputSection, ChatMessage } from "./types";
import { fetchLatestOutput, fetchOutputById, chatWithOutput, fetchAgent, fetchChatHistory, fetchAgentChatHistory, saveAgentFinalPrompt, runAgent } from "./agentService";

const POLL_INTERVAL_MS = 10_000;

const AgentOutputView: React.FC = () => {
  const { agentId, outputId } = useParams<{
    agentId?: string;
    outputId?: string;
  }>();
  const navigate = useNavigate();

  const [output, setOutput] = useState<AgentOutput | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Agent-level web search setting
  const [agentWebSearch, setAgentWebSearch] = useState(false);

  // Follow-up chat state
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [chatError, setChatError] = useState<string | null>(null);
  const [useWebSearch, setUseWebSearch] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Prompt save state
  const [hasUnsavedPromptChanges, setHasUnsavedPromptChanges] = useState(false);
  const [promptSaving, setPromptSaving] = useState(false);
  const [promptSaved, setPromptSaved] = useState(false);
  const [showExitDialog, setShowExitDialog] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState<string | null>(null);
  const [agentData, setAgentData] = useState<{ id: number; prompt?: string; final_prompt?: string } | null>(null);

  // Prompt tabs state
  const [promptTab, setPromptTab] = useState<"refined" | "original">("original");
  const [runLoading, setRunLoading] = useState(false);

  // Temporary output for Combined Prompt tab — shown in-place, not persisted to Current Interaction
  const [combinedRunOutput, setCombinedRunOutput] = useState<AgentOutput | null>(null);

  const loadOutput = useCallback(async () => {
    try {
      let data: AgentOutput | null = null;
      if (outputId) data = await fetchOutputById(Number(outputId));
      else if (agentId) data = await fetchLatestOutput(Number(agentId));
      setOutput(data);
      setError(null);
    } catch (err: any) {
      setError(err.message || "Failed to load output");
    } finally {
      setLoading(false);
    }
  }, [agentId, outputId]);

  // Load agent details to get web search setting
  useEffect(() => {
    const id = agentId || (output?.agent ? String(output.agent) : null);
    if (id) {
      fetchAgent(Number(id))
        .then((a) => {
          setAgentWebSearch(a.use_web_search ?? false);
          setUseWebSearch(a.use_web_search ?? false);
          setAgentData({ id: a.id, prompt: a.prompt, final_prompt: a.final_prompt });
        })
        .catch(() => {});
    }
  }, [agentId, output?.agent]);

  useEffect(() => { loadOutput(); }, [loadOutput]);

  // Load ALL chat history across ALL outputs for this agent (agent-level)
  useEffect(() => {
    if (!output || output.status !== "completed") return;
    const id = agentId || (output?.agent ? String(output.agent) : null);
    if (!id) return;
    // Load from DB when chatMessages is empty (initial load)
    if (chatMessages.length === 0) {
      const buildFallbackMessages = (): ChatMessage[] => {
        // Fallback: if DB has no chat history, construct from output data
        const msgs: ChatMessage[] = [];
        const prompt = output.agent_prompt || output.agent_description || "";
        if (prompt) msgs.push({ role: "user", content: prompt });
        if (output.result_json) {
          const parts: string[] = [];
          if (output.result_json.summary) parts.push(output.result_json.summary);
          output.result_json.sections?.forEach((s: any) => {
            if (s.title) parts.push(`**${s.title}**`);
            if (s.content) parts.push(s.content);
            if (s.items) s.items.forEach((item: any) => {
              if (typeof item === "string") parts.push(`- ${item}`);
              else if (item?.name || item?.title) parts.push(`- ${item.name || item.title}: ${item.value || item.description || ""}`);
            });
          });
          if (parts.length > 0) msgs.push({ role: "assistant", content: parts.join("\n\n") });
        }
        return msgs;
      };

      fetchAgentChatHistory(Number(id))
        .then((msgs) => {
          if (msgs.length > 0) {
            setChatMessages(msgs);
          } else {
            // No chat history in DB — build from output data as fallback
            setChatMessages(buildFallbackMessages());
          }
        })
        .catch(() => {
          // Fallback to output-level chat history
          fetchChatHistory(output.id)
            .then((msgs) => {
              if (msgs.length > 0) {
                setChatMessages(msgs);
              } else {
                setChatMessages(buildFallbackMessages());
              }
            })
            .catch(() => {
              setChatMessages(buildFallbackMessages());
            });
        });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [output?.id, output?.status, agentId]);

  useEffect(() => {
    if (!output || output.status === "completed" || output.status === "failed")
      return;
    const interval = setInterval(loadOutput, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [output, loadOutput]);

  // Auto-scroll to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages, chatLoading, output]);

  const handleChatSend = async () => {
    if (!chatInput.trim() || chatLoading || !output) return;

    const userMsg: ChatMessage = { role: "user", content: chatInput.trim() };
    const history = [...chatMessages];
    setChatMessages((prev) => [...prev, userMsg]);
    setChatInput("");
    setChatLoading(true);
    setChatError(null);
    setHasUnsavedPromptChanges(true);
    setPromptSaved(false);

    try {
      const response = await chatWithOutput(output.id, userMsg.content, history, useWebSearch);
      setChatMessages((prev) => [...prev, { role: "assistant", content: response }]);
    } catch (err: any) {
      setChatError(err.message || "Failed to get response");
    } finally {
      setChatLoading(false);
    }
  };

  const handleChatKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleChatSend();
    }
  };

  // Save final prompt handler — sends original + follow-ups to backend,
  // which uses Claude to intelligently refine them into one clean prompt
  const handleSavePrompt = async () => {
    const targetId = agentData?.id || (agentId ? Number(agentId) : null);
    if (!targetId) return;

    const originalPrompt = agentData?.prompt || output?.agent_prompt || "";
    const userFollowUps = chatMessages
      .filter((m) => m.role === "user")
      .map((m) => m.content)
      .filter((c) => c.trim().length > 0);

    if (!originalPrompt || userFollowUps.length === 0) return;

    setPromptSaving(true);
    try {
      const result = await saveAgentFinalPrompt(targetId, originalPrompt, userFollowUps);
      const refined = result.refined_prompt || result.final_prompt || "";
      setHasUnsavedPromptChanges(false);
      setPromptSaved(true);
      setAgentData((prev) => prev ? { ...prev, final_prompt: refined } : prev);
      // Stay on Current Interaction tab — user can view Combined Prompt tab when ready
      setTimeout(() => setPromptSaved(false), 3000);
    } catch {
      setChatError("Failed to save prompt. Please try again.");
    } finally {
      setPromptSaving(false);
    }
  };

  // beforeunload guard for unsaved changes
  useEffect(() => {
    if (!hasUnsavedPromptChanges) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [hasUnsavedPromptChanges]);

  // Run agent handler — shows results temporarily in Combined Prompt tab
  const handleRunAgent = async () => {
    const targetId = agentData?.id || (agentId ? Number(agentId) : null);
    if (!targetId) return;
    setRunLoading(true);
    // Clear previous temporary results
    setCombinedRunOutput({ status: "pending", result_json: null, error_message: "" } as any);
    try {
      const result = await runAgent(targetId);
      const newOutputId = result.output_id;
      // Poll for the new output to complete (separate from main output)
      const pollForResult = async (retries = 30) => {
        for (let i = 0; i < retries; i++) {
          await new Promise((r) => setTimeout(r, 5000));
          try {
            const data = await fetchOutputById(newOutputId);
            setCombinedRunOutput(data);
            if (data.status === "completed" || data.status === "failed") {
              setRunLoading(false);
              return;
            }
          } catch {
            // Keep polling
          }
        }
        setRunLoading(false);
      };
      pollForResult();
    } catch {
      setChatError("Failed to run agent. Please try again.");
      setCombinedRunOutput(null);
      setRunLoading(false);
    }
  };

  // Navigation guard
  const handleNavigateBack = (path: string) => {
    if (hasUnsavedPromptChanges) {
      setPendingNavigation(path);
      setShowExitDialog(true);
    } else {
      navigate(path);
    }
  };

  const handleExitWithoutSaving = () => {
    setShowExitDialog(false);
    setHasUnsavedPromptChanges(false);
    if (pendingNavigation) navigate(pendingNavigation);
  };

  const handleSaveAndExit = async () => {
    await handleSavePrompt();
    setShowExitDialog(false);
    if (pendingNavigation) navigate(pendingNavigation);
  };

  const statusConfig: Record<
    string,
    { color: string; bg: string; icon: React.ReactNode; label: string }
  > = {
    pending: {
      color: "#d97706",
      bg: "#fffbeb",
      icon: <HourglassEmptyIcon />,
      label: "Agent Working",
    },
    running: {
      color: "#d97706",
      bg: "#fffbeb",
      icon: <HourglassEmptyIcon />,
      label: "Agent Processing",
    },
    completed: {
      color: "#059669",
      bg: "#ecfdf5",
      icon: <CheckCircleOutlineIcon />,
      label: "Completed",
    },
    failed: {
      color: "#dc2626",
      bg: "#fef2f2",
      icon: <ErrorOutlineIcon />,
      label: "Failed",
    },
  };

  /* Loading */
  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "80vh",
          gap: 2,
        }}
      >
        <CircularProgress sx={{ color: "#4f46e5" }} />
        <Typography sx={{ color: "#1e293b", fontWeight: 500 }}>
          Loading agent output...
        </Typography>
      </Box>
    );
  }

  /* Error */
  if (error) {
    return (
      <Box sx={{ bgcolor: "#e8eaf0", minHeight: "100vh", p: 4 }}>
        <Box sx={{ maxWidth: 1000, mx: "auto" }}>
          <Alert severity="error" sx={{ borderRadius: 3, mb: 2 }}>{error}</Alert>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => handleNavigateBack("/agents/dashboard")}
            sx={{ textTransform: "none", fontWeight: 600 }}
          >
            Back to Agents
          </Button>
        </Box>
      </Box>
    );
  }

  /* No output */
  if (!output) {
    return (
      <Box sx={{ bgcolor: "#e8eaf0", minHeight: "100vh", p: 4 }}>
        <Box sx={{ maxWidth: 560, mx: "auto", textAlign: "center", py: 10 }}>
          <Box
            sx={{
              width: 64,
              height: 64,
              borderRadius: 3,
              bgcolor: "#fffbeb",
              border: "1px solid #fde68a",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              mx: "auto",
              mb: 3,
            }}
          >
            <HourglassEmptyIcon sx={{ fontSize: 32, color: "#d97706" }} />
          </Box>
          <Typography sx={{ fontWeight: 700, fontSize: "1.15rem", color: "#111827", mb: 1 }}>
            No output available yet
          </Typography>
          <Typography sx={{ color: "#1e293b", mb: 4, lineHeight: 1.7 }}>
            This agent hasn't been run yet or is still processing. Results
            will appear here once ready.
          </Typography>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => handleNavigateBack("/agents/dashboard")}
            sx={{ textTransform: "none", fontWeight: 600, color: "#4f46e5" }}
          >
            Back to Agents
          </Button>
        </Box>
      </Box>
    );
  }

  const statusInfo = statusConfig[output.status] || statusConfig.pending;
  // Fallback prompt text for Combined Prompt tab
  const agentPrompt = output.agent_prompt || output.agent_description || "";

  return (
    <Box sx={{ bgcolor: "#e8eaf0", minHeight: "100vh" }}>
      {/* Header */}
      <Box
        sx={{
          bgcolor: "#fff",
          borderBottom: "1px solid #c7d2fe",
          px: { xs: 2, md: 5 },
          py: 2.5,
        }}
      >
        <Box sx={{ maxWidth: 1000, mx: "auto" }}>
          <Stack
            direction={{ xs: "column", md: "row" }}
            alignItems={{ xs: "flex-start", md: "center" }}
            justifyContent="space-between"
            spacing={2}
          >
            <Stack direction="row" alignItems="center" spacing={2}>
              <Button
                startIcon={<ArrowBackIcon />}
                onClick={() => handleNavigateBack("/agents/dashboard")}
                sx={{
                  textTransform: "none",
                  color: "#1e293b",
                  fontWeight: 600,
                  borderRadius: 2,
                  "&:hover": { bgcolor: "#e0e7ff" },
                }}
              >
                Back
              </Button>
              <Box
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: 2,
                  bgcolor: "#4f46e5",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <SmartToyOutlinedIcon sx={{ color: "#fff", fontSize: 20 }} />
              </Box>
              <Typography sx={{ fontWeight: 700, fontSize: "1.15rem", color: "#111827" }}>
                {output.agent_name}
              </Typography>
            </Stack>

            <Stack direction="row" alignItems="center" spacing={1.5}>
              <Chip
                icon={statusInfo.icon as React.ReactElement}
                label={statusInfo.label}
                size="small"
                sx={{
                  bgcolor: statusInfo.bg,
                  color: statusInfo.color,
                  fontWeight: 700,
                  fontSize: "0.75rem",
                  "& .MuiChip-icon": { color: statusInfo.color },
                }}
              />
              {(output.status === "pending" || output.status === "running") && (
                <CircularProgress size={16} sx={{ color: "#d97706" }} />
              )}
              <Button
                size="small"
                startIcon={<RefreshIcon sx={{ fontSize: 16 }} />}
                onClick={loadOutput}
                sx={{
                  textTransform: "none",
                  color: "#1e293b",
                  fontWeight: 600,
                  borderRadius: 2,
                  "&:hover": { bgcolor: "#e0e7ff" },
                }}
              >
                Refresh
              </Button>
            </Stack>
          </Stack>

          {/* Meta */}
          <Stack direction="row" spacing={3} mt={1.5} flexWrap="wrap">
            <Typography sx={{ fontSize: "0.78rem", color: "#1e293b" }}>
              Run: {new Date(output.created_at).toLocaleString("en-IN")}
            </Typography>
            {output.completed_at && (
              <Typography sx={{ fontSize: "0.78rem", color: "#1e293b" }}>
                Completed: {new Date(output.completed_at).toLocaleString("en-IN")}
              </Typography>
            )}
            {output.triggered_by_email && (
              <Typography sx={{ fontSize: "0.78rem", color: "#1e293b" }}>
                By: {output.triggered_by_email}
              </Typography>
            )}
            {agentWebSearch && (
              <Chip
                icon={<TravelExploreIcon sx={{ fontSize: 14 }} />}
                label="Web Search Enabled"
                size="small"
                sx={{ bgcolor: "#ecfdf5", color: "#059669", fontWeight: 600, fontSize: "0.7rem" }}
              />
            )}
          </Stack>
        </Box>
      </Box>

      {/* ── Tabs Section ── */}
      <Box sx={{ maxWidth: 1000, mx: "auto", px: { xs: 2, md: 5 }, pt: 3, pb: 3 }}>
        {/* Tab Bar */}
        <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
          <Button
            size="small"
            onClick={() => setPromptTab("original")}
            sx={{
              textTransform: "none",
              fontWeight: 700,
              fontSize: "0.82rem",
              borderRadius: 2.5,
              px: 2.5,
              py: 0.8,
              ...(promptTab === "original"
                ? { bgcolor: "#4f46e5", color: "#fff", "&:hover": { bgcolor: "#4338ca" } }
                : { bgcolor: "#fff", color: "#4f46e5", border: "1px solid #c7d2fe", "&:hover": { bgcolor: "#eef2ff" } }),
            }}
          >
            Current Interaction
          </Button>
          <Button
            size="small"
            onClick={() => setPromptTab("refined")}
            sx={{
              textTransform: "none",
              fontWeight: 700,
              fontSize: "0.82rem",
              borderRadius: 2.5,
              px: 2.5,
              py: 0.8,
              ...(promptTab === "refined"
                ? { bgcolor: "#4f46e5", color: "#fff", "&:hover": { bgcolor: "#4338ca" } }
                : { bgcolor: "#fff", color: "#4f46e5", border: "1px solid #c7d2fe", "&:hover": { bgcolor: "#eef2ff" } }),
            }}
          >
            Combined Prompt
          </Button>
        </Stack>

        {/* ══════════ COMBINED PROMPT TAB ══════════ */}
        {promptTab === "refined" && (
          <Box
            sx={{
              bgcolor: "#fff",
              borderRadius: 4,
              border: "1px solid #c7d2fe",
              overflow: "hidden",
            }}
          >
            {/* Prompt Display */}
            <Box sx={{ p: { xs: 2, md: 3 } }}>
              <Box
                sx={{
                  p: 2.5,
                  bgcolor: "#eef2ff",
                  borderRadius: 3,
                  border: "1px solid #c7d2fe",
                }}
              >
                <Typography
                  sx={{
                    fontSize: "0.7rem",
                    color: "#4f46e5",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                    mb: 1,
                  }}
                >
                  {agentData?.final_prompt?.trim() ? "Combined Prompt" : "Current Prompt"}
                </Typography>
                <Typography
                  sx={{
                    fontSize: "0.92rem",
                    lineHeight: 1.7,
                    color: "#1e293b",
                    whiteSpace: "pre-wrap",
                    wordBreak: "break-word",
                  }}
                >
                  {agentData?.final_prompt?.trim() || agentPrompt}
                </Typography>
              </Box>
              <Stack direction="row" justifyContent="flex-end" mt={2}>
                <Button
                  variant="contained"
                  onClick={handleRunAgent}
                  disabled={runLoading}
                  startIcon={
                    runLoading ? (
                      <CircularProgress size={14} sx={{ color: "#fff" }} />
                    ) : (
                      <RocketLaunchIcon sx={{ fontSize: 16 }} />
                    )
                  }
                  sx={{
                    textTransform: "none",
                    fontWeight: 700,
                    fontSize: "0.85rem",
                    borderRadius: 2.5,
                    px: 3,
                    py: 1,
                    bgcolor: "#4f46e5",
                    boxShadow: "none",
                    "&:hover": { bgcolor: "#4338ca", boxShadow: "0 4px 12px rgba(79,70,229,0.25)" },
                  }}
                >
                  {runLoading ? "Running..." : "Run Agent"}
                </Button>
              </Stack>
            </Box>

            {/* Temporary Results from Run Agent (not stored, shown in-place) */}
            {combinedRunOutput && combinedRunOutput.status === "pending" && (
              <Box sx={{ p: { xs: 2, md: 3 }, pt: 0 }}>
                <Box
                  sx={{
                    p: 3,
                    borderRadius: 3,
                    bgcolor: "#f8fafc",
                    borderLeft: "3px solid #4f46e5",
                    textAlign: "center",
                  }}
                >
                  <CircularProgress size={24} sx={{ color: "#d97706", mb: 1.5 }} />
                  <Typography sx={{ fontWeight: 600, color: "#111827", fontSize: "0.92rem" }}>
                    Agent is working on your request...
                  </Typography>
                  <Typography sx={{ color: "#64748b", fontSize: "0.82rem", mt: 0.5 }}>
                    Results will appear here automatically.
                  </Typography>
                </Box>
              </Box>
            )}

            {combinedRunOutput && combinedRunOutput.status === "running" && (
              <Box sx={{ p: { xs: 2, md: 3 }, pt: 0 }}>
                <Box
                  sx={{
                    p: 3,
                    borderRadius: 3,
                    bgcolor: "#f8fafc",
                    borderLeft: "3px solid #4f46e5",
                    textAlign: "center",
                  }}
                >
                  <CircularProgress size={24} sx={{ color: "#d97706", mb: 1.5 }} />
                  <Typography sx={{ fontWeight: 600, color: "#111827", fontSize: "0.92rem" }}>
                    Agent is processing...
                  </Typography>
                  <Typography sx={{ color: "#64748b", fontSize: "0.82rem", mt: 0.5 }}>
                    Results will appear here automatically.
                  </Typography>
                </Box>
              </Box>
            )}

            {combinedRunOutput && combinedRunOutput.status === "failed" && (
              <Box sx={{ p: { xs: 2, md: 3 }, pt: 0 }}>
                <Box
                  sx={{
                    p: 2.5,
                    borderRadius: 3,
                    bgcolor: "#fef2f2",
                    borderLeft: "3px solid #dc2626",
                  }}
                >
                  <Alert severity="error" sx={{ borderRadius: 2, mb: 1 }}>
                    Agent execution failed
                  </Alert>
                  {combinedRunOutput.error_message && (
                    <Typography
                      sx={{
                        fontFamily: "monospace",
                        whiteSpace: "pre-wrap",
                        fontSize: "0.82rem",
                        color: "#1e293b",
                        p: 1.5,
                        bgcolor: "#fff",
                        borderRadius: 2,
                        border: "1px solid #fecaca",
                      }}
                    >
                      {combinedRunOutput.error_message}
                    </Typography>
                  )}
                </Box>
              </Box>
            )}

            {combinedRunOutput && combinedRunOutput.status === "completed" && combinedRunOutput.result_json && (
              <Box sx={{ p: { xs: 2, md: 3 }, pt: 0 }}>
                <Box
                  sx={{
                    borderRadius: 3,
                    bgcolor: "#f8fafc",
                    borderLeft: "3px solid #4f46e5",
                    overflow: "hidden",
                  }}
                >
                  {combinedRunOutput.result_json.summary && (
                    <Box sx={{ p: 2.5, borderBottom: "1px solid #e2e8f0", bgcolor: "#eef2ff" }}>
                      <Typography
                        sx={{
                          fontSize: "0.7rem",
                          color: "#4f46e5",
                          fontWeight: 700,
                          textTransform: "uppercase",
                          letterSpacing: "0.06em",
                          mb: 0.8,
                        }}
                      >
                        Executive Summary
                      </Typography>
                      <Typography sx={{ fontWeight: 600, color: "#111827", lineHeight: 1.7, fontSize: "0.92rem" }}>
                        {combinedRunOutput.result_json.summary}
                      </Typography>
                    </Box>
                  )}
                  {combinedRunOutput.result_json.sections?.map((section: AgentOutputSection, idx: number) => (
                    <Box
                      key={idx}
                      sx={{
                        p: 2.5,
                        borderBottom: idx < (combinedRunOutput.result_json?.sections?.length || 0) - 1 ? "1px solid #e2e8f0" : "none",
                      }}
                    >
                      <Typography sx={{ fontWeight: 700, fontSize: "0.92rem", color: "#111827", mb: 1.5 }}>
                        {section.title}
                      </Typography>
                      <SectionRenderer section={section} />
                    </Box>
                  ))}
                  {combinedRunOutput.result_json.metadata && (
                    <Box sx={{ p: 2, bgcolor: "#eef2ff", borderTop: "1px solid #e2e8f0" }}>
                      <Stack direction="row" spacing={1} flexWrap="wrap">
                        {combinedRunOutput.result_json.metadata.confidence && (
                          <Chip
                            label={`Confidence: ${combinedRunOutput.result_json.metadata.confidence}`}
                            size="small"
                            sx={{
                              fontWeight: 700,
                              borderRadius: 2,
                              fontSize: "0.7rem",
                              bgcolor: combinedRunOutput.result_json.metadata.confidence === "high" ? "#ecfdf5" : combinedRunOutput.result_json.metadata.confidence === "medium" ? "#fffbeb" : "#fef2f2",
                              color: combinedRunOutput.result_json.metadata.confidence === "high" ? "#059669" : combinedRunOutput.result_json.metadata.confidence === "medium" ? "#d97706" : "#dc2626",
                            }}
                          />
                        )}
                        {combinedRunOutput.result_json.metadata.analysis_date && (
                          <Chip label={`Analysis: ${combinedRunOutput.result_json.metadata.analysis_date}`} size="small" variant="outlined" sx={{ borderRadius: 2, fontWeight: 600, fontSize: "0.7rem" }} />
                        )}
                        {combinedRunOutput.result_json.metadata.data_sources?.map((src: string, i: number) => (
                          <Chip key={i} label={src} size="small" variant="outlined" sx={{ borderRadius: 2, fontWeight: 500, fontSize: "0.7rem" }} />
                        ))}
                      </Stack>
                    </Box>
                  )}
                </Box>
              </Box>
            )}

          </Box>
        )}

        {/* ══════════ CURRENT INTERACTION TAB ══════════ */}
        {promptTab === "original" && (
          <Box
            sx={{
              bgcolor: "#fff",
              borderRadius: 4,
              border: "1px solid #c7d2fe",
              overflow: "hidden",
            }}
          >
            {/* Conversation Container — all messages (initial + follow-ups) from DB chat history */}
            <Box
              sx={{
                maxHeight: "calc(100vh - 350px)",
                overflowY: "auto",
                p: { xs: 2, md: 3 },
                display: "flex",
                flexDirection: "column",
                gap: 2.5,
              }}
            >
              {/* Pending/Running state */}
              {(output.status === "pending" || output.status === "running") && chatMessages.length === 0 && (
                <Box sx={{ textAlign: "center", py: 4 }}>
                  <CircularProgress size={24} sx={{ color: "#d97706", mb: 1.5 }} />
                  <Typography sx={{ fontWeight: 600, color: "#111827", fontSize: "0.92rem" }}>
                    Agent is working on your request...
                  </Typography>
                  <Typography sx={{ color: "#64748b", fontSize: "0.82rem", mt: 0.5 }}>
                    Results will appear here automatically.
                  </Typography>
                </Box>
              )}

              {/* All Chat Messages (initial prompt+response + follow-ups) */}
              {chatMessages.map((msg, idx) => (
                <Box
                  key={`chat-${idx}`}
                  sx={{
                    display: "flex",
                    justifyContent: msg.role === "user" ? "flex-end" : "flex-start",
                  }}
                >
                  <Box sx={{ maxWidth: "85%" }}>
                    <Stack
                      direction="row"
                      alignItems="center"
                      spacing={1}
                      mb={0.5}
                      justifyContent={msg.role === "user" ? "flex-end" : "flex-start"}
                    >
                      {msg.role === "user" ? (
                        <>
                          <Typography sx={{ fontSize: "0.7rem", color: "#64748b", fontWeight: 600 }}>
                            Follow-up
                          </Typography>
                          <PersonOutlineIcon sx={{ fontSize: 14, color: "#64748b" }} />
                        </>
                      ) : (
                        <>
                          <SmartToyOutlinedIcon sx={{ fontSize: 14, color: "#4f46e5" }} />
                          <Typography sx={{ fontSize: "0.7rem", color: "#4f46e5", fontWeight: 600 }}>
                            {output?.agent_name}
                          </Typography>
                        </>
                      )}
                    </Stack>
                    <Box
                      sx={{
                        p: 2.5,
                        borderRadius: 3,
                        ...(msg.role === "user"
                          ? { bgcolor: "#4f46e5", color: "#fff", borderBottomRightRadius: 4 }
                          : { bgcolor: "#f8fafc", color: "#1e293b", borderLeft: "3px solid #4f46e5", borderBottomLeftRadius: 4 }),
                      }}
                    >
                      {msg.role === "assistant" ? (
                        <MarkdownContent content={msg.content} isLight={false} />
                      ) : (
                        <Typography sx={{ fontSize: "0.88rem", lineHeight: 1.7, whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
                          {msg.content}
                        </Typography>
                      )}
                    </Box>
                  </Box>
                </Box>
              ))}

              {/* Loading indicator */}
              {chatLoading && (
                <Box sx={{ display: "flex", justifyContent: "flex-start" }}>
                  <Box sx={{ maxWidth: "85%" }}>
                    <Stack direction="row" alignItems="center" spacing={1} mb={0.5}>
                      <SmartToyOutlinedIcon sx={{ fontSize: 14, color: "#4f46e5" }} />
                      <Typography sx={{ fontSize: "0.7rem", color: "#4f46e5", fontWeight: 600 }}>
                        {output?.agent_name}
                      </Typography>
                    </Stack>
                    <Box
                      sx={{
                        p: 2,
                        borderRadius: 3,
                        bgcolor: "#f8fafc",
                        borderLeft: "3px solid #4f46e5",
                        display: "flex",
                        alignItems: "center",
                        gap: 1.5,
                      }}
                    >
                      <CircularProgress size={16} sx={{ color: "#4f46e5" }} />
                      <Typography sx={{ fontSize: "0.85rem", color: "#64748b" }}>
                        {useWebSearch ? "Searching the web and thinking..." : "Thinking..."}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              )}

              {/* Empty state if no chats yet */}
              {chatMessages.length === 0 && output.status === "completed" && (
                <Box sx={{ textAlign: "center", py: 4 }}>
                  <Typography sx={{ color: "#94a3b8", fontSize: "0.88rem" }}>
                    No chat history yet. Ask a follow-up question below.
                  </Typography>
                </Box>
              )}

              <div ref={chatEndRef} />
            </Box>

            {/* Chat Input Area (only for completed outputs) */}
            {output.status === "completed" && (
            <Box
              sx={{
                borderTop: "1px solid #e2e8f0",
                p: { xs: 2, md: 2.5 },
                bgcolor: "#fafbfc",
              }}
            >
              {/* Chat Error */}
              {chatError && (
                <Alert
                  severity="error"
                  sx={{ borderRadius: 2, mb: 1.5, fontSize: "0.85rem" }}
                  onClose={() => setChatError(null)}
                >
                  {chatError}
                </Alert>
              )}

              {/* Web Search Toggle */}
              <Stack direction="row" alignItems="center" justifyContent="space-between" mb={1}>
                <Stack direction="row" alignItems="center" spacing={1.5}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        size="small"
                        checked={useWebSearch}
                        onChange={(e) => setUseWebSearch(e.target.checked)}
                        sx={{
                          color: "#94a3b8",
                          "&.Mui-checked": { color: "#059669" },
                          p: 0.5,
                        }}
                      />
                    }
                    label={
                      <Stack direction="row" alignItems="center" spacing={0.5}>
                        <TravelExploreIcon
                          sx={{ fontSize: 16, color: useWebSearch ? "#059669" : "#94a3b8" }}
                        />
                        <Typography
                          sx={{
                            fontSize: "0.75rem",
                            color: useWebSearch ? "#059669" : "#94a3b8",
                            fontWeight: 600,
                          }}
                        >
                          Web Search
                        </Typography>
                      </Stack>
                    }
                    sx={{ ml: 0, mr: 0 }}
                  />
                  <Button
                    size="small"
                    onClick={handleSavePrompt}
                    disabled={!hasUnsavedPromptChanges || promptSaving}
                    startIcon={
                      promptSaving ? (
                        <CircularProgress size={12} sx={{ color: "#4f46e5" }} />
                      ) : promptSaved ? (
                        <CheckIcon sx={{ fontSize: 14 }} />
                      ) : (
                        <SaveOutlinedIcon sx={{ fontSize: 14 }} />
                      )
                    }
                    sx={{
                      textTransform: "none",
                      fontWeight: 600,
                      fontSize: "0.75rem",
                      borderRadius: 2,
                      px: 1.5,
                      py: 0.3,
                      color: promptSaved ? "#059669" : hasUnsavedPromptChanges ? "#4f46e5" : "#94a3b8",
                      bgcolor: promptSaved ? "#ecfdf5" : hasUnsavedPromptChanges ? "#eef2ff" : "transparent",
                      border: `1px solid ${promptSaved ? "#a7f3d0" : hasUnsavedPromptChanges ? "#c7d2fe" : "#e2e8f0"}`,
                      "&:hover": {
                        bgcolor: promptSaved ? "#ecfdf5" : "#e0e7ff",
                      },
                      "&.Mui-disabled": {
                        color: "#94a3b8",
                        borderColor: "#e2e8f0",
                      },
                    }}
                  >
                    {promptSaving ? "Saving..." : promptSaved ? "Prompt Saved" : "Save Prompt"}
                  </Button>
                </Stack>
                <Typography sx={{ fontSize: "0.72rem", color: "#94a3b8" }}>
                  Press Enter to send, Shift+Enter for new line
                </Typography>
              </Stack>

              {/* Input */}
              <TextField
                fullWidth
                multiline
                maxRows={3}
                placeholder="Ask a follow-up question about this analysis..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={handleChatKeyDown}
                disabled={chatLoading}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 3,
                    bgcolor: "#fff",
                    fontSize: "0.88rem",
                    "& fieldset": { borderColor: "#c7d2fe" },
                    "&:hover fieldset": { borderColor: "#a5b4fc" },
                    "&.Mui-focused fieldset": { borderColor: "#4f46e5" },
                  },
                }}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={handleChatSend}
                        disabled={!chatInput.trim() || chatLoading}
                        sx={{
                          color: chatInput.trim() && !chatLoading ? "#4f46e5" : "#94a3b8",
                          "&:hover": { bgcolor: "#eef2ff" },
                        }}
                      >
                        <SendIcon sx={{ fontSize: 20 }} />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Box>
          )}
        </Box>
        )}
      </Box>

      {/* Exit Confirmation Dialog */}
      <Dialog
        open={showExitDialog}
        onClose={() => setShowExitDialog(false)}
        PaperProps={{
          sx: { borderRadius: 3, border: "1px solid #c7d2fe", maxWidth: 420 },
        }}
      >
        <DialogTitle sx={{ fontWeight: 700, fontSize: "1rem", color: "#111827" }}>
          Unsaved Prompt Changes
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ fontSize: "0.88rem", color: "#475569" }}>
            You have follow-up prompts that haven't been saved. Do you want to save
            the combined prompt before leaving?
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
          <Button
            onClick={handleExitWithoutSaving}
            sx={{
              textTransform: "none",
              fontWeight: 600,
              color: "#64748b",
              borderRadius: 2,
            }}
          >
            Leave Without Saving
          </Button>
          <Button
            variant="contained"
            onClick={handleSaveAndExit}
            disabled={promptSaving}
            startIcon={
              promptSaving ? (
                <CircularProgress size={14} sx={{ color: "#fff" }} />
              ) : (
                <SaveOutlinedIcon sx={{ fontSize: 16 }} />
              )
            }
            sx={{
              textTransform: "none",
              fontWeight: 700,
              borderRadius: 2,
              bgcolor: "#4f46e5",
              "&:hover": { bgcolor: "#4338ca" },
            }}
          >
            Save & Leave
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

/** Strip <cite index="...">...</cite> tags from web search responses, keeping inner text */
const stripCiteTags = (text: string): string =>
  text.replace(/<cite\s+index="[^"]*">/gi, "").replace(/<\/cite>/gi, "");

/** Renders markdown content with proper styling */
const MarkdownContent: React.FC<{ content: string; isLight?: boolean }> = ({ content: rawContent, isLight }) => {
  const content = stripCiteTags(rawContent);
  return (
  <Box
    sx={{
      fontSize: "0.88rem",
      lineHeight: 1.8,
      color: isLight ? "#fff" : "#1e293b",
      wordBreak: "break-word",
      "& h1": { fontSize: "1.3rem", fontWeight: 700, mt: 2, mb: 1, color: isLight ? "#fff" : "#111827" },
      "& h2": { fontSize: "1.1rem", fontWeight: 700, mt: 2, mb: 1, color: isLight ? "#fff" : "#111827" },
      "& h3": { fontSize: "0.95rem", fontWeight: 700, mt: 1.5, mb: 0.8, color: isLight ? "#fff" : "#111827" },
      "& h4": { fontSize: "0.9rem", fontWeight: 600, mt: 1, mb: 0.5 },
      "& p": { mb: 1.2, mt: 0, lineHeight: 1.8 },
      "& ul, & ol": { pl: 2.5, mb: 1.2, mt: 0 },
      "& li": { mb: 0.5, "&::marker": { color: isLight ? "#c7d2fe" : "#4f46e5" } },
      "& strong": { fontWeight: 700 },
      "& em": { fontStyle: "italic" },
      "& code": {
        bgcolor: isLight ? "rgba(255,255,255,0.15)" : "#eef2ff",
        px: 0.8,
        py: 0.2,
        borderRadius: 1,
        fontSize: "0.82rem",
        fontFamily: "monospace",
      },
      "& pre": {
        bgcolor: isLight ? "rgba(0,0,0,0.2)" : "#f1f5f9",
        p: 1.5,
        borderRadius: 2,
        overflow: "auto",
        mb: 1.5,
        "& code": { bgcolor: "transparent", p: 0 },
      },
      "& blockquote": {
        borderLeft: isLight ? "3px solid rgba(255,255,255,0.4)" : "3px solid #4f46e5",
        pl: 2,
        ml: 0,
        color: isLight ? "rgba(255,255,255,0.85)" : "#475569",
        fontStyle: "italic",
      },
      "& a": { color: isLight ? "#a5b4fc" : "#4f46e5", textDecoration: "underline" },
      "& hr": { border: "none", borderTop: "1px solid", borderColor: isLight ? "rgba(255,255,255,0.2)" : "#e2e8f0", my: 1.5 },
      "& table": { borderCollapse: "collapse", width: "100%", mb: 1.5 },
      "& th, & td": {
        border: "1px solid",
        borderColor: isLight ? "rgba(255,255,255,0.2)" : "#e2e8f0",
        px: 1.5,
        py: 0.8,
        fontSize: "0.82rem",
        textAlign: "left",
      },
      "& th": { bgcolor: isLight ? "rgba(255,255,255,0.1)" : "#eef2ff", fontWeight: 700 },
    }}
  >
    <ReactMarkdown>{content}</ReactMarkdown>
  </Box>
  );
};

/** Renders a single section based on its type */
const SectionRenderer: React.FC<{ section: AgentOutputSection }> = ({ section }) => {
  if (section.type === "text") {
    const content = section.content || "";
    // If text content contains embedded JSON with sections, try to render it structured
    if (content.trim().startsWith("{") && content.includes('"sections"')) {
      try {
        const parsed = JSON.parse(content);
        if (parsed.sections && Array.isArray(parsed.sections)) {
          return (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {parsed.summary && (
                <Typography sx={{ fontWeight: 600, color: "#111827", lineHeight: 1.7, fontSize: "0.92rem", mb: 1 }}>
                  {parsed.summary}
                </Typography>
              )}
              {parsed.sections.map((s: AgentOutputSection, i: number) => (
                <Box key={i}>
                  <Typography sx={{ fontWeight: 700, fontSize: "0.92rem", color: "#111827", mb: 1 }}>
                    {s.title}
                  </Typography>
                  <SectionRenderer section={s} />
                </Box>
              ))}
            </Box>
          );
        }
      } catch {
        // Not valid JSON, render as markdown
      }
    }
    return <MarkdownContent content={content} />;
  }

  if (section.type === "list" && section.items) {
    return (
      <Box component="ul" sx={{ pl: 2.5, m: 0 }}>
        {section.items.map((item, i) => (
          <Box component="li" key={i} sx={{ mb: 0.8, "&::marker": { color: "#4f46e5" } }}>
            <Typography sx={{ fontSize: "0.88rem", color: "#1e293b", lineHeight: 1.7 }}>
              {typeof item === "string" ? stripCiteTags(item) : item}
            </Typography>
          </Box>
        ))}
      </Box>
    );
  }

  if (section.type === "table" && section.headers && section.rows) {
    return (
      <TableContainer
        sx={{
          borderRadius: 2.5,
          border: "1px solid #e2e8f0",
          overflow: "hidden",
        }}
      >
        <Table size="small">
          <TableHead>
            <TableRow sx={{ bgcolor: "#eef2ff" }}>
              {section.headers.map((h, i) => (
                <TableCell
                  key={i}
                  sx={{
                    fontWeight: 700,
                    color: "#111827",
                    fontSize: "0.78rem",
                    borderBottom: "2px solid #e8e8ef",
                  }}
                >
                  {stripCiteTags(h)}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {section.rows.map((row, i) => (
              <TableRow
                key={i}
                sx={{
                  "&:nth-of-type(even)": { bgcolor: "#fafafa" },
                  "&:hover": { bgcolor: "#e0e7ff" },
                  transition: "background 0.15s",
                }}
              >
                {row.map((cell, j) => (
                  <TableCell key={j} sx={{ fontSize: "0.82rem", color: "#1e293b" }}>
                    {stripCiteTags(String(cell))}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  }

  return (
    <Typography
      sx={{ fontFamily: "monospace", fontSize: "0.78rem", color: "#1e293b", whiteSpace: "pre-wrap" }}
    >
      {JSON.stringify(section, null, 2)}
    </Typography>
  );
};

export default AgentOutputView;
