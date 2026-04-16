import React from "react";
import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  IconButton,
  InputAdornment,
  LinearProgress,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import SendRoundedIcon from "@mui/icons-material/SendRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import PictureAsPdfRoundedIcon from "@mui/icons-material/PictureAsPdfRounded";
import GENAIRenderer from "../GhcAi/AIPages/GENAIRenderer";
import { Block } from "../GhcAi/Utils/ComponentsUtils";
import DealBotPdfContent from "./DealBotPdfContent";
import { type DealBotBasicDealDetails } from "./DealBotPdfExport";
import introImage from "../../Assets/images/monashee_page1.png";
import monasheeLogo from "../../Assets/images/monashee_logo.png";

// html2canvas and jsPDF are dynamically imported at PDF export time
// to avoid loading ~500KB+ of PDF libraries on page mount
type Html2CanvasFn = typeof import("html2canvas")["default"];
type JsPDFClass = typeof import("jspdf")["default"];

let _html2canvas: Html2CanvasFn | null = null;
let _jsPDF: JsPDFClass | null = null;

type jsPDF = InstanceType<JsPDFClass>;

const loadPdfLibs = async () => {
  if (!_html2canvas || !_jsPDF) {
    const [h2cModule, jsPDFModule] = await Promise.all([
      import("html2canvas"),
      import("jspdf"),
    ]);
    _html2canvas = h2cModule.default;
    _jsPDF = jsPDFModule.default;
  }
  return { html2canvas: _html2canvas, jsPDF: _jsPDF };
};

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

// type DealBotCache = {
//   question: string;
//   blocks: Block[];
// };

// const getDealBotStorageKey = (details: DealBotBasicDealDetails) => {
//   const parts = [
//     details.deal_id ?? "",
//     details.unique_deal_id ?? "",
//     details.ticker ?? "",
//     details.pricing_date ?? "",
//     details.deal_type ?? "",
//   ];
//   return `dealbot:${parts.join("|")}`;
// };

// const readDealBotCache = (key: string): DealBotCache | null => {
//   try {
//     const raw = localStorage.getItem(key);
//     if (!raw) return null;
//     const parsed = JSON.parse(raw) as DealBotCache;
//     if (!parsed || !Array.isArray(parsed.blocks)) return null;
//     return parsed;
//   } catch {
//     return null;
//   }
// };

// const writeDealBotCache = (key: string, cache: DealBotCache) => {
//   try {
//     localStorage.setItem(key, JSON.stringify(cache));
//   } catch {
//     // Ignore storage write failures.
//   }
// };

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

const waitForLayout = () =>
  new Promise<void>((resolve) => {
    requestAnimationFrame(() => setTimeout(resolve, 140));
  });

const waitForContentReady = async (
  root: HTMLElement,
  { timeoutMs = 8000, intervalMs = 250 } = {}
) => {
  const started = Date.now();

  const hasLoadingIndicators = () => {
    if (root.querySelector("[role='progressbar'], .MuiCircularProgress-root")) {
      return true;
    }
    const text = root.textContent || "";
    return /loading/i.test(text);
  };

  const hasPendingImages = () =>
    Array.from(root.querySelectorAll("img")).some((img) => !img.complete);

  while (Date.now() - started < timeoutMs) {
    if (!hasLoadingIndicators() && !hasPendingImages()) {
      return;
    }
    await new Promise((resolve) => setTimeout(resolve, intervalMs));
  }
};

const loadImage = (src: string) =>
  new Promise<HTMLImageElement | null>((resolve) => {
    const image = new Image();
    image.decoding = "async";
    image.crossOrigin = "anonymous";
    image.onload = () => resolve(image);
    image.onerror = () => resolve(null);
    image.src = src;
  });

const isCanvasLikelyBlank = (canvas: HTMLCanvasElement) => {
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return false;

  const sampleCols = 12;
  const sampleRows = 12;
  let blankSamples = 0;
  let totalSamples = 0;

  for (let y = 0; y < sampleRows; y += 1) {
    for (let x = 0; x < sampleCols; x += 1) {
      const sampleX = Math.min(
        canvas.width - 1,
        Math.floor((x / Math.max(sampleCols - 1, 1)) * Math.max(canvas.width - 1, 0))
      );
      const sampleY = Math.min(
        canvas.height - 1,
        Math.floor((y / Math.max(sampleRows - 1, 1)) * Math.max(canvas.height - 1, 0))
      );
      const pixel = ctx.getImageData(sampleX, sampleY, 1, 1).data;
      const r = pixel[0];
      const g = pixel[1];
      const b = pixel[2];
      const a = pixel[3];
      totalSamples += 1;

      const isBlankPixel = a === 0 || (r > 245 && g > 245 && b > 245);
      if (isBlankPixel) {
        blankSamples += 1;
      }
    }
  }

  return totalSamples > 0 && blankSamples / totalSamples > 0.98;
};

const getCanvasScale = () => {
  if (typeof window === "undefined") return 2;
  const ratio = window.devicePixelRatio || 1;
  return Math.min(Math.max(ratio, 1.5), 3);
};

