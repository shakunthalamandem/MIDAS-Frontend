import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  Box,
  Dialog,
  Drawer,
  IconButton,
  InputAdornment,
  TextField,
  Typography,
  CircularProgress,
  Tooltip,
  Slide,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import SendIcon from "@mui/icons-material/Send";
import SmartToyOutlinedIcon from "@mui/icons-material/SmartToyOutlined";
import FullscreenIcon from "@mui/icons-material/Fullscreen";
import FullscreenExitIcon from "@mui/icons-material/FullscreenExit";
import MicIcon from "@mui/icons-material/Mic";
import MicOffIcon from "@mui/icons-material/MicOff";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import DOMPurify from "dompurify";
import axios from "axios";

/* ── Types ── */
interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface JayRitterChatProps {
  open: boolean;
  onClose: () => void;
  reportDate: string;
}

/* ── Suggestions ── */
const SUGGESTIONS = [
  "Which tickers have the highest AM score?",
  "Show me all LONG signals with confidence > 80%",
  "What is the current market temperature and why?",
  "Which IPOs are near lockup expiration?",
  "Compare CDNL vs ANDG across all metrics",
  "Which sectors have the most LONG signals?",
];

/* ── Sanitize & render HTML from Claude ── */
const renderHTML = (html: string) => {
  const clean = DOMPurify.sanitize(html, {
    ALLOWED_TAGS: [
      "table", "thead", "tbody", "tr", "th", "td",
      "strong", "em", "b", "i", "br", "p", "ul", "ol", "li",
      "h3", "h4", "span", "div",
    ],
    ALLOWED_ATTR: ["style", "class"],
  });
  return { __html: clean };
};

/* ── CSS for tables inside chat messages ── */
const chatTableStyles = {
  "& table": {
    width: "100%",
    borderCollapse: "collapse" as const,
    mt: 1, mb: 1,
    fontSize: "0.78rem",
    border: "1px solid #e0d8f0",
    borderRadius: "8px",
    overflow: "hidden",
  },
  "& thead": {
    bgcolor: "#4527a0",
  },
  "& th": {
    color: "#fff",
    fontWeight: 700,
    fontSize: "0.72rem",
    textTransform: "uppercase" as const,
    letterSpacing: "0.03em",
    px: 1.2,
    py: 0.8,
    textAlign: "left" as const,
    borderBottom: "2px solid #311b6e",
    whiteSpace: "nowrap" as const,
  },
  "& td": {
    px: 1.2,
    py: 0.7,
    borderBottom: "1px solid #f0ecf7",
    fontSize: "0.78rem",
    color: "#333",
  },
  "& tbody tr:hover": {
    bgcolor: "#f8f5ff",
  },
  "& tbody tr:nth-of-type(even)": {
    bgcolor: "#faf8ff",
  },
  "& ul, & ol": {
    pl: 2.5, my: 0.5,
  },
  "& li": {
    fontSize: "0.82rem",
    lineHeight: 1.7,
    mb: 0.3,
  },
  "& strong": {
    fontWeight: 700,
    color: "#4527a0",
  },
};

