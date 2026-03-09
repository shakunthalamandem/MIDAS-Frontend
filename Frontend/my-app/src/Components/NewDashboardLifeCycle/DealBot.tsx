import React from "react";
import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogContent,
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
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
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
  const [pdfLoading, setPdfLoading] = React.useState(false);
  const [pdfProgress, setPdfProgress] = React.useState(0);
  const [pdfStatus, setPdfStatus] = React.useState("");
  const contentRef = React.useRef<HTMLDivElement>(null);

  const apiUrl = React.useMemo(() => process.env.REACT_APP_API_URL, []);
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

  const handleExportPDF = async () => {
    const container = contentRef.current;
    if (!container) return;

    setPdfLoading(true);
    setPdfProgress(0);
    setPdfStatus("Preparing content...");

    try {
      const originalOverflow = container.style.overflow;
      const originalHeight = container.style.height;
      const originalMaxHeight = container.style.maxHeight;

      container.style.overflow = "visible";
      container.style.height = "auto";
      container.style.maxHeight = "none";

      await new Promise<void>((resolve) =>
        requestAnimationFrame(() => setTimeout(resolve, 500))
      );

      setPdfProgress(20);
      setPdfStatus("Capturing content...");

      const captureWidth = Math.max(container.scrollWidth, 1100);
      const canvas = await html2canvas(container, {
        scale: 2.5,
        backgroundColor: "#ffffff",
        useCORS: true,
        logging: false,
        width: captureWidth,
        windowWidth: captureWidth,
        windowHeight: container.scrollHeight * 2,
      });

      setPdfProgress(60);
      setPdfStatus("Building PDF...");

      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const marginX = 8;
      const contentWidth = pdfWidth - marginX * 2;
      const bottomMargin = 12;
      const headerHeight = 22;

      const ticker = basicDealDetails.ticker ?? "Deal";
      const reportTitle = `Deal Bot - ${ticker}`;

      const drawPageHeader = () => {
        pdf.setFillColor(0, 32, 96);
        pdf.rect(0, 0, pdfWidth, headerHeight, "F");

        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(12);
        pdf.setTextColor(255, 255, 255);
        pdf.text(reportTitle, marginX, 9);

        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(8);
        pdf.setTextColor(180, 200, 230);
        const subtitle = [
          basicDealDetails.deal_type,
          basicDealDetails.pricing_date,
        ]
          .filter(Boolean)
          .join("  |  ");
        if (subtitle) {
          pdf.text(subtitle, marginX, 15);
        }

        pdf.setFontSize(7);
        pdf.setTextColor(150, 170, 200);
        const timestamp = new Date().toLocaleString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        });
        pdf.text(`Generated: ${timestamp}`, pdfWidth - marginX, 15, {
          align: "right",
        });

        pdf.setDrawColor(99, 102, 241);
        pdf.setLineWidth(0.8);
        pdf.line(0, headerHeight, pdfWidth, headerHeight);

        pdf.setTextColor(0, 0, 0);
        return headerHeight + 4;
      };

      const imgWidth = contentWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      const pxPerMm = canvas.height / imgHeight;

      // Scan canvas to find "safe" break rows (rows that are mostly white/blank)
      const findSafeBreakPoint = (
        targetPx: number,
        startPx: number
      ): number => {
        const scanCtx = canvas.getContext("2d");
        if (!scanCtx) return targetPx;

        // Search zone: look up to 15% above the target line for a blank row
        const searchRange = Math.floor((targetPx - startPx) * 0.15);
        const searchStart = Math.max(startPx, targetPx - searchRange);

        // Scan rows from target upward to find a row that is mostly white
        const sampleStep = Math.max(1, Math.floor(canvas.width / 200));
        for (let row = targetPx; row >= searchStart; row--) {
          const rowData = scanCtx.getImageData(0, row, canvas.width, 1).data;
          let whitePixels = 0;
          let totalSampled = 0;
          for (let x = 0; x < canvas.width; x += sampleStep) {
            totalSampled++;
            const idx = x * 4;
            const r = rowData[idx];
            const g = rowData[idx + 1];
            const b = rowData[idx + 2];
            // Consider near-white (> 240 for all channels) as blank
            if (r > 240 && g > 240 && b > 240) {
              whitePixels++;
            }
          }
          // If 95%+ of sampled pixels are white, this is a safe break row
          if (whitePixels / totalSampled >= 0.95) {
            return row;
          }
        }
        // No safe break found — fall back to the original target
        return targetPx;
      };

      let currentY = drawPageHeader();
      let canvasY = 0;
      let remainingCanvasHeight = canvas.height;

      while (remainingCanvasHeight > 0) {
        const availableMm = pdfHeight - bottomMargin - currentY;
        const availablePx = Math.floor(availableMm * pxPerMm);
        let sliceHeight = Math.min(availablePx, remainingCanvasHeight);

        // Only look for safe breaks if we're not on the last slice
        if (sliceHeight < remainingCanvasHeight) {
          sliceHeight = findSafeBreakPoint(
            canvasY + sliceHeight,
            canvasY
          ) - canvasY;
          // Ensure we always advance at least some pixels
          if (sliceHeight < 100) sliceHeight = availablePx;
        }

        const sliceMm = sliceHeight / pxPerMm;

        const sliceCanvas = document.createElement("canvas");
        sliceCanvas.width = canvas.width;
        sliceCanvas.height = sliceHeight;
        const ctx = sliceCanvas.getContext("2d");
        if (ctx) {
          ctx.fillStyle = "#ffffff";
          ctx.fillRect(0, 0, sliceCanvas.width, sliceCanvas.height);
          ctx.drawImage(
            canvas,
            0,
            canvasY,
            canvas.width,
            sliceHeight,
            0,
            0,
            canvas.width,
            sliceHeight
          );
        }

        const sliceData = sliceCanvas.toDataURL("image/jpeg", 0.95);
        pdf.addImage(
          sliceData,
          "JPEG",
          marginX,
          currentY,
          imgWidth,
          sliceMm
        );

        canvasY += sliceHeight;
        remainingCanvasHeight -= sliceHeight;

        if (remainingCanvasHeight > 0) {
          const remainingMm = remainingCanvasHeight / pxPerMm;
          if (remainingMm < 10) break;
          pdf.addPage();
          currentY = drawPageHeader();
        }

        setPdfProgress(60 + Math.round((canvasY / canvas.height) * 30));
      }

      setPdfProgress(95);
      setPdfStatus("Adding finishing touches...");

      // Remove trailing blank page if the last page only has the header
      const totalPages = pdf.getNumberOfPages();
      if (totalPages > 1) {
        // currentY will be near headerHeight if nothing was drawn on the last page
        const lastPageContentY = currentY;
        if (lastPageContentY <= headerHeight + 6) {
          pdf.deletePage(totalPages);
        }
      }

      const pageCount = pdf.getNumberOfPages();
      for (let p = 1; p <= pageCount; p++) {
        pdf.setPage(p);
        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(8);
        pdf.setTextColor(120, 120, 120);
        pdf.text(
          `Page ${p} of ${pageCount}`,
          pdfWidth - marginX,
          pdfHeight - 4,
          { align: "right" }
        );
        pdf.setDrawColor(200, 200, 200);
        pdf.setLineWidth(0.2);
        pdf.line(marginX, pdfHeight - 8, pdfWidth - marginX, pdfHeight - 8);
        pdf.setFontSize(7);
        pdf.setTextColor(160, 160, 160);
        pdf.text("MIDAS - Deal Bot", marginX, pdfHeight - 4);
      }

      setPdfProgress(100);
      setPdfStatus("Downloading...");

      const fileName = `DealBot_${ticker}_${new Date().toISOString().slice(0, 10)}.pdf`;
      pdf.save(fileName);

      container.style.overflow = originalOverflow;
      container.style.height = originalHeight;
      container.style.maxHeight = originalMaxHeight;
    } catch (error) {
      console.error("PDF export error:", error);
    } finally {
      setPdfLoading(false);
      setPdfProgress(0);
      setPdfStatus("");
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
            {blocks.length > 0 && !queryLoading && (
              <Button
                variant="contained"
                onClick={handleExportPDF}
                disabled={pdfLoading}
                startIcon={
                  pdfLoading ? (
                    <CircularProgress size={14} sx={{ color: "#fff" }} />
                  ) : (
                    <PictureAsPdfIcon sx={{ fontSize: 16 }} />
                  )
                }
                sx={{
                  backgroundColor: "#002060",
                  color: "#fff",
                  textTransform: "none",
                  fontWeight: 600,
                  fontSize: "12px",
                  borderRadius: "20px",
                  px: 2,
                  py: 0.5,
                  "&:hover": { backgroundColor: "#001540" },
                  "&.Mui-disabled": {
                    backgroundColor: "rgba(0,32,96,0.3)",
                    color: "rgba(255,255,255,0.5)",
                  },
                }}
              >
                {pdfLoading ? "Generating..." : "Export PDF"}
              </Button>
            )}
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
          <Box ref={contentRef}>
            <GENAIRenderer blocks={blocks} renderAll disableMotion />
          </Box>
        )}
      </Stack>

      <Dialog
        open={pdfLoading}
        maxWidth="sm"
        fullWidth
        slotProps={{
          backdrop: {
            sx: {
              backgroundColor: "rgba(0, 10, 40, 0.85)",
              backdropFilter: "blur(12px)",
              WebkitBackdropFilter: "blur(12px)",
            },
          },
        }}
        PaperProps={{
          sx: {
            borderRadius: "16px",
            p: 1,
            background: "linear-gradient(135deg, #002060, #001540)",
          },
        }}
      >
        <DialogContent sx={{ textAlign: "center", py: 4 }}>
          <CircularProgress size={48} sx={{ color: "#6b6bff", mb: 2 }} />
          <Typography
            variant="h6"
            sx={{ color: "#fff", fontWeight: 700, mb: 1 }}
          >
            Generating Deal Bot PDF
          </Typography>
          <Typography
            variant="body2"
            sx={{ color: "rgba(255,255,255,0.7)", mb: 3 }}
          >
            {pdfStatus}
          </Typography>
          <Box sx={{ px: 2 }}>
            <LinearProgress
              variant="determinate"
              value={pdfProgress}
              sx={{
                height: 8,
                borderRadius: 4,
                backgroundColor: "rgba(255,255,255,0.15)",
                "& .MuiLinearProgress-bar": {
                  borderRadius: 4,
                  background: "linear-gradient(90deg, #6b6bff, #8f5bff)",
                },
              }}
            />
            <Typography
              variant="caption"
              sx={{
                color: "rgba(255,255,255,0.5)",
                mt: 1,
                display: "block",
              }}
            >
              {pdfProgress}% complete
            </Typography>
          </Box>
        </DialogContent>
      </Dialog>
    </Paper>
  );
};

export default DealBot;
