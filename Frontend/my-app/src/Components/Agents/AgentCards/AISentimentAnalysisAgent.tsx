import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Alert,
  Autocomplete,
  Box,
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
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import GENAIRenderer from "../../GhcAi/AIPages/GENAIRenderer";

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

type RenderedPdf = {
  blob: Blob;
  filename: string;
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
      unique_deal_id: item.unique_deal_id ?? "",
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
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("access_token")}`, // Added Authorization header
    },
    body: JSON.stringify({ question: question.trim(), unique_deal_id: uniqueDealId, email_trigger: true }),
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

const postSentimentPdf = async (
  ticker: string,
  unique_deal_id: string,
  sentimentPdf: RenderedPdf
) => {
  const formData = new FormData();
  formData.append("ticker", ticker);
  formData.append("unique_deal_id", unique_deal_id);
  formData.append("sentiment_pdf", sentimentPdf.blob, sentimentPdf.filename);
  console.log(unique_deal_id); // Debug log for unique_deal_id

  const res = await fetch(`${apiUrl}/api/deal_sentiment_pdf/`, {
    method: "POST",
    body: formData,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to save sentiment PDF");
  return data;
};
const triggerSentimentEmail = async (tickers: string[]) => {
  const res = await fetch(`${apiUrl}/api/sentiment_analysis_email_trigger/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("access_token")}`, // Added Authorization header

    },
    body: JSON.stringify({
      tickers, // list of successfully processed tickers
    }),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to trigger email");
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

  const pdfContainerRef = useRef<HTMLDivElement | null>(null);
  const [pdfBlocks, setPdfBlocks] = useState<Block[]>([]);

  const wait = (ms = 200) => new Promise<void>((resolve) => setTimeout(resolve, ms));
  const waitForPaint = () =>
    new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));

  const renderBlocksToPdf = useCallback(
    async (blocks: Block[], filename?: string): Promise<RenderedPdf> => {
      setPdfBlocks(blocks);
      await waitForPaint();
      await wait(500);

      const container = pdfContainerRef.current;
      if (!container) throw new Error("PDF container not available");
      if (container.clientHeight < 10) {
        await waitForPaint();
        await wait(300);
      }

      let tries = 0;
      while (container.clientHeight < 20 && tries < 4) {
        await waitForPaint();
        await wait(250);
        tries += 1;
      }

      const capture = async (): Promise<HTMLCanvasElement> => {
        const canvas = await html2canvas(container, {
          scale: 2,
          useCORS: true,
          backgroundColor: "#ffffff",
          scrollY: -window.scrollY,
          windowWidth: container.scrollWidth || undefined,
          windowHeight: container.scrollHeight || undefined,
        });
        if (!canvas || canvas.height < 5 || canvas.width < 5) {
          throw new Error("Failed to render PDF canvas");
        }
        return canvas;
      };

      let canvas: HTMLCanvasElement | null = null;
      try {
        canvas = await capture();
      } catch (_err) {
        await wait(500);
        canvas = await capture();
      }

      const pdf = new jsPDF({ orientation: "p", unit: "mm", format: "a4", compress: true });
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const mmPerPx = pdfWidth / canvas.width;
      const pageHeightPx = pdfHeight / mmPerPx;

      let offset = 0;
      while (offset < canvas.height) {
        const sliceHeightPx = Math.min(pageHeightPx, canvas.height - offset);
        const sliceCanvas = document.createElement("canvas");
        sliceCanvas.width = canvas.width;
        sliceCanvas.height = sliceHeightPx;

        const ctx = sliceCanvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(
            canvas,
            0,
            offset,
            canvas.width,
            sliceHeightPx,
            0,
            0,
            canvas.width,
            sliceHeightPx
          );
        }

        const imgData = sliceCanvas.toDataURL("image/jpeg", 0.78);
        const sliceHeightMm = sliceHeightPx * mmPerPx;

        if (offset > 0) pdf.addPage();
        pdf.addImage(imgData, "JPEG", 0, 0, pdfWidth, sliceHeightMm, undefined, "FAST");
        offset += sliceHeightPx;
      }

      const pdfBlob = pdf.output("blob") as Blob;
      const safeName = filename ? `Sentiment-${filename}.pdf` : "Sentiment.pdf";
      return { blob: pdfBlob, filename: safeName };
    },
    []
  );

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

          const blocks = await askPerplexity(
            prompt,
            deal.unique_deal_id,
            deal.source
          );

          await postSentiment(
            deal.ticker,
            deal.unique_deal_id,
            deal.region,
            blocks
          );

          const sentimentPdf = await renderBlocksToPdf(
            blocks,
            deal.ticker
          );

          await postSentimentPdf(
            deal.ticker,
            deal.unique_deal_id,
            sentimentPdf
          );

          success.push(deal.ticker);
        } catch (err: any) {
          failures.push(
            `${deal.ticker}: ${err?.message || "run failed"}`
          );
        }
      }

      // Trigger email AFTER loop completes
      if (success.length) {
        try {
          await triggerSentimentEmail(success);
          setMessage(
            `Sentiment saved & email triggered for ${success.join(", ")}`
          );
        } catch (emailErr: any) {
          setError(
            `Sentiment saved but email failed: ${emailErr?.message || "Unknown error"
            }`
          );
        }
      }

      if (failures.length) {
        setError((prev) =>
          prev
            ? `${prev}; ${failures.join("; ")}`
            : failures.join("; ")
        );
      }
    } finally {
      setRunning(false);
    }
  };

  // Dialog close handler
  const handleClose = () => setDialogOpen(false);


  return (
    <ActiveAgentCard
      {...props}
      onRunSentimentClick={() => setDialogOpen(true)}
    >      {/* Show Run Sentiment button only if enabled */}


      <Dialog
        open={dialogOpen}
        onClose={(_, reason) => {
          if (running) return; // prevent closing when running
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

      <Box
        ref={pdfContainerRef}
        sx={{
          position: "fixed",
          left: -2000,
          top: 0,
          width: 1100,
          bgcolor: "#ffffff",
          p: 2,
          pointerEvents: "none",
          zIndex: 0,
        }}
      >
        <GENAIRenderer blocks={pdfBlocks} renderAll disableMotion />
      </Box>
    </ActiveAgentCard>
  );
};

export default AISentimentAnalysisAgent;