const captureSectionCanvas = async ({
  section,
  sectionKey,
  captureWidth,
}: {
  section: HTMLElement;
  sectionKey?: string;
  captureWidth: number;
}) => {
  const { html2canvas } = await loadPdfLibs();
  const renderSection = async (foreignObjectRendering: boolean) =>
    html2canvas(section, {
      scale: Math.max(getCanvasScale(), 2.4),
      useCORS: true,
      backgroundColor: "#ffffff",
      allowTaint: true,
      foreignObjectRendering,
      width: captureWidth,
      windowWidth: captureWidth,
      windowHeight: Math.max(section.scrollHeight, section.clientHeight, 1),
      scrollY: -window.scrollY,
      ignoreElements: (el) =>
        (el as HTMLElement).classList?.contains("pdf-hidden") ?? false,
      onclone: (doc) => {
        const selector = sectionKey
          ? `[data-pdf-key="${sectionKey}"]`
          : ".dealbot-pdf-section";
        const cloned = doc.querySelector<HTMLElement>(selector);
        if (cloned) {
          cloned.style.width = `${captureWidth}px`;
          cloned.style.maxWidth = `${captureWidth}px`;
          cloned.style.minWidth = `${captureWidth}px`;
          cloned.style.margin = "0";
          cloned.style.padding = "0";
          cloned.style.boxSizing = "border-box";

          const allNodes = cloned.querySelectorAll<HTMLElement>("*");
          allNodes.forEach((node) => {
            const computed = window.getComputedStyle(node);
            node.style.boxSizing = "border-box";

            const backgroundColor = computed.backgroundColor;
            if (
              backgroundColor &&
              backgroundColor !== "rgba(0, 0, 0, 0)" &&
              backgroundColor !== "transparent"
            ) {
              node.style.backgroundColor = backgroundColor;
            }

            const backgroundImage = computed.backgroundImage;
            if (backgroundImage && backgroundImage !== "none") {
              node.style.backgroundImage = backgroundImage;
            }

            const borderColor = computed.borderColor;
            if (
              borderColor &&
              borderColor !== "rgba(0, 0, 0, 0)" &&
              borderColor !== "transparent"
            ) {
              node.style.borderColor = borderColor;
            }
          });
        }
      },
    });

  try {
    const foreignObjectCanvas = await renderSection(true);
    if (!isCanvasLikelyBlank(foreignObjectCanvas)) {
      return foreignObjectCanvas;
    }
  } catch (error) {
    console.warn("Deal bot PDF foreignObject render failed, retrying with standard canvas", error);
  }

  return renderSection(false);
};

const drawHeader = (
  pdf: jsPDF,
  headerTitle: string,
  logoImg?: HTMLImageElement | null
) => {
  const pdfWidth = pdf.internal.pageSize.getWidth();
  const marginX = 10;
  const logoWidth = 45;
  const logoHeight = 13.5;
  const logoX = pdfWidth - marginX - logoWidth;
  const logoY = 8;

  if (logoImg) {
    pdf.addImage(logoImg, "PNG", logoX, logoY, logoWidth, logoHeight, undefined, "FAST");
  }

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(12);
  pdf.setTextColor(0, 32, 96);
  pdf.text(headerTitle?.trim?.() || "Deal Bot Transcript", marginX, 14);
  pdf.setDrawColor(0, 32, 96);
  pdf.setLineWidth(0.3);
  const lineY = logoY + logoHeight + 2;
  pdf.line(marginX, lineY, pdfWidth - marginX, lineY);
  pdf.setTextColor(0, 0, 0);
  return lineY + 5;
};

const getFooterLayout = (pdf: jsPDF, dataAsOfText: string, marginX: number) => {
  const pdfWidth = pdf.internal.pageSize.getWidth();
  const pdfHeight = pdf.internal.pageSize.getHeight();
  pdf.setFontSize(7);
  pdf.setTextColor(100);
  pdf.setFont("helvetica", "normal");

  const asOfLabel = dataAsOfText ? `Data as of ${dataAsOfText}. ` : "";
  const footerText = `${asOfLabel}Data from company management. The specific investment described herein does not represent all investment decisions made by Monashee Investment Management. The reader should not assume that investment decisions identified and discussed were or will be profitable. Specific investment advice references provided herein are for illustrative purposes only and are not necessarily representative of investments that will be made in the future.`;

  const footerLines: string[] = (pdf as any).splitTextToSize(
    footerText,
    pdfWidth - marginX * 2
  );

  const lineHeightMm = pdf.getFontSize() * 0.3528 * 1.2;
  const bottomTextY = pdfHeight - 10;
  const footerTextHeight = footerLines.length * lineHeightMm;
  const footerTextTopY = bottomTextY - 6 - footerTextHeight;
  const footerLineY = footerTextTopY - 3;
  const footerTopY = footerLineY - 2;
  const footerHeight = pdfHeight - footerTopY;

  return {
    footerLines,
    footerTextTopY,
    footerLineY,
    footerHeight,
    bottomTextY,
  };
};

const drawFooter = (pdf: jsPDF, dataAsOfText: string, marginX = 10) => {
  const pdfWidth = pdf.internal.pageSize.getWidth();
  const layout = getFooterLayout(pdf, dataAsOfText, marginX);

  pdf.setDrawColor(0, 32, 96);
  pdf.setLineWidth(1);
  pdf.line(marginX, layout.footerLineY, pdfWidth - marginX, layout.footerLineY);
  pdf.setFontSize(7);
  pdf.setTextColor(100);
  pdf.setFont("helvetica", "normal");
  pdf.text(layout.footerLines, marginX, layout.footerTextTopY, {
    maxWidth: pdfWidth - marginX * 2,
  });
  pdf.setFontSize(9);
  pdf.setFont("helvetica", "bold");
  pdf.setTextColor(128);
  pdf.text("Do not copy. Do not distribute.", pdfWidth / 2, layout.bottomTextY, {
    align: "center",
  });
  pdf.setTextColor(0, 0, 0);
};

