import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Box,
  IconButton,
  Paper,
  Typography,
  Tooltip,
  CircularProgress,
  Snackbar,
  Alert,
  Chip,
  useMediaQuery,
  useTheme,
  Dialog,
} from "@mui/material";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import AddCommentRoundedIcon from "@mui/icons-material/AddCommentRounded";
import KeyboardDoubleArrowDownRoundedIcon from "@mui/icons-material/KeyboardDoubleArrowDownRounded";
import SmartToyRoundedIcon from "@mui/icons-material/SmartToyRounded";
import HistoryRoundedIcon from "@mui/icons-material/HistoryRounded";
import PlayArrowRoundedIcon from "@mui/icons-material/PlayArrowRounded";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import dayjs from "dayjs";
import { useNavigate } from "react-router-dom";

import OpenClawMessageBubble from "./OpenClawMessageBubble";
import OpenClawComposer from "./OpenClawComposer";
import OpenClawTypingIndicator from "./OpenClawTypingIndicator";
import OpenClawDateDivider from "./OpenClawDateDivider";
import OpenClawHistoryDrawer from "./OpenClawHistoryDrawer";
import {
  fetchOpenClawHistory,
  resetOpenClawChat,
  resumeOpenClawChat,
  streamOpenClawChat,
} from "./openclawApi";
import type { OpenClawMessage } from "./openclawTypes";

const SUGGESTIONS = [
  "Show me today's MDTA report",
  "What's the latest MSS sentiment for SUJA US?",
  "Summarize the Jay Ritter score for KLRA US",
  "What did we discuss yesterday?",
];

const ASSISTANT_NAME = "MONA";
const ASSISTANT_TAGLINE = "Built on top of OpenClaw · your MIDAS AI partner";

// Single dark-blue palette
const BRAND_NAVY = "#1e3a8a";
const BRAND_NAVY_DEEP = "#172554";

