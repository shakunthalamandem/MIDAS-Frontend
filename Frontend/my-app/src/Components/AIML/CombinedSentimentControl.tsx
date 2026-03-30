import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Alert,
  Box,
  Button,
  Checkbox,
  Chip,
  CircularProgress,
  Container,
  LinearProgress,
  Paper,
  Stack,
  TextField,
  Typography,
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
  issuer_name?: string;
  listing_status: "pre-listing" | "post-listing";
};

type CombinedRunItem = Deal & {
  prompt: string;
  status: "pending" | "running" | "completed" | "failed";
  note?: string;
  source: "IPO" | "FO";
};

type RenderedPdf = {
  blob: Blob;
  filename: string;
};

const apiUrl = process.env.REACT_APP_API_URL;

const formatDate = (date: Date) => {
  const y = date.getFullYear();
  const m = `${date.getMonth() + 1}`.padStart(2, "0");
  const d = `${date.getDate()}`.padStart(2, "0");
  return `${y}-${m}-${d}`;
};

const buildPrompt = (
  ticker: string,
  dealType?: string,
  issuerName?: string,
  region?: string,
  foType?: string,
  source: "IPO" | "FO" = "IPO",
  listingStatus: "pre-listing" | "post-listing" = "pre-listing"
) => {
  const companyLabel = issuerName ? `${issuerName} (${ticker})` : ticker;
  const regionLabel = region ? ` in the ${region} market` : "";
  const foTypeLabel = foType ? ` (${foType})` : "";

  if (source === "IPO") {
    if (listingStatus === "pre-listing") {
      return `You are the CIO of a hedge fund. Analyze the US IPO of ${companyLabel} focusing on retail investor sentiment (primary driver) and institutional demand (validation layer). Be concise, data-driven, and assertive (no questions, only conclusions). Provide:

1. Retail Sentiment (Core)
* Overall: bullish / neutral / bearish
* Retail vs institutional dominance
* Hype level: low / medium / high

2. Institutional Demand (Grade + Scorecard)
* Overall Grade: Strong / Moderate / Weak
Breakdown (use clear labels, no question format):
* Revenue Growth (>~25% benchmark): strong / moderate / weak + data
* Profitability: strong / moderate / weak + data
* Brand / Market Position: strong / moderate / weak
* Investor Backing: strong / moderate / weak (VC/PE quality, sponsors)
* Institutional Allocation / Anchor Demand: strong / moderate / weak
* Use of Proceeds: positive / neutral / negative signal
Add a 2–3 line institutional read summarizing conviction and likely subscription strength.

3. Pricing
* Valuation vs peers: cheap / fair / expensive

4. Flow Impact
* Listing-day pop probability (retail-driven)
* Risk of post-listing sell-off (institutional weakness / exits)

5. Drivers vs Risks
* Top 3 upside triggers
* Top 3 risks

6. Comparables
* 2 similar recent US IPOs + listing / 1-week performance

7. Short-Term Outlook (Key)
* Listing Day: expected % move
* 1 Week: direction
* 1 Month: sustainability

8. Trade View
* Long (listing pop) / avoid / short (post-listing fade)
* Timing strategy

Final (mandatory):
* one_week_sentiment: bullish / neutral / bearish
* one_month_sentiment: bullish / neutral / bearish`;
    } else {
      return `You are the CIO of a hedge fund. Analyze the post-listing performance of ${companyLabel} (US IPO) using recent data and credible sources (e.g., TipRanks, MarketBeat, Bloomberg, Yahoo Finance, SEC filings). Focus on retail vs institutional demand, price action, and a clear BUY / HOLD / SELL decision for the next 15–30 days. Be concise, factual, and insight-driven (no questions).

1. Listing Reality Check
* Issue price vs listing price (% gain/loss)
* Current price vs listing price
* Verdict: underpriced / fair / overhyped

2. Demand & Ownership Trend
* Retail vs institutional participation (use volume, filings, or commentary if available)
* Any institutional buying/selling trends (13F, news, flows)
* Clear takeaway: accumulation / distribution / mixed

3. Volume & Price Action
* Daily volume trend since listing (increasing / decreasing)
* Price trend vs volume (confirming strength or weakness)
* Insight on expected near-term price impact

4. Setup Insight
* Clear interpretation of current setup: continuation / exhaustion / downside risk
* Based on: listing gain, demand strength, volume behavior

5. Analyst Views (Name Sources)
* List latest analyst opinions: Firm name → rating → price target → upside/downside %
* Use TipRanks, MarketBeat, or similar
* Then conclude: Analyst sentiment: strong / mixed / weak

6. Trade Decision (Actionable)
* Verdict: BUY / HOLD / SELL
* 2–3 key reasons
* Entry range (if BUY)
* Exit / stop-loss (if HOLD/SELL)

7. Forward Outlook
* Next 1 Week: direction
* Next 1 Month: sustain / correction / breakout

Final (mandatory):
* one_week_sentiment: bullish / neutral / bearish
* one_month_sentiment: bullish / neutral / bearish`;
    }
  } else {
    // FO
    if (listingStatus === "pre-listing") {
      return `You are the CIO of a hedge fund. Analyze the upcoming Follow-On Offering${foTypeLabel} of ${companyLabel}${regionLabel}, focusing on retail investor sentiment and institutional demand. Be concise, data-driven, and assertive.

Provide:

1. Retail Sentiment (Core)
* Overall: bullish / neutral / bearish
* Retail vs institutional dominance
* Market reception: low / medium / high

2. Institutional Demand (Grade + Scorecard)
* Overall Grade: Strong / Moderate / Weak
Breakdown:
* Current Company Performance: strong / moderate / weak
* Use of Proceeds: positive / neutral / negative signal
* Dilution Impact: minimal / moderate / significant
* Insider Participation: yes / no
* Institutional Allocation Interest: strong / moderate / weak

3. Pricing
* Discount to current price: deep / fair / minimal
* Valuation vs peers: appropriate / expensive

4. Supply Risk & Overhang
* Post-deal supply pressure: high / moderate / low
* Likely absorption timeline

5. Drivers vs Risks
* Top 3 upside triggers
* Top 3 risks (dilution, supply, weak demand, etc.)

6. Comparables
* 2 similar recent FOs + 1-week performance post-pricing

7. Short-Term Outlook
* Pricing: likely subscription strength (oversubscribed / fairly subscribed / undersubscribed)
* 1 Week Post-Pricing: direction + expected move
* 1 Month: stability / correction / recovery

8. Trade View
* Long / Avoid / Short
* Timing strategy

Final (mandatory):
* one_week_sentiment: bullish / neutral / bearish
* one_month_sentiment: bullish / neutral / bearish`;
    } else {
      return `You are the CIO of a hedge fund. Analyze the post-pricing performance of the Follow-On Offering${foTypeLabel} of ${companyLabel}${regionLabel}. Use recent data and credible sources. Focus on retail vs institutional demand, price action, and a BUY / HOLD / SELL decision for the next 15–30 days. Be concise, factual, and insight-driven.

1. Pricing Reality Check
* Issue price vs current price (% change)
* Verdict: discounted / fair / premium vs current trading

2. Demand & Ownership Trend
* Retail vs institutional participation
* Supply absorption trends
* Clear takeaway: accumulation / distribution / mixed

3. Volume & Price Action
* Daily volume trend since pricing
* Price trend vs volume
* Insight on expected near-term impact

4. Setup Insight
* Current setup: continuation / exhaustion / reversal risk
* Based on: pricing gain/loss, demand strength, volume

5. Company Performance Context
* Any recent news or developments post-FO
* Analyst sentiment on company
* Use of proceeds impact (if evident)

6. Trade Decision (Actionable)
* Verdict: BUY / HOLD / SELL
* 2–3 key reasons
* Entry range (if BUY)
* Exit / stop-loss (if HOLD/SELL)

7. Forward Outlook
* Next 1 Week: direction
* Next 1 Month: sustain / correction / breakout

Final (mandatory):
* one_week_sentiment: bullish / neutral / bearish
* one_month_sentiment: bullish / neutral / bearish`;
    }
  }
};

