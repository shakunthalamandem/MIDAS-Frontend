// PerplexityChat.tsx
import React, { useState, useRef, useEffect } from "react";
import {
  Box, Button, Container, Paper, TextField, Typography, CircularProgress, Alert, IconButton,
  Stack, ThemeProvider, createTheme, CssBaseline, Skeleton, Chip, Avatar, Tooltip, LinearProgress,
} from "@mui/material";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS, BarElement, CategoryScale, LinearScale, Tooltip as ChartTooltip, Legend,
} from "chart.js";
import SendIcon from "@mui/icons-material/Send";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import SmartToyIcon from "@mui/icons-material/SmartToy";
import ReplayIcon from "@mui/icons-material/Replay";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import CheckIcon from "@mui/icons-material/Check";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneLight } from "react-syntax-highlighter/dist/esm/styles/prism";
import prettyjson from "json-stringify-pretty-compact";
ChartJS.register(BarElement, CategoryScale, LinearScale, ChartTooltip, Legend);

const MAX_EXCHANGES = 10;

const theme = createTheme({
  palette: {
    mode: "light",
    primary: { main: "#1976d2" },
    background: { default: "#f7f8fb" },
  },
  shape: { borderRadius: 10 },
});

const exampleSuggestions = [
  "Compare IPO performance by sector for the last 6 months.",
  "What are the key risks for the tech industry?",
  "Show me a chart of S&P 500 vs Dow Jones this year.",
];

const SYSTEM_ICONS: Record<string, React.ReactNode> = {
  "Summary": <InfoOutlinedIcon color="info" />,
  "Risks": <InfoOutlinedIcon color="warning" />,
  "Positive": <InfoOutlinedIcon color="success" />,
  "Negative": <InfoOutlinedIcon color="error" />,
  "Recommendations": <InfoOutlinedIcon color="primary" />,
  // ... add more as you wish
};

// --- Util: Parsing AI outputs ---
function parseAIResponse(rawText: string): { chartData: any | null, jsonData: any | null, sections: any[], unstructured: boolean } {
  // Extract chartjs JSON blocks
  const chartBlock = rawText.match(/``````/im);
  let chartData = null;
  let jsonData = null;

  if (chartBlock && chartBlock[1]) {
    try {
      chartData = JSON.parse(chartBlock[1]);
    } catch {}
    rawText = rawText.replace(chartBlock[0], "");
  }
  // Extract JSON blocks (for tabular or code data)
  const jsonBlock = rawText.match(/``````/im);
  if (jsonBlock && jsonBlock[1]) {
    try {
      jsonData = JSON.parse(jsonBlock[1]);
    } catch {}
    rawText = rawText.replace(jsonBlock[0], "");
  }
  // Section/smart paragraph splitting
  const lines = rawText.split('\n');
  const sections: any[] = [];
  let current = { title: 'Summary', content: '' };
  let foundAnyHeading = false;
  const headingRx = /^([A-Z][a-z ]{2,30}):?$/;
  for (const line of lines) {
    const mh = line.trim().match(headingRx);
    if (mh) {
      if (current.content) {
        sections.push({ ...current });
      }
      foundAnyHeading = true;
      current = { title: mh[1], content: '' };
    } else {
      current.content += (current.content ? "\n" : "") + line.trim();
    }
  }
  if (current.content) sections.push(current);

  // Determine if this was just random text, not matching meta-format
  const onlyUnstructured = !chartData && !jsonData && !foundAnyHeading;
  return {
    chartData,
    jsonData,
    sections: sections
      .map(s => ({
        ...s,
        icon: SYSTEM_ICONS[s.title] || <InfoOutlinedIcon color="primary" />,
        content: s.content.trim(),
      }))
      .filter(s => s.content),
    unstructured: onlyUnstructured,
  };
}

// --- Components ---
function WelcomeScreen({ onSuggestionClick }: { onSuggestionClick: (text: string) => void }) {
  return (
    <Box textAlign="center" p={4} sx={{ background: "#e6edfa36", borderRadius: 3, my: 6 }}>
      <AutoAwesomeIcon sx={{ fontSize: 64, color: "primary.main", mb: 1 }} />
      <Typography variant="h4" gutterBottom fontWeight="bold">
        Financial Analyst Chat
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" mb={3}>
        Ask about stocks, IPOs, risks, or financial data. <br />
        Try one of these:
      </Typography>
      <Stack direction="row" spacing={2} justifyContent="center" flexWrap="wrap" mb={2}>
        {exampleSuggestions.map(s => (
          <Chip key={s} label={s}
            clickable variant="outlined"
            onClick={() => onSuggestionClick(s)}
            sx={{
              mb: 1,
              transition: "all 0.2s",
              "&:hover": { bgcolor: 'primary.100', borderColor: "primary.main" },
            }}
          />
        ))}
      </Stack>
    </Box>
  );
}