const OpenClawChatPage: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [messages, setMessages] = useState<OpenClawMessage[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showJumpToBottom, setShowJumpToBottom] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [currentSalt, setCurrentSalt] = useState<string>("");
  const [viewingSalt, setViewingSalt] = useState<string | null>(null); // null = viewing current
  const [resumingSalt, setResumingSalt] = useState<string | null>(null);
  const [accessDenied, setAccessDenied] = useState<{ message: string } | null>(null);

  const scrollRef = useRef<HTMLDivElement | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const stickToBottomRef = useRef(true);

  const loadHistory = useCallback(async (salt?: string) => {
    setLoadingHistory(true);
    try {
      const data = await fetchOpenClawHistory(salt);
      setMessages(data.messages || []);
      if (data.is_current) {
        setCurrentSalt(data.session_salt);
        setViewingSalt(null);
      } else {
        setViewingSalt(data.session_salt);
      }
      setAccessDenied(null);
    } catch (e: any) {
      const status = e?.response?.status;
      if (status === 403) {
        // Silent on load — let the user see the empty chat. The lock
        // popup only appears when they actually try to send a message.
        setMessages([]);
      } else {
        setError(
          e?.response?.data?.error ||
            e?.response?.data?.detail ||
            e?.message ||
            "Failed to load your chat history."
        );
      }
    } finally {
      setLoadingHistory(false);
    }
  }, []);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  const isArchivedView = viewingSalt !== null;

  // Auto-scroll on new messages if the user is near the bottom.
  useEffect(() => {
    if (!stickToBottomRef.current) return;
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, sending]);

  const handleScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    const atBottom = distanceFromBottom < 120;
    stickToBottomRef.current = atBottom;
    setShowJumpToBottom(!atBottom && messages.length > 0);
  };

  const scrollToBottom = () => {
    stickToBottomRef.current = true;
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  };

  const send = useCallback(
    async (text: string) => {
      const message = text.trim();
      if (!message || sending || isArchivedView) return;

      const nowIso = new Date().toISOString();
      setInput("");
      setSending(true);
      setError(null);
      stickToBottomRef.current = true;

      const userMsg: OpenClawMessage = {
        role: "user",
        content: message,
        created_at: nowIso,
        pending: true,
      };
      const assistantMsg: OpenClawMessage = {
        role: "assistant",
        content: "",
        created_at: nowIso,
        streaming: true,
      };
      setMessages((m) => [...m, userMsg, assistantMsg]);

      abortRef.current = new AbortController();

      await streamOpenClawChat(
        message,
        {
          onChunk: (delta) => {
            setMessages((m) => {
              const copy = [...m];
              const last = copy[copy.length - 1];
              if (last && last.role === "assistant" && last.streaming) {
                copy[copy.length - 1] = { ...last, content: last.content + delta };
              }
              return copy;
            });
          },
          onDone: () => {
            setMessages((m) => {
              const copy = [...m];
              // mark the user message as delivered and stop streaming flag
              for (let i = copy.length - 1; i >= 0; i--) {
                if (copy[i].role === "user" && copy[i].pending) {
                  copy[i] = { ...copy[i], pending: false };
                  break;
                }
              }
              const last = copy[copy.length - 1];
              if (last && last.role === "assistant" && last.streaming) {
                copy[copy.length - 1] = { ...last, streaming: false };
                if (!last.content.trim()) {
                  copy[copy.length - 1] = {
                    ...last,
                    streaming: false,
                    error: true,
                    content: "(No response received.)",
                  };
                }
              }
              return copy;
            });
            setSending(false);
          },
          onError: (msg) => {
            setMessages((m) => {
              const copy = [...m];
              const last = copy[copy.length - 1];
              if (last && last.role === "assistant") {
                copy[copy.length - 1] = {
                  ...last,
                  streaming: false,
                  error: true,
                  content: `Something went wrong: ${msg}`,
                };
              }
              return copy;
            });
            setSending(false);
            setError(msg);
          },
          onAccessDenied: (msg) => {
            // Drop the optimistic user/assistant pair we just appended.
            setMessages((m) => m.slice(0, -2));
            setSending(false);
            setAccessDenied({ message: msg });
          },
        },
        abortRef.current.signal
      );
    },
    [sending, isArchivedView]
  );

  const stop = () => {
    abortRef.current?.abort();
    abortRef.current = null;
  };

  const newChat = async () => {
    if (sending) abortRef.current?.abort();
    try {
      const res = await resetOpenClawChat();
      setMessages([]);
      setCurrentSalt(res.session_salt);
      setViewingSalt(null);
    } catch (e: any) {
      setError(e?.message || "Could not start a new chat.");
    }
  };

  const resumeCurrentView = async () => {
    if (viewingSalt === null) return;
    setResumingSalt(viewingSalt);
    try {
      const res = await resumeOpenClawChat(viewingSalt);
      setCurrentSalt(res.session_salt);
      setViewingSalt(null);
      // reload messages under the now-active salt
      await loadHistory();
    } catch (e: any) {
      setError(e?.message || "Could not resume conversation.");
    } finally {
      setResumingSalt(null);
    }
  };

  const openHistoryDrawer = () => setHistoryOpen(true);
  const closeHistoryDrawer = () => setHistoryOpen(false);

  const handleSelectFromHistory = async (salt: string) => {
    await loadHistory(salt);
    setHistoryOpen(false);
  };

  const handleResumedFromHistory = async () => {
    await loadHistory();
  };

  const renderedList = useMemo(() => {
    const out: React.ReactNode[] = [];
    let prevDay = "";
    messages.forEach((m, idx) => {
      const iso = m.created_at || new Date().toISOString();
      const day = dayjs(iso).format("YYYY-MM-DD");
      if (day !== prevDay) {
        out.push(<OpenClawDateDivider key={`d-${idx}-${day}`} iso={iso} />);
        prevDay = day;
      }
      out.push(<OpenClawMessageBubble key={`m-${m.id ?? idx}`} message={m} />);
    });
    return out;
  }, [messages]);

  const empty = !loadingHistory && messages.length === 0;

  return (
    <Box
      sx={{
        width: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        py: { xs: 1.5, sm: 2.5, md: 3 },
        px: { xs: 1, sm: 2, md: 3 },
        backgroundColor: "#f1f5f9",
        minHeight: { xs: "calc(100dvh - 180px)", md: "calc(100dvh - 220px)" },
      }}
    >
      <Paper
        elevation={0}
        sx={{
          width: "100%",
          maxWidth: 960,
          height: {
            xs: "calc(100dvh - 180px)",
            md: "min(820px, calc(100dvh - 240px))",
          },
          minHeight: 520,
          display: "flex",
          flexDirection: "column",
          borderRadius: { xs: 2, sm: 3 },
          overflow: "hidden",
          border: "1px solid rgba(15, 23, 42, 0.08)",
          boxShadow:
            "0 20px 50px -20px rgba(15, 23, 42, 0.2), 0 4px 12px rgba(15, 23, 42, 0.04)",
          position: "relative",
          bgcolor: "#ffffff",
        }}
      >
        {/* Header */}
        <Box
          sx={{
            px: { xs: 1.25, sm: 2 },
            py: { xs: 1, sm: 1.25 },
            display: "flex",
            alignItems: "center",
            gap: 1,
            borderBottom: `1px solid ${BRAND_NAVY_DEEP}`,
            backgroundColor: BRAND_NAVY,
            color: "#f8fafc",
            flexShrink: 0,
          }}
        >
          <Tooltip title="Back">
            <IconButton onClick={() => navigate(-1)} sx={{ color: "#f8fafc" }}>
              <ArrowBackRoundedIcon />
            </IconButton>
          </Tooltip>
          <Box
            sx={{
              width: 42,
              height: 42,
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "rgba(255,255,255,0.14)",
              border: "1px solid rgba(255,255,255,0.22)",
              position: "relative",
              "&::after": {
                content: '""',
                position: "absolute",
                bottom: 2,
                right: 2,
                width: 10,
                height: 10,
                borderRadius: "50%",
                backgroundColor: "#22c55e",
                border: `2px solid ${BRAND_NAVY}`,
              },
            }}
          >
            <SmartToyRoundedIcon fontSize="small" />
          </Box>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
              <Typography
                variant="subtitle1"
                sx={{
                  fontWeight: 800,
                  lineHeight: 1.1,
                  letterSpacing: 0.3,
                  fontSize: { xs: "1rem", sm: "1.05rem" },
                }}
              >
                {ASSISTANT_NAME}
              </Typography>
              <Chip
                size="small"
                label="Beta"
                sx={{
                  height: 18,
                  fontSize: 9.5,
                  fontWeight: 700,
                  letterSpacing: 0.4,
                  bgcolor: "rgba(249, 115, 22, 0.95)",
                  color: "#fff",
                  "& .MuiChip-label": { px: 0.75 },
                }}
              />
            </Box>
            <Typography
              variant="caption"
              sx={{
                opacity: 0.85,
                display: "block",
                lineHeight: 1.2,
                mt: 0.1,
                fontSize: { xs: 10.5, sm: 11 },
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {sending ? "typing…" : isMobile ? "Built on OpenClaw" : ASSISTANT_TAGLINE}
            </Typography>
          </Box>
          <Tooltip title="Conversation history">
            <IconButton onClick={openHistoryDrawer} sx={{ color: "#f8fafc" }}>
              <HistoryRoundedIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="New chat">
            <IconButton onClick={newChat} sx={{ color: "#f8fafc" }}>
              <AddCommentRoundedIcon />
            </IconButton>
          </Tooltip>
        </Box>

        {isArchivedView && (
          <Box
            sx={{
              px: 2,
              py: 0.75,
              display: "flex",
              alignItems: "center",
              gap: 1,
              backgroundColor: "#fef3c7",
              borderBottom: "1px solid #fde68a",
              color: "#78350f",
              flexShrink: 0,
            }}
          >
            <HistoryRoundedIcon fontSize="small" />
            <Typography variant="caption" sx={{ flex: 1, fontWeight: 600 }}>
              Viewing an archived conversation — read-only.
            </Typography>
            <Box
              component="button"
              onClick={resumeCurrentView}
              disabled={resumingSalt !== null}
              sx={{
                display: "inline-flex",
                alignItems: "center",
                gap: 0.5,
                px: 1.25,
                py: 0.4,
                border: "1px solid #92400e",
                borderRadius: 999,
                background: "transparent",
                color: "#78350f",
                fontSize: 11,
                fontWeight: 700,
                cursor: resumingSalt !== null ? "wait" : "pointer",
                opacity: resumingSalt !== null ? 0.5 : 1,
                "&:hover": { backgroundColor: "#fde68a" },
              }}
            >
              <PlayArrowRoundedIcon sx={{ fontSize: 14 }} />
              {resumingSalt !== null ? "Resuming…" : "Resume this"}
            </Box>
            <Box
              component="button"
              onClick={() => loadHistory()}
              sx={{
                display: "inline-flex",
                alignItems: "center",
                px: 1.25,
                py: 0.4,
                borderRadius: 999,
                border: "none",
                background: "transparent",
                color: "#78350f",
                fontSize: 11,
                fontWeight: 700,
                cursor: "pointer",
                "&:hover": { textDecoration: "underline" },
              }}
            >
              Back to current
            </Box>
          </Box>
        )}

        {/* Messages */}
        <Box
          ref={scrollRef}
          onScroll={handleScroll}
          sx={{
            flex: 1,
            minHeight: 0,
            overflowY: "auto",
            overflowX: "hidden",
            scrollBehavior: "smooth",
            WebkitOverflowScrolling: "touch",
            py: 1.5,
            backgroundColor: "#f8fafc",
          }}
        >
          <Box sx={{ maxWidth: 760, mx: "auto", width: "100%" }}>
            {loadingHistory && (
              <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
                <CircularProgress size={28} />
              </Box>
            )}

            {empty && (
              <Box sx={{ textAlign: "center", px: 2, py: { xs: 3, md: 5 } }}>
                <Box
                  sx={{
                    width: 84,
                    height: 84,
                    borderRadius: "50%",
                    mx: "auto",
                    mb: 2,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: BRAND_NAVY,
                    color: "#fff",
                    boxShadow: "0 12px 28px -10px rgba(30, 58, 138, 0.55)",
                  }}
                >
                  <SmartToyRoundedIcon sx={{ fontSize: 44 }} />
                </Box>
                <Typography
                  variant="h5"
                  sx={{
                    fontWeight: 800,
                    letterSpacing: 0.5,
                    color: BRAND_NAVY,
                    mb: 0.5,
                  }}
                >
                  Hey, I'm {ASSISTANT_NAME}.
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 0.5 }}
                >
                  Your private MIDAS AI partner for reports, data, and tasks.
                </Typography>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{
                    display: "block",
                    mb: 2.5,
                    fontStyle: "italic",
                    opacity: 0.75,
                  }}
                >
                  Built on top of OpenClaw
                </Typography>
                <Box
                  sx={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: 1,
                    justifyContent: "center",
                    maxWidth: 560,
                    mx: "auto",
                  }}
                >
                  {SUGGESTIONS.map((s) => (
                    <Chip
                      key={s}
                      label={s}
                      onClick={() => send(s)}
                      sx={{
                        cursor: "pointer",
                        bgcolor: "#ffffff",
                        border: "1px solid rgba(15, 23, 42, 0.08)",
                        boxShadow: "0 1px 2px rgba(15, 23, 42, 0.04)",
                        transition: "all 0.15s",
                        "&:hover": {
                          bgcolor: "#eef2ff",
                          borderColor: BRAND_NAVY,
                          color: BRAND_NAVY,
                          transform: "translateY(-1px)",
                        },
                      }}
                    />
                  ))}
                </Box>
              </Box>
            )}

            {renderedList}

            {sending &&
              messages.length > 0 &&
              messages[messages.length - 1]?.role === "assistant" &&
              !messages[messages.length - 1]?.content && <OpenClawTypingIndicator />}

            <div ref={bottomRef} />
          </Box>
        </Box>

        {/* Jump-to-bottom (absolute within the card) */}
        {showJumpToBottom && (
          <Tooltip title="Jump to latest">
            <IconButton
              onClick={scrollToBottom}
              sx={{
                position: "absolute",
                right: 16,
                bottom: 92,
                backgroundColor: "#ffffff",
                border: "1px solid rgba(15, 23, 42, 0.12)",
                boxShadow: "0 4px 12px rgba(15, 23, 42, 0.1)",
                "&:hover": { backgroundColor: "#f1f5f9" },
                zIndex: 2,
              }}
            >
              <KeyboardDoubleArrowDownRoundedIcon />
            </IconButton>
          </Tooltip>
        )}

        {/* Composer */}
        <Box sx={{ flexShrink: 0 }}>
          <OpenClawComposer
            value={input}
            onChange={setInput}
            onSend={() => send(input)}
            onStop={stop}
            sending={sending}
            disabled={loadingHistory || isArchivedView}
          />
        </Box>
      </Paper>

      <OpenClawHistoryDrawer
        open={historyOpen}
        onClose={closeHistoryDrawer}
        onSelect={handleSelectFromHistory}
        onResumed={handleResumedFromHistory}
        currentSalt={currentSalt}
      />

      <Dialog
        open={!!accessDenied}
        onClose={() => setAccessDenied(null)}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            overflow: "hidden",
            border: "1px solid rgba(15, 23, 42, 0.08)",
            boxShadow:
              "0 30px 60px -20px rgba(15, 23, 42, 0.35), 0 8px 20px rgba(15, 23, 42, 0.08)",
          },
        }}
        BackdropProps={{
          sx: {
            backgroundColor: "rgba(15, 23, 42, 0.55)",
            backdropFilter: "blur(4px)",
          },
        }}
      >
        <Box sx={{ p: { xs: 3, sm: 4 }, textAlign: "center", bgcolor: "#fff" }}>
          <Box
            sx={{
              width: 72,
              height: 72,
              borderRadius: "50%",
              mx: "auto",
              mb: 2,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "rgba(30, 58, 138, 0.08)",
              color: BRAND_NAVY,
            }}
          >
            <LockOutlinedIcon sx={{ fontSize: 36 }} />
          </Box>
          <Typography
            variant="h6"
            sx={{ fontWeight: 800, color: BRAND_NAVY, mb: 1 }}
          >
            MONA is restricted
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mb: 0.75, lineHeight: 1.55 }}
          >
            {accessDenied?.message}
          </Typography>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ display: "block", mb: 3, opacity: 0.8 }}
          >
            Your MIDAS account isn't on the MONA access list yet.
          </Typography>
          <Box sx={{ display: "flex", justifyContent: "center", gap: 1 }}>
            <Box
              component="button"
              onClick={() => setAccessDenied(null)}
              sx={{
                display: "inline-flex",
                alignItems: "center",
                px: 2,
                py: 0.85,
                border: "1px solid rgba(15, 23, 42, 0.16)",
                borderRadius: 999,
                backgroundColor: "#ffffff",
                color: "#0f172a",
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
                transition: "background-color 0.15s",
                "&:hover": { backgroundColor: "#f1f5f9" },
              }}
            >
              Close
            </Box>
            <Box
              component="button"
              onClick={() => navigate(-1)}
              sx={{
                display: "inline-flex",
                alignItems: "center",
                gap: 0.75,
                px: 2.25,
                py: 0.85,
                border: "none",
                borderRadius: 999,
                backgroundColor: BRAND_NAVY,
                color: "#fff",
                fontSize: 13,
                fontWeight: 700,
                cursor: "pointer",
                transition: "background-color 0.15s",
                "&:hover": { backgroundColor: BRAND_NAVY_DEEP },
              }}
            >
              <ArrowBackRoundedIcon sx={{ fontSize: 16 }} />
              Back to MIDAS
            </Box>
          </Box>
        </Box>
      </Dialog>

      <Snackbar
        open={!!error}
        autoHideDuration={5000}
        onClose={() => setError(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity="error" onClose={() => setError(null)}>
          {error}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default OpenClawChatPage;