const createCombinedRunItem = (
  deal: Deal,
  source: CombinedRunItem["source"],
): CombinedRunItem => ({
  ...deal,
  prompt: buildPrompt(deal.ticker, deal.deal_type, deal.issuer_name, deal.region, deal.fo_type, source, deal.listing_status),
  status: "pending",
  source,
});

const fetchIpoTickers = async (): Promise<Deal[]> => {
  const token = localStorage.getItem("access_token");
  const res = await fetch(`${apiUrl}/api/unified_upcoming_recent/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: token ? `Bearer ${token}` : "",
    },
    body: JSON.stringify({ operation: "Issued", deal_type: "IPO" }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to fetch IPO tickers");
  const payload = data?.data ?? data?.Data ?? [];
  const rows = Array.isArray(payload) ? payload : Object.values(payload);
  const listingStatus: "pre-listing" | "post-listing" = "post-listing";
  return rows
    .filter((item: any) => item && typeof item === "object")
    .map((item: any) => ({
      ticker: String(item.ticker ?? "").trim(),
      unique_deal_id:
        item.unique_deal_id ?? item.deal_id ?? item.id ?? item.ticker ?? "",
      deal_type: item.deal_type ?? "",
      fo_type: item.fo_type ?? undefined,
      region: item.region ?? undefined,
      issuer_name: item.issuer_name ?? undefined,
      listing_status: listingStatus,
    }))
    .filter((item: Deal) => item.ticker);
};

const fetchFoTickers = async (): Promise<Deal[]> => {
  const token = localStorage.getItem("access_token");
  const res = await fetch(`${apiUrl}/api/unified_upcoming_recent/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: token ? `Bearer ${token}` : "",
    },
    body: JSON.stringify({ operation: "Issued", deal_type: "FO" }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to fetch FO tickers");
  const payload = Array.isArray(data) ? data : (data?.data ?? data?.Data ?? []);
  const rows = Array.isArray(payload) ? payload : Object.values(payload);
  const listingStatus: "pre-listing" | "post-listing" = "post-listing";
  return rows
    .filter((item: any) => item && typeof item === "object")
    .map((item: any) => ({
      ticker: String(item.ticker ?? "").trim(),
      unique_deal_id:
        item.unique_deal_id ?? item.deal_id ?? item.id ?? item.ticker ?? "",
      deal_type: item.deal_type ?? "",
      fo_type: item.fo_type ?? undefined,
      region: item.region ?? undefined,
      issuer_name: item.issuer_name ?? undefined,
      listing_status: listingStatus,
    }))
    .filter((item: Deal) => item.ticker);
};

const askPerplexity = async (
  question: string,
  uniqueDealId: string,
  source: "IPO" | "FO",
): Promise<Block[]> => {
  const endpoint =
    source === "FO"
      ? `${apiUrl}/api/fo_sentiment_perplexity_chat/`
      : `${apiUrl}/api/sentiment_perplexity_chat/`;
  const res = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      question: question.trim(),
      unique_deal_id: uniqueDealId,
    }),
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

