import React, { useState, useRef, useEffect } from "react";
import {
  Box,
  Button,
  Container,
  Paper,
  TextField,
  Typography,
  CircularProgress,
  Alert,
  IconButton,
  Stack,
  ThemeProvider,
  createTheme,
  CssBaseline,
  Skeleton,
} from "@mui/material";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from "chart.js";

// Icons
import SendIcon from "@mui/icons-material/Send";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import InsightsIcon from "@mui/icons-material/Insights";
import SubjectIcon from "@mui/icons-material/Subject";
import GppGoodIcon from "@mui/icons-material/GppGood";
import GppBadIcon from "@mui/icons-material/GppBad";
import RecommendIcon from "@mui/icons-material/Recommend";

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

// --- THEME & STYLING ---
const theme = createTheme({
  palette: {
    primary: { main: "#2563eb" },
    secondary: { main: "#475569" },
    background: { default: "#f1f5f9", paper: "#ffffff" },
    text: { primary: "#0f172a", secondary: "#334155" },
    success: { main: "#16a34a" },
    warning: { main: "#f97316" },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h4: { fontWeight: 700 },
    h6: { fontWeight: 600 },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: "none",
          fontWeight: 600,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
        },
      },
    },
  },
});

// --- TYPES & CONSTANTS ---
type ChartData = { type: string; data: any; options: any };
type Section = { title: string; content: string; icon: React.ReactNode };
type Message = {
  type: "user" | "ai";
  text: string;
  chartData?: ChartData | null;
  sections?: Section[];
};

const SYSTEM_VIS_PROMPT = `
You are a financial data analyst assistant. Your job is to provide clear, clean responses that include executable JavaScript-ready code or directly plottable Chart.js compatible JSON data.
Rules for data presentation:
- If the user requests analysis or visualization, include chart data inside a single markdown code block with tag \`chartjs\`, exactly like this:
\`\`\`chartjs
{
  "type": "bar",
  "data": {...},
  "options": {...}
}
\`\`\`
- Provide a concise, human-readable summary or explanation before the code block.
- For non-chart data, use \`\`\`json\n{ ... }\n\`\`\`.
- The summary must be clear, brief, and separate from the code block by an empty line for easy parsing.
`;

const SECTION_CONFIG: Record<string, { icon: React.ReactNode }> = {
  Summary: { icon: <SubjectIcon color="primary" /> },
  Risks: { icon: <GppBadIcon color="warning" /> },
  Positive: { icon: <GppGoodIcon color="success" /> },
  Recommendations: { icon: <RecommendIcon color="primary" /> },
};

// --- PARSING LOGIC ---
const parseAIResponse = (
  rawText: string
): { chartData: ChartData | null; sections: Section[] } => {
  const chartRegex = /```chartjs\n([\s\S]*?)\n```/;
  const chartMatch = rawText.match(chartRegex);
  let chartData: ChartData | null = null;
  let textForParsing = rawText;

  if (chartMatch && chartMatch[1]) {
    try {
      chartData = JSON.parse(chartMatch[1]);
      textForParsing = rawText.replace(chartRegex, "").trim(); // Remove chart block for text processing
    } catch (e) {
      console.error("Failed to parse chart JSON:", e);
    }
  }

  // Clean remaining markdown artifacts
  const cleanedText = textForParsing
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/__(.*?)__/g, "$1")
    .split("\n")
    .map((line) => line.trim())
    .join("\n");

  const sections: Section[] = [];
  let currentSection: { title: string; content: string } = {
    title: "Summary",
    content: "",
  };

  cleanedText.split("\n").forEach((line) => {
    const sectionTitleMatch = line.match(
      /^(Summary|Risks|Positive|Negative|Recommendations):?$/i
    );
    if (sectionTitleMatch) {
      if (currentSection.content.trim()) {
        sections.push({
          ...currentSection,
          icon: SECTION_CONFIG[currentSection.title]?.icon || (
            <SubjectIcon color="primary" />
          ),
        });
      }
      currentSection = { title: sectionTitleMatch[1], content: "" };
    } else if (line.trim()) {
      currentSection.content += line + "\n";
    }
  });

  if (currentSection.content.trim()) {
    sections.push({
      ...currentSection,
      icon: SECTION_CONFIG[currentSection.title]?.icon || (
        <SubjectIcon color="primary" />
      ),
    });
  }

  return { chartData, sections };
};

// --- UI COMPONENTS ---

