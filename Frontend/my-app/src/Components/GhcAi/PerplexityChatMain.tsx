import React, { useEffect, useState } from "react";
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  CircularProgress,
  Container,
  Stack,
} from "@mui/material";
import { useLocation } from "react-router-dom";
import SendIcon from "@mui/icons-material/Send";
import SuggestedQuestions from "./AIPages/SuggestedQuestions";
import GHCAIMain from "./GHCAIMain";
import MidasChat from "./MidasChat";

type BotResponseItem = {
  id: number;
  question: string;
  answer: unknown;
  created_at?: string;
  bot_type?: string | null;
};

const toBlockArray = (payload: unknown): any[] => {
  if (!payload) return [];
  if (Array.isArray(payload)) return payload;
  if (typeof payload === "object" && payload !== null) {
    const candidates = [
      (payload as Record<string, unknown>).answer,
      (payload as Record<string, unknown>).blocks,
      (payload as Record<string, unknown>).data,
      (payload as Record<string, unknown>).response,
    ];
    for (const candidate of candidates) {
      if (Array.isArray(candidate)) return candidate;
    }
    const textCandidate = candidates.find((c) => typeof c === "string") as
      | string
      | undefined;
    if (textCandidate) {
      return [{ type: "text", content: textCandidate }];
    }
    try {
      return [{ type: "text", content: JSON.stringify(payload, null, 2) }];
    } catch {
      return [{ type: "text", content: "Received response." }];
    }
  }
  return [{ type: "text", content: String(payload) }];
};