function ChartPanel({ chartData }: { chartData: any }) {
  if (!chartData) return null;
  // Defensive fallback
  if (!chartData?.data || !chartData?.options) return (
    <Alert severity="info" sx={{ mt: 1, mb: 1 }}>Chart data malformed.</Alert>
  );
  return (
    <Paper variant="outlined" sx={{ my: 2, borderColor: "#e2e8f0", bgcolor: "#f6f7fb" }}>
      <Box p={2}>
        <Stack direction="row" alignItems="center" spacing={1} mb={2}>
          <InfoOutlinedIcon color="primary" fontSize="medium" />
          <Typography fontWeight="semibold">Chart Visualization</Typography>
        </Stack>
        <Box sx={{ height: 280 }}>
          <Bar data={chartData.data} options={{
            ...chartData.options, responsive: true, maintainAspectRatio: false,
            plugins: { legend: { display: true }, tooltip: { enabled: true } },
          }} />
        </Box>
      </Box>
    </Paper>
  );
}

function PrettyJsonBlock({ data }: { data: any }) {
  const [copied, setCopied] = useState(false);
  return (
    <Box position="relative" sx={{ my: 2 }}>
      <Paper variant="outlined" sx={{ p: 2, background: "#272b32" }}>
        <Button
          variant="text" color="inherit"
          size="small" sx={{ position: "absolute", right: 16, top: 12, minWidth: 0 }}
          onClick={() => {
            navigator.clipboard.writeText(prettyjson(data));
            setCopied(true); setTimeout(() => setCopied(false), 1800);
          }}>
          {copied ? <CheckIcon fontSize="small" /> : <ContentCopyIcon fontSize="small" />}
        </Button>
        <SyntaxHighlighter language="json" style={oneLight} customStyle={{
          background: "transparent", color: "#e1f1ff", fontSize: "1rem"
        }}>
          {prettyjson(data)}
        </SyntaxHighlighter>
      </Paper>
    </Box>
  );
}

function SectionBlocks({ sections }: { sections: any[] }) {
  return (
    <Stack spacing={3} sx={{ mt: 0.5 }}>
      {sections.map((sec, i) => (
        <Box key={i}>
          <Stack direction="row" alignItems="center" spacing={1.5} mb={1}>
            {sec.icon}
            <Typography variant="subtitle1" fontWeight="bold">{sec.title}</Typography>
          </Stack>
          <Typography variant="body1" sx={{
            whiteSpace: "pre-line", color: "text.secondary", ml: 5
          }}>{sec.content}</Typography>
        </Box>
      ))}
    </Stack>
  );
}

function UnstructuredText({ text }: { text: string }) {
  return (
    <Box sx={{ p: 2, bgcolor: "#f4f4f4", borderRadius: 2 }}>
      <Stack direction="row" alignItems="center" spacing={1} mb={1}>
        <InfoOutlinedIcon color="warning" fontSize="small" />
        <Typography color="warning.main" variant="caption" fontWeight="bold">
          Unstructured output from AI (formatted for readability)
        </Typography>
      </Stack>
      <Typography sx={{ whiteSpace: "pre-line", color: "#222" }}>{text}</Typography>
    </Box>
  );
}

function AIResponse({
  text, chartData, jsonData, sections, unstructured
}: { text: string, chartData: any, jsonData: any, sections: any[], unstructured: boolean }) {
  return (
    <Box>
      {chartData && <ChartPanel chartData={chartData} />}
      {jsonData && <PrettyJsonBlock data={jsonData} />}
      {!chartData && !jsonData && !sections?.length && unstructured ? (
        <UnstructuredText text={text} />
      ) : (
        <SectionBlocks sections={sections} />
      )}
    </Box>
  );
}

// --- Chat Bubble ---
function ChatMessage({ message, timestamp = undefined }: { message: any, timestamp?: string }) {
  const isUser = message.type === "user";
  return (
    <Box my={2} display="flex" flexDirection={isUser ? "row-reverse" : "row"} alignItems="flex-start">
      <Box flexShrink={0} mx={1}>
        <Avatar sx={{
          width: 38, height: 38, bgcolor: isUser ? 'primary.main' : '#eee',
          color: isUser ? "#fff" : "primary.main",
        }}>
          {isUser ? <AccountCircleIcon fontSize="medium" /> : <SmartToyIcon />}
        </Avatar>
      </Box>
      <Paper elevation={0}
        sx={{
          p: 2, borderRadius: 4, maxWidth: "80%", minWidth: 150,
          bgcolor: isUser ? "primary.main" : "#fff",
          color: isUser ? "#fff" : "#171717",
          boxShadow: isUser ? "0 2px 8px #1876d224" : "0 1px 6px #b8b8d033",
        }}>
        {isUser
          ? <Typography>{message.text}</Typography>
          : <AIResponse {...message} />}
      </Paper>
      {timestamp && (
        <Typography ml={1} variant="caption" color="text.secondary" sx={{ mt: 1.5 }}>
          {timestamp}
        </Typography>
      )}
    </Box>
  );
}