/* ── Main Component ── */
const JayRitterChat: React.FC<JayRitterChatProps> = ({ open, onClose, reportDate }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);

  const apiBaseUrl = process.env.REACT_APP_API_URL;
  const token = localStorage.getItem("access_token");

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 300);
  }, [open]);

  /* ── Speech-to-text ── */
  const toggleRecording = useCallback(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech recognition is not supported in this browser. Try Chrome.");
      return;
    }

    if (isRecording) {
      recognitionRef.current?.stop();
      setIsRecording(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    let finalTranscript = "";

    recognition.onresult = (event: any) => {
      let interimTranscript = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const t = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += t + " ";
        } else {
          interimTranscript += t;
        }
      }
      setTranscript(finalTranscript + interimTranscript);
      setInput(finalTranscript + interimTranscript);
    };

    recognition.onerror = () => {
      setIsRecording(false);
    };

    recognition.onend = () => {
      setIsRecording(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
    setIsRecording(true);
    setTranscript("");
  }, [isRecording]);

  /* ── Send message ── */
  const sendMessage = async (question: string) => {
    if (!question.trim() || loading) return;

    // Stop recording if active
    if (isRecording) {
      recognitionRef.current?.stop();
      setIsRecording(false);
    }

    const userMsg: ChatMessage = { role: "user", content: question.trim() };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setTranscript("");
    setLoading(true);

    try {
      const res = await axios.post(
        `${apiBaseUrl}/api/jay_ritter_chat/`,
        {
          report_date: reportDate,
          question: question.trim(),
          history: messages.slice(-6),
        },
        { headers: { Authorization: token ? `Bearer ${token}` : "" } }
      );

      const assistantMsg: ChatMessage = { role: "assistant", content: (res.data as any).answer };
      setMessages(prev => [...prev, assistantMsg]);
    } catch {
      const errorMsg: ChatMessage = {
        role: "assistant",
        content: "Sorry, I couldn't process your question. Please try again.",
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  /* ── Shared chat content ── */
  const chatContent = (
    <Box sx={{
      display: "flex",
      flexDirection: "column",
      height: "100%",
      bgcolor: "#fafbff",
    }}>
      {/* Header */}
      <Box sx={{
        px: 2.5, py: 1.5,
        background: "linear-gradient(135deg, #4527a0 0%, #6a1b9a 50%, #7c4dff 100%)",
        display: "flex", alignItems: "center", gap: 1.5,
        position: "relative",
        overflow: "hidden",
        "&::before": {
          content: '""',
          position: "absolute",
          top: -20, right: -20,
          width: 80, height: 80,
          borderRadius: "50%",
          background: "rgba(255,255,255,0.06)",
        },
        "&::after": {
          content: '""',
          position: "absolute",
          bottom: -30, left: "40%",
          width: 100, height: 100,
          borderRadius: "50%",
          background: "rgba(255,255,255,0.04)",
        },
      }}>
        <Box sx={{
          width: 36, height: 36,
          borderRadius: "10px",
          background: "rgba(255,255,255,0.15)",
          display: "flex", alignItems: "center", justifyContent: "center",
          backdropFilter: "blur(10px)",
        }}>
          <AutoAwesomeIcon sx={{ color: "#ffd54f", fontSize: 20 }} />
        </Box>
        <Box sx={{ flex: 1, zIndex: 1 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.8 }}>
            <Typography sx={{ color: "#fff", fontWeight: 800, fontSize: "1rem", letterSpacing: "0.02em" }}>
              Ritter Analyst
            </Typography>
            <Box sx={{
              px: 0.8, py: 0.15,
              borderRadius: "4px",
              background: "linear-gradient(135deg, #ffd54f, #ff6f00)",
              fontSize: "0.55rem",
              fontWeight: 800,
              color: "#1a0533",
              letterSpacing: "0.05em",
            }}>
              AI
            </Box>
          </Box>
          <Typography sx={{ color: "rgba(255,255,255,0.6)", fontSize: "0.7rem", mt: 0.2 }}>
            Ask anything about the {reportDate} report
          </Typography>
        </Box>
        <Box sx={{ display: "flex", gap: 0.5, zIndex: 1 }}>
          <Tooltip title={isFullscreen ? "Exit fullscreen" : "Fullscreen"}>
            <IconButton
              onClick={() => setIsFullscreen(!isFullscreen)}
              size="small"
              sx={{ color: "rgba(255,255,255,0.6)", "&:hover": { color: "#fff", bgcolor: "rgba(255,255,255,0.1)" } }}
            >
              {isFullscreen ? <FullscreenExitIcon fontSize="small" /> : <FullscreenIcon fontSize="small" />}
            </IconButton>
          </Tooltip>
          <IconButton
            onClick={onClose}
            size="small"
            sx={{ color: "rgba(255,255,255,0.6)", "&:hover": { color: "#fff", bgcolor: "rgba(255,255,255,0.1)" } }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>
      </Box>

      {/* Messages area */}
      <Box sx={{
        flex: 1,
        overflow: "auto",
        px: isFullscreen ? 4 : 2,
        py: 2,
        "&::-webkit-scrollbar": { width: 5 },
        "&::-webkit-scrollbar-thumb": { bgcolor: "#d0c8e6", borderRadius: 3 },
      }}>
        {messages.length === 0 && (
          <Box sx={{ maxWidth: isFullscreen ? 700 : "100%", mx: "auto" }}>
            <Box sx={{ textAlign: "center", mb: 3, mt: 1 }}>
              <SmartToyOutlinedIcon sx={{ fontSize: 36, color: "#c5b8e8", mb: 1 }} />
              <Typography sx={{ fontSize: "0.88rem", color: "#555", fontWeight: 600 }}>
                How can I help you today?
              </Typography>
              <Typography sx={{ fontSize: "0.75rem", color: "#999", mt: 0.3 }}>
                Ask me anything about the Jay Ritter IPO Analysis report
              </Typography>
            </Box>
            <Box sx={{
              display: "grid",
              gridTemplateColumns: isFullscreen ? "1fr 1fr" : "1fr",
              gap: 1,
            }}>
              {SUGGESTIONS.map((s, i) => (
                <Box
                  key={i}
                  onClick={() => sendMessage(s)}
                  sx={{
                    px: 2, py: 1.2, borderRadius: "12px",
                    bgcolor: "#fff", border: "1px solid #e8e0f5",
                    cursor: "pointer", transition: "all 0.2s",
                    "&:hover": {
                      bgcolor: "#f3eeff",
                      borderColor: "#7c4dff",
                      transform: "translateY(-1px)",
                      boxShadow: "0 3px 12px rgba(124,77,255,0.12)",
                    },
                  }}
                >
                  <Typography sx={{ fontSize: "0.8rem", color: "#4527a0", fontWeight: 500 }}>{s}</Typography>
                </Box>
              ))}
            </Box>
          </Box>
        )}

        <Box sx={{ maxWidth: isFullscreen ? 800 : "100%", mx: "auto" }}>
          {messages.map((msg, i) => (
            <Box
              key={i}
              sx={{
                display: "flex",
                justifyContent: msg.role === "user" ? "flex-end" : "flex-start",
                mb: 2,
              }}
            >
              {msg.role === "assistant" && (
                <Box sx={{
                  width: 28, height: 28, minWidth: 28,
                  borderRadius: "8px",
                  background: "linear-gradient(135deg, #4527a0, #7c4dff)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  mr: 1, mt: 0.5,
                }}>
                  <AutoAwesomeIcon sx={{ color: "#ffd54f", fontSize: 14 }} />
                </Box>
              )}
              <Box sx={{
                maxWidth: msg.role === "user" ? "75%" : (isFullscreen ? "90%" : "88%"),
                px: 2, py: 1.5,
                borderRadius: msg.role === "user"
                  ? "18px 18px 4px 18px"
                  : "4px 18px 18px 18px",
                bgcolor: msg.role === "user" ? "#4527a0" : "#fff",
                color: msg.role === "user" ? "#fff" : "#333",
                border: msg.role === "assistant" ? "1px solid #ede8f7" : "none",
                boxShadow: msg.role === "assistant"
                  ? "0 2px 8px rgba(69,39,160,0.06)"
                  : "0 2px 8px rgba(69,39,160,0.2)",
              }}>
                {msg.role === "user" ? (
                  <Typography sx={{ fontSize: "0.85rem", lineHeight: 1.6 }}>
                    {msg.content}
                  </Typography>
                ) : (
                  <Box
                    sx={{
                      fontSize: "0.84rem",
                      lineHeight: 1.7,
                      overflowX: "auto",
                      ...chatTableStyles,
                    }}
                    dangerouslySetInnerHTML={renderHTML(msg.content)}
                  />
                )}
              </Box>
            </Box>
          ))}

          {loading && (
            <Box sx={{ display: "flex", mb: 2 }}>
              <Box sx={{
                width: 28, height: 28, minWidth: 28,
                borderRadius: "8px",
                background: "linear-gradient(135deg, #4527a0, #7c4dff)",
                display: "flex", alignItems: "center", justifyContent: "center",
                mr: 1,
              }}>
                <AutoAwesomeIcon sx={{ color: "#ffd54f", fontSize: 14 }} />
              </Box>
              <Box sx={{
                px: 2.5, py: 1.5,
                borderRadius: "4px 18px 18px 18px",
                bgcolor: "#fff",
                border: "1px solid #ede8f7",
                display: "flex", alignItems: "center", gap: 1.2,
              }}>
                <Box sx={{ display: "flex", gap: 0.5 }}>
                  {[0, 1, 2].map(j => (
                    <Box key={j} sx={{
                      width: 6, height: 6, borderRadius: "50%",
                      bgcolor: "#7c4dff",
                      animation: "pulse 1.2s ease-in-out infinite",
                      animationDelay: `${j * 0.2}s`,
                      "@keyframes pulse": {
                        "0%, 100%": { opacity: 0.3, transform: "scale(0.8)" },
                        "50%": { opacity: 1, transform: "scale(1.2)" },
                      },
                    }} />
                  ))}
                </Box>
                <Typography sx={{ fontSize: "0.78rem", color: "#7c4dff", fontWeight: 500 }}>
                  Analyzing report...
                </Typography>
              </Box>
            </Box>
          )}
          <div ref={messagesEndRef} />
        </Box>
      </Box>

      {/* Input area */}
      <Box sx={{
        px: isFullscreen ? 4 : 2,
        py: 1.5,
        borderTop: "1px solid #ede8f7",
        bgcolor: "#fff",
      }}>
        {/* Recording indicator */}
        {isRecording && (
          <Box sx={{
            display: "flex", alignItems: "center", gap: 1,
            px: 1.5, py: 0.8, mb: 1,
            borderRadius: "8px",
            bgcolor: "#fef0f0",
            border: "1px solid #ffcdd2",
          }}>
            <Box sx={{
              width: 8, height: 8, borderRadius: "50%",
              bgcolor: "#f44336",
              animation: "pulse 1s ease-in-out infinite",
              "@keyframes pulse": {
                "0%, 100%": { opacity: 0.4 },
                "50%": { opacity: 1 },
              },
            }} />
            <Typography sx={{ fontSize: "0.75rem", color: "#c62828", fontWeight: 600 }}>
              Listening... Click mic to stop
            </Typography>
          </Box>
        )}

        <Box sx={{ maxWidth: isFullscreen ? 800 : "100%", mx: "auto" }}>
          <TextField
            inputRef={inputRef}
            fullWidth
            size="small"
            multiline
            maxRows={3}
            placeholder="Ask about the report..."
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={loading}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Tooltip title={isRecording ? "Stop recording" : "Voice input"}>
                    <IconButton
                      onClick={toggleRecording}
                      size="small"
                      sx={{
                        color: isRecording ? "#f44336" : "#aaa",
                        "&:hover": { color: isRecording ? "#d32f2f" : "#4527a0" },
                        animation: isRecording ? "pulse 1s ease-in-out infinite" : "none",
                      }}
                    >
                      {isRecording ? <MicOffIcon fontSize="small" /> : <MicIcon fontSize="small" />}
                    </IconButton>
                  </Tooltip>
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => sendMessage(input)}
                    disabled={!input.trim() || loading}
                    size="small"
                    sx={{
                      color: input.trim() ? "#fff" : "#ccc",
                      bgcolor: input.trim() ? "#4527a0" : "transparent",
                      width: 30, height: 30,
                      "&:hover": { bgcolor: input.trim() ? "#311b6e" : "transparent" },
                      transition: "all 0.2s",
                    }}
                  >
                    <SendIcon sx={{ fontSize: 16 }} />
                  </IconButton>
                </InputAdornment>
              ),
            }}
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: "14px", fontSize: "0.85rem",
                bgcolor: "#f8f7fc",
                "& fieldset": { borderColor: "#e0dae8" },
                "&.Mui-focused fieldset": { borderColor: "#7c4dff" },
              },
            }}
          />
        </Box>
      </Box>
    </Box>
  );

  /* ── Fullscreen mode = Dialog, Normal mode = Drawer ── */
  if (isFullscreen) {
    return (
      <Dialog
        open={open}
        onClose={onClose}
        fullScreen
        TransitionComponent={Slide}
        TransitionProps={{ direction: "up" } as any}
        PaperProps={{
          sx: { bgcolor: "#fafbff" },
        }}
      >
        {chatContent}
      </Dialog>
    );
  }

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: { xs: "100%", sm: 480 },
          bgcolor: "#fafbff",
          display: "flex",
          flexDirection: "column",
          borderLeft: "1px solid #e0dae8",
        },
      }}
    >
      {chatContent}
    </Drawer>
  );
};

export default JayRitterChat;