// const postSentiment = async (
//   ticker: string,
//   unique_deal_id: string,
//   region: string | undefined,
//   sentimentBlocks: Block[],
// ) => {
//   const res = await fetch(`${apiUrl}/api/deal_sentiment/`, {
//     method: "POST",
//     headers: { "Content-Type": "application/json" },
//     body: JSON.stringify({
//       ticker,
//       unique_deal_id,
//       region,
//       sentiment: sentimentBlocks,
//       sentiment_blocks: sentimentBlocks,
//     }),
//   });
//   const data = await res.json();
//   if (!res.ok) throw new Error(data.error || "Failed to save sentiment");
//   return data;
// };

// const postSentimentPdf = async (ticker: string, unique_deal_id: string, sentimentPdf: RenderedPdf) => {
//   const formData = new FormData();
//   formData.append("ticker", ticker);
//   formData.append("unique_deal_id", unique_deal_id);
//   formData.append("sentiment_pdf", sentimentPdf.blob, sentimentPdf.filename);

//   const res = await fetch(`${apiUrl}/api/deal_sentiment_pdf/`, {
//     method: "POST",
//     body: formData,
//   });
//   const data = await res.json();
//   if (!res.ok) throw new Error(data.error || "Failed to save sentiment PDF");
//   return data;
// };

const getItemKey = (item: CombinedRunItem) =>
  `${item.source}-${item.ticker}-${item.unique_deal_id || ""}`;

