import React, { useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Divider,
  Link,
  Stack,
  TextField,
  Typography,
  Chip,
  ThemeProvider,
  createTheme,
} from "@mui/material";
import SendRoundedIcon from "@mui/icons-material/SendRounded";

type Source = { title: string; url: string; score?: number };
type ChatResponse = { answer: string; sources: Source[] };

const theme = createTheme({
  palette: {
    mode: "light",
    primary: { main: "#2563eb" }, // blue
    secondary: { main: "#7c3aed" }, // purple
    background: { default: "#f7f8fc" },
  },
  typography: {
    fontFamily:
      'Inter, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", "Apple Color Emoji", "Segoe UI Emoji"',
    h5: { fontWeight: 800 },
    subtitle2: { fontWeight: 700 },
  },
  shape: { borderRadius: 14 },
});

const MidasChatbotData: React.FC = () => {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState<string>("");
  const [sources, setSources] = useState<Source[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const apiUrl = useMemo(() => process.env.REACT_APP_API_URL, []);

  const ask = async () => {
    if (!question.trim() || loading) return;

    if (!apiUrl) {
      setError("API URL is not defined in environment variables");
      return;
    }

    const token = localStorage.getItem("access_token");

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`${apiUrl}/api/chatbot_query/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ question: question.trim() }),
      });

      if (!res.ok) {
        let detail = "";
        try {
          const errJson = await res.json();
          detail = errJson?.detail ? ` - ${errJson.detail}` : "";
        } catch {
          // ignore
        }
        throw new Error(`Request failed: ${res.status}${detail}`);
      }

      const data: ChatResponse = await res.json();
      setAnswer(data?.answer ?? "");
      setSources(Array.isArray(data?.sources) ? data.sources : []);
    } catch (e: any) {
      setError(e?.message || "Something went wrong");
      setAnswer("");
      setSources([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <Box
        sx={{
          minHeight: "40vh",
          display: "grid",
          placeItems: "center",
          bgcolor: "background.default",
          p: 2,
        }}
      >
        <Card
          elevation={0}
          sx={{
            width: "min(820px, 80vw)",
            border: "1px solid",
            borderColor: "divider",
            overflow: "hidden",
            background:
              "linear-gradient(180deg, rgba(37,99,235,0.06) 0%, rgba(124,58,237,0.03) 45%, rgba(255,255,255,1) 100%)",
          }}
        >
          <CardContent sx={{ p: { xs: 2, sm: 3.5 } }}>
            <Stack spacing={2.2} alignItems="center" textAlign="center">
              <Box>
                <Typography variant="h5" color="#002060" sx={{ letterSpacing: 0.2 }}>
                  Midas Chatbot
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                  Ask a question and get an answer with sources.
                </Typography>
              </Box>

              <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={1.2}
                sx={{ width: "100%" }}
                alignItems="stretch"
              >
                <TextField
                  fullWidth
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="Ask about this site..."
                  disabled={loading}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") ask();
                  }}
                  variant="outlined"
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      bgcolor: "white",
                    },
                  }}
                />

                <Button
                  variant="contained"
                  size="large"
                  onClick={ask}
                  disabled={loading || !question.trim()}
                  endIcon={
                    loading ? <CircularProgress size={18} color="inherit" /> : <SendRoundedIcon />
                  }
                  sx={{
                    minWidth: { xs: "100%", sm: 150 },
                    fontWeight: 800,
                    textTransform: "none",
                    boxShadow: "none",
                  }}
                >
                  {loading ? "Asking" : "Ask"}
                </Button>
              </Stack>

              {error && (
                <Alert
                  severity="error"
                  sx={{ width: "100%", textAlign: "left", borderRadius: 3 }}
                >
                  {error}
                </Alert>
              )}

              {answer && (
                <Box
                  sx={{
                    width: "100%",
                    textAlign: "left",
                    bgcolor: "rgba(255,255,255,0.75)",
                    border: "1px solid",
                    borderColor: "divider",
                    borderRadius: 3,
                    p: { xs: 1.5, sm: 2 },
                  }}
                >
                  <Stack spacing={1.2}>
                    <Typography variant="subtitle2" color="primary">
                      Answer
                    </Typography>

                    <Typography
                      variant="body1"
                      sx={{
                        whiteSpace: "pre-wrap",
                        lineHeight: 1.7,
                        fontSize: { xs: 14.5, sm: 15.5 },
                      }}
                    >
                      {answer}
                    </Typography>

                    {sources.length > 0 && (
                      <>
                        <Divider sx={{ my: 0.5 }} />

                        <Stack spacing={1}>
                          <Typography variant="subtitle2" color="secondary">
                            Sources
                          </Typography>

                          <Stack direction="row" flexWrap="wrap" gap={1}>
                            {sources.map((s, idx) => (
                              <Chip
                                key={`${s.url}-${s.title}-${idx}`}
                                label={
                                  typeof s.score === "number"
                                    ? `${s.title} (${s.score.toFixed(2)})`
                                    : s.title
                                }
                                component="a"
                                href={s.url}
                                target="_blank"
                                rel="noreferrer"
                                clickable
                                variant="outlined"
                                sx={{
                                  bgcolor: "white",
                                  borderColor: "rgba(37,99,235,0.35)",
                                  "&:hover": { borderColor: "primary.main" },
                                  maxWidth: "100%",
                                }}
                              />
                            ))}
                          </Stack>

                          <Typography variant="caption" color="text.secondary">
                            Tip: click a source chip to open it in a new tab.
                          </Typography>
                        </Stack>
                      </>
                    )}
                  </Stack>
                </Box>
              )}
            </Stack>
          </CardContent>
        </Card>
      </Box>
    </ThemeProvider>
  );
};

export default MidasChatbotData;
