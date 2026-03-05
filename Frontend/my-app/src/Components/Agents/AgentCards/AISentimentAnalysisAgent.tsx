import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  Autocomplete,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
} from "@mui/material";
import ActiveAgentCard, { ActiveAgentCardProps } from "./ActiveAgentCard";
import { Block } from "../../GhcAi/Utils/ComponentsUtils";

const apiUrl = process.env.REACT_APP_API_URL;

type Deal = {
  ticker: string;
  unique_deal_id: string;
  deal_type: string;
  fo_type?: string;
  region?: string;
};

type SentimentDeal = Deal & {
  source: "IPO" | "FO";
};

const buildPrompt = (ticker: string, dealType?: string) => {
  const normalizedType = (dealType || "deal").toUpperCase();
  return `what is the investor sentiment for ${ticker} ${normalizedType} and tell me the likely trading prospects for this ${ticker} ${normalizedType} over the next one week and one month `;
};

const normalizeDealRows = (payload: any): Deal[] => {
  const rows = Array.isArray(payload) ? payload : Object.values(payload ?? {});
  return rows
    .filter((item: any) => item && typeof item === "object")
    .map((item: any) => ({
      ticker: String(item.ticker ?? "").trim(),
      unique_deal_id: item.unique_deal_id ?? item.deal_id ?? item.id ?? item.ticker ?? "",
      deal_type: item.deal_type ?? "",
      fo_type: item.fo_type ?? undefined,
      region: item.region ?? undefined,
    }))
    .filter((item: Deal) => item.ticker);
};

const fetchDealList = async (params: Record<string, any>): Promise<Deal[]> => {
  const token = localStorage.getItem("access_token");
  const res = await fetch(`${apiUrl}/api/unified_upcoming_recent/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: token ? `Bearer ${token}` : "",
    },
    body: JSON.stringify(params),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to fetch tickers");
  const payload = data?.data ?? data?.Data ?? [];
  return normalizeDealRows(Array.isArray(payload) ? payload : Object.values(payload));
};

const fetchSentimentDeals = async (): Promise<SentimentDeal[]> => {
  const [ipoDeals, foDeals] = await Promise.all([
    fetchDealList({ operation: "Issued", deal_type: "IPO" }),
    fetchDealList({ operation: "Issued", deal_type: "FO" }),
  ]);
  return [
    ...ipoDeals.map((deal) => ({ ...deal, source: "IPO" as const })),
    ...foDeals.map((deal) => ({ ...deal, source: "FO" as const })),
  ];
};

const normalizeBlocks = (val: any): Block[] => {
  if (Array.isArray(val)) return val as Block[];
  if (val && typeof val === "object") {
    if (Array.isArray(val.blocks)) return val.blocks as Block[];
    if (Array.isArray(val.answer)) return val.answer as Block[];
    if (Array.isArray(val.data)) return val.data as Block[];
  }
  if (typeof val === "string" && val.trim()) {
    try {
      const parsed = JSON.parse(val);
      const parsedBlocks = normalizeBlocks(parsed);
      if (parsedBlocks.length) return parsedBlocks;
    } catch {
      return [{ type: "text", content: val.trim() } as Block];
    }
  }
  return [];
};

const askPerplexity = async (
  question: string,
  uniqueDealId: string,
  source: "IPO" | "FO"
): Promise<Block[]> => {
  const endpoint =
    source === "FO"
      ? `${apiUrl}/api/fo_sentiment_perplexity_chat/`
      : `${apiUrl}/api/sentiment_perplexity_chat/`;

  const res = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ question: question.trim(), unique_deal_id: uniqueDealId ,email_trigger:true}),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Perplexity chat failed");

  const raw = data?.answer ?? data;
  const blocks = normalizeBlocks(raw);
  if (!blocks.length) throw new Error("Invalid Perplexity response format");
  return blocks;
};

const postSentiment = async (
  ticker: string,
  unique_deal_id: string,
  region: string | undefined,
  sentimentBlocks: Block[]
) => {
  const res = await fetch(`${apiUrl}/api/deal_sentiment/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      ticker,
      unique_deal_id,
      region,
      sentiment: sentimentBlocks,
      sentiment_blocks: sentimentBlocks,
    }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to save sentiment");
  return data;
};

