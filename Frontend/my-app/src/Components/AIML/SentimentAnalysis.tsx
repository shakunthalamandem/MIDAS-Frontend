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

//   const apiUrl = process.env.REACT_APP_API_URL;
const apiUrl = process.env.REACT_APP_API_URL;

const formatDate = (date: Date) => {
  const y = date.getFullYear();
  const m = `${date.getMonth() + 1}`.padStart(2, "0");
  const d = `${date.getDate()}`.padStart(2, "0");
  return `${y}-${m}-${d}`;
};

const buildPrompt = (ticker: string) => {
  const today = formatDate(new Date());
  return `As of ${today}, how did ${ticker} IPO perform in the US, what was the market reaction, and which variables influenced its performance over the first 30 days? What is the expected IPO performance for ${ticker} coming up in the US market—specifically, is the IPO likely to do well in the first week and first month? Provide a detailed, evidence-backed assessment.`;
};

const fetchIpoTickers = async (): Promise<Deal[]> => {
  const res = await fetch(`${apiUrl}/api/sentiment_analysis/`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to fetch IPO tickers");
  return data?.deals ?? [];
};

const askPerplexity = async (question: string): Promise<Block[]> => {
  const res = await fetch(`${apiUrl}/api/test_perplexity_chat/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ question: question.trim() }),
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

const postSentiment = async (
  ticker: string,
  unique_deal_id: string,
  sentimentBlocks: Block[],
  sentimentPdf?: string | null
) => {
  const res = await fetch(`${apiUrl}/api/deal_sentiment/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      ticker,
      unique_deal_id,
      sentiment: sentimentPdf ?? sentimentBlocks,
      sentiment_pdf: sentimentPdf ?? null,
      sentiment_blocks: sentimentBlocks,
    }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to save sentiment");
  return data;
};

const SentimentAnalysis: React.FC = () => {
  const [items, setItems] = useState<RunItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [completed, setCompleted] = useState(0);
  const [currentTicker, setCurrentTicker] = useState<string>("");
  const bootstrapped = useRef(false);
  const [started, setStarted] = useState(false);
  const pdfContainerRef = useRef<HTMLDivElement | null>(null);
  const [pdfBlocks, setPdfBlocks] = useState<Block[]>([]);

  const wait = (ms = 200) => new Promise<void>((resolve) => setTimeout(resolve, ms));
  const waitForPaint = () =>
    new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));

  const renderBlocksToPdf = useCallback(async (blocks: Block[], filename?: string) => {
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
        scale: 3,
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

    const pdf = new jsPDF("p", "mm", "a4");
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

      const imgData = sliceCanvas.toDataURL("image/png", 1.0);
      const sliceHeightMm = sliceHeightPx * mmPerPx;

      if (offset > 0) pdf.addPage();
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, sliceHeightMm);

      offset += sliceHeightPx;
    }

    const dataUri = pdf.output("datauristring");
    try {
      const safeName = filename ? `Sentiment-${filename}.pdf` : "Sentiment.pdf";
      pdf.save(safeName);
    } catch (err) {
      console.warn("PDF auto-download failed; continuing without download", err);
    }
    return dataUri;
  }, []);

  const progress = useMemo(() => {
    if (!items.length) return 0;
    return Math.round((completed / items.length) * 100);
  }, [completed, items.length]);

  const updateStatus = useCallback((index: number, status: RunItem["status"], note?: string) => {
    setItems((prev) =>
      prev.map((item, idx) => (idx === index ? { ...item, status, note } : item))
    );
  }, []);

  const runAutomation = useCallback(
    async (queue?: RunItem[]) => {
      const workQueue = queue ?? items;
      if (!workQueue.length) return;

      setStarted(true);
      setRunning(true);
      setError(null);
      setCompleted(0);

      for (let i = 0; i < workQueue.length; i++) {
        const entry = workQueue[i];
        const targetIndex = items.findIndex(
          (candidate) => candidate.ticker === entry.ticker && candidate.unique_deal_id === entry.unique_deal_id
        );
        const statusIndex = targetIndex === -1 ? i : targetIndex;
        setCurrentTicker(entry.ticker);
        updateStatus(statusIndex, "running");

        try {
          const answerBlocks = await askPerplexity(entry.prompt);
          let sentimentPdf: string | null = null;
          try {
            sentimentPdf = await renderBlocksToPdf(answerBlocks, entry.ticker);
          } catch (pdfErr) {
            console.warn("Sentiment PDF render failed; saving blocks instead", pdfErr);
            updateStatus(statusIndex, "running", "PDF generation failed; storing blocks only");
          }
          await postSentiment(entry.ticker, entry.unique_deal_id, answerBlocks, sentimentPdf);
          updateStatus(
            statusIndex,
            "completed",
            sentimentPdf ? undefined : "Completed without PDF (stored blocks)"
          );
        } catch (err: any) {
          updateStatus(statusIndex, "failed", err.message);
          setError(`Failed for ${entry.ticker}: ${err.message}`);
        } finally {
          setCompleted((prev) => prev + 1);
        }
      }

      setRunning(false);
      setCurrentTicker("");
    },
    [items, renderBlocksToPdf, updateStatus]
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
          prompt: buildPrompt(deal.ticker),
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
    const failed = items.filter((item) => item.status === "failed");
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
                  {loading ? "Loading IPOs..." : `Ready with ${items.length} IPOs`}
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
                  disabled={loading || running || !items.length}
                  onClick={() => runAutomation(items)}
                >
                  {started ? "Start Again" : "Start"}
                </Button>
                <Button
                  variant="contained"
                  disabled={loading || running || !items.length}
                  onClick={() => runAutomation()}
                >
                  {running ? "Running..." : "Run Again"}
                </Button>
                <Button
                  variant="outlined"
                  disabled={running || loading || !items.some((i) => i.status === "failed")}
                  onClick={retryFailed}
                >
                  Retry Failed
                </Button>
              </Stack>
            </Stack>

            <Box sx={{ mt: 3 }}>
              <LinearProgress variant="determinate" value={progress} sx={{ height: 10, borderRadius: 5 }} />
              <Typography variant="caption" color="text.secondary">
                {completed}/{items.length} completed
              </Typography>
            </Box>
          </Paper>

          <Stack spacing={2}>
            {items.map((item, idx) => (
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

      {/* Hidden renderer for high-quality PDF capture */}
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