const CombinedSentimentControl: React.FC = () => {
  const [items, setItems] = useState<CombinedRunItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentTicker, setCurrentTicker] = useState<string>("");
  const [searchTicker, setSearchTicker] = useState("");
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);
  const bootstrapped = useRef(false);
  const [started, setStarted] = useState(false);
  const pdfContainerRef = useRef<HTMLDivElement | null>(null);
  const [pdfBlocks, setPdfBlocks] = useState<Block[]>([]);

  const wait = (ms = 200) =>
    new Promise<void>((resolve) => setTimeout(resolve, ms));
  const waitForPaint = () =>
    new Promise<void>((resolve) =>
      requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
    );

  const filteredItems = useMemo(() => {
    const needle = searchTicker.trim().toUpperCase();
    if (!needle) return items;
    return items.filter((item) => item.ticker.toUpperCase().includes(needle));
  }, [items, searchTicker]);

  const selectedSet = useMemo(() => new Set(selectedKeys), [selectedKeys]);
  const selectedItems = useMemo(
    () => items.filter((item) => selectedSet.has(getItemKey(item))),
    [items, selectedSet],
  );

  const progress = useMemo(() => {
    if (!items.length) return 0;
    const completedCount = items.filter(
      (item) => item.status === "completed",
    ).length;
    return Math.round((completedCount / items.length) * 100);
  }, [items]);

  const completedCount = useMemo(
    () => items.filter((item) => item.status === "completed").length,
    [items],
  );

  const updateStatus = useCallback(
    (index: number, status: CombinedRunItem["status"], note?: string) => {
      setItems((prev) =>
        prev.map((item, idx) =>
          idx === index ? { ...item, status, note } : item,
        ),
      );
    },
    [],
  );

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

      const pdf = new jsPDF({
        orientation: "p",
        unit: "mm",
        format: "a4",
        compress: true,
      });
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
            sliceHeightPx,
          );
        }

        const imgData = sliceCanvas.toDataURL("image/jpeg", 0.78);
        const sliceHeightMm = sliceHeightPx * mmPerPx;

        if (offset > 0) pdf.addPage();
        pdf.addImage(
          imgData,
          "JPEG",
          0,
          0,
          pdfWidth,
          sliceHeightMm,
          undefined,
          "FAST",
        );
        offset += sliceHeightPx;
      }

      const pdfBlob = pdf.output("blob") as Blob;
      const safeName = filename ? `Sentiment-${filename}.pdf` : "Sentiment.pdf";
      return { blob: pdfBlob, filename: safeName };
    },
    [],
  );

  const runAutomation = useCallback(
    async (queue?: CombinedRunItem[]) => {
      const workQueue = queue ?? filteredItems;
      if (!workQueue.length) return;

      setStarted(true);
      setRunning(true);
      setError(null);

      for (let i = 0; i < workQueue.length; i += 1) {
        const entry = workQueue[i];
        const targetIndex = items.findIndex(
          (candidate) =>
            candidate.ticker === entry.ticker &&
            candidate.unique_deal_id === entry.unique_deal_id &&
            candidate.source === entry.source,
        );
        const statusIndex = targetIndex === -1 ? i : targetIndex;
        setCurrentTicker(entry.ticker);
        updateStatus(statusIndex, "running");

        try {
          const answerBlocks = await askPerplexity(
            entry.prompt,
            entry.unique_deal_id,
            entry.source,
          );
          const sentimentPdf = await renderBlocksToPdf(
            answerBlocks,
            entry.ticker,
          );
          // await postSentiment(
          //   entry.ticker,
          //   entry.unique_deal_id,
          //   entry.region,
          //   answerBlocks,
          // );
          // await postSentimentPdf(entry.ticker, entry.unique_deal_id, sentimentPdf);
          updateStatus(statusIndex, "completed");
        } catch (err: any) {
          updateStatus(statusIndex, "failed", err.message);
          setError(`Failed for ${entry.ticker}: ${err.message}`);
        }
      }

      setRunning(false);
      setCurrentTicker("");
    },
    [filteredItems, items, renderBlocksToPdf, updateStatus],
  );

  useEffect(() => {
    if (bootstrapped.current) return;
    bootstrapped.current = true;

    const loadTickers = async () => {
      setLoading(true);
      setError(null);
      try {
        const [ipoTickers, foTickers] = await Promise.all([
          fetchIpoTickers(),
          fetchFoTickers(),
        ]);
        const prepared: CombinedRunItem[] = [
          ...ipoTickers.map((deal) => createCombinedRunItem(deal, "IPO")),
          ...foTickers.map((deal) => createCombinedRunItem(deal, "FO")),
        ];
        setItems(prepared);
      } catch (err: any) {
        setError(err.message || "Unable to load sentiment tickers");
      } finally {
        setLoading(false);
      }
    };

    loadTickers();
  }, []);

  const retryFailed = () => {
    const failed = items.filter((item) => item.status === "failed");
    if (!failed.length) return;
    const resetQueue = failed.map((item) => ({
      ...item,
      status: "pending" as const,
    }));
    setItems((prev) =>
      prev.map((item) =>
        item.status === "failed"
          ? { ...item, status: "pending" as const }
          : item,
      ),
    );
    runAutomation(resetQueue);
  };

  const toggleSelection = (key: string) => {
    setSelectedKeys((prev) => {
      const exists = prev.includes(key);
      if (exists) return prev.filter((entry) => entry !== key);
      return [...prev, key];
    });
  };

  const handleSelectAllVisible = () => {
    const keys = filteredItems.map((item) => getItemKey(item));
    setSelectedKeys(keys);
  };

  const handleClearSelection = () => setSelectedKeys([]);

  const handleRunSelected = () => {
    if (!selectedItems.length) return;
    runAutomation(selectedItems);
  };

  return (
    <Box
      sx={{
        background: "linear-gradient(to bottom, #e8eff5, #ffffff)",
        minHeight: "100vh",
        py: 6,
      }}
    >
      <Container maxWidth="lg">
        <Stack spacing={3}>
          <Typography variant="h4" fontWeight={700} color="#002060">
            Combined Sentiment Control
          </Typography>

          {error && <Alert severity="error">{error}</Alert>}

          <Paper elevation={4} sx={{ p: 3, borderRadius: 3 }}>
            <Stack spacing={2}>
              <Box>
                <TextField
                  label="Search ticker"
                  placeholder="e.g. ABCD"
                  value={searchTicker}
                  onChange={(event) => setSearchTicker(event.target.value)}
                  fullWidth
                  variant="outlined"
                  InputProps={{ sx: { backgroundColor: "#ffffff" } }}
                />
              </Box>

              <Stack
                direction="row"
                spacing={1}
                alignItems="center"
                flexWrap="wrap"
              >
                <Button
                  variant="contained"
                  disabled={running || !selectedItems.length}
                  onClick={handleRunSelected}
                >
                  {running ? "Running selected..." : "Run selected tickers"}
                </Button>
                <Button
                  variant="outlined"
                  disabled={!filteredItems.length}
                  onClick={handleSelectAllVisible}
                >
                  Select visible
                </Button>
                <Button
                  variant="text"
                  onClick={handleClearSelection}
                  disabled={!selectedKeys.length}
                >
                  Clear selection
                </Button>
                <Button
                  variant="outlined"
                  disabled={
                    running ||
                    loading ||
                    !items.some((i) => i.status === "failed")
                  }
                  onClick={retryFailed}
                >
                  Retry Failed
                </Button>
                <Typography variant="body2" color="#000000">
                  Selected {selectedKeys.length}
                </Typography>
              </Stack>

              <Box>
                <LinearProgress
                  variant="determinate"
                  value={progress}
                  sx={{ height: 10, borderRadius: 5 }}
                />
                <Typography variant="caption" color="#000000">
                  {completedCount}/{items.length} completed
                </Typography>
              </Box>
            </Stack>
          </Paper>

          <Stack spacing={2}>
            {filteredItems.map((item, idx) => {
              const key = getItemKey(item);
              const isSelected = selectedSet.has(key);
              return (
                <Paper
                  key={`${key}-${idx}`}
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
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Checkbox
                      checked={isSelected}
                      onChange={() => toggleSelection(key)}
                    />
                    <Stack flex={1} spacing={0.5}>
                      <Typography fontWeight={600}>{item.ticker}</Typography>
                      <Typography variant="body2" color="#000000">
                        {[
                          item.unique_deal_id,
                          item.deal_type,
                          item.fo_type,
                          item.region,
                          item.source,
                        ]
                          .filter(Boolean)
                          .join(" | ") || "Deal details NA"}
                      </Typography>
                    </Stack>

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
                      {item.status === "running" && (
                        <CircularProgress size={18} />
                      )}
                      <Button
                        size="small"
                        variant="contained"
                        disabled={
                          running || loading || item.status === "running"
                        }
                        onClick={() => runAutomation([{ ...item }])}
                      >
                        {item.status === "completed"
                          ? "Start Again"
                          : item.status === "running"
                            ? "Running..."
                            : "Start"}
                      </Button>
                    </Stack>
                  </Stack>

                  {item.note && (
                    <Typography variant="caption" color="error.main">
                      {item.note}
                    </Typography>
                  )}
                </Paper>
              );
            })}
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

export default CombinedSentimentControl;
