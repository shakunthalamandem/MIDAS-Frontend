import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  LinearProgress,
  Paper,
  Stack,
  Typography,
  Alert,
  Container,
} from "@mui/material";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import GENAIRenderer from "../GhcAi/AIPages/GENAIRenderer";
import { Block } from "../GhcAi/Utils/ComponentsUtils";

type Deal = {
  ticker: string;
  unique_deal_id: string;
  deal_type: string;
  fo_type?: string;
  region?: string;
};

type RunItem = Deal & {
  prompt: string;
  status: "pending" | "running" | "completed" | "failed";
  note?: string;
};

type RenderedPdf = {
  blob: Blob;
  filename: string;
};

interface SentimentAnalysisProps {
  focusTicker?: string | null;
}

//   const apiUrl = process.env.REACT_APP_API_URL;
const apiUrl = process.env.REACT_APP_API_URL;
const defaultOperation = "Upcoming Deals";
// const defaultRegion = "US";
// const defaultDealType = "IPO";

const formatDate = (date: Date) => {
  const y = date.getFullYear();
  const m = `${date.getMonth() + 1}`.padStart(2, "0");
  const d = `${date.getDate()}`.padStart(2, "0");
  return `${y}-${m}-${d}`;
};

const buildPrompt = (ticker: string, dealType?: string) => {
  const today = formatDate(new Date());
  const normalizedType = (dealType || "deal").toUpperCase();
  return `what is the investor sentiment for ${ticker} ${normalizedType} and tell me the likely trading prospects for this ${ticker} ${normalizedType} over the next one week and one month `;
};

const fetchIpoTickers = async (
  operation = defaultOperation,
  // region = defaultRegion,
  // dealType = defaultDealType
): Promise<Deal[]> => {
  const token = localStorage.getItem("access_token");
  const res = await fetch(`${apiUrl}/api/unified_upcoming_recent/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: token ? `Bearer ${token}` : "",
    },
    body: JSON.stringify({ operation, }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to fetch IPO tickers");
  const payload = data?.data ?? data?.Data ?? [];
  const rows = Array.isArray(payload) ? payload : Object.values(payload);
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

const askPerplexity = async (question: string, uniqueDealId: string): Promise<Block[]> => {
  const res = await fetch(`${apiUrl}/api/sentiment_perplexity_chat/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ question: question.trim(), unique_deal_id: uniqueDealId }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Perplexity chat failed");
  const raw = data?.answer ?? data;

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

  const blocks = normalizeBlocks(raw);
  if (!blocks.length) throw new Error("Invalid Perplexity response format");
  return blocks;
};

