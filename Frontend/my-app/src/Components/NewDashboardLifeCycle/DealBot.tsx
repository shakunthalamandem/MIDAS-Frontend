import React from "react";
import {
  Box,
  CircularProgress,
  IconButton,
  InputAdornment,
  LinearProgress,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import SendRoundedIcon from "@mui/icons-material/SendRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import BoltOutlinedIcon from "@mui/icons-material/BoltOutlined";
import GENAIRenderer from "../GhcAi/AIPages/GENAIRenderer";
import { Block } from "../GhcAi/Utils/ComponentsUtils";
import { type DealBotBasicDealDetails } from "./DealBotPdfExport";

type DealBotProps = {
  basicDealDetails: DealBotBasicDealDetails;
};

type BotResponseItem = {
  id: number;
  ticker?: string | null;
  unique_deal_id?: string | null;
  bot_type?: string | null;
  question: string;
  answer: unknown;
  created_at?: string;
};

const toBlocks = (payload: unknown): Block[] => {
  if (!payload) return [];

  if (Array.isArray(payload)) {
    return payload as Block[];
  }

  if (typeof payload === "object" && payload !== null) {
    const candidates = [
      (payload as Record<string, unknown>).answer,
      (payload as Record<string, unknown>).blocks,
      (payload as Record<string, unknown>).data,
      (payload as Record<string, unknown>).response,
    ];

    for (const candidate of candidates) {
      if (Array.isArray(candidate)) {
        return candidate as Block[];
      }
    }

    const textCandidate = candidates.find((c) => typeof c === "string") as string | undefined;

    if (textCandidate) {
      return [
        {
          type: "text",
          content: textCandidate,
        },
      ];
    }

    try {
      return [
        {
          type: "text",
          content: JSON.stringify(payload, null, 2),
        },
      ];
    } catch {
      return [
        {
          type: "text",
          content: "Received deal bot response.",
        },
      ];
    }
  }

  return [
    {
      type: "text",
      content: String(payload),
    },
  ];
};

const DealBot: React.FC<DealBotProps> = ({ basicDealDetails }) => {
  const [apiData, setApiData] = React.useState<any>(null);
  const [prepLoading, setPrepLoading] = React.useState(false);
  const [prepError, setPrepError] = React.useState<string | null>(null);
  const [question, setQuestion] = React.useState("");
  const [blocks, setBlocks] = React.useState<Block[]>([]);
  const [queryLoading, setQueryLoading] = React.useState(false);
  const [queryError, setQueryError] = React.useState<string | null>(null);
  const [recentResponses, setRecentResponses] = React.useState<BotResponseItem[]>([]);
  const [recentLoading, setRecentLoading] = React.useState(false);
  const [recentError, setRecentError] = React.useState<string | null>(null);
  const [showRecentQuestions, setShowRecentQuestions] = React.useState(true);

  const apiUrl = React.useMemo(() => process.env.REACT_APP_API_URL, []);
  const botType = React.useMemo(() => "deal_bot", []);
  const friendlyErrorMessage = React.useMemo(
    () => "Something went wrong. Please rerun to try again.",
    []
  );

  React.useEffect(() => {
    setQuestion("");
    setBlocks([]);
    setQueryError(null);
    setApiData(null);
    setShowRecentQuestions(true);

    if (!apiUrl) {
      setPrepError("API URL is not configured.");
      setPrepLoading(false);
      return;
    }

    const { ticker, pricing_date, deal_type, unique_deal_id, deal_id } = basicDealDetails ?? {};

    if (!ticker && !deal_id && !unique_deal_id) {
      setPrepError("Missing deal identifiers.");
      setPrepLoading(false);
      return;
    }

    const controller = new AbortController();

    const fetchDataPrep = async () => {
      setPrepLoading(true);
      setPrepError(null);

      try {
        const token = localStorage.getItem("access_token");
        const res = await fetch(`${apiUrl}/api/midas_chat_data_prep/`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          signal: controller.signal,
          body: JSON.stringify({
            ticker,
            pricing_date,
            deal_type,
            unique_deal_id,
            deal_id,
          }),
        });

        if (!res.ok) {
          const json = await res.json().catch(() => null);
          console.error("Deal data prep failed", json, res.status);
          setPrepError(friendlyErrorMessage);
          return;
        }

        const data = await res.json();
        setApiData(data);
      } catch (error: any) {
        if (controller.signal.aborted) return;
        console.error("Deal data prep threw", error);
        setPrepError(friendlyErrorMessage);
      } finally {
        setPrepLoading(false);
      }
    };

    fetchDataPrep();

    return () => controller.abort();
  }, [
    apiUrl,
    basicDealDetails.deal_id,
    basicDealDetails.deal_type,
    basicDealDetails.pricing_date,
    basicDealDetails.ticker,
    basicDealDetails.unique_deal_id,
    friendlyErrorMessage,
  ]);

  React.useEffect(() => {
    if (!apiUrl) return;

    if (!basicDealDetails?.ticker && !basicDealDetails?.unique_deal_id) {
      setRecentResponses([]);
      return;
    }

    const controller = new AbortController();

    const loadRecent = async () => {
      setRecentLoading(true);
      setRecentError(null);

      try {
        const token = localStorage.getItem("access_token");
        const res = await fetch(`${apiUrl}/api/bot_responses/`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          signal: controller.signal,
          body: JSON.stringify({
            action: "list",
            bot_type: botType,
            ticker: basicDealDetails?.ticker || null,
            unique_deal_id: basicDealDetails?.unique_deal_id || null,
          }),
        });

        if (!res.ok) {
          const json = await res.json().catch(() => null);
          console.error("Deal bot recent fetch failed", json, res.status);
          setRecentError(friendlyErrorMessage);
          return;
        }

        const data = await res.json();
        setRecentResponses(Array.isArray(data?.results) ? data.results : []);
      } catch (error: any) {
        if (controller.signal.aborted) return;
        console.error("Deal bot recent fetch threw", error);
        setRecentError(friendlyErrorMessage);
      } finally {
        setRecentLoading(false);
      }
    };

    loadRecent();
    return () => controller.abort();
  }, [
    apiUrl,
    botType,
    basicDealDetails?.ticker,
    basicDealDetails?.unique_deal_id,
    friendlyErrorMessage,
  ]);

  const saveBotResponse = async (nextBlocks: Block[], askedQuestion: string) => {
    if (!apiUrl) return;

    try {
      const token = localStorage.getItem("access_token");
      const res = await fetch(`${apiUrl}/api/bot_responses/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          action: "save",
          bot_type: botType,
          question: askedQuestion,
          answer: nextBlocks,
          ticker: basicDealDetails?.ticker || null,
          unique_deal_id: basicDealDetails?.unique_deal_id || null,
        }),
      });

      if (!res.ok) {
        const json = await res.json().catch(() => null);
        console.error("Deal bot response save failed", json, res.status);
        return;
      }

      const saved = await res.json();
      const newItem: BotResponseItem = {
        id: saved.id,
        ticker: saved.ticker,
        unique_deal_id: saved.unique_deal_id,
        bot_type: saved.bot_type,
        question: saved.question,
        answer: saved.answer,
        created_at: saved.created_at,
      };

      setRecentResponses((prev) => [newItem, ...prev]);
    } catch (error: any) {
      console.error("Deal bot response save threw", error);
    }
  };

  const handleAsk = async () => {
    const trimmed = question.trim();

    if (!trimmed || queryLoading) return;

    if (!apiUrl) {
      setQueryError("API URL is not configured.");
      return;
    }

    if (!apiData) {
      setQueryError("Deal data is still being prepared.");
      return;
    }

    setBlocks([]);
    setQueryLoading(true);
    setQueryError(null);

    try {
      const token = localStorage.getItem("access_token");
      const res = await fetch(`${apiUrl}/api/midas_chat_query/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          question: trimmed,
          api_data: apiData,
        }),
      });

      if (!res.ok) {
        const json = await res.json().catch(() => null);
        console.error("Deal query failed", json, res.status);
        setQueryError(friendlyErrorMessage);
        return;
      }

      const payload = await res.json();
      const nextBlocks = toBlocks(payload);

      setBlocks(nextBlocks);
      saveBotResponse(nextBlocks, trimmed);
    } catch (error: any) {
      console.error("Deal query threw", error);
      setQueryError(friendlyErrorMessage);
    } finally {
      setQueryLoading(false);
    }
  };

  const handleClearQuestion = () => {
    setQuestion("");
    setBlocks([]);
    setQueryError(null);
  };

  const handleSelectRecent = (item: BotResponseItem) => {
    const nextBlocks = toBlocks(item.answer);
    setQuestion(item.question ?? "");
    setBlocks(nextBlocks);
    setQueryError(null);
    setShowRecentQuestions(false);
  };

  const shouldShowRecentCards =
    showRecentQuestions && !prepLoading && recentResponses.length > 0;

  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        borderRadius: 3,
        border: "1px solid",
        borderColor: "divider",
        background:
          "radial-gradient(circle at top, rgba(233, 244, 255, 0.9), rgba(255,255,255,0.96) 55%)",
        boxShadow: "0 20px 45px rgba(15, 23, 42, 0.12)",
      }}
    >
      <Stack spacing={3}>
        <Stack
          spacing={1}
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          flexWrap="wrap"
        >
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              Deal Bot
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Ask questions about {basicDealDetails.ticker}
            </Typography>
          </Box>

          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              mt: { xs: 1, sm: 0 },
            }}
          >
            {prepLoading && <CircularProgress size={18} />}
            {!prepLoading && !apiData && !prepError && (
              <Typography variant="body2" color="text.secondary">
                Waiting for deal data
              </Typography>
            )}
          </Box>
        </Stack>

        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1.5,
            flexDirection: { xs: "column", sm: "row" },
          }}
        >
          <Box sx={{ flex: 1, width: "100%" }}>
            <TextField
              fullWidth
              multiline
              minRows={1}
              maxRows={4}
              value={question}
              onChange={(event) => setQuestion(event.target.value)}
              placeholder="Ask about this deal..."
              disabled={queryLoading || prepLoading}
              size="medium"
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault();
                  handleAsk();
                }
              }}
              InputProps={{
                sx: {
                  borderRadius: 999,
                  bgcolor: "common.white",
                  color: "text.primary",
                  fontSize: "0.92rem",
                  boxShadow: "0 20px 35px rgba(31, 74, 188, 0.15)",
                  "& .MuiOutlinedInput-notchedOutline": {
                    borderColor: "rgba(99, 102, 241, 0.3)",
                  },
                  "&:hover .MuiOutlinedInput-notchedOutline": {
                    borderColor: "rgba(99, 102, 241, 0.65)",
                  },
                  "& textarea": {
                    padding: "10px 16px",
                    fontSize: "0.92rem",
                  },
                },
                endAdornment: question ? (
                  <InputAdornment position="end">
                    <IconButton
                      size="small"
                      onClick={handleClearQuestion}
                      disabled={queryLoading}
                      aria-label="Clear question"
                    >
                      <CloseRoundedIcon fontSize="small" />
                    </IconButton>
                  </InputAdornment>
                ) : undefined,
              }}
            />
          </Box>

          <IconButton
            onClick={handleAsk}
            disabled={queryLoading || prepLoading}
            aria-label="Send question"
            sx={{
              width: 56,
              height: 56,
              background: "linear-gradient(135deg, #6b6bff, #8f5bff)",
              color: "white",
              borderRadius: "50%",
              boxShadow: "0 10px 25px rgba(99, 102, 241, 0.65)",
              transition: "box-shadow 0.2s ease, transform 0.2s ease",
              "&:hover": {
                boxShadow: "0 12px 28px rgba(99, 102, 241, 0.85)",
                transform: "translateY(-1px)",
              },
            }}
          >
            {queryLoading ? <CircularProgress size={20} color="inherit" /> : <SendRoundedIcon />}
          </IconButton>
        </Box>

        {recentResponses.length > 0 && (
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            spacing={2}
            sx={{ mb: shouldShowRecentCards ? 2 : 0 }}
          >
            {showRecentQuestions ? (
              <Stack direction="row" alignItems="center" spacing={1}>
                {/* <BoltOutlinedIcon sx={{ color: "#2563eb", fontSize: 18 }} />
                <Typography variant="body2" sx={{ color: "#2563eb", fontWeight: 600 }}>
                  Recently asked questions
                </Typography> */}
                {recentLoading && <CircularProgress size={14} />}
              </Stack>
            ) : (
              <Box />
            )}

            <Typography
              variant="body2"
              role="button"
              tabIndex={0}
              onClick={() => setShowRecentQuestions((prev) => !prev)}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  setShowRecentQuestions((prev) => !prev);
                }
              }}
              sx={{
                color: "#4f46e5",
                fontWeight: 600,
                cursor: "pointer",
                userSelect: "none",
              }}
            >
              {showRecentQuestions
                ? "Hide recently asked questions"
                : "Show recently asked questions"}
            </Typography>
          </Stack>
        )}
        {shouldShowRecentCards && (
          <Box>
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
                gap: 2,
              }}
            >
              {recentResponses.slice(0, 4).map((item) => (
                <Paper
                  key={item.id}
                  variant="outlined"
                  role="button"
                  tabIndex={0}
                  onClick={() => handleSelectRecent(item)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      handleSelectRecent(item);
                    }
                  }}
                  sx={{
                    p: 2,
                    minHeight: 50,
                    borderRadius: 3,
                    border: "1px solid rgba(37, 99, 235, 0.14)",
                    backgroundColor: "rgba(255,255,255,0.82)",
                    display: "flex",
                    alignItems: "center",
                    gap: 2,
                    cursor: "pointer",
                    transition:
                      "transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease",
                    boxShadow: "0 8px 20px rgba(15, 23, 42, 0.05)",
                    "&:hover": {
                      transform: "translateY(-2px)",
                      borderColor: "rgba(37, 99, 235, 0.28)",
                      boxShadow: "0 14px 26px rgba(37, 99, 235, 0.12)",
                    },
                  }}
                >
                  <Typography
                    variant="subtitle1"
                    sx={{
                      fontWeight: 600,
                      color: "text.primary",
                      lineHeight: 1.35,
                    }}
                  >
                    {item.question}
                  </Typography>
                </Paper>
              ))}
            </Box>
          </Box>
        )}

        {recentLoading && !shouldShowRecentCards && (
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <CircularProgress size={16} />
            <Typography variant="body2" color="text.secondary">
              Loading recent questions...
            </Typography>
          </Box>
        )}

        {recentError && (
          <Typography variant="body2" color="error">
            {recentError}
          </Typography>
        )}

        {prepLoading && <LinearProgress />}

        {prepError && (
          <Typography variant="body2" color="error">
            {prepError}
          </Typography>
        )}

        {queryError && (
          <Typography variant="body2" color="error">
            {queryError}
          </Typography>
        )}

        {blocks.length > 0 && (
  
            <GENAIRenderer blocks={blocks} renderAll disableMotion />
        )}
      </Stack>
    </Paper>
  );
};

export default DealBot;