const getPageMetrics = (pdf: jsPDF, dataAsOfText: string, marginX: number) => {
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const footerLayout = getFooterLayout(pdf, dataAsOfText, marginX);

  return {
    pageWidth,
    pageHeight,
    contentWidth: pageWidth - marginX * 2,
    bottomMargin: Math.max(footerLayout.footerHeight + 8, 36),
  };
};

const getPreferredContentOrientation = (
  root: HTMLElement
): "portrait" | "landscape" => {
  const tables = Array.from(root.querySelectorAll<HTMLElement>("table, .MuiTable-root"));

  const hasWideTable = tables.some((table) => {
    const firstRow =
      table.querySelector("thead tr") ||
      table.querySelector("tbody tr") ||
      table.querySelector("tr");
    const columnCount = firstRow?.querySelectorAll("th, td").length ?? 0;
    return columnCount >= 4;
  });

  return hasWideTable ? "landscape" : "portrait";
};

const collectSectionBreakpoints = (section: HTMLElement) => {
  const sectionRect = section.getBoundingClientRect();
  const sectionHeight = Math.max(section.scrollHeight, sectionRect.height, 1);
  const minInsetPx = 20;
  const values: number[] = [];

  const candidates = Array.from(
    section.querySelectorAll<HTMLElement>(
      [
        ".MuiTableRow-root",
        ".MuiGrid-container",
        ".MuiCard-root",
        ".MuiPaper-root",
        "p",
        "li",
        "blockquote",
        "h1",
        "h2",
        "h3",
        "h4",
        "h5",
        "h6",
      ].join(", ")
    )
  );

  candidates.forEach((node) => {
    const computed = window.getComputedStyle(node);
    if (computed.display === "inline") return;

    const rect = node.getBoundingClientRect();
    const bottom = rect.bottom - sectionRect.top;

    if (bottom > minInsetPx && bottom < sectionHeight - minInsetPx) {
      values.push(bottom);
    }
  });

  return values.sort((a, b) => a - b);
};

const collectTextLineBreakpoints = (section: HTMLElement) => {
  const sectionRect = section.getBoundingClientRect();
  const sectionHeight = Math.max(section.scrollHeight, sectionRect.height, 1);
  const minInsetPx = 12;
  const values: number[] = [];

  const textContainers = Array.from(
    section.querySelectorAll<HTMLElement>(
      [
        "p",
        "li",
        "td",
        "th",
        "blockquote",
        "h1",
        "h2",
        "h3",
        "h4",
        "h5",
        "h6",
        ".MuiTypography-root",
      ].join(", ")
    )
  );

  textContainers.forEach((node) => {
    const text = node.textContent?.trim();
    if (!text) return;

    const range = document.createRange();
    range.selectNodeContents(node);

    Array.from(range.getClientRects()).forEach((rect) => {
      if (rect.height < 6) return;

      const bottom = rect.bottom - sectionRect.top;
      if (bottom > minInsetPx && bottom < sectionHeight - minInsetPx) {
        values.push(bottom);
      }
    });
  });

  return values.sort((a, b) => a - b);
};

const dedupeBreakpoints = (values: number[], tolerancePx = 3) => {
  const sorted = [...values].sort((a, b) => a - b);
  return sorted.filter((value, index) => {
    if (index === 0) return true;
    return value - sorted[index - 1] > tolerancePx;
  });
};

type TableGuard = {
  top: number;
  headerBottom: number;
  firstRowBottom: number;
};

type KeepTogetherGuard = {
  top: number;
  bottom: number;
};

const collectTableGuards = (section: HTMLElement): TableGuard[] => {
  const sectionRect = section.getBoundingClientRect();

  return Array.from(section.querySelectorAll<HTMLElement>("table, .MuiTable-root"))
    .map((table) => {
      const tableRect = table.getBoundingClientRect();
      const top = tableRect.top - sectionRect.top;

      const headerRow =
        table.querySelector<HTMLElement>("thead tr") ||
        table.querySelector<HTMLElement>("tr");
      const bodyFirstRow =
        table.querySelector<HTMLElement>("tbody tr") ||
        Array.from(table.querySelectorAll<HTMLElement>("tr")).find(
          (row) => row !== headerRow
        ) ||
        headerRow;

      const headerBottom = headerRow
        ? headerRow.getBoundingClientRect().bottom - sectionRect.top
        : top;
      const firstRowBottom = bodyFirstRow
        ? bodyFirstRow.getBoundingClientRect().bottom - sectionRect.top
        : headerBottom;

      return {
        top,
        headerBottom,
        firstRowBottom: Math.max(firstRowBottom, headerBottom),
      };
    })
    .filter((guard) => guard.firstRowBottom > guard.top + 1)
    .sort((a, b) => a.top - b.top);
};

