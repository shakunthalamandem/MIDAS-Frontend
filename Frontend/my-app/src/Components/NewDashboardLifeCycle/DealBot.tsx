import React from "react";
import {
  Alert,
  Box,
  CircularProgress,
  Divider,
  IconButton,
  LinearProgress,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import SendRoundedIcon from "@mui/icons-material/SendRounded";

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

type ChatEntry = {
  question: string;
  answer: string;
};

const formatResponse = (payload: unknown): string => {
  if (typeof payload === "string") return payload;
  if (typeof payload === "object" && payload !== null) {
    const candidate = (payload as Record<string, any>).answer ?? (payload as Record<string, any>).response;
    if (candidate && typeof candidate === "string") return candidate;
    const message = (payload as Record<string, any>).message;
    if (message && typeof message === "string") return message;
    const data = (payload as Record<string, any>).data;
    if (data !== undefined) {
      try {
        return typeof data === "string" ? data : JSON.stringify(data, null, 2);
      } catch {
        return "Received dealbot response.";
      }
    }
    try {
      return JSON.stringify(payload, null, 2);
    } catch {
      return "Received dealbot response.";
    }
  }
  return "Received dealbot response.";
};

const DealBot: React.FC<DealBotProps> = ({ basicDealDetails }) => {
  const [apiData, setApiData] = React.useState<any>(null);
  const [prepLoading, setPrepLoading] = React.useState(false);
  const [prepError, setPrepError] = React.useState<string | null>(null);
  const [question, setQuestion] = React.useState("");
  const [entries, setEntries] = React.useState<ChatEntry[]>([]);
  const [queryLoading, setQueryLoading] = React.useState(false);
  const [queryError, setQueryError] = React.useState<string | null>(null);

  const apiUrl = React.useMemo(() => process.env.REACT_APP_API_URL, []);

  React.useEffect(() => {
    setEntries([]);
    setQuestion("");
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
          throw new Error(
            json?.detail ? `Failed to prepare deal data - ${json.detail}` : `Request failed with ${res.status}`
          );
        }

        const data = await res.json();
        setApiData(data);
      } catch (error: any) {
        if (controller.signal.aborted) return;
        setPrepError(error?.message || "Unable to prepare deal data.");
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
  ]);

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
        throw new Error(
          json?.detail ? `Query failed - ${json.detail}` : `Request failed with ${res.status}`
        );
      }

      const payload = await res.json();
      const answer = formatResponse(payload);
      setEntries((prev) => [...prev, { question: trimmed, answer }]);
      setQuestion("");
    } catch (error: any) {
      setQueryError(error?.message || "Failed to retrieve answer.");
    } finally {
      setQueryLoading(false);
    }
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
              Ask questions based on the selected deal.
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
              value={question}
              onChange={(event) => setQuestion(event.target.value)}
              placeholder="Ask about this deal..."
              disabled={queryLoading || prepLoading}
              size="medium"
              onKeyDown={(event) => {
                if (event.key === "Enter") {
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
                    borderColor: "transparent",
                  },
                  "&:hover .MuiOutlinedInput-notchedOutline": {
                    borderColor: "transparent",
                  },
                },
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

        {prepLoading && <LinearProgress />}
        {prepError && <Alert severity="error">{prepError}</Alert>}
        {queryError && <Alert severity="error">{queryError}</Alert>}

        {entries.length === 0 ? (
          <Typography variant="body2" color="text.secondary" textAlign="center">
            {/* Once the deal metadata is ready, ask anything about the deal. */}
          </Typography>
        ) : (
          <Stack spacing={2}>
            {entries.map((entry, index) => (
              <Paper
                key={`${entry.question}-${index}`}
                elevation={0}
                sx={{
                  borderRadius: 3,
                  border: "1px solid",
                  borderColor: "divider",
                  bgcolor: "rgba(245, 247, 250, 0.8)",
                }}
              >
                <Stack spacing={1} sx={{ p: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    You asked:
                  </Typography>
                  <Typography variant="body1">{entry.question}</Typography>
                  <Divider />
                  <Typography variant="subtitle2" color="text.secondary">
                    Deal Bot replied:
                  </Typography>
                  <Typography variant="body2" sx={{ whiteSpace: "pre-line" }}>
                    {entry.answer}
                  </Typography>
                </Stack>
              </Paper>
            ))}
          </Stack>
        )}
      </Stack>
    </Paper>
  );
};

export default DealBot;