const postSentiment = async (ticker: string, unique_deal_id: string, sentimentBlocks: Block[]) => {
  const res = await fetch(`${apiUrl}/api/deal_sentiment/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      ticker,
      unique_deal_id,
      sentiment: sentimentBlocks,
      sentiment_blocks: sentimentBlocks,
    }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to save sentiment");
  return data;
};

const postSentimentPdf = async (ticker: string, unique_deal_id: string, sentimentPdf: RenderedPdf) => {
  const formData = new FormData();
  formData.append("ticker", ticker);
  formData.append("unique_deal_id", unique_deal_id);
  formData.append("sentiment_pdf", sentimentPdf.blob, sentimentPdf.filename);

  const res = await fetch(`${apiUrl}/api/deal_sentiment_pdf/`, {
    method: "POST",
    body: formData,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to save sentiment PDF");
  return data;
};

const SentimentAnalysis: React.FC<SentimentAnalysisProps> = ({ focusTicker }) => {
  const [items, setItems] = useState<RunItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentTicker, setCurrentTicker] = useState<string>("");
  const bootstrapped = useRef(false);
  const [started, setStarted] = useState(false);
  const pdfContainerRef = useRef<HTMLDivElement | null>(null);
  const [pdfBlocks, setPdfBlocks] = useState<Block[]>([]);

  const wait = (ms = 200) => new Promise<void>((resolve) => setTimeout(resolve, ms));
  const waitForPaint = () =>
    new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));

  const normalizeTicker = (val?: string | null) => (val || "").replace(/\s+/g, "").toUpperCase();
  const matchesFocusTicker = (ticker: string) =>
    !focusTicker || normalizeTicker(ticker) === normalizeTicker(focusTicker);

  const visibleItems = useMemo(
    () => items.filter((item) => matchesFocusTicker(item.ticker)),
    [items, focusTicker]
  );

  const renderBlocksToPdf = useCallback(async (blocks: Block[], filename?: string): Promise<RenderedPdf> => {
    setPdfBlocks(blocks);
    await waitForPaint();
    await wait(500);

    const container = pdfContainerRef.current;
    if (!container) throw new Error("PDF container not available");
    if (container.clientHeight < 10) {
      await waitForPaint();
      await wait(300);
    }

    // Ensure content is actually rendered; retry a few times if height is tiny
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
  }, []);

  const progress = useMemo(() => {
    if (!visibleItems.length) return 0;
    const completedCount = visibleItems.filter((item) => item.status === "completed").length;
    return Math.round((completedCount / visibleItems.length) * 100);
  }, [visibleItems]);

  const completedCount = useMemo(
    () => visibleItems.filter((item) => item.status === "completed").length,
    [visibleItems]
  );

  const updateStatus = useCallback((index: number, status: RunItem["status"], note?: string) => {
    setItems((prev) =>
      prev.map((item, idx) => (idx === index ? { ...item, status, note } : item))
    );
  }, []);

  const runAutomation = useCallback(
    async (queue?: RunItem[]) => {
      const workQueue = queue ?? visibleItems;
      if (!workQueue.length) return;

      setStarted(true);
      setRunning(true);
      setError(null);

      for (let i = 0; i < workQueue.length; i++) {
        const entry = workQueue[i];
        const targetIndex = items.findIndex(
          (candidate) => candidate.ticker === entry.ticker && candidate.unique_deal_id === entry.unique_deal_id
        );
        const statusIndex = targetIndex === -1 ? i : targetIndex;
        setCurrentTicker(entry.ticker);
        updateStatus(statusIndex, "running");

        try {
          const answerBlocks = await askPerplexity(entry.prompt, entry.unique_deal_id);
          const sentimentPdf = await renderBlocksToPdf(answerBlocks, entry.ticker);
          await postSentiment(entry.ticker, entry.unique_deal_id, answerBlocks);
          await postSentimentPdf(entry.ticker, entry.unique_deal_id, sentimentPdf);
          updateStatus(statusIndex, "completed");
        } catch (err: any) {
          updateStatus(statusIndex, "failed", err.message);
          setError(`Failed for ${entry.ticker}: ${err.message}`);
        } finally {
        }
      }

      setRunning(false);
      setCurrentTicker("");
    },
    [items, renderBlocksToPdf, updateStatus, visibleItems]
  );

  useEffect(() => {
    if (bootstrapped.current) return;
    bootstrapped.current = true;

    const loadTickers = async () => {
      setLoading(true);
      setError(null);
      try {
        const deals = await fetchIpoTickers();
        const prepared = deals.map((deal) => ({
          ...deal,
          prompt: buildPrompt(deal.ticker, deal.deal_type),
          status: "pending" as const,
        }));
        setItems(prepared);
      } catch (err: any) {
        setError(err.message || "Unable to load IPO tickers");
      } finally {
        setLoading(false);
      }
    };

    loadTickers();
  }, []);

  const retryFailed = () => {
    const failed = visibleItems.filter((item) => item.status === "failed");
    if (!failed.length) return;
    const resetQueue = failed.map((item) => ({ ...item, status: "pending" as const }));
    setItems((prev) =>
      prev.map((item) => (item.status === "failed" ? { ...item, status: "pending" as const } : item))
    );
    runAutomation(resetQueue);
  };

  return (
    <Box sx={{ background: "linear-gradient(to bottom, #e8eff5, #ffffff)", minHeight: "100vh", py: 6 }}>
      <Container maxWidth="lg">
        <Stack spacing={3}>
          <Typography variant="h4" fontWeight={700} color="#002060">
            Mainboard Sentiment Analysis
          </Typography>

          {error && <Alert severity="error">{error}</Alert>}

          <Paper elevation={4} sx={{ p: 3, borderRadius: 3 }}>
            <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={2}>
              <Box>
                <Typography variant="subtitle1" fontWeight={600}>
                  {loading ? "Loading IPOs..." : `Ready with ${visibleItems.length} IPOs`}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {running
                    ? `Processing ${currentTicker || "queue"}`
                    : "Runs Perplexity sentiment for each mainboard IPO and saves it to backend."}
                </Typography>
              </Box>

              <Stack direction="row" spacing={1}>
                <Button
                  variant="contained"
                  disabled={loading || running || !visibleItems.length}
                  onClick={() => runAutomation(visibleItems)}
                >
                  {started ? "Start Again" : "Start"}
                </Button>
                <Button
                  variant="contained"
                  disabled={loading || running || !visibleItems.length}
                  onClick={() => runAutomation()}
                >
                  {running ? "Running..." : "Run Again"}
                </Button>
                <Button
                  variant="outlined"
                  disabled={running || loading || !visibleItems.some((i) => i.status === "failed")}
                  onClick={retryFailed}
                >
                  Retry Failed
                </Button>
              </Stack>
            </Stack>

            <Box sx={{ mt: 3 }}>
              <LinearProgress variant="determinate" value={progress} sx={{ height: 10, borderRadius: 5 }} />
              <Typography variant="caption" color="text.secondary">
                {completedCount}/{visibleItems.length} completed
              </Typography>
            </Box>
          </Paper>

          <Stack spacing={2}>
            {visibleItems.map((item, idx) => (
              <Paper
                key={`${item.ticker}-${item.unique_deal_id || idx}`}
                variant="outlined"
                sx={{
                  p: 2,
                  borderColor:
                    item.status === "completed"
                      ? "success.main"
                      : item.status === "failed"
                      ? "error.main"
                      : "grey.200",
                }}
              >
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Box>
                    <Typography fontWeight={600}>{item.ticker}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {[item.unique_deal_id, item.deal_type, item.fo_type, item.region].filter(Boolean).join(" | ") ||
                        "Deal details NA"}
                    </Typography>
                  </Box>

                  <Stack direction="row" spacing={1} alignItems="center">
                    <Chip
                      size="small"
                      color={
                        item.status === "completed"
                          ? "success"
                          : item.status === "failed"
                          ? "error"
                          : item.status === "running"
                          ? "info"
                          : "default"
                      }
                      label={item.status}
                    />
                    {item.status === "running" && <CircularProgress size={18} />}
                    <Button
                      size="small"
                      variant="contained"
                      disabled={running || loading || item.status === "running"}
                      onClick={() => runAutomation([{ ...item }])}
                    >
                      {item.status === "completed" ? "Start Again" : item.status === "running" ? "Running..." : "Start"}
                    </Button>
                  </Stack>
                </Stack>

                {item.note && (
                  <Typography variant="caption" color="error.main">
                    {item.note}
                  </Typography>
                )}
              </Paper>
            ))}
          </Stack>
        </Stack>
      </Container>

      <Box
        ref={pdfContainerRef}
        sx={{
          position: "fixed",
          left: -2000,
          top: 0,
          width: 1100,
          bgcolor: "#ffffff",
          p: 2,
          opacity: 1,
          pointerEvents: "none",
          zIndex: 0,
        }}
      >
        <GENAIRenderer blocks={pdfBlocks} renderAll disableMotion />
      </Box>
    </Box>
  );
};

export default SentimentAnalysis;