const collectKeepTogetherGuards = (section: HTMLElement): KeepTogetherGuard[] => {
  const sectionRect = section.getBoundingClientRect();
  const sectionHeight = Math.max(section.scrollHeight, sectionRect.height, 1);
  const guardNodes = new Set<HTMLElement>();

  const visualNodes = Array.from(section.querySelectorAll<HTMLElement>("canvas, svg, img"));

  visualNodes.forEach((node) => {
    const guardNode =
      node.closest<HTMLElement>(".MuiPaper-root") ||
      node.closest<HTMLElement>(".MuiCard-root") ||
      node.closest<HTMLElement>(".MuiGrid-item") ||
      node.parentElement;

    if (guardNode && section.contains(guardNode)) {
      guardNodes.add(guardNode);
    }
  });

  return Array.from(guardNodes)
    .map((node) => {
      const rect = node.getBoundingClientRect();
      return {
        top: Math.max(0, rect.top - sectionRect.top),
        bottom: Math.min(sectionHeight, rect.bottom - sectionRect.top),
      };
    })
    .filter((guard) => guard.bottom - guard.top > 80)
    .sort((a, b) => a.top - b.top);
};

const alignSliceHeightToBreakpoints = ({
  offsetPx,
  maxSliceHeightPx,
  remainingPx,
  breakpointsPx,
  tableGuardsPx,
  keepTogetherGuardsPx,
}: {
  offsetPx: number;
  maxSliceHeightPx: number;
  remainingPx: number;
  breakpointsPx: number[];
  tableGuardsPx: TableGuard[];
  keepTogetherGuardsPx: KeepTogetherGuard[];
}) => {
  if (remainingPx <= maxSliceHeightPx) {
    return remainingPx;
  }

  const upperLimit = offsetPx + maxSliceHeightPx - 2;
  const protectedVisual = keepTogetherGuardsPx.find(
    (guard) =>
      guard.top > offsetPx + 2 &&
      guard.top < upperLimit &&
      upperLimit < guard.bottom - 2
  );

  if (protectedVisual) {
    return Math.max(1, Math.floor(protectedVisual.top - offsetPx));
  }

  const protectedTable = tableGuardsPx.find(
    (guard) =>
      guard.top > offsetPx + 2 &&
      guard.top < upperLimit &&
      upperLimit < guard.firstRowBottom - 2
  );

  if (protectedTable) {
    return Math.max(1, Math.floor(protectedTable.top - offsetPx));
  }

  const minSliceHeightPx = Math.min(
    maxSliceHeightPx - 1,
    Math.max(120, Math.floor(maxSliceHeightPx * 0.35))
  );

  for (let index = breakpointsPx.length - 1; index >= 0; index -= 1) {
    const point = breakpointsPx[index];
    const leavesHeaderOrphan = tableGuardsPx.some(
      (guard) => point > guard.headerBottom - 2 && point < guard.firstRowBottom - 2
    );
    const cutsVisualBlock = keepTogetherGuardsPx.some(
      (guard) => point > guard.top + 2 && point < guard.bottom - 2
    );

    if (
      point > offsetPx + minSliceHeightPx &&
      point <= upperLimit &&
      !leavesHeaderOrphan &&
      !cutsVisualBlock
    ) {
      return point - offsetPx;
    }
  }

  return maxSliceHeightPx;
};

const formatDataAsOf = (value?: string | null) => {
  if (!value) return "";
  const cleanValue = value.replace(/(\d+)(st|nd|rd|th)/, "$1");
  const dateObj = new Date(cleanValue);
  if (Number.isNaN(dateObj.getTime())) return value;
  const month = dateObj.toLocaleString("default", { month: "short" });
  const year = dateObj.getFullYear();
  return `${month} ${year}`;
};

const formatCoverDate = (value?: string | null) => {
  if (!value) return null;
  const cleanValue = value.replace(/(\d+)(st|nd|rd|th)/, "$1");
  const dateObj = new Date(cleanValue);
  if (Number.isNaN(dateObj.getTime())) return value;
  const day = dateObj.getDate().toString().padStart(2, "0");
  const month = dateObj.toLocaleString("default", { month: "short" });
  const year = dateObj.getFullYear();
  return `${day} ${month} ${year}`;
};

const buildDealBotPdfFileName = (details: DealBotBasicDealDetails) =>
  [details.ticker, details.deal_type, details.pricing_date, "deal-bot-transcript"]
    .filter(Boolean)
    .join("-")
    .replace(/[^\w-]+/g, "_")
    .replace(/_+/g, "_");