const AISentimentAnalysisAgent: React.FC<ActiveAgentCardProps> = (props) => {
  const { state } = props;

  const enabled = state.enabled;

  const [dialogOpen, setDialogOpen] = useState(false);

  const [sentimentTickers, setSentimentTickers] = useState<SentimentDeal[]>([]);
  const [selectedSentimentDeals, setSelectedSentimentDeals] = useState<SentimentDeal[]>([]);
  const [loadingTickers, setLoadingTickers] = useState(false);

  const [running, setRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  // Open popup ONLY on transition disabled -> enabled (not on every re-render)
  const prevEnabled = useRef<boolean>(false);
  useEffect(() => {
    const wasEnabled = prevEnabled.current;
    prevEnabled.current = enabled;

    if (!wasEnabled && enabled) setDialogOpen(true);
    if (wasEnabled && !enabled) setDialogOpen(false);
  }, [enabled]);

  // Load tickers when enabled (once)
  useEffect(() => {
    if (!enabled || sentimentTickers.length) return;

    setLoadingTickers(true);
    setError(null);

    (async () => {
      try {
        const deals = await fetchSentimentDeals();
        setSentimentTickers(deals);
        setSelectedSentimentDeals((prev) => (prev.length ? prev : deals[0] ? [deals[0]] : []));
      } catch (e: any) {
        setError(e?.message || "Unable to load tickers");
      } finally {
        setLoadingTickers(false);
      }
    })();
  }, [enabled, sentimentTickers.length]);

  const runSentiment = async () => {
    if (!selectedSentimentDeals.length) return;

    setRunning(true);
    setError(null);
    setMessage(null);

    try {
      const success: string[] = [];
      const failures: string[] = [];

      for (const deal of selectedSentimentDeals) {
        try {
          const prompt = buildPrompt(deal.ticker, deal.deal_type);
          const blocks = await askPerplexity(prompt, deal.unique_deal_id, deal.source);
          await postSentiment(deal.ticker, deal.unique_deal_id, deal.region, blocks);
          success.push(deal.ticker);
        } catch (err: any) {
          failures.push(`${deal.ticker}: ${err?.message || "run failed"}`);
        }
      }

      if (success.length) setMessage(`Sentiment saved for ${success.join(", ")}`);
      if (failures.length) setError(failures.join("; "));
    } finally {
      setRunning(false);
    }
  };

  // If you want to allow close:
  const handleClose = () => setDialogOpen(false);

  // If you want to FORCE the popup when enabled (cannot dismiss), use this instead:
  // const handleClose = () => {};  // no-op
  // and add: disableEscapeKeyDown
  // and in onClose ignore backdrop clicks
console.log("email sent to backend:", localStorage.getItem("email"));

  return (
    <ActiveAgentCard {...props}>
      {/* Nothing inside card (popup-only UX) */}

      <Dialog
        open={dialogOpen}
        onClose={(_, reason) => {
          // Optional: prevent closing by backdrop click while running
          if (running) return;
          // Optional: block backdrop click entirely:
          // if (reason === "backdropClick") return;
          handleClose();
        }}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Run AI Sentiment</DialogTitle>

        <DialogContent dividers>
          <Stack spacing={2}>
            {error && <Alert severity="error">{error}</Alert>}
            {message && <Alert severity="success">{message}</Alert>}

            <Autocomplete
              multiple
              filterSelectedOptions
              options={sentimentTickers}
              loading={loadingTickers}
              getOptionLabel={(o) => `${o.ticker} (${o.source})`}
              value={selectedSentimentDeals}
              onChange={(_, value) => setSelectedSentimentDeals(value)}
              isOptionEqualToValue={(option, value) =>
                option.unique_deal_id === value.unique_deal_id && option.source === value.source
              }
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Select tickers"
                  placeholder="Choose tickers"
                  InputProps={{
                    ...params.InputProps,
                    endAdornment: (
                      <>
                        {loadingTickers ? <CircularProgress size={18} /> : null}
                        {params.InputProps.endAdornment}
                      </>
                    ),
                  }}
                />
              )}
            />
          </Stack>
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={handleClose} disabled={running}>
            Cancel
          </Button>

          <Button
            variant="contained"
            onClick={runSentiment}
            disabled={running || loadingTickers || !selectedSentimentDeals.length}
            startIcon={running ? <CircularProgress size={18} /> : undefined}
          >
            {running ? "Running..." : "Run"}
          </Button>
        </DialogActions>
      </Dialog>
    </ActiveAgentCard>
  );
};

export default AISentimentAnalysisAgent;