const PerplexityChatMain: React.FC = () => {
  const location = useLocation();
  const stockData = location.state?.stock;

  const formatStockAsQuestion = (stock: any) => {
    return `Give me insights on ${stock.stock_name} in the ${stock.sector} sector (${stock.region}, ${stock.country}). `;
  };

  // 0 = MIDAS, 1 = GLOBAL
  const [activeTab, setActiveTab] = useState<number>(0);

  const [question, setQuestion] = useState<string>(
    stockData ? formatStockAsQuestion(stockData) : ""
  );
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [midasQuestion, setMidasQuestion] = useState<string>("");
  const [midasData, setMidasData] = useState<any[]>([]);
  const [midasLoading, setMidasLoading] = useState(false);
  const [midasError, setMidasError] = useState<string | null>(null);
  const [midasRecent, setMidasRecent] = useState<BotResponseItem[]>([]);
  const [midasRecentLoading, setMidasRecentLoading] = useState(false);
  const [midasRecentError, setMidasRecentError] = useState<string | null>(null);
  const [showMidasRecent, setShowMidasRecent] = useState(false);

  const [globalRecent, setGlobalRecent] = useState<BotResponseItem[]>([]);
  const [globalRecentLoading, setGlobalRecentLoading] = useState(false);
  const [globalRecentError, setGlobalRecentError] = useState<string | null>(null);
  const [showGlobalRecent, setShowGlobalRecent] = useState(false);

  const apiUrl = process.env.REACT_APP_API_URL;
  const token = localStorage.getItem("access_token");

  const fetchRecentResponses = async (
    botType: string,
    setItems: React.Dispatch<React.SetStateAction<BotResponseItem[]>>,
    setLoading: React.Dispatch<React.SetStateAction<boolean>>,
    setError: React.Dispatch<React.SetStateAction<string | null>>
  ) => {
    if (!apiUrl) return;
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ bot_type: botType });
      const response = await fetch(
        `${apiUrl}/api/bot_responses/?${params.toString()}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : "",
          },
        }
      );
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Something went wrong");
      setItems(Array.isArray(result?.results) ? result.results : []);
    } catch (err: any) {
      setError(err.message || "Failed to fetch recent questions");
    } finally {
      setLoading(false);
    }
  };

  const saveBotResponse = async (
    botType: string,
    askedQuestion: string,
    answerPayload: unknown,
    setItems: React.Dispatch<React.SetStateAction<BotResponseItem[]>>
  ) => {
    if (!apiUrl) return;
    try {
      const response = await fetch(`${apiUrl}/api/bot_responses/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify({
          bot_type: botType,
          question: askedQuestion,
          answer: answerPayload,
        }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Something went wrong");
      const newItem: BotResponseItem = {
        id: result.id,
        question: result.question,
        answer: result.answer,
        created_at: result.created_at,
        bot_type: result.bot_type,
      };
      setItems((prev) => [newItem, ...prev]);
    } catch (err: any) {
      console.error("Failed to save bot response", err);
    }
  };

  const handleSubmit = async (
    e?: React.FormEvent | Event,
    customQuestion?: string
  ) => {
    if (e?.preventDefault) e.preventDefault();
    const query = customQuestion ?? question;
    if (!query.trim()) return;

    setLoading(true);
    setData([]);
    setError(null);

    try {
      const response = await fetch(`${apiUrl}/api/perplexity_chat/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify({
          question: query.trim(),
          history: [],
        }),
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Something went wrong");
      if (Array.isArray(result.answer)) {
        setData(result.answer);
        saveBotResponse("global_bot", query.trim(), result.answer, setGlobalRecent);
      }
      else throw new Error("Invalid response format");
    } catch (err: any) {
      setError(err.message || "Failed to fetch answer");
    } finally {
      setLoading(false);
    }
  };

  const handleMidasAsk = async (
    e?: React.FormEvent | Event,
    customQuestion?: string
  ) => {
    if (e?.preventDefault) e.preventDefault();
    const query = (customQuestion ?? midasQuestion).trim();
    if (!query) return;

    setMidasLoading(true);
    setMidasData([]);
    setMidasError(null);

    try {
      const response = await fetch(`${apiUrl}/api/midas_universal_rag_query/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify({
          question: query,
        }),
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Something went wrong");
      if (Array.isArray(result.answer)) {
        setMidasData(result.answer);
        saveBotResponse("midas_bot", query, result.answer, setMidasRecent);
      }
      else throw new Error("Invalid response format");
    } catch (err: any) {
      setMidasError(err.message || "Failed to fetch answer");
    } finally {
      setMidasLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 0) {
      fetchRecentResponses(
        "midas_bot",
        setMidasRecent,
        setMidasRecentLoading,
        setMidasRecentError
      );
    }
    if (activeTab === 1) {
      fetchRecentResponses(
        "global_bot",
        setGlobalRecent,
        setGlobalRecentLoading,
        setGlobalRecentError
      );
    }
    // keep your existing auto-run behavior, but only for Global Chat
    if (activeTab !== 1) return;

    if (stockData) {
      const formatted = formatStockAsQuestion(stockData);
      setQuestion(formatted);
      handleSubmit(undefined, formatted);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stockData, activeTab]);

  return (
    <Box
      sx={{
        background:
          "linear-gradient(to bottom, rgba(210, 222, 231, 1), rgba(203, 220, 223, 1))",
        minHeight: "200vh",
      }}
    >
      <Typography
        variant="body2"
        sx={{
          fontWeight: 500,
          color: "#FFFFFF",
          fontSize: { xs: "1rem", sm: "1.2rem" },
          backgroundColor: "#002060",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "4vh",
          padding: "8px 16px",
          borderRadius: "8px",
          textAlign: "center",
          marginBottom: "20px",
          boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
          animation: "fadeIn 1.5s ease-in-out",
          "@keyframes fadeIn": {
            "0%": { opacity: 0 },
            "100%": { opacity: 1 },
          },
        }}
      >
        Welcome to AI-Powered Conversations, Seamlessly Integrated
      </Typography>

      <Container maxWidth="xl">
        {/* Simple Button Tabs */}
        <Box display="flex" justifyContent="center" gap={2} mb={3}>
          <Button
            variant={activeTab === 0 ? "contained" : "outlined"}
            onClick={() => setActiveTab(0)}
            sx={{
              borderRadius: 3,
              px: 4,
              fontWeight: 600,
              backgroundColor: activeTab === 0 ? "#002060" : "transparent",
              color: activeTab === 0 ? "#fff" : "#002060",
              borderColor: "#002060",
              "&:hover": {
                backgroundColor: "#001840",
                color: "#fff",
              },
            }}
          >
            MIDAS Chat
          </Button>

          <Button
            variant={activeTab === 1 ? "contained" : "outlined"}
            onClick={() => setActiveTab(1)}
            sx={{
              borderRadius: 3,
              px: 4,
              fontWeight: 600,
              backgroundColor: activeTab === 1 ? "#002060" : "transparent",
              color: activeTab === 1 ? "#fff" : "#002060",
              borderColor: "#002060",
              "&:hover": {
                backgroundColor: "#001840",
                color: "#fff",
              },
            }}
          >
            Global Chat
          </Button>
        </Box>

        {/* MIDAS TAB */}
        {activeTab === 0 && (
          <Box>
            <Stack direction="row" spacing={1} alignItems="center" mb={2} flexWrap="wrap">
              <Button
                variant="contained"
                size="small"
                onClick={() => setShowMidasRecent((prev) => !prev)}
                sx={{
                  textTransform: "none",
                  borderRadius: 999,
                  px: 2,
                  backgroundColor: "#002060",
                  boxShadow: "0 8px 18px rgba(0, 32, 96, 0.25)",
                  "&:hover": {
                    backgroundColor: "#001840",
                    boxShadow: "0 10px 22px rgba(0, 32, 96, 0.35)",
                  },
                }}
              >
                {showMidasRecent ? "Hide recent questions" : "Show recent questions"}
              </Button>
              {midasRecentLoading && <CircularProgress size={16} />}
            </Stack>
            {midasRecentError && (
              <Typography variant="body2" color="error" sx={{ mb: 2 }}>
                {midasRecentError}
              </Typography>
            )}
            {showMidasRecent && midasRecent.length === 0 && !midasRecentLoading && (
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                No previous MIDAS questions yet.
              </Typography>
            )}
            {showMidasRecent && midasRecent.length > 0 && (
              <Stack spacing={1.5} mb={3}>
                {midasRecent.map((item) => (
                  <Paper
                    key={item.id}
                    variant="outlined"
                    sx={{
                      p: 1.5,
                      borderRadius: 2,
                      borderColor: "rgba(0, 32, 96, 0.2)",
                      background:
                        "linear-gradient(180deg, rgba(248, 250, 255, 0.95), rgba(255,255,255,1))",
                      display: "flex",
                      flexDirection: "column",
                      gap: 1,
                      boxShadow: "0 10px 18px rgba(0, 32, 96, 0.08)",
                    }}
                  >
                    <Typography variant="subtitle2">{item.question}</Typography>
                    <Button
                      variant="text"
                      size="small"
                      onClick={() => {
                        setMidasQuestion(item.question ?? "");
                        setMidasData(toBlockArray(item.answer));
                        setMidasError(null);
                      }}
                      sx={{
                        alignSelf: "flex-start",
                        textTransform: "none",
                        px: 0,
                        color: "#002060",
                        fontWeight: 600,
                      }}
                    >
                      View answer
                    </Button>
                  </Paper>
                ))}
              </Stack>
            )}
            <MidasChat
              question={midasQuestion}
              data={midasData}
              loading={midasLoading}
              error={midasError}
              setQuestion={setMidasQuestion}
              onAsk={handleMidasAsk}
            />
          </Box>
        )}

        {/* GLOBAL TAB (your existing UI + functionality) */}
        {activeTab === 1 && (
          <>
            {/* Flex Layout: Left = Paper, Right = Heatmap Button */}
            <Box
              display="flex"
              flexDirection={{ xs: "column", md: "row" }}
              justifyContent="space-between"
              alignItems="flex-start"
              gap={4}
            >
              <Paper
                elevation={6}
                sx={{
                  width: { xs: "100%", sm: "80%", md: "60%", lg: "80%" },
                  mx: "auto",
                  p: 4,
                  borderRadius: 4,
                  background: "rgba(255, 255, 255, 0.7)",
                  backdropFilter: "blur(10px)",
                  border: "1px solid rgba(255, 255, 255, 0.3)",
                  boxShadow: "0 4px 20px rgba(0, 0, 0, 0.2)",
                }}
              >
                <Typography
                  variant="h5"
                  align="center"
                  sx={{ fontWeight: 700, color: "#002060", mb: 2 }}
                >
                  Ask. Analyze. Act - with AI finance support
                </Typography>

                <Typography
                  align="center"
                  sx={{ fontSize: "0.95rem", color: "#333", mb: 3 }}
                >
                  Meet your AI-powered Financial Assistant — here to simplify
                  your financial queries. Whether it's market trends, company
                  analysis, or quick number insights, just ask and get clear,
                  instant answers. Simple, smart finance help — no jargon, just
                  clarity.
                </Typography>

                <Box
                  component="form"
                  onSubmit={handleSubmit}
                  display="flex"
                  gap={2}
                  flexDirection={{ xs: "column", sm: "row" }}
                >
                  <TextField
                    fullWidth
                    size="small"
                    label="Type your question..."
                    variant="outlined"
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    sx={{
                      background: "#ffffff",
                      borderRadius: 2,
                      input: { color: "#333" },
                    }}
                  />
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={loading || !question.trim()}
                    sx={{
                      background: "#c9c9c9ff",
                      color: "#002060",
                      px: 3,
                      borderRadius: 2,
                      transition: "transform 0.2s",
                      minWidth: { xs: "100%", sm: 50 },
                      "&:hover": {
                        transform: "scale(1.05)",
                        background:
                          "linear-gradient(45deg, #c7dddbff, #f0efd1ff)",
                      },
                    }}
                  >
                    {loading ? (
                      <CircularProgress size={22} color="inherit" />
                    ) : (
                      <SendIcon />
                    )}
                  </Button>
                </Box>
              </Paper>

              {/* Right side - Open Heatmap Button */}
            </Box>

            {/* AI Response and Suggestions */}
            <GHCAIMain data={data} loading={loading} error={error} />

            <Box sx={{ mt: 2 }}>
              <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                <Button
                  variant="contained"
                  size="small"
                  onClick={() => setShowGlobalRecent((prev) => !prev)}
                  sx={{
                    textTransform: "none",
                    borderRadius: 999,
                    px: 2,
                    background: "linear-gradient(45deg, #c7dddbff, #f0efd1ff)",
                    color: "#002060",
                    boxShadow: "0 8px 18px rgba(0, 0, 0, 0.12)",
                    "&:hover": {
                      background: "linear-gradient(45deg, #b9d5d3, #e8e6c5)",
                    },
                  }}
                >
                  {showGlobalRecent ? "Hide recent questions" : "Show recent questions"}
                </Button>
                {globalRecentLoading && <CircularProgress size={16} />}
              </Stack>
              {globalRecentError && (
                <Typography variant="body2" color="error" sx={{ mt: 1 }}>
                  {globalRecentError}
                </Typography>
              )}
              {showGlobalRecent &&
                globalRecent.length === 0 &&
                !globalRecentLoading && (
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    No previous Global questions yet.
                  </Typography>
                )}
              {showGlobalRecent && globalRecent.length > 0 && (
                <Stack spacing={1.5} sx={{ mt: 2 }}>
                  {globalRecent.map((item) => (
                    <Paper
                      key={item.id}
                      variant="outlined"
                      sx={{
                        p: 1.5,
                        borderRadius: 2,
                        borderColor: "rgba(0, 32, 96, 0.18)",
                        background:
                          "linear-gradient(180deg, rgba(255, 255, 255, 0.9), rgba(240, 247, 246, 0.9))",
                        display: "flex",
                        flexDirection: "column",
                        gap: 1,
                        boxShadow: "0 10px 18px rgba(0, 0, 0, 0.08)",
                      }}
                    >
                      <Typography variant="subtitle2">{item.question}</Typography>
                      <Button
                        variant="text"
                        size="small"
                        onClick={() => {
                          setQuestion(item.question ?? "");
                          setData(toBlockArray(item.answer));
                          setError(null);
                        }}
                        sx={{
                          alignSelf: "flex-start",
                          textTransform: "none",
                          px: 0,
                          color: "#002060",
                          fontWeight: 600,
                        }}
                      >
                        View answer
                      </Button>
                    </Paper>
                  ))}
                </Stack>
              )}
            </Box>

            {/* <SuggestedQuestions
              questions={
                data.find((block) => block.type === "suggested_questions")
                  ?.questions || []
              }
              onSelect={(selected) => {
                setQuestion(selected);
                handleSubmit(undefined, selected);
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
            /> */}
          </>
        )}
      </Container>
    </Box>
  );
};

export default PerplexityChatMain;