const DealBot: React.FC<DealBotProps> = ({ basicDealDetails }) => {
  const pdfContainerRef = React.useRef<HTMLDivElement | null>(null);

  const [apiData, setApiData] = React.useState<any>(null);
  const [prepLoading, setPrepLoading] = React.useState(false);
  const [prepError, setPrepError] = React.useState<string | null>(null);
  const [question, setQuestion] = React.useState("");
  const [blocks, setBlocks] = React.useState<Block[]>([]);
  const [lastAskedQuestion, setLastAskedQuestion] = React.useState("");
  const [queryLoading, setQueryLoading] = React.useState(false);
  const [queryError, setQueryError] = React.useState<string | null>(null);

  const [recentResponses, setRecentResponses] = React.useState<BotResponseItem[]>([]);
  const [recentLoading, setRecentLoading] = React.useState(false);
  const [recentError, setRecentError] = React.useState<string | null>(null);
  const [showRecentQuestions, setShowRecentQuestions] = React.useState(true);

  const [exportLoading, setExportLoading] = React.useState(false);
  const [exportError, setExportError] = React.useState<string | null>(null);
  const [noQuestionDialogOpen, setNoQuestionDialogOpen] = React.useState(false);
  const [pdfExportedAt, setPdfExportedAt] = React.useState("");

  const apiUrl = React.useMemo(() => process.env.REACT_APP_API_URL, []);
  const botType = React.useMemo(() => "deal_bot", []);
  // const storageKey = React.useMemo(
  //   () => getDealBotStorageKey(basicDealDetails ?? {}),
  //   [
  //     basicDealDetails.deal_id,
  //     basicDealDetails.unique_deal_id,
  //     basicDealDetails.ticker,
  //     basicDealDetails.pricing_date,
  //     basicDealDetails.deal_type,
  //   ]
  // );
  const friendlyErrorMessage = React.useMemo(
    () => "Something went wrong. Please rerun to try again.",
    []
  );
  const hasExportableConversation = React.useMemo(
    () => Boolean(lastAskedQuestion.trim()) && blocks.length > 0,
    [lastAskedQuestion, blocks]
  );

  React.useEffect(() => {
    // const cached = readDealBotCache(storageKey);
    // if (cached) {
    //   setQuestion(cached.question ?? "");
    //   setLastAskedQuestion(cached.question ?? "");
    //   setBlocks(cached.blocks ?? []);
    // } else {
    //   setQuestion("");
    //   setLastAskedQuestion("");
    //   setBlocks([]);
    // }

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
      setLastAskedQuestion(trimmed);
      setShowRecentQuestions(false);
      // writeDealBotCache(storageKey, { question: trimmed, blocks: nextBlocks });
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
    setLastAskedQuestion("");
    setQueryError(null);
    setShowRecentQuestions(true);
  };

  const handleSelectRecent = (item: BotResponseItem) => {
    const nextBlocks = toBlocks(item.answer);
    setQuestion(item.question ?? "");
    setLastAskedQuestion(item.question ?? "");
    setBlocks(nextBlocks);
    setQueryError(null);
    setShowRecentQuestions(false);
    // writeDealBotCache(storageKey, {
    //   question: item.question ?? "",
    //   blocks: nextBlocks,
    // });
  };

  const handleExportPdf = async () => {
    if (!apiData || prepLoading || queryLoading || exportLoading) {
      return;
    }

    if (!hasExportableConversation) {
      setNoQuestionDialogOpen(true);
      return;
    }

    const root = pdfContainerRef.current;
    if (!root) {
      setExportError("PDF content is not ready yet. Please try again.");
      return;
    }

    const exportTimestamp = new Date().toLocaleString();
    setPdfExportedAt(exportTimestamp);
    setExportLoading(true);
    setExportError(null);

    try {
      await waitForLayout();
      await waitForContentReady(root);

      const { jsPDF: JsPDF } = await loadPdfLibs();
      const pdf = new JsPDF("p", "mm", "a4");
      if (typeof (pdf as any).setDisplayMode === "function") {
        (pdf as any).setDisplayMode(160);
      }

      const marginX = 10;
      const dataAsOfText = formatDataAsOf(basicDealDetails.pricing_date);
      const coverWidth = pdf.internal.pageSize.getWidth();
      const coverHeight = pdf.internal.pageSize.getHeight();

      const [logoImg, introImg] = await Promise.all([
        loadImage(monasheeLogo),
        loadImage(introImage),
      ]);

      if (introImg) {
        pdf.addImage(introImg, "PNG", 0, 0, coverWidth, coverHeight);
      } else {
        pdf.setFillColor(255, 255, 255);
        pdf.rect(0, 0, coverWidth, coverHeight, "F");
      }

      const coverRightX = coverWidth - marginX;
      pdf.setTextColor(0, 32, 96);
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(16);
      const coverTicker = (basicDealDetails.ticker || "DEAL").toUpperCase();
      pdf.text(coverTicker, coverRightX - pdf.getTextWidth(coverTicker), 20);

      pdf.setFontSize(12);
      const coverTitle = "Deal Bot Transcript";
      pdf.text(coverTitle, coverRightX - pdf.getTextWidth(coverTitle), 28);

      const coverMeta = [
        basicDealDetails.deal_type?.trim(),
        formatCoverDate(basicDealDetails.pricing_date),
      ]
        .filter(Boolean)
        .join(" | ");

      if (coverMeta) {
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(10);
        pdf.text(coverMeta, coverRightX - pdf.getTextWidth(coverMeta), 35);
      }

      const sections =
        Array.from(root.querySelectorAll<HTMLElement>(".dealbot-pdf-section")) || [];
      const targets = sections.length ? sections : [root];
      const contentOrientation = getPreferredContentOrientation(root);
      const headerTitle = basicDealDetails.ticker
        ? `${basicDealDetails.ticker.toUpperCase()} Deal Bot Transcript`
        : "Deal Bot Transcript";

      pdf.addPage("a4", contentOrientation);
      let cursorY = drawHeader(pdf, headerTitle, logoImg);
      let pageMetrics = getPageMetrics(pdf, dataAsOfText, marginX);

      const beginNextContentPage = () => {
        drawFooter(pdf, dataAsOfText, marginX);
        pdf.addPage("a4", contentOrientation);
        cursorY = drawHeader(pdf, headerTitle, logoImg);
        pageMetrics = getPageMetrics(pdf, dataAsOfText, marginX);
      };

      let isFirstSection = true;

      for (const section of targets) {
        pageMetrics = getPageMetrics(pdf, dataAsOfText, marginX);
        const attrBreakBefore =
          section.dataset.pdfBreakBefore === "true" ||
          section.dataset.pdfBreakBefore === "1";

        let breakBefore = attrBreakBefore;
        const minRemainingMm = 38;
        const availableHeightMmBefore =
          pageMetrics.pageHeight - pageMetrics.bottomMargin - cursorY;

        if (!breakBefore && !isFirstSection && availableHeightMmBefore < minRemainingMm) {
          breakBefore = true;
        }

        if (breakBefore && !isFirstSection) {
          beginNextContentPage();
        } else if (
          !breakBefore &&
          cursorY > pageMetrics.pageHeight - pageMetrics.bottomMargin - minRemainingMm
        ) {
          beginNextContentPage();
        }

        const captureViewportWidth = contentOrientation === "landscape" ? 1040 : 980;
        const captureWidth = captureViewportWidth;

        const prevStyles: Array<{
          el: HTMLElement;
          key: string;
          val: string | null;
        }> = [];

        const remember = (el: HTMLElement, key: string, val: string) => {
          prevStyles.push({ el, key, val: (el.style as any)[key] ?? null });
          (el.style as any)[key] = val;
        };

        const relaxLayout = (el: HTMLElement) => {
          const width = Math.max(el.scrollWidth, el.clientWidth, captureViewportWidth);
          remember(el, "overflow", "visible");
          remember(el, "overflowX", "visible");
          remember(el, "overflowY", "visible");
          remember(el, "maxHeight", "none");
          remember(el, "height", "auto");
          remember(el, "width", `${width}px`);
          remember(el, "minWidth", `${width}px`);
          remember(el, "boxSizing", "border-box");

          const children = Array.from(el.querySelectorAll<HTMLElement>("*"));
          children.forEach((child) => {
            remember(child, "overflow", "visible");
            remember(child, "overflowX", "visible");
            remember(child, "overflowY", "visible");
            remember(child, "maxHeight", "none");
            remember(child, "height", "auto");
            remember(child, "boxSizing", "border-box");
            if (child.tagName === "TABLE" || child.classList.contains("MuiTable-root")) {
              remember(child, "width", "100%");
            }
          });
        };

        try {
          relaxLayout(section);

          const sectionBreakpoints = dedupeBreakpoints([
            ...collectSectionBreakpoints(section),
            ...collectTextLineBreakpoints(section),
          ]);
          const tableGuards = collectTableGuards(section);
          const keepTogetherGuards = collectKeepTogetherGuards(section);
          const sectionKey = section.dataset.pdfKey;

          const canvas = await captureSectionCanvas({
            section,
            sectionKey,
            captureWidth,
          });

          const sectionCssHeight = Math.max(
            section.scrollHeight,
            section.getBoundingClientRect().height,
            1
          );
          const breakpointScale = canvas.height / sectionCssHeight;
          const scaledBreakpoints = sectionBreakpoints.map(
            (point) => point * breakpointScale
          );
          const scaledTableGuards = tableGuards.map((guard) => ({
            top: guard.top * breakpointScale,
            headerBottom: guard.headerBottom * breakpointScale,
            firstRowBottom: guard.firstRowBottom * breakpointScale,
          }));
          const scaledKeepTogetherGuards = keepTogetherGuards.map((guard) => ({
            top: guard.top * breakpointScale,
            bottom: guard.bottom * breakpointScale,
          }));

          let offsetPx = 0;

          while (offsetPx < canvas.height) {
            pageMetrics = getPageMetrics(pdf, dataAsOfText, marginX);

            const mmPerPx = pageMetrics.contentWidth / canvas.width;
            const remainingPx = canvas.height - offsetPx;
            const availableHeightMm =
              pageMetrics.pageHeight - pageMetrics.bottomMargin - cursorY;

            if (availableHeightMm <= 4) {
              beginNextContentPage();
              continue;
            }

            const availableHeightPx = availableHeightMm / mmPerPx;
            if (remainingPx > availableHeightPx && availableHeightMm < 26) {
              beginNextContentPage();
              continue;
            }

            const maxSliceHeightPx = Math.min(
              remainingPx,
              Math.floor(availableHeightPx)
            );
            if (maxSliceHeightPx <= 0) break;

            const alignedSliceHeightPx = Math.max(
              1,
              Math.floor(
                alignSliceHeightToBreakpoints({
                  offsetPx,
                  maxSliceHeightPx,
                  remainingPx,
                  breakpointsPx: scaledBreakpoints,
                  tableGuardsPx: scaledTableGuards,
                  keepTogetherGuardsPx: scaledKeepTogetherGuards,
                })
              )
            );

            const sliceHeightPx = Math.min(remainingPx, alignedSliceHeightPx);
            if (remainingPx > maxSliceHeightPx && sliceHeightPx < 62) {
              beginNextContentPage();
              continue;
            }

            const sliceCanvas = document.createElement("canvas");
            sliceCanvas.width = canvas.width;
            sliceCanvas.height = Math.ceil(sliceHeightPx);
            const ctx = sliceCanvas.getContext("2d");

            if (ctx) {
              ctx.drawImage(
                canvas,
                0,
                offsetPx,
                canvas.width,
                sliceHeightPx,
                0,
                0,
                canvas.width,
                sliceHeightPx
              );
            }

            const sliceImg = sliceCanvas.toDataURL("image/png", 1.0);
            const sliceHeightMm = sliceHeightPx * mmPerPx;

            pdf.addImage(
              sliceImg,
              "PNG",
              marginX,
              cursorY,
              pageMetrics.contentWidth,
              sliceHeightMm,
              undefined,
              "FAST"
            );

            const isLastSlice = offsetPx + sliceHeightPx >= canvas.height - 1;
            offsetPx = isLastSlice ? canvas.height : offsetPx + sliceHeightPx;
            cursorY += sliceHeightMm;

            if (
              offsetPx < canvas.height &&
              pageMetrics.pageHeight - pageMetrics.bottomMargin - cursorY < 24
            ) {
              beginNextContentPage();
            }
          }
        } finally {
          prevStyles.forEach(({ el, key, val }) => {
            (el.style as any)[key] = val ?? "";
          });
        }

        isFirstSection = false;
      }

      drawFooter(pdf, dataAsOfText, marginX);

      pdf.addPage("a4", "portrait");
      const disclaimerWidth = pdf.internal.pageSize.getWidth();
      const disclaimerHeight = pdf.internal.pageSize.getHeight();
      const headerLogoWidth = 45;
      const headerLogoHeight = 13.5;
      const headerLogoX = disclaimerWidth - headerLogoWidth - 10;
      const headerLogoY = 10;

      if (logoImg) {
        pdf.addImage(
          logoImg,
          "PNG",
          headerLogoX,
          headerLogoY,
          headerLogoWidth,
          headerLogoHeight,
          undefined,
          "FAST"
        );
      }

      const headerLineY = headerLogoY + headerLogoHeight + 2;
      pdf.setDrawColor(0, 32, 96);
      pdf.setLineWidth(1);
      pdf.line(10, headerLineY, disclaimerWidth - 10, headerLineY);

      const titleY = headerLineY + 6;
      pdf.setTextColor(0, 32, 96);
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(16);
      pdf.text("Disclaimer", marginX, titleY);

      const bodyY = titleY + 10;
      const disclaimerText =
        "The information contained herein has been compiled by Monashee internally and may be based on unaudited data from the relevant funds' books and records, and hypothetical information that has not been verified or reconciled by such funds' administrator. As such, the information contained herein should not serve as any kind of basis for any investment decision.\n\n" +
        "This document does not constitute advice or a recommendation or offer to sell or a solicitation to deal in any security or financial product. It is provided for information purposes only and on the understanding that the recipient has sufficient knowledge and experience to be able to understand and make their own evaluation of the proposals and services described herein, any risks associated therewith and any related legal, tax, accounting or other material considerations. To the extent that the reader has any questions regarding the applicability of any specific issue discussed above to their specific portfolio or situation, prospective investors are encouraged to contact Monashee Investment Management or consult with the professional advisor of their choosing.\n\n" +
        "Certain information contained herein has been obtained from third party sources and such information has not been independently verified by Monashee Investment Management. No representation, warranty, or undertaking, expressed or implied, is given to the accuracy or completeness of such information by Monashee Investment Management or any other person. While such sources are believed to be reliable. Monashee Investment Management does not assume any responsibility for the accuracy or completeness of such information. Monashee Investment Management does not undertake any obligation to update the information contained herein as of any future date.\n\n" +
        "Except where otherwise indicated, the information contained in this presentation is based on matters as they exist as of the date of preparation of such material and not as of the date of distribution or any future date. Recipients should not rely on this material in making any future investment decision.\n\n" +
        "This presentation is confidential, is intended only for the person to whom it has been directly provided and under no circumstances may a copy be shown, copied, transmitted or otherwise be given to any person other than the authorized recipient without the prior written consent of Monashee Investment Management.\n\n" +
        "There is no guarantee that the investment objectives will be achieved. Moreover, the past performance is not a guarantee or indicator of future results.\n\n" +
        'Certain information contained herein constitutes "forward-looking statements," which can be identified by the use of forward-looking terminology such as "may," "will." "should," "expect," "anticipate," "project," "estimate," "intend," "continue," or "believe." or the negatives thereof or other variations thereon or comparable terminology. Due to various risks and uncertainties, actual events, results or actual performance may differ materially from those reflected or contemplated in such forward-looking statements. Nothing contained herein may be relied upon as a guarantee, promise, assurance or a representation as to the future';

      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(10.5);
      pdf.setTextColor(60);
      const maxWidth = disclaimerWidth - marginX * 2;
      const lines: string[] = (pdf as any).splitTextToSize(disclaimerText, maxWidth);
      const lineHeightMm = pdf.getFontSize() * 0.3528 * 1.2;
      let yCursor = bodyY;
      const bottomLimit = disclaimerHeight - 28;
      let idx = 0;

      while (idx < lines.length) {
        const linesFit = Math.max(1, Math.floor((bottomLimit - yCursor) / lineHeightMm));
        const chunk = lines.slice(idx, idx + linesFit);
        pdf.text(chunk, marginX, yCursor, { maxWidth });
        idx += linesFit;

        if (idx < lines.length) {
          drawFooter(pdf, dataAsOfText, marginX);
          pdf.addPage("a4", "portrait");

          if (logoImg) {
            pdf.addImage(
              logoImg,
              "PNG",
              headerLogoX,
              headerLogoY,
              headerLogoWidth,
              headerLogoHeight,
              undefined,
              "FAST"
            );
          }

          const headerLineRepeatY = headerLogoY + headerLogoHeight + 2;
          pdf.setDrawColor(0, 32, 96);
          pdf.setLineWidth(1);
          pdf.line(10, headerLineRepeatY, disclaimerWidth - 10, headerLineRepeatY);
          pdf.setTextColor(0, 32, 96);
          pdf.setFont("helvetica", "bold");
          pdf.setFontSize(16);
          pdf.text("Disclaimer", marginX, headerLineRepeatY + 6);
          pdf.setFont("helvetica", "normal");
          pdf.setFontSize(10.5);
          pdf.setTextColor(60);
          yCursor = headerLineRepeatY + 16;
        }
      }

      drawFooter(pdf, dataAsOfText, marginX);
      pdf.save(`${buildDealBotPdfFileName(basicDealDetails) || "deal-bot-transcript"}.pdf`);
    } catch (error) {
      console.error("Deal bot PDF export failed", error);
      setExportError("Unable to export PDF right now. Please try again.");
    } finally {
      setExportLoading(false);
    }
  };

  const shouldShowRecentCards =
    showRecentQuestions && !prepLoading && recentResponses.length > 0;

  return (
    <>
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
                flexWrap: "wrap",
                justifyContent: { xs: "flex-start", sm: "flex-end" },
              }}
            >
              <Button
                className="pdf-hidden"
                disableElevation
                onClick={handleExportPdf}
                disabled={!apiData || prepLoading || queryLoading || exportLoading}
                startIcon={
                  exportLoading ? (
                    <CircularProgress size={16} color="inherit" />
                  ) : (
                    <PictureAsPdfRoundedIcon />
                  )
                }
                sx={(theme) => ({
                  minWidth: 156,
                  px: 2.1,
                  py: 0.8,
                  borderRadius: 999,
                  textTransform: "none",
                  fontSize: 13,
                  fontWeight: 800,
                  letterSpacing: 0.2,
                  color: theme.palette.common.white,
                  border: `1px solid ${alpha(theme.palette.primary.dark, 0.22)}`,
                  background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 58%, ${theme.palette.primary.light} 100%)`,
                  boxShadow: `0 14px 28px ${alpha(theme.palette.primary.main, 0.24)}`,
                  position: "relative",
                  overflow: "hidden",
                  transition:
                    "transform 180ms ease, box-shadow 180ms ease, filter 180ms ease, border-color 180ms ease",
                  "&::after": {
                    content: '""',
                    position: "absolute",
                    inset: 0,
                    borderRadius: 999,
                    background:
                      "linear-gradient(110deg, rgba(255,255,255,0) 24%, rgba(255,255,255,0.2) 50%, rgba(255,255,255,0) 76%)",
                    transform: "translateX(-150%)",
                    transition: "transform 420ms ease",
                  },
                  "&:hover": {
                    borderColor: alpha(theme.palette.primary.dark, 0.34),
                    boxShadow: `0 18px 34px ${alpha(theme.palette.primary.main, 0.28)}`,
                    transform: "translateY(-1px)",
                    filter: "saturate(1.08) brightness(1.03)",
                  },
                  "&:hover::after": {
                    transform: "translateX(155%)",
                  },
                  "&.Mui-disabled": {
                    color: alpha(theme.palette.common.white, 0.78),
                    borderColor: alpha(theme.palette.primary.main, 0.12),
                    background: `linear-gradient(135deg, ${alpha(theme.palette.primary.dark, 0.58)} 0%, ${alpha(
                      theme.palette.primary.main,
                      0.52
                    )} 100%)`,
                    boxShadow: "none",
                  },
                })}
              >
                {exportLoading ? "Exporting..." : "Export to PDF"}
              </Button>

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

          {exportError && (
            <Typography variant="body2" color="error">
              {exportError}
            </Typography>
          )}

          {blocks.length > 0 && <GENAIRenderer blocks={blocks} renderAll disableMotion />}
        </Stack>
      </Paper>

      <Dialog
        open={exportLoading}
        PaperProps={{
          sx: {
            borderRadius: 3,
            px: 4,
            py: 3,
            minWidth: 320,
          },
        }}
      >
        <DialogContent>
          <Stack spacing={3} alignItems="center">
            <CircularProgress size={60} thickness={4} sx={{ color: "#002060" }} />
            <Stack spacing={1} alignItems="center">
              <Typography variant="h6" sx={{ fontWeight: 700, color: "#002060" }}>
                Downloading the Monashee PDF
              </Typography>
              <Typography variant="body2" sx={{ color: "#6b7280", textAlign: "center" }}>
                Please wait while we generate the Deal Bot transcript.
              </Typography>
            </Stack>
          </Stack>
        </DialogContent>
      </Dialog>

      <Dialog
        open={noQuestionDialogOpen}
        onClose={() => setNoQuestionDialogOpen(false)}
        PaperProps={{
          sx: {
            borderRadius: 3,
            width: 420,
            maxWidth: "calc(100% - 32px)",
          },
        }}
      >
        <DialogContent sx={{ px: 3, pt: 3, pb: 1.5 }}>
          <Stack spacing={1.25}>
            <Typography sx={{ fontSize: 18, fontWeight: 800, color: "#002060" }}>
              No transcript available yet
            </Typography>
            <Typography sx={{ fontSize: 14, lineHeight: 1.7, color: "text.secondary" }}>
              No question is available for export yet. Ask a question and wait for the Deal Bot
              response before exporting the transcript to PDF.
            </Typography>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button
            variant="contained"
            onClick={() => setNoQuestionDialogOpen(false)}
            sx={{
              textTransform: "none",
              borderRadius: 999,
              px: 2.25,
              backgroundColor: "#002060",
            }}
          >
            Okay
          </Button>
        </DialogActions>
      </Dialog>

      <DealBotPdfContent
        ref={pdfContainerRef}
        basicDealDetails={basicDealDetails}
        question={lastAskedQuestion}
        blocks={blocks}
        exportedAt={pdfExportedAt}
      />
    </>
  );
};

export default DealBot;