const AIResponse = ({
  chartData,
  sections,
}: {
  chartData?: ChartData | null;
  sections?: Section[];
}) => (
  <Stack spacing={3}>
    {chartData && (
      <Paper variant="outlined" sx={{ p: 2, borderColor: "#e2e8f0" }}>
        <Stack direction="row" alignItems="center" spacing={1} mb={2}>
          <InsightsIcon color="primary" />
          <Typography variant="h6">Visualized Data</Typography>
        </Stack>
        <Box sx={{ height: 350 }}>
          <Bar
            data={chartData.data}
            options={{
              ...chartData.options,
              responsive: true,
              maintainAspectRatio: false,
            }}
          />
        </Box>
      </Paper>
    )}
    {sections?.map((section, idx) => (
      <Box key={idx}>
        <Stack direction="row" alignItems="center" spacing={1.5} mb={1}>
          {section.icon}
          <Typography variant="h6">{section.title}</Typography>
        </Stack>
        <Typography
          variant="body1"
          sx={{ whiteSpace: "pre-line", color: "text.secondary", pl: 4.5 }}
        >
          {section.content.trim()}
        </Typography>
      </Box>
    ))}
  </Stack>
);

const ChatMessage = ({ message }: { message: Message }) => {
  const isUser = message.type === "user";
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: isUser ? "flex-end" : "flex-start",
      }}
    >
      <Paper
        sx={{
          p: 2,
          maxWidth: "85%",
          bgcolor: isUser ? "primary.main" : "background.paper",
          color: isUser ? "white" : "text.primary",
        }}
      >
        {isUser ? (
          <Typography>{message.text}</Typography>
        ) : (
          <AIResponse
            chartData={message.chartData}
            sections={message.sections}
          />
        )}
      </Paper>
    </Box>
  );
};

// --- MAIN COMPONENT ---
const PerplexityChat: React.FC = () => {
  const [inputValue, setInputValue] = useState("");
  const [conversation, setConversation] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const apiUrl = process.env.REACT_APP_API_URL;
  const token = localStorage.getItem("access_token");

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversation, loading]);

  const handleSend = async () => {
    if (!inputValue.trim() || !apiUrl || !token) {
      if (!apiUrl || !token)
        setApiError("Configuration error: API URL or Auth Token is missing.");
      return;
    }

    const userMessage: Message = { type: "user", text: inputValue.trim() };
    setConversation((prev) => [...prev, userMessage]);
    setLoading(true);
    setApiError(null);
    setInputValue("");

    try {
      const response = await fetch(`${apiUrl}/api/perplexity_chat/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          question: userMessage.text + "\n\n" + SYSTEM_VIS_PROMPT,
        }),
      });

      if (!response.ok)
        throw new Error(`API error: ${response.status} ${response.statusText}`);

      const data = await response.json();
      const { chartData, sections } = parseAIResponse(data.answer);
      const aiMessage: Message = {
        type: "ai",
        text: data.answer,
        chartData,
        sections,
      };
      setConversation((prev) => [...prev, aiMessage]);
    } catch (e: any) {
      setApiError(e.message || "An unknown error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container
        maxWidth="md"
        sx={{ display: "flex", flexDirection: "column", height: "95vh", pt: 2 }}
      >
        <Paper sx={{ p: 2, mb: 2, textAlign: "center" }}>
          <Stack
            direction="row"
            spacing={1}
            alignItems="center"
            justifyContent="center"
          >
            <AutoAwesomeIcon color="primary" sx={{ fontSize: "2rem" }} />
            <Typography variant="h4">Financial Analyst Assistant</Typography>
          </Stack>
        </Paper>

        <Box sx={{ flexGrow: 1, overflowY: "auto", p: 2 }}>
          <Stack spacing={3}>
            {conversation.map((msg, idx) => (
              <ChatMessage key={idx} message={msg} />
            ))}
            {loading && (
              <Box sx={{ display: "flex", justifyContent: "flex-start" }}>
                <Paper
                  sx={{ p: 2, maxWidth: "85%", bgcolor: "background.paper" }}
                >
                  <Stack spacing={2}>
                    <Skeleton variant="rectangular" width={250} height={20} />
                    <Skeleton variant="rectangular" width="100%" height={40} />
                    <Skeleton variant="rectangular" width="80%" height={20} />
                  </Stack>
                </Paper>
              </Box>
            )}
            <div ref={chatEndRef} />
          </Stack>
        </Box>

        {apiError && (
          <Alert severity="error" sx={{ mt: 2, mb: 1, fontWeight: "600" }}>
            {apiError}
          </Alert>
        )}

        <Paper sx={{ p: 1.5, mt: "auto" }}>
          <Stack direction="row" spacing={1.5} alignItems="center">
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Ask about IPOs, sector performance, or financials..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && !loading && handleSend()}
              disabled={loading}
              sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
            />
            <Button
              variant="contained"
              onClick={handleSend}
              disabled={loading || !inputValue.trim()}
              sx={{ px: 3, py: 1.5 }}
            >
              {loading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                <SendIcon />
              )}
            </Button>
          </Stack>
        </Paper>
      </Container>
    </ThemeProvider>
  );
};

export default PerplexityChat;
