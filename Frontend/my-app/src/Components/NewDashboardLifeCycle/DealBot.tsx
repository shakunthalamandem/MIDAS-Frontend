import React from "react";
import {
  Box,
  Button,
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
import GENAIRenderer from "../GhcAi/AIPages/GENAIRenderer";
import { Block } from "../GhcAi/Utils/ComponentsUtils";

type DealBotBasicDealDetails = {
  ticker?: string;
  pricing_date?: string;
  deal_type?: string;
  unique_deal_id?: string;
  deal_id?: string;
};

type DealBotProps = {
  basicDealDetails: DealBotBasicDealDetails;
};

type DealBotCache = {
  question: string;
  blocks: Block[];
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

const getDealBotStorageKey = (details: DealBotBasicDealDetails) => {
  const parts = [
    details.deal_id ?? "",
    details.unique_deal_id ?? "",
    details.ticker ?? "",
    details.pricing_date ?? "",
    details.deal_type ?? "",
  ];
  return `dealbot:${parts.join("|")}`;
};

const readDealBotCache = (key: string): DealBotCache | null => {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as DealBotCache;
    if (!parsed || !Array.isArray(parsed.blocks)) return null;
    return parsed;
  } catch {
    return null;
  }
};

const writeDealBotCache = (key: string, cache: DealBotCache) => {
  try {
    localStorage.setItem(key, JSON.stringify(cache));
  } catch {
    // Ignore storage write failures (e.g., private mode or quota).
  }
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
  const [showRecent, setShowRecent] = React.useState(false);

  const apiUrl = React.useMemo(() => process.env.REACT_APP_API_URL, []);
  const botType = React.useMemo(() => "deal_bot", []);
  const normalizedTicker = React.useMemo(() => {
    const raw = (basicDealDetails?.ticker ?? "").toString();
    if (!raw) return "";
    return raw.split("(")[0].split(" ")[0].trim();
  }, [basicDealDetails?.ticker]);
  const storageKey = React.useMemo(
    () => getDealBotStorageKey(basicDealDetails ?? {}),
    [
      basicDealDetails.deal_id,
      basicDealDetails.unique_deal_id,
      basicDealDetails.ticker,
      basicDealDetails.pricing_date,
      basicDealDetails.deal_type,
    ]
  );
  const friendlyErrorMessage = React.useMemo(
    () => "Something went wrong. Please rerun to try again.",
    []
  );

  const recentQueryParams = React.useMemo(() => {
    const params = new URLSearchParams();
    params.set("bot_type", botType);
    if (normalizedTicker) params.set("ticker", normalizedTicker);
    return params;
  }, [botType, normalizedTicker]);

  React.useEffect(() => {
    const cached = readDealBotCache(storageKey);
    if (cached) {
      setQuestion(cached.question ?? "");
      setBlocks(cached.blocks ?? []);
    } else {
      setQuestion("");
      setBlocks([]);
    }
    setQueryError(null);
    setApiData(null);

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
    storageKey,
    basicDealDetails.deal_id,
    basicDealDetails.deal_type,
    basicDealDetails.pricing_date,
    basicDealDetails.ticker,
    basicDealDetails.unique_deal_id,
  ]);

  React.useEffect(() => {
    if (!apiUrl) return;
    if (!normalizedTicker && !basicDealDetails?.unique_deal_id) {
      setRecentResponses([]);
      return;
    }

    const controller = new AbortController();
    const loadRecent = async () => {
      setRecentLoading(true);
      setRecentError(null);
      try {
        const token = localStorage.getItem("access_token");
        const res = await fetch(
          `${apiUrl}/api/bot_responses/?${recentQueryParams.toString()}`,
          {
            headers: {
              "Content-Type": "application/json",
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
            signal: controller.signal,
          }
        );
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
    basicDealDetails?.ticker,
    basicDealDetails?.unique_deal_id,
    friendlyErrorMessage,
    recentQueryParams,
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
          bot_type: botType,
          question: askedQuestion,
          answer: nextBlocks,
          ticker: normalizedTicker || null,
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
      writeDealBotCache(storageKey, { question: trimmed, blocks: nextBlocks });
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
  };

  const handleSelectRecent = (item: BotResponseItem) => {
    const nextBlocks = toBlocks(item.answer);
    setQuestion(item.question ?? "");
    setBlocks(nextBlocks);
    setQueryError(null);
    writeDealBotCache(storageKey, { question: item.question ?? "", blocks: nextBlocks });
  };

  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        borderRadius: 3,
        border: "1px solid",
        borderColor: "divider",
        backgroundColor: "rgba(255,255,255,0.95)",
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
              Ask questions about {basicDealDetails.ticker }
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
            {!prepLoading && apiData && (
              <Typography variant="body2" color="success.main">
                Deal data ready
              </Typography>
            )}
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
                  boxShadow: "0 20px 35px rgba(31, 74, 188, 0.15)",
                  "& .MuiOutlinedInput-notchedOutline": {
                    borderColor: " rgba(99, 102, 241, 0.85)",
                  },
                  "&:hover .MuiOutlinedInput-notchedOutline": {
                    borderColor: " rgba(99, 102, 241, 0.85)",
                                      boxShadow: "0 20px 35px rgba(31, 74, 188, 0.15)",

                  },
                  "& textarea": {
                    padding: "12px 16px",
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
              transition: "box-shadow 0.2s ease",
              "&:hover": {
                boxShadow: "0 12px 28px rgba(99, 102, 241, 0.85)",
              },
            }}
          >
            {queryLoading ? (
              <CircularProgress size={20} color="inherit" />
            ) : (
              <SendRoundedIcon />
            )}
          </IconButton>
        </Box>

        <Box>
          <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
            <Button
              variant="contained"
              size="small"
              onClick={() => setShowRecent((prev) => !prev)}
              sx={{
                textTransform: "none",
                borderRadius: 999,
                px: 2,
                background: "linear-gradient(135deg, #6b6bff, #8f5bff)",
                boxShadow: "0 8px 18px rgba(99, 102, 241, 0.35)",
                "&:hover": {
                  boxShadow: "0 10px 22px rgba(99, 102, 241, 0.45)",
                },
              }}
            >
              {showRecent ? "Hide recent questions" : "Show recent questions"}
            </Button>
            {recentLoading && <CircularProgress size={16} />}
          </Stack>
          {recentError && (
            <Typography variant="body2" color="error" sx={{ mt: 1 }}>
              {recentError}
            </Typography>
          )}
          {showRecent && recentResponses.length === 0 && !recentLoading && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              No previous questions for this deal yet.
            </Typography>
          )}
          {showRecent && recentResponses.length > 0 && (
            <Stack spacing={1.5} sx={{ mt: 2 }}>
              {recentResponses.map((item) => (
                <Paper
                  key={item.id}
                  variant="outlined"
                  sx={{
                    p: 1.5,
                    borderRadius: 2,
                    borderColor: "rgba(99, 102, 241, 0.35)",
                    background:
                      "linear-gradient(180deg, rgba(248, 249, 255, 0.95), rgba(255,255,255,1))",
                    display: "flex",
                    flexDirection: "column",
                    gap: 1,
                    boxShadow: "0 12px 22px rgba(99, 102, 241, 0.08)",
                  }}
                >
                  <Typography variant="subtitle2">{item.question}</Typography>
                  <Button
                    variant="text"
                    size="small"
                    onClick={() => handleSelectRecent(item)}
                    sx={{
                      alignSelf: "flex-start",
                      textTransform: "none",
                      px: 0,
                      color: "#4f46e5",
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
