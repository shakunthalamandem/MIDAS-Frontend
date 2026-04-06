import React, { useCallback, useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  Checkbox,
  Chip,
  CircularProgress,
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
import ReactMarkdown from "react-markdown";
import { AgentOutput, AgentOutputSection, ChatMessage } from "./types";
import { fetchLatestOutput, fetchOutputById, chatWithOutput, fetchAgent, fetchChatHistory } from "./agentService";

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
        })
        .catch(() => {});
    }
  }, [agentId, output?.agent]);

  useEffect(() => { loadOutput(); }, [loadOutput]);

  // Load saved chat history when output is ready
  useEffect(() => {
    if (!output || output.status !== "completed") return;
    fetchChatHistory(output.id)
      .then((msgs) => {
        if (msgs.length > 0) setChatMessages(msgs);
      })
      .catch(() => {});
  }, [output?.id, output?.status]);

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
            onClick={() => navigate("/agents/dashboard")}
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
            onClick={() => navigate("/agents/dashboard")}
            sx={{ textTransform: "none", fontWeight: 600, color: "#4f46e5" }}
          >
            Back to Agents
          </Button>
        </Box>
      </Box>
    );
  }

  const statusInfo = statusConfig[output.status] || statusConfig.pending;
  const resultJson = output.result_json;
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
                onClick={() => navigate("/agents/dashboard")}
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

      {/* ── Continuous Conversation Flow ── */}
      <Box sx={{ maxWidth: 1000, mx: "auto", px: { xs: 2, md: 5 }, py: 4 }}>
        <Box
          sx={{
            bgcolor: "#fff",
            borderRadius: 4,
            border: "1px solid #c7d2fe",
            overflow: "hidden",
          }}
        >
          {/* Conversation Container */}
          <Box
            sx={{
              maxHeight: "calc(100vh - 300px)",
              overflowY: "auto",
              p: { xs: 2, md: 3 },
              display: "flex",
              flexDirection: "column",
              gap: 2.5,
            }}
          >
            {/* ── 1. Original Prompt (User Message) ── */}
            {agentPrompt && (
              <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                <Box sx={{ maxWidth: "85%" }}>
                  <Stack direction="row" alignItems="center" spacing={1} mb={0.5} justifyContent="flex-end">
                    <Typography sx={{ fontSize: "0.7rem", color: "#64748b", fontWeight: 600 }}>
                      Your Prompt
                    </Typography>
                    <PersonOutlineIcon sx={{ fontSize: 14, color: "#64748b" }} />
                  </Stack>
                  <Box
                    sx={{
                      p: 2.5,
                      borderRadius: 3,
                      bgcolor: "#4f46e5",
                      color: "#fff",
                      borderBottomRightRadius: 4,
                    }}
                  >
                    <Typography
                      sx={{
                        fontSize: "0.88rem",
                        lineHeight: 1.7,
                        whiteSpace: "pre-wrap",
                        wordBreak: "break-word",
                      }}
                    >
                      {agentPrompt}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            )}

            {/* ── 2. Agent Response ── */}
            {/* Pending / Running */}
            {(output.status === "pending" || output.status === "running") && (
              <Box sx={{ display: "flex", justifyContent: "flex-start" }}>
                <Box sx={{ maxWidth: "85%" }}>
                  <Stack direction="row" alignItems="center" spacing={1} mb={0.5}>
                    <SmartToyOutlinedIcon sx={{ fontSize: 14, color: "#4f46e5" }} />
                    <Typography sx={{ fontSize: "0.7rem", color: "#4f46e5", fontWeight: 600 }}>
                      {output.agent_name}
                    </Typography>
                  </Stack>
                  <Box
                    sx={{
                      p: 3,
                      borderRadius: 3,
                      bgcolor: "#f8fafc",
                      borderLeft: "3px solid #4f46e5",
                      borderBottomLeftRadius: 4,
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
              </Box>
            )}

            {/* Failed */}
            {output.status === "failed" && (
              <Box sx={{ display: "flex", justifyContent: "flex-start" }}>
                <Box sx={{ maxWidth: "85%" }}>
                  <Stack direction="row" alignItems="center" spacing={1} mb={0.5}>
                    <SmartToyOutlinedIcon sx={{ fontSize: 14, color: "#dc2626" }} />
                    <Typography sx={{ fontSize: "0.7rem", color: "#dc2626", fontWeight: 600 }}>
                      {output.agent_name}
                    </Typography>
                  </Stack>
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
                    {output.error_message && (
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
                        {output.error_message}
                      </Typography>
                    )}
                  </Box>
                </Box>
              </Box>
            )}

            {/* Completed - Agent Response with structured content */}
            {output.status === "completed" && resultJson && (
              <Box sx={{ display: "flex", justifyContent: "flex-start" }}>
                <Box sx={{ maxWidth: "90%", width: "100%" }}>
                  <Stack direction="row" alignItems="center" spacing={1} mb={0.5}>
                    <SmartToyOutlinedIcon sx={{ fontSize: 14, color: "#4f46e5" }} />
                    <Typography sx={{ fontSize: "0.7rem", color: "#4f46e5", fontWeight: 600 }}>
                      {output.agent_name}
                    </Typography>
                    {output.completed_at && (
                      <Typography sx={{ fontSize: "0.65rem", color: "#94a3b8" }}>
                        {new Date(output.completed_at).toLocaleString("en-IN")}
                      </Typography>
                    )}
                  </Stack>
                  <Box
                    sx={{
                      borderRadius: 3,
                      bgcolor: "#f8fafc",
                      borderLeft: "3px solid #4f46e5",
                      borderBottomLeftRadius: 4,
                      overflow: "hidden",
                    }}
                  >
                    {/* Summary */}
                    {resultJson.summary && (
                      <Box
                        sx={{
                          p: 2.5,
                          borderBottom: "1px solid #e2e8f0",
                          bgcolor: "#eef2ff",
                        }}
                      >
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
                        <Typography
                          sx={{ fontWeight: 600, color: "#111827", lineHeight: 1.7, fontSize: "0.92rem" }}
                        >
                          {resultJson.summary}
                        </Typography>
                      </Box>
                    )}

                    {/* Sections */}
                    {resultJson.sections?.map((section, idx) => (
                      <Box
                        key={idx}
                        sx={{
                          p: 2.5,
                          borderBottom: idx < (resultJson.sections?.length || 0) - 1 ? "1px solid #e2e8f0" : "none",
                        }}
                      >
                        <Typography
                          sx={{ fontWeight: 700, fontSize: "0.92rem", color: "#111827", mb: 1.5 }}
                        >
                          {section.title}
                        </Typography>
                        <SectionRenderer section={section} />
                      </Box>
                    ))}

                    {/* Metadata */}
                    {resultJson.metadata && (
                      <Box
                        sx={{
                          p: 2,
                          bgcolor: "#eef2ff",
                          borderTop: "1px solid #e2e8f0",
                        }}
                      >
                        <Stack direction="row" spacing={1} flexWrap="wrap">
                          {resultJson.metadata.confidence && (
                            <Chip
                              label={`Confidence: ${resultJson.metadata.confidence}`}
                              size="small"
                              sx={{
                                fontWeight: 700,
                                borderRadius: 2,
                                fontSize: "0.7rem",
                                bgcolor:
                                  resultJson.metadata.confidence === "high"
                                    ? "#ecfdf5"
                                    : resultJson.metadata.confidence === "medium"
                                    ? "#fffbeb"
                                    : "#fef2f2",
                                color:
                                  resultJson.metadata.confidence === "high"
                                    ? "#059669"
                                    : resultJson.metadata.confidence === "medium"
                                    ? "#d97706"
                                    : "#dc2626",
                              }}
                            />
                          )}
                          {resultJson.metadata.analysis_date && (
                            <Chip
                              label={`Analysis: ${resultJson.metadata.analysis_date}`}
                              size="small"
                              variant="outlined"
                              sx={{ borderRadius: 2, fontWeight: 600, fontSize: "0.7rem" }}
                            />
                          )}
                          {resultJson.metadata.data_sources?.map((src, i) => (
                            <Chip
                              key={i}
                              label={src}
                              size="small"
                              variant="outlined"
                              sx={{ borderRadius: 2, fontWeight: 500, fontSize: "0.7rem" }}
                            />
                          ))}
                        </Stack>
                      </Box>
                    )}
                  </Box>
                </Box>
              </Box>
            )}

            {/* ── 3. Follow-up Chat Messages (continuous flow) ── */}
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
                        ? {
                            bgcolor: "#4f46e5",
                            color: "#fff",
                            borderBottomRightRadius: 4,
                          }
                        : {
                            bgcolor: "#f8fafc",
                            color: "#1e293b",
                            borderLeft: "3px solid #4f46e5",
                            borderBottomLeftRadius: 4,
                          }),
                    }}
                  >
                    {msg.role === "assistant" ? (
                      <MarkdownContent content={msg.content} isLight={false} />
                    ) : (
                      <Typography
                        sx={{
                          fontSize: "0.88rem",
                          lineHeight: 1.7,
                          whiteSpace: "pre-wrap",
                          wordBreak: "break-word",
                        }}
                      >
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

            <div ref={chatEndRef} />
          </Box>

          {/* ── Chat Input Area (only for completed outputs) ── */}
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
      </Box>
    </Box>
  );
};

/** Renders markdown content with proper styling */
const MarkdownContent: React.FC<{ content: string; isLight?: boolean }> = ({ content, isLight }) => (
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

/** Renders a single section based on its type */
const SectionRenderer: React.FC<{ section: AgentOutputSection }> = ({ section }) => {
  if (section.type === "text") {
    return <MarkdownContent content={section.content || ""} />;
  }

  if (section.type === "list" && section.items) {
    return (
      <Box component="ul" sx={{ pl: 2.5, m: 0 }}>
        {section.items.map((item, i) => (
          <Box component="li" key={i} sx={{ mb: 0.8, "&::marker": { color: "#4f46e5" } }}>
            <Typography sx={{ fontSize: "0.88rem", color: "#1e293b", lineHeight: 1.7 }}>
              {item}
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
                  {h}
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
                    {String(cell)}
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