function LimitBar({ count, max }: { count: number, max: number }) {
  return (
    <Box py={2} width="100%">
      <Stack direction="row" alignItems="center" spacing={2}>
        <LinearProgress
          variant="determinate"
          value={100 * count / max}
          sx={{ flex: 1, borderRadius: 1, height: 8, bgcolor: "#e8e8ee" }}
          color={count < max - 2 ? "primary" : "warning"} />
        <Typography fontWeight="bold" color="text.secondary" fontSize={14}>
          {count} / {max}
        </Typography>
      </Stack>
    </Box>
  );
}

// --- Main UI ---
export default function PerplexityChat() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [copySuccess, setCopySuccess] = useState(false);
  const chatEnd = useRef<HTMLDivElement>(null);
  const MAX = MAX_EXCHANGES;
  const exchanges = messages.filter(m => m.type === "ai").length;
  const limitReached = exchanges >= MAX;
  const apiUrl = process.env.REACT_APP_API_URL;
  const token = localStorage.getItem("access_token");
  // Scroll to chat bottom
  useEffect(() => { chatEnd.current?.scrollIntoView({behavior: "smooth"}); }, [messages, loading]);
  // Focus on input
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => { if (inputRef.current) inputRef.current.focus(); }, [limitReached]);

  async function send(text: string) {
    text = text.trim();
    if (!text) return;
    if (!apiUrl || !token) {
      setApiError("API URL or token not configured.");
      return;
    }
    setMessages(m => ([...m, { type: "user", text }]));
    setApiError(null);
    setLoading(true);
    setInput("");
    try {
      const convForHistory = messages
        .map(m => ({ role: m.type === "ai" ? "assistant" : "user", content: m.text }));
      // Call API
      const res = await fetch(`${apiUrl}/api/perplexity_chat/`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          question: text,
          history: convForHistory,
        }),
      });
      if (!res.ok) throw new Error(`API error: ${res.statusText}`);
      const data = await res.json();
      const parsed = parseAIResponse(data.answer);
      setMessages(m => ([...m, {
        type: "ai",
        text: data.answer,
        ...parsed,
      }]));
    } catch (e: any) {
      setApiError(e.message);
    } finally { setLoading(false); }
  }

  function handleInputKey(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !loading && !limitReached) {
      send(input);
    }
  }

  function handleNewChat() {
    setMessages([]); setApiError(null); setInput("");
    setTimeout(() => { inputRef.current?.focus(); }, 10);
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth="md" sx={{
        height: "99vh", display: "flex", flexDirection: "column",
        pt: 2, pb: 2, minHeight: "99vh"
      }}>
        <Box sx={{
          flexGrow: 1, overflowY: "auto", display: "flex", flexDirection: "column", p: 2, mt: 1
        }}>
          {messages.length === 0 && !loading ? (
            <WelcomeScreen onSuggestionClick={txt => { setInput(txt); send(txt); }} />
          ) : (
            <Stack spacing={0.5}>
              <LimitBar count={exchanges} max={MAX} />
              {messages.map((msg, idx) => (
                <ChatMessage key={idx} message={msg} />
              ))}
              {loading && (
                <Box ml={4}>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <SmartToyIcon color="primary" fontSize="medium" />
                    <Skeleton variant="rounded" width="60%" height={42} animation="wave" />
                    <CircularProgress size={22} sx={{ ml: 2 }} />
                  </Stack>
                </Box>
              )}
              <div ref={chatEnd} />
            </Stack>
          )}
        </Box>
        {apiError && (
          <Alert severity="error" sx={{ mb: 2, fontWeight: "bold" }}>
            {apiError}
          </Alert>
        )}
        <Paper sx={{
          px: 2, py: 1.3, mb: 1, position: "relative", boxShadow: "0 4px 30px #ccd6f640"
        }}>
          {limitReached ? (
            <Stack direction="row" spacing={2} alignItems="center" justifyContent="center">
              <Typography color="warning.main" fontWeight="bold">
                Conversation limit reached!
              </Typography>
              <Button variant="contained" startIcon={<ReplayIcon />} onClick={handleNewChat}>
                New Chat
              </Button>
            </Stack>
          ) : (
            <Stack direction="row" spacing={1.5} alignItems="center">
              <TextField
                fullWidth variant="outlined" placeholder="Enter question or follow-up..."
                value={input}
                inputRef={inputRef}
                onChange={e => setInput(e.target.value)}
                disabled={loading}
                onKeyDown={handleInputKey}
                sx={{ background: "#f7f9fd", borderRadius: 2 }}
              />
              <Tooltip title="Send">
                <span>
                  <IconButton
                    color="primary" onClick={() => send(input)}
                    disabled={loading || !input.trim()}
                    size="large"
                  >
                    {loading ? <CircularProgress size={24} /> : <SendIcon />}
                  </IconButton>
                </span>
              </Tooltip>
            </Stack>
          )}
        </Paper>
      </Container>
    </ThemeProvider>
  );
}
